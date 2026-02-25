-- =====================================================
-- TABLA MATERIAS
-- =====================================================

CREATE SEQUENCE materias_id_seq START 1 INCREMENT 1;

CREATE TABLE materias (
    id BIGINT PRIMARY KEY DEFAULT nextval('materias_id_seq'),

    idcurso BIGINT NOT NULL REFERENCES cursos(id),

    nombre VARCHAR(255) NOT NULL,

    uid_profesor VARCHAR(50) NOT NULL,

    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materias_profesor
ON materias (uid_profesor);

CREATE INDEX idx_materias_curso
ON materias (idcurso);

-- =====================================================
-- TABLA HORARIO_PROFESORADO
-- =====================================================

CREATE SEQUENCE horario_profesorado_id_seq START 1 INCREMENT 1;

CREATE TABLE horario_profesorado (
    id BIGINT PRIMARY KEY DEFAULT nextval('horario_profesorado_id_seq'),

    uid VARCHAR(50) NOT NULL,

    dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 1 AND 5),

    idperiodo INTEGER NOT NULL REFERENCES periodos_horarios(id),

    tipo VARCHAR(30) NOT NULL,
    -- 'lectiva', 'guardia', 'recreo', 'libre', etc.

    gidnumber INTEGER,   -- solo si lectiva (grupo LDAP)
    idmateria BIGINT REFERENCES materias(id),

    idestancia INTEGER,  -- aula

    curso_academico VARCHAR(9) NOT NULL,  -- Ej: '2025-26'

    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_horario_uid
ON horario_profesorado (uid);

CREATE INDEX idx_horario_dia_periodo
ON horario_profesorado (dia_semana, idperiodo);

CREATE INDEX idx_horario_curso
ON horario_profesorado (curso_academico);

CREATE INDEX idx_horario_uid_dia_curso
ON horario_profesorado (uid, dia_semana, curso_academico);

-- =====================================================
-- TABLA AUSENCIAS_PROFESORADO
-- =====================================================

CREATE SEQUENCE ausencias_profesorado_id_seq START 1 INCREMENT 1;

CREATE TABLE ausencias_profesorado (
    id BIGINT PRIMARY KEY DEFAULT nextval('ausencias_profesorado_id_seq'),

    uid_profesor VARCHAR(50) NOT NULL,

    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NULL,

    idperiodo_inicio INTEGER REFERENCES periodos_horarios(id),
    idperiodo_fin INTEGER REFERENCES periodos_horarios(id),

    tipo_ausencia VARCHAR(100),

    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    creada_por VARCHAR(50),

    CONSTRAINT chk_fechas_validas
        CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
);

CREATE INDEX idx_ausencias_profesor
ON ausencias_profesorado (uid_profesor);

CREATE INDEX idx_ausencias_rango
ON ausencias_profesorado (fecha_inicio, fecha_fin);

-- =====================================================
-- TABLA GUARDIAS_ASIGNADAS
-- =====================================================

CREATE SEQUENCE guardias_asignadas_id_seq START 1 INCREMENT 1;

CREATE TABLE guardias_asignadas (
    id BIGINT PRIMARY KEY DEFAULT nextval('guardias_asignadas_id_seq'),

    fecha DATE NOT NULL,

    idperiodo INTEGER NOT NULL REFERENCES periodos_horarios(id),

    uid_profesor_ausente VARCHAR(50) NOT NULL,
    uid_profesor_cubridor VARCHAR(50) NOT NULL,

    forzada BOOLEAN DEFAULT FALSE,
    generada_automaticamente BOOLEAN DEFAULT TRUE,

    uid_asignador VARCHAR(50),

    estado VARCHAR(20) DEFAULT 'activa',
    -- 'activa' | 'anulada'

    confirmada BOOLEAN DEFAULT TRUE,

    creada_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guardias_fecha
ON guardias_asignadas (fecha);

CREATE INDEX idx_guardias_fecha_periodo
ON guardias_asignadas (fecha, idperiodo);

CREATE INDEX idx_guardias_cubridor
ON guardias_asignadas (uid_profesor_cubridor);

CREATE INDEX idx_guardias_ausente
ON guardias_asignadas (uid_profesor_ausente);

CREATE INDEX idx_guardias_estado
ON guardias_asignadas (estado);