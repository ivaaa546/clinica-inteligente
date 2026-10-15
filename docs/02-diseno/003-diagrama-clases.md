---

### Documento 2: 003-diagrama-clases.md

```markdown
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
        +Sexo sexo
        +string direccion
        +string ocupacion
        +boolean poblacionMigrante
        +string nombreResponsable
    }

    class AntecedentesGenerales {
        +UUID id
        +string medicos
        +string quirurgicos
        +string familiares
        +string habitos
        +string alergias
    }

    class AntecedentesGinecoObstetricos {
        +UUID id
        +date fur
        +int gestas
        +int partos
        +int cesareas
        +int abortos
        +int hijosVivos
        +string planificacion
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
        +TipoFicha tipoFicha
        +string motivoConsulta
        +string historiaActual
        +string evaluacionClinicaJSON
        +string diagnostico
        +string observaciones
        +datetime fechaConsulta
    }

    class SignosVitales {
        +UUID id
        +decimal pesoLb
        +decimal tallaCm
        +decimal temperatura
        +string presionArterial
        +int frecCardiaca
        +int frecRespiratoria
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

    class TipoFicha {
        <<enumeration>>
        ADULTO
        PRENATAL
        NEONATO
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
    
    class Sexo {
        <<enumeration>>
        M
        F
    }

    Usuario "1" --> "0..1" Paciente : tiene perfil
    Usuario "1" --> "0..1" Medico : tiene perfil
    Usuario --> Rol : usa
    Paciente "1" --> "0..1" AntecedentesGenerales : posee
    Paciente "1" --> "0..1" AntecedentesGinecoObstetricos : posee
    Paciente --> Sexo : usa
    Especialidad "1" --> "0..*" Medico : clasifica
    Medico "1" --> "0..*" Disponibilidad : publica
    Paciente "1" --> "0..*" Cita : solicita
    Medico "1" --> "0..*" Cita : atiende
    Disponibilidad "1" --> "0..1" Cita : se reserva en
    Cita "1" --> "0..1" Consulta : genera
    Consulta "1" --> "0..1" SignosVitales : registra
    Consulta "1" --> "0..*" Receta : incluye
    Cita "0..1" --> "0..*" Cita : cita origen
    Usuario "1" --> "0..*" Auditoria : realiza
    Cita --> EstadoCita : usa
    Consulta --> TipoFicha : usa