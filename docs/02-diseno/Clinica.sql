--Esto es una propuesta para la base de datos, revisenlo y me avisan por cualquier cambio.


-- 1. CREACIÓN DE ENUMS, los tipos de datos 
CREATE TYPE rol_usuario AS ENUM ('PACIENTE', 'MEDICO', 'ADMINISTRADOR');
CREATE TYPE sexo_paciente AS ENUM ('M', 'F', 'NO_ESPECIFICADO');
CREATE TYPE tipo_ficha_clinica AS ENUM ('ADULTO', 'PRENATAL', 'NEONATO');
CREATE TYPE estado_cita AS ENUM ('PENDIENTE', 'ACEPTADA', 'RECHAZADA', 'CANCELADA', 'REPROGRAMADA', 'COMPLETADA');

-- 2. CREACIÓN DE TABLAS


CREATE TABLE usuario (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    correo VARCHAR(150) UNIQUE NOT NULL,
    contrasena_hash VARCHAR(255) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    rol rol_usuario NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE paciente (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    fecha_nacimiento DATE NOT NULL,
    sexo sexo_paciente NOT NULL,
    direccion VARCHAR(255),
    ocupacion VARCHAR(150),
    poblacion_migrante BOOLEAN DEFAULT FALSE NOT NULL,
    nombre_responsable VARCHAR(200),
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE antecedentes_generales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID UNIQUE NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    medicos JSONB,
    quirurgicos TEXT,
    familiares JSONB,
    habitos JSONB,
    alergias TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE antecedentes_gineco_obstetricos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID UNIQUE NOT NULL REFERENCES paciente(id) ON DELETE CASCADE,
    fur DATE,
    gestas INT DEFAULT 0 NOT NULL,
    partos INT DEFAULT 0 NOT NULL,
    cesareas INT DEFAULT 0 NOT NULL,
    abortos INT DEFAULT 0 NOT NULL,
    hijos_vivos INT DEFAULT 0 NOT NULL,
    planificacion VARCHAR(150),
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE especialidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) UNIQUE NOT NULL,
    activa BOOLEAN DEFAULT TRUE NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE medico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID UNIQUE NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    especialidad_id UUID NOT NULL REFERENCES especialidad(id),
    numero_profesional VARCHAR(50) UNIQUE NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE disponibilidad (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medico_id UUID NOT NULL REFERENCES medico(id) ON DELETE CASCADE,
    inicio TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    activa BOOLEAN DEFAULT TRUE NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_disponibilidad_medico_inicio UNIQUE (medico_id, inicio),
    CONSTRAINT ck_disponibilidad_duracion CHECK (fin = inicio + INTERVAL '30 minutes')
);

CREATE TABLE cita (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES paciente(id),
    medico_id UUID NOT NULL REFERENCES medico(id),
    disponibilidad_id UUID NOT NULL REFERENCES disponibilidad(id),
    inicio TIMESTAMPTZ NOT NULL,
    fin TIMESTAMPTZ NOT NULL,
    estado estado_cita NOT NULL,
    cita_origen_id UUID REFERENCES cita(id),
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE consulta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID UNIQUE NOT NULL REFERENCES cita(id),
    tipo_ficha tipo_ficha_clinica NOT NULL,
    motivo_consulta TEXT NOT NULL,
    historia_actual TEXT,
    evaluacion_clinica JSONB,
    diagnostico TEXT NOT NULL,
    observaciones TEXT,
    fecha_consulta TIMESTAMPTZ NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE signos_vitales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID UNIQUE NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    peso_lb DECIMAL(5,2) NOT NULL,
    talla_cm DECIMAL(5,2) NOT NULL,
    temperatura DECIMAL(4,2) NOT NULL,
    presion_arterial VARCHAR(20) NOT NULL,
    frec_cardiaca INT NOT NULL,
    frec_respiratoria INT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE receta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consulta_id UUID NOT NULL REFERENCES consulta(id) ON DELETE CASCADE,
    medicamento VARCHAR(150) NOT NULL,
    dosis VARCHAR(100) NOT NULL,
    via VARCHAR(50) NOT NULL,
    frecuencia VARCHAR(100) NOT NULL,
    duracion VARCHAR(50) NOT NULL,
    indicaciones TEXT NOT NULL,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE preconsulta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cita_id UUID UNIQUE NOT NULL REFERENCES cita(id),
    motivo_consulta TEXT NOT NULL,
    antecedentes_iniciales JSONB,
    creado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    actualizado_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES usuario(id),
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(50) NOT NULL,
    entidad_id UUID NOT NULL,
    ocurrido_en TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    detalle TEXT
);


-- 3. ÍNDICES DE RENDIMIENTO. Recomendados en el modelo


CREATE INDEX idx_medico_especialidad ON medico(especialidad_id);
CREATE INDEX idx_cita_medico_inicio_estado ON cita(medico_id, inicio, estado);
CREATE INDEX idx_cita_paciente_inicio ON cita(paciente_id, inicio);
CREATE UNIQUE INDEX uq_cita_activa_por_disponibilidad
    ON cita(disponibilidad_id)
    WHERE estado IN ('PENDIENTE', 'ACEPTADA');
CREATE INDEX idx_receta_consulta ON receta(consulta_id);
CREATE INDEX idx_auditoria_usuario_fecha ON auditoria(usuario_id, ocurrido_en);


-- 4. FUNCIÓN Y TRIGGERS PARA 'actualizado_en'
CREATE OR REPLACE FUNCTION actualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.actualizado_en = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_usuario_actualizado BEFORE UPDATE ON usuario FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_paciente_actualizado BEFORE UPDATE ON paciente FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_ant_generales_actualizado BEFORE UPDATE ON antecedentes_generales FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_ant_gineco_actualizado BEFORE UPDATE ON antecedentes_gineco_obstetricos FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_especialidad_actualizado BEFORE UPDATE ON especialidad FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_medico_actualizado BEFORE UPDATE ON medico FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_disponibilidad_actualizado BEFORE UPDATE ON disponibilidad FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_cita_actualizado BEFORE UPDATE ON cita FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_consulta_actualizado BEFORE UPDATE ON consulta FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_signos_actualizado BEFORE UPDATE ON signos_vitales FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_receta_actualizado BEFORE UPDATE ON receta FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
CREATE TRIGGER trg_preconsulta_actualizado BEFORE UPDATE ON preconsulta FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp();
