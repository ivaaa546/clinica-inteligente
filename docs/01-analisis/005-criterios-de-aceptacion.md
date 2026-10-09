# 001.5 - Criterios de Aceptacion


- [ ] **CA-001:** Al buscar una especialidad con Medicos activos, el Paciente ve los Medicos correspondientes; sin resultados, el sistema lo informa.
- [ ] **CA-002:** Al consultar un Medico con disponibilidad, el Paciente ve horarios en bloques de 30 minutos.
- [ ] **CA-003:** Al solicitar un horario disponible, el sistema crea una cita pendiente y evita reservas dobles.
- [ ] **CA-004:** Un Paciente puede cancelar o reprogramar una cita futura propia solo a un horario disponible.
- [ ] **CA-005:** El Medico publica disponibilidad futura no solapada de 30 minutos y no puede invalidar citas activas.
- [ ] **CA-006:** El Medico asignado puede aceptar, rechazar, cancelar o reprogramar una cita futura propia; el Paciente ve el cambio de estado.
- [ ] **CA-007:** El Medico de una cita aceptada registra consulta, diagnostico, notas y recetas; la consulta queda en el expediente del Paciente.
- [ ] **CA-008:** Un Medico sin relacion con un Paciente no puede ver su expediente.
- [ ] **CA-009:** El Paciente ve diagnosticos y recetas propios, pero no notas clinicas.
- [ ] **CA-010:** El Administrador solo gestiona datos no clinicos, crea cuentas de Medicos y no puede modificar datos clinicos.
- [ ] **CA-011:** El registro publico solo permite crear cuentas de Paciente.
- [ ] **CA-012:** El Administrador puede gestionar citas futuras y consultar las metricas definidas sin exponer contenido clinico sensible.
- [ ] **CA-013:** Usuarios no autenticados o sin permisos no acceden a funciones protegidas.
- [ ] **CA-014:** Las acciones sensibles quedan registradas para auditoria.
- [ ] **CA-015:** El sistema rechaza el registro de Paciente, Medico, Cita, Consulta o Receta cuando falta alguno de sus datos obligatorios.
- [ ] **CA-016:** Una receta registrada contiene medicamento, dosis, via, frecuencia, duracion e indicaciones, sin firma digital ni validez legal.
- [ ] **CA-017:** La auditoria de eventos sensibles se registra internamente y no esta disponible como vista para el Administrador.
- [ ] **CA-018:** Al desactivar una cuenta, sus citas, consultas y recetas permanecen disponibles en el historial clinico autorizado.

## Definition of Done

- Todos los criterios de aceptacion estan cumplidos.
- No existen preguntas abiertas bloqueantes.
- La funcionalidad puede demostrarse de extremo a extremo para Paciente, Medico y Administrador.
- La documentacion esta actualizada y se respeta el alcance del MVP.
- Los controles de acceso impiden que el Administrador modifique datos clinicos.
