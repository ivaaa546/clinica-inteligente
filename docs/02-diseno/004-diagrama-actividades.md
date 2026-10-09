# 004 - Diagrama de Actividades


## Gestion de cita

```mermaid
flowchart TD
    A[Paciente busca medico por especialidad] --> B[Selecciona medico y horario disponible]
    B --> C{Horario aun disponible?}
    C -- No --> D[Informar que el horario ya no esta disponible]
    D --> B
    C -- Si --> E[Crear cita PENDIENTE]
    E --> F[Medico revisa cita]
    F --> G{Aceptar cita?}
    G -- No --> H[Marcar cita RECHAZADA]
    G -- Si --> I[Marcar cita ACEPTADA]
    H --> J[Paciente consulta estado]
    I --> K{Se cancela o reprograma antes de la cita?}
    K -- Si --> L[Cancelar o marcar REPROGRAMADA]
    L --> M{Hay nuevo horario disponible?}
    M -- Si --> E
    M -- No --> J
    K -- No --> N[Realizar atencion]
```

## Registro de consulta

```mermaid
flowchart TD
    A[Medico abre una cita] --> B{La cita es ACEPTADA y pertenece al Medico?}
    B -- No --> C[Denegar registro de consulta]
    B -- Si --> D[Registrar diagnostico y notas clinicas]
    D --> E{Requiere receta?}
    E -- Si --> F[Registrar una o mas recetas simples]
    E -- No --> G[Guardar consulta]
    F --> G
    G --> H[Asociar consulta al expediente del Paciente]
    H --> I[Marcar cita COMPLETADA]
    I --> J[Registrar auditoria interna]
```

## Reglas reflejadas

- No se crea una Cita si el horario ya fue reservado.
- Solo el Medico asignado puede gestionar una Cita o registrar su Consulta.
- La cancelacion y reprogramacion solo ocurren antes de la fecha/hora de la Cita.
- Una Consulta solo se registra para una Cita aceptada y puede no tener Recetas.
