# Verificación reproducible y límites de la entrega

Esta guía describe cómo reproducir las verificaciones del frontend integrado del MVP. Los resultados corresponden a la ejecución local del 2026-10-21, contra una base aislada de pruebas.

## Requisitos y variables

- Node.js 20 o superior.
- Frontend: `VITE_API_URL` y `VITE_CLINIC_TIMEZONE` son las únicas variables públicas del navegador.
- Valores locales recomendados:

  ```dotenv
  VITE_API_URL=http://localhost:3000/api/v1
  VITE_CLINIC_TIMEZONE=America/Guatemala
  ```

- Backend: `DATABASE_URL`, `TEST_DATABASE_URL`, `SESSION_SECRET`, `CORS_ORIGINS`, `CLINIC_TIMEZONE` y los parámetros de Argon2id permanecen en el entorno del servidor. No deben copiarse a `VITE_*` ni versionarse.
- Las pruebas de integración usan `backend/.env.test`, que contiene una base aislada autorizada. No se imprime ni se documenta su URL.

## Instalación y verificación del frontend

```bash
cd clinica-inteligente/frontend
npm ci
npm run build
npm run lint
npm run test:client
```

`test:client` ejecuta seis pruebas con el runner integrado de Node y cubre JSON, `204`, `null`, errores HTTP/red, cookies de sesión, ausencia de reintentos de mutaciones, mapeo de registro y UUID de citas.

## Verificación del backend

Compilación y tipado:

```bash
cd clinica-inteligente/backend
npm ci
npm run build
npm run typecheck
```

Suite sin base configurada:

```bash
npm test
```

En ese modo se ejecutan las pruebas unitarias/HTTP sin base y las integradas se reportan omitidas; una prueba omitida no se considera aprobada.

Suite integrada contra la base aislada:

```bash
TEST_DB_URL=$(node --env-file=.env.test -e 'process.stdout.write(process.env.TEST_DATABASE_URL)')
DATABASE_URL="$TEST_DB_URL" node --env-file=.env.test ./node_modules/vitest/vitest.mjs run
```

Resultado verificado: 7 archivos y 24 pruebas aprobadas. Los datos temporales de las verificaciones de frontend fueron eliminados al terminar.

## CI y Linux

- `.github/workflows/frontend-ci.yml` ejecuta en `ubuntu-latest` con Node 20 `npm ci`, `npm run build`, `npm run lint` y `npm run test:client`.
- `.github/workflows/backend-ci.yml` ejecuta en PostgreSQL 15 las migraciones y la suite del backend.
- El build Linux ayuda a detectar imports cuya capitalización solo funcionaría en un sistema de archivos no sensible a mayúsculas.

## Cobertura de flujos

| Tarea | Cobertura verificada |
| --- | --- |
| T-024 | Registro, login, recarga con sesión, rutas protegidas, rol incorrecto, logout, cookie `HttpOnly` no visible en JavaScript y ausencia de `localStorage`. |
| T-025 | Búsqueda de agenda, especialidad sin disponibilidad, solicitud, conflicto atómico entre dos pacientes, cancelación, reprogramación y presentación en `America/Guatemala`. |
| T-026 | Perfil editable soportado, preconsulta propia, inmovilización tras consulta, antecedentes auditados, recetas múltiples y mínima exposición clínica al paciente. |
| T-027 | Viewports móvil/escritorio, overflow horizontal, navegación por teclado, labels asociados, build/lint/pruebas y CI Linux reproducible. |

Las comprobaciones de navegador se realizaron con Chromium headless y los datos creados para ellas se limpiaron de la base aislada.

## Correcciones backend incluidas

- `GET /appointments/:id` proyecta la respuesta según el actor y no entrega contenido clínico prohibido al paciente o administrador.
- Se agregaron regresiones de autorización y privacidad para propiedad de citas, preconsulta y recetas.
- Se conservó la reserva/reprogramación atómica y el control de estados reales; el frontend no simula éxito ante errores.

## Límites funcionales

Esta entrega no declara terminado todo el MVP ni los portales que no forman parte del frontend paciente. En particular:

- No se implementan portal de médico ni portal administrativo en React.
- Recuperación de contraseña, cambio de contraseña y generación/apertura/descarga de PDF no tienen contratos backend disponibles; se muestran como no disponibles y no se simulan.
- El paciente solo ve el diagnóstico y las recetas devueltas por `GET /prescriptions/me`; no se presenta un expediente clínico completo.
- No se inventan fechas, médicos, estados, PDFs, recetas ni campos ausentes del contrato.
- No se verificó producción: origen final, HTTPS, proxy TLS, `Secure`/`SameSite` y topología de despliegue siguen pendientes en T-029.

No publicar ni fusionar con `develop` como consecuencia de esta guía; cualquier publicación requiere una solicitud explícita y la validación de T-029 en el entorno real.
