# 001 - Modelo de Datos y Dominio

## Objetivo

Definir las entidades, atributos, relaciones y restricciones necesarias para implementar el MVP de telemedicina aprobado en `docs/01-analisis/`.

Este documento define el modelo logico. No impone motor de base de datos, framework ni tipos fisicos concretos.

## Entidades

### Usuario

Representa una cuenta autenticable del sistema.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| nombre | Obligatorio. |
| apellidos | Obligatorio. |
| correo | Obligatorio y unico. |
| contrasena_hash | Obligatorio. Contiene exclusivamente un hash Argon2id; nunca se almacena la contrasena en texto plano. |
| telefono | Obligatorio. |
| rol | Obligatorio: `PACIENTE`, `MEDICO` o `ADMINISTRADOR`. |
| activo | Obligatorio; permite desactivar la cuenta sin borrar su historial. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

Un Usuario tiene exactamente un rol y, segun ese rol, se asocia a un perfil Paciente o Medico. El Administrador no tiene perfil clinico.

### Paciente

Contiene los datos demográficos y de contacto de un Usuario con rol `PACIENTE`. Los antecedentes se manejan en entidades separadas.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| usuario_id | Obligatorio, unico y referencia a Usuario. |
| fecha_nacimiento | Obligatorio. |
| sexo | Obligatorio: `M`, `F` o `NO_ESPECIFICADO`. Es un dato clinico-administrativo; no determina por si solo la ficha clinica. |
| direccion | Opcional; lugar de residencia. |
| ocupacion | Opcional; profesion u oficio. |
| poblacion_migrante | Obligatorio; valor por defecto `false`. |
| nombre_responsable | Opcional; para acompañantes de adultos mayores o madres de neonatos. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Antecedentes_Generales

Contiene el historial médico permanente del paciente, separado de la evolución de las consultas diarias.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| paciente_id | Obligatorio, unico y referencia a Paciente. |
| medicos | Opcional; formato JSONB o Texto (Ej: Diabetes, HTA, Asma). |
| quirurgicos | Opcional; formato Texto. |
| familiares | Opcional; formato JSONB o Texto. |
| habitos | Opcional; formato JSONB o Texto (Ej: Fuma, Alcohol, Drogas). |
| alergias | Obligatorio; puede contener el valor `Sin alergias conocidas`. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Antecedentes_Gineco_Obstetricos

Contiene el historial reproductivo. Solo aplica para pacientes de sexo femenino.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| paciente_id | Obligatorio, unico y referencia a Paciente. |
| fur | Opcional; Fecha de Ultima Regla. |
| gestas | Obligatorio; valor por defecto `0`. |
| partos | Obligatorio; valor por defecto `0`. |
| cesareas | Obligatorio; valor por defecto `0`. |
| abortos | Obligatorio; valor por defecto `0`. |
| hijos_vivos | Obligatorio; valor por defecto `0`. |
| planificacion | Opcional; metodo utilizado. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Especialidad

Clasifica a los Medicos disponibles para busqueda.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| nombre | Obligatorio y unico. |
| activa | Obligatorio. Las especialidades usadas por Medicos activos se desactivan, no se eliminan. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Medico

Contiene los datos profesionales de un Usuario con rol `MEDICO`.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| usuario_id | Obligatorio, unico y referencia a Usuario. |
| especialidad_id | Obligatorio y referencia a Especialidad activa. |
| numero_profesional | Obligatorio y unico. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Disponibilidad

Representa un bloque futuro que un Medico publica para recibir citas.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| medico_id | Obligatorio y referencia a Medico. |
| inicio | Obligatorio; instante con zona horaria almacenado en UTC. |
| fin | Obligatorio; debe ser exactamente 30 minutos despues de `inicio`. |
| activa | Obligatorio. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Cita

Registra la solicitud y el ciclo de vida de una atencion entre un Paciente y un Medico.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| paciente_id | Obligatorio y referencia a Paciente. |
| medico_id | Obligatorio y referencia a Medico. |
| disponibilidad_id | Obligatorio y referencia al bloque de Disponibilidad reservado. |
| inicio | Obligatorio; copia el inicio de la Disponibilidad al reservar, con zona horaria en UTC. |
| fin | Obligatorio; copia el fin de la Disponibilidad al reservar, con zona horaria en UTC. |
| estado | Obligatorio: `PENDIENTE`, `ACEPTADA`, `RECHAZADA`, `CANCELADA`, `REPROGRAMADA` o `COMPLETADA`. |
| cita_origen_id | Opcional; referencia a la Cita reprogramada. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

Al reprogramar una Cita se conserva la original con estado `REPROGRAMADA` y se crea una nueva Cita `PENDIENTE` que referencia a la anterior mediante `cita_origen_id`. Esto preserva la trazabilidad del historial. La base de datos garantiza que haya como maximo una cita activa (`PENDIENTE` o `ACEPTADA`) por `disponibilidad_id`.

Las transiciones validas son: `PENDIENTE` a `ACEPTADA`, `RECHAZADA`, `CANCELADA` o `REPROGRAMADA`; y `ACEPTADA` a `CANCELADA`, `REPROGRAMADA` o `COMPLETADA`. Los demas estados son terminales.

### Preconsulta

Representa la informacion previa que el Paciente completa para una Cita antes de la atencion medica.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| cita_id | Obligatorio, unico y referencia a Cita. |
| motivo_consulta | Obligatorio. |
| antecedentes_iniciales | Opcional; formato JSONB con la informacion declarada por el Paciente. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

El Paciente puede crear o actualizar la Preconsulta de su propia Cita hasta que exista una Consulta. El Medico asignado puede leerla; no puede editarla en nombre del Paciente.

### Consulta

Representa el registro clinico generado al finalizar una Cita aceptada. Adaptado para soportar multiples formatos de fichas clinicas.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| cita_id | Obligatorio, unico y referencia a Cita. |
| tipo_ficha | Obligatorio: `ADULTO`, `PRENATAL` o `NEONATO`. |
| motivo_consulta | Obligatorio. |
| historia_actual | Opcional; historia de la enfermedad actual. |
| evaluacion_clinica | Opcional; formato JSONB para almacenar checks de problemas a investigar y signos de peligro. |
| diagnostico | Obligatorio. |
| observaciones | Opcional. Solo son visibles para el Medico asociado a la Cita. |
| fecha_consulta | Obligatorio; instante con zona horaria almacenado en UTC. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Signos_Vitales

Captura las métricas físicas en el momento de la consulta.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| consulta_id | Obligatorio, unico y referencia a Consulta. |
| peso_lb | Obligatorio para cerrar la Consulta; decimal. |
| talla_cm | Obligatorio para cerrar la Consulta; decimal. |
| temperatura | Obligatorio para cerrar la Consulta; decimal en C. |
| presion_arterial | Obligatorio para cerrar la Consulta; formato cadena (ej. "120/80"). |
| frec_cardiaca | Obligatorio para cerrar la Consulta; entero (latidos por minuto). |
| frec_respiratoria | Obligatorio para cerrar la Consulta; entero (respiraciones por minuto). |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Receta

Representa una indicacion medica simple asociada a una Consulta.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| consulta_id | Obligatorio y referencia a Consulta. |
| medicamento | Obligatorio. |
| dosis | Obligatorio. |
| via | Obligatorio. |
| frecuencia | Obligatorio. |
| duracion | Obligatorio. |
| indicaciones | Obligatorio. |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

Una Consulta puede no tener recetas o tener varias. La Receta no contiene firma digital ni pretende tener validez legal en el MVP.

### Auditoria

Registra eventos sensibles para trazabilidad interna.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| usuario_id | Obligatorio y referencia al Usuario que ejecuta la accion. |
| accion | Obligatorio; por ejemplo, `CITA_ACEPTADA` o `CONSULTA_CREADA`. |
| entidad | Obligatorio; tipo de entidad afectada. |
| entidad_id | Obligatorio; identificador de la entidad afectada. |
| ocurrido_en | Obligatorio; instante con zona horaria almacenado en UTC. |
| detalle | Opcional; no debe incluir contrasenas ni contenido clinico innecesario. |

La Auditoria es interna y no se muestra en el panel del Administrador del MVP.

## Relaciones y cardinalidades

```mermaid
erDiagram
    USUARIO ||--o| PACIENTE : tiene_perfil
    USUARIO ||--o| MEDICO : tiene_perfil
    ESPECIALIDAD ||--o{ MEDICO : clasifica
    MEDICO ||--o{ DISPONIBILIDAD : publica
    PACIENTE ||--o{ CITA : solicita
    PACIENTE ||--o| ANTECEDENTES_GENERALES : posee
    PACIENTE ||--o| ANTECEDENTES_GINECO : posee_si_aplica
    MEDICO ||--o{ CITA : atiende
    DISPONIBILIDAD ||--o{ CITA : historial_de_reservas
    CITA ||--o| CONSULTA : genera
    CITA ||--o| PRECONSULTA : recopila
    CONSULTA ||--o| SIGNOS_VITALES : registra
    CONSULTA ||--o{ RECETA : incluye
    CITA o|--o{ CITA : reprograma
    USUARIO ||--o{ AUDITORIA : realiza
