import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    // Create pricing table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS pricing (
        id VARCHAR(50) PRIMARY KEY,
        data JSONB NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create admin table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create orders table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        platform VARCHAR(50) NOT NULL,
        followers INTEGER NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_status VARCHAR(50) DEFAULT 'completed',
        payment_intent_id VARCHAR(255),
        payment_id VARCHAR(255),
        status VARCHAR(50) DEFAULT 'completed',
        order_status VARCHAR(50) DEFAULT 'pending',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Add order_status and notes columns if they don't exist (for existing tables)
    try {
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) DEFAULT 'pending'`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT ''`;
    } catch (e) {
      // Columns might already exist
      console.log('Columns may already exist:', e);
    }
    
    // Create settings table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    // Create indexes if they don't exist
    await sql`CREATE INDEX IF NOT EXISTS idx_username ON orders(username)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_email ON orders(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payment_status ON orders(payment_status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_created_at ON orders(created_at)`;
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

export async function getPricing() {
  try {
    const result = await sql`
      SELECT data FROM pricing WHERE id = 'pricing-data'
    `;
    
    if (result.rows.length > 0) {
      return result.rows[0].data as { instagram: Array<{ followers: string; price: string }>; tiktok: Array<{ followers: string; price: string }> };
    }
    return null;
  } catch (error) {
    console.error('Error fetching pricing:', error);
    return null;
  }
}

export async function setPricing(data: { instagram: Array<{ followers: string; price: string }>; tiktok: Array<{ followers: string; price: string }> }) {
  try {
    await sql`
      INSERT INTO pricing (id, data) 
      VALUES ('pricing-data', ${JSON.stringify(data)}::jsonb)
      ON CONFLICT (id) 
      DO UPDATE SET data = ${JSON.stringify(data)}::jsonb, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error setting pricing:', error);
    throw error;
  }
}

export async function getAdminByUsername(username: string) {
  try {
    const result = await sql`
      SELECT * FROM admin_users WHERE username = ${username}
    `;
    
    if (result.rows.length > 0) {
      return result.rows[0] as { id: number; username: string; password: string };
    }
    return null;
  } catch (error) {
    console.error('Error fetching admin:', error);
    return null;
  }
}

export async function updateAdminPassword(username: string, newPassword: string) {
  try {
    await sql`
      INSERT INTO admin_users (username, password) 
      VALUES (${username}, ${newPassword})
      ON CONFLICT (username) 
      DO UPDATE SET password = ${newPassword}, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error updating admin password:', error);
    throw error;
  }
}

export async function createOrder(data: {
  email: string;
  platform: string;
  followers: number;
  price: number;
  payment_intent_id?: string;
}) {
  try {
    const result = await sql`
      INSERT INTO orders (email, platform, followers, price, payment_intent_id, amount, username) 
      VALUES (${data.email}, ${data.platform}, ${data.followers}, ${data.price}, ${data.payment_intent_id || null}, ${data.price}, ${data.email})
      RETURNING id
    `;
    return result.rows[0];
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

export async function updateOrderPaymentStatus(payment_intent_id: string, status: string) {
  try {
    await sql`
      UPDATE orders SET payment_status = ${status}, updated_at = CURRENT_TIMESTAMP
      WHERE payment_intent_id = ${payment_intent_id}
    `;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function getAllOrders() {
  try {
    const result = await sql`
      SELECT * FROM orders ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function getStripeSettings() {
  try {
    const secretResult = await sql`
      SELECT value FROM settings WHERE key = 'stripe_secret_key'
    `;
    const publishableResult = await sql`
      SELECT value FROM settings WHERE key = 'stripe_publishable_key'
    `;
    
    return {
      secretKey: secretResult.rows.length > 0 ? secretResult.rows[0].value : null,
      publishableKey: publishableResult.rows.length > 0 ? publishableResult.rows[0].value : null,
    };
  } catch (error) {
    console.error('Error fetching Stripe settings:', error);
    return { secretKey: null, publishableKey: null };
  }
}

export async function updateStripeSettings(secretKey: string, publishableKey: string) {
  try {
    // Update or insert secret key
    await sql`
      INSERT INTO settings (key, value) 
      VALUES ('stripe_secret_key', ${secretKey})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${secretKey}, updated_at = CURRENT_TIMESTAMP
    `;
    
    // Update or insert publishable key
    await sql`
      INSERT INTO settings (key, value) 
      VALUES ('stripe_publishable_key', ${publishableKey})
      ON CONFLICT (key) 
      DO UPDATE SET value = ${publishableKey}, updated_at = CURRENT_TIMESTAMP
    `;
  } catch (error) {
    console.error('Error updating Stripe settings:', error);
    throw error;
  }
}

export async function updateOrderStatus(orderId: number, orderStatus: string) {
  try {
    await sql`
      UPDATE orders SET order_status = ${orderStatus}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

export async function updateOrderNotes(orderId: number, notes: string) {
  try {
    await sql`
      UPDATE orders SET notes = ${notes}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${orderId}
    `;
  } catch (error) {
    console.error('Error updating order notes:', error);
    throw error;
  }
}

export async function getOrderById(orderId: number) {
  try {
    const result = await sql`
      SELECT * FROM orders WHERE id = ${orderId}
    `;
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}
