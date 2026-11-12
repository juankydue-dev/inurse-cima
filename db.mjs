import pg from "pg";
import { CLAVES_LOCALES } from "./sources/sincronizacion.mjs";

const { Pool } = pg;

export const DB_ENABLED = !!process.env.DATABASE_URL;

export const pool = DB_ENABLED
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false }
    })
  : null;

export async function initSchema() {
  if (!DB_ENABLED) {
    console.warn("DATABASE_URL no configurada: cuentas y sincronización en la nube desactivadas.");
    return;
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      expires_at TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_data (
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      key TEXT NOT NULL,
      value TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      PRIMARY KEY (user_id, key)
    );
    -- Proyectos con Javny. "estructura" es la lista de apartados en jsonb
    -- ([{id, titulo, orden, estado, contenido}, …]) y no una tabla propia:
    -- en esta fase el índice se reordena/edita entero desde el cliente, y una
    -- tabla aparte solo complicaría el guardado automático sin aportar nada
    -- que hoy se consulte por separado. Si en una fase futura hace falta
    -- buscar o filtrar por apartado, se separa entonces.
    CREATE TABLE IF NOT EXISTS proyectos (
      id UUID PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      titulo TEXT NOT NULL,
      tipo TEXT NOT NULL,
      descripcion TEXT,
      idioma TEXT NOT NULL DEFAULT 'Castellano',
      tono TEXT,
      destinatario TEXT,
      normas_citacion TEXT,
      extension_objetivo TEXT,
      institucion_tutor TEXT,
      fuentes JSONB NOT NULL DEFAULT '{}'::jsonb,
      estado TEXT NOT NULL DEFAULT 'borrador',
      estructura JSONB NOT NULL DEFAULT '[]'::jsonb,
      version INTEGER NOT NULL DEFAULT 1,
      creado TIMESTAMPTZ NOT NULL DEFAULT now(),
      actualizado TIMESTAMPTZ NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_proyectos_user_id ON proyectos(user_id);
  `);
  console.log("Esquema de base de datos verificado (users, sessions, user_data, proyectos).");
  // Borra las copias de claves que no deben estar en el servidor (ficha SOS),
  // subidas antes de que se excluyeran de la sincronización. Idempotente.
  const purga = await pool.query("DELETE FROM user_data WHERE key = ANY($1)", [CLAVES_LOCALES]);
  if (purga.rowCount) console.log(`[Sincronización] Borradas ${purga.rowCount} copias de claves locales (${CLAVES_LOCALES.join(", ")}).`);
}
