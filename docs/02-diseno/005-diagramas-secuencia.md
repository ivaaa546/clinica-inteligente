# 005 - Diagramas de Secuencia


## Solicitud de cita

```mermaid
sequenceDiagram
    actor Paciente
    participant UI as Frontend
    participant API as API
    participant DB as Base de datos
    actor Medico

    Paciente->>UI: Selecciona medico y horario
    UI->>API: POST /appointments
    API->>DB: Validar sesion, disponibilidad y reserva activa
    alt Horario disponible
        API->>DB: Crear Cita PENDIENTE y Auditoria
        DB-->>API: Cita creada
        API-->>UI: 201 Cita pendiente
        UI-->>Paciente: Mostrar estado pendiente
        Medico->>UI: Revisar citas pendientes
        UI->>API: PATCH /appointments/:id/status
        API->>DB: Validar Medico asignado y actualizar estado
        DB-->>API: Estado actualizado
        API-->>UI: 200 Cita aceptada o rechazada
    else Horario ocupado o invalido
        API-->>UI: 409 Conflicto de disponibilidad
        UI-->>Paciente: Informar que debe elegir otro horario
    end
```

## Registro de consulta y receta

```mermaid
sequenceDiagram
    actor Medico
    participant UI as Frontend
    participant API as API
    participant DB as Base de datos
    actor Paciente

    Medico->>UI: Registrar consulta
    UI->>API: POST /appointments/:id/consultation
    API->>DB: Validar sesion, Medico asignado y Cita ACEPTADA
    alt Autorizado
        API->>DB: Crear Consulta y Recetas opcionales
        API->>DB: Marcar Cita COMPLETADA y registrar Auditoria
        DB-->>API: Consulta guardada
        API-->>UI: 201 Consulta creada
        Paciente->>UI: Consultar historial
        UI->>API: GET /patients/:id/consultations
        API->>DB: Validar propiedad del Paciente
        DB-->>API: Diagnosticos y Recetas sin notas clinicas
        API-->>UI: 200 Historial autorizado
    else No autorizado o cita no aceptada
        API-->>UI: 403 o 409
        UI-->>Medico: Informar que no puede registrar la consulta
    end
```

## Reglas reflejadas

- La API valida permisos y reglas de negocio; el frontend no decide autorizacion.
- La reserva, la Consulta y la Auditoria se guardan mediante transacciones.
- El Paciente nunca recibe notas clinicas en las respuestas de historial.
