// Las pruebas usan TEST_DATABASE_URL para mantener separada la base de datos de desarrollo.
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? "postgresql://test:test@127.0.0.1:5432/clinica_inteligente_test";
process.env.SESSION_SECRET = process.env.SESSION_SECRET ?? "test-session-secret-with-at-least-32-chars";
process.env.NODE_ENV = "test";
