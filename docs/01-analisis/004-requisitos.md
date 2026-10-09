# 001.4 - Requisitos


## Requisitos funcionales

- **RF-001 a RF-003:** Buscar Medicos activos por especialidad y mostrar sus horarios disponibles de 30 minutos.
- **RF-004 a RF-008:** Solicitar citas pendientes, evitar doble reserva, consultar su estado y permitir al Paciente cancelar o reprogramar sus propias citas futuras.
- **RF-009 a RF-011:** Administrar disponibilidad futura del Medico en bloques de 30 minutos, sin solapamientos ni cambios que invaliden citas activas.
- **RF-012 a RF-016:** Consultar, aceptar, rechazar, cancelar o reprogramar citas propias del Medico y reflejar el estado al Paciente.
- **RF-017 a RF-022:** Registrar consulta, diagnostico, notas y recetas de una cita aceptada propia; incorporar el registro al expediente y ocultar notas clinicas al Paciente.
- **RF-023 a RF-028:** Gestionar usuarios no clinicos, crear cuentas de Medicos, gestionar especialidades y citas, y bloquear al Administrador de modificar informacion clinica.
- **RF-029 a RF-030:** Mostrar al Administrador las metricas definidas en forma agregada, sin contenido clinico sensible innecesario.
- **RF-031:** Validar los datos obligatorios definidos para Paciente, Medico, Cita, Consulta y Receta.
- **RF-032:** Registrar recetas simples con medicamento, dosis, via, frecuencia, duracion e indicaciones, sin firma digital ni validez legal.
- **RF-033:** Conservar internamente la auditoria de eventos sensibles sin mostrarla al Administrador en el MVP.
- **RF-034:** Desactivar cuentas sin eliminar sus citas, consultas, recetas ni otros datos clinicos asociados.

## Requisitos no funcionales y seguridad

- **RNF-001:** Autenticar usuarios antes de acceder a funciones protegidas.
- **RNF-002:** Aplicar autorizacion por rol y por relacion entre cita, Medico y expediente.
- **RNF-003:** Proteger confidencialidad e integridad de diagnosticos, notas y recetas.
- **RNF-004:** Prevenir Broken Access Control (OWASP A01) en expedientes, citas y administracion.
- **RNF-005:** Proteger credenciales y datos sensibles en almacenamiento y transmision para evitar Cryptographic Failures (OWASP A02).
- **RNF-006:** Validar entradas y prevenir Injection (OWASP A03).
- **RNF-007:** Aplicar las reglas de seguridad desde el diseno para evitar Insecure Design (OWASP A04).
- **RNF-008:** Evitar configuraciones inseguras que expongan datos o funciones internas (OWASP A05).
- **RNF-009:** Proteger inicio de sesion y sesiones de usuario (OWASP A07).
- **RNF-010:** Registrar eventos sensibles para auditoria y deteccion de uso indebido (OWASP A09).
- **RNF-011:** Mostrar la minima informacion necesaria para cada actor.
- **RNF-012 a RNF-015:** Mantener disponibilidad, rendimiento interactivo, integridad del historial y flujos comprensibles.
