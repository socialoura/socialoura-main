import { NextResponse } from 'next/server';

// ─── Types ───
interface ScraperResponse {
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
  }>;
}

// ─── In-memory cache (2-hour TTL) ───
interface CacheEntry {
  data: ScraperResponse;
  timestamp: number;
}

// const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes (disabled - cache is off)
const profileCache = new Map<string, CacheEntry>();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getCached(_username: string): ScraperResponse | null {
  // Cache disabled - always fetch fresh data
  return null;
  
  // const entry = profileCache.get(username.toLowerCase());
  // if (!entry) return null;
  // if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
  //   profileCache.delete(username.toLowerCase());
  //   return null;
  // }
  // return entry.data;
}

function setCache(username: string, data: ScraperResponse) {
  profileCache.set(username.toLowerCase(), { data, timestamp: Date.now() });
  if (profileCache.size > 200) {
    const oldest = Array.from(profileCache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);
    for (let i = 0; i < 50; i++) profileCache.delete(oldest[i][0]);
  }
}

// ─── RapidAPI fetch with timeout ───
const RAPIDAPI_HOST = 'instagram120.p.rapidapi.com';
const FETCH_TIMEOUT_MS = 6000; // 6 seconds

// Fetch profile info (avatar, followers, fullName)
async function fetchProfileInfo(username: string): Promise<Response> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/api/instagram/profile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
        body: JSON.stringify({ username: username }),
        signal: controller.signal,
      }
    );
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

// Fetch posts
async function fetchPosts(username: string): Promise<Response> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) throw new Error('RAPIDAPI_KEY not configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(
      `https://${RAPIDAPI_HOST}/api/instagram/posts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-host': RAPIDAPI_HOST,
          'x-rapidapi-key': apiKey,
        },
        body: JSON.stringify({ username, maxId: '' }),
        signal: controller.signal,
      }
    );
    return res;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Map combined responses → ScraperResponse ───
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCombinedData(profileData: any, postsData: any, cleanUsername: string): ScraperResponse {
  // Profile info from POST /api/instagram/profile — data is under .result
  const userData = profileData?.result ?? profileData?.data ?? profileData;
  
  const username = userData?.username ?? cleanUsername;
  const fullName = 
    userData?.full_name ?? 
    userData?.fullname ?? 
    userData?.name ??
    cleanUsername;
  
  const avatarUrl =
    userData?.profile_pic_url_hd ??
    userData?.profile_pic_url ??
    userData?.hd_profile_pic_url_info?.url ??
    `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername)}&background=random&size=200`;
  
  const followersCount = 
    userData?.follower_count ?? 
    userData?.edge_followed_by?.count ?? 
    0;

  // Posts from POST /api/instagram/posts
  // Structure: postsData.result.edges[].node
  const edges = postsData?.result?.edges ?? postsData?.data?.result?.edges ?? [];
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const posts = edges.slice(0, 12).map((edge: any, index: number) => {
    const node = edge?.node ?? edge;
    
    // Image URL from image_versions2.candidates
    const candidates = node?.image_versions2?.candidates ?? [];
    const imageUrl = candidates[0]?.url ?? node?.display_url ?? '';

    // ShortCode
    const shortCode = node?.code ?? node?.shortcode ?? '';

    // Caption/Text
    const caption = (node?.caption?.text ?? node?.text ?? '').slice(0, 100);

    // Engagement metrics
    const likesCount = node?.like_count ?? 0;
    const commentsCount = node?.comment_count ?? 0;

    return {
      id: String(node?.id ?? node?.pk ?? index),
      shortCode,
      imageUrl,
      caption,
      likesCount: Number(likesCount) || 0,
      commentsCount: Number(commentsCount) || 0,
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

    const cleanUsername = username.replace('@', '').trim();

    // ── Check cache ──
    const cached = getCached(cleanUsername);
    if (cached) {
      console.log('[scraper] Cache HIT for:', cleanUsername);
      return NextResponse.json(cached);
    }
    console.log('[scraper] Cache MISS for:', cleanUsername);

    // ── Fetch from RapidAPI (two calls) ──
    try {
      // 1. Fetch profile info (GET)
      const profileRes = await fetchProfileInfo(cleanUsername);
      if (!profileRes.ok) {
        const errText = await profileRes.text().catch(() => '');
        console.error(`[scraper] Profile API ${profileRes.status}:`, errText.slice(0, 300));
        return NextResponse.json(
          { error: 'Profile not found', details: `HTTP ${profileRes.status}` },
          { status: profileRes.status === 404 ? 404 : 502 }
        );
      }
      const profileData = await profileRes.json();
      console.log("RÉPONSE PROFILE API:", JSON.stringify(profileData).substring(0, 500));

      // 2. Fetch posts (POST)
      const postsRes = await fetchPosts(cleanUsername);
      if (!postsRes.ok) {
        const errText = await postsRes.text().catch(() => '');
        console.error(`[scraper] Posts API ${postsRes.status}:`, errText.slice(0, 300));
        return NextResponse.json(
          { error: 'Posts not found', details: `HTTP ${postsRes.status}` },
          { status: postsRes.status === 404 ? 404 : 502 }
        );
      }
      const postsData = await postsRes.json();
      console.log("RÉPONSE POSTS API:", JSON.stringify(postsData).substring(0, 500));

      // 3. Combine both responses
      const response = mapCombinedData(profileData, postsData, cleanUsername);

      // ── Store in cache ──
      setCache(cleanUsername, response);
      console.log('[scraper] Cached result for:', cleanUsername);

      return NextResponse.json(response);
    } catch (fetchError: unknown) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        console.error('[scraper] RapidAPI timeout (6s) for:', cleanUsername);
        return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
      }
      const msg = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.error('[scraper] RapidAPI error:', msg);
      return NextResponse.json({ error: 'Failed to fetch', details: msg }, { status: 500 });
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[scraper] Outer error:', msg);
    return NextResponse.json({ error: 'Failed to fetch', details: msg }, { status: 500 });
  }
}
