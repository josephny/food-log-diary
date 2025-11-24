import pg from 'pg';

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// We are Postgres-only now: DATABASE_URL is required
if (!DATABASE_URL) {
  throw new Error(
    'DATABASE_URL environment variable is required (PostgreSQL only setup).'
  );
}

// In many hosted environments (Render, etc.) you need SSL but with relaxed certs.
// For local Postgres (localhost), you usually want ssl: false.
// This tries to do the reasonable thing by default.
const useSSL =
  !DATABASE_URL.includes('localhost') &&
  !DATABASE_URL.includes('127.0.0.1') &&
  NODE_ENV === 'production';

export const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

/**
 * Run arbitrary SQL (optionally with parameters).
 * Good for schema / migration / maintenance calls.
 */
export async function exec(
  text: string,
  params: any[] = []
): Promise<pg.QueryResult> {
  return pool.query(text, params);
}

/**
 * Prepared query wrapper that mimics the better-sqlite3 style used in your routes:
 *   const stmt = prepare('SELECT * FROM foo WHERE id = $1');
 *   const rows = await stmt.all([id]);
 *   const row = await stmt.get([id]);
 *   await stmt.run([id]);
 */
export function prepare(text: string) {
  return {
    /**
     * Return all rows
     */
    async all(params: any[] = []): Promise<any[]> {
      const result = await pool.query(text, params);
      return result.rows;
    },

    /**
     * Return a single row (or null if none)
     */
    async get(params: any[] = []): Promise<any | null> {
      const result = await pool.query(text, params);
      return result.rows[0] ?? null;
    },

    /**
     * Execute a statement where you don't care about returning rows
     * (INSERT/UPDATE/DELETE, DDL, etc.)
     */
    async run(params: any[] = []): Promise<pg.QueryResult> {
      return pool.query(text, params);
    }
  };
}

/**
 * Initialize database schema.
 *
 * NOTE: This schema is inferred from your code and may need
 * small tweaks if your route SQL expects different column names.
 */
export async function initDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Basic schema inferred from the routes (food, nutrition, blood sugar, correlations).
    // Adjust column names / types if your existing SQL (in routes) expects something else.
    const createTables = `
      -- Stores USDA-style per-100g nutrition info for foods
      CREATE TABLE IF NOT EXISTS nutrition_details (
        id SERIAL PRIMARY KEY,
        fdc_id INTEGER,
        description TEXT NOT NULL,
        brand_owner TEXT,
        calories REAL,
        protein REAL,
        carbs REAL,
        fat REAL,
        fiber REAL,
        sugar REAL,
        sodium REAL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- One logical food entry (a “logged item” on a given date/time)
      CREATE TABLE IF NOT EXISTS food_entries (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        time TIME WITHOUT TIME ZONE,
        description TEXT,
        amount REAL,           -- typically grams or serving size value
        unit TEXT,             -- "g", "serving", etc.
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Link table between entries and nutrition_details
      -- (so a single entry can be associated with one or more USDA items)
      CREATE TABLE IF NOT EXISTS food_entry_links (
        id SERIAL PRIMARY KEY,
        entry_id INTEGER NOT NULL REFERENCES food_entries(id) ON DELETE CASCADE,
        nutrition_id INTEGER NOT NULL REFERENCES nutrition_details(id) ON DELETE CASCADE
      );

      -- Blood sugar readings
      CREATE TABLE IF NOT EXISTS blood_sugar_readings (
        id SERIAL PRIMARY KEY,
        date DATE NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL,
        reading REAL NOT NULL,
        notes TEXT
      );

      -- Indexes (these match the ones that were at the bottom of your old file)
      CREATE INDEX IF NOT EXISTS idx_food_entries_date
        ON food_entries(date);

      CREATE INDEX IF NOT EXISTS idx_food_entry_links_entry_id
        ON food_entry_links(entry_id);

      CREATE INDEX IF NOT EXISTS idx_blood_sugar_date
        ON blood_sugar_readings(date);

      CREATE INDEX IF NOT EXISTS idx_blood_sugar_timestamp
        ON blood_sugar_readings(timestamp);
    `;

    await client.query(createTables);

    await client.query('COMMIT');
    console.log('Database initialized (PostgreSQL).');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', err);
    throw err;
  } finally {
    client.release();
  }
}

// Default export kept for backward compatibility if you ever did:
//   import db from './database.js';
export default {
  pool,
  exec,
  prepare,
  initDatabase,
  query: prepare
};
