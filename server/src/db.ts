import { Pool } from "pg";
import type { QueryResultRow } from "pg";

// Assuming dotenv.config() is called in the main entry point (e.g., index.ts)
// and process.env is populated before this module is imported.

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Error: DATABASE_URL is not set in the environment variables.");
  console.error(
    "Please ensure you have a .env file in the /server directory with DATABASE_URL defined.",
  );
  console.error(
    'Example: DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE_NAME"',
  );
  // Consider the implications for your application if the DB is critical.
  // The pool creation will fail if databaseUrl is undefined.
}

// --- COMMENTED OUT POOL CREATION FOR DEBUGGING ---
const pool = new Pool({
  connectionString: databaseUrl,
  // SSL configuration can be added here for production if needed
  // ssl: {
  //   rejectUnauthorized: false, // Or true with proper CA certs for secure connections
  // },
});

pool.on("connect", () => {
  console.log(
    "Successfully connected to the PostgreSQL database via pool client.",
  );
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client in PostgreSQL pool:", err);
});
// ---------------------------------------------------

// --- DUMMY EXPORT FOR DEBUGGING --- Comment this entire block out
/*
export default {
  query: async <T extends QueryResultRow = any>(text: string, params?: any[]) => {
    console.warn('!!! DB Query SKIPPED - Pool creation commented out for debugging !!!');
    // Return a dummy QueryResult structure to satisfy downstream types if needed
    // Adjust this based on what the calling code expects (e.g., rows array)
    return {
      rows: [] as T[],
      rowCount: 0,
      command: '',
      oid: 0,
      fields: []
    };
  },
  // getPool: () => pool, // Uncomment if direct pool access is needed
};
*/
// --- End of DUMMY EXPORT block ---

// --- REAL EXPORT --- Ensure this block is active
export default {
  query: <T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) =>
    pool.query<T>(text, params),
  getPool: () => pool, // Exporting the pool instance itself if needed elsewhere
};
