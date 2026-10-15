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
| contrasena_hash | Obligatorio. Nunca se almacena la contrasena en texto plano. |
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
| sexo | Obligatorio: `M` o `F`. |
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
| creado_en | Obligatorio[cite: 8]. |
| actualizado_en | Obligatorio[cite: 8]. |

### Disponibilidad

Representa un bloque futuro que un Medico publica para recibir citas[cite: 8].

| Atributo | Regla |
|---|---|
| id | Identificador unico[cite: 8]. |
| medico_id | Obligatorio y referencia a Medico[cite: 8]. |
| inicio | Obligatorio[cite: 8]. |
| fin | Obligatorio; debe ser exactamente 30 minutos despues de `inicio`[cite: 8]. |
| activa | Obligatorio[cite: 8]. |
| creado_en | Obligatorio[cite: 8]. |
| actualizado_en | Obligatorio[cite: 8]. |

### Cita

Registra la solicitud y el ciclo de vida de una atencion entre un Paciente y un Medico[cite: 8].

| Atributo | Regla |
|---|---|
| id | Identificador unico[cite: 8]. |
| paciente_id | Obligatorio y referencia a Paciente[cite: 8]. |
| medico_id | Obligatorio y referencia a Medico[cite: 8]. |
| disponibilidad_id | Obligatorio y referencia al bloque de Disponibilidad reservado[cite: 8]. |
| inicio | Obligatorio; copia el inicio de la Disponibilidad al reservar para preservar el historial[cite: 8]. |
| fin | Obligatorio; copia el fin de la Disponibilidad al reservar[cite: 8]. |
| estado | Obligatorio: `PENDIENTE`, `ACEPTADA`, `RECHAZADA`, `CANCELADA`, `REPROGRAMADA` o `COMPLETADA`[cite: 8]. |
| cita_origen_id | Opcional; referencia a la Cita reprogramada[cite: 8]. |
| creado_en | Obligatorio[cite: 8]. |
| actualizado_en | Obligatorio[cite: 8]. |

Al reprogramar una Cita se conserva la original con estado `REPROGRAMADA` y se crea una nueva Cita que referencia a la anterior mediante `cita_origen_id`[cite: 8]. Esto preserva la trazabilidad del historial[cite: 8].

### Consulta

Representa el registro clinico generado al finalizar una Cita aceptada[cite: 8]. Adaptado para soportar múltiples formatos de fichas clínicas.

| Atributo | Regla |
|---|---|
| id | Identificador unico[cite: 8]. |
| cita_id | Obligatorio, unico y referencia a Cita[cite: 8]. |
| tipo_ficha | Obligatorio: `ADULTO`, `PRENATAL` o `NEONATO`. |
| motivo_consulta | Obligatorio. |
| historia_actual | Opcional; historia de la enfermedad actual. |
| evaluacion_clinica | Opcional; formato JSONB para almacenar checks de problemas a investigar y signos de peligro. |
| diagnostico | Obligatorio[cite: 8]. |
| observaciones | Opcional. Solo son visibles para el Medico asociado a la Cita. |
| fecha_consulta | Obligatorio[cite: 8]. |
| creado_en | Obligatorio[cite: 8]. |
| actualizado_en | Obligatorio[cite: 8]. |

### Signos_Vitales

Captura las métricas físicas en el momento de la consulta.

| Atributo | Regla |
|---|---|
| id | Identificador unico. |
| consulta_id | Obligatorio, unico y referencia a Consulta. |
| peso_lb | Opcional; decimal. |
| talla_cm | Opcional; decimal. |
| temperatura | Opcional; decimal en °C. |
| presion_arterial | Opcional; formato cadena (ej. "120/80"). |
| frec_cardiaca | Opcional; entero (latidos por minuto). |
| frec_respiratoria | Opcional; entero (respiraciones por minuto). |
| creado_en | Obligatorio. |
| actualizado_en | Obligatorio. |

### Receta

Representa una indicacion medica simple asociada a una Consulta[cite: 8].

| Atributo | Regla |
|---|---|
| id | Identificador unico[cite: 8]. |
| consulta_id | Obligatorio y referencia a Consulta[cite: 8]. |
| medicamento | Obligatorio[cite: 8]. |
| dosis | Obligatorio[cite: 8]. |
| via | Obligatorio[cite: 8]. |
| frecuencia | Obligatorio[cite: 8]. |
| duracion | Obligatorio[cite: 8]. |
| indicaciones | Obligatorio[cite: 8]. |
| creado_en | Obligatorio[cite: 8]. |
| actualizado_en | Obligatorio[cite: 8]. |

Una Consulta puede no tener recetas o tener varias[cite: 8]. La Receta no contiene firma digital ni pretende tener validez legal en el MVP[cite: 8].

### Auditoria

Registra eventos sensibles para trazabilidad interna[cite: 8].

| Atributo | Regla |
|---|---|
| id | Identificador unico[cite: 8]. |
| usuario_id | Obligatorio y referencia al Usuario que ejecuta la accion[cite: 8]. |
| accion | Obligatorio; por ejemplo, `CITA_ACEPTADA` o `CONSULTA_CREADA`[cite: 8]. |
| entidad | Obligatorio; tipo de entidad afectada[cite: 8]. |
| entidad_id | Obligatorio; identificador de la entidad afectada[cite: 8]. |
| ocurrido_en | Obligatorio[cite: 8]. |
| detalle | Opcional; no debe incluir contrasenas ni contenido clinico innecesario[cite: 8]. |

La Auditoria es interna y no se muestra en el panel del Administrador del MVP[cite: 8].

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
    DISPONIBILIDAD ||--o| CITA : se_reserva_en
    CITA ||--o| CONSULTA : genera
    CONSULTA ||--o| SIGNOS_VITALES : registra
    CONSULTA ||--o{ RECETA : incluye
    CITA o|--o{ CITA : reprograma
    USUARIO ||--o{ AUDITORIA : realiza