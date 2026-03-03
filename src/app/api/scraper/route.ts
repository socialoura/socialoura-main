import { NextResponse } from 'next/server';
import { ApifyClient } from 'apify-client';

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
    
    console.log('[scraper] Step 3: Environment check');
    console.log('[scraper] - NODE_ENV:', process.env.NODE_ENV);
    console.log('[scraper] - Has APIFY_API_TOKEN:', !!apiToken);
    console.log('[scraper] - APIFY_API_TOKEN length:', apiToken?.length || 0);

    if (!apiToken) {
      console.error('[scraper] ERROR: APIFY_API_TOKEN not configured');
      return NextResponse.json(
        { error: 'API configuration error - APIFY_API_TOKEN missing' },
        { status: 500 }
      );
    }

    // Use Apify
    console.log('[scraper] Step 4: Creating Apify client');
    const client = new ApifyClient({ token: apiToken });
    console.log('[scraper] Apify client created successfully');

    try {
      console.log('[scraper] Step 5: Calling Apify actor apify/instagram-profile-scraper');
      console.log('[scraper] Actor input:', { usernames: [cleanUsername], resultsLimit: 12 });
      
      const run = await client.actor('apify/instagram-profile-scraper').call({
        usernames: [cleanUsername],
        resultsLimit: 12,
      });
      
      console.log('[scraper] Apify run completed successfully');
      console.log('[scraper] Run ID:', run.id);
      console.log('[scraper] Run status:', run.status);
      console.log('[scraper] Default dataset ID:', run.defaultDatasetId);

      console.log('[scraper] Step 6: Fetching results from dataset');
      const { items } = await client.dataset(run.defaultDatasetId).listItems();
      console.log('[scraper] Items fetched. Count:', items?.length || 0);

      if (!items || items.length === 0) {
        console.log('[scraper] ERROR: No items found in dataset');
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      const profile = items[0] as Record<string, unknown>;
      console.log('[scraper] Step 7: Processing profile data');
      console.log('[scraper] Profile keys:', Object.keys(profile));
      console.log('[scraper] Profile username:', profile.username);
      console.log('[scraper] Profile fullName:', profile.fullName);
      console.log('[scraper] Profile followersCount:', profile.followersCount);
      console.log('[scraper] Profile profilePicUrl:', profile.profilePicUrl);
      console.log('[scraper] Profile profilePicUrlHD:', profile.profilePicUrlHD);
      
      const latestPostsRaw = profile.latestPosts as Array<Record<string, unknown>> | undefined;
      console.log('[scraper] Profile latestPosts count:', latestPostsRaw?.length || 0);

      if (latestPostsRaw && latestPostsRaw.length > 0) {
        console.log('[scraper] First post keys:', Object.keys(latestPostsRaw[0]));
        console.log('[scraper] First post sample:', {
          id: latestPostsRaw[0].id,
          shortCode: latestPostsRaw[0].shortCode,
          displayUrl: latestPostsRaw[0].displayUrl,
          videoUrl: latestPostsRaw[0].videoUrl,
          type: latestPostsRaw[0].type,
        });
      }

      // Extract posts from the profile data
      const latestPosts = (latestPostsRaw || []).slice(0, 12).map((post, index) => {
        const imageUrl = (post.displayUrl as string) || 
                        (post.videoUrl as string) || 
                        (post.url as string) || 
                        '';
        
        return {
          id: (post.id as string) || String(index),
          shortCode: (post.shortCode as string) || '',
          imageUrl,
          caption: ((post.caption as string) || '').slice(0, 100),
          likesCount: (post.likesCount as number) || 0,
          commentsCount: (post.commentsCount as number) || 0,
        };
      });
      
      console.log('[scraper] Step 8: Extracted posts count:', latestPosts.length);

      const avatarUrl = (profile.profilePicUrlHD as string) || 
                       (profile.profilePicUrl as string) || 
                       '';

      const response = {
        username: (profile.username as string) || cleanUsername,
        fullName: (profile.fullName as string) || cleanUsername,
        avatarUrl,
        followersCount: (profile.followersCount as number) || 0,
        posts: latestPosts,
      };
      
      console.log('[scraper] Step 9: Returning Apify response');
      console.log('[scraper] Response summary:');
      console.log('[scraper] - username:', response.username);
      console.log('[scraper] - fullName:', response.fullName);
      console.log('[scraper] - avatarUrl:', response.avatarUrl ? 'present' : 'missing');
      console.log('[scraper] - followersCount:', response.followersCount);
      console.log('[scraper] - posts count:', response.posts.length);
      
      return NextResponse.json(response);
    } catch (apifyError) {
      console.error('Erreur Apify:', apifyError);
      console.error('[scraper] ❌ APIFY ERROR CAUGHT:');
      console.error('[scraper] Error type:', apifyError instanceof Error ? apifyError.constructor.name : typeof apifyError);
      console.error('[scraper] Error message:', apifyError instanceof Error ? apifyError.message : String(apifyError));
      console.error('[scraper] Error stack:', apifyError instanceof Error ? apifyError.stack : 'No stack trace');
      
      if (apifyError && typeof apifyError === 'object') {
        console.error('[scraper] Error details:', JSON.stringify(apifyError, Object.getOwnPropertyNames(apifyError), 2));
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch Instagram profile from Apify' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur Apify:', error);
    console.error('[scraper] ❌ OUTER ERROR CAUGHT:');
    console.error('[scraper] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[scraper] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[scraper] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object') {
      console.error('[scraper] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch Instagram profile' },
      { status: 500 }
    );
  }
}
