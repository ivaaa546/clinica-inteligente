# Frontend — Clínica Inteligente

Cliente web del MVP construido con React y Vite.

## Requisitos

- Node.js 20 o superior.
- El backend configurado para una base de datos **local de desarrollo**.

## Configuración local

### Frontend

1. Desde `clinica-inteligente/frontend`, copie el archivo de ejemplo:

   ```bash
   cp .env.example .env.local
   ```

2. Instale dependencias y arranque Vite:

   ```bash
   npm ci
   npm run dev
   ```

Vite sirve la aplicación local en `http://localhost:5173` por defecto.

### Variable pública de Vite

| Variable | Valor local | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:3000/api/v1` | URL base de la API REST. |
| `VITE_CLINIC_TIMEZONE` | `America/Guatemala` | Zona IANA oficial para presentar la agenda. |

La integración posterior usa este valor como configuración y documenta el mismo fallback local: `http://localhost:3000/api/v1`.

> Las variables con prefijo `VITE_` se incorporan al código enviado al navegador. No agregue secretos, contraseñas, cookies, `SESSION_SECRET` ni `DATABASE_URL` en archivos de entorno del frontend.

### Backend

1. Desde `clinica-inteligente/backend`, prepare solo un entorno local de desarrollo:

   ```bash
   cp .env.example .env
   ```

2. Configure en `.env` una `DATABASE_URL` local y un `SESSION_SECRET` seguro. Mantenga `CLINIC_TIMEZONE=America/Guatemala` para que API y frontend presenten la agenda en la zona oficial. Para permitir el frontend de Vite, mantenga el origen exacto:

   ```dotenv
   CORS_ORIGINS=http://localhost:5173
   ```

3. Instale dependencias y ejecute la API:

   ```bash
   npm ci
   npm run dev
   ```

La API queda disponible localmente en `http://localhost:3000`; sus rutas versionadas usan el prefijo `/api/v1`.

No ejecute `seed` ni migraciones contra bases de datos remotas como parte de la configuración del frontend. Cualquier operación sobre datos debe realizarse únicamente con autorización expresa y una base local o aislada.

## Verificación

Desde `clinica-inteligente/frontend`:

```bash
npm run build
npm run lint
```

Estos comandos no requieren publicar la aplicación ni modificar la base de datos.

Para reproducir la verificación completa, consultar [`VERIFICACION.md`](./VERIFICACION.md), que incluye la suite aislada del backend, resultados por tarea, cobertura de navegador, CI y límites funcionales.
