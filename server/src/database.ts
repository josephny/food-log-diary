import Database from 'better-sqlite3';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if we're using PostgreSQL (cloud) or SQLite (local)
const DATABASE_URL = process.env.DATABASE_URL;
const USE_POSTGRES = !!DATABASE_URL;

let db: any;
let pgPool: pg.Pool | null = null;

// Initialize database connection
if (USE_POSTGRES) {
  // PostgreSQL (cloud deployment)
  pgPool = new pg.Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  console.log('Using PostgreSQL database');
} else {
  // SQLite (local development)
  db = new Database(path.join(__dirname, '../data/food_log.db'));
  console.log('Using SQLite database');
}

// Prepare statement helper - returns async methods for both databases
export function prepare(text: string): any {
  if (USE_POSTGRES && pgPool) {
    return {
      get: async (params?: any[]) => {
        const result = await pgPool!.query(text, params || []);
        return result.rows[0] || null;
      },
      all: async (params?: any[]) => {
        const result = await pgPool!.query(text, params || []);
        return result.rows;
      },
      run: async (params?: any[]) => {
        const result = await pgPool!.query(text, params || []);
        // For INSERT with RETURNING, get the id from the returned row
        if (text.includes('RETURNING') && result.rows[0]) {
          return { lastInsertRowid: result.rows[0].id };
        }
        // For regular INSERT, try to get id from result
        return { lastInsertRowid: result.rows[0]?.id || null };
      }
    };
  } else {
    // SQLite - wrap in async for consistency
    const stmt = db.prepare(text);
    return {
      get: async (params?: any[]) => {
        return stmt.get(...(params || []));
      },
      all: async (params?: any[]) => {
        return stmt.all(...(params || []));
      },
      run: async (params?: any[]) => {
        const info = stmt.run(...(params || []));
        return { lastInsertRowid: info.lastInsertRowid };
      }
    };
  }
}

// Execute SQL (for CREATE TABLE, etc.)
export async function exec(sql: string): Promise<void> {
  if (USE_POSTGRES && pgPool) {
    await pgPool.query(sql);
  } else {
    db.exec(sql);
  }
}

export async function initDatabase() {
  // Convert SQLite syntax to PostgreSQL-compatible
  const createTables = USE_POSTGRES ? `
    -- Food entries table
    CREATE TABLE IF NOT EXISTS food_entries (
      id SERIAL PRIMARY KEY,
      food_name TEXT NOT NULL,
      amount REAL NOT NULL,
      unit TEXT NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Nutrition data table (cached from API)
    CREATE TABLE IF NOT EXISTS nutrition_data (
      id SERIAL PRIMARY KEY,
      fdc_id INTEGER UNIQUE,
      food_name TEXT NOT NULL,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      fiber REAL,
      sugar REAL,
      sodium REAL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Food entry nutrition link
    CREATE TABLE IF NOT EXISTS entry_nutrition (
      entry_id INTEGER REFERENCES food_entries(id) ON DELETE CASCADE,
      nutrition_id INTEGER REFERENCES nutrition_data(id) ON DELETE CASCADE,
      amount REAL
    );

    -- Blood sugar readings
    CREATE TABLE IF NOT EXISTS blood_sugar_readings (
      id SERIAL PRIMARY KEY,
      reading REAL NOT NULL,
      timestamp TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_food_entries_date ON food_entries(date);
    CREATE INDEX IF NOT EXISTS idx_blood_sugar_date ON blood_sugar_readings(date);
    CREATE INDEX IF NOT EXISTS idx_blood_sugar_timestamp ON blood_sugar_readings(timestamp);
  ` : `
    -- Food entries table
    CREATE TABLE IF NOT EXISTS food_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      food_name TEXT NOT NULL,
      amount REAL NOT NULL,
      unit TEXT NOT NULL,
      date TEXT NOT NULL,
      meal_type TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Nutrition data table (cached from API)
    CREATE TABLE IF NOT EXISTS nutrition_data (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fdc_id INTEGER UNIQUE,
      food_name TEXT NOT NULL,
      calories REAL,
      protein REAL,
      carbs REAL,
      fat REAL,
      fiber REAL,
      sugar REAL,
      sodium REAL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Food entry nutrition link
    CREATE TABLE IF NOT EXISTS entry_nutrition (
      entry_id INTEGER,
      nutrition_id INTEGER,
      amount REAL,
      FOREIGN KEY (entry_id) REFERENCES food_entries(id),
      FOREIGN KEY (nutrition_id) REFERENCES nutrition_data(id)
    );

    -- Blood sugar readings
    CREATE TABLE IF NOT EXISTS blood_sugar_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reading REAL NOT NULL,
      timestamp TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_food_entries_date ON food_entries(date);
    CREATE INDEX IF NOT EXISTS idx_blood_sugar_date ON blood_sugar_readings(date);
    CREATE INDEX IF NOT EXISTS idx_blood_sugar_timestamp ON blood_sugar_readings(timestamp);
  `;

  await exec(createTables);
}

// Export default for backward compatibility
export default {
  prepare,
  exec,
  query: prepare
};
