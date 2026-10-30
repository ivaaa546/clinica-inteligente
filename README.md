# Clínica Inteligente

MVP de telemedicina para pacientes, médicos y administradores. Incluye agenda, disponibilidad médica, citas presenciales y virtuales, preconsulta, expediente clínico estructurado, recetas simples, control de acceso por rol, auditoría y videollamadas con LiveKit.

## Estructura

- `backend/`: API REST con Express, Prisma y PostgreSQL.
- `frontend/`: aplicación React/Vite.
- `docs/`: análisis, reglas de negocio, requisitos y diseño.

## Requisitos

- Node.js 20 o superior.
- PostgreSQL 15 o superior.
- Credenciales de LiveKit para los entornos que emiten accesos de videollamada.

## Puesta en marcha

1. Copia `backend/.env.example` a `backend/.env` y completa sus valores.
2. Copia `frontend/.env.example` a `frontend/.env` si necesitas cambiar la URL pública de la API.
3. Instala las dependencias y aplica migraciones:

```bash
cd backend && npm ci && npm run migrate
cd ../frontend && npm ci
```

4. Inicia ambos servicios en terminales separadas:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

## Verificación

```bash
cd backend && npm run typecheck && npm test
cd frontend && npm run typecheck && npm run lint && npm run test:client && npm run build
```

Las pruebas de integración del backend requieren `TEST_DATABASE_URL` y se ejecutan explícitamente con `npm run test:integration`. El flujo de GitHub Actions levanta PostgreSQL, aplica las migraciones y usa ese comando; por tanto falla si la infraestructura de integración no está disponible.

## Documentación

El índice completo está en [docs/indice.md](docs/indice.md). Para configurar y operar las modalidades presencial/virtual y LiveKit Cloud, consulta [backend/VIDEO_LIVEKIT.md](backend/VIDEO_LIVEKIT.md).

La configuración de CI/CD para Vercel y Render está documentada en [docs/despliegue-vercel-render.md](docs/despliegue-vercel-render.md).
