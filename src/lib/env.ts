// Map DATABASE_URL to POSTGRES_URL for @vercel/postgres compatibility
if (process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  process.env.POSTGRES_URL = process.env.DATABASE_URL;
}

export {};
