# Modalidades de atención y LiveKit Cloud

Esta guía opera el backend de citas presenciales/virtuales y su integración de servidor con LiveKit Cloud. No habilita por sí misma atención a pacientes reales: antes del despliegue debe completarse la revisión indicada en [Antes de producción](#antes-de-producción).

## Configuración por ambiente

Configure estos valores únicamente en el gestor de secretos de cada ambiente; no se suben al repositorio ni se entregan al frontend:

| Variable | Uso |
|---|---|
| `LIVEKIT_URL` | URL HTTPS del proyecto LiveKit Cloud del ambiente. |
| `LIVEKIT_API_KEY` | API key de servidor para emitir credenciales y revocar participantes. |
| `LIVEKIT_API_SECRET` | Secreto de la API key. Solo puede existir en el backend. |
| `DATABASE_URL` | Conexión PostgreSQL del ambiente. |
| `SESSION_SECRET` | Secreto de firma de sesiones, distinto por ambiente. |
| `CORS_ORIGINS` | Orígenes web autorizados, separados por comas. |
| `NODE_ENV` | `development`, `test` o `production`. |

Parta de [`.env.example`](.env.example), pero sustituya todos los valores de ejemplo fuera del repositorio. En ejecución distinta de pruebas, el backend falla al arrancar si falta cualquiera de las tres variables `LIVEKIT_*`.

Cree proyectos y credenciales LiveKit separados por ambiente. Configure en LiveKit Cloud solo los orígenes web HTTPS autorizados de ese ambiente; no use comodines ni incluya orígenes de desarrollo en producción. Rotar o revocar una API key requiere actualizar el secreto del backend y reiniciar las instancias de forma controlada.

## Migración

La actualización es incremental; **no** borre ni recree el esquema. Aplica, en orden, las migraciones:

1. `0002_modalidad_atencion_y_legado`: modalidades, dirección presencial conservada, sala opaca y marca de datos históricos.
2. `0003_signos_vitales_y_revocacion_video`: estados de signos vitales y cola persistente de revocación.

Las migraciones conservan citas, disponibilidades y consultas existentes. Las citas históricas se convierten a `PRESENCIAL`; una cita histórica sin dirección fiable conserva la marca de legado, sin inventar ni copiar la dirección actual del médico. Los signos vitales existentes se marcan `MEDIDO`.

En cada ambiente autorizado, con respaldo y una ventana de cambio aprobada:

```bash
cd backend
npm ci
npm run build
npm run migrate
```

Confirme que `DATABASE_URL` apunta al ambiente previsto antes de ejecutar `npm run migrate`. No ejecute `npm run seed` sobre producción.

## Ejecución y procesamiento de revocaciones

Ejecute el backend con el entorno y secretos correspondientes:

```bash
cd backend
npm run build
npm start
```

En proveedores como Render, las variables se inyectan en el proceso y no existe un archivo `.env`; `npm start` las consume directamente. Para desarrollo local, `npm run dev` mantiene la carga desde `.env`.

El proceso del servidor ejecuta cada minuto el cierre de ventana de las citas virtuales aceptadas que ya terminaron. Encola una revocación persistente y el procesador expulsa/revoca a Paciente y Médico mediante LiveKit. Cancelar, rechazar, reprogramar o completar una cita virtual también encola una revocación dentro de la transacción local.

La cola persiste reintentos con demora exponencial. Puede haber un retraso si LiveKit Cloud o la conexión saliente están caídos; mientras tanto el backend no emite accesos nuevos para una cita invalidada. Mantenga el proceso del backend en ejecución y supervise sus errores. Un reinicio recupera las tareas pendientes; no se debe borrar la tabla de revocaciones para “destrabar” trabajo.

## Pruebas reproducibles

Las pruebas de integración requieren una base PostgreSQL aislada y migrada. Defina `TEST_DATABASE_URL` y haga que `DATABASE_URL` use esa misma base para la ejecución.

```bash
cd backend
npm ci
DATABASE_URL="$TEST_DATABASE_URL" npm run migrate
node --env-file=.env.test --env-file=.env ./node_modules/vitest/vitest.mjs run
```

Para ejecutar solo la cobertura de videollamadas:

```bash
node --env-file=.env.test --env-file=.env ./node_modules/vitest/vitest.mjs run test/video-calls.unit.test.ts
```

La cobertura usa un proveedor LiveKit falso; no requiere cuenta ni credenciales LiveKit reales. Verifica autorización por Paciente/Médico asignados, rechazo de terceros y Administrador, ventana de acceso, expiración máxima de diez minutos, claims opacos, revocación, reintentos e invariantes de auditoría sin JWT, URL ni secretos.

Antes de publicar un cambio ejecute también:

```bash
npm run typecheck
npm test
npm run build
git diff --check
```

## Límites funcionales y de seguridad

- La API solo emite acceso a una cita `VIRTUAL`, `ACEPTADA`, para el Paciente o Médico asignados, desde cinco minutos antes de su inicio y hasta su fin programado.
- Los JWT son temporales (máximo diez minutos), se emiten desde el backend y usan sala e identidad opacas; no contienen nombre, correo ni información clínica.
- No se almacenan JWT, URL de acceso, audio, vídeo, grabaciones, transcripciones, chat, archivos ni pantalla compartida.
- La finalización o abandono de la llamada no completa una Consulta clínica.
- La dirección presencial solo se conserva en citas presenciales y solo se proyecta a las partes autorizadas. No se expone en búsqueda pública ni vistas administrativas innecesarias.
- Cada bloque conserva una sola cita activa sin importar la modalidad.

## Antes de producción

La tarea de aprovisionamiento externo sigue bloqueada hasta completar estos puntos por ambiente:

1. Crear proyecto LiveKit Cloud, API key y secreto exclusivos del ambiente y cargarlos en el gestor de secretos.
2. Restringir orígenes autorizados en LiveKit Cloud y `CORS_ORIGINS` a los dominios HTTPS de producción.
3. Realizar revisión de privacidad, región de procesamiento, retención, obligaciones legales y acuerdos aplicables a videollamadas con pacientes reales.
4. Ejecutar una prueba manual autorizada de cámara/micrófono, reconexión, cancelación/reprogramación y revocación real; confirmar que no se expone un secreto en navegador ni registros.
5. Definir monitorización y respuesta ante errores de revocación, incluido responsable operativo y revisión de la cola persistente.

Hasta completar esa revisión, el uso con pacientes reales no está autorizado.
