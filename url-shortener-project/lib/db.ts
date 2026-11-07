import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경변수가 설정되지 않았습니다.");
}

export const sql = neon(process.env.DATABASE_URL);

let schemaReady: Promise<unknown> | null = null;

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS urls (
        short_code VARCHAR(6) PRIMARY KEY,
        original_url TEXT NOT NULL UNIQUE,
        click_count INTEGER NOT NULL DEFAULT 0,
        last_clicked_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `.catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}
