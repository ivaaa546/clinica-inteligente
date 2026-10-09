# 001.3 - Reglas de Negocio


- **RN-001 - Roles obligatorios:** Todo usuario tiene exactamente un rol: Paciente, Medico o Administrador.
- **RN-002 - Registro de cuentas:** Solo los Pacientes se registran publicamente; el Administrador crea cuentas de Medicos.
- **RN-003 - Especialidad del medico:** Todo Medico requiere una especialidad para aparecer en busquedas.
- **RN-004 - Bloques de disponibilidad:** La disponibilidad del Medico se define en bloques de 30 minutos.
- **RN-005 - Horarios disponibles:** Un Paciente solo solicita citas en horarios publicados por el Medico.
- **RN-006 - No doble reserva:** Un horario de un Medico no puede tener mas de una cita activa a la vez.
- **RN-007 - Estados de cita:** Una cita puede estar pendiente, aceptada, rechazada, cancelada, reprogramada o completada.
- **RN-008 - Aprobacion medica:** Solo el Medico asignado acepta o rechaza su cita.
- **RN-009 - Cancelacion y reprogramacion:** Paciente, Medico y Administrador pueden cancelar o reprogramar una cita antes de su fecha/hora, respetando permisos y disponibilidad.
- **RN-010 - Registro clinico restringido:** Solo el Medico de una cita aceptada registra su consulta, diagnostico, notas y recetas.
- **RN-011 - Acceso a expediente:** Un Medico solo ve expedientes de Pacientes asociados a sus propias citas.
- **RN-012 - Visibilidad de notas:** Las notas clinicas son exclusivas del Medico. El Paciente puede ver sus diagnosticos y recetas, no las notas.
- **RN-013 - Administrador sin edicion clinica:** El Administrador no crea, edita ni elimina diagnosticos, notas o recetas.
- **RN-014 - Historial clinico:** Toda consulta registrada queda asociada al expediente del Paciente.
- **RN-015 - Receta asociada a consulta:** Toda receta pertenece a una consulta registrada.
- **RN-016 - Metricas administrativas:** Se muestran total de pacientes, total de medicos, citas por estado y consultas completadas.
- **RN-017 - Trazabilidad:** Las acciones sensibles sobre citas, usuarios y datos clinicos deben atribuirse al usuario que las realizo.
- **RN-018 - Datos obligatorios:** Paciente, Medico, Cita, Consulta y Receta deben contener los datos obligatorios definidos en DR-006 y DR-007 antes de registrarse.
- **RN-019 - Receta simple:** Las recetas del MVP no tienen firma digital ni validez legal y deben incluir medicamento, dosis, via, frecuencia, duracion e indicaciones.
- **RN-020 - Auditoria interna:** Los eventos sensibles se registran internamente y no se exponen al Administrador en el MVP.
- **RN-021 - Retencion clinica:** Los datos clinicos no se eliminan. Al desactivar una cuenta se conservan sus citas, consultas y recetas para preservar el historial.
