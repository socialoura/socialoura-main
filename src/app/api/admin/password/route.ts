import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsername, updateAdminPassword, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// In-memory fallback
const memoryAdmin: { username: string; password: string } = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || '',
};

// Check if database is configured
const isDBConfigured = () => {
  return !!(process.env.DB_HOST || process.env.DATABASE_URL);
};

// Verify admin token
function verifyToken(token: string | null): { username: string; role: string } | null {
  if (!token) return null;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    // Check if token is expired (24 hours)
    if (decoded.exp && decoded.exp > Date.now() && decoded.role === 'admin') {
      return decoded;
    }
    return null;
  } catch {
    return null;
  }
}

// POST - Change password
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get current admin data
    let currentAdmin;
    if (isDBConfigured()) {
      try {
        currentAdmin = await getAdminByUsername(decoded.username);
        if (!currentAdmin) {
          currentAdmin = memoryAdmin;
        }
      } catch (error) {
        console.error('Database error, using memory:', error);
        currentAdmin = memoryAdmin;
      }
    } else {
      currentAdmin = memoryAdmin;
    }

    // Verify current password
    if (currentAdmin.password !== currentPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Update password
    if (isDBConfigured()) {
      try {
        await updateAdminPassword(decoded.username, newPassword);
      } catch (error) {
        console.error('Database error, updating memory:', error);
        memoryAdmin.password = newPassword;
      }
    } else {
      memoryAdmin.password = newPassword;
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating password' },
      { status: 500 }
    );
  }
}
