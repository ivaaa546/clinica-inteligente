# 001.1 - Alcance, Actores y Decisiones


## Proposito

Definir el alcance funcional inicial del MVP del Sistema de Telemedicina para conectar pacientes y medicos, permitir la solicitud y gestion de citas, registrar consultas clinicas basicas y emitir recetas simples asociadas a una consulta, manteniendo control de acceso por rol y proteccion de datos clinicos.

## Alcance incluido

- Roles: Paciente, Medico y Administrador.
- Busqueda de medicos por especialidad y visualizacion de sus horarios disponibles.
- Registro publico de Pacientes; las cuentas de Medicos las crea el Administrador.
- Solicitud de citas en horarios de 30 minutos.
- Aceptacion, rechazo, cancelacion y reprogramacion de citas antes de su fecha/hora.
- Registro de consultas, diagnosticos, notas clinicas y recetas simples.
- Expediente clinico basico con historial de consultas.
- Gestion administrativa de usuarios, especialidades y citas.
- Metricas: total de pacientes, total de medicos, citas por estado y consultas completadas.
- Control de acceso por rol y relacion entre Medico, Paciente y Cita.

## Fuera del alcance

- Videollamada, chat y pagos.
- Integraciones externas, aplicacion movil nativa y notificaciones por SMS o WhatsApp.
- Firma digital avanzada, interoperabilidad clinica, laboratorios, estudios, imagenes o adjuntos.
- Facturacion, seguros y reembolsos.
- Modificacion de diagnosticos, notas clinicas o recetas por el Administrador.

## Actores y permisos

### AC-001 - Paciente

- Puede registrarse publicamente, administrar su perfil, buscar medicos y consultar horarios disponibles.
- Puede solicitar, cancelar o reprogramar sus propias citas antes de la fecha/hora, respetando disponibilidad.
- Puede ver sus citas, diagnosticos y recetas propias.
- No puede ver notas clinicas, expedientes de terceros ni modificar datos clinicos.

### AC-002 - Medico

- Su cuenta es creada por el Administrador.
- Puede administrar disponibilidad futura en bloques de 30 minutos.
- Puede aceptar, rechazar, cancelar o reprogramar sus citas antes de la fecha/hora, respetando disponibilidad.
- Puede consultar expedientes de pacientes asociados a sus propias citas y registrar consultas, diagnosticos, notas y recetas.
- No puede ver expedientes sin relacion con sus citas ni gestionar usuarios, especialidades globales o metricas.

### AC-003 - Administrador

- Puede crear cuentas de Medicos y gestionar datos no clinicos de usuarios.
- Puede gestionar especialidades y citas con fines operativos, incluida su cancelacion o reprogramacion antes de la fecha/hora.
- Puede consultar las metricas definidas para el MVP.
- No puede crear, editar ni eliminar diagnosticos, notas clinicas, recetas o expedientes clinicos.

## Decisiones registradas

- **DR-001:** Solo los Pacientes pueden registrarse publicamente; las cuentas de Medicos las crea el Administrador.
- **DR-002:** La disponibilidad de los Medicos usa bloques de 30 minutos.
- **DR-003:** Paciente, Medico y Administrador pueden cancelar o reprogramar una cita antes de su fecha/hora, respetando permisos y disponibilidad.
- **DR-004:** Las notas clinicas solo son visibles para el Medico; el Paciente puede ver diagnostico y recetas propias, no notas clinicas.
- **DR-005:** Las metricas del Administrador son total de pacientes, total de medicos, citas por estado y consultas completadas.
- **DR-006:** Los datos obligatorios de Paciente son nombre, apellidos, correo, contrasena, fecha de nacimiento, telefono, alergias y antecedentes. Los de Medico son nombre, apellidos, correo, contrasena, numero profesional, especialidad y telefono.
- **DR-007:** Una Cita requiere paciente, medico, fecha, hora y estado. Una Consulta requiere cita, diagnostico, notas clinicas y fecha. Una Receta requiere consulta, medicamento, dosis, via, frecuencia, duracion e indicaciones.
- **DR-008:** Las recetas del MVP son simples, sin firma digital ni validez legal.
- **DR-009:** La auditoria se conserva como registro interno de eventos sensibles y no se muestra al Administrador en el MVP.
- **DR-010:** Los datos clinicos no se eliminan; las cuentas pueden desactivarse, pero se conservan sus citas, consultas y recetas para mantener el historial.

