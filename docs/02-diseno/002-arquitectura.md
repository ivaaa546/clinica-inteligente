# 002 - Arquitectura Tecnica


## Objetivo

Definir la arquitectura de software y las tecnologias propuestas para el MVP de telemedicina.

## Stack propuesto

| Capa | Tecnologia | Motivo |
|---|---|---|
| Frontend | React, TypeScript y Vite | Interfaz web tipada y modular. |
| Backend | Node.js, TypeScript y Express | API REST simple para el MVP. |
| Base de datos | PostgreSQL | Integridad, transacciones e indices para agenda e historial. |
| Acceso a datos | Prisma ORM | Migraciones tipadas y consultas parametrizadas. |
| Validacion | Zod | Validacion de entradas de API y formularios. |
| Sesion | Cookie firmada `HttpOnly` + **express-session** + **connect-pg-simple** | Evita exponer credenciales o tokens a JavaScript; persiste sesiones en PostgreSQL para no perderlas al reiniciar. |
| Pruebas | Vitest y Supertest | Pruebas unitarias e integracion de API. |

## Patron arquitectonico

**MVC Modular con Service Layer**

El backend se organiza en modulos por dominio. Cada modulo sigue el mismo flujo interno:

```
Router → Controller → Service → Repository → Prisma → PostgreSQL
```

| Capa | Rol |
|------|-----|
| **Router** | Define las rutas HTTP y aplica middlewares (auth, validacion). |
| **Controller** | Recibe la peticion, delega al Service y devuelve la respuesta JSON. Sin logica de negocio. |
| **Service** | Contiene toda la logica de negocio, reglas clinicas y autorizacion por relacion. |
| **Repository** | Unico punto de acceso a la base de datos mediante Prisma. |
| **Schema** | Validaciones de entrada con Zod. |

> Las reglas de negocio y autorizacion **nunca** viven en el Controller ni en el Router; siempre en el Service.

## Diagrama de capas

```text
React + TypeScript -> HTTPS/JSON -> Express API + TypeScript -> Prisma -> PostgreSQL
```

- El frontend no accede directamente a PostgreSQL.
- El backend concentra autenticacion, autorizacion, reglas de negocio, auditoria y persistencia.
- La API se organiza por modulos de dominio, no por pantallas del frontend.

## Estructura propuesta

```text
clinica-inteligente/
  frontend/
    src/
      features/
        auth/
        appointments/
        consultations/
        prescriptions/
        doctors/
        admin/
      components/        ← componentes compartidos
      routes/            ← definicion de rutas y guardias
      services/          ← llamadas a la API
      lib/               ← utilidades y configuracion
  backend/
    src/
      modules/
        auth/
          auth.routes.ts
          auth.controller.ts
          auth.service.ts
          auth.schema.ts
          auth.repository.ts
        users/
          users.routes.ts
          users.controller.ts
          users.service.ts
          users.schema.ts
          users.repository.ts
        patients/
          patients.routes.ts
          patients.controller.ts
          patients.service.ts
          patients.schema.ts
          patients.repository.ts
        doctors/
          doctors.routes.ts
          doctors.controller.ts
          doctors.service.ts
          doctors.schema.ts
          doctors.repository.ts
        specialties/
          specialties.routes.ts
          specialties.controller.ts
          specialties.service.ts
          specialties.schema.ts
          specialties.repository.ts
        availability/
          availability.routes.ts
          availability.controller.ts
          availability.service.ts
          availability.schema.ts
          availability.repository.ts
        appointments/
          appointments.routes.ts
          appointments.controller.ts
          appointments.service.ts
          appointments.schema.ts
          appointments.repository.ts
        consultations/
          consultations.routes.ts
          consultations.controller.ts
          consultations.service.ts
          consultations.schema.ts
          consultations.repository.ts
        prescriptions/
          prescriptions.routes.ts
          prescriptions.controller.ts
          prescriptions.service.ts
          prescriptions.schema.ts
          prescriptions.repository.ts
        admin/
          admin.routes.ts
          admin.controller.ts
          admin.service.ts
          admin.repository.ts
        audit/
          audit.service.ts
          audit.repository.ts
      middleware/
        auth.middleware.ts       ← verifica sesion activa
        role.middleware.ts       ← verifica rol requerido
        error.middleware.ts      ← manejo centralizado de errores
      lib/
        prisma.ts                ← instancia compartida de Prisma
        session.ts               ← configuracion de express-session
        app.ts                   ← configuracion de Express
        server.ts                ← punto de entrada
    prisma/
      schema.prisma
      migrations/
      seed.ts
  docs/
```

Cada modulo es autocontenido y se comunica con otros unicamente a traves de sus servicios, nunca accediendo directamente al repositorio de otro modulo.

## Responsabilidades

| Capa | Responsabilidad |
|---|---|
| Frontend | Formularios, navegacion, presentacion de datos y guardias de ruta para experiencia de usuario. |
| API | Autenticacion, autorizacion, validacion, reglas de negocio, transacciones y auditoria. |
| Persistencia | Integridad referencial, restricciones, indices, migraciones y conservacion del historial clinico. |

## Restricciones arquitectonicas

- El frontend no decide permisos ni reglas clinicas; el backend los valida en cada solicitud.
- La API no devuelve notas clinicas a Pacientes ni datos clinicos a Administradores.
- Las operaciones de reserva, reprogramacion y registro de Consulta usan transacciones.
- Las credenciales se almacenan como hashes y los secretos se obtienen desde variables de entorno.
