# 001.2 - Casos de Uso


## CU-001 - Buscar medico por especialidad y consultar disponibilidad

- **Actor:** Paciente
- **Prioridad:** Must
- **Flujo principal:** El Paciente busca una especialidad, el sistema muestra medicos activos, el Paciente elige uno y consulta sus horarios disponibles.
- **Alternativos:** Si no hay medicos activos o el Medico no tiene disponibilidad, el sistema informa el resultado.

## CU-002 - Solicitar, cancelar o reprogramar cita

- **Actor:** Paciente
- **Prioridad:** Must
- **Flujo principal:** El Paciente elige un Medico y un horario disponible, confirma la solicitud y el sistema crea una cita pendiente. Antes de la fecha/hora, puede cancelarla o moverla a otro horario disponible.
- **Alternativos:** El sistema rechaza horarios ocupados, datos invalidos, reprogramaciones sin disponibilidad y cambios realizados en o despues de la fecha/hora de la cita.

## CU-003 - Gestionar disponibilidad del medico

- **Actor:** Medico
- **Prioridad:** Must
- **Flujo principal:** El Medico registra, modifica o elimina horarios futuros de 30 minutos; el sistema valida solapamientos y publica los horarios validos.
- **Alternativos:** No puede modificar o eliminar un horario que afecte una cita pendiente o aceptada.

## CU-004 - Aceptar, rechazar, cancelar o reprogramar citas

- **Actor:** Medico
- **Prioridad:** Must
- **Flujo principal:** El Medico consulta sus citas pendientes y las acepta o rechaza. Antes de la fecha/hora puede cancelarlas o reprogramarlas a horarios disponibles; el sistema actualiza el estado visible para el Paciente.
- **Alternativos:** No se puede gestionar una cita ya finalizada ni reprogramarla a un horario ocupado.

## CU-005 - Registrar consulta, diagnostico, notas y receta

- **Actor:** Medico
- **Prioridad:** Must
- **Flujo principal:** El Medico accede a una cita aceptada propia, registra la consulta, diagnostico y notas clinicas, y agrega una o mas recetas simples si corresponde. Cada receta incluye medicamento, dosis, via, frecuencia, duracion e indicaciones. El sistema incorpora la consulta al expediente del Paciente.
- **Alternativos:** Se deniega el acceso si la cita no esta aceptada o no pertenece al Medico. La consulta puede cerrarse sin receta.

## CU-006 - Gestionar usuarios, especialidades y citas

- **Actor:** Administrador
- **Prioridad:** Must
- **Flujo principal:** El Administrador crea cuentas de Medicos, gestiona datos no clinicos de usuarios y especialidades, y administra citas con fines operativos. Puede cancelar o reprogramar una cita futura a un horario disponible.
- **Alternativos:** El sistema impide modificar datos clinicos, eliminar una especialidad usada por Medicos activos o alterar el historial de una cita completada.

## CU-007 - Ver metricas basicas

- **Actor:** Administrador
- **Prioridad:** Should
- **Flujo principal:** El Administrador consulta datos agregados: total de pacientes, total de medicos, citas por estado y consultas completadas.
- **Alternativos:** Sin datos, el sistema muestra ceros o informa que no hay informacion.

## CU-008 - Registrarse publicamente como Paciente

- **Actor:** Persona no autenticada
- **Prioridad:** Must
- **Flujo principal:** La persona ingresa los datos requeridos y el sistema crea una cuenta con rol Paciente.
- **Alternativos:** El sistema rechaza intentos de registro publico como Medico o Administrador, y datos incompletos o invalidos.

## Casos limite

- Dos Pacientes intentan solicitar el mismo horario al mismo tiempo.
- Un actor intenta cancelar o reprogramar una cita en o despues de su fecha/hora.
- Un Medico intenta registrar disponibilidad solapada o alterar un horario con cita activa.
- Un Medico intenta registrar una consulta para una cita no aceptada o acceder a un expediente sin relacion.
- Un Paciente intenta ver notas clinicas.
- Un Administrador intenta modificar datos clinicos o eliminar una especialidad en uso.
- Un usuario autenticado intenta acceder a una funcion de otro rol.
