import { NextRequest, NextResponse } from 'next/server';
import { getAdminByUsername, initDatabase } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Check if database is configured
const isDBConfigured = () => {
  return !!(process.env.POSTGRES_URL || process.env.DATABASE_URL);
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Get admin credentials from environment variables (fallback)
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { error: 'Admin credentials not configured' },
        { status: 500 }
      );
    }

    // Try to get admin from database first
    let isValidCredentials = false;
    
    if (isDBConfigured() && username === adminUsername) {
      try {
        const dbAdmin = await getAdminByUsername(username);
        if (dbAdmin) {
          // Check against database password
          isValidCredentials = dbAdmin.password === password;
        } else {
          // If admin doesn't exist in DB, check against env variables
          isValidCredentials = password === adminPassword;
        }
      } catch (error) {
        console.error('Database error during login, using env variables:', error);
        // Fallback to environment variables if database fails
        isValidCredentials = username === adminUsername && password === adminPassword;
      }
    } else {
      // No database configured or wrong username, check against env variables
      isValidCredentials = username === adminUsername && password === adminPassword;
    }

    // Validate credentials
    if (isValidCredentials) {
      // Generate a simple token (base64 encoded credentials with timestamp)
      const token = Buffer.from(
        JSON.stringify({ username, role: 'admin', exp: Date.now() + 24 * 60 * 60 * 1000 })
      ).toString('base64');

      return NextResponse.json({ token, success: true });
    } else {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
