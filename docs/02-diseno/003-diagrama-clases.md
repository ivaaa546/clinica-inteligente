# 003 - Diagrama de Clases


## Objetivo

Representar las clases de dominio, sus atributos principales, operaciones de negocio y relaciones. Este diagrama complementa el modelo de datos; no define clases finales de codigo ni detalles de framework.

## Diagrama

```mermaid
classDiagram
    class Usuario {
        +UUID id
        +string nombre
        +string apellidos
        +string correo
        +string contrasenaHash
        +string telefono
        +Rol rol
        +boolean activo
        +desactivar()
    }

    class Paciente {
        +UUID id
        +date fechaNacimiento
        +string alergias
        +string antecedentes
    }

    class Medico {
        +UUID id
        +string numeroProfesional
        +publicarDisponibilidad()
    }

    class Especialidad {
        +UUID id
        +string nombre
        +boolean activa
    }

    class Disponibilidad {
        +UUID id
        +datetime inicio
        +datetime fin
        +boolean activa
        +esReservable() boolean
    }

    class Cita {
        +UUID id
        +datetime inicio
        +datetime fin
        +EstadoCita estado
        +aceptar()
        +rechazar()
        +cancelar()
        +reprogramar()
        +completar()
    }

    class Consulta {
        +UUID id
        +string diagnostico
        +string notasClinicas
        +datetime fechaConsulta
    }

    class Receta {
        +UUID id
        +string medicamento
        +string dosis
        +string via
        +string frecuencia
        +string duracion
        +string indicaciones
    }

    class Auditoria {
        +UUID id
        +string accion
        +string entidad
        +UUID entidadId
        +datetime ocurridoEn
    }

    class Rol {
        <<enumeration>>
        PACIENTE
        MEDICO
        ADMINISTRADOR
    }

    class EstadoCita {
        <<enumeration>>
        PENDIENTE
        ACEPTADA
        RECHAZADA
        CANCELADA
        REPROGRAMADA
        COMPLETADA
    }

    Usuario "1" --> "0..1" Paciente : tiene perfil
    Usuario "1" --> "0..1" Medico : tiene perfil
    Usuario --> Rol : usa
    Especialidad "1" --> "0..*" Medico : clasifica
    Medico "1" --> "0..*" Disponibilidad : publica
    Paciente "1" --> "0..*" Cita : solicita
    Medico "1" --> "0..*" Cita : atiende
    Disponibilidad "1" --> "0..1" Cita : se reserva en
    Cita "1" --> "0..1" Consulta : genera
    Consulta "1" --> "0..*" Receta : incluye
    Cita "0..1" --> "0..*" Cita : cita origen
    Usuario "1" --> "0..*" Auditoria : realiza
    Cita --> EstadoCita : usa
```

## Reglas representadas

- Un Usuario tiene un solo rol y solo un perfil compatible con ese rol.
- Un Medico pertenece a una Especialidad y publica bloques de Disponibilidad de 30 minutos.
- Una Cita relaciona un Paciente, un Medico y un bloque de Disponibilidad.
- Una Cita puede generar como maximo una Consulta; una Consulta puede tener cero o varias Recetas.
- Una Cita reprogramada conserva la referencia a su Cita de origen para no perder historial.
- Auditoria registra la accion realizada por un Usuario sobre una entidad del dominio.
- Las operaciones de `Cita` solo permiten transiciones validas segun su estado y fecha/hora.

## Restricciones de acceso

- `notasClinicas` solo puede ser consultado por el Medico asociado a la Cita.
- El Paciente solo consulta sus propias Citas, diagnosticos y Recetas.
- El Administrador no puede acceder a datos clinicos ni modificar Consultas o Recetas.
