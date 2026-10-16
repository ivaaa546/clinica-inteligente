# 001.1 - Alcance, Actores y Decisiones

## Proposito

Definir el alcance funcional inicial del MVP del Sistema de Telemedicina para conectar pacientes y medicos, permitir la solicitud y gestion de citas, registrar consultas clinicas estructuradas y emitir recetas simples asociadas a una consulta, manteniendo control de acceso por rol y proteccion de datos clinicos.

## Alcance incluido

- Roles: Paciente, Medico y Administrador.
- Busqueda de medicos por especialidad y visualizacion de sus horarios disponibles.
- Registro publico de Pacientes; las cuentas de Medicos las crea el Administrador.
- Solicitud de citas en horarios de 30 minutos.
- Preconsulta previa a la atencion medica para registrar y validar datos basicos, motivo de consulta y antecedentes iniciales.
- Aceptacion, rechazo, cancelacion y reprogramacion de citas antes de su fecha/hora.
- Registro estructurado de consultas mediante 3 tipos de fichas clínicas (Adulto, Prenatal/Postparto, Neonato), incluyendo signos vitales, motivo de consulta, antecedentes estructurados y evaluación de problemas.
- Expediente clinico basico con historial de consultas y antecedentes.
- Gestion administrativa de usuarios, especialidades y citas.
- Metricas: total de pacientes, total de medicos, citas por estado y consultas completadas.
- Control de acceso por rol y relacion entre Medico, Paciente y Cita.

## Fuera del alcance

- Videollamada, chat y pagos.
- Integraciones externas, aplicacion movil nativa y notificaciones por SMS o WhatsApp.
- Firma digital avanzada, interoperabilidad clinica, laboratorios, estudios, imagenes o adjuntos.
- Facturacion, seguros y reembolsos.
- Modificacion de diagnosticos, registros clinicos o recetas por el Administrador.

## Actores y permisos

### AC-001 - Paciente

- Puede registrarse publicamente, administrar su perfil, buscar medicos y consultar horarios disponibles.
- Puede solicitar, cancelar o reprogramar sus propias citas antes de la fecha/hora, respetando disponibilidad.
- Completa o actualiza la preconsulta de sus propias citas antes de la atencion medica.
- Puede ver sus citas, diagnosticos y recetas propias.
- No puede ver registros clinicos detallados, expedientes de terceros ni modificar datos clinicos.

### AC-002 - Medico

- Su cuenta es creada por el Administrador.
- Puede administrar disponibilidad futura en bloques de 30 minutos.
- Puede aceptar, rechazar, cancelar o reprogramar sus citas antes de la fecha/hora, respetando disponibilidad.
- Puede consultar expedientes de pacientes asociados a sus propias citas y registrar consultas estructuradas, diagnosticos y recetas.
- Puede consultar la preconsulta de una cita propia, pero no editarla en nombre del Paciente.
- No puede ver expedientes sin relacion con sus citas ni gestionar usuarios, especialidades globales o metricas.

### AC-003 - Administrador

- Puede crear cuentas de Medicos y gestionar datos no clinicos de usuarios.
- Puede gestionar especialidades y citas con fines operativos, incluida su cancelacion o reprogramacion antes de la fecha/hora.
- Puede consultar las metricas definidas para el MVP.
- No puede crear, editar ni eliminar diagnosticos, registros clinicos, recetas o expedientes clinicos.

## Decisiones registradas

- **DR-001:** Solo los Pacientes pueden registrarse publicamente; las cuentas de Medicos las crea el Administrador.
- **DR-002:** La disponibilidad de los Medicos usa bloques de 30 minutos.
- **DR-003:** Paciente, Medico y Administrador pueden cancelar o reprogramar una cita antes de su fecha/hora, respetando permisos y disponibilidad.
- **DR-004:** Los registros clinicos detallados (signos vitales, examen físico, notas) solo son visibles para el Medico; el Paciente puede ver diagnostico y recetas propias.
- **DR-005:** Las metricas del Administrador son total de pacientes, total de medicos, citas por estado y consultas completadas.
- **DR-006:** Los datos obligatorios de Paciente son nombre, apellidos, correo, contrasena, fecha de nacimiento, sexo, telefono, direccion, ocupacion y estado migratorio. Los de Medico son nombre, apellidos, correo, contrasena, numero profesional, especialidad y telefono.
- **DR-007:** Una Cita requiere paciente, medico, fecha, hora y estado. Una Consulta requiere cita, tipo de ficha, motivo de consulta, signos vitales obligatorios, diagnostico y fecha. Una Receta requiere consulta, medicamento, dosis, via, frecuencia, duracion e indicaciones.
- **DR-008:** Las recetas del MVP son simples, sin firma digital ni validez legal.
- **DR-009:** La auditoria se conserva como registro interno de eventos sensibles y no se muestra al Administrador en el MVP.
- **DR-010:** Los datos clinicos no se eliminan; las cuentas pueden desactivarse, pero se conservan sus citas, consultas y recetas para mantener el historial.
- **DR-011:** Todas las fechas y horas se almacenan con zona horaria en UTC. La interfaz las presenta en la zona horaria configurada para la clinica.
- **DR-012:** La reserva de una cita se confirma en una transaccion y la base de datos impide mas de una cita activa (`PENDIENTE` o `ACEPTADA`) para el mismo bloque de disponibilidad.
- **DR-013:** Los signos vitales obligatorios para cerrar cualquier ficha del MVP son peso, talla, temperatura, presion arterial, frecuencia cardiaca y frecuencia respiratoria. Los campos especificos de cada ficha se agregaran solo cuando sean definidos y aprobados.
- **DR-014:** Los antecedentes se actualizan solo por el Medico relacionado con una cita del Paciente. Cada actualizacion queda atribuida en la auditoria; el Administrador no puede leer ni editar su contenido.
- **DR-015:** El sexo registrado para este MVP se limita a `M`, `F` o `NO_ESPECIFICADO`; se usa exclusivamente como dato clinico-administrativo y no determina por si solo la elegibilidad de una ficha. El Medico selecciona la ficha pertinente conforme a la informacion clinica disponible.
- **DR-016:** La preconsulta pertenece a una Cita y la completa el Paciente. Puede modificarse hasta que el Medico registre la Consulta; despues queda solo para lectura dentro del expediente autorizado.
- **DR-017:** Las contrasenas se almacenan exclusivamente mediante hashes Argon2id. Nunca se almacenan, registran ni devuelven en texto plano.
