import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    return NextResponse.json({ 
      success: true, 
      message: username 
        ? `Cache is disabled - all searches fetch fresh data. Username: @${username}` 
        : 'Cache is disabled - all searches fetch fresh data.',
      note: 'Cache has been permanently disabled in the scraper API.'
    });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
