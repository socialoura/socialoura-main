import { NextResponse } from 'next/server';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';

// ─── Types ───
interface TiktokScraperResponse {
  username: string;
  fullName: string;
  avatarUrl: string;
  followersCount: number;
  posts: Array<{
    id: string;
    shortCode: string;
    imageUrl: string;
    caption: string;
    likesCount: number;
    commentsCount: number;
    isVideo: boolean;
  }>;
}

// ─── In-memory cache (ENABLED for performance) ───
interface CacheEntry {
  data: TiktokScraperResponse;
  timestamp: number;
}

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes for faster refresh
const profileCache = new Map<string, CacheEntry>();

function getCached(username: string): TiktokScraperResponse | null {
  const entry = profileCache.get(username.toLowerCase());
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    profileCache.delete(username.toLowerCase());
    return null;
  }
  return entry.data;
}

function setCache(username: string, data: TiktokScraperResponse) {
  profileCache.set(username.toLowerCase(), { data, timestamp: Date.now() });
  if (profileCache.size > 100) { // Reduced cache size for memory efficiency
    const oldest = Array.from(profileCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (let i = 0; i < 25; i++) profileCache.delete(oldest[i][0]);
  }
}

// ─── RapidAPI fetch ───
const RAPIDAPI_HOST = 'tiktok-scraper2.p.rapidapi.com';
const FETCH_TIMEOUT_MS = 6000; // Reduced from 10s to 6s for faster response

async function fetchTiktokProfile(username: string): Promise<Response> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/user/info?user_name=${encodeURIComponent(username)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTiktokPosts(secUid: string, userId: string): Promise<Response> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/user/videos?sec_uid=${encodeURIComponent(secUid)}&user_id=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: {
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
        signal: controller.signal,
        cache: 'no-store',
      }
    );
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Map TikTok API response → TiktokScraperResponse ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapTiktokData(profileData: any, postsData: any, cleanUsername: string): TiktokScraperResponse {
  // Robust parsing with fallback for old API structure
  const userNode = profileData?.user ?? profileData?.userInfo?.user;
  const statsNode = profileData?.stats ?? profileData?.userInfo?.stats;

  if (!userNode) {
    throw new Error("Impossible de trouver les données de l'utilisateur");
  }

  const username = userNode?.uniqueId ?? cleanUsername;
  const fullName = userNode?.nickname ?? cleanUsername;

  // Avatar: prioritize avatarMedium as specified
  const avatarUrl =
    userNode?.avatarMedium ??
    userNode?.avatarLarger ??
    userNode?.avatarThumb ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&background=random&size=200`;

  const followersCount = statsNode?.followerCount ?? 0;

  // Posts/videos from tiktok-scraper2 structure
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = (Array.isArray(postsData?.posts) ? postsData.posts : []).slice(0, 12).map((item: any) => {
    // Extract video ID from link using .pop() (e.g., "https://www.tiktok.com/@tiktok/video/7367114895717829934")
    const link = item?.link ?? '';
    const id = link.split('/').pop() ?? String(Math.random());

    const imageUrl = item?.image ?? '';
    const caption = (item?.desc ?? '').slice(0, 100);
    const likesCount = item?.digg ?? 0;
    const commentsCount = item?.comment ?? 0;
    const shortCode = link;

    return {
      id,
      shortCode,
      imageUrl,
      caption,
      likesCount: Number(likesCount) || 0,
      commentsCount: Number(commentsCount) || 0,
      isVideo: true,
    };
  });

  return { username, fullName, avatarUrl, followersCount, posts };
}

// ─── Main handler ───
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username || typeof username !== 'string') {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.replace('@', '').trim().toLowerCase();

    // 1. Check cache first for instant response
    const cached = getCached(cleanUsername);
    if (cached) {
      console.log('[scraper-tiktok] Cache hit for:', cleanUsername);
      return NextResponse.json(cached);
    }

    console.log('[scraper-tiktok] Fetching fresh data for:', cleanUsername);

    try {
      // 2. Fetch profile (required)
      const profileRes = await fetchTiktokProfile(cleanUsername);
      if (!profileRes.ok) {
        const errText = await profileRes.text().catch(() => '');
        console.error(`[scraper-tiktok] Profile API ${profileRes.status}:`, errText.slice(0, 300));
        return NextResponse.json(
          { error: 'Profile not found', details: `HTTP ${profileRes.status}` },
          { status: profileRes.status === 404 ? 404 : 502 }
        );
      }
      const profileData = await profileRes.json();
      console.log('[scraper-tiktok] Profile response:', JSON.stringify(profileData).substring(0, 500));

      // Extract secUid and userId with robust fallback for old API structure
      const userNode = profileData?.user ?? profileData?.userInfo?.user;
      
      if (!userNode) {
        throw new Error("Impossible de trouver les données de l'utilisateur dans la réponse");
      }

      const userId = userNode?.id ?? '';
      const secUid = userNode?.secUid ?? '';

      // 3. Fetch posts (best effort - don't fail if posts unavailable)
      let postsData = {};
      if (secUid && userId) {
        try {
          const postsRes = await fetchTiktokPosts(secUid, userId);
          if (postsRes.ok) {
            postsData = await postsRes.json();
            console.log('[scraper-tiktok] Posts response:', JSON.stringify(postsData).substring(0, 500));
          } else {
            console.warn(`[scraper-tiktok] Posts API ${postsRes.status}, continuing without posts`);
          }
        } catch (postsErr) {
          console.warn('[scraper-tiktok] Posts fetch failed, continuing without posts:', postsErr);
        }
      } else {
        console.warn('[scraper-tiktok] Missing secUid or userId, skipping posts fetch');
      }

      // 4. Combine and cache
      const response = mapTiktokData(profileData, postsData, cleanUsername);
      setCache(cleanUsername, response);

      console.log('[scraper-tiktok] Returning fresh data for:', cleanUsername);

      return NextResponse.json(response);
    } catch (fetchError: unknown) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        console.error('[scraper-tiktok] Timeout for:', cleanUsername);
        return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
      }
      const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error('[scraper-tiktok] Fetch error:', msg);
      return NextResponse.json({ error: 'Failed to fetch', details: msg }, { status: 500 });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[scraper-tiktok] Outer error:', msg);
    return NextResponse.json({ error: 'Failed to fetch', details: msg }, { status: 500 });
  }
}
