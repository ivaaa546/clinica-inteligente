# Despliegue con Vercel y Render

## Flujo

- Los pull requests ejecutan CI sin desplegar.
- Un push a `develop` verifica y despliega en `staging`.
- Un push a `main` verifica y despliega en `production`.
- Los entornos `staging` y `production` se protegen desde GitHub Environments. Configure aprobación manual para producción.

Los workflows de despliegue llaman a los workflows de CI y no ejecutan un despliegue si la verificación falla.

## Vercel

Configure un proyecto Vercel con directorio raíz `frontend`. El archivo `frontend/vercel.json` entrega `index.html` en rutas de la SPA como `/paciente`, `/medico` y `/admin`.

En Vercel cree los entornos `staging` y `production`. En cada uno configure:

| Variable | Valor |
| --- | --- |
| `VITE_API_URL` | URL HTTPS pública de la API del mismo ambiente, con `/api/v1`. |
| `VITE_CLINIC_TIMEZONE` | `America/Guatemala`. |

En los secretos de cada GitHub Environment configure:

| Secreto | Uso |
| --- | --- |
| `VERCEL_TOKEN` | Token de despliegue de Vercel. |
| `VERCEL_ORG_ID` | Identificador de organización o cuenta Vercel. |
| `VERCEL_PROJECT_ID` | Identificador del proyecto Vercel. |

El workflow usa `--target=staging` para `develop`; cree ese Custom Environment en Vercel antes del primer despliegue.

## Render

Cree un Web Service por ambiente con directorio raíz `backend` y Node 20.

| Campo Render | Valor |
| --- | --- |
| Build command | `npm ci && npm run build && npm run migrate` |
| Start command | `npm start` |
| Health check path | `/health` |
| Auto-deploy | Desactivado; GitHub Actions activa el Deploy Hook tras CI. |

Configure en Render, nunca en el repositorio:

- `DATABASE_URL`
- `SESSION_SECRET`, distinto y de al menos 32 caracteres por ambiente
- `NODE_ENV=production`
- `CORS_ORIGINS`, con el origen HTTPS exacto del frontend Vercel correspondiente
- `CLINIC_TIMEZONE=America/Guatemala`
- `LIVEKIT_URL`, `LIVEKIT_API_KEY` y `LIVEKIT_API_SECRET` exclusivos del ambiente

En cada GitHub Environment configure:

| Entrada | Uso |
| --- | --- |
| Secreto `RENDER_DEPLOY_HOOK` | Deploy Hook del Web Service Render correspondiente. |
| Variable `RENDER_HEALTHCHECK_URL` | URL HTTPS del servicio más `/health`. |

Render recibe `PORT` automáticamente. No ejecute `npm run seed` fuera de un entorno aislado y autorizado. Las migraciones se ejecutan en el build de Render, una vez por despliegue serializado del servicio.

## Seguridad operativa

- Use dominios HTTPS distintos por ambiente y actualice `CORS_ORIGINS` con precisión; no use comodines.
- Vercel solo recibe variables públicas `VITE_*`; nunca copie secretos del backend al proyecto frontend.
- Render termina TLS delante de Express. El backend configura `trust proxy` solo en producción para que las cookies `Secure` funcionen detrás del proxy.
- Antes de habilitar videollamadas reales, complete los requisitos de `backend/VIDEO_LIVEKIT.md`.
- Verifique manualmente login, cookie de sesión, rutas directas de la SPA, CORS, migración y `/health` en staging antes de promover a producción.
