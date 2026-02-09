import { NextRequest, NextResponse } from 'next/server';
import { getPricing, setPricing, initDatabase, getPopularPack, setPopularPack } from '@/lib/db';

// Initialize database on module load
initDatabase().catch(console.error);

// Default pricing data
const DEFAULT_PRICING = {
  instagram: [
    { followers: '100', price: '1.90' },
    { followers: '250', price: '3.90' },
    { followers: '500', price: '5.90' },
    { followers: '1000', price: '9.90' },
    { followers: '2500', price: '19.90' },
    { followers: '5000', price: '34.90' },
    { followers: '10000', price: '59.90' },
    { followers: '25000', price: '80.00' },
  ],
  tiktok: [
    { followers: '100', price: '2.90' },
    { followers: '250', price: '5.90' },
    { followers: '500', price: '9.90' },
    { followers: '1000', price: '16.90' },
    { followers: '2500', price: '34.90' },
    { followers: '5000', price: '64.90' },
    { followers: '10000', price: '99.90' },
    { followers: '25000', price: '175.00' },
  ],
  twitter: [
    { followers: '100', price: '2.50' },
    { followers: '250', price: '4.90' },
    { followers: '500', price: '7.90' },
    { followers: '1000', price: '12.90' },
    { followers: '2500', price: '24.90' },
    { followers: '5000', price: '44.90' },
    { followers: '10000', price: '79.90' },
    { followers: '25000', price: '110.00' },
  ],
};

// In-memory fallback for development without database
let memoryStore: { instagram: Array<{ followers: string; price: string }>; tiktok: Array<{ followers: string; price: string }>; twitter?: Array<{ followers: string; price: string }> } | null = null;

// Check if database is configured
const isDBConfigured = () => {
  return !!(process.env.DB_HOST || process.env.DATABASE_URL);
};

// Storage abstraction
const storage = {
  async get() {
    if (isDBConfigured()) {
      try {
        return await getPricing();
      } catch (error) {
        console.error('Database get error:', error);
        return memoryStore;
      }
    } else {
      // Use in-memory store for local development
      return memoryStore;
    }
  },
  
  async set(_key: string, value: { instagram: Array<{ followers: string; price: string }>; tiktok: Array<{ followers: string; price: string }>; twitter?: Array<{ followers: string; price: string }> }) {
    if (isDBConfigured()) {
      try {
        await setPricing(value);
      } catch (error) {
        console.error('Database set error:', error);
        memoryStore = value;
      }
    } else {
      // Use in-memory store for local development
      memoryStore = value;
    }
  }
};

// Verify admin token
function verifyToken(token: string | null): boolean {
  if (!token) return false;

  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    // Check if token is expired (24 hours)
    if (decoded.exp && decoded.exp > Date.now()) {
      return decoded.role === 'admin';
    }
    return false;
  } catch {
    return false;
  }
}

// GET pricing data
export async function GET() {
  try {
    // Try to read from storage
    const pricing = await storage.get();
    const data = pricing || DEFAULT_PRICING;
    
    // Fetch popular pack settings
    let popularPackInstagram: string | null = null;
    let popularPackTiktok: string | null = null;
    let popularPackTwitter: string | null = null;
    if (isDBConfigured()) {
      try {
        popularPackInstagram = await getPopularPack('instagram');
        popularPackTiktok = await getPopularPack('tiktok');
        popularPackTwitter = await getPopularPack('twitter');
      } catch (e) {
        console.error('Error fetching popular packs:', e);
      }
    }
    
    // Ensure twitter pricing exists in response
    const responseData = {
      instagram: data.instagram,
      tiktok: data.tiktok,
      twitter: ('twitter' in data && data.twitter) ? data.twitter : DEFAULT_PRICING.twitter,
      popularPackInstagram: popularPackInstagram || null,
      popularPackTiktok: popularPackTiktok || null,
      popularPackTwitter: popularPackTwitter || null,
    };
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return NextResponse.json(DEFAULT_PRICING);
  }
}

// Shared update logic
async function updatePricing(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '') || null;

    if (!verifyToken(token)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { instagram, tiktok, twitter, popularPackInstagram, popularPackTiktok, popularPackTwitter } = body;

    // Validate data
    if (!instagram || !tiktok || !Array.isArray(instagram) || !Array.isArray(tiktok)) {
      return NextResponse.json(
        { error: 'Invalid pricing data format' },
        { status: 400 }
      );
    }

    // Save pricing to storage
    await storage.set('pricing-data', { instagram, tiktok, twitter: twitter || [] });

    // Save popular pack settings if provided
    if (isDBConfigured()) {
      try {
        if (popularPackInstagram !== undefined) {
          await setPopularPack('instagram', popularPackInstagram || '');
        }
        if (popularPackTiktok !== undefined) {
          await setPopularPack('tiktok', popularPackTiktok || '');
        }
        if (popularPackTwitter !== undefined) {
          await setPopularPack('twitter', popularPackTwitter || '');
        }
      } catch (e) {
        console.error('Error saving popular packs:', e);
      }
    }

    return NextResponse.json({ success: true, message: 'Pricing updated successfully' });
  } catch (error) {
    console.error('Error updating pricing:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating pricing' },
      { status: 500 }
    );
  }
}

// PUT update pricing data
export async function PUT(request: NextRequest) {
  return updatePricing(request);
}

// POST update pricing data (alias for PUT to handle method conversion)
export async function POST(request: NextRequest) {
  return updatePricing(request);
}
