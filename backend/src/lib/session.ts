import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;
const sessionTtlMs = 8 * 60 * 60 * 1000;
const sessionStoreFactory = connectPgSimple(session);
const pool = new Pool({ connectionString: env.databaseUrl });

// La tabla de sesiones se crea al primer uso y se limpian sesiones expiradas cada 15 minutos.
const store = new sessionStoreFactory({
  pool,
  createTableIfMissing: true,
  pruneSessionInterval: 15 * 60,
});

export const sessionMiddleware = session({
  store,
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    maxAge: sessionTtlMs,
  },
});
