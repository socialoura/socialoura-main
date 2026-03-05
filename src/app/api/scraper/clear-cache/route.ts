import { NextRequest, NextResponse } from 'next/server';
import { clearCache } from '../route';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();
    
    if (username) {
      clearCache(username);
      return NextResponse.json({ 
        success: true, 
        message: `Cache cleared for @${username}. Next search will fetch fresh data.`
      });
    } else {
      clearCache();
      return NextResponse.json({ 
        success: true, 
        message: 'All cache cleared. All next searches will fetch fresh data.'
      });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
