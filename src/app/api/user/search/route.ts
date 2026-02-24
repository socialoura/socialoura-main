import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const platform = searchParams.get('platform');

  if (!username || !platform) {
    return NextResponse.json(
      { error: 'Username and platform are required' },
      { status: 400 }
    );
  }

  try {
    const mockProfile = {
      username: username,
      fullName: username.charAt(0).toUpperCase() + username.slice(1),
      profilePicture: generateAvatarUrl(username),
      isVerified: Math.random() > 0.7,
      followerCount: formatFollowerCount(Math.floor(Math.random() * 100000) + 500),
    };

    return NextResponse.json(mockProfile);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

function generateAvatarUrl(username: string): string {
  const colors = ['8B5CF6', 'EC4899', 'F97316', '10B981', '3B82F6'];
  const colorIndex = username.charCodeAt(0) % colors.length;
  const firstLetter = username.charAt(0).toUpperCase();
  
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23${colors[colorIndex]}"/><text x="50" y="50" font-size="45" text-anchor="middle" dy=".35em" fill="white" font-family="system-ui, -apple-system">${firstLetter}</text></svg>`
  )}`;
}

function formatFollowerCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}
