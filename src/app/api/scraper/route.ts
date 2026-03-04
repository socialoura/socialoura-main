import { NextResponse } from 'next/server';

// Utility function to fetch and encode image to Base64
async function fetchAndEncodeImage(url: string): Promise<string> {
  try {
    console.log('[fetchAndEncodeImage] Fetching:', url.substring(0, 100) + '...');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error('[fetchAndEncodeImage] Failed to fetch:', response.status);
      throw new Error(`Failed to fetch image: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const base64 = buffer.toString('base64');
    const dataUri = `data:${contentType};base64,${base64}`;
    
    console.log('[fetchAndEncodeImage] Success - encoded to Base64 (length:', base64.length, ')');
    return dataUri;
  } catch (error) {
    console.error('[fetchAndEncodeImage] Error:', error);
    // Return a placeholder on error
    return `https://ui-avatars.com/api/?name=User&background=random&size=200`;
  }
}

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

    try {
      console.log('[scraper] Step 4: Calling Apify REST API (run-sync)');
      const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apiToken}`;
      console.log('[scraper] Apify URL:', apifyUrl.replace(apiToken, '[REDACTED]'));
      console.log('[scraper] Request body:', { usernames: [cleanUsername] });
      
      const apifyResponse = await fetch(apifyUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernames: [cleanUsername],
        }),
      });

      console.log('[scraper] Apify response status:', apifyResponse.status);
      console.log('[scraper] Apify response statusText:', apifyResponse.statusText);

      if (!apifyResponse.ok) {
        const errorText = await apifyResponse.text();
        console.error('[scraper] Apify API error response:', errorText);
        throw new Error(`Apify API returned ${apifyResponse.status}: ${errorText}`);
      }

      const data = await apifyResponse.json();
      console.log('[scraper] Step 5: Apify response received');
      console.log('[scraper] Response is array:', Array.isArray(data));
      console.log('[scraper] Response length:', Array.isArray(data) ? data.length : 'N/A');
      console.log('Données Apify brutes:', data);

      if (!Array.isArray(data) || data.length === 0) {
        console.log('[scraper] ERROR: No items found in response');
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      }

      const profile = data[0] as Record<string, unknown>;
      console.log('[scraper] Step 6: Processing profile data');
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
      
      console.log('[scraper] Step 7: Extracted posts count:', latestPosts.length);

      const avatarUrl = (profile.profilePicUrlHD as string) || 
                       (profile.profilePicUrl as string) || 
                       '';

      console.log('[scraper] Step 8: Encoding images to Base64...');
      
      // Encode avatar and all post images to Base64 in parallel
      const [avatarBase64, ...postsBase64] = await Promise.all([
        fetchAndEncodeImage(avatarUrl),
        ...latestPosts.map(post => fetchAndEncodeImage(post.imageUrl))
      ]);

      console.log('[scraper] Step 9: All images encoded successfully');

      // Update posts with Base64 encoded images
      const postsWithBase64 = latestPosts.map((post, index) => ({
        ...post,
        imageUrl: postsBase64[index],
      }));

      const response = {
        username: (profile.username as string) || cleanUsername,
        fullName: (profile.fullName as string) || cleanUsername,
        avatarUrl: avatarBase64,
        followersCount: (profile.followersCount as number) || 0,
        posts: postsWithBase64,
      };
      
      console.log('[scraper] Step 10: Returning response with Base64 images');
      console.log('[scraper] Response summary:');
      console.log('[scraper] - username:', response.username);
      console.log('[scraper] - fullName:', response.fullName);
      console.log('[scraper] - avatarUrl:', response.avatarUrl.substring(0, 50) + '...');
      console.log('[scraper] - followersCount:', response.followersCount);
      console.log('[scraper] - posts count:', response.posts.length);
      
      return NextResponse.json(response);
    } catch (apifyError: unknown) {
      console.error('Erreur Apify:', apifyError);
      console.error('[scraper] ❌ APIFY ERROR CAUGHT:');
      console.error('[scraper] Error type:', apifyError instanceof Error ? apifyError.constructor.name : typeof apifyError);
      console.error('[scraper] Error message:', apifyError instanceof Error ? apifyError.message : String(apifyError));
      console.error('[scraper] Error stack:', apifyError instanceof Error ? apifyError.stack : 'No stack trace');
      
      if (apifyError && typeof apifyError === 'object') {
        console.error('[scraper] Error details:', JSON.stringify(apifyError, Object.getOwnPropertyNames(apifyError), 2));
      }
      
      const errorDetails = apifyError instanceof Error 
        ? apifyError.message 
        : String(apifyError);
      
      return NextResponse.json(
        { error: 'Failed to fetch', details: errorDetails },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Erreur Apify:', error);
    console.error('[scraper] ❌ OUTER ERROR CAUGHT:');
    console.error('[scraper] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('[scraper] Error message:', error instanceof Error ? error.message : String(error));
    console.error('[scraper] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error && typeof error === 'object') {
      console.error('[scraper] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
    
    const errorDetails = error instanceof Error 
      ? error.message 
      : String(error);
    
    return NextResponse.json(
      { error: 'Failed to fetch', details: errorDetails },
      { status: 500 }
    );
  }
}
