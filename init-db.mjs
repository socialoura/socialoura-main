/**
 * Database Initialization Script
 * Run this to create all necessary tables in your IONOS MySQL database
 */

import { initDatabase } from './src/lib/db';

async function main() {
  console.log('🚀 Starting database initialization...\n');
  
  try {
    await initDatabase();
    console.log('✅ Database initialized successfully!');
    console.log('\nTables created:');
    console.log('  - orders (for storing customer purchases)');
    console.log('  - pricing (for admin pricing management)');
    console.log('  - admin_users (for admin authentication)');
    console.log('\n🎉 You can now make test purchases and view them in the admin dashboard!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to initialize database:');
    console.error(error);
    process.exit(1);
  }
}

main();
