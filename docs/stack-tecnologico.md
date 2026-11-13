# Stack tecnológico — Clínica Inteligente

MVP de telemedicina para pacientes, médicos y administradores.

## Backend

| Categoría | Tecnología |
|---|---|
| Runtime | Node.js 20+ |
| Lenguaje | TypeScript 5 (módulos ES) |
| Framework web | Express 4 |
| ORM | Prisma 5 |
| Base de datos | PostgreSQL 15+ |
| Validación | Zod |
| Sesiones | express-session + connect-pg-simple (guardadas en PostgreSQL) |
| Hash de contraseñas | Argon2id (`argon2`) |
| Seguridad HTTP | Helmet, CORS |
| Videollamadas | `livekit-server-sdk` |
| Driver de BD | `pg` |
| Pruebas | Vitest + Supertest |
| Utilidad de desarrollo | `tsx` (ejecuta el seed) |

## Frontend

| Categoría | Tecnología |
|---|---|
| Librería de UI | React 19 |
| Bundler / dev server | Vite 8 |
| Lenguaje | TypeScript 6 (mezclado con archivos `.js`) |
| Enrutamiento | React Router 7 |
| Videollamadas | `livekit-client` |
| Iconos | lucide-react |
| Estilos | CSS propio (`global.css`, `medical.css`) |
| Calidad de código | ESLint 10 + typescript-eslint, plugins react-hooks y react-refresh |
| Pruebas | `node:test` nativo de Node, ejecutado con `tsx` |

## Servicios externos

| Servicio | Uso |
|---|---|
| LiveKit Cloud | Videollamadas en tiempo real |
| Render | Hosting del backend (API) |
| Vercel | Hosting del frontend, con rewrite de `/api/v1/*` hacia Render |
| PostgreSQL | Base de datos |
| ESP32 | Envía frecuencia cardíaca (signos vitales), autenticado con `DEVICE_API_KEY` |

## DevOps

- **GitHub Actions**: 4 workflows (`backend-ci`, `backend-deploy`, `frontend-ci`, `frontend-deploy`).
- **CI**: contenedor PostgreSQL 15; ejecuta typecheck, build, migraciones y pruebas de integración.
- **Gestor de paquetes**: npm (`package-lock.json`). Existen también `pnpm-lock.yaml`; conviene dejar solo uno.
- **Control de versiones**: Git, ramas `main` y `develop`.

## Arquitectura y diseño

- Monolito modular con API REST (`/api/v1`).
- Backend en capas: Router → Controller → Service → Repository → Prisma → PostgreSQL.
- Frontend SPA organizada por features.
- Control de acceso por roles (RBAC): paciente, médico, administrador.
- Auditoría de acciones.

### Capas del backend

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Router | `*.routes.ts` | Rutas HTTP, autenticación y roles |
| Schema | `*.schema.ts` | Validación de entrada con Zod |
| Controller | `*.controller.ts` | Traduce HTTP ↔ Service, sin lógica de negocio |
| Service | `*.service.ts` | Reglas de negocio y autorización |
| Repository | `*.repository.ts` | Único acceso a la base de datos (Prisma) |

### Infraestructura compartida (`backend/src/lib`)

| Archivo | Función |
|---|---|
| `app.ts` | Ensambla Express y sus middlewares |
| `env.ts` | Configuración validada con Zod |
| `prisma.ts` | Instancia única de `PrismaClient` |
| `session.ts` | Sesiones en PostgreSQL |
| `password.ts` | Hash y verificación con Argon2id |

## Pruebas

| Tipo | Alcance | Herramienta |
|---|---|---|
| Unitarias | Schemas y lógica aislada | Vitest |
| Integración | HTTP → Service → Repository → PostgreSQL real | Vitest + Supertest |
| Frontend | Capa de API y validación clínica, con `fetch` simulado | `node:test` |

## Despliegue

```
Navegador → Vercel (SPA) ──/api/v1/* rewrite──► Render (Express) ──► PostgreSQL
                                                    └──► LiveKit Cloud (video)
```

## Documentación

Archivos Markdown en `docs/`: análisis, casos de uso, reglas de negocio, modelo de datos, diagramas de clases, actividades y secuencia, y despliegue.
