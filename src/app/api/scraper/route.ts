import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

const MOCK_POSTS = [
  { id: '1', shortCode: 'abc1', imageUrl: 'https://picsum.photos/seed/ig1/400/400', caption: 'Post 1', likesCount: 234, commentsCount: 12 },
  { id: '2', shortCode: 'abc2', imageUrl: 'https://picsum.photos/seed/ig2/400/400', caption: 'Post 2', likesCount: 567, commentsCount: 34 },
  { id: '3', shortCode: 'abc3', imageUrl: 'https://picsum.photos/seed/ig3/400/400', caption: 'Post 3', likesCount: 890, commentsCount: 56 },
  { id: '4', shortCode: 'abc4', imageUrl: 'https://picsum.photos/seed/ig4/400/400', caption: 'Post 4', likesCount: 123, commentsCount: 8 },
  { id: '5', shortCode: 'abc5', imageUrl: 'https://picsum.photos/seed/ig5/400/400', caption: 'Post 5', likesCount: 456, commentsCount: 23 },
  { id: '6', shortCode: 'abc6', imageUrl: 'https://picsum.photos/seed/ig6/400/400', caption: 'Post 6', likesCount: 789, commentsCount: 45 },
  { id: '7', shortCode: 'abc7', imageUrl: 'https://picsum.photos/seed/ig7/400/400', caption: 'Post 7', likesCount: 321, commentsCount: 19 },
  { id: '8', shortCode: 'abc8', imageUrl: 'https://picsum.photos/seed/ig8/400/400', caption: 'Post 8', likesCount: 654, commentsCount: 37 },
  { id: '9', shortCode: 'abc9', imageUrl: 'https://picsum.photos/seed/ig9/400/400', caption: 'Post 9', likesCount: 987, commentsCount: 61 },
  { id: '10', shortCode: 'abc10', imageUrl: 'https://picsum.photos/seed/ig10/400/400', caption: 'Post 10', likesCount: 210, commentsCount: 15 },
  { id: '11', shortCode: 'abc11', imageUrl: 'https://picsum.photos/seed/ig11/400/400', caption: 'Post 11', likesCount: 543, commentsCount: 29 },
  { id: '12', shortCode: 'abc12', imageUrl: 'https://picsum.photos/seed/ig12/400/400', caption: 'Post 12', likesCount: 876, commentsCount: 52 },
];

export async function GET(request: Request) {
  console.log('[scraper] ========== NEW REQUEST ==========');
  
  try {
    console.log('[scraper] Step 1: Parsing URL parameters');
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    
    console.log('[scraper] URL:', request.url);
    console.log('[scraper] Username parameter:', username);

    if (!username || typeof username !== 'string') {
      console.log('[scraper] ERROR: Invalid username:', username);
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const cleanUsername = username.replace('@', '').trim();
    console.log('[scraper] Step 2: Cleaned username:', cleanUsername);
    console.log('Démarrage du scraping pour:', cleanUsername);

    const apiToken = process.env.APIFY_API_TOKEN;
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    console.log('[scraper] Step 3: Environment check');
    console.log('[scraper] - NODE_ENV:', process.env.NODE_ENV);
    console.log('[scraper] - isDevelopment:', isDevelopment);
    console.log('[scraper] - Has APIFY_API_TOKEN:', !!apiToken);
    console.log('[scraper] - APIFY_API_TOKEN length:', apiToken?.length || 0);

    // Always use mock data in development, or if no API token
    if (isDevelopment || !apiToken) {
      console.log('[scraper] Step 4: Using MOCK DATA (dev mode or no token)');
      const mockResponse = {
        username: cleanUsername,
        fullName: cleanUsername,
        avatarUrl: `https://ui-avatars.com/api/?name=${cleanUsername}&background=random&size=200`,
        followersCount: 12500,
        posts: MOCK_POSTS,
      };
      console.log('[scraper] Returning mock response:', JSON.stringify(mockResponse, null, 2));
      return NextResponse.json(mockResponse);
    }

    // Production: Use Apify
    console.log('[scraper] Step 4: PRODUCTION MODE - Using Apify');
    try {
      console.log('[scraper] Step 5: Creating Apify client');
      const client = new ApifyClient({ token: apiToken });
      console.log('[scraper] Apify client created successfully');

      console.log('[scraper] Step 6: Calling Apify actor with username:', cleanUsername);
      const run = await client.actor('apify/instagram-profile-scraper').call({
        usernames: [cleanUsername],
        resultsLimit: 12,
      });
      console.log('[scraper] Apify run completed. Run ID:', run.id);
      console.log('[scraper] Default dataset ID:', run.defaultDatasetId);

      console.log('[scraper] Step 7: Fetching results from dataset');
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log('[scraper] Items fetched. Count:', items?.length || 0);

      if (!items || items.length === 0) {
        console.log('[scraper] ERROR: No items found in dataset');
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      const profile = items[0] as Record<string, unknown>;
      console.log('[scraper] Step 8: Processing profile data');
      console.log('[scraper] Profile keys:', Object.keys(profile));
      console.log('[scraper] Profile username:', profile.username);
      console.log('[scraper] Profile fullName:', profile.fullName);
      console.log('[scraper] Profile followersCount:', profile.followersCount);
      console.log('[scraper] Profile latestPosts count:', (profile.latestPosts as Array<unknown>)?.length || 0);

      // Extract posts from the profile data
      const latestPosts = ((profile.latestPosts as Array<Record<string, unknown>>) || []).slice(0, 12).map((post, index) => ({
        id: (post.id as string) || String(index),
        shortCode: (post.shortCode as string) || '',
        imageUrl: (post.displayUrl as string) || (post.url as string) || '',
        caption: ((post.caption as string) || '').slice(0, 100),
        likesCount: (post.likesCount as number) || 0,
        commentsCount: (post.commentsCount as number) || 0,
      }));
      
      console.log('[scraper] Step 9: Extracted posts count:', latestPosts.length);

      const response = {
        username: (profile.username as string) || cleanUsername,
        fullName: (profile.fullName as string) || cleanUsername,
        avatarUrl: (profile.profilePicUrl as string) || (profile.profilePicUrlHD as string) || '',
        followersCount: (profile.followersCount as number) || 0,
        posts: latestPosts.length > 0 ? latestPosts : MOCK_POSTS,
      };
      
      console.log('[scraper] Step 10: Returning Apify response');
      console.log('[scraper] Response summary - username:', response.username, 'posts:', response.posts.length);
      return NextResponse.json(response);
    } catch (apifyError) {
      console.error('Erreur Apify:', apifyError);
      console.error('[scraper] ❌ APIFY ERROR CAUGHT:');
      console.error('[scraper] Error type:', apifyError instanceof Error ? apifyError.constructor.name : typeof apifyError);
      console.error('[scraper] Error message:', apifyError instanceof Error ? apifyError.message : String(apifyError));
      console.error('[scraper] Error stack:', apifyError instanceof Error ? apifyError.stack : 'No stack trace');
      console.error('[scraper] Full error object:', JSON.stringify(apifyError, null, 2));
      
      console.log('[scraper] Falling back to MOCK DATA due to Apify error');
      const fallbackResponse = {
        username: cleanUsername,
        fullName: cleanUsername,
        avatarUrl: `https://ui-avatars.com/api/?name=${cleanUsername}&background=random&size=200`,
        followersCount: 12500,
        posts: MOCK_POSTS,
      };
      return NextResponse.json(fallbackResponse);
    }
  } catch (error) {
    console.error('Erreur Apify:', error);
    console.error('[scraper] ❌ OUTER ERROR CAUGHT:');
    console.error('[scraper] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[scraper] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[scraper] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('[scraper] Full error object:', JSON.stringify(error, null, 2));
    
    return NextResponse.json(
      { error: 'Failed to fetch Instagram profile' },
      { status: 500 }
    );
  }
}
