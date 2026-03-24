--
-- PostgreSQL database dump
--

\restrict lYYJ05VYnGkrREql9x1ctpKBDsPQ0nOrqsV23ajgLq05dHvEGPFbE8MIDMi7RSJ

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: actualizar_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.actualizar_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   NEW.updated_at := now();
   RETURN NEW;
END;
$$;


ALTER FUNCTION public.actualizar_updated_at() OWNER TO postgres;

--
-- Name: api_cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.api_cursos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.api_cursos_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: asuntos_permitidos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asuntos_permitidos (
    id integer NOT NULL,
    uid character varying NOT NULL,
    fecha date NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.asuntos_permitidos OWNER TO postgres;

--
-- Name: asuntos_permitidos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asuntos_permitidos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.asuntos_permitidos_id_seq OWNER TO postgres;

--
-- Name: asuntos_permitidos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asuntos_permitidos_id_seq OWNED BY public.asuntos_permitidos.id;


--
-- Name: asuntos_propios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asuntos_propios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.asuntos_propios_id_seq OWNER TO postgres;

--
-- Name: ausencias_profesorado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ausencias_profesorado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ausencias_profesorado_id_seq OWNER TO postgres;

--
-- Name: ausencias_profesorado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ausencias_profesorado (
    id bigint DEFAULT nextval('public.ausencias_profesorado_id_seq'::regclass) NOT NULL,
    uid_profesor character varying(50) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    idperiodo_inicio integer,
    idperiodo_fin integer,
    tipo_ausencia character varying(100),
    creada_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    creada_por character varying(50),
    CONSTRAINT chk_fechas_validas CHECK (((fecha_fin IS NULL) OR (fecha_fin >= fecha_inicio)))
);


ALTER TABLE public.ausencias_profesorado OWNER TO postgres;

--
-- Name: avisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.avisos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.avisos_id_seq OWNER TO postgres;

--
-- Name: avisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.avisos (
    id integer DEFAULT nextval('public.avisos_id_seq'::regclass) NOT NULL,
    modulo text NOT NULL,
    emails text[] NOT NULL,
    app_password character varying
);


ALTER TABLE public.avisos OWNER TO postgres;

--
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id bigint NOT NULL,
    curso character varying NOT NULL
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- Name: cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.cursos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.cursos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    uid character varying NOT NULL,
    tipo_usuario integer DEFAULT 0 NOT NULL,
    dni character varying NOT NULL,
    asuntos_propios integer NOT NULL,
    tipo_empleado character varying NOT NULL,
    jornada integer DEFAULT 0 NOT NULL,
    email character varying NOT NULL,
    telefono character varying NOT NULL,
    cuerpo character varying,
    grupo character varying,
    personal character varying,
    baja boolean DEFAULT false NOT NULL
);


ALTER TABLE public.empleados OWNER TO postgres;

--
-- Name: estancias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estancias (
    id integer NOT NULL,
    planta text NOT NULL,
    codigo text NOT NULL,
    descripcion text NOT NULL,
    totalllaves integer DEFAULT 1 NOT NULL,
    coordenadas_json jsonb NOT NULL,
    armario character varying NOT NULL,
    codigollave character varying NOT NULL,
    reservable boolean DEFAULT false NOT NULL,
    tipoestancia character varying,
    numero_ordenadores integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.estancias OWNER TO postgres;

--
-- Name: estancias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estancias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.estancias_id_seq OWNER TO postgres;

--
-- Name: estancias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estancias_id_seq OWNED BY public.estancias.id;


--
-- Name: extraescolares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extraescolares_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.extraescolares_id_seq OWNER TO postgres;

--
-- Name: extraescolares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.extraescolares (
    id integer DEFAULT nextval('public.extraescolares_id_seq'::regclass) NOT NULL,
    uid character varying NOT NULL,
    gidnumber integer NOT NULL,
    cursos_gids integer[] NOT NULL,
    tipo character varying(20) NOT NULL,
    titulo character varying(200) NOT NULL,
    descripcion text NOT NULL,
    fecha_inicio timestamp without time zone NOT NULL,
    fecha_fin timestamp without time zone NOT NULL,
    idperiodo_inicio bigint,
    idperiodo_fin bigint,
    estado smallint DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    responsables_uids character varying[] NOT NULL,
    ubicacion text NOT NULL,
    coords jsonb NOT NULL,
    erasmus boolean DEFAULT false NOT NULL,
    updated_by character varying
);


ALTER TABLE public.extraescolares OWNER TO postgres;

--
-- Name: guardias_asignadas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.guardias_asignadas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.guardias_asignadas_id_seq OWNER TO postgres;

--
-- Name: guardias_asignadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.guardias_asignadas (
    id bigint DEFAULT nextval('public.guardias_asignadas_id_seq'::regclass) NOT NULL,
    fecha date NOT NULL,
    idperiodo integer NOT NULL,
    uid_profesor_ausente character varying(50) NOT NULL,
    uid_profesor_cubridor character varying(50) NOT NULL,
    forzada boolean DEFAULT false,
    generada_automaticamente boolean DEFAULT true,
    uid_asignador character varying(50),
    estado character varying(20) DEFAULT 'activa'::character varying,
    confirmada boolean DEFAULT true,
    creada_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.guardias_asignadas OWNER TO postgres;

--
-- Name: horario_profesorado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.horario_profesorado_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.horario_profesorado_id_seq OWNER TO postgres;

--
-- Name: horario_profesorado; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.horario_profesorado (
    id bigint DEFAULT nextval('public.horario_profesorado_id_seq'::regclass) NOT NULL,
    uid character varying(50) NOT NULL,
    dia_semana integer NOT NULL,
    idperiodo integer NOT NULL,
    tipo character varying(30) NOT NULL,
    gidnumber integer[],
    idmateria bigint,
    idestancia integer,
    curso_academico character varying(9) NOT NULL,
    creado_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT horario_profesorado_dia_semana_check CHECK (((dia_semana >= 1) AND (dia_semana <= 5)))
);


ALTER TABLE public.horario_profesorado OWNER TO postgres;

--
-- Name: libros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libros (
    id bigint NOT NULL,
    idcurso bigint NOT NULL,
    libro character varying NOT NULL,
    idmateria bigint
);


ALTER TABLE public.libros OWNER TO postgres;

--
-- Name: libros_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.libros ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.libros_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: materias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.materias_id_seq OWNER TO postgres;

--
-- Name: materias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materias (
    id bigint DEFAULT nextval('public.materias_id_seq'::regclass) NOT NULL,
    nombre character varying(255) NOT NULL,
    creada_en timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.materias OWNER TO postgres;

--
-- Name: perfiles_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfiles_usuario (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    perfil character varying(50) NOT NULL
);


ALTER TABLE public.perfiles_usuario OWNER TO postgres;

--
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.perfiles_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.perfiles_usuario_id_seq OWNER TO postgres;

--
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfiles_usuario_id_seq OWNED BY public.perfiles_usuario.id;


--
-- Name: periodos_horarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.periodos_horarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.periodos_horarios_id_seq OWNER TO postgres;

--
-- Name: periodos_horarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.periodos_horarios (
    id integer DEFAULT nextval('public.periodos_horarios_id_seq'::regclass) NOT NULL,
    nombre character varying NOT NULL,
    inicio time without time zone NOT NULL,
    fin time without time zone NOT NULL
);


ALTER TABLE public.periodos_horarios OWNER TO postgres;

--
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    id integer DEFAULT nextval('public.asuntos_propios_id_seq'::regclass) NOT NULL,
    uid character varying NOT NULL,
    fecha date NOT NULL,
    descripcion text NOT NULL,
    estado integer DEFAULT 0 NOT NULL,
    tipo integer,
    created_at timestamp with time zone DEFAULT now(),
    idperiodo_inicio integer,
    idperiodo_fin integer,
    dia_completo boolean DEFAULT true NOT NULL
);


ALTER TABLE public.permisos OWNER TO postgres;

--
-- Name: prestamos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prestamos (
    id bigint NOT NULL,
    uid character varying NOT NULL,
    esalumno boolean DEFAULT true,
    doc_compromiso integer DEFAULT 0,
    fechaentregadoc date,
    fecharecepciondoc date,
    iniciocurso boolean DEFAULT false NOT NULL
);


ALTER TABLE public.prestamos OWNER TO postgres;

--
-- Name: prestamos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.prestamos ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.prestamos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: prestamos_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prestamos_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.prestamos_items_id_seq OWNER TO postgres;

--
-- Name: prestamos_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prestamos_items (
    id bigint DEFAULT nextval('public.prestamos_items_id_seq'::regclass) NOT NULL,
    idprestamo bigint NOT NULL,
    idlibro bigint NOT NULL,
    fechaentrega date,
    fechadevolucion date,
    devuelto boolean DEFAULT false NOT NULL,
    entregado boolean DEFAULT false NOT NULL
);


ALTER TABLE public.prestamos_items OWNER TO postgres;

--
-- Name: prestamos_llaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prestamos_llaves (
    id integer NOT NULL,
    idestancia integer NOT NULL,
    unidades integer DEFAULT 1 NOT NULL,
    fechaentrega timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fechadevolucion timestamp with time zone,
    uid character varying NOT NULL,
    devuelta boolean NOT NULL
);


ALTER TABLE public.prestamos_llaves OWNER TO postgres;

--
-- Name: prestamos_llaves_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.prestamos_llaves ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.prestamos_llaves_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reservas_estancias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_estancias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reservas_estancias_id_seq OWNER TO postgres;

--
-- Name: reservas_estancias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas_estancias (
    id integer DEFAULT nextval('public.reservas_estancias_id_seq'::regclass) NOT NULL,
    idestancia bigint NOT NULL,
    idperiodo_inicio bigint NOT NULL,
    idperiodo_fin bigint NOT NULL,
    uid character varying NOT NULL,
    fecha date,
    descripcion text NOT NULL,
    idrepeticion integer
);


ALTER TABLE public.reservas_estancias OWNER TO postgres;

--
-- Name: reservas_estancias_repeticion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_estancias_repeticion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reservas_estancias_repeticion_id_seq OWNER TO postgres;

--
-- Name: reservas_estancias_repeticion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas_estancias_repeticion (
    id integer DEFAULT nextval('public.reservas_estancias_repeticion_id_seq'::regclass) NOT NULL,
    uid character varying(50) NOT NULL,
    profesor character varying(50) NOT NULL,
    idestancia integer NOT NULL,
    idperiodo_inicio integer NOT NULL,
    idperiodo_fin integer NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    fecha_desde date NOT NULL,
    fecha_hasta date NOT NULL,
    descripcion text,
    frecuencia character varying(10) NOT NULL,
    dias_semana integer[],
    CONSTRAINT reservas_estancias_repeticion_frecuencia_check CHECK (((frecuencia)::text = ANY (ARRAY[('diaria'::character varying)::text, ('semanal'::character varying)::text, ('mensual'::character varying)::text])))
);


ALTER TABLE public.reservas_estancias_repeticion OWNER TO postgres;

--
-- Name: restricciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restricciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.restricciones_id_seq OWNER TO postgres;

--
-- Name: restricciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restricciones (
    id integer DEFAULT nextval('public.restricciones_id_seq'::regclass) NOT NULL,
    tipo character varying(255) NOT NULL,
    restriccion character varying(255) NOT NULL,
    descripcion character varying(255) NOT NULL,
    valor_num integer NOT NULL,
    valor_bool boolean NOT NULL,
    rangos_bloqueados_json jsonb
);


ALTER TABLE public.restricciones OWNER TO postgres;

--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: asuntos_permitidos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asuntos_permitidos ALTER COLUMN id SET DEFAULT nextval('public.asuntos_permitidos_id_seq'::regclass);


--
-- Name: estancias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias ALTER COLUMN id SET DEFAULT nextval('public.estancias_id_seq'::regclass);


--
-- Name: perfiles_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario ALTER COLUMN id SET DEFAULT nextval('public.perfiles_usuario_id_seq'::regclass);


--
-- Data for Name: asuntos_permitidos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asuntos_permitidos (id, uid, fecha, created_at) FROM stdin;
3	mjcorralesg01	2026-06-01	2026-03-02 08:14:42.661966
4	mrcarmonav01	2026-06-08	2026-03-09 08:01:57.801529
5	ilozano1977	2026-06-08	2026-03-09 08:16:28.196682
\.


--
-- Data for Name: ausencias_profesorado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ausencias_profesorado (id, uid_profesor, fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin, tipo_ausencia, creada_en, creada_por) FROM stdin;
\.


--
-- Data for Name: avisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.avisos (id, modulo, emails, app_password) FROM stdin;
1	asuntos-propios	{virginia.palacios@iesfcodeorellana.es,elena.muriel@iesfcodeorellana.es}	\N
2	extraescolares	{camino.palacios@iesfcodeorellana.es,virginia.palacios@iesfcodeorellana.es,elena.muriel@iesfcodeorellana.es}	\N
36	permisos	{virginia.palacios@iesfcodeorellana.es,elena.muriel@iesfcodeorellana.es}	
3	smtp	{comunicaciones@iesfcodeorellana.es}	hngh pjfv lfet lwnp
\.


--
-- Data for Name: cursos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cursos (id, curso) FROM stdin;
1	1º ESO
3	2º ESO
4	4º ESO
5	1º CFGB
2	3º ESO
6	3º DIVER
7	4º DIVER
8	2º CFGB
\.


--
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (uid, tipo_usuario, dni, asuntos_propios, tipo_empleado, jornada, email, telefono, cuerpo, grupo, personal, baja) FROM stdin;
bfernandezt07	0	76126491X	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
pagarciam27	0	44403054J	4	funcionario de carrera	0	patricia.garcia@iesfcodeorellana.es	645912534	Profesores de Secundaria	A1	\N	f
bpconejero78	0	76024887C	4	funcionario de carrera	0					\N	f
mebravom01	0	7010316P	4	funcionario de carrera	0	meugenia.bravo@iesfcodeorellana.es	686079363	Profesores de Secundaria	A1	\N	f
ordenanza	0	12341234A	4	laboral indefinido	0				V	staff	f
profealu	0	45870912G	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
fmsanzv01	0	8842662J	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
vpalaciosg06	0	28940302T	4	funcionario de carrera	0	virginia.palacios@iesfcodeorellana.es	659206392	Profesores de Secundaria	A1	\N	f
bcrespoc01	0	80039738Z	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
ndelorzac02	0	11814307N	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
egonzalezh18	0	76033293P	4	funcionario de carrera	0	elena.gonzalez@iesfcodeorellana.es	645965507	Profesores de Secundaria	A1	\N	f
jrodriguezt18	0	28950330T	4	funcionario de carrera	0	jorge.rodriguez@iesfcodeorellana.es	627261941	Profesores de Secundaria	A1	\N	f
fpascualg01	0	51372152L	4	funcionario de carrera	0	ferpascualgonzalez@hotmail.com	693361773	Administrativos	C2	staff	f
learob	0		4	laboral indefinido	0			Profesores de Secundaria	A2	\N	t
celita2	0	44777597R	4	funcionario de carrera	0	celita2@educarex.es	687824766	Profesores de Secundaria	A1	\N	f
provisional01	0	98234765H	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
micostad01	0	6986961K	6	funcionario de carrera	0			Maestros	A2	\N	f
grdiazp01	0	28972473V	4	funcionario de carrera	0	galoramon.diaz@iesfcodeorellana.es	686266017	Maestros	A2	\N	f
mji3003	0	28943646D	6	funcionario de carrera	0	inma.molina@iesfcodeorellana.es	607671701	Profesores de Secundaria	A1	\N	f
mdcpalaciosr01	0	7045679C	5	funcionario de carrera	0	camino.palacios@iesfcodeorellana.es	675828695	Profesores de Secundaria	A1	\N	f
mafloresm01	0	28947019R	5	funcionario de carrera	0	mariaangeles.flores@iesfcodeorellana.es	659432380	Profesores de Secundaria	A1	\N	f
sbalbuenaa01	0	77588452E	4	funcionario interino	0			Maestros	A2	\N	f
jmmurillon01	0	7014135D	4	funcionario de carrera	0	juanmaria.murillo@iesfcodeorellana.es	655660323	Profesores de Secundaria	A1	\N	f
mmansillap01	0	33985048H	6	funcionario de carrera	0	mariela.mansilla@iesfcodeorellana.es	607086441	Profesores de Secundaria	A1	\N	f
isabel22	0	70980274C	6	funcionario de carrera	0	isabel.panadero@iesfcodeorellana.es	654303705	Profesores de Secundaria	A1	\N	f
igomezc12	0	76029929W	5	funcionario de carrera	0	isabel.gomez@iesfcodeorellana.es	626014791	Profesores de Secundaria	A1	\N	f
mdpmartinezf01	0	11765487K	6	funcionario de carrera	0	pilarmf@gmail.com		Profesores de Secundaria	A1	\N	f
dmacarrillam01	0	28947450H	4	funcionario de carrera	0	david.macarrilla@iesfcodeorellana.es	608498404	Profesores de Secundaria	A1	\N	f
efranciscor01	0	28942864D	4	funcionario de carrera	0	efranciscor01@educarex.es	625061809	Profesores de Secundaria	A1	\N	f
mgperezr02	0	28836086C	4	funcionario de carrera	0	mariagranada.perez@iesfcodeorellana.es	626424505	Profesores de Secundaria	A1	\N	f
afloresc27	0	9212624C	4	funcionario de carrera	0	ana.flores@iesfcodeorellana.es	685903419	Profesores de Secundaria	A1	\N	f
amfajardol01	0	76041041M	4	funcionario de carrera	0	amfajardol01@educarex.es	669138377	Profesores de Secundaria	A1	\N	f
nmaciasp02	0	7051119D	4	funcionario de carrera	0	noelia.macias@iesfcodeorellana.es		Profesores de Secundaria	A1	\N	f
lmoralesg04	0	28944066S	4	funcionario de carrera	0	luis.morales@fcodeorellana.es	657969564	Profesores de Secundaria	A1	\N	f
pruebas	0	34895848X	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
isabel	0	28659485W	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
hacorzof01	0	28957449N	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
sromang06	0	28957531W	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
cpajuelom03	0	53736751B	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
egomezg24	0	76249082B	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
gsanchezg001	0	4245495V	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
marivi	0	28282828M	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
jjmorcillor01	0	28952894B	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
aserranoa17	0	25352219D	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
cblancoa02	0	76027243F	5	funcionario de carrera	0	cristina.blanco@iesfcodeorellana.es	636242748	Profesores de Secundaria	A1	\N	f
a_carlosss76	0	5662281A	5	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
mjcorralesg01	0	28942903W	6	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
ilozano1977	0	7050749F	6	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
rjrodriguezp0102	0	7480247A	6	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
rjrodriguezp01	0		4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
provisional02	0	98234765V	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
mibravom01	0	76010200F	4	funcionario de carrera	0	maribel19701970@gmail.com	609198556	Administrativos	C1	staff	f
practicas	0	45909090F	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
tecnicos	0	123456F	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
panelinformativo	0	123456A	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
jpcataland01	0	76024777W	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
rcorcherop01	0	7007468N	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
susana	0	88888888Z	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	t
francis	0		4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
emurielb76	0	28942766A	5	funcionario de carrera	0	elena.muriel@iesfcodeorellana.es	656253517	Profesores de Secundaria	A1	\N	f
mssalomonp02	0	76048861M	4	funcionario de carrera	0	marisol.salomon@iesfcodeorellana.es	699865959	Profesores de Secundaria	A1	\N	f
dmatasr01	0	76039448E	4	funcionario de carrera	0	david.matas@iesfcodeorellana.es	690070800	Profesores de Secundaria	A1	\N	f
mapavonb01	0	28966161F	5	funcionario de carrera	0	alba.pavon@iesfcodeorellana.es	610973929	Profesores de Secundaria	A1	\N	f
mahernandezr06	0	08365160Z	4	funcionario de carrera	0	miguelangel.hernandez@iesfcodeorellana.es	605777542	Profesores de Secundaria	A1	\N	f
cjlozanop01	0	7008628E	6	funcionario de carrera	0	carlos.lozano@iesfcodeorellana.es	676627455	Profesores de Secundaria	A1	\N	f
rencinasr02	0	28966339R	4	funcionario de carrera	0	raquel.encinas@iesfcodeorellana.es	617114526	Profesores de Secundaria	A1	\N	f
mgranadob01	0	6977545N	6	funcionario de carrera	0	mgranadob01@educarex.es	666612770	Profesores de Secundaria	A1	\N	f
dnarcisoc01	0	7052767R	4	funcionario de carrera	0	dolores.narciso@iesfcodeorellana.es	605844297	Profesores de Secundaria	A1	\N	f
rmvegac01	0	52359160M	6	funcionario de carrera	0	rmvegac01@educarex.es	659697201	Profesores de Secundaria	A1	\N	f
fatimapc20	0	07255578K	4	funcionario de carrera	0	fatimapc20@educarex.es	615068526	Profesores de Secundaria	A1	\N	f
mmhernandezr01	0		0	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
mrcarmonav01	0	28941779M	5	funcionario de carrera	0	remedios.carmona@iesfcodeorellana.es	630157501	Profesores de Secundaria	A1	\N	f
emparrag02	0	8896503B	4	funcionario de carrera	0	elisa.parra@iesfcodeorellana.es	635443144	Maestros	A2	\N	f
magarcian01	0	76011533Y	6	funcionario de carrera	0	magarcian01@educarex.es	699379932	Maestros	A2	\N	f
chisco	0	75539734Y	4	funcionario de carrera	0			Profesores de Secundaria	A1	\N	f
mtmarting03	0	28977719L	4	funcionario de carrera	0	mariateresa.martin@iesfcodeorellana.es	690764377	Maestros	A1	\N	f
omsanchezg01	0	28955973P	4	funcionario interino	0	omsanchezg01@educarex.es	699724531	Profesores de Secundaria	A1	\N	f
mtcerezog01	0	07007060H	6	funcionario de carrera	0	teresa.cerezo@iesfcodeorellana.es	636935031	Profesores de Secundaria	A1	\N	f
lpcamarac01	0	76029212K	4	funcionario de carrera	0	luispedro.camara@iesfcodeorellana.es	647421617	Profesores de Secundaria	A1	\N	f
amsanchezs01	0	76014735B	6	funcionario de carrera	0	amsanchezs01@educarex.es	694425068	Maestros	A2	\N	f
pety78	0	8825818M	4	funcionario de carrera	0	maria.trinidad@iesfcodeorellana.es	605927370	Profesores de Secundaria	A1	\N	f
djuliog01	0	28954341D	5	funcionario de carrera	0	cursoquintana@gmail.com	606889007	Profesores de Secundaria	A1	\N	f
\.


--
-- Data for Name: estancias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estancias (id, planta, codigo, descripcion, totalllaves, coordenadas_json, armario, codigollave, reservable, tipoestancia, numero_ordenadores) FROM stdin;
11	baja	DptoMates	Departamento Matemáticas	3	[[0.879098712446352, 0.7546744871903203], [0.9141487839771102, 0.7538303322829485], [0.9127181688125894, 0.8542847662601836], [0.8783834048640916, 0.8534406113528118]]	Llavera 1	17	f	Departamento	0
15	baja	AlmacenConserjeria	Almacén Conserjería	2	[[0.7496280400572246, 0.9454534962563296], [0.788969957081545, 0.9437651864415861], [0.7875393419170243, 0.9733106081995965], [0.7510586552217453, 0.9733106081995965]]	Llavera 1	55	f	Almacen	0
78	primera	DptoClasicas	Departamento Clásicas	2	[[0.7716606498194946, 0.30303030303030304], [0.8231046931407943, 0.3041958041958042], [0.8249097472924187, 0.3473193473193473], [0.7734657039711191, 0.34965034965034963]]		37	f		0
72	baja	DptoFrances	Departamento Economía y Frances	2	[[0.7851985559566786, 0.21445221445221446], [0.8375451263537906, 0.21328671328671328], [0.8366425992779783, 0.2564102564102564], [0.7842960288808665, 0.2540792540792541]]	Llavera 2	33	f		0
43	segunda	Aula 26	Infolab 2	3	[[0.2646638054363376, 0.8810535797619364], [0.3719599427753934, 0.8793705738789146], [0.3719599427753934, 0.9652038739130288], [0.35264663805436336, 0.9668868797960506], [0.35264663805436336, 0.9862414474508018], [0.2811158798283262, 0.9879244533338236], [0.2825464949928469, 0.9652038739130288], [0.2646638054363376, 0.9694113886205834]]	Llavera 1	88	t	Infolab	28
85	baja	DespachoInformatico	Despacho Informático	1	[[0.7842960288808665, 0.09906759906759907], [0.8366425992779783, 0.0979020979020979], [0.8357400722021661, 0.14102564102564102], [0.7833935018050542, 0.1445221445221445]]	Llavera 1	100	f		0
63	primera	Optativa3	Optativa 3	6	[[0.6409155937052933, 0.14138363875111173], [0.7439198855507868, 0.14138363875111173], [0.7453505007153076, 0.2082657193579251], [0.6409155937052933, 0.20657250212737285]]	Llavera 2	21	t	Optativa	0
84	primera	LaboratorioFyQ	Laboratorio Física y Química	1	[[0.5189530685920578, 0.752913752913753], [0.5388086642599278, 0.754079254079254], [0.5370036101083032, 0.7354312354312355], [0.6101083032490975, 0.7331002331002331], [0.6101083032490975, 0.7552447552447552], [0.6272563176895307, 0.7564102564102564], [0.6263537906137184, 0.8473193473193473], [0.51985559566787, 0.8438228438228438]]	Llavera 1	94	t	Laboratorio	0
9	baja	Aula3	1º Ciclo Básico	6	[[0.6530615164520744, 0.48538907173874063], [0.7532045779685265, 0.4837007619239972], [0.7546351931330472, 0.615388927473986], [0.6509155937052933, 0.6170772372887294]]	Llavera 2	21	f	Aula	0
10	baja	SalaProfesores	Sala de Profesores	1	[[0.9170100143061517, 0.7546744871903203], [0.9914020028612304, 0.7546744871903203], [0.9914020028612304, 0.9758430729217117], [0.9148640915593705, 0.9733106081995965]]	Llavera 1	51	f	Aula	0
24	baja	AlmacenTecnologia	Tecnología (Almacén)	1	[[0.45349070100143063, 0.8644146251486442], [0.4527753934191702, 0.8829860331108221], [0.49068669527896996, 0.8846743429255656], [0.4921173104434907, 0.8635704702412725]]	Llavera 1	4	f	Aula	0
36	segunda	Radio	Radio EDU	2	[[0.7746781115879828, 0.7506206238277434], [0.8104434907010014, 0.7539866355937871], [0.8082975679542204, 0.8583330003411415], [0.7753934191702432, 0.8616990121071852]]	Llavera 1	22	f	Otras	0
79	primera	DptoMusica	Departamento Música	2	[[0.7725631768953068, 0.5326340326340326], [0.822202166064982, 0.5337995337995338], [0.8249097472924187, 0.5710955710955711], [0.7743682310469314, 0.5745920745920746]]		36	f		0
73	baja	DptoHistoria	Departamento Historia	1	[[0.7861010830324909, 0.25757575757575757], [0.8348375451263538, 0.25990675990675993], [0.8348375451263538, 0.3006993006993007], [0.7851985559566786, 0.3006993006993007]]		32	f		0
45	primera	Aula20	Infolab 1	3	[[0.6416309012875536, 0.4825669107073874], [0.7453505007153076, 0.4834135193226635], [0.7439198855507868, 0.6214107236126708], [0.6416309012875536, 0.6222573322279469]]	Llavera 1	81	t	Infolab	30
41	segunda	Aula25	Infolab 3	3	[[0.2632331902718169, 0.7539866355937871], [0.2811158798283262, 0.7523036297107653], [0.27968526466380544, 0.7337905649975249], [0.35264663805436336, 0.7346320679390358], [0.35550786838340487, 0.7539866355937871], [0.37124463519313305, 0.7556696414768089], [0.3698140200286123, 0.8415029415109231], [0.265379113018598, 0.8406614385694121]]	Llavera 1	89	t	Infolab	28
35	segunda	AlmacenCiclos	Almacén Ciclos	2	[[0.7353361945636624, 0.754828138535298], [0.7739628040057225, 0.7506206238277434], [0.7732474964234621, 0.842344444452434], [0.7353361945636624, 0.8415029415109231]]	Llavera 1	25	f	Aula	0
20	baja	Educadora	Educadora Social	1	[[0.6373247496423462, 0.7538303322829485], [0.6709442060085837, 0.7555186420976919], [0.6709442060085837, 0.8213627248726864], [0.6366094420600859, 0.8213627248726864]]	Llavera 1	15	f	Despacho	0
59	primera	DptoIdiomas	Seminario Idiomas	3	[[0.37124463519313305, 0.8821661771177152], [0.42560801144492133, 0.8821661771177152], [0.4248927038626609, 0.9769863420286404], [0.3719599427753934, 0.9727532989522598]]	Llavera 1	33	f	Departamento	0
60	primera	DptoLengua	Seminario Lengua	3	[[0.4270386266094421, 0.8821661771177152], [0.4792560801144492, 0.8813195685024391], [0.4771101573676681, 0.9761397334133644], [0.4263233190271817, 0.9786795592591927]]	Llavera 1	9	f	Departamento	0
66	segunda	DptoCiclo	Departamento Ciclos	3	[[0.1917024320457797, 0.864223520931718], [0.22532188841201717, 0.8659065268147398], [0.22532188841201717, 0.9668868797960506], [0.19098712446351931, 0.9660453768545396]]	Llavera 1	37	f	Departamento	0
62	primera	Aula 24	Optativa 2	6	[[0.6430615164520744, 0.003386434461104473], [0.746065808297568, 0.003386434461104473], [0.7432045779685265, 0.14053703013583563], [0.6409155937052933, 0.1388438129052834]]	Llavera 2	21	t	Optativa	0
55	primera	Aula 10	Optativa 5	6	[[0.11158798283261803, 0.8855526115788197], [0.21959942775393418, 0.8872458288093719], [0.2217453505007153, 0.973599907567536], [0.20243204577968527, 0.9752931247980882], [0.20314735336194564, 0.9964583401799911], [0.12947067238912732, 0.9981515574105434], [0.13161659513590845, 0.9769863420286404], [0.11158798283261803, 0.9786795592591927]]	Llavera 1	78	t	Optativa	0
50	primera	Aula 14	1º BACH A	6	[[0.6301859799713877, 0.7585613192874019], [0.648068669527897, 0.7585613192874019], [0.648068669527897, 0.7382427125207751], [0.7217453505007153, 0.7390893211360512], [0.7203147353361946, 0.7526350589804691], [0.7374821173104434, 0.7594079279026781], [0.740343347639485, 0.844915398045566], [0.628755364806867, 0.8457620066608421]]	Llavera 1	78	f	Aula	0
51	primera	Aula 15	1º BACH B	6	[[0.628755364806867, 0.888092437424648], [0.740343347639485, 0.8872458288093719], [0.7396280400572246, 0.9727532989522598], [0.7224606580829757, 0.9761397334133644], [0.7246065808297568, 0.9981515574105434], [0.6459227467811158, 0.9973049487952672], [0.6452074391988555, 0.9778329506439165], [0.6301859799713877, 0.9769863420286404]]	Llavera 1	78	f	Aula	0
52	primera	Aula 7	4º DIVER	6	[[0.001430615164520744, 0.7585613192874019], [0.019313304721030045, 0.7560214934415735], [0.019313304721030045, 0.7373961039054989], [0.09370529327610873, 0.7365494952902228], [0.09155937052932761, 0.7560214934415735], [0.11015736766809728, 0.7577147106721258], [0.11158798283261803, 0.8466086152761182], [0.00357653791130186, 0.8466086152761182]]	Llavera 1	21	f	Aula	0
53	primera	Aula 8	4º ESO B	6	[[0.002145922746781116, 0.8889390460399241], [0.11301859799713877, 0.8897856546552002], [0.11158798283261803, 0.9752931247980882], [0.09370529327610873, 0.9761397334133644], [0.09585121602288985, 0.9964583401799911], [0.01859799713876967, 0.9973049487952672], [0.020028612303290415, 0.9744465161828121], [0.002145922746781116, 0.9752931247980882]]	Llavera 1	78	f	Aula	0
54	primera	Aula 9	4º ESO A	6	[[0.11158798283261803, 0.7560214934415735], [0.13090128755364808, 0.7585613192874019], [0.12947067238912732, 0.7382427125207751], [0.20457796852646637, 0.7348562780596706], [0.20386266094420602, 0.7568681020568497], [0.22317596566523606, 0.7577147106721258], [0.22317596566523606, 0.8466086152761182], [0.11373390557939914, 0.8491484411219465]]	Llavera 1	78	f	Aula	0
32	baja	CPD	CPD (Centro de Proceso de Datos)	3	[[0.7861087267525035, 0.5250643523852117], [0.7861087267525035, 0.5503889996063633], [0.8347496423462089, 0.5503889996063633], [0.8383261802575107, 0.5250643523852117]]	Llavera 2	10	f	Aula	0
56	primera	Aula 11	2º BACH A	6	[[0.26108726752503575, 0.7560214934415735], [0.27682403433476394, 0.7560214934415735], [0.2782546494992847, 0.7365494952902228], [0.351931330472103, 0.7340096694443945], [0.351931330472103, 0.7543282762110213], [0.36909871244635195, 0.7577147106721258], [0.36909871244635195, 0.8457620066608421], [0.26108726752503575, 0.8466086152761182]]	Llavera 1	78	f	Aula	0
57	primera	Aula 12	2º BACH B	6	[[0.2625178826895565, 0.8872458288093719], [0.3719599427753934, 0.888092437424648], [0.37124463519313305, 0.9769863420286404], [0.351931330472103, 0.9769863420286404], [0.35050071530758226, 0.9947651229494389], [0.27753934191702434, 0.9964583401799911], [0.2782546494992847, 0.9778329506439165], [0.26108726752503575, 0.9761397334133644]]	Llavera 1	78	f	Aula	0
58	primera	Aula 13	2º Ciclo Grado Medio	6	[[0.37124463519313305, 0.7568681020568497], [0.38912732474964234, 0.7577147106721258], [0.388412017167382, 0.7382427125207751], [0.463519313304721, 0.7399359297513273], [0.46280400572246067, 0.7551748848262975], [0.47854077253218885, 0.7551748848262975], [0.4792560801144492, 0.8474552238913944], [0.3719599427753934, 0.8457620066608421]]	Llavera 2	21	f	Aula	0
64	primera	Aula22	2º ESO A	6	[[0.6430615164520744, 0.2099589365884773], [0.7432045779685265, 0.21080554520375344], [0.7432045779685265, 0.3411832719562756], [0.642346208869814, 0.3445697064173801]]	Llavera 2	21	f	Aula	0
65	primera	Aula 21	2º ESO B	6	[[0.6409155937052933, 0.3496493581090368], [0.7446351931330472, 0.3462629236479324], [0.7432045779685265, 0.48002708486155904], [0.6402002861230329, 0.47833386763100677]]	Llavera 2	21	f	Aula	0
61	primera	Musica	Musica	1	[[0.5185979971387696, 0.8872458288093719], [0.628755364806867, 0.8889390460399241], [0.6258941344778255, 0.9752931247980882], [0.5214592274678111, 0.973599907567536]]	Llavera 1	8	f	Aula	0
7	baja	Aula5	1º ESO A	6	[[0.652346208869814, 0.20850626212081555], [0.7539198855507868, 0.210194571935559], [0.7532045779685265, 0.3427268923929195], [0.6509155937052933, 0.34188273748554776]]	Llavera 2	21	f	Aula	0
12	baja	AulaPT	Aula PT	5	[[0.8798140200286123, 0.886362652740309], [0.9184406294706724, 0.8855184978329373], [0.9155793991416309, 0.9749989180143399], [0.8798140200286123, 0.9741547631069682]]	Llavera 1	75	f	Aula	0
14	baja	Infolab4	Infolab 4	2	[[0.7911158798283262, 0.8888951174624242], [0.8397567954220315, 0.8905834272771677], [0.8383261802575107, 0.9733106081995965], [0.7904005722460659, 0.9733106081995965]]	Llavera 1	45	t	Infolab	8
30	baja	AulaKin	AulaKin	2	[[0.06150214592274678, 0.7538303322829485], [0.06221745350500715, 0.8424665975569794], [0.2324606580829757, 0.8433107524643512], [0.23103004291845494, 0.7555186420976919]]	Llavera 1	81	t	Aula Polivalente	0
67	baja	Emprendimiento	Emprendimiento	2	[[0.41425992779783394, 0.754079254079254], [0.49097472924187724, 0.7552447552447552], [0.4891696750902527, 0.8414918414918415], [0.41335740072202165, 0.8426573426573427]]	Llavera 2	0	t	Aula Polivalente	10
8	baja	Aula4	Optativa 1	6	[[0.652346208869814, 0.34610351202240636], [0.7553505007153076, 0.3469476669297781], [0.7546351931330472, 0.48201245210925375], [0.6516309012875536, 0.48116829720188203]]	Llavera 2	21	t	Optativa	0
19	baja	Secretaria	Secretaria	1	[[0.6723748211731044, 0.7555186420976919], [0.705994277539342, 0.7538303322829485], [0.7052789699570815, 0.8213627248726864], [0.6723748211731044, 0.8213627248726864]]	Llavera 1	29	f	Despacho	0
13	baja	Dpto FyQ	Departamento FyQ	1	[[0.8426180257510729, 0.9294145530162669], [0.8783834048640916, 0.9319470177383821], [0.8783834048640916, 0.9733106081995965], [0.8419027181688126, 0.9724664532922247]]	Llavera 1	34	f	Departamento	0
17	baja	Orientacion	Departamento Orientación	1	[[0.7145779685264664, 0.9066223705172304], [0.7481974248927039, 0.9066223705172304], [0.7496280400572246, 0.971622298384853], [0.713862660944206, 0.9733106081995965]]	Llavera 1	20	f	Departamento	0
23	baja	OficinasSecretaria	Secretaría (Oficinas)	1	[[0.52931330472103, 0.7555186420976919], [0.5929756795422032, 0.7538303322829485], [0.5936909871244636, 0.8382458230201209], [0.5471959942775394, 0.8416224426496077], [0.5493419170243204, 0.801103007095765], [0.5278826895565093, 0.801103007095765]]	Llavera 1	58	f	Despacho	0
18	baja	JefaturaEstudios	Jefatura de Estudios	1	[[0.7074248927038627, 0.7546744871903203], [0.7489127324749643, 0.7572069519124354], [0.7489127324749643, 0.8399341328348643], [0.7074248927038627, 0.8365575132053774]]	Llavera 1	53	f	Despacho	0
71	baja	Ascensor	Ascensor	3	[[0.7779783393501805, 0.6853146853146853], [0.7978339350180506, 0.682983682983683], [0.7969314079422383, 0.7202797202797203], [0.7815884476534296, 0.7191142191142191]]	Llavera 1	105	f	Otras	0
26	baja	Tecnologia	Tecnología (Taller)	1	[[0.2703719599427754, 0.8661029349633876], [0.4527753934191702, 0.865258780056016], [0.4527753934191702, 0.971622298384853], [0.27108726752503576, 0.971622298384853]]	Llavera 1	5	f	Laboratorio	0
74	baja	DptoTecnologia-Agraria	Departamento Tecnología y Agraria	3	[[0.7861010830324909, 0.3041958041958042], [0.8366425992779783, 0.30536130536130535], [0.8357400722021661, 0.3473193473193473], [0.7870036101083032, 0.3508158508158508]]	Llavera 2	31	f		0
80	primera	DptoBioGeo	Departamento BioGeo	1	[[0.7734657039711191, 0.5769230769230769], [0.825812274368231, 0.5745920745920746], [0.822202166064982, 0.6153846153846154], [0.7734657039711191, 0.6188811188811189]]		35	f		0
28	baja	Puerta Trasera	Puerta Trasera	1	[[0.23103004291845494, 0.7276615301544251], [0.23103004291845494, 0.770713430430383], [0.2703719599427754, 0.7690251206156395], [0.27180257510729616, 0.7285056850617968]]	Llavera 1	62	f	Aula	0
16	baja	SalidaAparcamiento	Salida Aparcamiento	2	[[0.7782403433476395, 0.7183758261733362], [0.7946924177396281, 0.7175316712659644], [0.7954077253218884, 0.7555186420976919], [0.781101573676681, 0.7555186420976919]]	Llavera 1	96	f	Aula	0
27	baja	TallerElectricidad	Taller Electricidad	2	[[0.3068526466380544, 0.7538303322829485], [0.3089985693848355, 0.8416224426496077], [0.37909871244635196, 0.8416224426496077], [0.3798140200286123, 0.7563627970050637]]	Llavera 1	32	f	Aula	0
6	baja	Aula6	1º ESO B	6	[[0.652346208869814, 0.004220800633120095], [0.7532045779685265, 0.004220800633120095], [0.7539198855507868, 0.14013058101958714], [0.6530615164520744, 0.14097474114621117]]	Llavera 2	21	f	Aula	0
33	baja	Ascensor	Ascensor	3	[[0.7846781115879828, 0.44571379109226966], [0.8111444921316167, 0.44486963618489794], [0.8075679542203148, 0.48201245210925375], [0.7832474964234621, 0.48116829720188203]]	Llavera 1	105	f	Aula	0
34	baja	PistasAmericas	Pistas "Las Américas"	2	[[0.0836766809728183, 0.2068179523060721], [0.30542203147353364, 0.20766210721344383], [0.30327610872675254, 0.30389576665382023], [0.08224606580829756, 0.30473992156119195]]	Llavera 1	111	f	Aula	0
29	baja	Calderas	Calderas	2	[[0.012145922746781116, 0.7200641359880796], [0.21529327610872676, 0.7209082908954514], [0.21600858369098713, 0.7529861773755768], [0.011430615164520744, 0.7538303322829485]]	Llavera 1	13	f	Aula	0
31	baja	EntradaPrincipal	Entrada Principal	1	[[0.5128612303290415, 0.9614924394963924], [0.5135765379113019, 0.9885053965322875], [0.5471959942775394, 0.9868170867175441], [0.5493419170243204, 0.9614924394963924]]	Llavera 1	61	f	Aula	0
68	baja	2CicloBasico	2º Ciclo Básico	6	[[0.7942238267148014, 0.7610722610722611], [0.8754512635379061, 0.754079254079254], [0.878158844765343, 0.8484848484848485], [0.7915162454873647, 0.8484848484848485]]	Llavera 1	78	f	Aula	0
70	baja	GimnasioTrujillo	Gimnasio Trujillo	2	[[0.30685920577617326, 0.21328671328671328], [0.38176895306859204, 0.21095571095571095], [0.3844765342960289, 0.30652680652680653], [0.30505415162454874, 0.3076923076923077]]	Llavera 2	2circulo	f	Aula	0
69	baja	GimnasioViejo	Gimnasio Viejo	2	[[0.023465703971119134, 0.844988344988345], [0.2292418772563177, 0.8496503496503497], [0.23014440433212996, 0.9662004662004662], [0.024368231046931407, 0.972027972027972]]	Llavera 1	2	f	Aula	0
75	primera	DptoEdFisica	1	1	[[0.7725631768953068, 0.10023310023310024], [0.822202166064982, 0.10023310023310024], [0.8212996389891697, 0.1456876456876457], [0.76985559566787, 0.1456876456876457]]		40	f		0
76	primera	DptoFilosofia	Departamento Filosofía	2	[[0.7725631768953068, 0.21561771561771562], [0.8231046931407943, 0.21678321678321677], [0.8231046931407943, 0.2564102564102564], [0.7716606498194946, 0.25874125874125875]]		39	f		0
40	segunda	LabBioGeo	Laboratorio BioGeo	2	[[0.3726752503576538, 0.7531451326522761], [0.39198855507868385, 0.754828138535298], [0.38912732474964234, 0.732949062056014], [0.4642346208869814, 0.7337905649975249], [0.4642346208869814, 0.754828138535298], [0.4814020028612303, 0.7581941503013416], [0.4792560801144492, 0.8389784326863903], [0.3741058655221745, 0.842344444452434]]	Llavera 1	12	t	Laboratorio	0
21	baja	Direccion	Dirección	1	[[0.5958369098712446, 0.7538303322829485], [0.6344635193133047, 0.7538303322829485], [0.6358941344778255, 0.8213627248726864], [0.5951216022889843, 0.8196744150579429]]	Llavera 1	16	f	Despacho	0
77	primera	DptoDibujo	Departamento Dibujo	2	[[0.7716606498194946, 0.25874125874125875], [0.8212996389891697, 0.25990675990675993], [0.822202166064982, 0.30186480186480186], [0.7734657039711191, 0.3041958041958042]]		38	f		0
83	primera	AulaAL	Aula AL	2	[[0.22563176895306858, 0.7575757575757576], [0.25902527075812276, 0.7564102564102564], [0.26173285198555957, 0.8461538461538461], [0.22563176895306858, 0.8438228438228438]]	Llavera 1	7	f	Aula	0
42	segunda	InformaticaCiclos	Informática Ciclos	4	[[0.2246065808297568, 0.8633820179902071], [0.19027181688125894, 0.8616990121071852], [0.19098712446351931, 0.754828138535298], [0.2632331902718169, 0.754828138535298], [0.2625178826895565, 0.8389784326863903], [0.22532188841201717, 0.8406614385694121]]	Llavera 1	24	t	Infolab	11
82	segunda	1GM	1 Grado Medio	6	[[0.6272563176895307, 0.8776223776223776], [0.7346570397111913, 0.87995337995338], [0.7310469314079422, 0.965034965034965], [0.7175090252707581, 0.9662004662004662], [0.7138989169675091, 0.9836829836829837], [0.6453068592057761, 0.9836829836829837], [0.6425992779783394, 0.965034965034965], [0.628158844765343, 0.9662004662004662]]		78	f	Aula	0
22	baja	Biblioteca	Biblioteca	2	[[0.5457653791130186, 0.886362652740309], [0.7131473533619457, 0.8846743429255656], [0.713862660944206, 0.9733106081995965], [0.5471959942775394, 0.9741547631069682]]	Llavera 1	1	t	Aula Polivalente	0
44	segunda	Dibujo	Dibujo	1	[[0.3726752503576538, 0.8802120768204255], [0.4799713876967096, 0.8802120768204255], [0.4792560801144492, 0.9685698856790724], [0.4642346208869814, 0.9668868797960506], [0.4642346208869814, 0.9887659562753346], [0.3905579399141631, 0.9870829503923128], [0.39127324749642345, 0.9702528915620943], [0.3726752503576538, 0.9668868797960506]]	Llavera 1	26	t	Laboratorio	0
39	segunda	1GradoSuperior	1º Grado Superior	2	[[0.5207439198855508, 0.7531451326522761], [0.5364806866952789, 0.754828138535298], [0.5357653791130186, 0.7346320679390358], [0.6080114449213162, 0.7354735708805468], [0.6087267525035766, 0.7523036297107653], [0.6237482117310443, 0.7539866355937871], [0.6251788268955651, 0.8415029415109231], [0.5207439198855508, 0.8431859473939449]]	Llavera 1	11	f	Aula	0
38	segunda	2GradoSuperior	2º Grado Superior	3	[[0.6258941344778255, 0.7539866355937871], [0.6452074391988555, 0.7531451326522761], [0.6466380543633763, 0.7337905649975249], [0.7188841201716738, 0.7337905649975249], [0.7195994277539342, 0.7531451326522761], [0.7353361945636624, 0.7531451326522761], [0.7339055793991416, 0.8415029415109231], [0.6266094420600858, 0.8440274503354558]]	Llavera 1	21	f	Aula	0
37	segunda	AlmacenInformatica	Almacen Informática	1	[[0.7746781115879828, 0.8625405150486961], [0.8090128755364807, 0.8625405150486961], [0.8061516452074392, 0.9668868797960506], [0.7753934191702432, 0.9660453768545396]]	Llavera 1	22	f	Aula	0
46	primera	Aula 18	3º ESO A	6	[[0.8884120171673819, 0.7577147106721258], [0.907725321888412, 0.7560214934415735], [0.9070100143061517, 0.7357028866749468], [0.9821173104434907, 0.7365494952902228], [0.9821173104434907, 0.7594079279026781], [0.9985693848354793, 0.7560214934415735], [0.9985693848354793, 0.8440687894302898], [0.8876967095851216, 0.8483018325066705]]	Llavera 1	78	f	Aula	0
25	baja	Conserjeria	Conserjería	1	[[0.45635193133047214, 0.8846743429255656], [0.4549213161659514, 0.9699339885701096], [0.5135765379113019, 0.9707781434774813], [0.5142918454935622, 0.9294145530162669], [0.4914020028612303, 0.92603793338678], [0.4921173104434907, 0.8846743429255656]]	Llavera 1	57	f	Aula	0
48	primera	Aula 16	3º ESO B	6	[[0.7796852646638054, 0.7560214934415735], [0.7954220314735336, 0.7534816675957452], [0.7975679542203148, 0.7382427125207751], [0.8683834048640916, 0.7365494952902228], [0.869098712446352, 0.7551748848262975], [0.8891273247496424, 0.7602545365179542], [0.8862660944206009, 0.8466086152761182], [0.778969957081545, 0.8457620066608421]]	Llavera 1	78	f	Aula	0
49	primera	Aula 17	3º DIVER	6	[[0.7796852646638054, 0.888092437424648], [0.8898426323319027, 0.8872458288093719], [0.8891273247496424, 0.9752931247980882], [0.8705293276108726, 0.9761397334133644], [0.8683834048640916, 0.9998447746410957], [0.7975679542203148, 0.9989981660258195], [0.796137339055794, 0.9752931247980882], [0.7782546494992847, 0.9761397334133644]]	Llavera 1	78	f	Aula	0
47	primera	Aula 19	Optativa 4	2	[[0.8884120171673819, 0.8863992201940958], [0.9971387696709585, 0.8872458288093719], [0.9964234620886981, 0.9769863420286404], [0.9799713876967096, 0.9769863420286404], [0.9814020028612304, 0.9939185143341628], [0.9048640915593705, 0.995611731564715], [0.9055793991416309, 0.973599907567536], [0.8876967095851216, 0.9778329506439165]]	Llavera 1	90	t	Optativa	28
81	segunda	TallerGM	Taller Grado Medio	1	[[0.5171480144404332, 0.8787878787878788], [0.5875451263537906, 0.8741258741258742], [0.5884476534296029, 0.9836829836829837], [0.5370036101083032, 0.9801864801864801], [0.5370036101083032, 0.9662004662004662], [0.5216606498194946, 0.9662004662004662]]	Llavera 1	14	f	Laboratorio	0
87	primera	ed-viejo	Edificio Viejo	1	[[0.7463898916967509, 0.8135198135198135], [0.7680505415162455, 0.8135198135198135], [0.76985559566787, 0.8834498834498834], [0.7472924187725631, 0.8811188811188811]]			f	Otras	0
88	baja	ed-nuevo	Edificio Nuevo	1	[[0.7572202166064982, 0.1561771561771562], [0.779783393501805, 0.1585081585081585], [0.779783393501805, 0.20745920745920746], [0.7608303249097473, 0.2097902097902098]]			f	Otras	0
89	baja	p01	Patio	1	[[0.26624548736462095, 0.48834498834498835], [0.36732851985559567, 0.4825174825174825], [0.3637184115523466, 0.6048951048951049], [0.26805054151624547, 0.6013986013986014]]			f	Otras	0
\.


--
-- Data for Name: extraescolares; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.extraescolares (id, uid, gidnumber, cursos_gids, tipo, titulo, descripcion, fecha_inicio, fecha_fin, idperiodo_inicio, idperiodo_fin, estado, created_at, updated_at, responsables_uids, ubicacion, coords, erasmus, updated_by) FROM stdin;
1689	emurielb76	3039	{16995,12541,12543}	complementaria	Acampada Jara-Juanjo	Acampada Jara-Juanjo	2026-03-05 00:00:00	2026-03-05 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 08:49:39.45418	{mjcorralesg01,jjmorcillor01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1638	emurielb76	3039	{12553,12551,12534,12545}	complementaria	GRADUACIÓN BACHILLERATO Y CICLOS	Graduación en el Palacio Barrantes Cervantes.	2026-06-19 00:00:00	2026-06-19 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 09:34:01.630724	{mdcpalaciosr01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
184	emurielb76	3039	{12530,12528}	complementaria	3ª JORNADA ESCUELA 4.0	3ª JORNADA ESCUELA 4.0 REA 2º ESO A ENTERO Y BILINGÜES DEL B	2026-05-26 00:00:00	2026-05-26 00:00:00	3	3	1	2026-03-16 10:07:23.139068	2026-03-16 10:45:48.460736	{sromang06,mssalomonp02,cblancoa02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
171	vpalaciosg06	3032	{17361,12547}	complementaria	CHARLA MALVALUNA	VIOLENCIA MACHISTA DIGITAL\nPROFESORES ANGIE Y OLGA	2026-04-14 00:00:00	2026-04-14 00:00:00	6	6	1	2026-02-23 13:15:45.464244	2026-02-25 09:32:34.778613	{vpalaciosg06,mgperezr02}	IES FRANCISCO DE ORELLANA	{"lat": 40.4168, "lng": -3.7038}	f	vpalaciosg06
174	emurielb76	3039	{}	complementaria	Difusión Bachillerato y Ciclos al IESO Cerro Pedro Gómez de Madroñera	Equipo directivo. Información sobre el bachillerato y los ciclos de GM y GS de nuestro centro a alumnos de 4º ESO y CFGB del IESO de Madroñera.	2026-04-09 00:00:00	2026-04-09 00:00:00	5	5	1	2026-02-26 10:06:14.561507	2026-02-26 10:06:43.273819	{mmhernandezr01,emurielb76,vpalaciosg06}	Madroñera, Cáceres, Extremadura, España	{"lat": 39.4253942, "lng": -5.757169}	f	emurielb76
1747	mdcpalaciosr01	3031	{12535,12537,16996}	complementaria	DIA MUNDIAL FILOSOFÍA. 1º Y 2º BACHILLERATO	Jornada sobre el día mundial de la Filosofía en Almendralejo. llegada aproximadamente a las 7 de la tarde	2025-11-20 00:00:00	2025-11-20 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 11:09:44.373995	{mdcpalaciosr01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
173	celita2	3052	{12547,12548}	extraescolar	EXCURSIÓN DOÑANA	Actividad extraescolar interdepartamental entre Biología y Economía. Visita a las minas de Riotinto, Doñana y gruta de las Maravillas de Aracena	2026-03-25 08:30:00	2026-03-27 20:00:00	\N	\N	1	2026-02-25 09:40:03.862462	2026-03-13 08:51:24.494842	{cblancoa02,celita2,afloresc27}	Matalascañas, Almonte, El Condado, Huelva, Andalucía, 21760, España	{"lat": 36.9990019, "lng": -6.5478919}	f	celita2
175	emurielb76	3044	{12535,12537,17284,12500,12539,16251,14666,18101,12540,15881,18100,12553,16996,12551,17360,12530,12528,18099,12534,12545,16995,12541,12543,17361,12547,12548}	extraescolar	Carrera Solidaria	Carrera solidaria con motivo del día del centro (no puede realizarse el día 23 por organización con la Policía Local).	2026-04-22 11:40:00	2026-04-22 14:20:00	\N	\N	1	2026-02-27 07:50:27.917813	2026-03-13 08:51:46.56039	{mmansillap01,afloresc27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
177	emurielb76	3039	{12547,17361}	complementaria	1ª JORANDA ESCUELA 4.0	1ª JORNADA ACOMPAÑAMIENTO 4º ESO	2026-04-14 00:00:00	2026-04-14 00:00:00	2	2	1	2026-03-16 09:50:21.367766	2026-03-16 09:54:43.812868	{jmmurillon01,mdcpalaciosr01,omsanchezg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
188	lpcamarac01	3034	{12530,12528}	extraescolar	Excursión a Toledo - 2º ESO.	Excursión a Toledo para hacer un recorrido de las tres culturas medievales	2026-05-07 09:00:00	2026-05-07 22:30:00	\N	\N	0	2026-03-23 11:59:49.536445	2026-03-23 11:59:49.536445	{lpcamarac01}	Toledo, Castilla-La Mancha, España	{"lat": 39.8558913, "lng": -4.024265}	f	lpcamarac01
187	sromang06	3042	{12530,12528,12541,12543}	complementaria	Excursión Potabilizadora Cáceres	Excursión a Cáceres a visitar la potabilizadora y Laboratorios agroalimentarios de la junta de Extremadura	2026-04-21 00:00:00	2026-04-21 00:00:00	1	7	2	2026-03-20 11:29:45.579006	2026-03-24 10:03:15.861588	{sromang06}	El Cuartillo, Carretera de Trujillo a Portugal por Valencia de Alcántara, El Cuartillo, Cáceres, Extremadura, 10004, España	{"lat": 39.474812684473214, "lng": -6.333789825439454}	f	sromang06
1683	emurielb76	3043	{12535,12537,16995,12541,12543,17361,12547,12548}	complementaria	3º, 4º, 1º Bach.Festival Teatro Grecolatino Medellín	Alumnos de Cultura Clásica (3ºESO)\r\nAlumnos de 4ºESO (Lengua, Latín y TAE).\r\nAlumnos de 1ºBachillerato (Latín y LCL).	2026-03-11 00:00:00	2026-03-11 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 08:50:22.738415	{pagarciam27,jjmorcillor01}	Medellín, Badajoz, Extremadura, 06411, España	{"lat": 38.9640335, "lng": -5.9579913}	f	emurielb76
1670	emurielb76	3030	{12500,12539}	complementaria	Campamento Inmersión Lingüística 1º ESO	Campamento de Inmersión lingüística en Ledesma (Salamanca). 1º ESO	2026-03-20 00:00:00	2026-03-20 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:06:06.225961	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
172	vpalaciosg06	3032	{12548}	complementaria	CHARLA MALVALUNA	VIOLENCIA MACHISTA DIGITAL\nPROFESORA: ANA FLORES CIDONCHA (EDUCACIÓN FÍSICA)	2026-04-14 00:00:00	2026-04-14 00:00:00	7	7	1	2026-02-23 13:16:45.864712	2026-02-25 09:31:02.274162	{vpalaciosg06,mgperezr02}	IES FRANCISCO DE ORELLANA	{"lat": 40.4168, "lng": -3.7038}	f	vpalaciosg06
1686	vpalaciosg06	3032	{17361,14666}	complementaria	Charla Adicciones 4º DIVER + 1º CFGB	Programa Construye tu Mundo\nPROFESORES: GRANI Y OLGA	2026-03-10 00:00:00	2026-03-10 00:00:00	7	7	1	2026-02-12 12:51:34.675032	2026-03-10 11:17:00.624799	{vpalaciosg06}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
176	vpalaciosg06	3032	{12500,12539,17361,12547,12548}	extraescolar	CONVIVENCIA PROYECTO ACOMPAÑAMIENTO ENTRE IGUALES	SALIDA PARQUE MULTIAVENTURA EN EL PROGRAMA DE ACOMPAÑAMIENTO ENTRE IGUALES	2026-04-21 09:00:00	2026-04-21 14:00:00	\N	\N	1	2026-03-10 13:17:28.018765	2026-03-13 08:51:38.166945	{vpalaciosg06,mgperezr02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	vpalaciosg06
178	emurielb76	3039	{12530,12528}	complementaria	1ª  JORANADA ESCUELA 4.0	1ª JORANADA ACOMPAÑAMIENTO REA 2º ESO A ENTERO  Y B BILINGÜES.	2026-04-14 00:00:00	2026-04-14 00:00:00	3	3	1	2026-03-16 09:52:48.406261	2026-03-16 09:54:53.288777	{sromang06,mssalomonp02,cblancoa02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
185	emurielb76	3039	{12500,12539}	complementaria	3ª JORNADA ESCUELA 4.0	3ª JORNADA ESCUELA 4.0 REA 1º ESO A Y NO BILINGÜES B	2026-05-26 00:00:00	2026-05-26 00:00:00	5	5	1	2026-03-16 10:08:25.98014	2026-03-16 10:45:50.355265	{celita2,egonzalezh18,magarcian01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1681	emurielb76	3039	{}	complementaria	Bratislava movilidad Erasmus profesores INMA, JARA Y PATRICIA	BRATISLAVA, movilidad Erasmus	2026-03-16 00:00:00	2026-03-16 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 11:22:05.295916	{mjcorralesg01,mji3003,pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
179	emurielb76	3039	{12500,12539}	complementaria	1ª JORANADA ESCUELA 4.0	1ª JORANADA ESCUELA 4.0 1º ESO A ENTERO Y B NO BLINGÜE	2026-04-14 00:00:00	2026-04-14 00:00:00	5	5	1	2026-03-16 09:54:17.595887	2026-03-16 09:54:55.562396	{celita2,egonzalezh18,magarcian01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
186	vpalaciosg06	3032	{12553,12551}	complementaria	CHARLA ORIENTACIÓN ACADÉMICA	CHARLA DE ORIENTACIÓN PARA 2º BACHILLERATO	2026-03-25 00:00:00	2026-03-25 00:00:00	7	7	1	2026-03-16 10:52:29.30836	2026-03-16 12:58:31.983064	{vpalaciosg06,mgperezr02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	vpalaciosg06
1696	ndelorzac02	3039	{18101}	complementaria	Salida ASPACE	Salida con el alumnado de primero de atención a personas en situación e dependencia, para su presentación	2026-02-10 12:02:00	2026-02-10 12:05:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{ndelorzac02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	ndelorzac02
180	emurielb76	3039	{12547,17361}	complementaria	2ª JORNADA ESCUELA 4.0	2ª SESIÓN ESCUELA 4.0 REA 4º ESO	2026-04-30 00:00:00	2026-04-30 00:00:00	3	3	1	2026-03-16 09:57:33.652375	2026-03-16 10:01:15.837429	{jmmurillon01,mdcpalaciosr01,omsanchezg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1661	emurielb76	3039	{}	extraescolar	ERASMUS SIN ALUMNOS: MATILDE, RODOLFO, DIANA Y LOLA	CRACOVIA, movilidad Erasmus profesores.	2026-04-12 02:00:00	2026-04-19 01:00:00	\N	\N	1	2026-02-12 12:51:34.675032	2026-02-23 11:21:21.04802	{mgranadob01,djuliog01,rjrodriguezp0102,dnarcisoc01}	Cracovia, Voivodato de Pequeña Polonia, Polonia	{"lat": 50.0469432, "lng": 19.9971534}	f	mdcpalaciosr01
181	emurielb76	3039	{12530,12528}	complementaria	2ª JORNADA ESCUELA 4.0	2ª JORNADA ESCUELA 4.0 REA 2º ESO A ENTERO Y BILINGÜES B	2026-04-30 00:00:00	2026-04-30 00:00:00	5	5	1	2026-03-16 09:59:34.701998	2026-03-16 10:01:12.166344	{cblancoa02,sromang06,mssalomonp02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
169	emurielb76	3039	{}	extraescolar	Movilidad Erasmus profesores. Lui Morales. Estoril.	Erasmus profesores. Luis Morales. Estoril.	2026-04-20 00:00:00	2026-04-24 23:00:00	\N	\N	1	2026-02-23 10:22:27.783968	2026-02-25 10:59:10.819933	{lmoralesg04}	Estoril, Cascais e Estoril, Cascais, Lisboa, Portugal	{"lat": 38.7095707, "lng": -9.3901368}	f	emurielb76
1640	mjcorralesg01	3035	{12535,12537,17284,12500,12539,16251,14666,18101,12540,15881,18100,12553,16996,12551,17360,12530,12528,18099,12534,12545,16995,12541,12543,17361,12547,12548}	complementaria	Festival eres la caña	Festival "Eres la caña"	2026-06-12 00:00:00	2026-06-12 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-13 08:51:56.079303	{mjcorralesg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
182	emurielb76	3039	{12500,12539}	complementaria	2ª  JORNADA ESCUELA 4.0	2ª JORANADA ESCUELA 4.0 REA 1º ESO A ENTERO Y B NO BILINGÜES	2026-04-30 00:00:00	2026-04-30 00:00:00	6	6	1	2026-03-16 10:00:50.965787	2026-03-16 10:01:09.975023	{celita2,egonzalezh18,magarcian01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1653	emurielb76	3033	{12541,12543,16995}	extraescolar	ACTIVIDAD EXTRAESCOLAR - BIOLOGÍA	Excursión a la Isla del Züjar	2026-05-05 18:00:00	2026-05-05 18:07:00	\N	\N	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{celita2}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1715	susana	3032	{18101}	complementaria	TALLER HHSS (1º B)	PROPREFAME	2026-01-20 12:06:00	2026-01-20 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1652	emurielb76	3032	{12530,12528}	complementaria	SIMULACRO EVAL. DE DIAGNÓSTICO 2º eso	SIMULACRO EVAL. DE DIAGNÓSTICO 2º eso	2026-05-12 00:00:00	2026-05-12 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 09:58:45.042923	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1671	emurielb76	3039	{}	complementaria	ERASMUS SIN ALUMNOS: INMA, JARA Y PATRICIA	BRATISLAVA. Erasmus de profesorado	2026-03-20 00:00:00	2026-03-20 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:06:30.206785	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1655	emurielb76	3041	{12500,12539,17361,12548,12547}	complementaria	Matemáticas en la Calle	Asistirá el alumnado de 1º ESO y 4º ESO.	2026-04-17 00:00:00	2026-04-17 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-13 08:51:32.990172	{mssalomonp02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1647	emurielb76	3039	{}	extraescolar	ERASMUS SIN ALUMNOS: CRISTINA, SARA, CELIA Y ANA FLORES	BUDAPEST, movilidad Erasmus profesores.	2026-05-18 02:00:00	2026-05-24 01:00:00	\N	\N	1	2026-02-12 12:51:34.675032	2026-02-23 11:24:16.835067	{cblancoa02,afloresc27,sromang06,celita2}	Praga, Prague, Chequia	{"lat": 50.0874654, "lng": 14.4212535}	f	mdcpalaciosr01
1646	emurielb76	3032	{12530,12528}	complementaria	EVALUACIÓN DE DIAGNÓSTICO 2º eso	Evaluación de diagnóstico 2º ESO	2026-05-19 00:00:00	2026-05-19 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:25:12.052447	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1643	emurielb76	3032	{12530,12528}	complementaria	EVALUACIÓN DE DIAGNÓSTICO 2º eso	EVALUACIÓN DE DIAGNÓSTICO 2º eso	2026-05-20 00:00:00	2026-05-20 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:25:47.990048	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1649	mjcorralesg01	3035	{12535,12537,16995,12541,12547,12548}	complementaria	Ukedada (Música)	Ukedada en Cáceres (3º, 4º y 1º bach)	2026-05-13 00:00:00	2026-05-13 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-13 08:52:01.215461	{mjcorralesg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1651	emurielb76	3039	{12535,12537,12547,12548}	extraescolar	Viaje Bruselas con Patricia y Cristina. 4º ESO y 1º Bach.	Viaje a Bruselas. Escuelas Embajadoras Europeas. 18 alumnos de 4º y 1º bach.	2026-05-12 00:00:00	2026-05-14 23:00:00	\N	\N	1	2026-02-12 12:51:34.675032	2026-02-24 09:20:21.925407	{pagarciam27,cblancoa02}	Bruselas, Bruselas-Capital, Bélgica	{"lat": 50.8467372, "lng": 4.352493}	f	emurielb76
1654	mjcorralesg01	3035	{18101}	complementaria	Musiqueando	Actividad en la plaza mayor de Trujillo (todos los grupos de Jara)	2026-04-29 00:00:00	2026-04-29 00:00:00	1	7	2	2026-02-12 12:51:34.675032	2026-03-12 12:51:31.743045	{mjcorralesg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1668	emurielb76	3039	{12535,12537}	complementaria	Viaje fin de curso 1º bachillerato	Viaje fin de curso 1º de bachillero a Praga.	2026-03-24 00:00:00	2026-03-24 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{egonzalezh18}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1679	emurielb76	3039	{12540}	complementaria	ERASMUS SIN ALUMNOS: INMA, JARA Y PATRICIA	BRATISLAVA, Erasmus	2026-03-17 00:00:00	2026-03-17 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Bratislava, Región de Bratislava, Eslovaquia	{"lat": 48.1559178, "lng": 17.1313541}	f	emurielb76
1669	emurielb76	3039	{12535,12537}	complementaria	Viaje fin de curso 1º bachillerato	Viaje fin de curso 1º de bachillero a Praga.	2026-03-23 00:00:00	2026-02-26 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{egonzalezh18}	Praga, Prague, Chequia	{"lat": 50.0874654, "lng": 14.4212535}	f	emurielb76
1666	emurielb76	3039	{12535,12537}	complementaria	Viaje fin de curso 1º bachillerato	Viaje fin de curso 1º de bachillero a Praga.	2026-03-25 00:00:00	2026-03-25 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{egonzalezh18}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1664	emurielb76	3039	{12535,12537}	complementaria	Viaje fin de curso 1º bachillerato	Viaje fin de curso 1º de bachillero a Praga.	2026-03-26 00:00:00	2026-03-26 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{egonzalezh18}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1662	emurielb76	3039	{12535,16995,12541,12543,17361,12547,12548,12537}	complementaria	Excursión Madrid	Viaje a Madrid 3º, 4º y 1º bach	2026-04-08 00:00:00	2026-04-08 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mjcorralesg01}	MAdrid	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1697	susana	3032	{18101}	complementaria	SESIÓN 2. PROYECTO HOMBRE (2º ESO A Y B)	PREVENCIÓN CONSUMO SUSTANCIAS	2026-02-09 12:05:00	2026-02-09 12:06:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1699	susana	3032	{18101}	complementaria	CHARLA ADETAEX (2ºA)	PREVENCIÓN TCA	2026-02-06 12:04:00	2026-02-06 12:05:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1700	susana	3032	{18101}	complementaria	CHARLA ADETAEX (2ºB)	PREVENCIÓN TCA	2026-02-06 12:02:00	2026-02-06 12:03:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1703	dnarcisoc01	3039	{18101}	complementaria	CHARLA Teleasistencia. CRUZ ROJA. PARA 2º de GM	Charla con trabajadora del servicio de TLA para las alumnas de 2º de GM. Duración: de 9.00 a 10.15h	2026-02-04 12:00:00	2026-02-04 12:01:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{dnarcisoc01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	dnarcisoc01
1704	pagarciam27	3038	{18101}	complementaria	Encuentro literario 1ºBachillerato	Charla con el autor Bruno Puelles sobre su novela Marea oscura.	2026-02-03 12:02:00	2026-02-03 12:03:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	pagarciam27
1673	djuliog01	3030	{12500,12539}	complementaria	Campamento Inmersión Lingüística 1º ESO	Campamento de Inmersión lingüística en Ledesma (Salamanca). 1º ESO	2026-03-19 00:00:00	2026-03-19 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:05:05.009693	{djuliog01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1682	emurielb76	3039	{12530,12528}	extraescolar	MARIBOR 2º ESO MONTAÑA Y PILAR	Erasmus Escolar 2º ESO Maribor, Eslovenia.	2026-03-15 00:00:00	2026-03-21 23:00:00	\N	\N	1	2026-02-12 12:51:34.675032	2026-02-23 08:58:07.265366	{mmhernandezr01,mdpmartinezf01}	Maribor, Eslovenia	{"lat": 46.5576439, "lng": 15.6455854}	f	emurielb76
1676	emurielb76	3030	{12500,12539}	complementaria	Campamento Inmersión Lingüística 1º ESO	Campamento de Inmersión lingüística en Ledesma (Salamanca). 1º ESO	2026-03-18 00:00:00	2026-03-18 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:03:47.07923	{djuliog01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1677	emurielb76	3039	{}	complementaria	ERASMUS SIN ALUMNOS: INMA, JARA Y PATRICIA	BRATISLAVA. Erasmus de profesorado	2026-03-18 00:00:00	2026-03-18 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:04:24.672709	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1674	emurielb76	3039	{}	complementaria	ERASMUS SIN ALUMNOS: INMA, JARA Y PATRICIA	BRATISLAVA. Erasmus de profesorado	2026-03-19 00:00:00	2026-03-19 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 11:05:30.563403	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1705	pagarciam27	3038	{18101}	complementaria	Encuentro literario TAE (4ºESO)	Los alumnos de la optativa Taller de Artes Escénicas realizarán un taller de teatro con el autor Bruno Puelles.\r\n(Coincide con la hora de clase).	2026-02-03 12:04:00	2026-02-03 12:05:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	pagarciam27
1707	emurielb76	3039	{18101}	complementaria	Día de la Paz 1º ESO	Desde recreo	2026-01-30 12:00:00	2026-01-30 12:01:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1706	emurielb76	3040	{18101}	extraescolar	Viaje París 3º ESO con I. Lozano y Sara	Viaje París 3º ESO con I. Lozano y Sara	2026-02-03 09:00:00	2026-02-03 14:00:00	\N	\N	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{ilozano1977,sromang06}	París, Isla de Francia, Francia metropolitana, Francia	{"lat": 48.8588897, "lng": 2.320041}	f	emurielb76
1698	emurielb76	3040	{18101}	complementaria	Viaje París 3º ESO con I. Lozano y Sara	Viaje París 3º ESO con I. Lozano y Sara	2026-02-06 00:00:00	2026-02-06 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{ilozano1977,sromang06}	París, Isla de Francia, Francia metropolitana, Francia	{"lat": 48.8588897, "lng": 2.320041}	f	emurielb76
1691	emurielb76	3033	{12535,12537}	complementaria	Olimpiada de Geología	1º de bachillerato que cursan la materia de Biología y Geología	2026-02-25 00:00:00	2026-02-25 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{egonzalezh18}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1688	emurielb76	3039	{12541,12543,16995}	complementaria	Acampada Jara-Juanjo	Acampada Jara y Juanjo	2026-03-06 00:00:00	2026-03-06 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1695	emurielb76	3032	{}	complementaria	NO PROGRAMAR ACTIVIDADES A 3ª HORA	NO PROGRAMAR ACTIVIDADES A 3ª HORA	2026-02-13 00:00:00	2026-02-13 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1694	mdcpalaciosr01	3038	{12547,12548}	complementaria	Taller de Ciencia Circular, 4ºESO	Taller "Quién te ha visto y quién te lee. Tatuajes literarios de tus autores favoritos" impartido por dos profesoras de la facultad de Filosofía y Letra de la Universidad de Extremadura.	2026-02-20 00:00:00	2026-02-20 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1692	emurielb76	3032	{12530,12528}	complementaria	SESIÓN 3. PROYECTO HOMBRE (2º A Y B)	PREVENCIÓN CONSUMO	2026-02-23 00:00:00	2026-02-23 00:00:00	6	6	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1702	emurielb76	3040	{18101}	complementaria	Viaje París 3º ESO con I. Lozano y Sara	Viaje París 3º ESO con I. Lozano y Sara	2026-02-04 00:00:00	2026-02-04 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{ilozano1977,sromang06}	París, Isla de Francia, Francia metropolitana, Francia	{"lat": 48.8588897, "lng": 2.320041}	f	emurielb76
1708	mssalomonp02	3041	{18101}	complementaria	CONFERENCIA MUJERES EXTRAORDINARIAS		2026-01-30 12:02:00	2026-01-30 12:03:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mssalomonp02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mssalomonp02
1709	pagarciam27	3038	{18101}	complementaria	4ºESO A Proyecto Mujeres Extraordinarias	Encuentro con la escritora Carmen Sánchez Risco.	2026-01-30 12:06:00	2026-01-30 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	pagarciam27
1710	emurielb76	3037	{18101}	complementaria	Feria FP Horario por determinar	Irán alumnos de ciclos y 4º Diver, y algunos alumnos (según intereses) de bach.	2026-01-29 12:00:00	2026-01-29 12:01:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1711	mssalomonp02	3052	{18101}	complementaria	CONFERENCIA MUJERES EXTRAORDINARIAS		2026-01-29 12:02:00	2026-01-29 12:03:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mssalomonp02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mssalomonp02
1712	pagarciam27	3038	{18101}	complementaria	2ºESO Proyecto Mujeres Extraordinarias	Todos alumnos de 2ºESO asistirán a la charla de Ana Molina Jiménez	2026-01-27 12:02:00	2026-01-27 12:04:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	pagarciam27
1713	pagarciam27	3034	{18101}	complementaria	Charla Europa Direct 4ºESO y 1ºBachillerato	Solo los alumnos de la optativa de UE y los alumnos de otros grupos que están participando para viajar a Bruselas.	2026-01-27 12:04:00	2026-01-27 12:05:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	pagarciam27
1714	susana	3032	{18101}	complementaria	SESIÓN 1. PROYECTO HOMBRE (2º ESO A Y B)	PREVENCIÓN CONSUMO SUSTANCIAS	2026-01-26 12:05:00	2026-01-26 12:06:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1685	vpalaciosg06	3032	{12539}	complementaria	Charla Adicciones 1º ESO B	Charla Adicciones 1º ESO B\nPROFESOR LUISPE	2026-03-10 00:00:00	2026-03-10 00:00:00	3	3	1	2026-02-12 12:51:34.675032	2026-02-25 11:56:44.346571	{vpalaciosg06,mgperezr02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	vpalaciosg06
1687	vpalaciosg06	3032	{12500}	complementaria	Charla Adicciones 1º ESO A	Charla Adicciones 1º ESO A\nPROFESORES: JARA Y RODOLFO	2026-03-10 00:00:00	2026-03-10 00:00:00	5	5	1	2026-02-12 12:51:34.675032	2026-02-25 11:57:44.705904	{vpalaciosg06}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	vpalaciosg06
1716	susana	3032	{18101}	complementaria	TALLER HHSS (1º A)		2026-01-20 12:05:00	2026-01-20 12:06:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1717	ndelorzac02	3039	{18101}	complementaria	Elena Rodriguez Prieto	Mujeres Extraordinarias \r\nEntrevista de su carrera profesional  Tiro con arco	2026-01-20 12:09:00	2026-01-20 12:12:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{ndelorzac02}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	ndelorzac02
1718	mtcerezog01	3039	{18101}	complementaria	Proyecto "Mujeres Extraordinarias" 4º Diver.	Charla de Jessica Carrasco en el proyecto "Mujeres extraordinarias que cuentan", inscrita en el programa CITE Colaborativo del centro.	2026-01-16 12:02:00	2026-01-16 12:03:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mtcerezog01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mtcerezog01
1719	susana	3032	{18101}	complementaria	SESIÓN 2. CHARLA FEAFES (3º A Y DIVER)	SALUD MENTAL	2026-01-15 12:02:00	2026-01-15 12:03:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1720	susana	3032	{18101}	complementaria	SESIÓN 2. CHARLA FEAFES (1ºGM Y 1º GB)	SALUD MENTAL	2026-01-15 12:04:00	2026-01-15 12:05:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1721	susana	3032	{18101}	complementaria	SESIÓN 2. CHARLA FEAFES (3º ESO B)		2026-01-15 12:06:00	2026-01-15 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1722	mdcpalaciosr01	3039	{18101}	complementaria	3º Diver. Proyecto mujeres extraordinarias	3º Diver	2026-01-15 12:11:00	2026-01-15 12:12:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mdcpalaciosr01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1723	susana	3032	{18101}	complementaria	CHARLA COMITÉ ANTISIDA (4º A Y DIVER)	PREVENCIÓN	2026-01-13 12:05:00	2026-01-13 12:06:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1724	susana	3032	{18101}	complementaria	CHARLA COMITÉ ANTISIDA (4º B		2026-01-13 12:06:00	2026-01-13 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1725	pagarciam27	3031	{18101}	complementaria	4ºESO Proyecto Mujeres Extraordinarias	Los alumnos de 4ºESO de Introducción a la Filosofía y de Matemáticas (Noelia) asistirán a la charla de Rosario Alvarado Hoyas.	2026-01-09 12:04:00	2026-01-09 12:05:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	pagarciam27
1726	mdcpalaciosr01	3039	{18101}	complementaria	DESAYUNO		2025-12-19 12:00:00	2025-12-19 12:01:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mdcpalaciosr01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1727	mjcorralesg01	3035	{18101}	complementaria	Festival de Villancicos		2025-12-19 12:02:00	2025-12-19 12:04:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mjcorralesg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mjcorralesg01
1728	mdcpalaciosr01	3044	{18101}	complementaria	Carrera San Silvestre. Topdo el Alumnado y profesores	Carrera desde el instituto hasta la plaza mayor, corriendo o andando	2025-12-19 12:04:00	2025-12-19 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mdcpalaciosr01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1729	mebravom01	3039	{18101}	complementaria	VISITA A LAS EXPOSICIONES BELENISTAS	SALIDA 10:15 h\r\nVISITA A LA ACADEMIA DE LAS LETRAS Y LAS ARTES 11 h\r\nVISITA AL BELÉN BARRANTES CERVANTES 13 h.\r\nCOMIDA 13:30 O 14 h	2025-12-18 12:02:00	2025-12-18 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mebravom01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mebravom01
1730	emurielb76	18057	{18101}	complementaria	Viaje Emprendimiento ciclos Sevilla		2025-12-18 12:21:00	2025-12-18 12:22:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1731	mjcorralesg01	3035	{18101}	complementaria	Excursión Madrid	Viaje a Madrid con 1º y 2º de ESO para visitar el arqueológico y asistir al musical "La Cenicienta"	2025-12-17 12:21:00	2025-12-17 12:22:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mjcorralesg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mjcorralesg01
1732	emurielb76	18057	{18101}	complementaria	Viaje Emprendimiento ciclos Sevilla		2025-12-17 12:22:00	2025-12-17 12:23:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1733	rmvegac01	3037	{18101}	complementaria	VISITA A UN CENTRO DE LA LOCALIDAD	ACTIVIDADES SENSORIALES DE NAVIDAD EN LOS CEI DE LA LOCALIDAD\r\n1º y 2º GS	2025-12-16 12:02:00	2025-12-16 12:06:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{rmvegac01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	rmvegac01
1734	mjcorralesg01	3035	{18101}	complementaria	Concierto villancicos	Concierto villancicos con alumnos de 3º música en Extremadura en la residencia Santa Isabel	2025-12-12 12:10:00	2025-12-12 12:12:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mjcorralesg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mjcorralesg01
1735	isabel22	3037	{18101}	complementaria	Celebra la navidad 2º Grado Medio	celebrar con la residencia de el conquistador de Trujillo La Navidad	2025-12-12 12:00:00	2025-12-12 12:04:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{isabel22}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	isabel22
1736	susana	3032	{18101}	complementaria	SESIÓN 1. CHARLA FEAFES (3º ESO A Y DIVER)	PREVENCIÓN	2025-12-11 12:02:00	2025-12-11 12:03:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1737	susana	3032	{18101}	complementaria	SESIÓN 1. CHARLA FEAFES (3º ESO B)		2025-12-11 12:06:00	2025-12-11 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1738	susana	3032	{18101}	complementaria	SESIÓN 1. CHARLA FEAFES (1º GM y 1º CFGB)	PREVENCIÓN	2025-12-11 12:04:00	2025-12-11 12:05:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1739	celita2	3033	{18101}	complementaria	EXTRESCOLAR 1º ESO	VISITA AL MUSEO MINERO DE SANTA MARTA	2025-12-02 12:21:00	2025-12-02 12:22:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{celita2}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	celita2
1740	susana	3032	{18101}	complementaria	TALLER AMOR ROMÁNTICO (1º ESO A)	IMPARTIDO PROPREFAME	2025-11-26 12:06:00	2025-11-26 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1742	susana	3032	{18101}	complementaria	CHARLA TRATA DE PERSONAS (4º A Y DIVER)	OI CON MÉDICOS DEL MUNDO	2025-11-25 12:07:00	2025-11-25 12:08:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1743	susana	3032	{18101}	complementaria	CHARLA TRATA DE PERSONAS (4º B)	OI CON MÉDICOS DEL MUNDO	2025-11-25 12:08:00	2025-11-25 12:09:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	susana
1744	emurielb76	3037	{18101}	complementaria	Visita TLA Cruz Roja, Badajoz.	Lola Narciso on 2º GM. Toda la mañana, de 8:30 a 14:00.	2025-11-25 12:14:00	2025-11-25 12:21:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1746	mebravom01	3039	{18101}	complementaria	VISITA AL MUSEO ETNOGRÁFICO	Salida 9 h\r\nllegada al Museo 10 h\r\nVisita al Museo 11:30 h\r\nDesayuno Saludable 13 h\r\nRegreso 13:45 h	2025-11-21 12:00:00	2025-11-21 12:07:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{mebravom01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mebravom01
1751	pety78	3037	{18101}	complementaria	Formación en el aula con Funpasos	El alumnado de 1º de Ciclo Formativo de Grado Superior de técnico en Educación Infantil, recibirá en las horas de clases de Didáctica y Digitalización, una formación dentro del proyecto Eramus+ ODS Generation, una formación a cargo de técnicos de Funpasos (entidad que coordina el proyecto Erasmus+)\r\nActividad complementaria, no extraescolar.	2025-11-05 12:19:00	2025-11-05 12:21:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{pety78}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	pety78
163	emurielb76	3032	{12535,12537,17284,12500,12539,16251,14666,18101,12540,15881,18100,14664,12553,16996,12551,17360,12530,12528,18099,12534,12545,14594,16995,12541,12543,17361,12547,12548,15518,16906,16905}	complementaria	No programar actividades a 3ª hora.	No programar actividades a 3ª hora.	2026-02-24 00:00:00	2026-02-24 00:00:00	3	3	1	2026-02-18 11:47:09.649324	2026-02-23 07:31:31.184787	{profealu}	IES Francisco de Orellana	{"lat": 40.4168, "lng": -3.7038}	f	emurielb76
1690	emurielb76	3032	{12541,12543,16995}	complementaria	VIOLENCIA MACHISTA DIGITAL 3º A, B Y DIVER	VIOLENCIA MACHISTA DIGITAL 3º A, B Y DIVER Malvaluna	2026-03-03 00:00:00	2026-03-03 00:00:00	1	7	2	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
1756	pagarciam27	3038	{12547,12548,17361}	complementaria	Taller "Diseño 2D con Inscape" en el Circular Fab, 4ºESO TAE	10 alumnos de 4ºESO de la asignatura "Taller de Artes escénicas" participarán en este taller en el I-novo.	2025-10-21 00:00:00	2025-10-21 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 10:51:52.104555	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1754	vpalaciosg06	3032	{12553,16996}	complementaria	FERIA EDUCATIVA UEX	Visita a la Feria Educativa UEX en Cáceres	2025-10-30 00:00:00	2025-10-30 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 10:52:39.726983	{vpalaciosg06}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1753	mdcpalaciosr01	3039	{12535,12537,17284,12500,12539,16251,14666,18101,12540,15881,18100,12553,16996,12551,17360,12530,12528,18099,12534,12545,16995,12541,12543,17361,12547,12548}	complementaria	actividades Hallowen. todos los cursos	actividades Hallowen. todos los cursos	2025-10-31 00:00:00	2025-10-31 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 10:52:53.687021	{mdcpalaciosr01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1750	mdcpalaciosr01	3033	{12535,12537}	complementaria	CIENCIA CIRCULAR. 1º Bachillerato(Biología)	Taller de Ciencia Circular con la UNEX	2025-11-14 00:00:00	2025-11-14 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 11:08:05.325674	{mdcpalaciosr01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1749	susana	3032	{12528}	complementaria	HIGIENE Y HÁBITOS SALUDABLES (2º ESO B))	IMPARTIDO POR EL PROPREFAME	2025-11-17 00:00:00	2025-11-17 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 11:08:33.686462	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1748	susana	3032	{12530}	complementaria	HIGIENE Y HÁBITOS SALUDABLES (2º ESO A))	IMPARTIDO POR EL PROPREFAME	2025-11-18 00:00:00	2025-11-18 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 11:08:51.013797	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1741	susana	3032	{12539}	complementaria	TALLER AMOR ROMÁNTICO (1º ESO B)	IMPARTIDO PROPREFAME	2025-11-25 00:00:00	2025-11-25 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 11:10:47.439314	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1745	mji3003	3038	{12535,12537,12541,12543}	complementaria	TEATRO 3ºESO y 1º BACHILLERATO	Asistencia a la representación de Rinconete y Cortadillo en el teatro de Trujillo.	2025-11-25 00:00:00	2025-11-25 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-11 08:14:42.936583	{mji3003}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
165	emurielb76	3032	{12528}	complementaria	Charla Magistrado 2º ESO B	Charla magistrado intervenciones 2º eso	2026-03-05 00:00:00	2026-03-05 00:00:00	3	3	1	2026-02-19 07:38:10.365361	2026-02-23 07:31:31.184787	{emurielb76}	IES Francisco de Orellana	{"lat": 40.4168, "lng": -3.7038}	f	emurielb76
1701	emurielb76	3040	{18101}	complementaria	Viaje París 3º ESO con I. Lozano y Sara	Viaje París 3º ESO con I. Lozano y Sara	2026-02-05 00:00:00	2026-02-05 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{ilozano1977,sromang06}	París, Isla de Francia, Francia metropolitana, Francia	{"lat": 48.8588897, "lng": 2.320041}	f	emurielb76
162	emurielb76	3032	{12548}	complementaria	Asociación Malvaluna (Responsable Laly)	Charlas con motivo del 8M.	2026-03-03 00:00:00	2026-03-03 00:00:00	7	7	2	2026-02-18 11:29:54.277333	2026-02-23 07:31:31.184787	{profealu}	IES Francisco de Orellana	{"lat": 40.4168, "lng": -3.7038}	f	emurielb76
161	emurielb76	3032	{17361,12547}	complementaria	Charla Asociación Malvaluna (responsable LALY)	Charla con motivo del 8M	2026-03-03 00:00:00	2026-03-03 00:00:00	6	6	2	2026-02-18 11:28:14.821906	2026-02-23 07:31:31.184787	{profealu}	IES Francisco de Orellana	{"lat": 40.4168, "lng": -3.7038}	f	emurielb76
1639	emurielb76	3039	{17360,17361,12547,12548}	complementaria	GRADUACIÓN 4º ESO Y 2º CFGB	Graduación 4º ESO y CFGB	2026-06-17 00:00:00	2026-06-17 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-02-23 07:31:31.184787	{emurielb76}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
164	emurielb76	3032	{12530}	complementaria	Charla Magistrado para 2º ESO	Charla Magistrado intervenciones 2º ESO	2026-03-05 00:00:00	2026-03-05 00:00:00	2	2	1	2026-02-19 07:36:22.707284	2026-02-23 07:31:31.184787	{emurielb76}	IES Francisco de Orellana	{"lat": 40.4168, "lng": -3.7038}	f	emurielb76
168	emurielb76	3039	{12535,12537}	complementaria	Viaje 1º Bachillerato	Viaje 1º Bachillerato Praga con Elena G. y Marisol	2026-03-23 00:00:00	2026-03-23 00:00:00	1	7	1	2026-02-19 15:31:42.608916	2026-02-23 07:31:31.184787	{egonzalezh18}	Praga, Prague, Chequia	{"lat": 50.0874654, "lng": 14.4212535}	f	emurielb76
166	emurielb76	3032	{17360,12528}	complementaria	Charlas Guardia Civil	Charlas GC Intervenciones 2º ESO	2026-04-15 00:00:00	2026-04-15 00:00:00	5	5	1	2026-02-19 08:39:12.416357	2026-02-23 09:16:54.084542	{learob}	IES Francisco de Orellana	{"lat": 40.4168, "lng": -3.7038}	f	emurielb76
1658	emurielb76	3032	{17284,12530}	complementaria	Charlas Guardia Civil	2º ESO A y 1º CFGB	2026-04-15 00:00:00	2026-04-15 00:00:00	3	3	1	2026-02-12 12:51:34.675032	2026-02-23 09:17:50.397929	{learob}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
170	vpalaciosg06	3032	{16995,12541,12543}	complementaria	CHARLA MALVALUNA	VIOLENCIA MACHISTA DIGITAL\nPROFESORES CELIA, ELENA G Y OLGA	2026-04-14 00:00:00	2026-04-14 00:00:00	3	3	1	2026-02-23 13:12:47.592604	2026-02-25 09:30:40.950735	{vpalaciosg06,mgperezr02}	IES FRANCISCO DE ORELLANA	{"lat": 40.4168, "lng": -3.7038}	f	vpalaciosg06
183	emurielb76	3039	{12547,17361}	complementaria	3ª JORNADA ESCUELA 4.0	3ª JORNADA ESCUELA 4.0 REA 4º ESO A Y DIVER	2026-05-26 00:00:00	2026-05-26 00:00:00	2	2	1	2026-03-16 10:05:32.228772	2026-03-16 10:06:00.216332	{jmmurillon01,mdcpalaciosr01,omsanchezg01}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	emurielb76
160	emurielb76	3032	{17361,12547}	complementaria	Oficina de Igualdad (Responsable Laly)	Taller con motivo del 8M. Por un error finalmente se hace para 2º ESO.	2026-03-03 00:00:00	2026-03-03 00:00:00	1	1	1	2026-02-18 11:25:52.821312	2026-03-03 07:47:43.108568	{learob}	IES Francisco de Orellana, Trujillo 	{"lat": 40.4168, "lng": -3.7038}	f	emurielb76
1755	mdcpalaciosr01	3038	{12535,12537}	complementaria	Día Internacional de las Bibliotecas, 1ºBachillerato	Los alumnos de 1ºBachillerato asistirán al acto por el día de las bibliotecas, enmarcándolo dentro de la Bienal de Vargas Llosa.	2025-10-24 00:00:00	2025-10-24 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 10:52:13.629607	{pagarciam27}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1752	mdcpalaciosr01	3032	{12500,12539,17361,12548,12547}	complementaria	TUTORÍA ENTRE IGUALES (1º Y 4º ESO)	SALIDA AL PARQUE SAN LÁZARO.	2025-11-04 00:00:00	2025-11-04 00:00:00	1	7	1	2026-02-12 12:51:34.675032	2026-03-10 10:53:34.928262	{susana}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
1684	vpalaciosg06	3032	{16995,17360}	complementaria	Charla Adicciones 3º DIVERSIFICACIÓN + 2º CFGB	Charla Adicciones 3º Diversificación + 2º CFGB\nOLGA Y BLANCA	2026-03-10 00:00:00	2026-03-10 00:00:00	6	6	1	2026-02-12 12:51:34.675032	2026-03-10 11:16:38.72636	{vpalaciosg06}	Trujillo, Cáceres, Extremadura, España	{"lat": 39.4605657, "lng": -5.8816626}	f	mdcpalaciosr01
\.


--
-- Data for Name: guardias_asignadas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.guardias_asignadas (id, fecha, idperiodo, uid_profesor_ausente, uid_profesor_cubridor, forzada, generada_automaticamente, uid_asignador, estado, confirmada, creada_en) FROM stdin;
\.


--
-- Data for Name: horario_profesorado; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.horario_profesorado (id, uid, dia_semana, idperiodo, tipo, gidnumber, idmateria, idestancia, curso_academico, creado_en) FROM stdin;
917	mapavonb01	2	3	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:15.93439
918	mapavonb01	3	6	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:15.950542
919	fatimapc20	2	7	lectiva	{12500}	1	7	2025-2026	2026-03-18 13:19:15.958658
920	fatimapc20	3	7	lectiva	{12500}	1	7	2025-2026	2026-03-18 13:19:15.967025
921	fatimapc20	4	2	lectiva	{12500}	1	7	2025-2026	2026-03-18 13:19:15.975508
922	fatimapc20	5	5	lectiva	{12500}	1	7	2025-2026	2026-03-18 13:19:15.983585
923	micostad01	1	1	lectiva	{12500}	4	7	2025-2026	2026-03-18 13:19:15.991867
924	micostad01	3	1	lectiva	{12500}	4	7	2025-2026	2026-03-18 13:19:16.000562
925	micostad01	5	6	lectiva	{12500}	4	7	2025-2026	2026-03-18 13:19:16.00866
926	mdcpalaciosr01	1	7	lectiva	{12500}	58	7	2025-2026	2026-03-18 13:19:16.016826
927	mdcpalaciosr01	3	3	lectiva	{12500}	58	7	2025-2026	2026-03-18 13:19:16.02529
928	mdcpalaciosr01	5	7	lectiva	{12500}	58	7	2025-2026	2026-03-18 13:19:16.033709
929	mjcorralesg01	2	5	lectiva	{12500,12539}	78	7	2025-2026	2026-03-18 13:19:16.042017
930	mjcorralesg01	4	6	lectiva	{12500,12539}	78	7	2025-2026	2026-03-18 13:19:16.108818
931	rjrodriguezp01	2	5	lectiva	{12500}	77	7	2025-2026	2026-03-18 13:19:16.117133
932	rjrodriguezp01	4	6	lectiva	{12500}	77	7	2025-2026	2026-03-18 13:19:16.125475
933	celita2	2	5	lectiva	{12539}	40	6	2025-2026	2026-03-18 13:19:16.133798
934	celita2	4	6	lectiva	{12539}	40	6	2025-2026	2026-03-18 13:19:16.142165
935	ilozano1977	1	3	lectiva	{12500,12539}	3	7	2025-2026	2026-03-18 13:19:16.150718
936	ilozano1977	3	5	lectiva	{12500,12539,18100}	3	7	2025-2026	2026-03-18 13:19:16.158815
937	micostad01	1	3	lectiva	{12500,12539}	26	7	2025-2026	2026-03-18 13:19:16.167219
938	micostad01	3	5	lectiva	{12500,12539}	26	7	2025-2026	2026-03-18 13:19:16.175572
939	omsanchezg01	1	3	lectiva	{12500,12539}	25	7	2025-2026	2026-03-18 13:19:16.1838
940	omsanchezg01	3	5	lectiva	{12500,12539}	25	7	2025-2026	2026-03-18 13:19:16.192282
941	mahernandezr06	1	3	lectiva	{12500,12539}	47	7	2025-2026	2026-03-18 13:19:16.200522
942	mahernandezr06	3	5	lectiva	{12500,12539}	47	7	2025-2026	2026-03-18 13:19:16.208812
12993	a_carlosss76	1	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.00197
945	fatimapc20	2	6	lectiva	{12500}	97	7	2025-2026	2026-03-18 13:19:16.233833
946	rencinasr02	2	6	lectiva	{12539}	97	6	2025-2026	2026-03-18 13:19:16.242156
947	a_carlosss76	2	6	lectiva	{12548}	97	53	2025-2026	2026-03-18 13:19:16.250527
948	mafloresm01	2	6	lectiva	{17361,12547}	97	52	2025-2026	2026-03-18 13:19:16.259106
949	omsanchezg01	2	6	lectiva	{17361,12547}	34	52	2025-2026	2026-03-18 13:19:16.267222
950	mebravom01	4	7	lectiva	{12500,12539}	90	7	2025-2026	2026-03-18 13:19:16.275546
951	egonzalezh18	4	7	lectiva	{12500,12539}	30	7	2025-2026	2026-03-18 13:19:16.283986
952	mafloresm01	1	6	lectiva	{12500}	5	7	2025-2026	2026-03-18 13:19:16.29242
953	mafloresm01	2	1	lectiva	{12500}	5	7	2025-2026	2026-03-18 13:19:16.300724
954	mafloresm01	4	1	lectiva	{12500}	5	7	2025-2026	2026-03-18 13:19:16.308921
955	mafloresm01	5	1	lectiva	{12500}	5	7	2025-2026	2026-03-18 13:19:16.317263
956	micostad01	1	7	lectiva	{12539}	4	6	2025-2026	2026-03-18 13:19:16.325597
957	micostad01	2	3	lectiva	{12539}	4	6	2025-2026	2026-03-18 13:19:16.333913
958	micostad01	4	2	lectiva	{12539}	4	6	2025-2026	2026-03-18 13:19:16.342438
959	afloresc27	2	2	lectiva	{12500}	54	7	2025-2026	2026-03-18 13:19:16.35059
960	afloresc27	4	5	lectiva	{12500}	54	7	2025-2026	2026-03-18 13:19:16.358964
961	sromang06	2	3	lectiva	{12530}	7	64	2025-2026	2026-03-18 13:19:16.367265
962	sromang06	3	5	lectiva	{12530}	7	64	2025-2026	2026-03-18 13:19:16.375587
963	sromang06	5	6	lectiva	{12530}	7	64	2025-2026	2026-03-18 13:19:16.383931
964	micostad01	1	5	lectiva	{12530}	4	64	2025-2026	2026-03-18 13:19:16.392302
965	micostad01	2	5	lectiva	{12530}	4	64	2025-2026	2026-03-18 13:19:16.400697
966	micostad01	4	1	lectiva	{12530}	4	64	2025-2026	2026-03-18 13:19:16.409145
967	djuliog01	2	5	lectiva	{12528}	5	65	2025-2026	2026-03-18 13:19:16.417415
968	djuliog01	3	6	lectiva	{12528}	5	65	2025-2026	2026-03-18 13:19:16.425724
969	djuliog01	5	6	lectiva	{12528}	5	65	2025-2026	2026-03-18 13:19:16.433984
970	rjrodriguezp01	1	6	lectiva	{12530,12528}	77	64	2025-2026	2026-03-18 13:19:16.442306
971	rjrodriguezp01	3	7	lectiva	{12530,12528}	77	64	2025-2026	2026-03-18 13:19:16.450643
972	rjrodriguezp01	4	2	lectiva	{12530,12528}	77	64	2025-2026	2026-03-18 13:19:16.458993
973	mjcorralesg01	1	6	lectiva	{12530,12528}	78	64	2025-2026	2026-03-18 13:19:16.467305
974	mjcorralesg01	3	7	lectiva	{12530,12528}	78	64	2025-2026	2026-03-18 13:19:16.475599
975	mjcorralesg01	4	2	lectiva	{12530,12528}	78	64	2025-2026	2026-03-18 13:19:16.483954
976	mmansillap01	1	3	lectiva	{12530}	54	64	2025-2026	2026-03-18 13:19:16.492291
977	mmansillap01	3	3	lectiva	{12530}	54	64	2025-2026	2026-03-18 13:19:16.500606
978	mahernandezr06	3	1	lectiva	{12530}	9	64	2025-2026	2026-03-18 13:19:16.509136
979	mahernandezr06	5	5	lectiva	{12530}	9	64	2025-2026	2026-03-18 13:19:16.517418
944	amsanchezs01	3	5	lectiva	{12539}	26	83	2025-2026	2026-03-18 13:19:16.225523
12995	ndelorzac02	1	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.016089
980	ilozano1977	2	6	lectiva	{12530,12528}	3	64	2025-2026	2026-03-18 13:19:16.526036
981	ilozano1977	4	3	lectiva	{12530,12528}	3	64	2025-2026	2026-03-18 13:19:16.534001
982	jjmorcillor01	2	6	lectiva	{12530,12528}	26	64	2025-2026	2026-03-18 13:19:16.542346
983	jjmorcillor01	4	3	lectiva	{12530,12528}	26	64	2025-2026	2026-03-18 13:19:16.55067
984	mahernandezr06	2	6	lectiva	{12530,12528}	25	64	2025-2026	2026-03-18 13:19:16.592307
985	mahernandezr06	4	3	lectiva	{12530,12528}	25	64	2025-2026	2026-03-18 13:19:16.600633
986	micostad01	2	6	lectiva	{12530,12528}	59	64	2025-2026	2026-03-18 13:19:16.609002
987	micostad01	4	3	lectiva	{12530,12528}	59	64	2025-2026	2026-03-18 13:19:16.617318
988	ilozano1977	3	6	lectiva	{12530,12534}	53	64	2025-2026	2026-03-18 13:19:16.625777
989	ilozano1977	5	7	lectiva	{12530}	53	64	2025-2026	2026-03-18 13:19:16.633984
990	ilozano1977	2	1	lectiva	{12530}	97	64	2025-2026	2026-03-18 13:19:16.642382
991	mahernandezr06	2	1	lectiva	{12528}	97	65	2025-2026	2026-03-18 13:19:16.650703
992	efranciscor01	2	1	lectiva	{12528,12530}	\N	65	2025-2026	2026-03-18 13:19:16.659067
993	mebravom01	5	2	lectiva	{12530,12528}	90	64	2025-2026	2026-03-18 13:19:16.667358
994	mmansillap01	5	2	lectiva	{12530,12528}	30	64	2025-2026	2026-03-18 13:19:16.675683
995	sromang06	1	5	lectiva	{12528}	7	65	2025-2026	2026-03-18 13:19:16.68399
996	sromang06	3	1	lectiva	{12528}	7	65	2025-2026	2026-03-18 13:19:16.692369
997	sromang06	5	3	lectiva	{12528}	7	65	2025-2026	2026-03-18 13:19:16.700686
998	micostad01	2	2	lectiva	{12528}	4	65	2025-2026	2026-03-18 13:19:16.709177
999	micostad01	4	6	lectiva	{12528}	4	65	2025-2026	2026-03-18 13:19:16.717368
1000	micostad01	5	5	lectiva	{12528}	4	65	2025-2026	2026-03-18 13:19:16.725703
1001	mmansillap01	1	1	lectiva	{12528}	54	65	2025-2026	2026-03-18 13:19:16.734025
1002	mmansillap01	3	5	lectiva	{12528}	54	65	2025-2026	2026-03-18 13:19:16.742411
1003	mahernandezr06	1	7	lectiva	{12528}	9	65	2025-2026	2026-03-18 13:19:16.75073
1004	mahernandezr06	4	7	lectiva	{12528}	9	65	2025-2026	2026-03-18 13:19:16.759097
1005	jjmorcillor01	2	7	lectiva	{12528}	53	65	2025-2026	2026-03-18 13:19:16.767386
1006	jjmorcillor01	4	1	lectiva	{12528}	53	65	2025-2026	2026-03-18 13:19:16.775694
1007	mapavonb01	1	3	lectiva	{12541}	6	46	2025-2026	2026-03-18 13:19:16.78404
1008	mapavonb01	3	5	lectiva	{12541}	6	46	2025-2026	2026-03-18 13:19:16.792505
1009	mapavonb01	4	2	lectiva	{12541}	6	46	2025-2026	2026-03-18 13:19:16.800693
1010	mapavonb01	5	5	lectiva	{12541}	6	46	2025-2026	2026-03-18 13:19:16.809061
1011	mssalomonp02	1	5	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.817398
1012	mssalomonp02	3	1	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.825755
1013	mssalomonp02	4	1	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.834058
1014	mssalomonp02	5	3	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.842476
1015	nmaciasp02	1	5	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.850788
1016	nmaciasp02	3	1	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.859409
1017	nmaciasp02	4	1	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.867418
1018	nmaciasp02	5	3	lectiva	{12541,12543}	104	46	2025-2026	2026-03-18 13:19:16.875924
1019	egonzalezh18	3	6	lectiva	{12541,12543}	40	46	2025-2026	2026-03-18 13:19:16.885282
1020	egonzalezh18	5	2	lectiva	{12541,12543}	40	46	2025-2026	2026-03-18 13:19:16.892488
1021	celita2	3	6	lectiva	{12541,12543}	40	46	2025-2026	2026-03-18 13:19:16.900801
1022	celita2	5	2	lectiva	{12541,12543}	40	46	2025-2026	2026-03-18 13:19:16.909146
1023	amfajardol01	3	6	lectiva	{12543,12541}	103	48	2025-2026	2026-03-18 13:19:16.917467
1024	amfajardol01	5	2	lectiva	{12543,12541}	103	48	2025-2026	2026-03-18 13:19:16.925819
1025	jrodriguezt18	1	6	lectiva	{12541}	4	46	2025-2026	2026-03-18 13:19:16.934118
1026	jrodriguezt18	3	2	lectiva	{12541}	4	46	2025-2026	2026-03-18 13:19:16.942499
1027	jrodriguezt18	4	5	lectiva	{12541}	4	46	2025-2026	2026-03-18 13:19:16.950816
1028	mrcarmonav01	1	2	lectiva	{12541}	5	46	2025-2026	2026-03-18 13:19:16.959367
1029	mrcarmonav01	2	6	lectiva	{12541}	5	46	2025-2026	2026-03-18 13:19:16.967488
1030	mrcarmonav01	3	7	lectiva	{12541}	5	46	2025-2026	2026-03-18 13:19:16.975821
1031	dmatasr01	2	5	lectiva	{12541}	9	46	2025-2026	2026-03-18 13:19:16.984153
1032	dmatasr01	5	7	lectiva	{12541}	9	46	2025-2026	2026-03-18 13:19:16.99249
1033	mmansillap01	2	7	lectiva	{12541,16995}	54	46	2025-2026	2026-03-18 13:19:17.00085
1034	mmansillap01	4	7	lectiva	{12541,16995}	54	46	2025-2026	2026-03-18 13:19:17.009157
1035	sromang06	1	1	lectiva	{12541}	7	46	2025-2026	2026-03-18 13:19:17.01747
1036	sromang06	2	1	lectiva	{12541}	7	46	2025-2026	2026-03-18 13:19:17.025825
1037	sromang06	3	3	lectiva	{12541}	7	46	2025-2026	2026-03-18 13:19:17.034156
1038	mjcorralesg01	2	2	lectiva	{12541,12543,16995}	76	46	2025-2026	2026-03-18 13:19:17.042654
1039	mjcorralesg01	5	6	lectiva	{12541,12543,16995}	76	46	2025-2026	2026-03-18 13:19:17.05085
1040	jjmorcillor01	2	2	lectiva	{12541,12543,16995}	43	46	2025-2026	2026-03-18 13:19:17.059224
1041	jjmorcillor01	5	6	lectiva	{12541,12543,16995}	43	46	2025-2026	2026-03-18 13:19:17.067516
1042	ilozano1977	2	2	lectiva	{12541,12543,16995}	3	46	2025-2026	2026-03-18 13:19:17.075864
1043	ilozano1977	5	6	lectiva	{12541,12543,16995}	3	46	2025-2026	2026-03-18 13:19:17.084211
1044	mebravom01	5	1	lectiva	{12541,16995,12543}	90	46	2025-2026	2026-03-18 13:19:17.092563
1045	mtcerezog01	5	1	lectiva	{12541,16995}	30	46	2025-2026	2026-03-18 13:19:17.100958
1046	omsanchezg01	5	1	lectiva	{12543}	30	48	2025-2026	2026-03-18 13:19:17.109238
1047	mapavonb01	1	7	lectiva	{12543}	6	48	2025-2026	2026-03-18 13:19:17.117734
1048	mapavonb01	2	1	lectiva	{12543}	6	48	2025-2026	2026-03-18 13:19:17.126269
1049	mapavonb01	3	2	lectiva	{12543}	6	48	2025-2026	2026-03-18 13:19:17.134214
1050	mapavonb01	5	7	lectiva	{12543}	6	48	2025-2026	2026-03-18 13:19:17.14267
1051	sromang06	1	6	lectiva	{12543}	7	48	2025-2026	2026-03-18 13:19:17.150998
1052	sromang06	2	5	lectiva	{12543}	7	48	2025-2026	2026-03-18 13:19:17.192658
1053	sromang06	4	2	lectiva	{12543}	7	48	2025-2026	2026-03-18 13:19:17.201012
1054	jrodriguezt18	1	3	lectiva	{12543}	4	48	2025-2026	2026-03-18 13:19:17.209333
1055	jrodriguezt18	3	5	lectiva	{12543}	4	48	2025-2026	2026-03-18 13:19:17.21766
1056	jrodriguezt18	4	6	lectiva	{12543}	4	48	2025-2026	2026-03-18 13:19:17.22598
1057	djuliog01	2	6	lectiva	{12543}	5	48	2025-2026	2026-03-18 13:19:17.234279
1058	djuliog01	3	7	lectiva	{12543}	5	48	2025-2026	2026-03-18 13:19:17.242774
1059	djuliog01	5	5	lectiva	{12543}	5	48	2025-2026	2026-03-18 13:19:17.251001
1060	dmatasr01	2	7	lectiva	{12543}	9	48	2025-2026	2026-03-18 13:19:17.25925
1061	dmatasr01	4	7	lectiva	{12543}	9	48	2025-2026	2026-03-18 13:19:17.267595
1062	mtcerezog01	1	3	lectiva	{16995}	38	49	2025-2026	2026-03-18 13:19:17.275953
1063	mtcerezog01	1	6	lectiva	{16995}	38	49	2025-2026	2026-03-18 13:19:17.284306
1064	mtcerezog01	2	1	lectiva	{16995}	38	49	2025-2026	2026-03-18 13:19:17.292642
1065	mtcerezog01	3	1	lectiva	{16995}	38	49	2025-2026	2026-03-18 13:19:17.301006
1066	mtcerezog01	3	3	lectiva	{16995}	38	49	2025-2026	2026-03-18 13:19:17.309309
1067	mtcerezog01	3	5	lectiva	{16995}	38	49	2025-2026	2026-03-18 13:19:17.317671
1068	mtcerezog01	4	1	lectiva	{16995}	38	49	2025-2026	2026-03-18 13:19:17.326035
1069	omsanchezg01	1	2	lectiva	{16995}	27	49	2025-2026	2026-03-18 13:19:17.334337
1070	omsanchezg01	2	3	lectiva	{16995}	27	49	2025-2026	2026-03-18 13:19:17.342673
1071	omsanchezg01	2	5	lectiva	{16995}	27	49	2025-2026	2026-03-18 13:19:17.351028
1072	omsanchezg01	3	7	lectiva	{16995}	27	49	2025-2026	2026-03-18 13:19:17.359273
1073	omsanchezg01	4	5	lectiva	{16995}	27	49	2025-2026	2026-03-18 13:19:17.367631
1074	omsanchezg01	5	2	lectiva	{16995}	27	49	2025-2026	2026-03-18 13:19:17.375967
1075	omsanchezg01	5	3	lectiva	{16995}	27	49	2025-2026	2026-03-18 13:19:17.384365
1076	mrcarmonav01	1	5	lectiva	{16995}	5	49	2025-2026	2026-03-18 13:19:17.392728
1077	mrcarmonav01	3	6	lectiva	{16995}	5	49	2025-2026	2026-03-18 13:19:17.401039
1078	mrcarmonav01	5	5	lectiva	{16995}	5	49	2025-2026	2026-03-18 13:19:17.409479
1079	mdcpalaciosr01	1	1	lectiva	{16995}	36	49	2025-2026	2026-03-18 13:19:17.417706
1080	mdcpalaciosr01	2	6	lectiva	{16995}	36	49	2025-2026	2026-03-18 13:19:17.426156
1081	mdcpalaciosr01	3	2	lectiva	{16995}	36	49	2025-2026	2026-03-18 13:19:17.434447
1082	mdcpalaciosr01	4	2	lectiva	{16995}	36	49	2025-2026	2026-03-18 13:19:17.442698
1083	mrcarmonav01	4	3	lectiva	{16995,12541}	97	49	2025-2026	2026-03-18 13:19:17.451049
1084	mtcerezog01	4	3	lectiva	{12541}	34	46	2025-2026	2026-03-18 13:19:17.459359
1085	dmatasr01	4	3	lectiva	{12543}	97	48	2025-2026	2026-03-18 13:19:17.467675
1086	dnarcisoc01	4	3	lectiva	{12543}	\N	48	2025-2026	2026-03-18 13:19:17.476017
1087	a_carlosss76	1	1	lectiva	{12547}	4	54	2025-2026	2026-03-18 13:19:17.484367
1088	a_carlosss76	3	5	lectiva	{12547}	4	54	2025-2026	2026-03-18 13:19:17.492836
1089	a_carlosss76	4	1	lectiva	{12547}	4	54	2025-2026	2026-03-18 13:19:17.501053
1090	mahernandezr06	1	5	lectiva	{12547,12548,17361}	94	54	2025-2026	2026-03-18 13:19:17.509357
1091	mahernandezr06	3	6	lectiva	{12547,12548,17361}	94	54	2025-2026	2026-03-18 13:19:17.517739
1092	mahernandezr06	4	5	lectiva	{12547,12548,17361}	94	54	2025-2026	2026-03-18 13:19:17.526068
1093	mgranadob01	1	5	lectiva	{12547,12548,17361}	58	54	2025-2026	2026-03-18 13:19:17.5344
1094	mgranadob01	3	6	lectiva	{12547,12548,17361}	58	54	2025-2026	2026-03-18 13:19:17.542734
1095	mgranadob01	4	5	lectiva	{12547,12548,17361}	58	54	2025-2026	2026-03-18 13:19:17.551093
1096	mjcorralesg01	1	5	lectiva	{12547,12548}	78	54	2025-2026	2026-03-18 13:19:17.559422
1097	mjcorralesg01	3	6	lectiva	{12547,12548}	78	54	2025-2026	2026-03-18 13:19:17.56773
1098	mjcorralesg01	4	5	lectiva	{12547,12548}	78	54	2025-2026	2026-03-18 13:19:17.576171
1099	rjrodriguezp01	1	5	lectiva	{12547,12548,17361}	77	54	2025-2026	2026-03-18 13:19:17.584435
1100	rjrodriguezp01	3	6	lectiva	{12547,12548,17361}	77	54	2025-2026	2026-03-18 13:19:17.592781
1101	rjrodriguezp01	4	5	lectiva	{12547,12548,17361}	77	54	2025-2026	2026-03-18 13:19:17.601118
1102	mgperezr02	1	5	lectiva	{12547,12548,17361}	68	54	2025-2026	2026-03-18 13:19:17.609441
1103	mgperezr02	3	6	lectiva	{12547,12548,17361}	68	54	2025-2026	2026-03-18 13:19:17.617785
1104	mgperezr02	4	5	lectiva	{12547,12548,17361}	68	54	2025-2026	2026-03-18 13:19:17.626105
1105	pagarciam27	1	6	lectiva	{12547}	6	54	2025-2026	2026-03-18 13:19:17.634457
1106	pagarciam27	3	2	lectiva	{12547}	6	54	2025-2026	2026-03-18 13:19:17.642787
1107	pagarciam27	4	3	lectiva	{12547}	6	54	2025-2026	2026-03-18 13:19:17.6511
1108	pagarciam27	5	6	lectiva	{12547}	6	54	2025-2026	2026-03-18 13:19:17.659529
1109	celita2	4	7	lectiva	{12547}	41	54	2025-2026	2026-03-18 13:19:17.667772
1110	amfajardol01	4	7	lectiva	{12547}	103	54	2025-2026	2026-03-18 13:19:17.676075
1111	jmmurillon01	1	2	lectiva	{12547}	7	54	2025-2026	2026-03-18 13:19:17.684477
1112	jmmurillon01	2	2	lectiva	{12547}	7	54	2025-2026	2026-03-18 13:19:17.692804
1113	jmmurillon01	3	7	lectiva	{12547}	7	54	2025-2026	2026-03-18 13:19:17.701159
1114	mafloresm01	1	3	lectiva	{12547}	5	54	2025-2026	2026-03-18 13:19:17.709425
1115	mafloresm01	3	1	lectiva	{12547}	5	54	2025-2026	2026-03-18 13:19:17.717802
1116	mafloresm01	4	6	lectiva	{12547}	5	54	2025-2026	2026-03-18 13:19:17.726418
1117	mafloresm01	5	2	lectiva	{12547}	5	54	2025-2026	2026-03-18 13:19:17.734495
1118	mebravom01	5	7	lectiva	{12547,17361,12548}	90	54	2025-2026	2026-03-18 13:19:17.743017
1119	mahernandezr06	5	7	lectiva	{12547,17361}	30	54	2025-2026	2026-03-18 13:19:17.751186
1120	egonzalezh18	5	7	lectiva	{12548}	30	53	2025-2026	2026-03-18 13:19:17.792897
1121	mssalomonp02	1	7	lectiva	{12547,12548}	74	54	2025-2026	2026-03-18 13:19:17.801153
1122	mssalomonp02	2	3	lectiva	{12547,12548}	74	54	2025-2026	2026-03-18 13:19:17.809545
1123	mssalomonp02	3	3	lectiva	{12547,12548}	74	54	2025-2026	2026-03-18 13:19:17.817978
1124	mssalomonp02	5	5	lectiva	{12547,12548}	74	54	2025-2026	2026-03-18 13:19:17.826223
1125	nmaciasp02	1	7	lectiva	{12547,12548}	104	54	2025-2026	2026-03-18 13:19:17.834554
1126	nmaciasp02	2	3	lectiva	{12547,12548}	104	54	2025-2026	2026-03-18 13:19:17.842884
1127	nmaciasp02	3	3	lectiva	{12547,12548}	104	54	2025-2026	2026-03-18 13:19:17.851239
1128	nmaciasp02	5	5	lectiva	{12547,12548}	104	54	2025-2026	2026-03-18 13:19:17.85964
1129	rencinasr02	1	7	lectiva	{12547}	72	54	2025-2026	2026-03-18 13:19:17.867863
1130	rencinasr02	2	3	lectiva	{12547}	72	54	2025-2026	2026-03-18 13:19:17.876208
1131	rencinasr02	3	3	lectiva	{12547}	72	54	2025-2026	2026-03-18 13:19:17.884549
1132	rencinasr02	5	5	lectiva	{12547}	72	54	2025-2026	2026-03-18 13:19:17.892888
1133	mmhernandezr01	1	1	lectiva	{12548}	6	53	2025-2026	2026-03-18 13:19:17.901229
1134	mmhernandezr01	3	2	lectiva	{12548}	6	53	2025-2026	2026-03-18 13:19:17.909573
1135	mmhernandezr01	4	1	lectiva	{12548}	6	53	2025-2026	2026-03-18 13:19:17.918442
1136	mmhernandezr01	5	1	lectiva	{12548}	6	53	2025-2026	2026-03-18 13:19:17.926325
1137	mdpmartinezf01	1	3	lectiva	{12548}	5	53	2025-2026	2026-03-18 13:19:17.934622
1138	mdpmartinezf01	2	2	lectiva	{12548}	5	53	2025-2026	2026-03-18 13:19:17.943117
1139	mdpmartinezf01	3	1	lectiva	{12548}	5	53	2025-2026	2026-03-18 13:19:17.951401
1140	mdpmartinezf01	4	3	lectiva	{12548}	5	53	2025-2026	2026-03-18 13:19:17.959558
1141	afloresc27	2	1	lectiva	{17361,12547}	54	52	2025-2026	2026-03-18 13:19:17.967929
1142	afloresc27	5	1	lectiva	{17361,12547}	54	52	2025-2026	2026-03-18 13:19:17.976256
1143	a_carlosss76	1	2	lectiva	{12548}	4	53	2025-2026	2026-03-18 13:19:17.984613
1144	a_carlosss76	3	7	lectiva	{12548}	4	53	2025-2026	2026-03-18 13:19:17.992932
1145	a_carlosss76	5	2	lectiva	{12548}	4	53	2025-2026	2026-03-18 13:19:18.001289
1146	cjlozanop01	1	3	lectiva	{12535}	60	50	2025-2026	2026-03-18 13:19:18.009487
1147	cjlozanop01	2	2	lectiva	{12535}	60	50	2025-2026	2026-03-18 13:19:18.017878
1148	cjlozanop01	3	6	lectiva	{12535}	60	50	2025-2026	2026-03-18 13:19:18.026402
1149	mji3003	1	7	lectiva	{12535}	6	50	2025-2026	2026-03-18 13:19:18.034622
1150	mji3003	3	1	lectiva	{12535}	6	50	2025-2026	2026-03-18 13:19:18.042979
1151	mji3003	4	2	lectiva	{12535}	6	50	2025-2026	2026-03-18 13:19:18.051274
1152	mji3003	5	1	lectiva	{12535}	6	50	2025-2026	2026-03-18 13:19:18.059588
1153	mrcarmonav01	2	7	lectiva	{12535}	5	50	2025-2026	2026-03-18 13:19:18.067937
1154	mrcarmonav01	4	5	lectiva	{12535}	5	50	2025-2026	2026-03-18 13:19:18.076261
1155	mrcarmonav01	5	2	lectiva	{12535}	5	50	2025-2026	2026-03-18 13:19:18.084605
1156	mssalomonp02	1	1	lectiva	{12535}	1	50	2025-2026	2026-03-18 13:19:18.092947
1157	mssalomonp02	2	6	lectiva	{12535}	1	50	2025-2026	2026-03-18 13:19:18.101285
1158	mssalomonp02	4	3	lectiva	{12535}	1	50	2025-2026	2026-03-18 13:19:18.109743
1159	mssalomonp02	5	6	lectiva	{12535}	1	50	2025-2026	2026-03-18 13:19:18.11801
1160	egonzalezh18	1	5	lectiva	{12535,12537}	41	50	2025-2026	2026-03-18 13:19:18.126343
1161	egonzalezh18	2	1	lectiva	{12535,12537}	41	50	2025-2026	2026-03-18 13:19:18.134692
1162	egonzalezh18	3	3	lectiva	{12535,12537}	41	50	2025-2026	2026-03-18 13:19:18.143035
1163	egonzalezh18	5	5	lectiva	{12535,12537}	41	50	2025-2026	2026-03-18 13:19:18.151706
1164	dmatasr01	1	5	lectiva	{12535,12537}	93	50	2025-2026	2026-03-18 13:19:18.159673
1165	dmatasr01	2	1	lectiva	{12535,12537}	93	50	2025-2026	2026-03-18 13:19:18.167999
1166	dmatasr01	3	3	lectiva	{12535,12537}	93	50	2025-2026	2026-03-18 13:19:18.17633
1167	dmatasr01	5	5	lectiva	{12535,12537}	93	50	2025-2026	2026-03-18 13:19:18.226343
1168	a_carlosss76	1	5	lectiva	{12537}	16	51	2025-2026	2026-03-18 13:19:18.234785
1169	a_carlosss76	2	1	lectiva	{12537}	16	51	2025-2026	2026-03-18 13:19:18.243038
1170	a_carlosss76	3	3	lectiva	{12537}	16	51	2025-2026	2026-03-18 13:19:18.276327
1171	a_carlosss76	5	5	lectiva	{12537}	16	51	2025-2026	2026-03-18 13:19:18.284698
1172	mmansillap01	1	6	lectiva	{12535}	54	50	2025-2026	2026-03-18 13:19:18.29305
1173	mmansillap01	3	7	lectiva	{12535}	54	50	2025-2026	2026-03-18 13:19:18.301597
1174	mjcorralesg01	1	2	lectiva	{12535,12537}	33	50	2025-2026	2026-03-18 13:19:18.309701
1175	mjcorralesg01	2	3	lectiva	{12535,12537}	33	50	2025-2026	2026-03-18 13:19:18.318038
1176	mjcorralesg01	3	2	lectiva	{12535,12537}	33	50	2025-2026	2026-03-18 13:19:18.326386
1177	mjcorralesg01	4	1	lectiva	{12535,12537}	33	50	2025-2026	2026-03-18 13:19:18.351388
1178	mgranadob01	1	2	lectiva	{12535,12537}	50	50	2025-2026	2026-03-18 13:19:18.35981
1179	mgranadob01	2	3	lectiva	{12535,12537}	50	50	2025-2026	2026-03-18 13:19:18.368033
1180	mgranadob01	3	2	lectiva	{12535,12537}	50	50	2025-2026	2026-03-18 13:19:18.434872
1181	mgranadob01	4	1	lectiva	{12535,12537}	50	50	2025-2026	2026-03-18 13:19:18.443114
1182	mahernandezr06	1	2	lectiva	{12535,12537}	67	50	2025-2026	2026-03-18 13:19:18.451425
1183	mahernandezr06	2	3	lectiva	{12535,12537}	67	50	2025-2026	2026-03-18 13:19:18.476418
1184	mahernandezr06	3	2	lectiva	{12535,12537}	67	50	2025-2026	2026-03-18 13:19:18.484764
1185	mahernandezr06	4	1	lectiva	{12535,12537}	67	50	2025-2026	2026-03-18 13:19:18.493384
1186	ilozano1977	1	2	lectiva	{12535,12537,12534}	3	50	2025-2026	2026-03-18 13:19:18.501438
1187	ilozano1977	2	3	lectiva	{12535,12537,18100}	3	50	2025-2026	2026-03-18 13:19:18.509784
1188	ilozano1977	3	2	lectiva	{12535,12537}	3	50	2025-2026	2026-03-18 13:19:18.518281
1189	ilozano1977	4	1	lectiva	{12535,12537}	3	50	2025-2026	2026-03-18 13:19:18.560062
1190	cjlozanop01	1	6	lectiva	{12537}	60	51	2025-2026	2026-03-18 13:19:18.568085
1191	cjlozanop01	3	7	lectiva	{12537}	60	51	2025-2026	2026-03-18 13:19:18.576436
1192	cjlozanop01	5	6	lectiva	{12537}	60	51	2025-2026	2026-03-18 13:19:18.584819
1193	pagarciam27	1	1	lectiva	{12537}	6	51	2025-2026	2026-03-18 13:19:18.593094
1194	pagarciam27	2	7	lectiva	{12537}	6	51	2025-2026	2026-03-18 13:19:18.601475
1195	pagarciam27	3	1	lectiva	{12537}	6	51	2025-2026	2026-03-18 13:19:18.609788
1196	pagarciam27	4	7	lectiva	{12537}	6	51	2025-2026	2026-03-18 13:19:18.618112
1197	mrcarmonav01	1	7	lectiva	{12537}	5	51	2025-2026	2026-03-18 13:19:18.626464
1198	mrcarmonav01	3	5	lectiva	{12537}	5	51	2025-2026	2026-03-18 13:19:18.6349
1199	mrcarmonav01	5	1	lectiva	{12537}	5	51	2025-2026	2026-03-18 13:19:18.643158
1200	mmansillap01	2	6	lectiva	{12537}	54	51	2025-2026	2026-03-18 13:19:18.651312
1201	mmansillap01	4	2	lectiva	{12537}	54	51	2025-2026	2026-03-18 13:19:18.659694
1202	nmaciasp02	2	2	lectiva	{12537}	1	51	2025-2026	2026-03-18 13:19:18.66802
1203	nmaciasp02	3	6	lectiva	{12537}	1	51	2025-2026	2026-03-18 13:19:18.676392
1204	nmaciasp02	4	3	lectiva	{12537}	1	51	2025-2026	2026-03-18 13:19:18.684697
1205	nmaciasp02	5	7	lectiva	{12537}	1	51	2025-2026	2026-03-18 13:19:18.693115
1206	cblancoa02	2	2	lectiva	{12537}	11	51	2025-2026	2026-03-18 13:19:18.701481
1207	cblancoa02	3	6	lectiva	{12537}	11	51	2025-2026	2026-03-18 13:19:18.709817
1208	cblancoa02	4	3	lectiva	{12537}	11	51	2025-2026	2026-03-18 13:19:18.718235
1209	cblancoa02	5	7	lectiva	{12537}	11	51	2025-2026	2026-03-18 13:19:18.726424
1210	cjlozanop01	1	1	lectiva	{12553}	60	56	2025-2026	2026-03-18 13:19:18.734787
1211	cjlozanop01	2	1	lectiva	{12553}	60	56	2025-2026	2026-03-18 13:19:18.7432
1212	cjlozanop01	4	3	lectiva	{12553}	60	56	2025-2026	2026-03-18 13:19:18.751453
1213	mji3003	1	3	lectiva	{12553}	6	56	2025-2026	2026-03-18 13:19:18.759808
1214	mji3003	3	3	lectiva	{12553}	6	56	2025-2026	2026-03-18 13:19:18.768176
1215	mji3003	4	5	lectiva	{12553}	6	56	2025-2026	2026-03-18 13:19:18.776495
1216	mji3003	5	2	lectiva	{12553}	6	56	2025-2026	2026-03-18 13:19:18.78483
1217	celita2	1	5	lectiva	{12553,12551}	41	56	2025-2026	2026-03-18 13:19:18.793221
1218	celita2	2	6	lectiva	{12553,12551}	41	56	2025-2026	2026-03-18 13:19:18.801688
1219	celita2	3	2	lectiva	{12553,12551}	41	56	2025-2026	2026-03-18 13:19:18.809889
1220	celita2	5	5	lectiva	{12553,12551}	41	56	2025-2026	2026-03-18 13:19:18.818214
1221	jmmurillon01	1	5	lectiva	{12553,12551}	22	56	2025-2026	2026-03-18 13:19:18.826592
1222	jmmurillon01	2	6	lectiva	{12553,12551}	22	56	2025-2026	2026-03-18 13:19:18.834888
1223	jmmurillon01	3	2	lectiva	{12553,12551}	22	56	2025-2026	2026-03-18 13:19:18.843233
1224	jmmurillon01	5	5	lectiva	{12553,12551}	22	56	2025-2026	2026-03-18 13:19:18.851564
1225	cblancoa02	1	5	lectiva	{12551}	11	57	2025-2026	2026-03-18 13:19:18.859916
1226	cblancoa02	2	6	lectiva	{12551}	11	57	2025-2026	2026-03-18 13:19:18.868197
1227	cblancoa02	3	2	lectiva	{12551}	11	57	2025-2026	2026-03-18 13:19:18.876566
1228	cblancoa02	5	5	lectiva	{12551}	11	57	2025-2026	2026-03-18 13:19:18.884995
1229	jrodriguezt18	1	7	lectiva	{12553}	17	56	2025-2026	2026-03-18 13:19:18.893252
1230	jrodriguezt18	2	7	lectiva	{12553}	17	56	2025-2026	2026-03-18 13:19:18.901592
1231	jrodriguezt18	3	1	lectiva	{12553}	17	56	2025-2026	2026-03-18 13:19:18.909923
1232	jrodriguezt18	5	1	lectiva	{12553}	17	56	2025-2026	2026-03-18 13:19:18.918253
1233	dmatasr01	1	2	lectiva	{12553,12551}	93	56	2025-2026	2026-03-18 13:19:18.926613
1234	dmatasr01	2	2	lectiva	{12553,12551}	93	56	2025-2026	2026-03-18 13:19:18.934971
1235	dmatasr01	3	6	lectiva	{12553,12551}	93	56	2025-2026	2026-03-18 13:19:18.943241
1236	dmatasr01	4	1	lectiva	{12553,12551}	93	56	2025-2026	2026-03-18 13:19:18.951641
1237	jrodriguezt18	1	2	lectiva	{12553,12551}	62	56	2025-2026	2026-03-18 13:19:18.95995
1238	jrodriguezt18	2	2	lectiva	{12553,12551}	62	56	2025-2026	2026-03-18 13:19:18.968412
1239	jrodriguezt18	3	6	lectiva	{12553,12551}	62	56	2025-2026	2026-03-18 13:19:18.976645
1240	jrodriguezt18	4	1	lectiva	{12553,12551}	62	56	2025-2026	2026-03-18 13:19:18.984981
1241	sromang06	1	2	lectiva	{12553,12551}	23	56	2025-2026	2026-03-18 13:19:18.993307
1242	sromang06	2	2	lectiva	{12553,12551}	23	56	2025-2026	2026-03-18 13:19:19.00164
1243	sromang06	3	6	lectiva	{12553,12551}	23	56	2025-2026	2026-03-18 13:19:19.009988
1244	sromang06	4	1	lectiva	{12553,12551}	23	56	2025-2026	2026-03-18 13:19:19.018322
1245	jpcataland01	1	2	lectiva	{17284}	97	9	2025-2026	2026-03-18 13:19:19.026651
1246	efranciscor01	1	2	lectiva	{17284}	\N	9	2025-2026	2026-03-18 13:19:19.035026
1247	chisco	2	3	lectiva	{17284}	68	9	2025-2026	2026-03-18 13:19:19.043254
1248	chisco	4	1	lectiva	{17284}	68	9	2025-2026	2026-03-18 13:19:19.051638
1249	fatimapc20	2	3	lectiva	{17284}	1	9	2025-2026	2026-03-18 13:19:19.059985
1250	fatimapc20	4	1	lectiva	{17284}	1	9	2025-2026	2026-03-18 13:19:19.068333
1251	jpcataland01	1	3	lectiva	{17284}	28	9	2025-2026	2026-03-18 13:19:19.0767
1252	jpcataland01	1	6	lectiva	{17284}	28	9	2025-2026	2026-03-18 13:19:19.085076
1253	jpcataland01	2	1	lectiva	{17284}	28	9	2025-2026	2026-03-18 13:19:19.093757
1254	jpcataland01	3	7	lectiva	{17284}	28	9	2025-2026	2026-03-18 13:19:19.101783
1255	jpcataland01	5	5	lectiva	{17284}	28	9	2025-2026	2026-03-18 13:19:19.110043
1256	dmacarrillam01	3	5	lectiva	{17284}	84	9	2025-2026	2026-03-18 13:19:19.118303
1257	dmacarrillam01	3	6	lectiva	{17284}	84	9	2025-2026	2026-03-18 13:19:19.160039
1258	dmacarrillam01	4	5	lectiva	{17284}	84	9	2025-2026	2026-03-18 13:19:19.168459
1259	dmacarrillam01	4	7	lectiva	{17284}	84	9	2025-2026	2026-03-18 13:19:19.176687
1260	dmacarrillam01	5	2	lectiva	{17284}	84	9	2025-2026	2026-03-18 13:19:19.185586
1261	dmacarrillam01	5	3	lectiva	{17284}	84	9	2025-2026	2026-03-18 13:19:19.193426
1262	dmacarrillam01	5	6	lectiva	{17284}	84	9	2025-2026	2026-03-18 13:19:19.201778
1263	igomezc12	1	7	lectiva	{17284}	83	9	2025-2026	2026-03-18 13:19:19.210088
1264	igomezc12	3	2	lectiva	{17284}	83	9	2025-2026	2026-03-18 13:19:19.218446
1265	igomezc12	4	3	lectiva	{17284}	83	9	2025-2026	2026-03-18 13:19:19.226744
1266	igomezc12	4	6	lectiva	{17284}	83	9	2025-2026	2026-03-18 13:19:19.235114
1267	igomezc12	5	1	lectiva	{17284}	83	9	2025-2026	2026-03-18 13:19:19.243419
1268	igomezc12	4	5	lectiva	{17360}	97	68	2025-2026	2026-03-18 13:19:19.251863
1269	efranciscor01	4	5	lectiva	{17360}	\N	68	2025-2026	2026-03-18 13:19:19.260101
1270	fatimapc20	3	2	lectiva	{17360}	1	68	2025-2026	2026-03-18 13:19:19.268429
1271	fatimapc20	5	1	lectiva	{17360}	1	68	2025-2026	2026-03-18 13:19:19.276766
1272	vpalaciosg06	1	3	lectiva	{17360}	6	68	2025-2026	2026-03-18 13:19:19.28513
1273	vpalaciosg06	3	3	lectiva	{17360}	6	68	2025-2026	2026-03-18 13:19:19.293462
1274	amfajardol01	1	1	lectiva	{17360}	41	68	2025-2026	2026-03-18 13:19:19.301791
1275	amfajardol01	4	2	lectiva	{17360}	41	68	2025-2026	2026-03-18 13:19:19.31013
1276	rjrodriguezp01	1	2	lectiva	{17360}	4	68	2025-2026	2026-03-18 13:19:19.318488
1277	rjrodriguezp01	2	6	lectiva	{17360}	4	68	2025-2026	2026-03-18 13:19:19.326807
1278	mjcorralesg01	4	3	lectiva	{17360}	5	68	2025-2026	2026-03-18 13:19:19.335289
1279	mjcorralesg01	5	5	lectiva	{17360}	5	68	2025-2026	2026-03-18 13:19:19.343447
1280	igomezc12	2	7	lectiva	{17360}	75	68	2025-2026	2026-03-18 13:19:19.351816
1281	igomezc12	3	1	lectiva	{17360}	75	68	2025-2026	2026-03-18 13:19:19.36011
1282	igomezc12	4	7	lectiva	{17360}	75	68	2025-2026	2026-03-18 13:19:19.368429
1283	igomezc12	1	6	lectiva	{17360}	79	68	2025-2026	2026-03-18 13:19:19.376691
1284	igomezc12	2	1	lectiva	{17360}	79	68	2025-2026	2026-03-18 13:19:19.385153
1285	igomezc12	2	2	lectiva	{17360}	79	68	2025-2026	2026-03-18 13:19:19.393502
1286	igomezc12	5	2	lectiva	{17360}	79	68	2025-2026	2026-03-18 13:19:19.401833
1287	jpcataland01	1	5	lectiva	{17360}	81	68	2025-2026	2026-03-18 13:19:19.410157
1288	jpcataland01	2	3	lectiva	{17360}	81	68	2025-2026	2026-03-18 13:19:19.418609
1289	jpcataland01	3	5	lectiva	{17360}	81	68	2025-2026	2026-03-18 13:19:19.426845
1290	jpcataland01	4	6	lectiva	{17360}	81	68	2025-2026	2026-03-18 13:19:19.435199
1291	jpcataland01	5	6	lectiva	{17360}	81	68	2025-2026	2026-03-18 13:19:19.443415
1292	jpcataland01	1	7	lectiva	{17360}	82	68	2025-2026	2026-03-18 13:19:19.451838
1293	jpcataland01	2	5	lectiva	{17360}	82	68	2025-2026	2026-03-18 13:19:19.460164
1294	jpcataland01	3	6	lectiva	{17360}	82	68	2025-2026	2026-03-18 13:19:19.468508
1295	jpcataland01	4	1	lectiva	{17360}	82	68	2025-2026	2026-03-18 13:19:19.476847
1296	jpcataland01	5	3	lectiva	{17360}	82	68	2025-2026	2026-03-18 13:19:19.485203
1297	emurielb76	1	1	lectiva	{18101}	39	82	2025-2026	2026-03-18 13:19:19.493553
1298	emurielb76	1	2	lectiva	{18101}	39	82	2025-2026	2026-03-18 13:19:19.502005
1299	emurielb76	2	1	lectiva	{18101}	39	82	2025-2026	2026-03-18 13:19:19.510184
1300	emurielb76	3	1	lectiva	{18101}	39	82	2025-2026	2026-03-18 13:19:19.518587
1301	emurielb76	3	2	lectiva	{18101}	39	82	2025-2026	2026-03-18 13:19:19.526889
1302	emurielb76	4	2	lectiva	{18101}	39	82	2025-2026	2026-03-18 13:19:19.535255
1303	emurielb76	5	1	lectiva	{18101}	39	82	2025-2026	2026-03-18 13:19:19.543534
1304	bcrespoc01	1	3	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.55185
1305	bcrespoc01	1	5	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.560201
1306	bcrespoc01	2	6	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.568565
1307	bcrespoc01	2	7	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.576912
1308	bcrespoc01	4	3	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.585323
1309	bcrespoc01	4	5	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.593582
1310	bcrespoc01	5	2	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.601925
1311	bcrespoc01	5	3	lectiva	{18101}	101	82	2025-2026	2026-03-18 13:19:19.61024
1312	ndelorzac02	2	3	lectiva	{18101}	44	82	2025-2026	2026-03-18 13:19:19.618599
1313	ndelorzac02	2	5	lectiva	{18101}	44	82	2025-2026	2026-03-18 13:19:19.626954
1314	ndelorzac02	3	7	lectiva	{18101}	44	82	2025-2026	2026-03-18 13:19:19.635259
1315	ndelorzac02	4	1	lectiva	{18101}	44	82	2025-2026	2026-03-18 13:19:19.643571
1316	ndelorzac02	5	5	lectiva	{18101}	44	82	2025-2026	2026-03-18 13:19:19.651855
1317	amfajardol01	2	5	lectiva	{12534}	32	58	2025-2026	2026-03-18 13:19:19.660225
1318	amfajardol01	4	3	lectiva	{12534}	32	58	2025-2026	2026-03-18 13:19:19.66871
1319	amfajardol01	4	5	lectiva	{12534}	32	58	2025-2026	2026-03-18 13:19:19.676834
1320	ndelorzac02	1	7	lectiva	{12534}	48	58	2025-2026	2026-03-18 13:19:19.685243
1321	ndelorzac02	4	6	lectiva	{12534}	48	58	2025-2026	2026-03-18 13:19:19.693898
1322	ndelorzac02	4	7	lectiva	{12534}	48	58	2025-2026	2026-03-18 13:19:19.701971
1323	ilozano1977	5	1	lectiva	{12534}	68	58	2025-2026	2026-03-18 13:19:19.710311
1324	pety78	2	6	lectiva	{12534}	80	58	2025-2026	2026-03-18 13:19:19.718662
1325	pety78	2	7	lectiva	{12534}	80	58	2025-2026	2026-03-18 13:19:19.760305
1326	pety78	5	3	lectiva	{12534}	80	58	2025-2026	2026-03-18 13:19:19.768655
1327	pety78	5	5	lectiva	{12534}	80	58	2025-2026	2026-03-18 13:19:19.776969
1328	amfajardol01	5	6	lectiva	{12534}	86	58	2025-2026	2026-03-18 13:19:19.785404
1329	amfajardol01	5	7	lectiva	{12534}	86	58	2025-2026	2026-03-18 13:19:19.793639
1330	dnarcisoc01	1	1	lectiva	{12534}	96	58	2025-2026	2026-03-18 13:19:19.801979
1331	dnarcisoc01	2	1	lectiva	{12534}	96	58	2025-2026	2026-03-18 13:19:19.810335
1332	dnarcisoc01	4	1	lectiva	{12534}	96	58	2025-2026	2026-03-18 13:19:19.819232
1333	dnarcisoc01	1	2	lectiva	{18100}	37	39	2025-2026	2026-03-18 13:19:19.827546
1334	dnarcisoc01	2	2	lectiva	{18100}	37	39	2025-2026	2026-03-18 13:19:19.835882
1335	dnarcisoc01	3	3	lectiva	{18100}	37	39	2025-2026	2026-03-18 13:19:19.844214
1336	dnarcisoc01	4	7	lectiva	{18100}	37	39	2025-2026	2026-03-18 13:19:19.852559
1337	dnarcisoc01	5	2	lectiva	{18100}	37	39	2025-2026	2026-03-18 13:19:19.860892
1338	pety78	1	3	lectiva	{18100}	46	39	2025-2026	2026-03-18 13:19:19.869323
1339	pety78	1	5	lectiva	{18100}	46	39	2025-2026	2026-03-18 13:19:19.877561
1340	pety78	2	3	lectiva	{18100}	46	39	2025-2026	2026-03-18 13:19:19.885853
1341	pety78	2	5	lectiva	{18100}	46	39	2025-2026	2026-03-18 13:19:19.89422
1342	pety78	3	6	lectiva	{18100}	46	39	2025-2026	2026-03-18 13:19:19.902598
1343	pety78	4	1	lectiva	{18100}	46	39	2025-2026	2026-03-18 13:19:19.910917
1344	pety78	4	2	lectiva	{18100}	46	39	2025-2026	2026-03-18 13:19:19.919254
1345	efranciscor01	2	6	lectiva	{18100}	52	39	2025-2026	2026-03-18 13:19:19.927582
1346	efranciscor01	2	7	lectiva	{18100}	52	39	2025-2026	2026-03-18 13:19:19.935953
1347	efranciscor01	3	2	lectiva	{18100}	52	39	2025-2026	2026-03-18 13:19:19.944265
1348	efranciscor01	4	3	lectiva	{18100}	52	39	2025-2026	2026-03-18 13:19:19.952703
1349	efranciscor01	5	3	lectiva	{18100}	52	39	2025-2026	2026-03-18 13:19:19.960898
1350	efranciscor01	5	5	lectiva	{18100}	52	39	2025-2026	2026-03-18 13:19:19.969273
1351	mrcarmonav01	1	1	lectiva	{18100}	5	39	2025-2026	2026-03-18 13:19:19.977608
1352	mrcarmonav01	5	7	lectiva	{18100}	5	39	2025-2026	2026-03-18 13:19:19.985945
1353	efranciscor01	1	6	lectiva	{18100}	56	38	2025-2026	2026-03-18 13:19:19.994311
1354	efranciscor01	1	7	lectiva	{18100}	56	38	2025-2026	2026-03-18 13:19:20.00258
1355	efranciscor01	2	5	lectiva	{18100}	56	38	2025-2026	2026-03-18 13:19:20.010808
1356	efranciscor01	3	5	lectiva	{18100}	56	38	2025-2026	2026-03-18 13:19:20.019164
1357	efranciscor01	4	6	lectiva	{18100}	56	38	2025-2026	2026-03-18 13:19:20.027669
1358	efranciscor01	5	6	lectiva	{18100}	56	38	2025-2026	2026-03-18 13:19:20.03592
1359	ilozano1977	1	5	lectiva	{18100}	68	38	2025-2026	2026-03-18 13:19:20.044222
1360	ilozano1977	5	3	lectiva	{18100,12553,12551}	68	38	2025-2026	2026-03-18 13:19:20.052525
1361	pety78	1	1	lectiva	{18100}	64	38	2025-2026	2026-03-18 13:19:20.077789
1362	pety78	1	2	lectiva	{18100}	64	38	2025-2026	2026-03-18 13:19:20.086038
1363	pety78	3	1	lectiva	{18100}	64	38	2025-2026	2026-03-18 13:19:20.094345
1364	pety78	3	2	lectiva	{18100}	64	38	2025-2026	2026-03-18 13:19:20.102681
1365	rmvegac01	1	3	lectiva	{18100}	65	38	2025-2026	2026-03-18 13:19:20.11102
1366	rmvegac01	3	6	lectiva	{18100}	65	38	2025-2026	2026-03-18 13:19:20.119302
1367	rmvegac01	4	7	lectiva	{18100}	65	38	2025-2026	2026-03-18 13:19:20.127646
1368	rmvegac01	5	7	lectiva	{18100}	65	38	2025-2026	2026-03-18 13:19:20.13612
1369	mgranadob01	1	7	lectiva	{12541,16995}	58	46	2025-2026	2026-03-18 13:19:20.144343
1370	mgranadob01	4	6	lectiva	{12541,16995}	58	46	2025-2026	2026-03-18 13:19:20.152698
1371	vpalaciosg06	4	3	tutores	{}	91	\N	2025-2026	2026-03-18 13:19:20.161008
1372	fatimapc20	4	3	tutores	{}	91	\N	2025-2026	2026-03-18 13:19:20.169443
1373	mgperezr02	4	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.177675
1374	rencinasr02	4	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.186013
1375	vpalaciosg06	5	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.194354
1376	ilozano1977	5	2	tutores	{12534}	\N	\N	2025-2026	2026-03-18 13:19:20.202695
1377	mahernandezr06	5	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.211044
1378	mgperezr02	5	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.219466
1379	vpalaciosg06	4	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.227672
1380	mgperezr02	4	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.235973
1381	mafloresm01	4	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.244356
1382	a_carlosss76	4	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.252704
1383	mmhernandezr01	4	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.261041
1384	omsanchezg01	4	2	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.269357
1385	vpalaciosg06	2	6	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.277766
1386	igomezc12	2	6	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.286024
1387	jpcataland01	2	6	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.29451
1388	mgperezr02	2	6	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:20.302835
1389	djuliog01	1	5	lectiva	{12539}	5	6	2025-2026	2026-03-18 13:19:20.311252
1390	djuliog01	2	7	lectiva	{12539}	5	6	2025-2026	2026-03-18 13:19:20.319896
1391	djuliog01	3	3	lectiva	{12539}	5	6	2025-2026	2026-03-18 13:19:20.327749
1392	djuliog01	5	7	lectiva	{12539}	5	6	2025-2026	2026-03-18 13:19:20.336052
1393	djuliog01	1	7	lectiva	{12530}	5	64	2025-2026	2026-03-18 13:19:20.369405
1394	djuliog01	2	2	lectiva	{12530}	5	64	2025-2026	2026-03-18 13:19:20.377732
1395	djuliog01	4	6	lectiva	{12530}	5	64	2025-2026	2026-03-18 13:19:20.386033
1396	mmansillap01	1	2	lectiva	{12543}	54	48	2025-2026	2026-03-18 13:19:20.394473
1397	mmansillap01	4	5	lectiva	{12543}	54	48	2025-2026	2026-03-18 13:19:20.402811
1398	mgranadob01	1	1	lectiva	{12543}	58	48	2025-2026	2026-03-18 13:19:20.411306
1399	mgranadob01	3	3	lectiva	{12543}	58	48	2025-2026	2026-03-18 13:19:20.419403
1400	rencinasr02	1	6	lectiva	{12553}	1	56	2025-2026	2026-03-18 13:19:20.427758
1401	rencinasr02	3	5	lectiva	{12553}	1	56	2025-2026	2026-03-18 13:19:20.436102
1402	rencinasr02	4	6	lectiva	{12553}	1	56	2025-2026	2026-03-18 13:19:20.444432
1403	rencinasr02	5	6	lectiva	{12553}	1	56	2025-2026	2026-03-18 13:19:20.452768
1404	fatimapc20	1	6	lectiva	{12553,12551}	19	56	2025-2026	2026-03-18 13:19:20.461106
1405	fatimapc20	3	5	lectiva	{12553,12551}	19	56	2025-2026	2026-03-18 13:19:20.469443
1406	fatimapc20	4	6	lectiva	{12553,12551}	19	56	2025-2026	2026-03-18 13:19:20.477843
1407	fatimapc20	5	6	lectiva	{12553,12551}	19	56	2025-2026	2026-03-18 13:19:20.486243
1408	egonzalezh18	1	6	lectiva	{12553,12551}	42	56	2025-2026	2026-03-18 13:19:20.494601
1409	egonzalezh18	3	5	lectiva	{12553,12551}	42	56	2025-2026	2026-03-18 13:19:20.503001
1410	egonzalezh18	4	6	lectiva	{12553,12551}	42	56	2025-2026	2026-03-18 13:19:20.511205
1411	egonzalezh18	5	6	lectiva	{12553,12551}	42	56	2025-2026	2026-03-18 13:19:20.519461
1412	mafloresm01	2	3	lectiva	{12553}	5	56	2025-2026	2026-03-18 13:19:20.52783
1413	mafloresm01	4	7	lectiva	{12553}	5	56	2025-2026	2026-03-18 13:19:20.536156
1414	mafloresm01	5	7	lectiva	{12553}	5	56	2025-2026	2026-03-18 13:19:20.544503
1415	mmansillap01	3	1	lectiva	{12539}	54	6	2025-2026	2026-03-18 13:19:20.552766
1416	mmansillap01	5	1	lectiva	{12539}	54	6	2025-2026	2026-03-18 13:19:20.561188
1417	mdcpalaciosr01	3	6	lectiva	{12539}	58	6	2025-2026	2026-03-18 13:19:20.569508
1418	mdcpalaciosr01	4	3	lectiva	{12539}	58	6	2025-2026	2026-03-18 13:19:20.577989
1419	mdcpalaciosr01	5	5	lectiva	{12539}	58	6	2025-2026	2026-03-18 13:19:20.586173
1420	mtcerezog01	5	7	lectiva	{16995}	97	49	2025-2026	2026-03-18 13:19:20.594439
1421	pagarciam27	2	5	lectiva	{12547,12548,17361}	109	54	2025-2026	2026-03-18 13:19:20.602838
1422	pagarciam27	4	2	lectiva	{12547,12548,17361}	109	54	2025-2026	2026-03-18 13:19:20.611208
1423	jrodriguezt18	2	5	lectiva	{12547,12548,17361}	98	54	2025-2026	2026-03-18 13:19:20.619486
1424	jrodriguezt18	4	2	lectiva	{12547,12548,17361}	98	54	2025-2026	2026-03-18 13:19:20.627827
1425	cjlozanop01	2	5	lectiva	{12547,12548,17361}	66	54	2025-2026	2026-03-18 13:19:20.636361
1426	cjlozanop01	4	2	lectiva	{12547,12548,17361}	66	54	2025-2026	2026-03-18 13:19:20.644524
1427	omsanchezg01	3	3	lectiva	{17361}	97	52	2025-2026	2026-03-18 13:19:20.652891
1428	mafloresm01	1	2	lectiva	{17361}	5	52	2025-2026	2026-03-18 13:19:20.687036
1429	mafloresm01	3	5	lectiva	{17361}	5	52	2025-2026	2026-03-18 13:19:20.694534
1430	mafloresm01	4	3	lectiva	{17361}	5	52	2025-2026	2026-03-18 13:19:20.702848
1431	mafloresm01	5	5	lectiva	{17361}	5	52	2025-2026	2026-03-18 13:19:20.711223
1432	mdcpalaciosr01	1	3	lectiva	{17361}	36	52	2025-2026	2026-03-18 13:19:20.76125
1433	mdcpalaciosr01	2	3	lectiva	{17361}	36	52	2025-2026	2026-03-18 13:19:20.769578
1434	mdcpalaciosr01	3	1	lectiva	{17361}	36	52	2025-2026	2026-03-18 13:19:20.777899
1435	mdcpalaciosr01	5	2	lectiva	{17361}	36	52	2025-2026	2026-03-18 13:19:20.811236
1436	omsanchezg01	1	6	lectiva	{17361}	27	52	2025-2026	2026-03-18 13:19:20.819915
1437	omsanchezg01	1	7	lectiva	{17361}	27	52	2025-2026	2026-03-18 13:19:20.827896
1438	omsanchezg01	2	7	lectiva	{17361}	27	52	2025-2026	2026-03-18 13:19:20.83635
1439	omsanchezg01	3	2	lectiva	{17361}	27	52	2025-2026	2026-03-18 13:19:20.844567
1440	omsanchezg01	4	1	lectiva	{17361}	27	52	2025-2026	2026-03-18 13:19:20.902887
1441	omsanchezg01	5	6	lectiva	{17361}	27	52	2025-2026	2026-03-18 13:19:20.911227
1442	jmmurillon01	2	5	lectiva	{12535}	22	50	2025-2026	2026-03-18 13:19:20.961503
1443	jmmurillon01	3	5	lectiva	{12535}	22	50	2025-2026	2026-03-18 13:19:21.019814
1444	jmmurillon01	4	7	lectiva	{12535}	22	50	2025-2026	2026-03-18 13:19:21.027836
1445	jmmurillon01	5	7	lectiva	{12535}	22	50	2025-2026	2026-03-18 13:19:21.036149
1446	fatimapc20	1	3	lectiva	{12537}	19	51	2025-2026	2026-03-18 13:19:21.047268
1447	fatimapc20	2	5	lectiva	{12537}	19	51	2025-2026	2026-03-18 13:19:21.052709
1448	fatimapc20	4	5	lectiva	{12537}	19	51	2025-2026	2026-03-18 13:19:21.0611
1449	fatimapc20	5	2	lectiva	{12537}	19	51	2025-2026	2026-03-18 13:19:21.069771
1450	jjmorcillor01	1	3	lectiva	{12537}	69	51	2025-2026	2026-03-18 13:19:21.077823
1451	jjmorcillor01	2	5	lectiva	{12537}	69	51	2025-2026	2026-03-18 13:19:21.086128
1452	jjmorcillor01	4	5	lectiva	{12537}	69	51	2025-2026	2026-03-18 13:19:21.09459
1453	jjmorcillor01	5	2	lectiva	{12537}	69	51	2025-2026	2026-03-18 13:19:21.102818
1454	cblancoa02	1	3	lectiva	{12537}	51	51	2025-2026	2026-03-18 13:19:21.111202
1455	cblancoa02	2	5	lectiva	{12537}	51	51	2025-2026	2026-03-18 13:19:21.119455
1456	cblancoa02	4	5	lectiva	{12537}	51	51	2025-2026	2026-03-18 13:19:21.127848
1457	cblancoa02	5	2	lectiva	{12537}	51	51	2025-2026	2026-03-18 13:19:21.136416
1458	ilozano1977	2	5	lectiva	{12553,12551}	3	56	2025-2026	2026-03-18 13:19:21.144503
1459	ilozano1977	3	7	lectiva	{12553,12551}	3	56	2025-2026	2026-03-18 13:19:21.152872
1460	ilozano1977	4	2	lectiva	{12553,12551}	3	56	2025-2026	2026-03-18 13:19:21.161212
1461	afloresc27	2	5	lectiva	{12553,12551}	31	56	2025-2026	2026-03-18 13:19:21.194743
1462	afloresc27	3	7	lectiva	{12553,12551}	31	56	2025-2026	2026-03-18 13:19:21.203099
1463	afloresc27	4	2	lectiva	{12553,12551}	31	56	2025-2026	2026-03-18 13:19:21.2114
1464	afloresc27	5	3	lectiva	{12553,12551}	31	56	2025-2026	2026-03-18 13:19:21.219708
1465	mgranadob01	2	5	lectiva	{12553,12551}	50	56	2025-2026	2026-03-18 13:19:21.228017
1466	mgranadob01	3	7	lectiva	{12553,12551}	50	56	2025-2026	2026-03-18 13:19:21.236391
1467	mgranadob01	4	2	lectiva	{12553,12551}	50	56	2025-2026	2026-03-18 13:19:21.244763
1468	mgranadob01	5	3	lectiva	{12553,12551}	50	56	2025-2026	2026-03-18 13:19:21.253218
1469	pety78	3	7	lectiva	{18100}	94	39	2025-2026	2026-03-18 13:19:21.261305
1470	ilozano1977	1	7	lectiva	{18100}	68	39	2025-2026	2026-03-18 13:19:21.269678
1471	ilozano1977	4	5	lectiva	{18100}	68	39	2025-2026	2026-03-18 13:19:21.277982
1472	dnarcisoc01	1	7	lectiva	{18101}	35	82	2025-2026	2026-03-18 13:19:21.28619
1473	dnarcisoc01	3	6	lectiva	{18101}	35	82	2025-2026	2026-03-18 13:19:21.29499
1474	dnarcisoc01	4	6	lectiva	{18101}	35	82	2025-2026	2026-03-18 13:19:21.303138
1475	pety78	3	3	lectiva	{18101}	94	82	2025-2026	2026-03-18 13:19:21.311365
1476	chisco	5	7	lectiva	{18101}	92	82	2025-2026	2026-03-18 13:19:21.319733
1477	djuliog01	1	6	lectiva	{18101}	5	82	2025-2026	2026-03-18 13:19:21.32809
1478	djuliog01	3	5	lectiva	{18101}	5	82	2025-2026	2026-03-18 13:19:21.336562
1479	chisco	2	2	lectiva	{18101}	68	82	2025-2026	2026-03-18 13:19:21.344811
1480	chisco	4	7	lectiva	{18101}	68	82	2025-2026	2026-03-18 13:19:21.35311
1481	chisco	5	6	lectiva	{18101}	68	82	2025-2026	2026-03-18 13:19:21.361482
1482	nmaciasp02	2	6	lectiva	{17284}	1	9	2025-2026	2026-03-18 13:19:21.369676
1483	nmaciasp02	4	2	lectiva	{17284}	1	9	2025-2026	2026-03-18 13:19:21.378104
1484	chisco	2	6	lectiva	{17284}	68	9	2025-2026	2026-03-18 13:19:21.386468
1485	chisco	4	2	lectiva	{17284}	68	9	2025-2026	2026-03-18 13:19:21.39479
1486	mgperezr02	2	7	lectiva	{17284}	6	9	2025-2026	2026-03-18 13:19:21.403146
1487	mgperezr02	5	7	lectiva	{17284}	6	9	2025-2026	2026-03-18 13:19:21.411432
1488	amfajardol01	1	5	lectiva	{17284}	41	9	2025-2026	2026-03-18 13:19:21.419889
1489	amfajardol01	3	1	lectiva	{17284}	41	9	2025-2026	2026-03-18 13:19:21.428117
1490	mafloresm01	2	5	lectiva	{17284}	5	9	2025-2026	2026-03-18 13:19:21.436454
1491	mafloresm01	3	3	lectiva	{17284}	5	9	2025-2026	2026-03-18 13:19:21.444835
1492	rjrodriguezp01	1	1	lectiva	{17284}	4	9	2025-2026	2026-03-18 13:19:21.453166
1493	rjrodriguezp01	2	2	lectiva	{17284}	4	9	2025-2026	2026-03-18 13:19:21.461672
1494	magarcian01	1	1	lectiva	{17284}	4	9	2025-2026	2026-03-18 13:19:21.46984
1495	magarcian01	2	2	lectiva	{17284}	4	9	2025-2026	2026-03-18 13:19:21.478173
1496	mmhernandezr01	1	3	lectiva	{12551}	6	57	2025-2026	2026-03-18 13:19:21.48652
1497	mmhernandezr01	2	1	lectiva	{12551}	6	57	2025-2026	2026-03-18 13:19:21.51152
1498	mmhernandezr01	3	1	lectiva	{12551}	6	57	2025-2026	2026-03-18 13:19:21.520022
1499	mmhernandezr01	4	3	lectiva	{12551}	6	57	2025-2026	2026-03-18 13:19:21.528152
1500	mdpmartinezf01	1	1	lectiva	{12551}	5	57	2025-2026	2026-03-18 13:19:21.536476
1501	mdpmartinezf01	3	3	lectiva	{12551}	5	57	2025-2026	2026-03-18 13:19:21.544894
1502	mdpmartinezf01	5	2	lectiva	{12551}	5	57	2025-2026	2026-03-18 13:19:21.553173
1503	a_carlosss76	1	7	lectiva	{12551}	17	57	2025-2026	2026-03-18 13:19:21.561533
1504	a_carlosss76	2	3	lectiva	{12551}	17	57	2025-2026	2026-03-18 13:19:21.569854
1505	a_carlosss76	4	5	lectiva	{12551}	17	57	2025-2026	2026-03-18 13:19:21.578177
1506	a_carlosss76	5	1	lectiva	{12551}	17	57	2025-2026	2026-03-18 13:19:21.586512
1507	rencinasr02	1	1	lectiva	{12539}	1	6	2025-2026	2026-03-18 13:19:21.59484
1508	rencinasr02	2	1	lectiva	{12539}	1	6	2025-2026	2026-03-18 13:19:21.603336
1509	rencinasr02	4	1	lectiva	{12539}	1	6	2025-2026	2026-03-18 13:19:21.611491
1510	rencinasr02	5	2	lectiva	{12539}	1	6	2025-2026	2026-03-18 13:19:21.61982
1511	pagarciam27	1	3	lectiva	{12528}	6	65	2025-2026	2026-03-18 13:19:21.628176
1512	pagarciam27	2	3	lectiva	{12528}	6	65	2025-2026	2026-03-18 13:19:21.636565
1513	pagarciam27	3	3	lectiva	{12528}	6	65	2025-2026	2026-03-18 13:19:21.64492
1514	pagarciam27	5	7	lectiva	{12528}	6	65	2025-2026	2026-03-18 13:19:21.653154
1515	cjlozanop01	2	7	lectiva	{12551}	60	57	2025-2026	2026-03-18 13:19:21.661589
1516	cjlozanop01	4	7	lectiva	{12551}	60	57	2025-2026	2026-03-18 13:19:21.669903
1517	cjlozanop01	5	7	lectiva	{12551}	60	57	2025-2026	2026-03-18 13:19:21.67825
1518	mji3003	1	1	lectiva	{12530}	6	64	2025-2026	2026-03-18 13:19:21.686689
1519	mji3003	2	7	lectiva	{12530}	6	64	2025-2026	2026-03-18 13:19:21.695534
1520	mji3003	4	7	lectiva	{12530}	6	64	2025-2026	2026-03-18 13:19:21.703372
1521	mji3003	5	3	lectiva	{12530}	6	64	2025-2026	2026-03-18 13:19:21.711574
12994	isabel22	1	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.002085
12996	dmatasr01	1	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.018447
13008	nmaciasp02	1	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.035083
1526	rmvegac01	1	6	lectiva	{18100}	45	39	2025-2026	2026-03-18 13:19:21.753549
1527	rmvegac01	2	1	lectiva	{18100}	45	39	2025-2026	2026-03-18 13:19:21.761617
1528	rmvegac01	3	1	lectiva	{18100}	45	39	2025-2026	2026-03-18 13:19:21.770076
1529	rmvegac01	4	6	lectiva	{18100}	45	39	2025-2026	2026-03-18 13:19:21.778292
1530	rmvegac01	5	1	lectiva	{18100}	45	39	2025-2026	2026-03-18 13:19:21.811614
1531	rmvegac01	5	6	lectiva	{18100}	45	39	2025-2026	2026-03-18 13:19:21.819972
1532	afloresc27	2	7	lectiva	{12548}	54	53	2025-2026	2026-03-18 13:19:21.828249
1533	afloresc27	4	7	lectiva	{12548}	54	53	2025-2026	2026-03-18 13:19:21.836554
1534	mtcerezog01	1	1	lectiva	{17361}	38	52	2025-2026	2026-03-18 13:19:21.844906
1535	mtcerezog01	2	2	lectiva	{17361}	38	52	2025-2026	2026-03-18 13:19:21.853302
1536	mtcerezog01	3	7	lectiva	{17361}	38	52	2025-2026	2026-03-18 13:19:21.861644
1537	mtcerezog01	4	6	lectiva	{17361}	38	52	2025-2026	2026-03-18 13:19:21.870019
1538	mtcerezog01	4	7	lectiva	{17361}	38	52	2025-2026	2026-03-18 13:19:21.878394
1539	mtcerezog01	5	3	lectiva	{17361}	38	52	2025-2026	2026-03-18 13:19:21.886586
1540	egonzalezh18	3	2	lectiva	{12500,12539}	40	7	2025-2026	2026-03-18 13:19:21.89501
1541	egonzalezh18	5	3	lectiva	{12500,12539}	40	7	2025-2026	2026-03-18 13:19:21.903625
1542	amfajardol01	3	2	lectiva	{12500}	40	7	2025-2026	2026-03-18 13:19:21.915344
1543	amfajardol01	5	3	lectiva	{12500}	40	7	2025-2026	2026-03-18 13:19:21.919853
1544	rjrodriguezp01	3	2	lectiva	{12539}	77	6	2025-2026	2026-03-18 13:19:21.93283
1545	rjrodriguezp01	5	3	lectiva	{12539}	77	6	2025-2026	2026-03-18 13:19:21.936767
1546	egonzalezh18	1	2	lectiva	{12500,12539}	40	7	2025-2026	2026-03-18 13:19:21.944969
1547	celita2	1	2	lectiva	{12539}	40	6	2025-2026	2026-03-18 13:19:21.953204
1548	amfajardol01	1	2	lectiva	{12500}	40	7	2025-2026	2026-03-18 13:19:21.961759
1549	mapavonb01	1	6	lectiva	{12539}	6	6	2025-2026	2026-03-18 13:19:21.970114
1525	amsanchezs01	5	3	lectiva	{17361}	38	83	2025-2026	2026-03-18 13:19:21.744914
1550	mapavonb01	4	5	lectiva	{12539}	6	6	2025-2026	2026-03-18 13:19:21.978215
1553	celita2	1	6	lectiva	{12548}	41	53	2025-2026	2026-03-18 13:19:22.003279
1554	celita2	5	6	lectiva	{12548}	41	53	2025-2026	2026-03-18 13:19:22.011536
1555	dmatasr01	1	6	lectiva	{12548}	9	53	2025-2026	2026-03-18 13:19:22.019844
1556	dmatasr01	5	6	lectiva	{12548}	9	53	2025-2026	2026-03-18 13:19:22.028209
1557	cblancoa02	1	6	lectiva	{12548}	11	53	2025-2026	2026-03-18 13:19:22.036736
1558	cblancoa02	5	6	lectiva	{12548}	11	53	2025-2026	2026-03-18 13:19:22.045235
1559	jmmurillon01	2	1	lectiva	{12548}	22	53	2025-2026	2026-03-18 13:19:22.053437
1560	jmmurillon01	4	6	lectiva	{12548}	22	53	2025-2026	2026-03-18 13:19:22.061946
1561	jmmurillon01	5	3	lectiva	{12548}	22	53	2025-2026	2026-03-18 13:19:22.07019
1562	jjmorcillor01	2	1	lectiva	{12548}	69	53	2025-2026	2026-03-18 13:19:22.078391
1563	jjmorcillor01	4	6	lectiva	{12548}	69	53	2025-2026	2026-03-18 13:19:22.086704
1564	jjmorcillor01	5	3	lectiva	{12548}	69	53	2025-2026	2026-03-18 13:19:22.095098
1565	bcrespoc01	1	6	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.120055
1566	bcrespoc01	2	2	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.128413
1567	bcrespoc01	2	3	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.136736
1568	bcrespoc01	3	3	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.161801
1569	bcrespoc01	3	5	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.170072
1570	dnarcisoc01	1	5	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.178409
1571	dnarcisoc01	3	1	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.186742
1572	dnarcisoc01	3	2	lectiva	{12534}	29	58	2025-2026	2026-03-18 13:19:22.195132
1573	efranciscor01	4	2	lectiva	{12534}	88	58	2025-2026	2026-03-18 13:19:22.203354
1574	efranciscor01	1	3	lectiva	{12534}	85	58	2025-2026	2026-03-18 13:19:22.211752
1575	efranciscor01	3	7	lectiva	{12534}	85	58	2025-2026	2026-03-18 13:19:22.220078
1576	ndelorzac02	2	6	lectiva	{18100}	49	38	2025-2026	2026-03-18 13:19:22.228439
1577	ndelorzac02	2	7	lectiva	{18100}	49	38	2025-2026	2026-03-18 13:19:22.236806
1578	ndelorzac02	4	2	lectiva	{18100}	49	38	2025-2026	2026-03-18 13:19:22.245196
1579	ndelorzac02	4	3	lectiva	{18100}	49	38	2025-2026	2026-03-18 13:19:22.253469
1580	ndelorzac02	5	1	lectiva	{18100}	49	38	2025-2026	2026-03-18 13:19:22.261779
1581	amfajardol01	2	1	lectiva	{18100}	86	38	2025-2026	2026-03-18 13:19:22.27009
1582	amfajardol01	2	2	lectiva	{18100}	86	38	2025-2026	2026-03-18 13:19:22.278468
1583	chisco	4	5	lectiva	{18100}	92	38	2025-2026	2026-03-18 13:19:22.286789
1584	rmvegac01	3	7	lectiva	{18100}	85	38	2025-2026	2026-03-18 13:19:22.295139
1585	rmvegac01	4	1	lectiva	{18100}	85	38	2025-2026	2026-03-18 13:19:22.303432
1586	rmvegac01	5	2	lectiva	{18100}	85	38	2025-2026	2026-03-18 13:19:22.311789
1587	rmvegac01	3	3	lectiva	{18100}	88	38	2025-2026	2026-03-18 13:19:22.3201
1588	rmvegac01	5	5	lectiva	{18100}	88	38	2025-2026	2026-03-18 13:19:22.328554
1589	mapavonb01	1	5	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:22.336806
1590	mapavonb01	4	3	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:22.345157
1591	mapavonb01	5	2	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:22.353429
12997	bcrespoc01	4	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.019738
13009	lpcamarac01	1	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.035189
1595	mapavonb01	2	2	lectiva	{12539}	6	6	2025-2026	2026-03-18 13:19:22.386805
1596	mapavonb01	3	7	lectiva	{12539}	6	6	2025-2026	2026-03-18 13:19:22.395237
1597	mapavonb01	5	6	lectiva	{12539}	6	6	2025-2026	2026-03-18 13:19:22.403495
1598	dmacarrillam01	3	7	lectiva	{17360}	88	68	2025-2026	2026-03-18 13:19:22.436929
1599	dmacarrillam01	5	7	lectiva	{17360}	88	68	2025-2026	2026-03-18 13:19:22.445174
1600	mebravom01	4	6	lectiva	{12535,12537}	90	50	2025-2026	2026-03-18 13:19:22.453522
1601	mebravom01	5	3	lectiva	{12535,12537}	90	50	2025-2026	2026-03-18 13:19:22.461896
1602	vpalaciosg06	4	6	lectiva	{12535}	30	50	2025-2026	2026-03-18 13:19:22.47018
1603	vpalaciosg06	5	3	lectiva	{12535}	30	50	2025-2026	2026-03-18 13:19:22.478563
1604	mgperezr02	4	6	lectiva	{12537}	30	51	2025-2026	2026-03-18 13:19:22.486887
1605	mgperezr02	5	3	lectiva	{12537}	30	51	2025-2026	2026-03-18 13:19:22.495215
1606	vpalaciosg06	2	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:22.503523
1607	mgperezr02	2	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:22.511854
1608	dmatasr01	2	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:22.520284
1609	mtcerezog01	2	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:22.528597
1610	mrcarmonav01	2	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:22.53697
1611	mmhernandezr01	2	3	tutores	{}	\N	\N	2025-2026	2026-03-18 13:19:22.555277
1612	mssalomonp02	1	2	lectiva	{12530,12528}	104	64	2025-2026	2026-03-18 13:19:22.561783
1613	mssalomonp02	3	2	lectiva	{12530,12528}	104	64	2025-2026	2026-03-18 13:19:22.570193
1614	mssalomonp02	4	5	lectiva	{12530,12528}	104	64	2025-2026	2026-03-18 13:19:22.578649
1551	amsanchezs01	1	6	lectiva	{12539}	6	6	2025-2026	2026-03-18 13:19:21.986514
1552	amsanchezs01	4	5	lectiva	{12539}	6	6	2025-2026	2026-03-18 13:19:21.994936
1594	amsanchezs01	5	2	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:22.378739
1615	mssalomonp02	5	1	lectiva	{12530,12528}	104	64	2025-2026	2026-03-18 13:19:22.587086
1616	rencinasr02	1	2	lectiva	{12530}	104	64	2025-2026	2026-03-18 13:19:22.595157
1617	rencinasr02	3	2	lectiva	{12530}	104	64	2025-2026	2026-03-18 13:19:22.603571
1618	rencinasr02	4	5	lectiva	{12530}	104	64	2025-2026	2026-03-18 13:19:22.612221
1619	rencinasr02	5	1	lectiva	{12530}	104	64	2025-2026	2026-03-18 13:19:22.620229
1620	nmaciasp02	1	2	lectiva	{12528}	104	65	2025-2026	2026-03-18 13:19:22.628595
1621	nmaciasp02	3	2	lectiva	{12528}	104	65	2025-2026	2026-03-18 13:19:22.636916
1622	nmaciasp02	4	5	lectiva	{12528}	104	65	2025-2026	2026-03-18 13:19:22.645245
1623	nmaciasp02	5	1	lectiva	{12528}	104	65	2025-2026	2026-03-18 13:19:22.653596
1624	egonzalezh18	2	3	lectiva	{12543,12541}	40	48	2025-2026	2026-03-18 13:19:22.66191
1625	celita2	2	3	lectiva	{12543,12541}	40	48	2025-2026	2026-03-18 13:19:22.670278
1626	celita2	2	7	lectiva	{12547}	41	54	2025-2026	2026-03-18 13:19:22.678616
1627	celita2	5	3	lectiva	{12547}	41	54	2025-2026	2026-03-18 13:19:22.686959
1628	celita2	3	5	lectiva	{12548}	41	53	2025-2026	2026-03-18 13:19:22.69531
1629	dmatasr01	3	5	lectiva	{12548}	9	53	2025-2026	2026-03-18 13:19:22.703576
1630	cblancoa02	3	5	lectiva	{12548}	11	53	2025-2026	2026-03-18 13:19:22.711932
1631	amfajardol01	3	5	lectiva	{12548}	103	53	2025-2026	2026-03-18 13:19:22.720261
12998	amsanchezs01	4	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.020148
13010	efranciscor01	1	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.03522
13018	jrodriguezt18	1	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.051691
13028	cjlozanop01	2	4	guardia	{}	\N	22	2025-2026	2026-03-24 12:42:34.068468
13040	rencinasr02	2	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.085256
13049	rjrodriguezp0102	3	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.101963
13056	fatimapc20	3	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.118335
13069	rjrodriguezp0102	3	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.135436
13080	magarcian01	4	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.152033
13086	igomezc12	4	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.16832
13100	dmacarrillam01	5	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.185383
13109	ndelorzac02	5	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.202002
13120	amsanchezs01	5	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.218909
1592	amsanchezs01	1	5	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:22.361814
1656	amsanchezs01	2	2	lectiva	{12548}	5	83	2025-2026	2026-03-19 13:18:20.528641
943	amsanchezs01	1	3	lectiva	{12539}	\N	83	2025-2026	2026-03-18 13:19:16.217246
1657	amsanchezs01	2	3	lectiva	{12500}	6	7	2025-2026	2026-03-19 13:19:05.076211
1658	amsanchezs01	2	5	lectiva	{17284}	5	9	2025-2026	2026-03-19 13:19:44.898433
1659	amsanchezs01	2	6	lectiva	{17360}	38	83	2025-2026	2026-03-20 12:27:59.97258
1660	amsanchezs01	3	3	lectiva	{12500}	111	83	2025-2026	2026-03-20 12:47:33.029274
1661	amsanchezs01	3	6	lectiva	{12528}	5	83	2025-2026	2026-03-20 12:49:29.12391
1662	amsanchezs01	3	7	departamento	\N	\N	\N	2025-2026	2026-03-20 12:49:50.21725
1663	amsanchezs01	4	1	lectiva	{12500}	5	83	2025-2026	2026-03-20 12:50:16.81944
1593	amsanchezs01	4	3	lectiva	{12500}	6	7	2025-2026	2026-03-18 13:19:22.370137
1665	amsanchezs01	4	6	lectiva	{17361}	38	83	2025-2026	2026-03-20 12:52:40.11425
13000	rjrodriguezp0102	1	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.021844
13007	mdcpalaciosr01	1	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.034981
13020	mafloresm01	1	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.051942
13029	lpcamarac01	2	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.06856
13037	amfajardol01	2	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.08504
13047	lmoralesg04	2	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.101666
13060	sromang06	3	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.118551
13068	pety78	3	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.135227
13078	bfernandezt07	4	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.151824
13089	pagarciam27	4	4	guardia	{}	\N	22	2025-2026	2026-03-24 12:42:34.169668
13096	amfajardol01	4	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.185054
13110	nmaciasp02	5	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.202158
13117	ilozano1977	5	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.218599
13001	bpconejero78	1	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.023465
13014	mjcorralesg01	1	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.0445
13021	ndelorzac02	1	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.059813
13031	bcrespoc01	2	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.07654
13043	jrodriguezt18	2	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.09344
13052	mafloresm01	3	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.11006
13063	jrodriguezt18	3	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.127022
13072	emparrag02	3	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.143554
13082	rencinasr02	4	4	guardia	{}	\N	88	2025-2026	2026-03-24 12:42:34.160144
13093	pety78	4	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.176956
13102	mtcerezog01	5	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.193533
13113	mdcpalaciosr01	5	4	guardia	{}	\N	31	2025-2026	2026-03-24 12:42:34.21032
13121	mdcpalaciosr01	5	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.226812
13002	fatimapc20	1	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.02629
13006	dnarcisoc01	1	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.034785
13019	omsanchezg01	1	4	guardia	{}	\N	31	2025-2026	2026-03-24 12:42:34.051797
13026	igomezc12	2	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.068164
13036	jjmorcillor01	2	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.084846
13046	emparrag02	2	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.101558
13059	mtmarting03	3	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.118645
13070	magarcian01	3	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.135422
13076	mmansillap01	4	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.151627
13087	dnarcisoc01	4	4	guardia	{}	\N	31	2025-2026	2026-03-24 12:42:34.168485
13098	mgperezr02	4	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.185385
13108	egonzalezh18	5	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.201912
13118	bpconejero78	5	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.218685
12999	mtcerezog01	1	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.021038
13015	mji3003	1	4	guardia	{}	\N	22	2025-2026	2026-03-24 12:42:34.04462
13023	bfernandezt07	2	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.060029
13034	rmvegac01	2	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.076874
13041	bcrespoc01	2	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.093244
13051	mji3003	3	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.109958
13061	mapavonb01	3	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.126713
13071	omsanchezg01	3	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.143426
13084	efranciscor01	4	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.160341
13091	mafloresm01	4	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.176705
13101	rjrodriguezp0102	5	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.193422
13114	mji3003	5	4	guardia	{}	\N	22	2025-2026	2026-03-24 12:42:34.210544
13122	jjmorcillor01	5	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.226915
13003	jmmurillon01	1	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.027189
13012	fatimapc20	1	4	guardia	{}	\N	88	2025-2026	2026-03-24 12:42:34.043244
13022	amsanchezs01	2	4	guardia	{}	\N	88	2025-2026	2026-03-24 12:42:34.059925
13035	bpconejero78	2	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.076937
13044	pagarciam27	2	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.093618
13053	lpcamarac01	3	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.110246
13062	ilozano1977	3	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.126839
13074	mdcpalaciosr01	3	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.143745
13083	omsanchezg01	4	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.160247
13092	rmvegac01	4	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.176852
13105	ndelorzac02	5	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.193982
13115	sromang06	5	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.210634
13004	cjlozanop01	1	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.027364
13013	jmmurillon01	1	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.04353
13024	celita2	2	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.060133
13032	pety78	2	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.076643
13045	mgranadob01	2	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.093682
13054	mgperezr02	3	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.110322
13065	pagarciam27	3	4	guardia	{}	\N	22	2025-2026	2026-03-24 12:42:34.127164
13075	jmmurillon01	3	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.143736
13081	pety78	4	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.160034
13095	mrcarmonav01	4	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.177195
13104	mapavonb01	5	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.193807
13112	a_carlosss76	5	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.210236
13005	rencinasr02	4	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.027692
13011	egonzalezh18	1	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.043128
13025	mmansillap01	2	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.060334
13033	egonzalezh18	2	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.076746
13042	bpconejero78	2	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.093343
13055	celita2	3	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.110356
13064	amfajardol01	3	4	guardia	{}	\N	31	2025-2026	2026-03-24 12:42:34.127135
13073	dmatasr01	3	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.143645
13085	bfernandezt07	4	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.160436
13094	cjlozanop01	4	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.177037
13103	efranciscor01	5	2	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.19364
13111	djuliog01	5	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.210114
13123	magarcian01	5	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.22702
13016	mmansillap01	1	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.051384
13027	sromang06	2	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.068287
13038	mrcarmonav01	2	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.085137
13048	rjrodriguezp0102	2	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.101766
13057	nmaciasp02	3	4	guardia	{}	\N	88	2025-2026	2026-03-24 12:42:34.118443
13066	cjlozanop01	3	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.135018
13077	mapavonb01	4	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.151724
13088	a_carlosss76	4	4	guardia	{}	\N	89	2025-2026	2026-03-24 12:42:34.168786
13099	dnarcisoc01	5	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.185467
13107	emparrag02	5	4	guardia	{}	\N	88	2025-2026	2026-03-24 12:42:34.201796
13119	mrcarmonav01	5	6	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.218824
13017	jjmorcillor01	1	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.051612
13030	mtcerezog01	2	4	guardia	\N	\N	31	2025-2026	2026-03-24 12:42:34.068608
13039	djuliog01	2	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.085229
13050	rencinasr02	3	1	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.101982
13058	rmvegac01	3	4	guardia	{}	\N	87	2025-2026	2026-03-24 12:42:34.118624
13067	mgranadob01	3	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.135109
13079	mgranadob01	4	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.151993
13090	celita2	4	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.16981
13097	djuliog01	4	7	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.185177
13106	fatimapc20	5	3	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.201699
13116	mebravom01	5	5	guardia	{}	\N	\N	2025-2026	2026-03-24 12:42:34.218476
\.


--
-- Data for Name: libros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libros (id, idcurso, libro, idmateria) FROM stdin;
20	3	TECNOLOGÍA Y DIGITALIZACIÓN	\N
43	6	ÁMBITO LINGÜÍSTICO Y SOCIAL	\N
4	1	BIOLOGÍA Y GEOLOGÍA	2
21	4	BIOLOGÍA Y GEOLOGÍA	2
37	2	BIOLOGÍA Y GEOLOGÍA	2
22	4	ECONOMÍA Y EMPRENDIMIENTO	11
24	4	FORMACIÓN Y ORIENTACIÓN PERSONAL Y PROFESIONAL	12
14	3	FÍSICA Y QUÍMICA	7
23	4	FÍSICA Y QUÍMICA	7
36	2	FÍSICA Y QUÍMICA	7
15	3	GEOGRAFÍA E HISTORIA	4
25	4	GEOGRAFÍA E HISTORIA	4
38	2	GEOGRAFÍA E HISTORIA (1-2-3)	4
17	3	INGLES	5
27	4	LENGUA CASTELLANA Y LITERATURA	6
39	2	LENGUA CASTELLANA Y LITERATURA	6
3	1	LENGUA CASTELLANA Y LITERATURA (1-2-3)	6
18	3	LENGUA CASTELLANA Y LITERATURA (1-2-3)	6
45	6	LENGUA EXTRANJERA: INGLÉS	5
16	1	MATEMÁTICAS (1-2-3)	1
19	3	MATEMÁTICAS (1-2-3)	1
40	2	MATEMÁTICAS (1-2-3)	1
28	4	MATEMÁTICAS A (1-2-3)	1
29	4	MATEMÁTICAS B (1-2-3)	13
13	1	2ª LENGUA EXTRANJERA: FRANCÉS	3
35	3	2ª LENGUA EXTRANJERA- FRANCÉS	3
42	2	2ª LENGUA EXTRANJERA FRANCÉS	3
6	1	1ª LENGUA EXTRANJERA: INGLÉS	5
26	4	1ª LENGUA EXTRANJERA: INGLÉS	5
41	2	1ª LENGUA EXTRANJERA INGLÉS	5
44	6	ÁMBITO CIENTÍFICO - TECNOLÓGICO	9
46	7	ÁMBITO CIENTÍFICO - MATEMÁTICO	27
47	7	ÁMBITO SOCIOLINGÜÍSTICO	38
48	7	ÁMBITO DE LENGUAS EXTRANJERAS	110
49	7	FORMACIÓN Y ORIENTACIÓN LABORAL	61
50	4	TECNOLOGÍA Y DIGITALIZACIÓN	8
51	2	TECNOLOGÍA Y DIGITALIZACIÓN	8
33	5	ÁMBITO DE COMUNICACIÓN Y CIENCIAS SOCIALES	38
34	8	ÁMBITO DE COMUNICACIÓN Y CIENCIAS SOCIALES	38
52	8	ÁMBITO DE COMUNICACIÓN Y CIENCIAS SOCIALES II	38
\.


--
-- Data for Name: materias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materias (id, nombre, creada_en) FROM stdin;
1	MATEMÁTICAS	2026-02-27 11:33:47.663555
2	BIOLOGÍA Y GEOLOGÍA	2026-02-27 11:33:57.402271
3	FRANCÉS	2026-02-27 11:34:14.369734
4	GEOGRAFÍA E HISTORIA	2026-02-27 11:34:25.221284
5	INGLÉS	2026-02-27 11:34:33.317587
6	LENGUA CASTELLANA Y LITERATURA	2026-02-27 11:34:41.04612
7	FÍSICA Y QUÍMICA	2026-02-27 11:34:56.167063
8	TECNOLOGÍA Y DIGITALIZACIÓN	2026-02-27 11:35:32.451069
9	TECNOLOGÍA	2026-02-27 11:35:36.813329
10	CIENCIAS SOCIALES	2026-02-27 11:35:53.1668
11	ECONOMÍA	2026-02-27 11:36:02.172519
12	FORMACIÓN Y ORIENTACIÓN PERSONAL Y PROFESIONAL	2026-02-27 11:36:20.747709
13	MATEMÁTICAS B	2026-02-27 11:36:54.363242
14	GRIEGO I y II	2026-02-27 11:37:31.4202
15	LATÍN I y II	2026-02-27 11:37:40.141423
16	HISTORIA DEL MUNDO CONTEMPORÁNEO	2026-02-27 11:38:00.396252
17	HISTORIA DE ESPAÑA	2026-02-27 11:38:05.274671
18	HISTORIA DEL ARTE	2026-02-27 11:38:10.654492
19	MATEMÁTICAS APLICADAS A LAS CIENCIAS SOCIALES	2026-02-27 11:38:27.469985
20	GEOLOGÍA	2026-02-27 11:38:47.805553
21	MATEMÁTICAS II	2026-02-27 11:39:12.459264
22	FÍSICA	2026-02-27 11:39:16.173274
23	QUÍMICA	2026-02-27 11:39:20.436986
24	DESCONOCIDA	2026-03-09 09:25:47.873665
25	MATEMÁTICAS (REFUERZO)	2026-03-09 09:32:19.674229
26	LENGUA (REFUERZO)	2026-03-09 09:32:26.645098
27	ÁMBITO CIENTÍFICO	2026-03-09 09:33:34.42552
28	ACTIVIDADES RIEGO ABONADO TRATAMIENTO CULTIVOS	2026-03-09 09:33:43.812081
29	APOYO DOMICILIARIO	2026-03-09 09:34:05.812712
30	ATENCIÓN EDUCATIVA	2026-03-09 09:34:14.971864
31	ACTIVIDADES FÍSICAS	2026-03-09 09:34:20.884811
32	ATENCIÓN HIGIÉNICA	2026-03-09 09:34:27.880451
33	ANÁLISIS MUSICAL	2026-03-09 09:34:43.795512
34	APOYO TUTORÍA	2026-03-09 09:34:55.731699
35	APOYO COMUNICACIÓN	2026-03-09 09:35:02.646688
36	ÁMBITO PRÁCTICO	2026-03-09 09:35:10.291962
37	AUTONOMÍA PERSONAL SALUD INFANTIL	2026-03-09 09:37:07.109482
38	ÁMBITO SOCIOLINGÜÍSTICO	2026-03-09 09:37:25.763776
39	ATENCIÓN SANITARIA	2026-03-09 09:37:35.415019
40	BIOLOGÍA BILINGÜE	2026-03-09 09:42:44.683585
41	BIOLOGÍA	2026-03-09 09:43:12.514416
42	CIENCIAS GENERALES	2026-03-09 09:43:20.690227
43	CULTURA CLÁSICA	2026-03-09 09:43:28.508412
44	CARACTERÍSTICAS Y NECESIDADES PSD	2026-03-09 09:43:34.995757
45	DESARROLLO COGNITIVO MOTOR	2026-03-09 09:43:41.286371
46	DIDÁCTICA EDUCACIÓN INFANTIL	2026-03-09 09:43:47.86076
47	DIGITALIZACIÓN BÁSICA	2026-03-09 09:44:27.040899
48	DESTREZAS SOCIALES	2026-03-09 09:44:37.35006
49	DESARROLLO SOCIOAFECTIVO	2026-03-09 09:44:43.430211
50	DIBUJO TÉCNICO	2026-03-09 09:44:49.999691
51	ECONOMÍA EMPRENDEDORA	2026-03-09 09:44:56.798299
52	EXPRESIÓN COMUNICACIÓN	2026-03-09 09:45:02.882115
53	EDUCACIÓN CIUDADANÍA	2026-03-09 09:45:09.834572
54	EDUCACIÓN FÍSICA	2026-03-09 09:46:10.505673
55	EMPRESA INICIATIVA EMPRENDEDORA	2026-03-09 09:46:19.942923
56	JUEGO INFANTIL Y SU METODOLOGÍA	2026-03-09 09:46:26.391299
57	EMPRESA Y DSEÑO DE NEGOCIOS	2026-03-09 09:46:32.366231
58	EPV	2026-03-09 09:46:45.061628
59	EMPRENDIMIENTO SOCIAL Y SOSTENIBILIDAD	2026-03-09 09:46:50.678399
60	FILOSOFÍA	2026-03-09 09:47:10.902927
61	FORMACIÓN  Y ORIENTACIÓN LABORAL	2026-03-09 09:47:37.892511
62	GEOGRAFÍA	2026-03-09 09:47:50.869857
63	GRIEGO	2026-03-09 09:48:06.5409
64	HABILIDADES SOCIALES	2026-03-09 09:48:14.868587
65	INTERVENCIÓN FAMILIAS MENORES SITUACIÓN RIESGO	2026-03-09 09:48:29.9939
66	INTRODUCCIÓN FILOSOFÍA	2026-03-09 09:48:42.42014
67	INTELIGENCIA ARTIFICIAL	2026-03-09 09:48:59.765536
68	ITINERARIO EMPLEABILIDAD	2026-03-09 09:49:06.303623
69	LATÍN	2026-03-09 09:49:32.957551
70	LITERATURA UNIVERSAL	2026-03-09 09:49:52.457422
71	MATEMÁTICAS I	2026-03-09 09:50:15.423675
72	MATEMÁTICAS A	2026-03-09 09:50:25.869248
73	MATEMÁTICAS A BILINGÜE	2026-03-09 09:51:07.149798
74	MATEMÁTICAS B BILINGÜE	2026-03-09 09:51:12.717953
75	MATERIALES FLORISTERIA	2026-03-09 09:51:35.006328
76	MÚSICA EN EXTREMDURA	2026-03-09 09:51:50.969
77	MÚSICA	2026-03-09 09:52:02.64394
78	MÚSICA BILINGÜE	2026-03-09 09:52:10.332171
79	OPERACIONES AUXILIARES ELABORACIÓN COMPOSICIONES FLORES PLANTAS	2026-03-09 09:52:17.902767
80	ORGANIZACIÓN ATENCIÓN PSD	2026-03-09 09:52:27.07333
81	OPERACIONES BÁSICAS INSTALACIONES JARDINES PARQUES...	2026-03-09 09:52:35.089896
82	OPERACIONES BÁSICAS MANTENIMIENTO JARDINES, PAQUES....	2026-03-09 09:52:41.599217
83	OPERACIONES AUXILIARES PREPARACIÓN TERRENO PLANTACIÓN...	2026-03-09 09:52:47.948759
84	OPERACIONES BÁSICAS PRODUCCIÓN MANTENIMIENTO PLANTAS VIVEROS	2026-03-09 09:52:54.516747
85	OPTATIVA	2026-03-09 09:53:03.117939
86	PRIMEROS AUXILIOS	2026-03-09 09:53:08.996308
87	PROYECTO INVESTIGACIÓN	2026-03-09 09:53:14.436298
88	PROYECTO INTERMODULAR	2026-03-09 09:53:20.075418
89	PSICOLOGÍA	2026-03-09 09:53:26.424709
90	RELIGIÓN	2026-03-09 09:53:40.749932
92	SOSTENIBILIDAD	2026-03-09 09:54:08.790924
93	TECNOLOGÍA E INGENIERÍA	2026-03-09 09:54:20.86111
94	INFORMÁTICA	2026-03-09 09:54:31.073845
95	TECNOLOGÍA INDUSTRIAL	2026-03-09 09:54:43.178123
96	TELEASISTENCIA	2026-03-09 09:54:49.41103
97	TUTORÍA	2026-03-09 09:54:55.367476
98	UNIÓN EUROPEA	2026-03-09 09:55:04.30498
99	VALORES ÉTICOS	2026-03-09 09:55:10.232578
100	GUARDIA	2026-03-09 09:55:14.721955
101	APOYO PSICOSOCIAL	2026-03-09 09:56:26.676335
102	APOYO EDUCATIVO	2026-03-09 09:59:00.178949
103	LABORATORIO	2026-03-09 10:03:07.920568
104	MATEMÁTICAS BILINGÜE	2026-03-09 10:05:11.503619
91	REUNIÓN DE TUTORES 1º	2026-03-09 09:53:45.918931
105	REUNIÓN DE TUTORES 2º	2026-03-09 10:08:20.445322
106	REUNIÓN DE TUTORES 3º	2026-03-09 10:08:24.626089
107	REUNIÓN DE TUTORES 4º	2026-03-09 10:08:29.976607
108	REUNIÓN DE TUTORES CFGB	2026-03-09 10:08:37.719973
109	TALLER ARTES ESCÉNICAS	2026-03-09 10:13:10.663085
110	ÁMBITO DE LENGUAS EXTRANJERAS	2026-03-12 10:56:08.202565
111	PLÁSTICA	2026-03-20 12:46:06.500421
\.


--
-- Data for Name: perfiles_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.perfiles_usuario (id, uid, perfil) FROM stdin;
1	admin	administrador
8	ordenanza	ordenanza
9	chisco	directiva
10	emurielb76	directiva
11	mmhernandezr01	directiva
12	vpalaciosg06	directiva
14	mdpmartinezf01	directiva
15	learob	educadora
16	mdcpalaciosr01	extraescolares
17	fpascualg01	administrativo
18	mibravom01	administrativo
\.


--
-- Data for Name: periodos_horarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.periodos_horarios (id, nombre, inicio, fin) FROM stdin;
3	3ª Hora	10:15:00	11:10:00
4	Recreo	11:10:00	11:40:00
1	1ª Hora	08:30:00	09:20:00
2	2ª Hora	09:20:00	10:15:00
5	4ª Hora	11:40:00	12:30:00
6	5ª Hora	12:30:00	13:25:00
7	6ª Hora	13:25:00	14:20:00
\.


--
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (id, uid, fecha, descripcion, estado, tipo, created_at, idperiodo_inicio, idperiodo_fin, dia_completo) FROM stdin;
1551	mgranadob01	2025-10-09	Viaje ver Exposición centenario Cézanne	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1552	mgranadob01	2025-10-10	Exposición centenario Cézanne	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1553	mjcorralesg01	2025-10-20	Asunto propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1554	rmvegac01	2025-10-20		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1555	cblancoa02	2025-10-31		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1556	celita2	2025-10-31		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1557	mdpmartinezf01	2025-11-06		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1558	mafloresm01	2025-11-10		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1559	jrodriguezt18	2025-11-10		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1560	mrcarmonav01	2025-11-14		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1561	mahernandezr06	2025-11-17		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1562	jjmorcillor01	2025-11-20		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1563	egonzalezh18	2025-11-21		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1564	jmmurillon01	2025-11-21	Solicitar día por asuntos personales.	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1565	magarcian01	2025-11-26		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1566	dnarcisoc01	2025-11-26		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1567	magarcian01	2025-12-01		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1568	a_carlosss76	2025-12-01		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1569	cjlozanop01	2025-12-03		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1570	cblancoa02	2025-12-04		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1571	jjmorcillor01	2025-12-05		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1572	omsanchezg01	2025-12-05	Asuntos Particulares	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1573	igomezc12	2025-12-09		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1574	ilozano1977	2025-12-09		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1575	pagarciam27	2025-12-10		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1576	cjlozanop01	2025-12-16		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1577	mdpmartinezf01	2025-12-17		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1578	efranciscor01	2025-12-18		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1579	cblancoa02	2025-12-19		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1580	mji3003	2026-01-08		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1581	mafloresm01	2026-01-12		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1582	djuliog01	2026-01-19		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1583	rencinasr02	2026-01-19		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1584	igomezc12	2026-01-20		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1585	lmoralesg04	2026-01-20	PARA PRUEBAS DIAGNÓSTICAS DE UN HIJO	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1586	omsanchezg01	2026-01-22	Día de Asuntos Propios	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1587	nmaciasp02	2026-01-23	Asuntos particulares	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1588	amsanchezs01	2026-01-23		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1589	mdcpalaciosr01	2026-01-26		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1590	dnarcisoc01	2026-01-26		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1591	mgperezr02	2026-01-29		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1592	ilozano1977	2026-01-30		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1593	lpcamarac01	2026-02-02		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1594	pety78	2026-02-06	Viaje	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1595	ndelorzac02	2026-02-06		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1596	mji3003	2026-02-09		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1597	jrodriguezt18	2026-02-09	Petición Asuntos particulares	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1598	jjmorcillor01	2026-02-10		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1599	a_carlosss76	2026-02-23		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1600	fatimapc20	2026-02-27		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1601	fatimapc20	2026-03-02		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1602	mmansillap01	2026-03-02	Asuntos particulares	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1603	mrcarmonav01	2026-03-06		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1604	mgranadob01	2026-03-06		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1605	ilozano1977	2026-03-10		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1607	djuliog01	2026-03-13		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1608	mtcerezog01	2026-04-08		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1609	mji3003	2026-04-08		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1610	mtcerezog01	2026-04-09		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1611	mji3003	2026-04-09		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1612	dmacarrillam01	2026-04-10		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1613	isabel22	2026-04-10		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1614	dnarcisoc01	2026-04-20		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1615	djuliog01	2026-04-20		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1616	rmvegac01	2026-04-24		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1617	nmaciasp02	2026-04-27	Asuntos particulares	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1618	mrcarmonav01	2026-04-27		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1619	nmaciasp02	2026-04-28	Asuntos particulares	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1620	rmvegac01	2026-04-29		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1621	isabel22	2026-04-30		1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1622	magarcian01	2025-09-12	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1623	efranciscor01	2025-09-23	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1624	mdpmartinezf01	2025-09-23	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1625	mdcpalaciosr01	2025-10-03	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1626	mjcorralesg01	2025-10-21	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1627	isabel22	2025-11-05	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1628	vpalaciosg06	2025-11-17	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1629	mmhernandezr01	2025-11-24	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1630	ndelorzac02	2025-11-24	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1631	mmhernandezr01	2025-11-25	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1632	grdiazp01	2025-12-03	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1633	mdpmartinezf01	2025-12-18	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1634	amsanchezs01	2025-12-19	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1635	mtcerezog01	2026-01-08	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1636	mtcerezog01	2026-01-09	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1637	mji3003	2026-01-09	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1638	egonzalezh18	2026-01-12	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1639	mrcarmonav01	2026-01-30	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1640	magarcian01	2026-02-02	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1641	isabel22	2026-02-12	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1642	rmvegac01	2026-02-12	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1643	isabel22	2026-02-13	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1644	rmvegac01	2026-02-13	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1645	pagarciam27	2026-02-13	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1646	afloresc27	2026-02-18	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1647	sromang06	2026-02-18	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1648	afloresc27	2026-02-19	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1649	afloresc27	2026-02-20	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1650	emparrag02	2026-02-23	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1651	igomezc12	2026-02-26	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1652	vpalaciosg06	2026-02-27	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1653	bcrespoc01	2026-04-21	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1654	bcrespoc01	2026-04-22	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1655	mapavonb01	2026-04-24	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1656	mapavonb01	2026-04-29	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1657	mapavonb01	2026-04-30	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1658	amsanchezs01	2026-05-04	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1659	mgranadob01	2026-05-04	Asunto Propio	1	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1662	mjcorralesg01	2026-05-15	Jara Corrales	1	13	2026-02-18 08:30:24.266743+00	\N	\N	t
1663	lpcamarac01	2026-03-09	asunto propio	1	13	2026-02-18 08:33:32.631079+00	\N	\N	t
1664	ndelorzac02	2026-05-15	Viaje	1	13	2026-02-18 08:41:32.978985+00	\N	\N	t
1667	mapavonb01	2026-05-08	asunto propio	1	13	2026-02-18 09:05:47.978642+00	\N	\N	t
1703	mmansillap01	2026-06-05	asuntos propios	1	13	2026-03-09 07:10:36.605432+00	\N	\N	t
1665	egonzalezh18	2026-05-08	Asuntos propios 	1	13	2026-02-18 08:42:25.281335+00	\N	\N	t
1698	amfajardol01	2026-03-12	Intervención quirúrgica 	1	2	2026-03-05 09:35:11.280347+00	\N	\N	t
1670	amsanchezs01	2026-02-23	Faltar desde 11.40 a 14.20h.	1	11	2026-02-18 10:20:01.154091+00	\N	\N	t
1671	amsanchezs01	2026-03-04	Desde 12.30h hasta 14.20h.	1	11	2026-02-18 10:29:42.472119+00	\N	\N	t
1700	mdcpalaciosr01	2026-05-06	asuntos propios	1	13	2026-03-05 11:07:22.306745+00	\N	\N	t
1666	ndelorzac02	2026-03-09	Viaje	2	13	2026-02-18 08:46:52.434156+00	\N	\N	t
1606	mahernandezr06	2026-03-13		2	13	2026-02-12 11:51:34.675032+00	\N	\N	t
1676	magarcian01	2026-02-19	Analítica y prueba diagnóstica	1	3	2026-02-19 10:50:04.978144+00	\N	\N	t
1669	djuliog01	2026-05-11	Diana Julio	1	13	2026-02-18 10:17:04.538518+00	\N	\N	t
1677	omsanchezg01	2026-05-11	Asuntos propios	1	13	2026-02-20 08:48:38.649826+00	\N	\N	t
1702	celita2	2026-05-01	CELIA GARCÍA LA ORDEN	2	13	2026-03-06 11:19:57.369744+00	\N	\N	t
1685	mmansillap01	2026-05-06	asuntos propios	1	13	2026-02-25 08:32:20.217836+00	\N	\N	t
1686	mmansillap01	2026-05-07	asuntos propios	1	13	2026-02-25 08:32:43.864411+00	\N	\N	t
1682	amfajardol01	2026-05-25	Asunto propio	1	13	2026-02-24 10:13:07.418158+00	\N	\N	t
1684	amfajardol01	2026-05-26	asunto propio 	1	13	2026-02-25 08:24:09.580242+00	\N	\N	t
1683	jrodriguezt18	2026-05-25	Jorge Rodríguez Timón	1	13	2026-02-24 10:38:49.624352+00	\N	\N	t
1687	mapavonb01	2026-02-25	visita médica	1	0	2026-02-25 09:35:20.978002+00	\N	\N	t
1679	pagarciam27	2026-03-03	Cita médica oftalmólogo a partir de las 12:30	1	3	2026-02-24 09:01:48.943493+00	\N	\N	t
1681	efranciscor01	2026-03-06	Acompañamiento de hija menor de edad a especialista médico	1	0	2026-02-24 09:30:12.765327+00	\N	\N	t
1723	lpcamarac01	2026-03-16	Consulta médica	1	0	2026-03-11 08:55:47.658271+00	1	3	f
1678	sromang06	2026-04-22	Sara Román Gómez	1	13	2026-02-23 09:18:15.686179+00	\N	\N	t
1690	mjcorralesg01	2026-06-01	Jara Corrales	1	13	2026-03-02 08:20:42.246382+00	\N	\N	t
1694	mtcerezog01	2026-06-01	asuntos propios	1	13	2026-03-03 07:26:56.103623+00	\N	\N	t
1689	dnarcisoc01	2026-05-29	Lola	1	13	2026-03-02 07:27:06.851652+00	\N	\N	t
1696	dmatasr01	2026-05-07	David Matas Asunto propio	1	13	2026-03-03 07:30:00.950577+00	\N	\N	t
1695	dmatasr01	2026-05-28	David Matas Asunto propio	1	13	2026-03-03 07:29:42.020373+00	\N	\N	t
1697	mji3003	2026-05-27	Asunto propio	1	13	2026-03-03 12:34:30.934899+00	\N	\N	t
1706	mrcarmonav01	2026-06-08	Remedios Carmona	1	13	2026-03-09 08:09:31.052057+00	\N	\N	t
1709	magarcian01	2026-05-27	Asunto propio	1	13	2026-03-09 08:29:09.357192+00	\N	\N	t
1708	magarcian01	2026-04-28	Asunto propio	1	13	2026-03-09 08:28:16.958282+00	\N	\N	t
1707	ilozano1977	2026-06-08	Isabel Lozano	1	13	2026-03-09 08:18:16.860365+00	\N	\N	t
1711	sbalbuenaa01	2026-03-11	PRUEBA MÉDICA	1	0	2026-03-09 09:14:31.10478+00	\N	\N	t
1705	sromang06	2026-06-05	sara Roman	1	13	2026-03-09 07:27:25.388826+00	\N	\N	t
1719	afloresc27	2026-06-09	Asunto propio	2	13	2026-03-10 11:37:17.34314+00	\N	\N	t
1717	egonzalezh18	2026-03-16	Acompañamiento médico de un familiar, fuera de la comunidad autónoma..	1	0	2026-03-10 08:39:50.921146+00	\N	\N	t
1727	vpalaciosg06	2026-03-24	CONSULTA MÉDICA	1	3	2026-03-11 12:06:50.233766+00	3	5	f
1743	cblancoa02	2026-06-12	Cristina	1	13	2026-03-16 07:19:40.244338+00	\N	\N	t
1725	cjlozanop01	2026-06-09	Asunto Propio	1	13	2026-03-11 10:11:55.04723+00	\N	\N	t
1728	cblancoa02	2026-05-15	Regreso tarde de excursión	1	0	2026-03-11 12:07:54.633528+00	3	3	f
1731	a_carlosss76	2026-05-29	ASUNTO PROPIO	1	13	2026-03-11 13:04:11.978485+00	\N	\N	t
1693	mtcerezog01	2026-05-28	Asuntos propios	1	13	2026-03-02 08:48:07.367661+00	\N	\N	t
1722	mtmarting03	2026-05-05	MAITE	1	13	2026-03-11 08:26:46.275247+00	\N	\N	t
1729	afloresc27	2026-05-05	Asunto propio	1	13	2026-03-11 12:17:55.695668+00	\N	\N	t
1726	djuliog01	2026-06-09	Diana	1	13	2026-03-11 10:48:00.498196+00	\N	\N	t
1730	a_carlosss76	2026-04-21	ASUNTO PROPIO	1	13	2026-03-11 12:56:30.103562+00	\N	\N	t
1701	mebravom01	2026-02-27	Justificar por enfermedad	1	3	2026-03-05 11:07:40.966947+00	\N	\N	t
1699	mebravom01	2026-03-05	Justificar por enfermedad	1	3	2026-03-05 11:06:53.403067+00	\N	\N	t
1710	mdcpalaciosr01	2026-03-06	fallecimiento de un familiar 1º grado	1	2	2026-03-09 08:49:31.368939+00	\N	\N	t
1716	celita2	2026-03-09	VISITA MÉDICA	1	0	2026-03-10 08:39:16.696727+00	2	4	f
1712	mji3003	2026-03-09	Analítica	1	0	2026-03-09 11:01:17.747456+00	\N	\N	t
1732	omsanchezg01	2026-06-10	Asuntos propios	1	13	2026-03-12 07:28:54.589134+00	\N	\N	t
1736	mapavonb01	2026-06-10	asunto propio	1	13	2026-03-12 08:59:58.04111+00	\N	\N	t
1737	mgranadob01	2026-06-11	asuntos propios	1	13	2026-03-13 08:36:31.275165+00	\N	\N	t
1742	pagarciam27	2026-06-12	Patricia García	1	13	2026-03-16 07:19:35.401682+00	\N	\N	t
1740	amsanchezs01	2026-03-19	Deberes relacionados con la conciliación de la vida familiar y laboral	1	11	2026-03-13 09:42:42.913473+00	1	4	f
1741	mgperezr02	2026-04-07	Grani.	2	13	2026-03-13 10:14:55.472885+00	\N	\N	t
1746	mgranadob01	2026-06-15	asunto propio	1	13	2026-03-17 07:12:48.501685+00	\N	\N	t
1747	fatimapc20	2026-06-15	Fátima Peña Cantonero	1	13	2026-03-17 10:18:54.96868+00	\N	\N	t
1745	igomezc12	2026-06-11	Isabel Gómez Crespo	1	13	2026-03-16 11:57:42.636474+00	\N	\N	t
1744	igomezc12	2026-05-26	Isabel Gómez Crespo	1	13	2026-03-16 11:54:49.310697+00	\N	\N	t
1748	igomezc12	2026-03-17	Consulta medica con mi hijo Alejandro Solís Gómez	1	11	2026-03-17 10:45:13.727478+00	\N	\N	t
1749	pety78	2026-03-20	Cita médica	1	0	2026-03-17 11:51:50.168044+00	\N	\N	t
1750	fatimapc20	2026-06-16	Fátima Peña Cantonero	1	13	2026-03-18 08:58:44.550008+00	\N	\N	t
1751	cblancoa02	2026-06-17	Cristina Blanco	2	13	2026-03-19 07:29:58.951443+00	\N	\N	t
1753	emparrag02	2026-05-18	Petición A	0	13	2026-03-20 08:06:26.906432+00	\N	\N	t
1754	nmaciasp02	2026-05-18	Petición B	0	13	2026-03-20 08:07:54.593233+00	\N	\N	t
1755	cjlozanop01	2026-04-17	Asistencia XIII Olimpiada Filosófica de España (Ciudad Real) 	0	0	2026-03-20 09:52:58.793314+00	\N	\N	t
1757	amfajardol01	2026-03-25	Visita médica 	0	3	2026-03-24 07:52:44.569794+00	6	6	f
1756	mjcorralesg01	2026-06-16	María Jara Corrales	1	13	2026-03-23 08:29:05.266266+00	\N	\N	t
\.


--
-- Data for Name: prestamos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prestamos (id, uid, esalumno, doc_compromiso, fechaentregadoc, fecharecepciondoc, iniciocurso) FROM stdin;
3589	dbarradoc01	t	2	2025-09-25	2025-09-25	t
3590	rbarradot01	t	2	2025-09-25	2025-09-25	t
3597	aburdalob02	t	2	2025-09-25	2025-09-25	t
3605	acarrascof08	t	2	2025-09-25	2025-09-25	t
3593	scascor01	t	2	2025-09-25	2025-09-25	t
3599	ycastroc01	t	2	2025-09-25	2025-09-25	t
3596	pdelcerroh01	t	2	2025-09-25	2025-09-25	t
3601	mddiouck01	t	2	2025-09-25	2025-09-25	t
3592	respadaf01	t	2	2025-09-25	2025-09-25	t
3606	sgonzalezp07	t	2	2025-09-25	2025-09-25	t
3598	ljaramillob01	t	2	2025-09-25	2025-09-25	t
3600	vmatap01	t	2	2025-09-25	2025-09-25	t
3607	amunnozs14	t	2	2025-09-25	2025-09-25	t
3595	dretamosas01	t	2	2025-09-25	2025-09-25	t
3591	jrivasg03	t	2	2025-09-25	2025-09-25	t
3604	proncerob02	t	2	2025-09-25	2025-09-25	t
3603	jsanchezm48	t	2	2025-09-25	2025-09-25	t
3594	ivacas01	t	2	2025-09-25	2025-09-25	t
3602	mvazquezs28	t	2	2025-09-25	2025-09-25	t
3643	nsansegundop01	t	2	2025-11-10	2025-11-10	t
3626	ablazquezm06	t	2	2025-11-03	2025-11-03	t
3627	acaballerop15	t	2	2025-11-03	2025-11-03	t
3628	gcorrralesp01	t	2	2025-11-03	2025-11-03	t
3629	vcurielm02	t	2	2025-11-03	2025-11-03	t
3630	jjduquep01	t	2	2025-11-03	2025-11-03	t
3631	cfeliper01	t	2	2025-11-03	2025-11-03	t
3632	ifernandezm25	t	2	2025-11-03	2025-11-03	t
3633	cherasg01	t	2	2025-11-03	2025-11-03	t
3634	allopezm03	t	2	2025-11-03	2025-11-03	t
3635	amartinezc41	t	2	2025-11-03	2025-11-03	t
3636	gmiguelm01	t	2	2025-11-03	2025-11-03	t
3637	eminnanao01	t	2	2025-11-03	2025-11-03	t
3638	gredondom03	t	2	2025-11-03	2025-11-03	t
3639	prenterob01	t	2	2025-11-03	2025-11-03	t
3640	eroblesv01	t	2	2025-11-03	2025-11-03	t
3608	mamarillap01	t	2	2025-11-03	2025-11-03	t
3609	abravol03	t	2	2025-11-03	2025-11-03	t
3610	mdelgadom21	t	2	2025-11-03	2025-11-03	t
3611	jdiazf11	t	2	2025-11-03	2025-11-03	t
3612	aditoa01	t	2	2025-11-03	2025-11-03	t
3613	jafernandezm04	t	2	2025-11-03	2025-11-03	t
3614	jjaraizc03	t	2	2025-11-03	2025-11-03	t
3615	gmaldonadob01	t	2	2025-11-03	2025-11-03	t
3616	mmorav02	t	2	2025-11-03	2025-11-03	t
3617	amorannoc01	t	2	2025-11-03	2025-11-03	t
3618	lmorannoc01	t	2	2025-11-03	2025-11-03	t
3619	nmorannoc01	t	2	2025-11-03	2025-11-03	t
3620	hpereirar01	t	2	2025-11-03	2025-11-03	t
3621	rrodriguezd06	t	2	2025-11-03	2025-11-03	t
3622	dsanchezg11	t	2	2025-11-03	2025-11-03	t
3623	asolise02	t	2	2025-11-03	2025-11-03	t
3624	gsolisv01	t	2	2025-11-03	2025-11-03	t
3625	cvalhondoa01	t	2	2025-11-03	2025-11-03	t
3641	crubiov04	t	2	2025-11-03	2025-11-03	t
3642	msanchezm41	t	2	2025-11-03	2025-11-03	t
3644	asecor01	t	2	2025-11-03	2025-11-03	t
3645	asolisg14	t	2	2025-11-03	2025-11-03	t
3646	jmbanegasl01	t	2	2025-11-10	2025-11-10	t
3647	oblancor01	t	2	2025-11-10	2025-11-10	t
3648	jcasallor01	t	2	2025-11-10	2025-11-10	t
3649	acaserof01	t	2	2025-11-10	2025-11-10	t
3651	rgarciab40	t	2	2025-11-10	2025-11-10	t
3654	ajimeneza02	t	2	2025-11-10	2025-11-10	t
3655	njimenezc03	t	2	2025-11-10	2025-11-10	t
3656	njimenezc04	t	2	2025-11-10	2025-11-10	t
3657	amartinezr21	t	2	2025-11-10	2025-11-10	t
3658	cmateog06	t	2	2025-11-10	2025-11-10	t
3660	rmorenos20	t	2	2025-11-10	2025-11-10	t
3661	aplazad02	t	2	2025-11-10	2025-11-10	t
3662	bvidartem01	t	2	2025-11-10	2025-11-10	t
3698	mporteros01	t	0	\N	\N	t
3695	destebans01	t	2	2025-11-11	2025-11-11	t
3696	dmmaiguar01	t	2	2025-11-11	2025-11-11	t
3694	dacostar03	t	2	2025-11-11	2025-11-11	t
3681	hdelgadon01	t	2	2025-11-11	2025-11-11	t
3682	sespadaf01	t	2	2025-11-11	2025-11-11	t
3683	sfelipes01	t	2	2025-11-11	2025-11-11	t
3684	ajimenezv03	t	2	2025-11-11	2025-11-11	t
3685	cjimenezv05	t	2	2025-11-11	2025-11-11	t
3686	elopezv02	t	2	2025-11-11	2025-11-11	t
3687	amunnozs15	t	2	2025-11-11	2025-11-11	t
3689	aredondoc10	t	2	2025-11-11	2025-11-11	t
3690	lroblesg01	t	2	2025-11-11	2025-11-11	t
3691	csanchezg155	t	2	2025-11-11	2025-11-11	t
3692	abvallejog01	t	2	2025-11-11	2025-11-11	t
3693	mzancadaf01	t	2	2025-11-11	2025-11-11	t
3701	jblazquezb07	t	2	2025-11-12	2025-11-12	t
3703	hgarciag02	t	2	2025-11-12	2025-11-12	t
3705	jagarciar05	t	2	2025-11-12	2025-11-12	t
3706	mgilg07	t	2	2025-11-12	2025-11-12	t
3707	chuesos01	t	2	2025-11-12	2025-11-12	t
3708	avisidros01	t	2	2025-11-12	2025-11-12	t
3700	jmalvaradom01	t	2	2025-11-12	2025-11-12	t
3677	javilav03	t	2	2025-11-11	2025-11-11	t
3679	lbarquillan01	t	2	2025-11-11	2025-11-11	t
3680	scerezoc01	t	2	2025-11-11	2025-11-11	t
3702	pfernandezp03	t	2	2025-11-12	2025-11-12	t
3704	agarciag78	t	2	2025-11-12	2025-11-12	t
3709	djimenezb02	t	2	2025-11-12	2025-11-12	t
3675	psantamariap01	t	2	2026-03-19	2026-03-19	t
3688	nperezm11	t	2	\N	\N	t
3667	agilp12	t	2	2026-03-19	2026-03-19	t
3668	lejimenezm01	t	2	2026-03-19	2026-03-19	t
3699	amroblesv01	t	2	\N	\N	t
3669	nminnanad02	t	2	2026-03-19	2026-03-19	t
3676	ctorilm01	t	2	2026-03-19	2026-03-19	t
3670	amunnozm32	t	2	2026-03-19	2026-03-19	t
3671	jpinob01	t	2	2026-03-19	2026-03-19	t
3672	lrubioa02	t	2	2026-03-19	2026-03-19	t
3674	asanchezt18	t	2	2026-03-19	2026-03-19	t
3666	sgarciam10	t	2	2026-03-19	2026-03-19	t
3665	avgarciam01	t	2	2026-03-19	2026-03-19	t
3664	eblazquezm01	t	2	2026-03-19	2026-03-19	t
3659	fmateosm09	t	2	\N	\N	t
3697	pmartinezc01	t	2	\N	\N	t
3710	hmariscalp04	t	2	2025-11-12	2025-11-12	t
3711	imartinn08	t	2	2025-11-12	2025-11-12	t
3712	pmartins02	t	2	2025-11-12	2025-11-12	t
3713	amateosg22	t	2	2025-11-12	2025-11-12	t
3714	aperezg51	t	2	2025-11-12	2025-11-12	t
3715	iriscot01	t	2	2025-11-12	2025-11-12	t
3716	arodriguezc13	t	2	2025-11-12	2025-11-12	t
3717	arodriguezc14	t	2	2025-11-12	2025-11-12	t
3719	aborregom08	t	1	2025-11-12	\N	t
3653	agonzalezj05	t	2	\N	\N	t
3740	cdelgadob10	t	2	\N	\N	f
3741	cboizab01	t	2	\N	\N	f
3759	cbarradot01	t	2	2026-03-19	2026-03-19	t
3742	ramarik01	t	2	2026-03-12	2026-03-12	t
3743	rtaitai01	t	2	2026-03-12	2026-03-12	t
3756	ibermejos02	t	2	2026-03-19	2026-03-19	t
3744	nquispec01	t	2	2026-03-19	2026-03-19	t
3757	dblancoa05	t	2	2026-03-19	2026-03-19	t
3755	eddiazg01	t	2	2026-03-19	2026-03-19	t
3753	myisidrob01	t	2	2026-03-19	2026-03-19	t
3758	jcpinor01	t	2	2026-03-19	2026-03-19	t
3752	iramosg04	t	2	2026-03-19	2026-03-19	t
3760	arodiiguezt01	t	2	2026-03-19	2026-03-19	t
3754	vtejadas01	t	2	2026-03-19	2026-03-19	t
3745	vbelvisb01	t	2	2026-03-19	2026-03-19	t
3747	pcascor01	t	2	2026-03-19	2026-03-19	t
3746	sgomezd04	t	2	2026-03-19	2026-03-19	t
3750	mvisidrob01	t	2	2026-03-19	2026-03-19	t
3749	rsanchezs76	t	2	2026-03-19	2026-03-19	t
3748	myatacuev01	t	2	2026-03-19	2026-03-19	t
3673	orubiog02	t	2	2026-03-19	2026-03-19	t
3718	cbelvisb01	t	2	2025-11-12	2026-03-19	t
3720	ecamposd01	t	2	2025-11-12	2026-03-19	t
3721	mcercasb02	t	2	2025-11-12	2026-03-19	t
3722	adiazf16	t	2	2025-11-12	2026-03-19	t
3724	ciglesiasp09	t	2	2026-03-19	2026-03-19	t
3725	ljimenezc07	t	2	2025-11-12	2026-03-19	t
3727	vmartins01	t	2	2025-11-12	2026-03-19	t
3728	mmendezp21	t	2	2025-11-12	2026-03-19	t
3729	dmunnozb04	t	2	2025-11-12	2026-03-19	t
3730	cortegad02	t	2	2025-11-12	2026-03-19	t
3731	mpablosc03	t	2	2025-11-12	2026-03-19	t
3732	eperezd05	t	2	2025-11-12	2026-03-19	t
3733	mesanchezomullon01	t	2	2025-11-12	2026-03-19	t
3734	isilvab02	t	2	2025-11-12	2026-03-19	t
3735	asolancem01	t	2	2025-11-12	2026-03-19	t
3736	isolisf01	t	2	2025-11-12	2026-03-19	t
3737	fvaqueroc02	t	2	2025-11-12	2026-03-19	t
3738	dvaquerog05	t	2	2025-11-12	2026-03-19	t
3739	szancadaf01	t	2	2025-11-12	2026-03-19	t
3751	aborregom01	t	2	\N	\N	f
3763	ibarradot01	t	2	2026-03-20	2026-03-20	t
3764	akhernandezd01	t	2	2026-03-20	2026-03-20	t
3766	djimeneza11	t	2	2026-03-20	2026-03-20	t
3767	gjimenezg06	t	2	2026-03-20	2026-03-20	t
3762	olopezc01	t	2	2026-03-20	2026-03-20	t
3761	rmarinm08	t	2	2026-03-20	2026-03-20	t
3765	adpetrescud01	t	2	2026-03-20	2026-03-20	t
3768	amarcelor01	t	2	\N	\N	f
3723	hgarciag15	t	2	\N	2026-03-23	t
3769	mgarciab104	t	2	\N	\N	f
3770	lgarciam16	t	2	\N	\N	f
3771	sebahassik01	t	2	\N	\N	f
\.


--
-- Data for Name: prestamos_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prestamos_items (id, idprestamo, idlibro, fechaentrega, fechadevolucion, devuelto, entregado) FROM stdin;
2331	3589	6	2025-09-25	\N	f	t
2332	3589	4	2025-09-25	\N	f	t
2333	3589	3	2025-09-25	\N	f	t
2334	3589	16	2025-09-25	\N	f	t
2335	3590	6	2025-09-25	\N	f	t
2336	3590	4	2025-09-25	\N	f	t
2337	3590	3	2025-09-25	\N	f	t
2338	3590	16	2025-09-25	\N	f	t
2363	3597	6	2025-09-25	\N	f	t
2364	3597	4	2025-09-25	\N	f	t
2365	3597	3	2025-09-25	\N	f	t
2366	3597	16	2025-09-25	\N	f	t
2395	3605	6	2025-09-25	\N	f	t
2396	3605	4	2025-09-25	\N	f	t
2397	3605	3	2025-09-25	\N	f	t
2398	3605	16	2025-09-25	\N	f	t
2413	3605	13	2025-09-25	\N	f	t
2347	3593	6	2025-09-25	\N	f	t
2348	3593	4	2025-09-25	\N	f	t
2349	3593	3	2025-09-25	\N	f	t
2350	3593	16	2025-09-25	\N	f	t
2371	3599	6	2025-09-25	\N	f	t
2372	3599	4	2025-09-25	\N	f	t
2373	3599	3	2025-09-25	\N	f	t
2374	3599	16	2025-09-25	\N	f	t
2359	3596	6	2025-09-25	\N	f	t
2360	3596	4	2025-09-25	\N	f	t
2361	3596	3	2025-09-25	\N	f	t
2362	3596	16	2025-09-25	\N	f	t
2379	3601	6	2025-09-25	\N	f	t
2380	3601	4	2025-09-25	\N	f	t
2381	3601	3	2025-09-25	\N	f	t
2382	3601	16	2025-09-25	\N	f	t
2410	3601	13	2025-09-25	\N	f	t
2343	3592	6	2025-09-25	\N	f	t
2344	3592	4	2025-09-25	\N	f	t
2345	3592	3	2025-09-25	\N	f	t
2346	3592	16	2025-09-25	\N	f	t
2407	3592	13	2025-09-25	\N	f	t
2399	3606	6	2025-09-25	\N	f	t
2400	3606	4	2025-09-25	\N	f	t
2401	3606	3	2025-09-25	\N	f	t
2402	3606	16	2025-09-25	\N	f	t
2367	3598	6	2025-09-25	\N	f	t
2368	3598	4	2025-09-25	\N	f	t
2369	3598	3	2025-09-25	\N	f	t
2370	3598	16	2025-09-25	\N	f	t
2375	3600	6	2025-09-25	\N	f	t
2376	3600	4	2025-09-25	\N	f	t
2377	3600	3	2025-09-25	\N	f	t
2378	3600	16	2025-09-25	\N	f	t
2409	3600	13	2025-09-25	\N	f	t
2403	3607	6	2025-09-25	\N	f	t
2404	3607	4	2025-09-25	\N	f	t
2405	3607	3	2025-09-25	\N	f	t
2406	3607	16	2025-09-25	\N	f	t
2355	3595	6	2025-09-25	\N	f	t
2356	3595	4	2025-09-25	\N	f	t
2357	3595	3	2025-09-25	\N	f	t
2358	3595	16	2025-09-25	\N	f	t
2408	3595	13	2025-09-25	\N	f	t
2339	3591	6	2025-09-25	\N	f	t
2340	3591	4	2025-09-25	\N	f	t
2341	3591	3	2025-09-25	\N	f	t
2342	3591	16	2025-09-25	\N	f	t
2391	3604	6	2025-09-25	\N	f	t
2392	3604	4	2025-09-25	\N	f	t
2393	3604	3	2025-09-25	\N	f	t
2394	3604	16	2025-09-25	\N	f	t
2412	3604	13	2025-09-25	\N	f	t
2387	3603	6	2025-09-25	\N	f	t
2388	3603	4	2025-09-25	\N	f	t
2389	3603	3	2025-09-25	\N	f	t
2390	3603	16	2025-09-25	\N	f	t
2411	3603	13	2025-09-25	\N	f	t
2351	3594	6	2025-09-25	\N	f	t
2352	3594	4	2025-09-25	\N	f	t
2353	3594	3	2025-09-25	\N	f	t
2354	3594	16	2025-09-25	\N	f	t
2383	3602	6	2025-09-25	\N	f	t
2384	3602	4	2025-09-25	\N	f	t
2385	3602	3	2025-09-25	\N	f	t
2386	3602	16	2025-09-25	\N	f	t
2418	3609	6	2025-11-03	\N	f	t
2419	3609	4	2025-11-03	\N	f	t
2420	3609	3	2025-11-03	\N	f	t
2422	3610	6	2025-11-03	\N	f	t
2423	3610	4	2025-11-03	\N	f	t
2424	3610	3	2025-11-03	\N	f	t
2425	3610	16	2025-11-03	\N	f	t
2426	3611	6	2025-11-03	\N	f	t
2427	3611	4	2025-11-03	\N	f	t
2428	3611	3	2025-11-03	\N	f	t
2429	3611	16	2025-11-03	\N	f	t
2430	3612	6	2025-11-03	\N	f	t
2431	3612	4	2025-11-03	\N	f	t
2432	3612	3	2025-11-03	\N	f	t
2433	3612	16	2025-11-03	\N	f	t
2434	3613	6	2025-11-03	\N	f	t
2435	3613	4	2025-11-03	\N	f	t
2436	3613	3	2025-11-03	\N	f	t
2438	3614	6	2025-11-03	\N	f	t
2439	3614	4	2025-11-03	\N	f	t
2440	3614	3	2025-11-03	\N	f	t
2441	3614	16	2025-11-03	\N	f	t
2442	3615	6	2025-11-03	\N	f	t
2443	3615	4	2025-11-03	\N	f	t
2444	3615	3	2025-11-03	\N	f	t
2445	3615	16	2025-11-03	\N	f	t
2446	3616	6	2025-11-03	\N	f	t
2447	3616	4	2025-11-03	\N	f	t
2448	3616	3	2025-11-03	\N	f	t
2449	3616	16	2025-11-03	\N	f	t
2450	3617	6	2025-11-03	\N	f	t
2451	3617	4	2025-11-03	\N	f	t
2452	3617	3	2025-11-03	\N	f	t
2454	3618	6	2025-11-03	\N	f	t
2455	3618	4	2025-11-03	\N	f	t
2456	3618	3	2025-11-03	\N	f	t
2457	3618	16	2025-11-03	\N	f	t
2458	3619	6	2025-11-03	\N	f	t
2459	3619	4	2025-11-03	\N	f	t
2460	3619	3	2025-11-03	\N	f	t
2461	3619	16	2025-11-03	\N	f	t
2462	3620	6	2025-11-03	\N	f	t
2463	3620	4	2025-11-03	\N	f	t
2464	3620	3	2025-11-03	\N	f	t
2466	3621	6	2025-11-03	\N	f	t
2414	3608	6	2025-11-03	\N	f	t
2415	3608	4	2025-11-03	\N	f	t
2416	3608	3	2025-11-03	\N	f	t
2417	3608	16	2025-11-03	\N	f	t
2488	3608	13	2025-11-03	\N	f	t
2421	3609	16	2025-11-03	\N	f	t
2491	3610	13	2025-11-03	\N	f	t
2489	3611	13	2025-11-03	\N	f	t
2437	3613	16	2025-11-03	\N	f	t
2486	3616	13	2025-11-03	\N	f	t
2453	3617	16	2025-11-03	\N	f	t
2465	3620	16	2025-11-03	\N	f	t
2467	3621	4	2025-11-03	\N	f	t
2468	3621	3	2025-11-03	\N	f	t
2469	3621	16	2025-11-03	\N	f	t
2470	3622	6	2025-11-03	\N	f	t
2471	3622	4	2025-11-03	\N	f	t
2472	3622	3	2025-11-03	\N	f	t
2473	3622	16	2025-11-03	\N	f	t
2487	3622	13	2025-11-03	\N	f	t
2474	3623	6	2025-11-03	\N	f	t
2475	3623	4	2025-11-03	\N	f	t
2476	3623	3	2025-11-03	\N	f	t
2477	3623	16	2025-11-03	\N	f	t
2478	3624	6	2025-11-03	\N	f	t
2479	3624	4	2025-11-03	\N	f	t
2480	3624	3	2025-11-03	\N	f	t
2481	3624	16	2025-11-03	\N	f	t
2482	3625	6	2025-11-03	\N	f	t
2483	3625	4	2025-11-03	\N	f	t
2484	3625	3	2025-11-03	\N	f	t
2485	3625	16	2025-11-03	\N	f	t
2490	3625	13	2025-11-03	\N	f	t
2497	3627	14	2025-11-10	\N	f	t
2498	3627	18	2025-11-10	\N	f	t
2499	3627	19	2025-11-10	\N	f	t
2500	3627	17	2025-11-10	\N	f	t
2501	3627	20	2025-11-10	\N	f	t
2502	3628	14	2025-11-10	\N	f	t
2503	3628	18	2025-11-10	\N	f	t
2504	3628	19	2025-11-10	\N	f	t
2505	3628	17	2025-11-10	\N	f	t
2506	3628	20	2025-11-10	\N	f	t
2507	3629	14	2025-11-10	\N	f	t
2508	3629	18	2025-11-10	\N	f	t
2509	3629	19	2025-11-10	\N	f	t
2510	3629	17	2025-11-10	\N	f	t
2511	3629	20	2025-11-10	2025-11-03	f	t
2512	3630	14	2025-11-10	\N	f	t
2513	3630	18	2025-11-10	\N	f	t
2514	3630	19	2025-11-10	\N	f	t
2515	3630	17	2025-11-10	\N	f	t
2516	3630	20	2025-11-10	\N	f	t
2517	3631	14	2025-11-10	\N	f	t
2518	3631	18	2025-11-10	\N	f	t
2519	3631	19	2025-11-10	\N	f	t
2520	3631	17	2025-11-10	\N	f	t
2521	3631	20	2025-11-10	\N	f	t
2522	3632	14	2025-11-10	\N	f	t
2523	3632	18	2025-11-10	\N	f	t
2524	3632	19	2025-11-10	\N	f	t
2525	3632	17	2025-11-10	\N	f	t
2526	3632	20	2025-11-10	\N	f	t
2527	3633	14	2025-11-10	\N	f	t
2528	3633	18	2025-11-10	\N	f	t
2529	3633	19	2025-11-10	\N	f	t
2530	3633	17	2025-11-10	\N	f	t
2531	3633	20	2025-11-10	\N	f	t
2532	3634	14	2025-11-10	\N	f	t
2533	3634	18	2025-11-10	\N	f	t
2534	3634	19	2025-11-10	\N	f	t
2535	3634	17	2025-11-10	\N	f	t
2536	3634	20	2025-11-10	\N	f	t
2537	3635	14	2025-11-10	\N	f	t
2538	3635	18	2025-11-10	\N	f	t
2539	3635	19	2025-11-10	\N	f	t
2540	3635	17	2025-11-10	\N	f	t
2541	3635	20	2025-11-10	\N	f	t
2542	3636	14	2025-11-10	\N	f	t
2543	3636	18	2025-11-10	\N	f	t
2544	3636	19	2025-11-10	\N	f	t
2545	3636	17	2025-11-10	\N	f	t
2546	3636	20	2025-11-10	\N	f	t
2547	3637	14	2025-11-10	\N	f	t
2548	3637	18	2025-11-10	\N	f	t
2549	3637	19	2025-11-10	\N	f	t
2550	3637	17	2025-11-10	\N	f	t
2551	3637	20	2025-11-10	\N	f	t
2552	3638	14	2025-11-10	\N	f	t
2553	3638	18	2025-11-10	\N	f	t
2554	3638	19	2025-11-10	\N	f	t
2555	3638	17	2025-11-10	\N	f	t
2556	3638	20	2025-11-10	\N	f	t
2557	3639	14	2025-11-10	\N	f	t
2558	3639	18	2025-11-10	\N	f	t
2559	3639	19	2025-11-10	\N	f	t
2560	3639	17	2025-11-10	\N	f	t
2561	3639	20	2025-11-10	\N	f	t
2562	3640	14	2025-11-10	\N	f	t
2563	3640	18	2025-11-10	\N	f	t
2564	3640	19	2025-11-10	\N	f	t
2565	3640	17	2025-11-10	\N	f	t
2566	3640	20	2025-11-10	\N	f	t
2567	3641	14	2025-11-10	\N	f	t
2568	3641	18	2025-11-10	\N	f	t
2569	3641	19	2025-11-10	\N	f	t
2492	3626	14	2025-11-10	\N	f	t
2493	3626	18	2025-11-10	\N	f	t
2494	3626	19	2025-11-10	\N	f	t
2495	3626	17	2025-11-10	\N	f	t
2496	3626	20	2025-11-10	\N	f	t
2577	3643	14	2025-11-10	\N	f	t
2578	3643	18	2025-11-10	\N	f	t
2579	3643	19	2025-11-10	\N	f	t
2580	3643	17	2025-11-10	\N	f	t
2581	3643	20	2025-11-10	\N	f	t
2582	3644	14	2025-11-10	\N	f	t
2583	3644	18	2025-11-10	\N	f	t
2584	3644	19	2025-11-10	\N	f	t
2585	3644	17	2025-11-10	\N	f	t
2586	3644	20	2025-11-10	\N	f	t
2599	3644	35	2025-11-10	\N	f	t
2587	3645	14	2025-11-10	\N	f	t
2588	3645	18	2025-11-10	\N	f	t
2589	3645	19	2025-11-10	\N	f	t
2590	3645	17	2025-11-10	\N	f	t
2603	3646	14	2025-11-10	\N	f	t
2604	3646	15	2025-11-10	\N	f	t
2605	3646	17	2025-11-10	\N	f	t
2606	3646	18	2025-11-10	\N	f	t
2607	3646	19	2025-11-10	\N	f	t
2608	3646	20	2025-11-10	\N	f	t
2609	3647	35	2025-11-10	\N	f	t
2610	3647	14	2025-11-10	\N	f	t
2611	3647	15	2025-11-10	\N	f	t
2612	3647	17	2025-11-10	\N	f	t
2613	3647	18	2025-11-10	\N	f	t
2614	3647	19	2025-11-10	\N	f	t
2595	3626	35	2025-11-10	\N	f	t
2601	3628	35	2025-11-10	\N	f	t
2594	3632	35	2025-11-10	\N	f	t
2597	3633	35	2025-11-10	\N	f	t
2596	3636	35	2025-11-10	\N	f	t
2598	3637	35	2025-11-10	\N	f	t
2593	3639	35	2025-11-10	\N	f	t
2570	3641	17	2025-11-10	\N	f	t
2571	3641	20	2025-11-10	\N	f	t
2572	3642	14	2025-11-10	\N	f	t
2573	3642	18	2025-11-10	\N	f	t
2574	3642	19	2025-11-10	\N	f	t
2575	3642	17	2025-11-10	\N	f	t
2576	3642	20	2025-11-10	\N	f	t
2592	3642	35	2025-11-10	\N	f	t
2591	3645	20	2025-11-10	\N	f	t
2600	3645	35	2025-11-10	\N	f	t
2615	3647	20	2025-11-10	\N	f	t
2616	3648	35	2025-11-10	\N	f	t
2617	3648	14	2025-11-10	\N	f	t
2618	3648	15	2025-11-10	\N	f	t
2619	3648	17	2025-11-10	\N	f	t
2620	3648	18	2025-11-10	\N	f	t
2621	3648	19	2025-11-10	\N	f	t
2622	3648	20	2025-11-10	\N	f	t
2623	3649	35	2025-11-10	\N	f	t
2624	3649	14	2025-11-10	\N	f	t
2625	3649	15	2025-11-10	\N	f	t
2626	3649	17	2025-11-10	\N	f	t
2627	3649	18	2025-11-10	\N	f	t
2628	3649	19	2025-11-10	\N	f	t
2629	3649	20	2025-11-10	\N	f	t
2637	3651	35	2025-11-10	\N	f	t
2638	3651	14	2025-11-10	\N	f	t
2639	3651	15	2025-11-10	\N	f	t
2640	3651	17	2025-11-10	\N	f	t
2641	3651	18	2025-11-10	\N	f	t
2642	3651	19	2025-11-10	\N	f	t
2643	3651	20	2025-11-10	\N	f	t
2659	3654	14	2025-11-10	\N	f	t
2660	3654	15	2025-11-10	\N	f	t
2661	3654	17	2025-11-10	\N	f	t
2662	3654	18	2025-11-10	\N	f	t
2663	3654	19	2025-11-10	\N	f	t
2664	3654	20	2025-11-10	\N	f	t
2666	3655	14	2025-11-10	\N	f	t
2667	3655	15	2025-11-10	\N	f	t
2668	3655	17	2025-11-10	\N	f	t
2669	3655	18	2025-11-10	\N	f	t
2670	3655	19	2025-11-10	\N	f	t
2671	3655	20	2025-11-10	\N	f	t
2673	3656	14	2025-11-10	\N	f	t
2674	3656	15	2025-11-10	\N	f	t
2675	3656	17	2025-11-10	\N	f	t
2676	3656	18	2025-11-10	\N	f	t
2677	3656	19	2025-11-10	\N	f	t
2678	3656	20	2025-11-10	\N	f	t
2679	3657	35	2025-11-10	\N	f	t
2680	3657	14	2025-11-10	\N	f	t
2681	3657	15	2025-11-10	\N	f	t
2682	3657	17	2025-11-10	\N	f	t
2683	3657	18	2025-11-10	\N	f	t
2684	3657	19	2025-11-10	\N	f	t
2685	3657	20	2025-11-10	\N	f	t
2686	3658	35	2025-11-10	\N	f	t
2687	3658	14	2025-11-10	\N	f	t
2688	3658	15	2025-11-10	\N	f	t
2689	3658	17	2025-11-10	\N	f	t
2690	3658	18	2025-11-10	\N	f	t
2691	3658	19	2025-11-10	\N	f	t
2692	3658	20	2025-11-10	\N	f	t
2701	3660	14	2025-11-10	\N	f	t
2702	3660	15	2025-11-10	\N	f	t
2703	3660	17	2025-11-10	\N	f	t
2704	3660	18	2025-11-10	\N	f	t
2705	3660	19	2025-11-10	\N	f	t
2706	3660	20	2025-11-10	\N	f	t
2707	3661	35	2025-11-10	\N	f	t
2708	3661	14	2025-11-10	\N	f	t
2709	3661	15	2025-11-10	\N	f	t
2710	3661	17	2025-11-10	\N	f	t
2711	3661	18	2025-11-10	\N	f	t
2712	3661	19	2025-11-10	\N	f	t
2713	3661	20	2025-11-10	\N	f	t
2714	3662	35	2025-11-10	\N	f	t
2715	3662	14	2025-11-10	\N	f	t
2716	3662	15	2025-11-10	\N	f	t
2717	3662	17	2025-11-10	\N	f	t
2718	3662	18	2025-11-10	\N	f	t
2719	3662	19	2025-11-10	\N	f	t
2720	3662	20	2025-11-10	\N	f	t
2744	3667	41	2026-03-19	\N	f	t
2652	3653	14	2025-11-10	\N	f	t
2746	3667	37	2026-03-19	\N	f	t
2747	3667	36	2026-03-19	\N	f	t
2748	3667	38	2026-03-19	\N	f	t
2749	3667	39	2026-03-19	\N	f	t
2737	3666	41	2026-03-19	\N	f	t
2739	3666	37	2026-03-19	\N	f	t
2740	3666	36	2026-03-19	\N	f	t
2741	3666	38	2026-03-19	\N	f	t
2742	3666	39	2026-03-19	\N	f	t
2694	3659	14	2026-03-23	\N	f	t
2730	3665	41	2026-03-19	\N	f	t
2732	3665	37	2026-03-19	\N	f	t
2733	3665	36	2026-03-19	\N	f	t
2734	3665	38	2026-03-19	\N	f	t
2735	3665	39	2026-03-19	\N	f	t
2723	3664	41	2026-03-19	\N	f	t
2724	3664	42	2026-03-19	\N	f	t
2725	3664	37	2026-03-19	\N	f	t
2726	3664	36	2026-03-19	\N	f	t
2727	3664	38	2026-03-19	\N	f	t
2736	3665	40	2026-03-19	\N	f	t
2695	3659	15	2025-11-10	\N	f	f
2696	3659	17	2026-03-23	\N	f	t
2697	3659	18	2026-03-23	\N	f	t
2698	3659	19	2026-03-23	\N	f	t
2699	3659	20	2025-11-10	\N	f	f
2828	3679	41	2026-03-19	\N	f	t
2830	3679	37	2026-03-19	\N	f	t
2831	3679	36	2026-03-19	\N	f	t
2832	3679	38	2026-03-19	\N	f	t
2833	3679	39	2026-03-19	\N	f	t
2834	3679	40	2026-03-19	\N	f	t
2835	3680	41	2026-03-19	\N	f	t
2837	3680	37	2026-03-19	\N	f	t
2838	3680	36	2026-03-19	\N	f	t
2839	3680	38	2026-03-19	\N	f	t
2840	3680	39	2026-03-19	\N	f	t
2841	3680	40	2026-03-19	\N	f	t
2842	3681	41	2026-03-19	\N	f	t
2844	3681	37	2026-03-19	\N	f	t
2845	3681	36	2026-03-19	\N	f	t
2846	3681	38	2026-03-19	\N	f	t
2847	3681	39	2026-03-19	\N	f	t
2848	3681	40	2026-03-19	\N	f	t
2849	3682	41	2026-03-19	\N	f	t
2851	3682	37	2026-03-19	\N	f	t
2852	3682	36	2026-03-19	\N	f	t
2853	3682	38	2026-03-19	\N	f	t
2854	3682	39	2026-03-19	\N	f	t
2855	3682	40	2026-03-19	\N	f	t
2856	3683	41	2026-03-19	\N	f	t
2858	3683	37	2026-03-19	\N	f	t
2859	3683	36	2026-03-19	\N	f	t
2860	3683	38	2026-03-19	\N	f	t
2861	3683	39	2026-03-19	\N	f	t
2863	3684	41	2026-03-19	\N	f	t
2865	3684	37	2026-03-19	\N	f	t
2866	3684	36	2026-03-19	\N	f	t
2867	3684	38	2026-03-19	\N	f	t
2868	3684	39	2026-03-19	\N	f	t
2869	3684	40	2026-03-19	\N	f	t
2870	3685	41	2026-03-19	\N	f	t
2872	3685	37	2026-03-19	\N	f	t
2873	3685	36	2026-03-19	\N	f	t
2874	3685	38	2026-03-19	\N	f	t
2875	3685	39	2026-03-19	\N	f	t
2877	3686	41	2026-03-19	\N	f	t
2879	3686	37	2026-03-19	\N	f	t
2880	3686	36	2026-03-19	\N	f	t
2881	3686	38	2026-03-19	\N	f	t
2882	3686	39	2026-03-19	\N	f	t
2883	3686	40	2026-03-19	\N	f	t
2884	3687	41	2026-03-19	\N	f	t
2886	3687	37	2026-03-19	\N	f	t
2887	3687	36	2026-03-19	\N	f	t
2888	3687	38	2026-03-19	\N	f	t
2889	3687	39	2026-03-19	\N	f	t
2890	3687	40	2026-03-19	\N	f	t
2898	3689	41	2026-03-19	\N	f	t
2900	3689	37	2026-03-19	\N	f	t
2901	3689	36	2026-03-19	\N	f	t
2902	3689	38	2026-03-19	\N	f	t
2891	3688	41	2026-03-19	\N	f	t
2893	3688	37	2026-03-19	\N	f	t
2894	3688	36	2026-03-19	\N	f	t
2895	3688	38	2026-03-19	\N	f	t
2896	3688	39	2026-03-19	\N	f	t
2786	3673	41	2026-03-19	\N	f	t
2788	3673	37	2026-03-19	\N	f	t
2789	3673	36	2026-03-19	\N	f	t
2790	3673	38	2026-03-19	\N	f	t
2791	3673	39	2026-03-19	\N	f	t
2792	3673	40	2026-03-19	\N	f	t
2807	3676	41	2026-03-19	\N	f	t
2808	3676	42	2026-03-19	\N	f	t
2809	3676	37	2026-03-19	\N	f	t
2810	3676	36	2026-03-19	\N	f	t
2811	3676	38	2026-03-19	\N	f	t
2812	3676	39	2026-03-19	\N	f	t
2751	3668	41	2026-03-19	\N	f	t
2800	3675	41	2026-03-19	\N	f	t
2802	3675	37	2026-03-19	\N	f	t
2803	3675	36	2026-03-19	\N	f	t
2804	3675	38	2026-03-19	\N	f	t
2805	3675	39	2026-03-19	\N	f	t
2806	3675	40	2026-03-19	\N	f	t
2758	3669	41	2026-03-19	\N	f	t
2760	3669	37	2026-03-19	\N	f	t
2761	3669	36	2026-03-19	\N	f	t
2762	3669	38	2026-03-19	\N	f	t
2763	3669	39	2026-03-19	\N	f	t
2764	3669	40	2026-03-19	\N	f	t
2765	3670	41	2026-03-19	\N	f	t
2767	3670	37	2026-03-19	\N	f	t
2768	3670	36	2026-03-19	\N	f	t
2769	3670	38	2026-03-19	\N	f	t
2770	3670	39	2026-03-19	\N	f	t
2771	3670	40	2026-03-19	\N	f	t
2772	3671	41	2026-03-19	\N	f	t
2773	3671	42	2026-03-19	\N	f	t
2774	3671	37	2026-03-19	\N	f	t
2775	3671	36	2026-03-19	\N	f	t
2776	3671	38	2026-03-19	\N	f	t
2779	3672	41	2026-03-19	\N	f	t
2780	3672	42	2026-03-19	\N	f	t
2781	3672	37	2026-03-19	\N	f	t
2782	3672	36	2026-03-19	\N	f	t
2783	3672	38	2026-03-19	\N	f	t
2784	3672	39	2026-03-19	\N	f	t
2793	3674	41	2026-03-19	\N	f	t
2795	3674	37	2026-03-19	\N	f	t
2796	3674	36	2026-03-19	\N	f	t
2797	3674	38	2026-03-19	\N	f	t
2798	3674	39	2026-03-19	\N	f	t
2799	3674	40	2026-03-19	\N	f	t
2750	3667	40	2026-03-19	\N	f	t
2752	3668	42	2026-03-19	\N	f	t
2753	3668	37	2026-03-19	\N	f	t
2754	3668	36	2026-03-19	\N	f	t
2755	3668	38	2026-03-19	\N	f	t
2756	3668	39	2026-03-19	\N	f	t
2945	3698	44	2025-11-11	\N	f	f
2946	3698	43	2025-11-11	\N	f	f
2947	3698	45	2025-11-11	\N	f	f
2933	3694	44	2025-11-11	\N	f	t
2934	3694	43	2025-11-11	\N	f	t
2935	3694	45	2025-11-11	\N	f	t
2936	3695	44	2025-11-11	\N	f	t
2937	3695	43	2025-11-11	\N	f	t
2938	3695	45	2025-11-11	\N	f	t
2939	3696	44	2025-11-11	\N	f	t
2940	3696	43	2025-11-11	\N	f	t
2941	3696	45	2025-11-11	\N	f	t
2951	3700	26	2025-11-12	\N	f	t
2952	3700	21	2025-11-12	\N	f	t
2954	3700	23	2025-11-12	\N	f	t
2956	3700	25	2025-11-12	\N	f	t
2957	3700	27	2025-11-12	\N	f	t
2959	3700	29	2025-11-12	\N	f	t
2960	3701	26	2025-11-12	\N	f	t
2961	3701	21	2025-11-12	\N	f	t
2963	3701	23	2025-11-12	\N	f	t
2965	3701	25	2025-11-12	\N	f	t
2966	3701	27	2025-11-12	\N	f	t
2968	3701	29	2025-11-12	\N	f	t
2969	3702	26	2025-11-12	\N	f	t
2970	3702	21	2025-11-12	\N	f	t
2972	3702	23	2025-11-12	\N	f	t
2974	3702	25	2025-11-12	\N	f	t
2975	3702	27	2025-11-12	\N	f	t
2977	3702	29	2025-11-12	\N	f	t
2987	3704	26	2025-11-12	\N	f	t
2988	3704	21	2025-11-12	\N	f	t
2990	3704	23	2025-11-12	\N	f	t
2992	3704	25	2025-11-12	\N	f	t
2993	3704	27	2025-11-12	\N	f	t
2995	3704	29	2025-11-12	\N	f	t
2996	3705	26	2025-11-12	\N	f	t
2997	3705	21	2025-11-12	\N	f	t
2999	3705	23	2025-11-12	\N	f	t
3001	3705	25	2025-11-12	\N	f	t
3002	3705	27	2025-11-12	\N	f	t
3004	3705	29	2025-11-12	\N	f	t
3005	3706	26	2025-11-12	\N	f	t
3006	3706	21	2025-11-12	\N	f	t
3008	3706	23	2025-11-12	\N	f	t
3010	3706	25	2025-11-12	\N	f	t
3011	3706	27	2025-11-12	\N	f	t
3013	3706	29	2025-11-12	\N	f	t
3014	3707	26	2025-11-12	\N	f	t
3015	3707	21	2025-11-12	\N	f	t
3017	3707	23	2025-11-12	\N	f	t
3019	3707	25	2025-11-12	\N	f	t
3020	3707	27	2025-11-12	\N	f	t
3022	3707	29	2025-11-12	\N	f	t
3023	3708	26	2025-11-12	\N	f	t
3024	3708	21	2025-11-12	\N	f	t
3026	3708	23	2025-11-12	\N	f	t
3028	3708	25	2025-11-12	\N	f	t
3029	3708	27	2025-11-12	\N	f	t
3031	3708	29	2025-11-12	\N	f	t
3032	3709	26	2025-11-12	\N	f	t
3033	3709	21	2025-11-12	\N	f	t
3035	3709	23	2025-11-12	\N	f	t
3037	3709	25	2025-11-12	\N	f	t
3038	3709	27	2025-11-12	\N	f	t
3040	3709	29	2025-11-12	\N	f	t
3041	3710	26	2025-11-12	\N	f	t
3042	3710	21	2025-11-12	\N	f	t
3044	3710	23	2025-11-12	\N	f	t
3046	3710	25	2025-11-12	\N	f	t
3047	3710	27	2025-11-12	\N	f	t
3049	3710	29	2025-11-12	\N	f	t
3050	3711	26	2025-11-12	\N	f	t
3051	3711	21	2025-11-12	\N	f	t
3053	3711	23	2025-11-12	\N	f	t
3055	3711	25	2025-11-12	\N	f	t
3056	3711	27	2025-11-12	\N	f	t
3058	3711	29	2025-11-12	\N	f	t
3059	3712	26	2025-11-12	\N	f	t
3060	3712	21	2025-11-12	\N	f	t
3062	3712	23	2025-11-12	\N	f	t
3064	3712	25	2025-11-12	\N	f	t
3065	3712	27	2025-11-12	\N	f	t
3067	3712	29	2025-11-12	\N	f	t
3068	3713	26	2025-11-12	\N	f	t
3069	3713	21	2025-11-12	\N	f	t
3071	3713	23	2025-11-12	\N	f	t
3073	3713	25	2025-11-12	\N	f	t
3074	3713	27	2025-11-12	\N	f	t
3076	3713	29	2025-11-12	\N	f	t
3077	3714	26	2025-11-12	\N	f	t
3078	3714	21	2025-11-12	\N	f	t
3080	3714	23	2025-11-12	\N	f	t
3082	3714	25	2025-11-12	\N	f	t
3083	3714	27	2025-11-12	\N	f	t
3085	3714	29	2025-11-12	\N	f	t
3086	3715	26	2025-11-12	\N	f	t
3087	3715	21	2025-11-12	\N	f	t
2905	3690	41	2026-03-19	\N	f	t
2907	3690	37	2026-03-19	\N	f	t
2912	3691	41	2026-03-19	\N	f	t
2914	3691	37	2026-03-19	\N	f	t
2915	3691	36	2026-03-19	\N	f	t
2916	3691	38	2026-03-19	\N	f	t
2917	3691	39	2026-03-19	\N	f	t
2919	3692	41	2026-03-19	\N	f	t
2921	3692	37	2026-03-19	\N	f	t
2922	3692	36	2026-03-19	\N	f	t
2923	3692	38	2026-03-19	\N	f	t
2924	3692	39	2026-03-19	\N	f	t
2925	3692	40	2026-03-19	\N	f	t
2926	3693	41	2026-03-19	\N	f	t
2928	3693	37	2026-03-19	\N	f	t
2929	3693	36	2026-03-19	\N	f	t
2930	3693	38	2026-03-19	\N	f	t
2931	3693	39	2026-03-19	\N	f	t
2978	3703	26	2026-03-23	\N	f	t
2979	3703	21	2026-03-23	\N	f	t
2981	3703	23	2026-03-23	\N	f	t
2983	3703	25	2026-03-23	\N	f	t
2984	3703	27	2026-03-23	\N	f	t
2986	3703	29	2026-03-23	\N	f	t
2942	3697	44	2026-03-24	\N	f	t
2943	3697	43	2026-03-24	\N	f	t
2944	3697	45	2026-03-24	\N	f	t
2948	3699	44	2026-03-23	\N	f	t
2949	3699	43	2026-03-23	\N	f	t
2950	3699	45	2026-03-23	\N	f	t
3089	3715	23	2025-11-12	\N	f	t
3091	3715	25	2025-11-12	\N	f	t
3092	3715	27	2025-11-12	\N	f	t
3094	3715	29	2025-11-12	\N	f	t
3095	3716	26	2025-11-12	\N	f	t
3096	3716	21	2025-11-12	\N	f	t
3098	3716	23	2025-11-12	\N	f	t
3100	3716	25	2025-11-12	\N	f	t
3101	3716	27	2025-11-12	\N	f	t
3103	3716	29	2025-11-12	\N	f	t
3104	3717	26	2025-11-12	\N	f	t
3105	3717	21	2025-11-12	\N	f	t
3107	3717	23	2025-11-12	\N	f	t
3109	3717	25	2025-11-12	\N	f	t
3110	3717	27	2025-11-12	\N	f	t
3112	3717	29	2025-11-12	\N	f	t
3125	3719	23	2025-11-12	\N	f	f
3127	3719	25	2025-11-12	\N	f	f
3128	3719	27	2025-11-12	\N	f	f
3129	3719	28	2025-11-12	\N	f	f
3311	3708	24	2025-11-12	\N	f	t
3312	3712	24	2025-11-12	\N	f	t
3319	3741	6	2026-03-02	\N	f	t
3320	3741	3	2026-03-02	\N	f	t
3321	3741	16	2026-03-02	\N	f	t
3322	3741	4	2026-03-02	\N	f	t
3115	3718	22	2026-03-19	\N	f	t
3118	3718	25	2026-03-19	\N	f	t
3119	3718	27	2026-03-19	\N	f	t
3120	3718	28	2026-03-19	\N	f	t
3313	3740	39	2026-03-02	\N	f	t
3314	3740	40	2026-03-02	\N	f	t
3315	3740	37	2026-03-02	\N	f	t
3316	3740	38	2026-03-02	\N	f	t
3132	3720	21	2026-03-19	\N	f	t
3177	3725	21	2026-03-19	\N	f	t
3179	3725	23	2026-03-19	\N	f	t
3181	3725	25	2026-03-19	\N	f	t
3182	3725	27	2026-03-19	\N	f	t
3184	3725	29	2026-03-19	\N	f	t
3134	3720	23	2026-03-19	\N	f	t
3136	3720	25	2026-03-19	\N	f	t
3137	3720	27	2026-03-19	\N	f	t
3142	3721	22	2026-03-19	\N	f	t
3144	3721	24	2026-03-19	\N	f	t
3145	3721	25	2026-03-19	\N	f	t
3146	3721	27	2026-03-19	\N	f	t
3147	3721	28	2026-03-19	\N	f	t
3151	3722	22	2026-03-19	\N	f	t
3154	3722	25	2026-03-19	\N	f	t
3155	3722	27	2026-03-19	\N	f	t
3156	3722	28	2026-03-19	\N	f	t
3168	3724	21	2026-03-19	\N	f	t
3170	3724	23	2026-03-19	\N	f	t
3172	3724	25	2026-03-19	\N	f	t
3173	3724	27	2026-03-19	\N	f	t
3196	3727	22	2026-03-19	\N	f	t
3198	3727	24	2026-03-19	\N	f	t
3199	3727	25	2026-03-19	\N	f	t
3200	3727	27	2026-03-19	\N	f	t
3202	3727	29	2026-03-19	\N	f	t
3206	3728	23	2026-03-19	\N	f	t
3208	3728	25	2026-03-19	\N	f	t
3209	3728	27	2026-03-19	\N	f	t
3211	3728	29	2026-03-19	\N	f	t
3213	3729	21	2026-03-19	\N	f	t
3215	3729	23	2026-03-19	\N	f	t
3217	3729	25	2026-03-19	\N	f	t
3218	3729	27	2026-03-19	\N	f	t
3220	3729	29	2026-03-19	\N	f	t
3222	3730	21	2026-03-19	\N	f	t
3224	3730	23	2026-03-19	\N	f	t
3226	3730	25	2026-03-19	\N	f	t
3227	3730	27	2026-03-19	\N	f	t
3232	3731	22	2026-03-19	\N	f	t
3235	3731	25	2026-03-19	\N	f	t
3236	3731	27	2026-03-19	\N	f	t
3237	3731	28	2026-03-19	\N	f	t
3240	3732	21	2026-03-19	\N	f	t
3242	3732	23	2026-03-19	\N	f	t
3244	3732	25	2026-03-19	\N	f	t
3245	3732	27	2026-03-19	\N	f	t
3247	3732	29	2026-03-19	\N	f	t
3251	3733	23	2026-03-19	\N	f	t
3253	3733	25	2026-03-19	\N	f	t
3254	3733	27	2026-03-19	\N	f	t
3256	3733	29	2026-03-19	\N	f	t
3258	3734	21	2026-03-19	\N	f	t
3260	3734	23	2026-03-19	\N	f	t
3262	3734	25	2026-03-19	\N	f	t
3263	3734	27	2026-03-19	\N	f	t
3267	3735	21	2026-03-19	\N	f	t
3269	3735	23	2026-03-19	\N	f	t
3270	3735	24	2026-03-19	\N	f	t
3271	3735	25	2026-03-19	\N	f	t
3272	3735	27	2026-03-19	\N	f	t
3277	3736	22	2026-03-19	\N	f	t
3279	3736	24	2026-03-19	\N	f	t
3280	3736	25	2026-03-19	\N	f	t
3281	3736	27	2026-03-19	\N	f	t
3282	3736	28	2026-03-19	\N	f	t
3286	3737	22	2026-03-19	\N	f	t
3289	3737	25	2026-03-19	\N	f	t
3290	3737	27	2026-03-19	\N	f	t
3291	3737	28	2026-03-19	\N	f	t
3295	3738	22	2026-03-19	\N	f	t
3297	3738	24	2026-03-19	\N	f	t
3298	3738	25	2026-03-19	\N	f	t
3299	3738	27	2026-03-19	\N	f	t
3301	3738	29	2026-03-19	\N	f	t
3303	3739	21	2026-03-19	\N	f	t
3305	3739	23	2026-03-19	\N	f	t
3307	3739	25	2026-03-19	\N	f	t
3308	3739	27	2026-03-19	\N	f	t
3161	3723	23	2026-03-23	\N	f	t
3163	3723	25	2026-03-23	\N	f	t
3164	3723	27	2026-03-23	\N	f	t
3166	3723	29	2026-03-23	\N	f	t
3339	3746	46	2026-03-19	\N	f	t
2653	3653	15	2025-11-10	\N	f	t
2654	3653	17	2025-11-10	\N	f	t
2655	3653	18	2025-11-10	2026-02-13	t	t
2656	3653	19	2025-11-10	\N	f	t
2657	3653	20	2025-11-10	\N	f	t
2721	3653	35	2025-11-10	\N	f	t
3340	3746	48	2026-03-19	\N	f	t
3341	3746	47	2026-03-19	\N	f	t
3355	3750	46	2026-03-19	\N	f	t
3317	3740	41	2026-03-02	\N	f	t
3356	3750	48	2026-03-19	\N	f	t
3357	3750	47	2026-03-19	\N	f	t
3351	3749	46	2026-03-19	\N	f	t
3352	3749	48	2026-03-19	\N	f	t
3353	3749	47	2026-03-19	\N	f	t
3379	3753	33	2026-03-19	\N	f	t
3384	3758	33	2026-03-19	\N	f	t
3378	3752	33	2026-03-19	\N	f	t
3139	3720	29	2026-03-19	\N	f	t
2814	3677	41	2026-03-19	\N	f	t
2816	3677	37	2026-03-19	\N	f	t
2817	3677	36	2026-03-19	\N	f	t
2818	3677	38	2026-03-19	\N	f	t
2819	3677	39	2026-03-19	\N	f	t
2820	3677	40	2026-03-19	\N	f	t
2862	3683	40	2026-03-19	\N	f	t
2876	3685	40	2026-03-19	\N	f	t
2903	3689	39	2026-03-19	\N	f	t
2904	3689	40	2026-03-19	\N	f	t
2908	3690	36	2026-03-19	\N	f	t
2909	3690	38	2026-03-19	\N	f	t
2910	3690	39	2026-03-19	\N	f	t
2911	3690	40	2026-03-19	\N	f	t
2918	3691	40	2026-03-19	\N	f	t
2932	3693	40	2026-03-19	\N	f	t
3327	3743	46	2026-03-19	\N	f	t
3328	3743	48	2026-03-19	\N	f	t
3329	3743	47	2026-03-19	\N	f	t
3330	3743	49	2026-03-19	\N	f	t
3348	3748	48	2026-03-19	\N	f	t
3349	3748	47	2026-03-19	\N	f	t
3331	3688	51	2026-03-19	\N	f	t
2897	3688	40	2026-03-19	\N	f	t
3332	3744	44	2026-03-19	\N	f	t
3333	3744	43	2026-03-19	\N	f	t
3334	3744	45	2026-03-19	\N	f	t
3175	3724	29	2026-03-19	\N	f	t
3373	3724	26	2026-03-19	\N	f	t
3229	3730	29	2026-03-19	\N	f	t
3265	3734	29	2026-03-19	\N	f	t
3274	3735	29	2026-03-19	\N	f	t
3310	3739	29	2026-03-19	\N	f	t
3386	3760	33	2026-03-19	\N	f	t
3380	3754	33	2026-03-19	\N	f	t
3323	3742	46	2026-03-19	\N	f	t
3324	3742	48	2026-03-19	\N	f	t
3325	3742	47	2026-03-19	\N	f	t
3326	3742	49	2026-03-19	\N	f	t
3335	3745	46	2026-03-19	\N	f	t
3336	3745	48	2026-03-19	\N	f	t
3337	3745	47	2026-03-19	\N	f	t
3343	3747	46	2026-03-19	\N	f	t
3344	3747	48	2026-03-19	\N	f	t
3345	3747	47	2026-03-19	\N	f	t
3372	3664	51	2026-03-19	\N	f	t
2728	3664	39	2026-03-19	\N	f	t
2729	3664	40	2026-03-19	\N	f	t
3363	3665	51	2026-03-19	\N	f	t
3359	3666	42	2026-03-19	\N	f	t
3360	3666	51	2026-03-19	\N	f	t
2743	3666	40	2026-03-19	\N	f	t
3365	3667	51	2026-03-19	\N	f	t
3367	3668	51	2026-03-19	\N	f	t
2757	3668	40	2026-03-19	\N	f	t
3368	3669	51	2026-03-19	\N	f	t
3369	3670	51	2026-03-19	\N	f	t
3370	3671	51	2026-03-19	\N	f	t
2777	3671	39	2026-03-19	\N	f	t
2778	3671	40	2026-03-19	\N	f	t
3362	3672	51	2026-03-19	\N	f	t
2785	3672	40	2026-03-19	\N	f	t
3371	3673	51	2026-03-19	\N	f	t
3366	3674	51	2026-03-19	\N	f	t
3364	3675	51	2026-03-19	\N	f	t
3361	3676	51	2026-03-19	\N	f	t
2813	3676	40	2026-03-19	\N	f	t
3375	3751	25	2026-03-19	\N	f	t
3376	3751	27	2026-03-19	\N	f	t
3377	3751	28	2026-03-19	\N	f	t
3374	3751	23	2026-03-19	\N	f	t
3385	3759	33	2026-03-19	\N	f	t
3382	3756	33	2026-03-19	\N	f	t
3383	3757	33	2026-03-19	\N	f	t
3381	3755	33	2026-03-19	\N	f	t
3389	3763	52	2026-03-20	\N	f	t
3390	3764	52	2026-03-20	\N	f	t
3392	3766	52	2026-03-20	\N	f	t
3393	3767	52	2026-03-20	\N	f	t
3388	3762	52	2026-03-20	\N	f	t
3387	3761	52	2026-03-20	\N	f	t
3391	3765	52	2026-03-20	\N	f	t
3394	3768	25	2026-03-23	\N	f	t
3395	3768	27	2026-03-23	\N	f	t
3396	3768	23	2026-03-23	\N	f	t
3397	3768	28	2026-03-23	\N	f	t
3399	3769	18	2026-03-23	\N	f	t
3400	3769	19	2026-03-23	\N	f	t
3401	3769	17	2026-03-23	\N	f	t
3398	3769	14	2026-03-23	\N	f	t
3402	3770	14	2026-03-23	\N	f	t
3403	3770	18	2026-03-23	\N	f	t
3404	3770	19	2026-03-23	\N	f	t
3405	3770	17	2026-03-23	\N	f	t
3406	3771	38	2026-03-23	\N	f	t
3407	3771	39	2026-03-23	\N	f	t
3408	3771	37	2026-03-23	\N	f	t
3409	3771	36	2026-03-23	\N	f	t
3410	3771	51	2026-03-23	\N	f	t
3411	3771	40	2026-03-23	\N	f	t
\.


--
-- Data for Name: prestamos_llaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prestamos_llaves (id, idestancia, unidades, fechaentrega, fechadevolucion, uid, devuelta) FROM stdin;
19	7	1	2025-10-22 08:06:52.399+00	2025-10-22 08:07:15.539+00	jbellidoc01	t
20	39	1	2025-10-22 12:08:16.808+00	2025-10-22 12:08:28.036+00	jbellidoc01	t
21	26	1	2025-10-23 11:35:13.155+00	2025-10-23 11:35:22.913+00	mebravom01	t
23	65	1	2025-10-24 08:13:52.477+00	2025-10-24 08:14:14.577+00	sromang06	t
24	10	1	2025-10-24 08:15:04.499+00	2025-10-24 08:20:08.606+00	mdpmartinezf01	t
26	10	1	2025-10-24 08:20:14.777+00	2025-10-24 08:20:31.654+00	mebravom01	t
25	37	1	2025-10-24 08:17:48.111+00	2025-10-24 08:21:39.84+00	chisco	t
22	59	1	2025-10-24 08:12:44.966+00	2025-10-24 08:21:46.024+00	mrcarmonav01	t
28	11	1	2025-10-24 08:32:43.69+00	2025-10-24 08:32:59.491+00	chisco	t
29	10	1	2025-10-24 08:36:06.947+00	2025-10-24 08:36:21.063+00	rmvegac01	t
30	11	1	2025-10-24 08:37:45.625+00	2025-10-24 08:38:01.071+00	chisco	t
27	14	1	2025-10-24 08:20:54.882+00	2025-10-24 08:38:07.263+00	omsanchezg01	t
33	14	1	2025-10-24 09:46:17.117+00	2025-10-24 10:28:31.17+00	mrcarmonav01	t
34	24	1	2025-10-24 10:14:48.446+00	2025-10-24 10:32:05.615+00	ndelorzac02	t
32	43	1	2025-10-24 09:36:13.711+00	2025-10-24 11:27:49.009+00	lpcamarac01	t
36	45	1	2025-10-24 10:34:05.211+00	2025-10-24 11:28:06.429+00	djuliog01	t
35	41	1	2025-10-24 10:33:00.596+00	2025-10-24 11:29:09.206+00	omsanchezg01	t
31	11	1	2025-10-24 08:39:56.386+00	2025-10-24 12:20:33.159+00	chisco	t
38	45	1	2025-10-24 11:30:03.937+00	2025-10-24 12:20:39.133+00	dmatasr01	t
37	14	1	2025-10-24 10:53:55.586+00	2025-10-24 12:21:22.014+00	cjlozanop01	t
40	11	1	2025-10-27 07:45:32.758+00	2025-10-27 08:02:23.946+00	chisco	t
41	42	1	2025-10-27 08:17:40.27+00	2025-10-27 08:18:12.438+00	chisco	t
39	26	1	2025-10-27 07:36:33.648+00	2025-10-27 08:25:12.657+00	mdcpalaciosr01	t
42	43	1	2025-10-27 08:38:01.025+00	2025-10-27 09:08:38.449+00	rmvegac01	t
78	41	1	2025-10-27 09:36:14.83+00	2025-10-27 10:11:46.273+00	rmvegac01	t
43	30	1	2025-10-27 09:00:05.18+00	2025-10-27 10:11:52.269+00	rmvegac01	t
45	22	1	2025-10-27 09:25:38.016+00	2025-10-27 10:15:16.564+00	jjmorcillor01	t
79	26	1	2025-10-27 10:15:29.102+00	2025-10-27 10:19:07.004+00	chisco	t
82	41	1	2025-10-27 10:47:43.541+00	2025-10-27 11:38:05.522+00	mgperezr02	t
81	43	1	2025-10-27 10:38:47.563+00	2025-10-27 11:38:21.971+00	lpcamarac01	t
80	30	1	2025-10-27 10:18:46.7+00	2025-10-27 11:45:10.978+00	rmvegac01	t
83	37	1	2025-10-27 12:03:47.53+00	2025-10-27 12:42:33.225+00	tecnicos	t
44	14	1	2025-10-27 09:19:19.332+00	2025-10-27 13:03:39.626+00	mtmarting03	t
86	30	1	2025-10-27 12:34:56.015+00	2025-10-27 13:17:17.307+00	efranciscor01	t
85	41	1	2025-10-27 12:30:48.387+00	2025-10-27 13:21:21.164+00	omsanchezg01	t
84	43	1	2025-10-27 12:20:06.671+00	2025-10-27 13:22:40.834+00	lpcamarac01	t
87	43	1	2025-10-28 07:26:06.297+00	2025-10-28 07:28:42.249+00	dnarcisoc01	t
88	45	1	2025-10-28 07:34:02.596+00	2025-10-28 08:44:02.589+00	chisco	t
92	45	1	2025-10-28 08:46:04.063+00	2025-10-28 08:50:08.693+00	chisco	t
93	41	1	2025-10-28 09:17:36.497+00	2025-10-28 10:12:43.193+00	omsanchezg01	t
97	22	1	2025-10-28 10:13:16.538+00	2025-10-28 10:40:20.195+00	cjlozanop01	t
95	30	1	2025-10-28 10:08:19.555+00	2025-10-28 11:28:48.345+00	amfajardol01	t
100	22	1	2025-10-28 10:47:53.904+00	2025-10-28 11:32:39.92+00	cjlozanop01	t
98	41	1	2025-10-28 10:41:06.557+00	2025-10-28 11:32:58.326+00	dmatasr01	t
99	45	1	2025-10-28 10:44:18.602+00	2025-10-28 11:44:39.478+00	jrodriguezt18	t
96	14	1	2025-10-28 10:11:45.823+00	2025-10-28 11:58:34.847+00	chisco	t
101	45	1	2025-10-28 11:34:16.392+00	2025-10-28 12:28:33.262+00	djuliog01	t
102	43	1	2025-10-28 11:34:32.602+00	2025-10-28 12:28:51.327+00	lpcamarac01	t
94	12	1	2025-10-28 09:20:36.259+00	2025-10-28 12:29:32.895+00	lmoralesg04	t
107	43	1	2025-10-28 12:31:17.64+00	2025-10-28 12:36:50.958+00	lmoralesg04	t
108	41	1	2025-10-28 12:31:30.027+00	2025-10-28 12:36:50.958+00	lmoralesg04	t
89	37	1	2025-10-28 07:42:10.979+00	2025-10-28 12:58:57.352+00	tecnicos	t
90	42	1	2025-10-28 07:42:28.843+00	2025-10-28 12:58:57.352+00	tecnicos	t
91	27	1	2025-10-28 07:42:46.593+00	2025-10-28 12:58:57.352+00	tecnicos	t
105	67	1	2025-10-28 12:27:34.391+00	2025-10-28 13:06:14.131+00	chisco	t
106	14	1	2025-10-28 12:29:58.423+00	2025-10-28 13:21:37.424+00	cjlozanop01	t
104	45	1	2025-10-28 12:26:58.994+00	2025-10-28 13:22:04.976+00	dmatasr01	t
103	71	1	2025-10-28 12:11:21.11+00	2025-10-29 08:25:52.861+00	mrcarmonav01	t
114	30	1	2025-10-29 08:32:33.496+00	2025-10-29 08:33:51.029+00	efranciscor01	t
113	42	1	2025-10-29 08:28:54.056+00	2025-10-29 09:15:29.001+00	cblancoa02	t
112	43	1	2025-10-29 08:28:00.333+00	2025-10-29 09:18:00.59+00	mjcorralesg01	t
118	17	1	2025-10-29 09:36:40.172+00	2025-10-29 09:38:04.134+00	igomezc12	t
120	30	1	2025-10-29 10:07:25.664+00	2025-10-29 10:09:18.665+00	dnarcisoc01	t
117	14	1	2025-10-29 09:19:40.693+00	2025-10-29 10:10:32.935+00	mtcerezog01	t
116	41	1	2025-10-29 09:17:52.011+00	2025-10-29 10:12:02.26+00	omsanchezg01	t
115	45	1	2025-10-29 09:17:24.441+00	2025-10-29 10:18:28.81+00	sromang06	t
119	43	1	2025-10-29 09:37:33.319+00	2025-10-29 10:23:20.681+00	rmvegac01	t
122	41	1	2025-10-29 10:42:37.203+00	2025-10-29 11:32:54.137+00	omsanchezg01	t
123	43	1	2025-10-29 10:45:19.393+00	2025-10-29 11:34:14.14+00	amfajardol01	t
124	41	1	2025-10-29 11:35:20.239+00	2025-10-29 12:38:23.032+00	mgperezr02	t
111	14	1	2025-10-29 08:25:20.477+00	2025-10-29 12:38:27.954+00	mtmarting03	t
109	37	1	2025-10-29 07:31:11.62+00	2025-10-29 13:12:38.31+00	tecnicos	t
110	27	1	2025-10-29 07:31:26.608+00	2025-10-29 13:12:38.31+00	tecnicos	t
121	36	1	2025-10-29 10:38:14.279+00	2025-10-29 13:12:38.31+00	tecnicos	t
129	67	1	2025-10-30 07:38:35.123+00	2025-10-30 07:45:13.016+00	ndelorzac02	t
128	41	1	2025-10-30 07:33:09.562+00	2025-10-30 08:24:53.131+00	omsanchezg01	t
132	45	1	2025-10-30 08:24:18.531+00	2025-10-30 09:17:07.686+00	sromang06	t
133	41	1	2025-10-30 09:10:46.743+00	2025-10-30 09:28:24.041+00	chisco	t
134	43	1	2025-10-30 09:10:56.51+00	2025-10-30 09:28:24.041+00	chisco	t
135	55	1	2025-10-30 09:12:13.041+00	2025-10-30 09:28:24.041+00	chisco	t
136	47	1	2025-10-30 09:28:51.973+00	2025-10-30 09:37:32.365+00	chisco	t
127	14	1	2025-10-30 07:27:50.645+00	2025-10-30 10:47:37.016+00	lmoralesg04	t
126	39	1	2025-10-30 07:13:23.324+00	2025-10-30 10:57:58.769+00	pety78	t
137	14	1	2025-10-30 10:46:42.185+00	2025-10-30 11:31:07.077+00	omsanchezg01	t
125	71	1	2025-10-30 07:12:45.896+00	2025-10-30 11:36:06.506+00	pety78	t
139	41	1	2025-10-30 10:57:47.848+00	2025-10-30 11:36:06.506+00	pety78	t
130	27	1	2025-10-30 07:40:14.444+00	2025-10-30 12:55:59.823+00	tecnicos	t
131	37	1	2025-10-30 07:40:42.988+00	2025-10-30 12:55:59.823+00	tecnicos	t
138	17	1	2025-10-30 10:56:47.756+00	2025-10-30 13:24:58.064+00	emurielb76	t
145	41	1	2025-10-31 07:36:57.396+00	2025-10-31 07:37:43.597+00	mebravom01	t
143	45	1	2025-10-31 07:32:55.964+00	2025-10-31 08:21:44.71+00	omsanchezg01	t
146	43	1	2025-10-31 07:37:50.818+00	2025-10-31 08:23:10.661+00	mebravom01	t
144	14	1	2025-10-31 07:33:50.825+00	2025-10-31 08:23:48.765+00	mtcerezog01	t
151	14	1	2025-10-31 08:26:35.958+00	2025-10-31 09:16:53.555+00	omsanchezg01	t
147	22	1	2025-10-31 07:45:09.815+00	2025-10-31 09:17:06.602+00	mafloresm01	t
153	43	1	2025-10-31 10:14:07.764+00	2025-10-31 12:42:38.749+00	chisco	t
140	27	1	2025-10-31 07:31:11.611+00	2025-10-31 12:56:30.101+00	tecnicos	t
141	42	1	2025-10-31 07:31:36.635+00	2025-10-31 12:56:30.101+00	tecnicos	t
150	17	1	2025-10-31 08:17:02.157+00	2025-10-31 13:21:58.095+00	mgperezr02	t
152	45	1	2025-10-31 09:21:47.367+00	2025-10-31 10:19:16.778+00	vpalaciosg06	t
156	14	1	2025-10-31 10:45:27.299+00	2025-10-31 11:34:16.494+00	cjlozanop01	t
155	71	1	2025-10-31 10:44:41.806+00	2025-10-31 11:54:46.995+00	mrcarmonav01	t
154	47	1	2025-10-31 10:14:41.383+00	2025-10-31 12:42:38.749+00	chisco	t
142	37	1	2025-10-31 07:31:50.683+00	2025-10-31 12:56:30.101+00	tecnicos	t
148	41	1	2025-10-31 07:55:47.779+00	2025-10-31 12:56:30.101+00	tecnicos	t
149	40	1	2025-10-31 07:57:05.86+00	2025-10-31 12:56:30.101+00	tecnicos	t
157	43	1	2025-10-31 11:02:49.288+00	2025-10-31 12:56:30.101+00	tecnicos	t
158	19	1	2025-10-31 12:46:30.637+00	2025-10-31 13:21:29.53+00	chisco	t
165	43	1	2025-11-03 08:07:24.331+00	2025-11-03 08:23:49.187+00	chisco	t
167	22	1	2025-11-03 09:18:35.217+00	2025-11-03 10:14:44.151+00	jjmorcillor01	t
168	14	1	2025-11-03 09:29:54.677+00	2025-11-03 10:20:47.111+00	mtmarting03	t
170	67	1	2025-11-03 10:19:30.6+00	2025-11-03 10:21:31.635+00	isabel22	t
171	17	1	2025-11-03 10:20:40.906+00	2025-11-03 10:52:42.825+00	mtmarting03	t
169	30	1	2025-11-03 10:13:43.427+00	2025-11-03 10:58:13.973+00	mgperezr02	t
172	41	1	2025-11-03 10:47:42.394+00	2025-11-03 11:32:59.048+00	mgperezr02	t
174	22	1	2025-11-03 11:36:08.203+00	2025-11-03 12:24:45.019+00	mgranadob01	t
175	67	1	2025-11-03 12:28:10.975+00	2025-11-03 13:21:25.645+00	ndelorzac02	t
173	14	1	2025-11-03 11:19:26.104+00	2025-11-03 13:21:30.615+00	mtmarting03	t
159	71	1	2025-11-03 07:34:07.006+00	2025-11-03 13:21:37.152+00	mrcarmonav01	t
160	27	1	2025-11-03 07:34:34.709+00	2025-11-03 13:21:42.865+00	tecnicos	t
161	44	1	2025-11-03 07:34:50.47+00	2025-11-03 13:21:46.703+00	tecnicos	t
162	42	1	2025-11-03 07:35:00.629+00	2025-11-03 13:21:49.407+00	tecnicos	t
163	37	1	2025-11-03 07:35:09.756+00	2025-11-03 13:21:52.111+00	tecnicos	t
166	59	1	2025-11-03 08:53:01.954+00	2025-11-03 13:21:55.232+00	tecnicos	t
176	43	1	2025-11-03 12:29:15.938+00	2025-11-03 13:23:19.473+00	omsanchezg01	t
177	30	1	2025-11-04 07:31:01.003+00	2025-11-04 08:22:21.188+00	dnarcisoc01	t
178	43	1	2025-11-04 07:32:12.586+00	2025-11-04 09:09:38.588+00	chisco	t
183	45	1	2025-11-04 08:26:28.798+00	2025-11-04 09:20:03.8+00	jjmorcillor01	t
189	22	1	2025-11-04 10:11:06.538+00	2025-11-04 10:40:40.869+00	cjlozanop01	t
190	22	1	2025-11-04 10:40:58.266+00	2025-11-04 11:32:18.005+00	jjmorcillor01	t
185	67	1	2025-11-04 09:25:03.065+00	2025-11-04 11:34:50.314+00	ndelorzac02	t
191	41	1	2025-11-04 10:54:16.19+00	2025-11-04 12:05:16.721+00	chisco	t
193	43	1	2025-11-04 11:35:14.139+00	2025-11-04 12:27:03.044+00	lpcamarac01	t
184	14	1	2025-11-04 09:19:18.381+00	2025-11-04 12:27:08.309+00	lmoralesg04	t
180	42	1	2025-11-04 07:44:32.12+00	2025-11-04 12:39:06.364+00	tecnicos	t
179	37	1	2025-11-04 07:44:21.079+00	2025-11-04 12:39:24.584+00	tecnicos	t
188	60	1	2025-11-04 09:57:49.687+00	2025-11-04 12:39:32.844+00	tecnicos	t
187	59	1	2025-11-04 09:57:26.31+00	2025-11-04 12:39:43.166+00	tecnicos	t
181	27	1	2025-11-04 07:44:46.551+00	2025-11-04 12:39:51.676+00	tecnicos	t
182	44	1	2025-11-04 07:50:57.069+00	2025-11-04 12:39:58.219+00	tecnicos	t
194	45	1	2025-11-04 12:43:23.615+00	2025-11-04 12:43:36.754+00	mjparejom05	t
195	45	1	2025-11-04 12:43:53.49+00	2025-11-04 13:21:09.087+00	jjmorcillor01	t
186	71	1	2025-11-04 09:52:05.046+00	2025-11-04 13:21:46.212+00	mrcarmonav01	t
196	45	1	2025-11-05 07:30:43.809+00	2025-11-05 07:59:33.809+00	chisco	t
164	75	1	2025-11-03 07:49:13.309+00	2025-11-05 07:59:38.074+00	chisco	t
202	43	1	2025-11-05 08:23:05.788+00	2025-11-05 09:17:51.818+00	mgperezr02	t
203	14	1	2025-11-05 08:42:30.78+00	2025-11-05 09:59:34.315+00	omsanchezg01	t
207	43	1	2025-11-05 10:49:03.65+00	2025-11-05 11:31:49.764+00	omsanchezg01	t
206	67	1	2025-11-05 10:48:51.305+00	2025-11-05 11:32:04.917+00	ndelorzac02	t
208	41	1	2025-11-05 10:53:35.455+00	2025-11-05 11:32:44.401+00	mafloresm01	t
204	71	1	2025-11-05 10:43:57.233+00	2025-11-05 12:27:05.834+00	mrcarmonav01	t
205	14	1	2025-11-05 10:46:19.76+00	2025-11-05 12:27:54.476+00	mtmarting03	t
209	41	1	2025-11-05 11:34:21.672+00	2025-11-05 12:32:56.504+00	mgperezr02	t
201	37	1	2025-11-05 07:49:17.569+00	2025-11-05 13:06:41.014+00	tecnicos	t
199	54	1	2025-11-05 07:48:32.801+00	2025-11-05 13:06:44.154+00	tecnicos	t
198	60	1	2025-11-05 07:48:00.709+00	2025-11-05 13:06:47.411+00	tecnicos	t
197	59	1	2025-11-05 07:47:43.939+00	2025-11-05 13:06:50.146+00	tecnicos	t
200	52	1	2025-11-05 07:48:58.116+00	2025-11-05 13:06:52.899+00	tecnicos	t
212	14	1	2025-11-05 12:29:18.621+00	2025-11-05 13:18:56.215+00	omsanchezg01	t
210	13	1	2025-11-05 11:41:12.427+00	2025-11-05 13:21:01.703+00	mrcarmonav01	t
211	45	1	2025-11-05 12:27:40.508+00	2025-11-05 13:21:06.135+00	mrcarmonav01	t
214	22	1	2025-11-06 10:13:44.879+00	2025-11-06 10:37:45.595+00	mgranadob01	t
213	14	1	2025-11-06 09:22:34.686+00	2025-11-06 10:43:02.058+00	lpcamarac01	t
217	22	1	2025-11-06 10:46:28.963+00	2025-11-06 10:49:05.153+00	jjmorcillor01	t
215	84	1	2025-11-06 10:44:49.92+00	2025-11-06 10:49:46.713+00	jmmurillon01	t
219	67	1	2025-11-06 10:53:34.298+00	2025-11-06 10:54:29.702+00	rmvegac01	t
216	14	1	2025-11-06 10:45:08.284+00	2025-11-06 11:31:32.245+00	omsanchezg01	t
218	41	1	2025-11-06 10:48:41.908+00	2025-11-06 11:35:14.311+00	mgperezr02	t
192	71	1	2025-11-04 11:08:45.258+00	2025-11-06 12:00:46.314+00	dnarcisoc01	t
222	71	1	2025-11-06 11:35:28.272+00	2025-11-06 12:01:09.183+00	mahernandezr06	t
224	71	1	2025-11-06 12:01:24.751+00	2025-11-06 12:01:30.259+00	mrcarmonav01	t
221	14	1	2025-11-06 11:33:41.099+00	2025-11-06 12:22:23.826+00	lmoralesg04	t
220	30	1	2025-11-06 10:54:37.765+00	2025-11-06 12:23:52.939+00	rmvegac01	t
223	45	1	2025-11-06 11:45:34.659+00	2025-11-06 12:26:54.631+00	jrodriguezt18	t
258	30	1	2025-11-06 12:28:12.844+00	2025-11-06 13:21:59.425+00	mafloresm01	t
225	14	1	2025-11-06 12:22:40.178+00	2025-11-06 13:22:04.052+00	cjlozanop01	t
259	14	1	2025-11-07 07:31:06.247+00	2025-11-07 08:21:27.84+00	mtcerezog01	t
260	45	1	2025-11-07 07:31:23.527+00	2025-11-07 08:24:12.629+00	omsanchezg01	t
263	45	1	2025-11-07 08:24:57.298+00	2025-11-07 09:23:18.758+00	mafloresm01	t
262	22	1	2025-11-07 08:23:11.23+00	2025-11-07 09:23:27.96+00	jjmorcillor01	t
264	14	1	2025-11-07 08:27:15.343+00	2025-11-07 09:24:03.794+00	omsanchezg01	t
265	14	1	2025-11-07 09:23:42.99+00	2025-11-07 10:13:06.904+00	vpalaciosg06	t
261	71	1	2025-11-07 07:37:56.439+00	2025-11-07 11:31:50.733+00	mrcarmonav01	t
267	22	1	2025-11-07 10:48:33.816+00	2025-11-07 11:32:28.925+00	mapavonb01	t
266	14	1	2025-11-07 10:43:41.731+00	2025-11-07 11:32:33.199+00	mrcarmonav01	t
268	41	1	2025-11-07 11:33:29.971+00	2025-11-07 12:27:22.607+00	omsanchezg01	t
269	45	1	2025-11-07 11:33:52.217+00	2025-11-07 12:27:38.588+00	jjmorcillor01	t
271	43	1	2025-11-07 12:30:13.887+00	2025-11-07 12:38:24.947+00	mtcerezog01	t
273	67	1	2025-11-07 12:38:39.049+00	2025-11-07 13:18:03.834+00	mtcerezog01	t
272	22	1	2025-11-07 12:31:08.537+00	2025-11-07 13:19:37.436+00	mapavonb01	t
270	14	1	2025-11-07 12:29:03.405+00	2025-11-07 13:21:39.267+00	cjlozanop01	t
276	43	1	2025-11-10 07:38:34.486+00	2025-11-10 08:00:04.692+00	chisco	t
275	41	1	2025-11-10 07:38:19.974+00	2025-11-10 08:00:08.37+00	chisco	t
277	81	1	2025-11-10 08:00:51.973+00	2025-11-10 08:29:46.837+00	chisco	t
279	41	1	2025-11-10 09:20:26.771+00	2025-11-10 10:11:35.642+00	ilozano1977	t
278	22	1	2025-11-10 09:17:28.506+00	2025-11-10 10:45:23.922+00	jjmorcillor01	t
280	30	1	2025-11-10 09:50:40.351+00	2025-11-10 10:51:47.561+00	sromang06	t
281	41	1	2025-11-10 10:45:39.808+00	2025-11-10 11:34:09.413+00	mgperezr02	t
282	14	1	2025-11-10 11:49:13.505+00	2025-11-10 12:26:42.506+00	mtcerezog01	t
274	71	1	2025-11-10 07:34:16.082+00	2025-11-10 13:21:52.21+00	mrcarmonav01	t
284	14	1	2025-11-10 12:47:13.407+00	2025-11-10 13:22:41.831+00	mtmarting03	t
283	41	1	2025-11-10 12:00:59.086+00	2025-11-10 13:20:41.753+00	omsanchezg01	t
286	30	1	2025-11-11 08:25:51.78+00	2025-11-11 09:07:33.901+00	bcrespoc01	t
287	14	1	2025-11-11 09:18:38.374+00	2025-11-11 10:50:02.382+00	lmoralesg04	t
289	14	1	2025-11-11 10:43:51.684+00	2025-11-11 11:30:20.415+00	pagarciam27	t
292	30	1	2025-11-11 10:52:03.333+00	2025-11-11 11:31:23.213+00	amfajardol01	t
291	42	1	2025-11-11 10:47:11.712+00	2025-11-11 11:32:59.99+00	omsanchezg01	t
288	61	1	2025-11-11 10:41:57.291+00	2025-11-11 11:38:51.957+00	mjcorralesg01	t
290	45	1	2025-11-11 10:44:39.78+00	2025-11-11 12:03:59.668+00	jrodriguezt18	t
294	43	1	2025-11-11 11:33:11.268+00	2025-11-11 12:25:39.696+00	lpcamarac01	t
295	14	1	2025-11-11 11:34:51.726+00	2025-11-11 12:26:41.568+00	lmoralesg04	t
293	41	1	2025-11-11 11:32:53.415+00	2025-11-11 13:20:44.984+00	omsanchezg01	t
296	14	1	2025-11-11 12:26:51.074+00	2025-11-11 13:21:32.02+00	cjlozanop01	t
297	45	1	2025-11-11 12:27:14.963+00	2025-11-11 13:21:35.275+00	jjmorcillor01	t
285	73	1	2025-11-11 08:18:21.209+00	2025-11-12 07:09:53.205+00	jrodriguezt18	t
299	43	1	2025-11-12 08:27:45.129+00	2025-11-12 09:16:33.456+00	mdcpalaciosr01	t
300	41	1	2025-11-12 10:42:59.134+00	2025-11-12 10:45:41.129+00	mgperezr02	t
301	45	1	2025-11-12 10:46:59.258+00	2025-11-12 10:54:51.283+00	magarcian01	t
298	14	1	2025-11-12 08:25:56.286+00	2025-11-12 11:30:10.01+00	mtmarting03	t
303	45	1	2025-11-12 11:44:24.326+00	2025-11-12 12:26:12.465+00	emparrag02	t
304	14	1	2025-11-12 11:46:52.584+00	2025-11-12 12:27:10.842+00	mrcarmonav01	t
302	41	1	2025-11-12 11:36:26.946+00	2025-11-12 12:32:17.929+00	mgperezr02	t
305	14	1	2025-11-12 12:27:22.236+00	2025-11-12 13:18:05.821+00	omsanchezg01	t
306	45	1	2025-11-12 12:34:51.053+00	2025-11-12 13:20:06.46+00	mrcarmonav01	t
308	22	1	2025-11-13 08:25:36.586+00	2025-11-13 09:16:57.513+00	cjlozanop01	t
310	67	1	2025-11-13 08:35:43.045+00	2025-11-13 09:18:14.35+00	ilozano1977	t
311	41	1	2025-11-13 09:21:42.958+00	2025-11-13 10:12:26.406+00	dmatasr01	t
312	14	1	2025-11-13 09:22:06.573+00	2025-11-13 10:16:23.796+00	mtcerezog01	t
313	41	1	2025-11-13 10:40:13.746+00	2025-11-13 11:33:04.609+00	mgperezr02	t
307	14	1	2025-11-13 08:25:11.039+00	2025-11-13 11:34:15.49+00	dmacarrillam01	t
314	45	1	2025-11-13 11:41:38.685+00	2025-11-13 12:31:17.991+00	mjcorralesg01	t
315	67	1	2025-11-13 11:52:24.804+00	2025-11-13 12:34:03.87+00	ndelorzac02	t
318	43	1	2025-11-13 12:35:58.261+00	2025-11-13 13:18:22.377+00	emparrag02	t
309	41	1	2025-11-13 08:26:31.778+00	2025-11-13 13:18:28.137+00	ndelorzac02	t
317	14	1	2025-11-13 12:27:10.152+00	2025-11-13 13:20:58.451+00	cjlozanop01	t
316	30	1	2025-11-13 11:57:48.722+00	2025-11-13 13:24:35.711+00	pagarciam27	t
319	14	1	2025-11-14 07:31:13.603+00	2025-11-14 08:23:40.361+00	mtcerezog01	t
321	45	1	2025-11-14 07:32:17.336+00	2025-11-14 08:23:44.854+00	omsanchezg01	t
326	67	1	2025-11-14 09:25:20.404+00	2025-11-14 10:08:12.378+00	ilozano1977	t
324	14	1	2025-11-14 09:19:02.284+00	2025-11-14 10:11:05.107+00	omsanchezg01	t
325	45	1	2025-11-14 09:19:42.364+00	2025-11-14 10:16:57.345+00	vpalaciosg06	t
323	43	1	2025-11-14 09:17:11.425+00	2025-11-14 10:17:53.192+00	sromang06	t
322	30	1	2025-11-14 08:50:22.446+00	2025-11-14 10:22:13.266+00	pety78	t
320	41	1	2025-11-14 07:31:32.476+00	2025-11-14 10:29:33.88+00	mebravom01	t
327	14	1	2025-11-14 10:55:24.112+00	2025-11-14 11:30:47.728+00	mebravom01	t
329	71	1	2025-11-14 11:03:29.903+00	2025-11-14 11:35:48.443+00	isabel22	t
332	43	1	2025-11-14 11:33:17.062+00	2025-11-14 11:40:49.122+00	mtcerezog01	t
331	41	1	2025-11-14 11:31:24.625+00	2025-11-14 11:40:53.113+00	omsanchezg01	t
334	43	1	2025-11-14 11:41:04.148+00	2025-11-14 11:44:08.838+00	omsanchezg01	t
333	14	1	2025-11-14 11:38:37.41+00	2025-11-14 12:24:26.573+00	amsanchezs01	t
328	30	1	2025-11-14 11:00:26.108+00	2025-11-14 12:24:31.719+00	amfajardol01	t
330	45	1	2025-11-14 11:10:34.362+00	2025-11-14 12:26:42.143+00	sromang06	t
335	41	1	2025-11-14 11:44:19.887+00	2025-11-14 12:27:55.379+00	omsanchezg01	t
337	18	1	2025-11-14 12:32:08.493+00	2025-11-14 13:19:34.207+00	mtcerezog01	t
336	14	1	2025-11-14 12:27:49.932+00	2025-11-14 13:20:29.029+00	cjlozanop01	t
338	43	1	2025-11-17 08:19:44.7+00	2025-11-17 09:18:56.034+00	ilozano1977	t
340	45	1	2025-11-17 09:25:58.702+00	2025-11-17 10:30:51.942+00	a_carlosss76	t
339	22	1	2025-11-17 09:22:33.979+00	2025-11-17 10:40:56.375+00	jjmorcillor01	t
342	30	1	2025-11-17 10:48:55.925+00	2025-11-17 10:58:51.78+00	pagarciam27	t
343	45	1	2025-11-17 10:49:27.939+00	2025-11-17 11:35:21.166+00	jjmorcillor01	t
341	41	1	2025-11-17 10:45:23.976+00	2025-11-17 11:36:23.235+00	mgperezr02	t
345	67	1	2025-11-17 11:36:40.944+00	2025-11-17 12:26:42.449+00	mtcerezog01	t
344	30	1	2025-11-17 11:35:08.69+00	2025-11-17 12:26:49.636+00	bcrespoc01	t
347	22	1	2025-11-17 11:38:36.557+00	2025-11-17 12:33:39.012+00	mgranadob01	t
348	41	1	2025-11-17 12:33:18.818+00	2025-11-17 13:20:11.895+00	omsanchezg01	t
346	14	1	2025-11-17 11:36:59.274+00	2025-11-17 13:21:44.117+00	mtmarting03	t
349	14	1	2025-11-18 09:18:51.294+00	2025-11-18 10:54:05.775+00	lmoralesg04	t
350	67	1	2025-11-18 09:23:12.705+00	2025-11-18 11:28:29.999+00	omsanchezg01	t
351	14	1	2025-11-18 10:30:15.072+00	2025-11-18 11:31:43.632+00	dmatasr01	t
354	41	1	2025-11-18 10:48:39.337+00	2025-11-18 11:34:39.53+00	pagarciam27	t
358	67	1	2025-11-18 11:41:46.273+00	2025-11-18 12:25:26.288+00	mahernandezr06	t
356	43	1	2025-11-18 11:34:07.665+00	2025-11-18 12:25:42.697+00	lpcamarac01	t
357	14	1	2025-11-18 11:35:39.208+00	2025-11-18 12:26:38.411+00	mtmarting03	t
353	45	1	2025-11-18 10:44:28.554+00	2025-11-18 12:27:02.407+00	jrodriguezt18	t
352	40	1	2025-11-18 10:32:11.274+00	2025-11-18 12:29:47.16+00	celita2	t
359	14	1	2025-11-18 12:26:53.202+00	2025-11-18 13:22:18.826+00	cjlozanop01	t
355	41	1	2025-11-18 11:33:07.811+00	2025-11-18 13:22:24.058+00	omsanchezg01	t
363	42	1	2025-11-19 08:26:45.875+00	2025-11-19 08:39:36.234+00	chisco	t
360	32	1	2025-11-19 07:52:51.773+00	2025-11-19 08:51:16.275+00	chisco	t
364	43	1	2025-11-19 08:39:06.978+00	2025-11-19 08:51:16.275+00	chisco	t
361	43	1	2025-11-19 08:21:23.092+00	2025-11-19 09:47:08.377+00	ilozano1977	t
362	14	1	2025-11-19 08:26:15.677+00	2025-11-19 10:12:46.867+00	mtmarting03	t
367	14	1	2025-11-19 11:08:56.642+00	2025-11-19 11:38:17.253+00	mtmarting03	t
369	14	1	2025-11-19 11:38:38.777+00	2025-11-19 12:24:44.376+00	mrcarmonav01	t
371	43	1	2025-11-19 11:43:03.034+00	2025-11-19 12:28:04.579+00	celita2	t
370	42	1	2025-11-19 11:42:48.656+00	2025-11-19 12:28:12.166+00	celita2	t
368	41	1	2025-11-19 11:30:27.978+00	2025-11-19 12:32:38.976+00	mgperezr02	t
366	32	1	2025-11-19 08:51:54.266+00	2025-11-20 07:30:06.866+00	tecnicos	t
365	42	1	2025-11-19 08:39:51.139+00	2025-11-20 07:30:09.569+00	tecnicos	t
372	43	1	2025-11-20 07:29:35.46+00	2025-11-20 08:23:12.088+00	omsanchezg01	t
374	30	1	2025-11-20 07:59:43.126+00	2025-11-20 08:23:16.258+00	ndelorzac02	t
375	41	1	2025-11-20 08:29:27.666+00	2025-11-20 09:20:16.254+00	emurielb76	t
373	14	1	2025-11-20 07:30:02.067+00	2025-11-20 09:25:10.915+00	lmoralesg04	t
376	14	1	2025-11-20 09:21:03.602+00	2025-11-20 10:43:19.586+00	lpcamarac01	t
377	41	1	2025-11-20 10:32:34.986+00	2025-11-20 10:48:39.908+00	chisco	t
381	45	1	2025-11-20 10:51:11.999+00	2025-11-20 11:31:40.178+00	celita2	t
382	14	1	2025-11-20 10:54:07.826+00	2025-11-20 11:32:35.354+00	mafloresm01	t
379	41	1	2025-11-20 10:46:43.976+00	2025-11-20 11:38:02.073+00	mgperezr02	t
380	44	1	2025-11-20 10:48:25.204+00	2025-11-20 11:45:48.632+00	pety78	t
383	45	1	2025-11-20 11:48:26.356+00	2025-11-20 12:27:30.496+00	amfajardol01	t
384	41	1	2025-11-20 12:26:45.025+00	2025-11-20 13:20:55.099+00	emparrag02	t
385	14	1	2025-11-21 07:33:12.761+00	2025-11-21 08:23:24.59+00	mtcerezog01	t
386	45	1	2025-11-21 07:33:35.84+00	2025-11-21 08:22:01.125+00	omsanchezg01	t
390	45	1	2025-11-21 08:29:49.407+00	2025-11-21 09:17:22.089+00	rjrodriguezp0102	t
389	43	1	2025-11-21 08:26:00.123+00	2025-11-21 09:18:00.211+00	cblancoa02	t
388	22	1	2025-11-21 08:24:22.46+00	2025-11-21 09:18:27.97+00	jjmorcillor01	t
387	14	1	2025-11-21 08:22:41.013+00	2025-11-21 10:10:59.224+00	omsanchezg01	t
392	45	1	2025-11-21 09:19:14.434+00	2025-11-21 10:11:52.661+00	mgperezr02	t
394	14	1	2025-11-21 10:45:22.997+00	2025-11-21 11:28:06.481+00	mrcarmonav01	t
395	67	1	2025-11-21 10:46:24.097+00	2025-11-21 11:32:06.036+00	ndelorzac02	t
393	43	1	2025-11-21 10:27:03.223+00	2025-11-21 12:27:33.659+00	lpcamarac01	t
396	41	1	2025-11-21 11:37:09.459+00	2025-11-21 12:30:21.549+00	omsanchezg01	t
391	41	1	2025-11-21 08:30:20.163+00	2025-11-21 12:48:09.645+00	emurielb76	t
400	43	1	2025-11-21 12:29:56.113+00	2025-11-21 13:19:35.069+00	cblancoa02	t
398	67	1	2025-11-21 12:28:46.684+00	2025-11-21 13:19:40.992+00	mtcerezog01	t
399	45	1	2025-11-21 12:29:18.427+00	2025-11-21 13:20:47.127+00	djuliog01	t
397	14	1	2025-11-21 12:28:06.516+00	2025-11-21 13:20:50.79+00	cjlozanop01	t
401	41	1	2025-11-21 12:33:11.226+00	2025-11-21 13:21:13.604+00	pagarciam27	t
378	43	1	2025-11-20 10:32:48.468+00	2025-11-21 13:23:19.619+00	dmacarrillam01	t
403	61	1	2025-11-24 08:24:43.75+00	2025-11-24 08:39:30.308+00	cjlozanop01	t
402	14	1	2025-11-24 08:16:48.434+00	2025-11-24 09:16:26.921+00	omsanchezg01	t
406	41	1	2025-11-24 10:29:13.726+00	2025-11-24 10:29:29.086+00	lpcamarac01	t
404	67	1	2025-11-24 09:18:28.324+00	2025-11-24 11:32:21.568+00	pety78	t
408	41	1	2025-11-24 10:43:50.093+00	2025-11-24 11:32:40.528+00	mgperezr02	t
409	67	1	2025-11-24 11:37:47.57+00	2025-11-24 12:25:05.855+00	mtcerezog01	t
410	41	1	2025-11-24 12:29:38.91+00	2025-11-24 13:18:58.887+00	omsanchezg01	t
405	14	1	2025-11-24 09:27:57.714+00	2025-11-24 13:19:15.942+00	mtmarting03	t
407	43	1	2025-11-24 10:29:43.223+00	2025-11-24 13:21:38.864+00	lpcamarac01	t
413	41	1	2025-11-25 09:23:09.899+00	2025-11-25 10:12:41.673+00	omsanchezg01	t
412	67	1	2025-11-25 09:20:11.231+00	2025-11-25 10:32:24.882+00	ndelorzac02	t
414	22	1	2025-11-25 10:06:04.481+00	2025-11-25 10:32:28.869+00	cjlozanop01	t
416	30	1	2025-11-25 10:44:31.406+00	2025-11-25 10:56:43.457+00	igomezc12	t
417	67	1	2025-11-25 10:45:09.623+00	2025-11-25 11:34:20.472+00	ndelorzac02	t
415	45	1	2025-11-25 10:39:37.854+00	2025-11-25 11:39:04.643+00	jrodriguezt18	t
418	14	1	2025-11-25 11:07:42.927+00	2025-11-25 11:51:52.126+00	mtmarting03	t
411	14	1	2025-11-25 09:18:50.712+00	2025-11-25 12:26:42.666+00	lmoralesg04	t
421	41	1	2025-11-25 12:41:49.8+00	2025-11-25 13:19:08.322+00	jjmorcillor01	t
420	14	1	2025-11-25 12:26:53.469+00	2025-11-25 13:21:02.396+00	cjlozanop01	t
419	45	1	2025-11-25 11:31:32.611+00	2025-11-25 13:24:21.224+00	rencinasr02	t
422	14	1	2025-11-26 07:30:50.104+00	2025-11-26 08:20:29.141+00	mtcerezog01	t
423	30	1	2025-11-26 08:18:36.332+00	2025-11-26 09:18:57.705+00	ilozano1977	t
425	14	1	2025-11-26 09:18:51.751+00	2025-11-26 10:33:23.305+00	mtcerezog01	t
426	67	1	2025-11-26 10:46:56.33+00	2025-11-26 11:29:43.287+00	omsanchezg01	t
459	45	1	2025-11-26 10:51:36.965+00	2025-11-26 11:33:13.071+00	pety78	t
463	67	1	2025-11-26 11:38:56.77+00	2025-11-26 12:26:59.516+00	ndelorzac02	t
461	45	1	2025-11-26 11:37:42.218+00	2025-11-26 12:28:06.043+00	jmmurillon01	t
460	41	1	2025-11-26 11:35:12.887+00	2025-11-26 12:28:57.953+00	mgperezr02	t
424	14	1	2025-11-26 08:21:59.652+00	2025-11-26 13:10:22.451+00	mtmarting03	t
462	30	1	2025-11-26 11:38:10.8+00	2025-11-26 13:22:35.923+00	rmvegac01	t
465	41	1	2025-12-01 07:31:44.915+00	2025-12-01 08:01:40.062+00	chisco	t
464	43	1	2025-12-01 07:30:45.141+00	2025-12-01 08:01:45.989+00	chisco	t
466	45	1	2025-12-01 07:36:14.944+00	2025-12-01 08:31:10.777+00	rencinasr02	t
467	67	1	2025-12-01 09:20:16.818+00	2025-12-01 10:11:04.947+00	omsanchezg01	t
470	45	1	2025-12-01 09:23:02.452+00	2025-12-01 10:15:18.939+00	rjrodriguezp0102	t
468	22	1	2025-12-01 09:22:10.235+00	2025-12-01 10:15:30.436+00	jjmorcillor01	t
471	41	1	2025-12-01 10:44:29.113+00	2025-12-01 11:34:44.773+00	mgperezr02	t
472	45	1	2025-12-01 10:50:11.906+00	2025-12-01 11:36:36.827+00	jjmorcillor01	t
473	41	1	2025-12-01 11:24:41.762+00	2025-12-01 12:27:10.189+00	jrodriguezt18	t
469	14	1	2025-12-01 09:22:38.025+00	2025-12-01 13:16:16.343+00	mtmarting03	t
475	58	1	2025-12-02 07:33:09.901+00	2025-12-02 07:36:28.537+00	dnarcisoc01	t
476	45	1	2025-12-02 08:27:15.113+00	2025-12-02 09:15:52.013+00	mjcorralesg01	t
477	43	1	2025-12-02 08:27:50.461+00	2025-12-02 09:17:01.308+00	cblancoa02	t
474	75	1	2025-12-02 07:31:05.434+00	2025-12-02 09:17:38.093+00	chisco	t
480	43	1	2025-12-02 09:28:38.092+00	2025-12-02 10:13:30.83+00	djuliog01	t
478	14	1	2025-12-02 09:17:28.75+00	2025-12-02 10:43:06.993+00	lmoralesg04	t
479	41	1	2025-12-02 09:18:15.699+00	2025-12-02 10:43:22.678+00	pety78	t
481	22	1	2025-12-02 10:11:31.873+00	2025-12-02 11:32:18.541+00	cjlozanop01	t
484	14	1	2025-12-02 10:37:34.729+00	2025-12-02 11:33:32.744+00	omsanchezg01	t
485	43	1	2025-12-02 10:48:07.818+00	2025-12-02 11:34:24.466+00	cblancoa02	t
482	45	1	2025-12-02 10:14:34.01+00	2025-12-02 11:50:47.963+00	jrodriguezt18	t
486	60	1	2025-12-02 11:22:57.489+00	2025-12-02 11:51:16.004+00	efranciscor01	t
483	30	1	2025-12-02 10:15:37.937+00	2025-12-02 12:19:32.411+00	mssalomonp02	t
488	67	1	2025-12-02 11:33:17.635+00	2025-12-02 12:26:32.695+00	lmoralesg04	t
489	45	1	2025-12-02 11:33:48.994+00	2025-12-02 12:26:50.694+00	omsanchezg01	t
487	43	1	2025-12-02 11:32:58.178+00	2025-12-02 12:28:35.664+00	lpcamarac01	t
490	41	1	2025-12-02 12:27:37.19+00	2025-12-02 13:19:49.918+00	emparrag02	t
491	45	1	2025-12-03 07:36:11.898+00	2025-12-03 08:07:29.364+00	chisco	t
492	43	1	2025-12-03 08:23:07.443+00	2025-12-03 09:17:00.258+00	jrodriguezt18	t
501	67	1	2025-12-03 09:29:06.301+00	2025-12-03 09:35:34.012+00	bcrespoc01	t
498	14	1	2025-12-03 09:20:12.388+00	2025-12-03 10:11:41.843+00	mtcerezog01	t
496	42	1	2025-12-03 08:30:43.723+00	2025-12-03 10:12:03.081+00	omsanchezg01	t
497	45	1	2025-12-03 08:31:18.483+00	2025-12-03 10:13:30.927+00	sromang06	t
494	61	1	2025-12-03 08:26:46.831+00	2025-12-03 10:33:32.258+00	tecnicos	t
495	60	1	2025-12-03 08:27:32.281+00	2025-12-03 10:33:32.258+00	tecnicos	t
502	43	1	2025-12-03 09:35:30.129+00	2025-12-03 10:54:03.907+00	bcrespoc01	t
503	41	1	2025-12-03 10:10:58.517+00	2025-12-03 11:32:16.213+00	jrodriguezt18	t
505	27	1	2025-12-03 11:13:05.012+00	2025-12-03 11:32:16.213+00	igomezc12	t
504	67	1	2025-12-03 10:46:03.905+00	2025-12-03 11:32:23.295+00	mtcerezog01	t
499	41	1	2025-12-03 09:21:01.755+00	2025-12-03 11:35:45.311+00	pety78	t
493	14	1	2025-12-03 08:26:16.353+00	2025-12-03 11:55:36.367+00	mtmarting03	t
507	14	1	2025-12-03 11:39:43.714+00	2025-12-03 12:27:54.9+00	mrcarmonav01	t
506	41	1	2025-12-03 11:34:23.919+00	2025-12-03 12:32:45.856+00	mgperezr02	t
508	14	1	2025-12-03 12:28:09.724+00	2025-12-03 13:20:19.287+00	omsanchezg01	t
511	43	1	2025-12-04 07:35:35.342+00	2025-12-04 08:22:38.483+00	mjcorralesg01	t
509	41	1	2025-12-04 07:31:36.842+00	2025-12-04 08:25:02.838+00	omsanchezg01	t
500	74	1	2025-12-03 09:24:14.187+00	2025-12-04 09:03:28.66+00	igomezc12	t
514	45	1	2025-12-04 08:36:09.964+00	2025-12-04 09:14:59.471+00	amsanchezs01	t
513	22	1	2025-12-04 08:22:59.526+00	2025-12-04 09:16:48.411+00	cjlozanop01	t
515	14	1	2025-12-04 09:22:02.891+00	2025-12-04 10:13:41.276+00	mrcarmonav01	t
512	41	1	2025-12-04 08:19:40.579+00	2025-12-04 11:35:12.179+00	pagarciam27	t
518	43	1	2025-12-04 10:42:45.145+00	2025-12-04 12:32:05.198+00	rmvegac01	t
517	67	1	2025-12-04 10:20:05.527+00	2025-12-04 13:26:41.016+00	igomezc12	t
519	41	1	2025-12-04 10:53:21.415+00	2025-12-04 13:27:50.356+00	mgperezr02	t
516	30	1	2025-12-04 09:56:13.454+00	2025-12-09 07:31:00.284+00	chisco	t
510	14	1	2025-12-04 07:33:03.38+00	2025-12-04 11:34:59.861+00	lmoralesg04	t
520	43	1	2025-12-04 12:29:01.285+00	2025-12-04 13:26:20.717+00	dmatasr01	t
521	41	1	2025-12-04 12:33:10.72+00	2025-12-04 13:26:30.847+00	emparrag02	t
522	14	1	2025-12-05 07:34:24.657+00	2025-12-05 08:23:57.815+00	mtcerezog01	t
525	22	1	2025-12-05 09:28:58.738+00	2025-12-05 10:11:05.856+00	mtcerezog01	t
524	45	1	2025-12-05 09:22:30.701+00	2025-12-05 10:11:32.167+00	vpalaciosg06	t
523	41	1	2025-12-05 08:33:15.249+00	2025-12-05 10:37:13.279+00	pety78	t
526	14	1	2025-12-05 10:44:56.08+00	2025-12-05 11:30:40.339+00	mrcarmonav01	t
527	45	1	2025-12-05 11:27:36.074+00	2025-12-05 11:31:40.443+00	ilozano1977	t
528	22	1	2025-12-05 11:34:41.912+00	2025-12-05 12:25:54.216+00	pety78	t
529	67	1	2025-12-05 12:27:07.968+00	2025-12-05 13:18:05.001+00	mtcerezog01	t
531	14	1	2025-12-05 12:29:37.051+00	2025-12-05 13:22:25.314+00	cjlozanop01	t
530	45	1	2025-12-05 12:29:23.249+00	2025-12-05 13:22:29.073+00	emparrag02	t
533	83	1	2025-12-09 08:27:45.862+00	2025-12-09 10:12:49.991+00	amsanchezs01	t
534	41	1	2025-12-09 09:25:02.166+00	2025-12-09 10:20:18.162+00	pety78	t
538	67	1	2025-12-09 10:27:47.414+00	2025-12-09 11:31:36.937+00	omsanchezg01	t
536	22	1	2025-12-09 10:11:51.134+00	2025-12-09 11:31:42.366+00	cjlozanop01	t
540	14	1	2025-12-09 10:47:00.176+00	2025-12-09 11:32:56.631+00	pagarciam27	t
532	30	1	2025-12-09 07:31:10.933+00	2025-12-09 11:38:11.692+00	dnarcisoc01	t
539	45	1	2025-12-09 10:42:59.606+00	2025-12-09 11:38:11.692+00	jrodriguezt18	t
542	14	1	2025-12-09 11:37:52.338+00	2025-12-09 11:47:59.576+00	mtmarting03	t
543	40	1	2025-12-09 11:40:17.974+00	2025-12-09 12:29:16.182+00	celita2	t
545	41	1	2025-12-09 12:28:23.394+00	2025-12-09 13:20:10.844+00	emparrag02	t
544	14	1	2025-12-09 12:26:57.176+00	2025-12-09 13:21:34.429+00	cjlozanop01	t
541	45	1	2025-12-09 11:32:20.784+00	2025-12-09 13:21:43.144+00	omsanchezg01	t
535	11	1	2025-12-09 09:26:16.03+00	2025-12-09 13:25:15.249+00	fatimapc20	t
537	14	1	2025-12-09 10:13:53.91+00	2025-12-09 13:25:29.407+00	lmoralesg04	t
548	67	1	2025-12-10 07:47:27.444+00	2025-12-10 08:21:07.145+00	nmaciasp02	t
547	30	1	2025-12-10 07:38:26.341+00	2025-12-10 08:29:19.108+00	rmvegac01	t
549	22	1	2025-12-10 08:29:12.373+00	2025-12-10 09:07:21.477+00	cjlozanop01	t
550	14	1	2025-12-10 08:33:24.142+00	2025-12-10 09:17:51.312+00	mtmarting03	t
552	22	1	2025-12-10 09:45:02.855+00	2025-12-10 10:10:42.101+00	ndelorzac02	t
551	67	1	2025-12-10 09:18:29.368+00	2025-12-10 10:12:07.873+00	mtcerezog01	t
546	45	1	2025-12-10 07:30:20.864+00	2025-12-10 10:15:13.207+00	chisco	t
553	43	1	2025-12-10 11:36:45.25+00	2025-12-10 11:40:45.079+00	omsanchezg01	t
554	41	1	2025-12-10 11:37:01.86+00	2025-12-10 12:33:33.918+00	mgperezr02	t
555	14	1	2025-12-10 11:39:17.712+00	2025-12-10 13:20:29.804+00	mrcarmonav01	t
558	43	1	2025-12-11 07:36:57.183+00	2025-12-11 08:23:02.88+00	nmaciasp02	t
560	22	1	2025-12-11 08:22:19.358+00	2025-12-11 08:25:18.355+00	mtcerezog01	t
562	67	1	2025-12-11 08:26:20.071+00	2025-12-11 09:15:53.095+00	ilozano1977	t
561	22	1	2025-12-11 08:25:30.268+00	2025-12-11 09:20:22.454+00	cjlozanop01	t
559	41	1	2025-12-11 07:39:48.897+00	2025-12-11 09:28:24.171+00	pety78	t
556	14	1	2025-12-11 07:28:11.84+00	2025-12-11 10:02:05.033+00	lmoralesg04	t
565	14	1	2025-12-11 10:45:15.946+00	2025-12-11 11:33:33.092+00	lpcamarac01	t
564	22	1	2025-12-11 10:44:49.755+00	2025-12-11 11:35:32.164+00	jjmorcillor01	t
563	41	1	2025-12-11 10:43:22.908+00	2025-12-11 11:38:04.505+00	mgperezr02	t
557	45	1	2025-12-11 07:31:31.774+00	2025-12-11 12:45:32.235+00	chisco	t
567	67	1	2025-12-11 12:46:12.344+00	2025-12-11 12:48:29.245+00	chisco	t
566	14	1	2025-12-11 12:25:42.552+00	2025-12-11 13:21:13.8+00	cjlozanop01	t
568	45	1	2025-12-12 07:27:39.628+00	2025-12-12 07:39:14.107+00	chisco	t
569	14	1	2025-12-12 07:31:30.133+00	2025-12-12 08:24:10.643+00	mtcerezog01	t
575	22	1	2025-12-12 09:22:15.566+00	2025-12-12 09:24:36.371+00	rencinasr02	t
574	67	1	2025-12-12 09:22:03.403+00	2025-12-12 10:10:48.811+00	ilozano1977	t
570	42	1	2025-12-12 09:08:06.122+00	2025-12-12 10:10:57.22+00	omsanchezg01	t
572	14	1	2025-12-12 09:19:58.534+00	2025-12-12 10:12:26.89+00	mtcerezog01	t
573	45	1	2025-12-12 09:21:44.005+00	2025-12-12 10:12:57.53+00	vpalaciosg06	t
571	41	1	2025-12-12 09:17:51.482+00	2025-12-12 10:15:41.654+00	nmaciasp02	t
576	30	1	2025-12-12 10:11:23.198+00	2025-12-12 10:54:08.663+00	emurielb76	t
577	43	1	2025-12-12 10:54:25.979+00	2025-12-12 11:33:07.152+00	a_carlosss76	t
578	22	1	2025-12-12 11:32:58.385+00	2025-12-12 12:25:26.114+00	pety78	t
580	67	1	2025-12-12 12:28:45.027+00	2025-12-12 13:17:58.037+00	mtcerezog01	t
579	45	1	2025-12-12 12:27:17.461+00	2025-12-12 13:21:09.67+00	djuliog01	t
581	14	1	2025-12-12 12:30:21.689+00	2025-12-12 13:21:18.162+00	cjlozanop01	t
586	41	1	2025-12-15 08:23:47.057+00	2025-12-15 09:17:11.146+00	omsanchezg01	t
588	45	1	2025-12-15 09:18:53.103+00	2025-12-15 10:14:13.54+00	a_carlosss76	t
590	67	1	2025-12-15 09:37:38.975+00	2025-12-15 10:19:24.263+00	ilozano1977	t
589	22	1	2025-12-15 09:21:47.058+00	2025-12-15 10:27:36.645+00	jjmorcillor01	t
587	43	1	2025-12-15 08:27:02.951+00	2025-12-15 11:32:17.833+00	ilozano1977	t
591	43	1	2025-12-15 10:43:44.317+00	2025-12-15 11:32:27.846+00	nmaciasp02	t
593	45	1	2025-12-15 10:51:36.1+00	2025-12-15 11:34:43.336+00	jrodriguezt18	t
585	41	1	2025-12-15 07:36:24.895+00	2025-12-15 12:25:03.919+00	chisco	t
584	43	1	2025-12-15 07:36:15.096+00	2025-12-15 12:25:07.371+00	chisco	t
583	71	1	2025-12-15 07:36:03.27+00	2025-12-15 12:25:10.809+00	chisco	t
594	67	1	2025-12-15 11:34:37.468+00	2025-12-15 12:25:16.273+00	mtcerezog01	t
595	43	1	2025-12-15 12:26:37.608+00	2025-12-15 12:32:13.961+00	pagarciam27	t
582	13	1	2025-12-15 07:28:04.002+00	2025-12-16 07:33:26.477+00	sromang06	t
597	45	1	2025-12-16 07:36:16.33+00	2025-12-16 08:25:04.139+00	egonzalezh18	t
596	43	1	2025-12-16 07:30:19.677+00	2025-12-16 08:58:55.001+00	chisco	t
599	45	1	2025-12-16 09:17:50.889+00	2025-12-16 09:21:52.216+00	emparrag02	t
603	22	1	2025-12-16 09:22:58.311+00	2025-12-16 10:09:05.7+00	mjcorralesg01	t
602	41	1	2025-12-16 09:22:29.573+00	2025-12-16 10:11:37.284+00	emparrag02	t
600	43	1	2025-12-16 09:19:10.385+00	2025-12-16 10:13:33.558+00	ilozano1977	t
604	30	1	2025-12-16 10:13:26.788+00	2025-12-16 10:47:25.802+00	egonzalezh18	t
605	61	1	2025-12-16 10:14:59.347+00	2025-12-16 10:49:18.689+00	afloresc27	t
607	14	1	2025-12-16 10:43:06.157+00	2025-12-16 11:30:30.308+00	omsanchezg01	t
606	22	1	2025-12-16 10:42:39.972+00	2025-12-16 11:31:44.661+00	jjmorcillor01	t
601	14	1	2025-12-16 09:20:35.271+00	2025-12-16 12:27:37.952+00	lmoralesg04	t
608	18	1	2025-12-16 10:50:09.68+00	2025-12-17 07:30:54.069+00	ilozano1977	t
610	41	1	2025-12-17 07:34:38.585+00	2025-12-17 07:34:44.615+00	nmaciasp02	t
611	43	1	2025-12-17 07:34:53.155+00	2025-12-17 08:32:25.566+00	nmaciasp02	t
613	67	1	2025-12-17 08:34:25.019+00	2025-12-17 08:59:56.15+00	igomezc12	t
614	14	1	2025-12-17 09:18:14.707+00	2025-12-17 10:11:13.269+00	mtcerezog01	t
615	45	1	2025-12-17 09:20:38.94+00	2025-12-17 10:11:29.338+00	celita2	t
612	14	1	2025-12-17 08:25:03.541+00	2025-12-17 10:49:05.449+00	mtmarting03	t
598	41	1	2025-12-16 09:00:38.43+00	2025-12-17 11:07:09.061+00	chisco	t
616	41	1	2025-12-17 11:34:32.371+00	2025-12-17 12:31:38.99+00	mgperezr02	t
592	41	1	2025-12-15 10:44:38.795+00	2025-12-17 13:06:51.109+00	mgperezr02	t
609	85	1	2025-12-17 07:30:19.023+00	2025-12-17 13:26:45.067+00	chisco	t
619	41	1	2025-12-18 07:32:50.069+00	2025-12-18 08:23:05.538+00	nmaciasp02	t
618	43	1	2025-12-18 07:32:26.309+00	2025-12-18 08:26:45.442+00	jjmorcillor01	t
617	14	1	2025-12-18 07:31:41.155+00	2025-12-18 12:28:54.723+00	lmoralesg04	t
620	71	1	2025-12-18 07:33:28.146+00	2025-12-18 13:19:42.248+00	chisco	t
622	43	1	2025-12-18 08:26:58.41+00	2025-12-18 09:19:59.163+00	lpcamarac01	t
621	22	1	2025-12-18 07:35:16.527+00	2025-12-18 13:24:24.246+00	mapavonb01	t
625	41	1	2025-12-19 07:26:50.551+00	2025-12-19 07:36:12.319+00	chisco	t
624	43	1	2025-12-19 07:26:39.782+00	2025-12-19 07:36:15.407+00	chisco	t
623	61	1	2025-12-18 10:16:13.691+00	2025-12-19 07:48:43.927+00	afloresc27	t
627	26	1	2025-12-19 09:21:02.832+00	2025-12-19 09:48:30.408+00	dmatasr01	t
626	69	1	2025-12-19 07:46:04.805+00	2025-12-19 10:50:20.138+00	afloresc27	t
628	71	1	2025-12-19 10:59:46.431+00	2025-12-19 12:42:41.989+00	chisco	t
629	47	1	2025-12-19 11:06:38.283+00	2025-12-19 13:09:29.883+00	chisco	t
630	43	1	2025-12-22 07:40:10.914+00	2025-12-22 08:22:14.49+00	lpcamarac01	t
633	43	1	2025-12-22 08:30:31.95+00	2025-12-22 09:17:46.639+00	celita2	t
631	73	1	2025-12-22 08:20:39.72+00	2025-12-22 10:46:35.471+00	jrodriguezt18	t
632	22	1	2025-12-22 08:27:18.644+00	2026-01-08 07:18:43.879+00	dnarcisoc01	t
635	22	1	2026-01-08 08:25:15.806+00	2026-01-08 09:19:29.386+00	cjlozanop01	t
634	14	1	2026-01-08 07:25:46.218+00	2026-01-08 10:43:45.814+00	lmoralesg04	t
636	14	1	2026-01-08 10:42:15.377+00	2026-01-08 11:31:25.704+00	omsanchezg01	t
637	41	1	2026-01-08 10:44:36.397+00	2026-01-08 11:34:23.805+00	mgperezr02	t
638	45	1	2026-01-08 11:34:46.84+00	2026-01-08 12:28:51.112+00	mgperezr02	t
639	14	1	2026-01-08 12:26:24.702+00	2026-01-08 12:33:10.063+00	cjlozanop01	t
641	30	1	2026-01-08 12:28:32.256+00	2026-01-08 13:17:51.231+00	profealu	t
640	43	1	2026-01-08 12:26:57.169+00	2026-01-08 13:25:03.404+00	dmatasr01	t
642	45	1	2026-01-09 07:33:53.759+00	2026-01-09 08:21:09.346+00	omsanchezg01	t
643	22	1	2026-01-09 08:25:06.786+00	2026-01-09 09:22:45.675+00	jjmorcillor01	t
644	45	1	2026-01-09 08:25:36.86+00	2026-01-09 09:22:51.556+00	mahernandezr06	t
646	14	1	2026-01-09 09:23:39.161+00	2026-01-09 10:12:00.317+00	omsanchezg01	t
645	45	1	2026-01-09 09:23:01.831+00	2026-01-09 10:26:50.075+00	vpalaciosg06	t
647	30	1	2026-01-09 12:28:41.348+00	2026-01-09 12:30:26.555+00	profealu	t
648	30	1	2026-01-09 12:31:26.702+00	2026-01-09 13:16:57.634+00	mafloresm01	t
649	43	1	2026-01-12 08:03:57.902+00	2026-01-12 08:15:43.313+00	chisco	t
650	41	1	2026-01-12 08:04:04.573+00	2026-01-12 08:15:43.313+00	chisco	t
652	43	1	2026-01-12 08:22:10.585+00	2026-01-12 09:17:01.54+00	celita2	t
653	67	1	2026-01-12 09:16:43.2+00	2026-01-12 10:09:22.313+00	omsanchezg01	t
654	22	1	2026-01-12 09:21:20.53+00	2026-01-12 10:10:15.221+00	jjmorcillor01	t
655	41	1	2026-01-12 10:44:26.445+00	2026-01-12 11:41:07.888+00	jjmorcillor01	t
656	59	1	2026-01-12 11:03:35.122+00	2026-01-12 12:11:33.254+00	chisco	t
651	47	1	2026-01-12 08:15:55.755+00	2026-01-12 12:12:31.928+00	chisco	t
657	67	1	2026-01-12 11:39:08.285+00	2026-01-12 12:26:32.286+00	mtcerezog01	t
658	14	1	2026-01-12 12:29:15.582+00	2026-01-12 12:31:03.255+00	omsanchezg01	t
659	41	1	2026-01-12 12:31:23.538+00	2026-01-12 13:21:45.485+00	omsanchezg01	t
660	14	1	2026-01-12 12:36:33.964+00	2026-01-12 13:21:57.656+00	mtmarting03	t
661	14	1	2026-01-13 08:22:13.558+00	2026-01-13 09:20:17.035+00	mtcerezog01	t
662	41	1	2026-01-13 08:25:10.902+00	2026-01-13 10:16:22.679+00	jjmorcillor01	t
665	30	1	2026-01-13 10:14:49.544+00	2026-01-13 10:17:16.89+00	dmatasr01	t
667	14	1	2026-01-13 10:45:45.433+00	2026-01-13 11:33:53.597+00	omsanchezg01	t
666	22	1	2026-01-13 10:15:01.085+00	2026-01-13 11:33:59.264+00	cjlozanop01	t
663	14	1	2026-01-13 09:20:27.722+00	2026-01-13 12:22:07.299+00	lmoralesg04	t
668	14	1	2026-01-14 07:38:57.767+00	2026-01-14 11:24:10.922+00	mtmarting03	t
670	43	1	2026-01-14 10:44:17.219+00	2026-01-14 11:35:34.774+00	mafloresm01	t
671	41	1	2026-01-14 11:36:16.478+00	2026-01-14 12:29:29.09+00	mgranadob01	t
669	45	1	2026-01-14 10:14:18.844+00	2026-01-14 12:41:37.341+00	chisco	t
672	14	1	2026-01-14 12:28:54.896+00	2026-01-15 07:33:29.288+00	omsanchezg01	t
674	22	1	2026-01-15 08:24:14.333+00	2026-01-15 09:18:36.281+00	cjlozanop01	t
675	30	1	2026-01-15 09:15:19.193+00	2026-01-15 10:26:59.883+00	susana	t
677	30	1	2026-01-15 10:27:27.598+00	2026-01-15 10:27:47.787+00	sbalbuenaa01	t
673	14	1	2026-01-15 07:33:43.932+00	2026-01-15 10:43:31.877+00	lmoralesg04	t
679	41	1	2026-01-15 10:44:19.884+00	2026-01-15 11:32:09.755+00	mgperezr02	t
680	22	1	2026-01-15 10:48:52.338+00	2026-01-15 11:32:53.874+00	jjmorcillor01	t
678	30	1	2026-01-15 10:38:40.423+00	2026-01-15 12:27:03.156+00	dmatasr01	t
682	45	1	2026-01-15 11:38:17.565+00	2026-01-15 12:28:46.756+00	vpalaciosg06	t
681	41	1	2026-01-15 11:32:48.362+00	2026-01-15 12:29:25.77+00	jjmorcillor01	t
684	43	1	2026-01-15 12:27:19.342+00	2026-01-15 13:22:30.868+00	dmatasr01	t
676	22	1	2026-01-15 09:18:54.709+00	2026-01-15 13:26:57.568+00	sromang06	t
664	45	1	2026-01-13 10:10:01.301+00	2026-01-16 07:33:43.549+00	jrodriguezt18	t
686	45	1	2026-01-16 07:33:28.102+00	2026-01-16 07:33:49.723+00	profealu	t
683	81	1	2026-01-15 11:48:36.029+00	2026-01-16 07:34:46.103+00	aserranoa17	t
685	45	1	2026-01-16 07:33:16.669+00	2026-01-16 08:21:23.639+00	omsanchezg01	t
687	14	1	2026-01-16 07:35:15.898+00	2026-01-16 08:23:05.446+00	mtcerezog01	t
688	14	1	2026-01-16 08:21:41.026+00	2026-01-16 09:12:10.299+00	omsanchezg01	t
690	22	1	2026-01-16 08:29:09.47+00	2026-01-16 09:17:17.629+00	jjmorcillor01	t
689	45	1	2026-01-16 08:23:00.426+00	2026-01-16 10:16:06.632+00	mafloresm01	t
691	14	1	2026-01-16 10:44:44.391+00	2026-01-16 11:29:44.077+00	mrcarmonav01	t
692	41	1	2026-01-16 11:33:52.314+00	2026-01-16 12:29:12.228+00	omsanchezg01	t
693	30	1	2026-01-16 12:29:07.805+00	2026-01-16 13:20:06.323+00	mtcerezog01	t
695	67	1	2026-01-19 08:28:49.302+00	2026-01-19 09:16:04.15+00	omsanchezg01	t
694	43	1	2026-01-19 08:26:21.838+00	2026-01-19 09:17:12.935+00	mafloresm01	t
696	81	1	2026-01-19 09:17:52.563+00	2026-01-19 09:20:51.997+00	aserranoa17	t
697	22	1	2026-01-19 09:20:44.074+00	2026-01-19 10:11:01.508+00	jjmorcillor01	t
699	43	1	2026-01-19 10:37:37.798+00	2026-01-19 10:40:28.986+00	chisco	t
700	41	1	2026-01-19 10:44:55.259+00	2026-01-19 11:34:25.246+00	mgperezr02	t
698	43	1	2026-01-19 10:10:54.9+00	2026-01-19 11:39:32.525+00	jjmorcillor01	t
701	22	1	2026-01-19 10:46:03.223+00	2026-01-19 11:39:32.525+00	ndelorzac02	t
703	14	1	2026-01-19 12:50:05.8+00	2026-01-19 13:20:45.974+00	mtmarting03	t
702	41	1	2026-01-19 12:28:45.654+00	2026-01-19 13:20:48.683+00	omsanchezg01	t
704	45	1	2026-01-20 07:31:24.327+00	2026-01-20 08:24:40.07+00	dmatasr01	t
707	14	1	2026-01-20 08:24:23.898+00	2026-01-20 09:17:24.714+00	mtcerezog01	t
705	41	1	2026-01-20 07:35:03.582+00	2026-01-20 09:19:38.274+00	jjmorcillor01	t
706	43	1	2026-01-20 08:24:10.369+00	2026-01-20 09:20:29.177+00	cblancoa02	t
714	43	1	2026-01-20 10:50:03.084+00	2026-01-20 10:53:17.762+00	celita2	t
715	14	1	2026-01-20 10:53:44.477+00	2026-01-20 11:33:23.7+00	omsanchezg01	t
713	22	1	2026-01-20 10:45:05.138+00	2026-01-20 11:35:51.766+00	cjlozanop01	t
712	43	1	2026-01-20 10:44:45.633+00	2026-01-20 11:41:28.669+00	cblancoa02	t
711	42	1	2026-01-20 10:44:25.696+00	2026-01-20 11:41:38.622+00	dmatasr01	t
709	14	1	2026-01-20 10:30:13.451+00	2026-01-20 11:41:46.823+00	omsanchezg01	t
708	83	1	2026-01-20 08:29:56.529+00	2026-01-20 11:42:05.919+00	amsanchezs01	t
710	67	1	2026-01-20 10:36:20.384+00	2026-01-20 11:42:13.535+00	jjmorcillor01	t
719	43	1	2026-01-21 10:41:46.426+00	2026-01-21 11:36:56.369+00	egonzalezh18	t
716	14	1	2026-01-21 07:36:06.027+00	2026-01-21 12:00:15.544+00	mtmarting03	t
722	81	1	2026-01-21 12:03:18.186+00	2026-01-21 12:10:32.684+00	aserranoa17	t
721	41	1	2026-01-21 11:36:43.024+00	2026-01-21 12:26:51.305+00	omsanchezg01	t
720	66	1	2026-01-21 10:42:34.098+00	2026-01-21 12:26:58.02+00	dnarcisoc01	t
717	14	1	2026-01-21 09:51:55.422+00	2026-01-21 13:25:49.743+00	mtcerezog01	t
718	45	1	2026-01-21 09:52:37.303+00	2026-01-22 11:36:49.451+00	dmacarrillam01	t
723	45	1	2026-01-21 12:29:32.663+00	2026-01-21 13:21:27.334+00	mrcarmonav01	t
726	67	1	2026-01-22 07:42:03.521+00	2026-01-22 08:21:55.384+00	ndelorzac02	t
724	43	1	2026-01-22 07:31:19.914+00	2026-01-22 08:22:39.967+00	ilozano1977	t
729	45	1	2026-01-22 08:26:13.962+00	2026-01-22 08:28:18.064+00	emurielb76	t
727	22	1	2026-01-22 08:21:50.331+00	2026-01-22 09:16:03.27+00	cjlozanop01	t
728	41	1	2026-01-22 08:22:49.543+00	2026-01-22 09:20:08.825+00	ilozano1977	t
730	43	1	2026-01-22 08:28:12.708+00	2026-01-22 09:20:11.281+00	emurielb76	t
731	45	1	2026-01-22 09:20:49.701+00	2026-01-22 10:15:36.372+00	pety78	t
732	41	1	2026-01-22 09:21:42.017+00	2026-01-22 10:42:01.359+00	jjmorcillor01	t
725	14	1	2026-01-22 07:35:15.946+00	2026-01-22 10:42:07.528+00	lmoralesg04	t
733	22	1	2026-01-22 10:42:19.768+00	2026-01-22 11:33:04.745+00	jjmorcillor01	t
735	45	1	2026-01-22 10:45:56.3+00	2026-01-22 11:35:32.195+00	rmvegac01	t
734	41	1	2026-01-22 10:43:03.443+00	2026-01-22 11:36:17.081+00	mgperezr02	t
739	45	1	2026-01-22 11:36:28.946+00	2026-01-22 12:32:26.42+00	mgperezr02	t
737	14	1	2026-01-22 11:33:53.926+00	2026-01-22 12:32:34.103+00	mtcerezog01	t
738	43	1	2026-01-22 11:36:02.609+00	2026-01-22 12:32:39.565+00	celita2	t
736	41	1	2026-01-22 11:33:28.825+00	2026-01-22 12:32:45.083+00	jjmorcillor01	t
740	14	1	2026-01-23 07:32:04.279+00	2026-01-23 08:21:59.623+00	mtcerezog01	t
741	45	1	2026-01-23 07:32:33.682+00	2026-01-23 08:25:23.031+00	omsanchezg01	t
744	43	1	2026-01-23 09:19:23.726+00	2026-01-23 09:30:40.661+00	ilozano1977	t
776	67	1	2026-01-23 09:31:07.932+00	2026-01-23 10:10:05.817+00	ilozano1977	t
742	14	1	2026-01-23 09:18:50.825+00	2026-01-23 10:11:23.549+00	omsanchezg01	t
743	41	1	2026-01-23 09:19:06.666+00	2026-01-23 10:14:45.334+00	jjmorcillor01	t
775	45	1	2026-01-23 09:22:46.941+00	2026-01-23 10:18:12.443+00	vpalaciosg06	t
779	81	1	2026-01-23 10:43:31.714+00	2026-01-23 10:46:39.875+00	aserranoa17	t
778	14	1	2026-01-23 10:42:57.059+00	2026-01-23 11:30:24.961+00	mrcarmonav01	t
777	47	1	2026-01-23 10:42:32.26+00	2026-01-23 11:33:35.987+00	djuliog01	t
780	43	1	2026-01-23 11:32:14.251+00	2026-01-23 12:27:34.683+00	jjmorcillor01	t
783	30	1	2026-01-23 12:32:34.918+00	2026-01-23 13:19:26.124+00	egonzalezh18	t
784	67	1	2026-01-23 12:34:44.607+00	2026-01-23 13:19:46.323+00	mtcerezog01	t
781	45	1	2026-01-23 11:32:33.497+00	2026-01-23 13:21:17.189+00	pagarciam27	t
782	47	1	2026-01-23 12:29:56.5+00	2026-01-23 13:24:24.337+00	djuliog01	t
785	81	1	2026-01-26 07:39:38.136+00	2026-01-26 08:16:14.868+00	aserranoa17	t
788	14	1	2026-01-26 08:30:54.85+00	2026-01-26 09:15:51.253+00	omsanchezg01	t
786	43	1	2026-01-26 08:22:33.498+00	2026-01-26 09:18:54.665+00	ilozano1977	t
789	22	1	2026-01-26 09:18:49.433+00	2026-01-26 10:11:48.432+00	jjmorcillor01	t
787	41	1	2026-01-26 08:26:55.058+00	2026-01-26 10:22:31.108+00	mafloresm01	t
790	41	1	2026-01-26 10:43:28.134+00	2026-01-26 11:53:58.244+00	mgperezr02	t
791	43	1	2026-01-26 11:43:44.094+00	2026-01-26 12:14:21.258+00	chisco	t
793	14	1	2026-01-26 12:29:24.423+00	2026-01-26 13:21:03.213+00	omsanchezg01	t
792	14	1	2026-01-26 11:54:13.134+00	2026-01-26 12:42:28.42+00	mtmarting03	t
794	43	1	2026-01-26 12:42:49.239+00	2026-01-26 13:14:26.9+00	mtmarting03	t
796	43	1	2026-01-27 09:20:10.599+00	2026-01-27 10:11:26.777+00	celita2	t
795	14	1	2026-01-27 09:18:25.063+00	2026-01-27 10:35:22.191+00	lmoralesg04	t
798	36	1	2026-01-27 10:46:44.383+00	2026-01-27 11:13:43.372+00	mssalomonp02	t
801	43	1	2026-01-27 11:34:40.8+00	2026-01-27 12:26:38.906+00	lpcamarac01	t
800	14	1	2026-01-27 11:34:18.869+00	2026-01-27 12:26:48.19+00	lmoralesg04	t
799	45	1	2026-01-27 10:47:22.283+00	2026-01-27 12:27:19.585+00	ilozano1977	t
797	14	1	2026-01-27 10:44:54.714+00	2026-01-27 12:32:21.13+00	omsanchezg01	t
802	45	1	2026-01-27 12:32:58.709+00	2026-01-27 13:19:42.661+00	omsanchezg01	t
805	81	1	2026-01-29 08:38:45.404+00	2026-01-29 09:22:25.706+00	dnarcisoc01	t
806	45	1	2026-01-29 09:17:42.411+00	2026-01-29 10:15:05.686+00	ilozano1977	t
804	30	1	2026-01-29 08:20:54.549+00	2026-01-29 10:17:43.377+00	pagarciam27	t
803	14	1	2026-01-29 07:30:53.829+00	2026-01-29 10:50:06.235+00	lmoralesg04	t
807	36	1	2026-01-29 10:19:57.384+00	2026-01-29 10:50:10.081+00	mssalomonp02	t
809	45	1	2026-01-29 11:34:15.58+00	2026-01-29 12:27:27.917+00	vpalaciosg06	t
808	43	1	2026-01-29 11:32:04.683+00	2026-01-29 12:27:38.366+00	celita2	t
810	14	1	2026-01-30 07:34:39.519+00	2026-01-30 08:22:14.077+00	mtcerezog01	t
811	47	1	2026-01-30 08:20:43.755+00	2026-01-30 09:17:52.35+00	egonzalezh18	t
812	45	1	2026-01-30 08:31:02.107+00	2026-01-30 09:29:05.586+00	mafloresm01	t
813	41	1	2026-01-30 08:31:56.736+00	2026-01-30 09:29:13.642+00	mtcerezog01	t
814	30	1	2026-01-30 09:12:43.69+00	2026-01-30 10:35:28.9+00	mssalomonp02	t
815	14	1	2026-01-30 09:18:48.751+00	2026-01-30 10:36:43.949+00	omsanchezg01	t
816	43	1	2026-01-30 10:43:03.9+00	2026-01-30 11:35:44.597+00	mafloresm01	t
819	14	1	2026-01-30 12:28:45.337+00	2026-01-30 12:32:51.863+00	djuliog01	t
817	30	1	2026-01-30 11:35:38.758+00	2026-01-30 13:18:10.807+00	aserranoa17	t
818	41	1	2026-01-30 12:24:08.62+00	2026-01-30 13:20:36.771+00	emparrag02	t
820	47	1	2026-01-30 12:33:21.895+00	2026-01-30 13:20:36.771+00	djuliog01	t
821	14	1	2026-02-02 08:25:19.418+00	2026-02-02 09:18:53.709+00	omsanchezg01	t
822	45	1	2026-02-02 09:24:36.754+00	2026-02-02 10:11:06.836+00	a_carlosss76	t
824	12	1	2026-02-02 10:45:56.562+00	2026-02-02 11:17:16.499+00	mdcpalaciosr01	t
825	45	1	2026-02-02 10:48:58.17+00	2026-02-02 11:32:37.68+00	jrodriguezt18	t
826	67	1	2026-02-02 10:49:23.043+00	2026-02-02 11:32:41.054+00	dnarcisoc01	t
829	14	1	2026-02-02 13:00:19.571+00	2026-02-02 13:01:37.599+00	mtmarting03	t
827	14	1	2026-02-02 12:31:04.67+00	2026-02-02 13:19:55.886+00	omsanchezg01	t
828	30	1	2026-02-02 12:31:37.385+00	2026-02-02 13:21:06.291+00	dmatasr01	t
831	30	1	2026-02-03 07:34:51.899+00	2026-02-03 07:54:29.517+00	bcrespoc01	t
832	45	1	2026-02-03 07:47:53.589+00	2026-02-03 08:22:54.232+00	igomezc12	t
833	45	1	2026-02-03 08:22:47.148+00	2026-02-03 09:18:58.039+00	cjlozanop01	t
823	41	1	2026-02-02 10:42:32.574+00	2026-02-03 09:19:52+00	mgperezr02	t
835	45	1	2026-02-03 10:44:58.265+00	2026-02-03 11:32:30.111+00	jrodriguezt18	t
834	22	1	2026-02-03 08:24:10.418+00	2026-02-03 11:35:59.143+00	pagarciam27	t
836	67	1	2026-02-03 11:32:21.872+00	2026-02-03 12:25:30.489+00	lmoralesg04	t
838	43	1	2026-02-03 11:36:37.739+00	2026-02-03 12:29:27.038+00	lpcamarac01	t
830	47	1	2026-02-03 07:31:08.973+00	2026-02-03 13:15:32.463+00	chisco	t
837	45	1	2026-02-03 11:35:48.219+00	2026-02-03 13:20:43.931+00	jjmorcillor01	t
839	47	1	2026-02-04 07:27:54.102+00	2026-02-04 07:32:55.247+00	chisco	t
841	47	1	2026-02-04 08:25:58.166+00	2026-02-04 09:19:56.88+00	jrodriguezt18	t
842	45	1	2026-02-04 08:28:14.737+00	2026-02-04 09:29:31.987+00	igomezc12	t
840	14	1	2026-02-04 08:18:43.176+00	2026-02-04 11:17:43.134+00	mtmarting03	t
844	30	1	2026-02-04 10:52:32.103+00	2026-02-04 11:31:41.173+00	pety78	t
843	47	1	2026-02-04 10:47:49.961+00	2026-02-04 11:35:09.485+00	jrodriguezt18	t
848	45	1	2026-02-04 11:38:48.377+00	2026-02-04 12:26:28.129+00	jmmurillon01	t
847	67	1	2026-02-04 11:36:12.743+00	2026-02-04 12:27:11.425+00	dnarcisoc01	t
846	14	1	2026-02-04 11:35:02.767+00	2026-02-04 12:28:36.082+00	celita2	t
849	43	1	2026-02-04 11:41:24.77+00	2026-02-04 12:29:33.515+00	cblancoa02	t
845	41	1	2026-02-04 11:34:40.813+00	2026-02-04 12:29:44.783+00	mgperezr02	t
854	67	1	2026-02-05 08:09:49.222+00	2026-02-05 08:11:00.65+00	chisco	t
852	47	1	2026-02-05 07:37:57.092+00	2026-02-05 08:25:38.151+00	mssalomonp02	t
851	43	1	2026-02-05 07:37:43.465+00	2026-02-05 10:58:57.116+00	chisco	t
853	71	1	2026-02-05 07:39:15.166+00	2026-02-05 10:59:09.796+00	chisco	t
856	45	1	2026-02-05 08:25:21.267+00	2026-02-05 12:30:22.6+00	pagarciam27	t
855	22	1	2026-02-05 08:20:32.569+00	2026-02-05 12:30:26.264+00	cjlozanop01	t
850	14	1	2026-02-05 07:37:26.019+00	2026-02-05 12:30:29.378+00	lmoralesg04	t
860	45	1	2026-02-06 08:04:49.853+00	2026-02-06 09:18:06.073+00	mebravom01	t
857	47	1	2026-02-05 12:30:42.781+00	2026-02-06 09:18:38.223+00	celita2	t
858	30	1	2026-02-06 07:30:44.819+00	2026-02-06 09:19:39.925+00	emurielb76	t
859	14	1	2026-02-06 07:31:10.972+00	2026-02-06 10:44:01.73+00	mtcerezog01	t
861	14	1	2026-02-06 09:17:53.228+00	2026-02-06 10:44:06.559+00	omsanchezg01	t
866	45	1	2026-02-06 10:45:42.667+00	2026-02-06 11:24:39.831+00	mebravom01	t
865	14	1	2026-02-06 10:44:21.809+00	2026-02-06 11:32:58.76+00	mtcerezog01	t
864	43	1	2026-02-06 10:34:17.966+00	2026-02-06 11:33:22.893+00	mafloresm01	t
867	45	1	2026-02-06 11:37:49.505+00	2026-02-06 12:27:37.031+00	celita2	t
862	47	1	2026-02-06 09:19:11.071+00	2026-02-06 12:30:44.242+00	mssalomonp02	t
863	30	1	2026-02-06 09:20:16.497+00	2026-02-06 12:32:12.97+00	susana	t
871	26	1	2026-02-06 12:35:08.004+00	2026-02-06 13:19:34.77+00	chisco	t
869	67	1	2026-02-06 12:30:15.511+00	2026-02-06 13:20:36.884+00	mtcerezog01	t
868	41	1	2026-02-06 12:26:00.819+00	2026-02-06 13:21:29.943+00	mebravom01	t
870	47	1	2026-02-06 12:30:53.839+00	2026-02-06 13:29:46.642+00	egonzalezh18	t
872	28	1	2026-02-09 07:32:23.286+00	2026-02-09 07:33:21.758+00	amfajardol01	t
875	17	1	2026-02-09 07:47:43.062+00	2026-02-09 07:48:43.336+00	igomezc12	t
874	26	1	2026-02-09 07:36:19.238+00	2026-02-09 08:23:26.912+00	chisco	t
873	81	1	2026-02-09 07:33:44.553+00	2026-02-09 10:11:22.45+00	amfajardol01	t
876	22	1	2026-02-09 09:16:31.152+00	2026-02-09 10:11:22.45+00	jjmorcillor01	t
878	30	1	2026-02-09 09:27:06.854+00	2026-02-09 10:11:27.902+00	cjlozanop01	t
879	47	1	2026-02-09 09:27:25.886+00	2026-02-09 10:43:08.766+00	mssalomonp02	t
877	45	1	2026-02-09 09:25:46.547+00	2026-02-09 10:46:20.797+00	isabel22	t
882	41	1	2026-02-09 10:46:51.4+00	2026-02-09 11:34:15.051+00	mgperezr02	t
885	43	1	2026-02-09 11:33:01.827+00	2026-02-09 12:25:31.71+00	dmatasr01	t
884	45	1	2026-02-09 11:30:58.234+00	2026-02-09 12:31:25.592+00	pagarciam27	t
883	30	1	2026-02-09 11:26:56.056+00	2026-02-09 12:31:30.634+00	learob	t
886	41	1	2026-02-09 12:30:35.193+00	2026-02-09 13:19:00.948+00	omsanchezg01	t
880	14	1	2026-02-09 10:43:03.184+00	2026-02-09 13:21:28.665+00	mtmarting03	t
881	45	1	2026-02-09 10:45:29.022+00	2026-02-10 07:35:11.475+00	jjmorcillor01	t
887	45	1	2026-02-10 07:35:34.217+00	2026-02-10 08:31:21.209+00	rencinasr02	t
889	45	1	2026-02-10 08:25:19.167+00	2026-02-10 09:17:24.649+00	cjlozanop01	t
890	30	1	2026-02-10 08:43:15.035+00	2026-02-10 09:17:27.63+00	egonzalezh18	t
888	41	1	2026-02-10 08:17:52.119+00	2026-02-10 10:34:20.174+00	djuliog01	t
895	60	1	2026-02-10 10:44:53.931+00	2026-02-10 11:31:43.306+00	egonzalezh18	t
893	22	1	2026-02-10 10:42:26.479+00	2026-02-10 11:32:10.11+00	cjlozanop01	t
892	45	1	2026-02-10 10:34:11.65+00	2026-02-10 11:51:24.5+00	jrodriguezt18	t
891	14	1	2026-02-10 09:38:19.517+00	2026-02-10 12:26:17.142+00	lmoralesg04	t
894	67	1	2026-02-10 10:42:49.438+00	2026-02-10 11:29:14.199+00	omsanchezg01	t
898	45	1	2026-02-10 11:51:42.625+00	2026-02-10 12:26:09.905+00	mgranadob01	t
897	43	1	2026-02-10 11:35:18.337+00	2026-02-10 12:26:13.266+00	lpcamarac01	t
896	67	1	2026-02-10 11:34:33.037+00	2026-02-10 12:26:43.667+00	lmoralesg04	t
901	45	1	2026-02-11 09:58:03.971+00	2026-02-11 11:01:48.781+00	nmaciasp02	t
900	14	1	2026-02-11 09:44:16.667+00	2026-02-11 11:09:29.951+00	mtmarting03	t
899	43	1	2026-02-11 09:42:58.415+00	2026-02-11 11:09:59.789+00	ilozano1977	t
903	41	1	2026-02-11 11:38:23.87+00	2026-02-11 12:37:34.343+00	mgperezr02	t
902	47	1	2026-02-11 11:21:57.255+00	2026-02-11 12:37:38.831+00	djuliog01	t
904	14	1	2026-02-11 12:20:57.846+00	2026-02-11 13:19:13.84+00	omsanchezg01	t
908	45	1	2026-02-12 09:26:16.293+00	2026-02-12 10:25:29.723+00	ilozano1977	t
906	41	1	2026-02-12 09:22:02.939+00	2026-02-12 10:43:43.752+00	jjmorcillor01	t
909	22	1	2026-02-12 09:26:51.945+00	2026-02-12 10:43:50.958+00	pety78	t
907	67	1	2026-02-12 09:25:47.205+00	2026-02-12 10:44:06.19+00	magarcian01	t
905	14	1	2026-02-12 07:30:36.337+00	2026-02-12 10:44:09.094+00	lmoralesg04	t
911	45	1	2026-02-12 10:48:59.671+00	2026-02-12 11:33:35.389+00	celita2	t
910	41	1	2026-02-12 10:44:28.882+00	2026-02-12 11:34:45.02+00	mgperezr02	t
912	45	1	2026-02-12 11:33:55.176+00	2026-02-13 07:33:37.408+00	vpalaciosg06	t
913	45	1	2026-02-13 07:31:13.713+00	2026-02-13 07:33:42.766+00	omsanchezg01	t
916	67	1	2026-02-13 07:40:18.474+00	2026-02-13 08:22:44.896+00	mtcerezog01	t
914	41	1	2026-02-13 07:33:11.145+00	2026-02-13 08:23:44.69+00	omsanchezg01	t
915	45	1	2026-02-13 07:34:06.21+00	2026-02-13 08:24:43.46+00	mji3003	t
917	41	1	2026-02-13 08:25:20.143+00	2026-02-13 09:19:42.929+00	mebravom01	t
919	14	1	2026-02-13 10:59:34.381+00	2026-02-13 11:33:58.582+00	mebravom01	t
921	27	1	2026-02-13 11:42:49.758+00	2026-02-13 11:43:34.616+00	dmacarrillam01	t
920	45	1	2026-02-13 11:40:21.633+00	2026-02-13 12:27:03.96+00	mrcarmonav01	t
925	30	1	2026-02-13 12:38:50.561+00	2026-02-13 13:18:11.491+00	jjmorcillor01	t
923	67	1	2026-02-13 12:31:36.319+00	2026-02-13 13:19:23.329+00	mtcerezog01	t
924	45	1	2026-02-13 12:36:51.52+00	2026-02-13 13:21:02.643+00	magarcian01	t
922	41	1	2026-02-13 12:25:59.365+00	2026-02-13 13:23:04.877+00	mebravom01	t
918	45	1	2026-02-13 09:19:56.252+00	2026-02-13 13:23:07.602+00	mgperezr02	t
926	14	1	2026-02-18 07:32:27.431+00	2026-02-18 12:18:41.716+00	mtmarting03	t
928	41	1	2026-02-18 08:02:16.183+00	2026-02-18 12:31:08.975+00	pety78	t
927	66	1	2026-02-18 07:37:43.623+00	2026-02-18 13:15:27.682+00	rmvegac01	t
930	14	1	2026-02-18 12:31:36.739+00	2026-02-18 13:19:21.256+00	omsanchezg01	t
929	41	1	2026-02-18 11:36:10.533+00	2026-02-18 13:25:24.161+00	mgperezr02	t
933	41	1	2026-02-19 09:18:49.666+00	2026-02-19 10:18:08.194+00	lpcamarac01	t
931	45	1	2026-02-19 09:18:12.189+00	2026-02-19 10:39:37.217+00	jjmorcillor01	t
932	14	1	2026-02-19 09:18:33.971+00	2026-02-19 10:43:13.272+00	lmoralesg04	t
935	14	1	2026-02-19 10:43:39.078+00	2026-02-19 11:29:02.384+00	omsanchezg01	t
936	22	1	2026-02-19 10:44:21.692+00	2026-02-19 11:51:54.416+00	jjmorcillor01	t
934	41	1	2026-02-19 10:42:11.177+00	2026-02-19 11:51:59.061+00	mgperezr02	t
937	42	1	2026-02-19 11:31:44.108+00	2026-02-19 12:33:09.263+00	bpconejero78	t
938	67	1	2026-02-19 11:52:13+00	2026-02-19 13:20:44.763+00	ndelorzac02	t
940	14	1	2026-02-20 07:32:57.84+00	2026-02-20 08:18:40.446+00	mtcerezog01	t
939	45	1	2026-02-20 07:32:33.368+00	2026-02-20 09:16:14.967+00	igomezc12	t
942	30	1	2026-02-20 08:21:28.832+00	2026-02-20 10:08:54.757+00	pagarciam27	t
943	14	1	2026-02-20 09:16:00.462+00	2026-02-20 10:12:23.618+00	bfernandezt07	t
944	14	1	2026-02-20 10:46:08.71+00	2026-02-20 11:31:33.056+00	mrcarmonav01	t
947	27	1	2026-02-20 11:40:08.992+00	2026-02-20 11:42:11.631+00	dmacarrillam01	t
945	45	1	2026-02-20 11:32:00.497+00	2026-02-20 12:29:04.146+00	ilozano1977	t
946	41	1	2026-02-20 11:36:00.078+00	2026-02-20 12:30:02.173+00	jjmorcillor01	t
948	67	1	2026-02-20 12:29:34.058+00	2026-02-20 13:18:29.208+00	mtcerezog01	t
941	43	1	2026-02-20 08:17:38.813+00	2026-02-20 13:21:34.289+00	amfajardol01	t
949	43	1	2026-02-23 08:26:51.305+00	2026-02-23 09:17:50.372+00	celita2	t
951	41	1	2026-02-23 08:30:38.442+00	2026-02-23 09:17:53.082+00	mafloresm01	t
950	47	1	2026-02-23 08:30:16.445+00	2026-02-23 09:47:59.524+00	chisco	t
953	67	1	2026-02-23 09:21:59.73+00	2026-02-23 10:12:10.809+00	omsanchezg01	t
954	22	1	2026-02-23 09:24:35.061+00	2026-02-23 10:16:04.355+00	jjmorcillor01	t
952	43	1	2026-02-23 09:16:29.934+00	2026-02-23 10:42:21.697+00	cblancoa02	t
957	44	1	2026-02-23 10:49:53.418+00	2026-02-23 11:34:28.537+00	jjmorcillor01	t
956	14	1	2026-02-23 10:43:35.289+00	2026-02-23 11:39:29.495+00	bfernandezt07	t
955	41	1	2026-02-23 10:42:36.433+00	2026-02-23 11:40:22.405+00	mgperezr02	t
959	67	1	2026-02-23 11:37:31.471+00	2026-02-23 12:26:23.357+00	ndelorzac02	t
960	45	1	2026-02-23 11:39:53.86+00	2026-02-23 12:30:54.834+00	bfernandezt07	t
958	14	1	2026-02-23 11:10:47.613+00	2026-02-23 13:11:02.414+00	mtmarting03	t
961	14	1	2026-02-24 07:31:29.946+00	2026-02-24 08:20:49.194+00	bfernandezt07	t
963	41	1	2026-02-24 08:22:32.507+00	2026-02-24 09:16:27.764+00	jjmorcillor01	t
962	45	1	2026-02-24 07:33:04.437+00	2026-02-24 09:25:00.155+00	igomezc12	t
964	14	1	2026-02-24 08:26:40.545+00	2026-02-24 09:25:03.477+00	cblancoa02	t
966	14	1	2026-02-24 09:25:16.369+00	2026-02-24 10:51:06.939+00	lmoralesg04	t
965	30	1	2026-02-24 09:24:19.616+00	2026-02-24 11:16:31.733+00	mdcpalaciosr01	t
968	14	1	2026-02-24 10:45:44.197+00	2026-02-24 11:32:55.728+00	omsanchezg01	t
967	45	1	2026-02-24 10:42:31.156+00	2026-02-24 11:33:01.602+00	jrodriguezt18	t
971	43	1	2026-02-24 11:37:07.395+00	2026-02-24 12:28:34.315+00	lpcamarac01	t
970	41	1	2026-02-24 11:34:27.716+00	2026-02-24 12:28:39.8+00	jjmorcillor01	t
969	30	1	2026-02-24 11:16:59.909+00	2026-02-24 12:48:56.685+00	pety78	t
973	40	1	2026-02-24 12:34:11.286+00	2026-02-24 13:02:02.299+00	chisco	t
972	45	1	2026-02-24 12:29:26.379+00	2026-02-24 13:21:30.988+00	djuliog01	t
978	26	1	2026-02-25 07:37:28.555+00	2026-02-25 07:52:13.994+00	chisco	t
976	30	1	2026-02-25 07:31:19.197+00	2026-02-25 08:17:18.645+00	dnarcisoc01	t
979	45	1	2026-02-25 08:24:16.176+00	2026-02-25 09:20:54.145+00	igomezc12	t
977	14	1	2026-02-25 07:35:28.149+00	2026-02-25 10:24:01.756+00	mtmarting03	t
982	43	1	2026-02-25 10:48:19.21+00	2026-02-25 11:33:04.561+00	ilozano1977	t
980	14	1	2026-02-25 09:19:55.291+00	2026-02-25 11:35:44.673+00	mafloresm01	t
981	47	1	2026-02-25 10:24:45.084+00	2026-02-25 11:35:48.738+00	pety78	t
983	41	1	2026-02-25 11:34:11.214+00	2026-02-25 12:29:32.847+00	mgperezr02	t
984	47	1	2026-02-25 11:35:59.981+00	2026-02-25 12:34:18.848+00	emparrag02	t
975	45	1	2026-02-25 07:31:02.686+00	2026-02-25 13:25:49.707+00	bpconejero78	t
986	67	1	2026-02-25 12:34:04.238+00	2026-02-25 13:25:49.707+00	mtcerezog01	t
974	40	1	2026-02-25 07:30:22.261+00	2026-02-25 13:25:54.635+00	chisco	t
985	14	1	2026-02-25 12:29:52.097+00	2026-02-25 13:25:57.997+00	omsanchezg01	t
988	22	1	2026-02-26 08:24:13.909+00	2026-02-26 09:16:47.555+00	cjlozanop01	t
987	14	1	2026-02-26 07:30:10.783+00	2026-02-26 09:30:45.002+00	lmoralesg04	t
990	41	1	2026-02-26 09:19:04.789+00	2026-02-26 10:11:59.202+00	lpcamarac01	t
991	45	1	2026-02-26 09:19:44.467+00	2026-02-26 10:21:56.19+00	ilozano1977	t
992	14	1	2026-02-26 10:17:17.952+00	2026-02-26 10:29:01.512+00	chisco	t
989	14	1	2026-02-26 09:18:25.341+00	2026-02-26 11:32:18.136+00	mafloresm01	t
993	41	1	2026-02-26 10:46:50.674+00	2026-02-26 11:33:01.193+00	mgperezr02	t
996	40	1	2026-02-26 12:06:13.583+00	2026-02-26 12:33:55.301+00	chisco	t
995	43	1	2026-02-26 11:38:21.695+00	2026-02-26 13:21:47.975+00	celita2	t
997	14	1	2026-02-27 07:33:37.006+00	2026-02-27 08:25:31.219+00	mtcerezog01	t
994	41	1	2026-02-26 11:32:09.268+00	2026-02-27 07:34:17.547+00	mebravom01	t
999	43	1	2026-02-27 07:35:10.837+00	2026-02-27 08:22:56.235+00	bfernandezt07	t
998	45	1	2026-02-27 07:34:08.085+00	2026-02-27 08:25:17.635+00	omsanchezg01	t
1000	14	1	2026-02-27 08:25:58.395+00	2026-02-27 09:12:59.655+00	bfernandezt07	t
1001	22	1	2026-02-27 08:26:25.542+00	2026-02-27 09:16:00.554+00	jjmorcillor01	t
1002	67	1	2026-02-27 09:21:14.167+00	2026-02-27 10:10:25.722+00	omsanchezg01	t
1003	45	1	2026-02-27 09:21:52.206+00	2026-02-27 10:58:16.331+00	mgperezr02	t
1004	14	1	2026-02-27 10:53:25.417+00	2026-02-27 11:29:29.415+00	mrcarmonav01	t
1006	41	1	2026-02-27 11:33:21.919+00	2026-02-27 12:28:16.988+00	jjmorcillor01	t
1005	45	1	2026-02-27 11:31:31.469+00	2026-02-27 13:18:02.168+00	djuliog01	t
1009	43	1	2026-03-02 08:23:40.2+00	2026-03-02 09:17:53.609+00	mafloresm01	t
1010	43	1	2026-03-02 09:18:23.689+00	2026-03-02 10:18:04.184+00	cblancoa02	t
1012	67	1	2026-03-02 09:24:10.006+00	2026-03-02 10:18:11.672+00	dnarcisoc01	t
1011	22	1	2026-03-02 09:19:53.288+00	2026-03-02 10:19:36.617+00	jjmorcillor01	t
1014	41	1	2026-03-02 10:44:29.841+00	2026-03-02 11:32:50.091+00	mgperezr02	t
1016	41	1	2026-03-02 12:31:13.96+00	2026-03-02 13:19:22.142+00	omsanchezg01	t
1013	14	1	2026-03-02 10:44:10.464+00	2026-03-02 13:21:29.402+00	mtmarting03	t
1018	14	1	2026-03-03 07:31:12.332+00	2026-03-03 08:24:26.434+00	bfernandezt07	t
1015	41	1	2026-03-02 11:31:01.556+00	2026-03-03 08:25:37.69+00	bfernandezt07	t
1017	30	1	2026-03-03 07:18:33.557+00	2026-03-03 08:30:27.136+00	learob	t
1021	41	1	2026-03-03 08:26:48.341+00	2026-03-03 09:13:39.772+00	afloresc27	t
1020	42	1	2026-03-03 08:24:09.789+00	2026-03-03 09:18:56.172+00	jjmorcillor01	t
1023	61	1	2026-03-03 09:20:03.292+00	2026-03-03 10:11:34.807+00	amfajardol01	t
1022	47	1	2026-03-03 09:13:20.826+00	2026-03-03 10:21:12.827+00	mafloresm01	t
1024	30	1	2026-03-03 10:12:03.853+00	2026-03-03 11:26:03.906+00	amfajardol01	t
1025	22	1	2026-03-03 10:16:34.017+00	2026-03-03 11:26:03.906+00	cjlozanop01	t
1029	14	1	2026-03-03 10:45:42.952+00	2026-03-03 11:29:58.821+00	omsanchezg01	t
1031	67	1	2026-03-03 10:57:16.821+00	2026-03-03 11:30:37.829+00	mafloresm01	t
1008	47	1	2026-02-27 12:29:52.556+00	2026-03-03 11:31:29.566+00	bpconejero78	t
1030	61	1	2026-03-03 10:47:39.534+00	2026-03-03 11:31:44.448+00	bpconejero78	t
1028	30	1	2026-03-03 10:44:31.031+00	2026-03-03 11:34:36.32+00	pagarciam27	t
1027	45	1	2026-03-03 10:42:08.729+00	2026-03-03 11:42:29.732+00	jrodriguezt18	t
1019	14	1	2026-03-03 08:20:35.118+00	2026-03-03 12:25:20.694+00	lmoralesg04	t
1032	43	1	2026-03-03 11:33:13.627+00	2026-03-03 12:27:02.741+00	lpcamarac01	t
1026	47	1	2026-03-03 10:35:40.263+00	2026-03-03 13:08:13.664+00	pety78	t
1033	41	1	2026-03-03 12:27:23.818+00	2026-03-03 13:20:02.19+00	omsanchezg01	t
1035	63	1	2026-03-04 09:14:06.93+00	2026-03-04 09:23:41.793+00	bcrespoc01	t
1036	30	1	2026-03-04 09:19:37.524+00	2026-03-04 10:17:39.456+00	mgranadob01	t
1037	62	1	2026-03-04 09:28:07.629+00	2026-03-04 11:14:43.33+00	bcrespoc01	t
1038	43	1	2026-03-04 10:44:52.463+00	2026-03-04 11:34:52.529+00	mafloresm01	t
1007	40	1	2026-02-27 12:05:03.99+00	2026-03-04 11:53:46.348+00	chisco	t
1041	7	1	2026-03-04 12:11:03.161+00	2026-03-04 12:11:06.279+00	chisco	t
1042	22	1	2026-03-04 12:11:15.347+00	2026-03-04 12:11:17.943+00	profealu	t
1034	14	1	2026-03-04 07:36:43.766+00	2026-03-04 12:27:02.319+00	mtmarting03	t
1040	14	1	2026-03-04 11:49:35.199+00	2026-03-04 12:28:00.258+00	bfernandezt07	t
1039	41	1	2026-03-04 11:33:48.891+00	2026-03-04 12:33:08.849+00	mgperezr02	t
1043	41	1	2026-03-04 12:28:23.367+00	2026-03-04 13:20:55.305+00	bfernandezt07	t
1044	45	1	2026-03-04 12:38:51.345+00	2026-03-04 13:21:14.836+00	efranciscor01	t
1046	43	1	2026-03-05 07:50:40.395+00	2026-03-05 08:21:10.218+00	emurielb76	t
1049	41	1	2026-03-05 09:05:51.324+00	2026-03-05 09:05:58.088+00	chisco	t
1048	40	1	2026-03-05 09:05:18.702+00	2026-03-05 09:06:04.605+00	chisco	t
1050	45	1	2026-03-05 09:06:57.403+00	2026-03-05 09:07:03.741+00	chisco	t
1051	40	1	2026-03-05 09:09:07.055+00	2026-03-05 10:01:58.46+00	chisco	t
1045	14	1	2026-03-05 07:30:59.559+00	2026-03-05 10:09:11.096+00	lmoralesg04	t
1052	43	1	2026-03-05 10:50:51.962+00	2026-03-05 10:50:57.378+00	cblancoa02	t
1054	41	1	2026-03-05 11:15:43.588+00	2026-03-05 11:15:47.333+00	chisco	t
1055	41	1	2026-03-05 11:16:46.179+00	2026-03-05 11:33:14.366+00	mgperezr02	t
1053	47	1	2026-03-05 11:15:25.82+00	2026-03-05 12:26:09.937+00	jrodriguezt18	t
1057	45	1	2026-03-05 11:33:45.958+00	2026-03-05 12:28:03.373+00	mgperezr02	t
1056	41	1	2026-03-05 11:33:26.739+00	2026-03-05 13:20:46.511+00	mebravom01	t
1058	43	1	2026-03-05 11:37:38.134+00	2026-03-05 13:20:52.658+00	celita2	t
1047	30	1	2026-03-05 08:26:53.036+00	2026-03-05 13:21:31.994+00	pagarciam27	t
1059	45	1	2026-03-06 07:35:58.67+00	2026-03-06 08:23:51.442+00	omsanchezg01	t
1060	41	1	2026-03-06 08:26:14.377+00	2026-03-06 09:27:35.837+00	mebravom01	t
1061	43	1	2026-03-06 09:10:58.606+00	2026-03-06 10:13:09.483+00	amfajardol01	t
1062	41	1	2026-03-09 08:28:48.922+00	2026-03-09 09:16:17.897+00	celita2	t
1063	22	1	2026-03-09 09:22:08.365+00	2026-03-09 10:20:55.261+00	jjmorcillor01	t
1064	45	1	2026-03-10 08:25:56.804+00	2026-03-10 09:18:57.811+00	cjlozanop01	t
1066	14	1	2026-03-10 09:16:20.238+00	2026-03-10 10:38:29.825+00	lmoralesg04	t
1067	14	1	2026-03-10 10:42:32.47+00	2026-03-10 11:33:37.006+00	omsanchezg01	t
1068	77	1	2026-03-10 10:47:02.133+00	2026-03-10 11:36:02.844+00	jjmorcillor01	t
1065	83	1	2026-03-10 08:31:57.951+00	2026-03-10 11:49:42.247+00	amsanchezs01	t
1072	41	1	2026-03-10 11:35:38.924+00	2026-03-10 12:28:34.417+00	jjmorcillor01	t
1070	14	1	2026-03-10 11:31:02.345+00	2026-03-10 12:28:38.975+00	lmoralesg04	t
1071	43	1	2026-03-10 11:34:22.47+00	2026-03-10 12:28:44.935+00	lpcamarac01	t
1069	45	1	2026-03-10 11:30:34.981+00	2026-03-10 12:29:46.528+00	mtmarting03	t
1073	14	1	2026-03-11 07:35:15.569+00	2026-03-11 09:17:34.987+00	mtmarting03	t
1075	67	1	2026-03-11 09:20:24.166+00	2026-03-11 10:14:43.464+00	mtcerezog01	t
1074	45	1	2026-03-11 09:17:27.023+00	2026-03-11 10:17:48.109+00	pagarciam27	t
1076	67	1	2026-03-11 09:56:16.57+00	2026-03-11 10:46:46.895+00	rencinasr02	t
1077	67	1	2026-03-11 10:48:49.556+00	2026-03-11 11:32:36.224+00	nmaciasp02	t
1078	41	1	2026-03-11 11:34:08.122+00	2026-03-11 12:28:45.498+00	mgperezr02	t
1079	14	1	2026-03-11 12:29:08.742+00	2026-03-11 13:20:17.803+00	omsanchezg01	t
1082	41	1	2026-03-12 09:22:17.278+00	2026-03-12 10:17:37.167+00	lpcamarac01	t
1080	14	1	2026-03-12 07:31:38.089+00	2026-03-12 10:44:38.427+00	lmoralesg04	t
1084	42	1	2026-03-12 10:42:58.109+00	2026-03-12 11:11:48.084+00	bfernandezt07	t
1086	47	1	2026-03-12 10:50:24.236+00	2026-03-12 11:33:46.91+00	chisco	t
1085	22	1	2026-03-12 10:48:24.496+00	2026-03-12 11:33:55.255+00	jjmorcillor01	t
1083	41	1	2026-03-12 10:41:50.511+00	2026-03-12 11:35:09.798+00	mgperezr02	t
1087	45	1	2026-03-12 11:33:25.366+00	2026-03-12 12:54:42.259+00	celita2	t
1081	67	1	2026-03-12 08:36:38.846+00	2026-03-12 12:55:29.84+00	rencinasr02	t
1090	14	1	2026-03-13 07:33:43.895+00	2026-03-13 08:19:41.406+00	mtcerezog01	t
1089	45	1	2026-03-13 07:33:30.932+00	2026-03-13 08:22:13.5+00	omsanchezg01	t
1088	41	1	2026-03-13 07:28:45.16+00	2026-03-13 08:23:45.44+00	mebravom01	t
1092	22	1	2026-03-13 08:22:57.877+00	2026-03-13 09:20:36.193+00	jjmorcillor01	t
1097	45	1	2026-03-13 09:29:42.355+00	2026-03-13 10:11:48.985+00	vpalaciosg06	t
1095	22	1	2026-03-13 09:23:27.705+00	2026-03-13 10:11:54.399+00	mtcerezog01	t
1093	14	1	2026-03-13 09:18:03.443+00	2026-03-13 10:37:56.63+00	omsanchezg01	t
1094	41	1	2026-03-13 09:18:32.13+00	2026-03-13 10:38:02.237+00	egonzalezh18	t
1096	67	1	2026-03-13 09:25:25.952+00	2026-03-13 10:44:07.989+00	rencinasr02	t
1099	45	1	2026-03-13 11:33:55.393+00	2026-03-13 12:30:32.024+00	lpcamarac01	t
1091	17	1	2026-03-13 07:34:41.738+00	2026-03-13 13:26:54.538+00	mgperezr02	t
1098	14	1	2026-03-13 10:44:54.597+00	2026-03-13 11:34:14.997+00	mrcarmonav01	t
1101	41	1	2026-03-13 11:35:51.919+00	2026-03-13 12:26:30.495+00	jjmorcillor01	t
1100	30	1	2026-03-13 11:35:34.322+00	2026-03-13 12:44:43.784+00	dnarcisoc01	t
1103	67	1	2026-03-13 12:28:36.993+00	2026-03-13 13:19:21.265+00	mtcerezog01	t
1104	19	1	2026-03-16 08:29:16.919+00	2026-03-16 08:36:11.588+00	chisco	t
1105	22	1	2026-03-16 09:17:56.834+00	2026-03-16 10:12:56.142+00	jjmorcillor01	t
1107	41	1	2026-03-16 10:45:02.33+00	2026-03-16 11:34:38.576+00	mgperezr02	t
1106	14	1	2026-03-16 10:41:16.384+00	2026-03-16 13:11:13.196+00	mtmarting03	t
1108	43	1	2026-03-16 12:26:07.037+00	2026-03-16 13:21:29.319+00	lpcamarac01	t
1109	45	1	2026-03-17 07:32:05.45+00	2026-03-17 07:58:49.402+00	afloresc27	t
1110	42	1	2026-03-17 07:37:58.701+00	2026-03-17 08:15:04.709+00	igomezc12	t
1111	61	1	2026-03-17 08:27:06.357+00	2026-03-17 09:16:45.902+00	egonzalezh18	t
1112	45	1	2026-03-17 08:27:58.999+00	2026-03-17 09:18:44.236+00	cjlozanop01	t
1114	61	1	2026-03-17 09:16:58.851+00	2026-03-17 09:23:42.377+00	amfajardol01	t
1118	22	1	2026-03-17 10:01:03.778+00	2026-03-17 10:01:11.733+00	pagarciam27	t
1117	67	1	2026-03-17 09:23:31.419+00	2026-03-17 10:12:20.768+00	omsanchezg01	t
1115	41	1	2026-03-17 09:17:25.732+00	2026-03-17 10:12:32.351+00	egonzalezh18	t
1113	43	1	2026-03-17 09:16:11.443+00	2026-03-17 10:26:47.508+00	lpcamarac01	t
1116	14	1	2026-03-17 09:20:13.024+00	2026-03-17 10:44:34.196+00	lmoralesg04	t
1121	61	1	2026-03-17 10:45:18.643+00	2026-03-17 11:31:38.773+00	bcrespoc01	t
1120	14	1	2026-03-17 10:44:49.208+00	2026-03-17 11:33:31.037+00	omsanchezg01	t
1119	22	1	2026-03-17 10:09:55.376+00	2026-03-17 11:42:04.181+00	cjlozanop01	t
1123	41	1	2026-03-17 11:32:07.128+00	2026-03-17 12:11:53.421+00	lpcamarac01	t
1125	14	1	2026-03-17 11:33:09.393+00	2026-03-17 12:25:33.184+00	lmoralesg04	t
1124	43	1	2026-03-17 11:32:36.755+00	2026-03-17 12:26:14.831+00	ilozano1977	t
1122	45	1	2026-03-17 11:25:42.785+00	2026-03-17 12:26:46.609+00	mtmarting03	t
1126	41	1	2026-03-17 12:31:34.83+00	2026-03-17 13:20:07.732+00	omsanchezg01	t
1128	43	1	2026-03-18 07:31:59.086+00	2026-03-18 08:23:43.167+00	sromang06	t
1127	14	1	2026-03-18 07:29:55.783+00	2026-03-18 09:19:30.833+00	mtmarting03	t
1130	41	1	2026-03-18 08:23:17.547+00	2026-03-18 09:19:41.291+00	ilozano1977	t
1131	14	1	2026-03-18 09:21:48.125+00	2026-03-18 10:09:08.584+00	mtcerezog01	t
1132	45	1	2026-03-18 09:25:30.887+00	2026-03-18 10:24:49.499+00	bfernandezt07	t
1133	43	1	2026-03-18 10:43:27.7+00	2026-03-18 11:31:59.751+00	sromang06	t
1134	14	1	2026-03-18 10:43:41.966+00	2026-03-18 11:51:09.042+00	mtmarting03	t
1135	41	1	2026-03-18 11:33:38.687+00	2026-03-18 12:52:17.103+00	mgperezr02	t
1137	14	1	2026-03-18 12:26:51.546+00	2026-03-18 13:20:57.689+00	omsanchezg01	t
1138	45	1	2026-03-18 12:52:05.747+00	2026-03-18 13:21:08.166+00	mrcarmonav01	t
1129	85	1	2026-03-18 07:33:45.26+00	2026-03-18 13:24:47.805+00	chisco	t
1141	22	1	2026-03-19 07:55:30.572+00	2026-03-19 09:20:47.624+00	mapavonb01	t
1140	43	1	2026-03-19 07:33:00.926+00	2026-03-19 09:21:44.456+00	ilozano1977	t
1139	14	1	2026-03-19 07:29:43.593+00	2026-03-19 09:28:18.137+00	lmoralesg04	t
1146	41	1	2026-03-19 09:22:01.306+00	2026-03-19 10:10:58.438+00	ilozano1977	t
1143	43	1	2026-03-19 09:17:55.965+00	2026-03-19 10:11:12.888+00	cblancoa02	t
1136	22	1	2026-03-18 11:41:11.307+00	2026-03-19 10:11:25.926+00	mapavonb01	t
1145	22	1	2026-03-19 09:21:05.754+00	2026-03-19 10:12:36.779+00	mapavonb01	t
1144	14	1	2026-03-19 09:18:25.066+00	2026-03-19 10:18:55.526+00	mtcerezog01	t
1102	41	1	2026-03-13 12:16:10.43+00	2026-03-19 10:53:04.732+00	mebravom01	t
1147	22	1	2026-03-19 10:47:33.04+00	2026-03-19 13:04:14.659+00	jjmorcillor01	t
1148	43	1	2026-03-19 10:48:08.019+00	2026-03-19 13:04:14.659+00	cblancoa02	t
1151	41	1	2026-03-19 12:26:05.647+00	2026-03-19 13:20:19.508+00	dmatasr01	t
1149	30	1	2026-03-19 11:35:32.093+00	2026-03-19 13:21:02.539+00	rmvegac01	t
1150	43	1	2026-03-19 12:25:55.474+00	2026-03-19 13:21:46.728+00	afloresc27	t
1142	45	1	2026-03-19 08:22:17.141+00	2026-03-20 07:40:57.668+00	lpcamarac01	t
1152	14	1	2026-03-20 07:40:15.26+00	2026-03-20 08:30:26.364+00	mtcerezog01	t
1153	45	1	2026-03-20 07:40:42.688+00	2026-03-20 09:21:27.845+00	omsanchezg01	t
1155	45	1	2026-03-20 09:19:32.768+00	2026-03-20 10:12:27.655+00	vpalaciosg06	t
1157	14	1	2026-03-20 09:27:15.05+00	2026-03-20 10:43:54.756+00	cblancoa02	t
1154	30	1	2026-03-20 09:17:05.762+00	2026-03-20 10:43:58.904+00	mssalomonp02	t
1156	67	1	2026-03-20 09:21:40.155+00	2026-03-20 11:31:22.619+00	omsanchezg01	t
1162	14	1	2026-03-20 11:35:44.639+00	2026-03-20 12:23:58.655+00	dmatasr01	t
1161	45	1	2026-03-20 11:33:57.959+00	2026-03-20 12:24:02.056+00	lpcamarac01	t
1160	41	1	2026-03-20 11:32:42.3+00	2026-03-20 12:26:52.265+00	jjmorcillor01	t
1159	43	1	2026-03-20 11:31:53.884+00	2026-03-20 12:28:07.732+00	sromang06	t
1166	14	1	2026-03-20 12:36:17.348+00	2026-03-20 13:18:25.508+00	vpalaciosg06	t
1165	41	1	2026-03-20 12:30:01.271+00	2026-03-20 13:18:33.513+00	egonzalezh18	t
1158	22	1	2026-03-20 10:47:15.23+00	2026-03-20 13:18:44.357+00	mgranadob01	t
1163	45	1	2026-03-20 12:24:44.439+00	2026-03-20 13:19:58.243+00	emparrag02	t
1164	67	1	2026-03-20 12:27:55.002+00	2026-03-20 13:20:19.058+00	mtcerezog01	t
1167	43	1	2026-03-23 08:22:47.947+00	2026-03-23 09:19:31.901+00	mafloresm01	t
1169	41	1	2026-03-23 08:25:24.054+00	2026-03-23 09:19:36.917+00	egonzalezh18	t
1168	14	1	2026-03-23 08:24:22.161+00	2026-03-23 09:19:41.693+00	omsanchezg01	t
1170	41	1	2026-03-23 10:43:52.899+00	2026-03-23 11:36:04.199+00	mgperezr02	t
1172	41	1	2026-03-23 11:36:14.626+00	2026-03-23 12:43:35.786+00	omsanchezg01	t
1171	14	1	2026-03-23 10:51:13.365+00	2026-03-23 13:24:52.406+00	mtmarting03	t
1173	45	1	2026-03-24 07:28:09.085+00	2026-03-24 08:32:39.991+00	rencinasr02	t
1177	67	1	2026-03-24 09:25:12.843+00	2026-03-24 10:09:50.587+00	omsanchezg01	t
1178	43	1	2026-03-24 09:25:33.982+00	2026-03-24 10:16:32.945+00	celita2	t
1175	71	1	2026-03-24 08:52:36.093+00	2026-03-24 10:17:04.875+00	chisco	t
1174	74	1	2026-03-24 08:52:24.032+00	2026-03-24 10:17:07.739+00	chisco	t
1176	14	1	2026-03-24 09:17:32.165+00	2026-03-24 10:44:54.707+00	lmoralesg04	t
1179	67	1	2026-03-24 10:55:30.37+00	\N	pety78	f
1180	14	1	2026-03-24 11:32:44.952+00	\N	lmoralesg04	f
1181	43	1	2026-03-24 11:34:22.739+00	\N	lpcamarac01	f
\.


--
-- Data for Name: reservas_estancias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas_estancias (id, idestancia, idperiodo_inicio, idperiodo_fin, uid, fecha, descripcion, idrepeticion) FROM stdin;
129100	14	1	1	emurielb76	2025-09-08	MAITE	989
129101	45	2	2	emurielb76	2025-09-08	Intel. Artif. 1º Bach. Miguel	1022
129102	8	2	2	emurielb76	2025-09-08	Biología NB 1º ESO A Alba Fajardo	958
129103	62	2	2	emurielb76	2025-09-08	Mates NB 2º ESO A Raquel	962
129104	22	3	3	emurielb76	2025-09-08	Latín 1º Bach. Juan José	993
129105	42	3	5	emurielb76	2025-09-08	2º GS Optativa. Rosa	1007
129106	14	3	3	emurielb76	2025-09-08	MAITE	990
129107	8	3	3	emurielb76	2025-09-08	Refuerzo Lengua 1º ESO A/B Maribel	960
129108	43	3	3	emurielb76	2025-09-08	Economía 1º Bach. Cristina Blanco	981
129109	45	3	3	emurielb76	2025-09-08	Digit. Básica 1º ESO A/B Miguel	\N
129110	22	4	4	emurielb76	2025-09-08	Atendida por Carlos	996
129111	22	5	5	emurielb76	2025-09-08	Atendida por Inma	1000
129112	63	5	5	emurielb76	2025-09-08	Biología 2º Bach Celia	1013
129113	45	5	5	emurielb76	2025-09-08	Digitalización 4º ESO A/B Miguel	1027
129114	14	6	6	emurielb76	2025-09-08	MAITE	991
129115	22	6	6	emurielb76	2025-09-08	Atendida por Matilde	1002
129116	63	6	6	emurielb76	2025-09-08	CC Grales 2º Bach Elena G.	1014
129117	55	6	6	emurielb76	2025-09-08	Economía 4º ESO Cristina Blanco	1018
129118	55	7	7	emurielb76	2025-09-08	Matem. A 4º ESO Raquel	969
129119	55	1	1	emurielb76	2025-09-09	Latín 4º B Juan José	970
129120	14	3	3	emurielb76	2025-09-09	Itin. Empl. 1º CFGB Luis	985
129121	55	3	3	emurielb76	2025-09-09	Matem. A 4º ESO Raquel	971
129122	45	3	3	emurielb76	2025-09-09	Intel. Artif. 1º Bach. Informática	\N
129123	22	4	4	emurielb76	2025-09-09	Atendida por Patricia	998
129124	45	5	5	emurielb76	2025-09-09	Unión Europea Jorge 4º ESO	1021
129125	43	5	5	emurielb76	2025-09-09	Econ. Empr. 1º Bach. Cristina Blanco	980
129126	22	5	5	emurielb76	2025-09-09	Latín 1º Bach. Juan José	994
129127	14	6	6	emurielb76	2025-09-09	Itin. Empl. 1º CFGB Luis	986
129128	62	6	6	emurielb76	2025-09-09	Refuerzo Lengua 2º ESO A/B Juan José	965
129129	40	6	6	emurielb76	2025-09-09	Biología 2º Bach Celia	1017
129130	22	6	6	emurielb76	2025-09-09	Atendida por Inma	1001
129131	63	6	6	emurielb76	2025-09-09	Refuerzo Mates 2º ESO A/B INFORM.	967
129132	14	7	7	emurielb76	2025-09-09	Hª Filosofía 2º Bach B Carlos	1020
129133	63	2	2	emurielb76	2025-09-10	Biología 2º Bach Celia	1011
129134	8	2	2	emurielb76	2025-09-10	Biología NB 1º ESO A Alba Fajardo	958
129135	62	2	2	emurielb76	2025-09-10	Mates NB 2º ESO A Raquel	962
129136	14	2	2	emurielb76	2025-09-10	MAITE	992
129137	45	2	2	emurielb76	2025-09-10	Intel. Artif. 1º Bach. Miguel	1022
129138	55	3	3	emurielb76	2025-09-10	Matem. A 4º ESO Raquel	971
129139	42	3	3	emurielb76	2025-09-10	1º GM Digitalización. Peti	1005
129140	22	4	4	emurielb76	2025-09-10	Atendida por Inma	999
129141	45	5	5	emurielb76	2025-09-10	Digit. Básica 1º ESO A/B Miguel	1024
129142	8	5	5	emurielb76	2025-09-10	Refuerzo Lengua 1º ESO A/B Maribel	961
129143	14	5	5	emurielb76	2025-09-10	MAITE	1036
129144	55	5	5	emurielb76	2025-09-10	Economía 4º ESO Cristina Blanco	1019
129145	63	5	5	emurielb76	2025-09-10	CC Grales 2º Bach Elena G.	1015
129146	43	6	6	emurielb76	2025-09-10	Economía 1º Bach. Cristina Blanco	982
129147	42	7	7	emurielb76	2025-09-10	1º GS Digitalización. Peti	1040
129148	14	1	1	emurielb76	2025-09-11	Itin. Empl. 1º CFGB Luis	987
129149	45	1	1	emurielb76	2025-09-11	Intel. Artif. 1º Bach. Informática	977
129150	14	2	2	emurielb76	2025-09-11	Itin. Empl. 1º CFGB Luis	988
129151	43	3	3	emurielb76	2025-09-11	Economía 1º Bach. Cristina Blanco	981
129152	63	3	3	emurielb76	2025-09-11	Refuerzo Mates 2º ESO A/B INFORM.	968
129153	62	3	3	emurielb76	2025-09-11	Refuerzo Lengua 2º ESO A/B Juan José	966
129154	22	4	4	emurielb76	2025-09-11	Atendida por Patricia	998
129155	43	5	5	emurielb76	2025-09-11	Econ. Empr. 1º Bach. Cristina Blanco	980
129156	45	5	5	emurielb76	2025-09-11	Digitalización 4º ESO A/B Miguel	1027
129157	22	5	5	emurielb76	2025-09-11	Latín 1º Bach. Juan José	994
129158	62	5	5	emurielb76	2025-09-11	Mates NB 2º ESO A Raquel	963
129159	55	6	6	emurielb76	2025-09-11	Latín 4º B Juan José	972
129160	63	6	6	emurielb76	2025-09-11	CC Grales 2º Bach Elena G.	1014
129161	14	7	7	emurielb76	2025-09-11	Hª Filosofía 2º Bach B Carlos	1020
129162	42	7	7	emurielb76	2025-09-11	2º GS Proyecto. Rosa	1009
129163	62	1	1	emurielb76	2025-09-12	Mates NB 2º ESO A Raquel	964
129164	22	2	2	emurielb76	2025-09-12	Latín 1º Bach. Juan José	995
129165	43	2	2	emurielb76	2025-09-12	Econ. Empr. 1º Bach. Cristina Blanco	983
129166	45	3	3	emurielb76	2025-09-12	1º Bach AE. Virginia	\N
129167	55	3	3	emurielb76	2025-09-12	Latín 4º B Juan José	973
129168	8	3	3	emurielb76	2025-09-12	Biología NB 1º ESO A Alba Fajardo	959
129169	22	4	4	emurielb76	2025-09-12	Atendida por Inma	999
129170	63	5	5	emurielb76	2025-09-12	Biología 2º Bach Celia	1012
129171	55	5	5	emurielb76	2025-09-12	Matem. A 4º ESO Raquel	974
129172	22	5	5	emurielb76	2025-09-12	Atendida por Matilde	1004
129173	63	6	6	emurielb76	2025-09-12	CC Grales 2º Bach Elena G.	1014
129174	55	6	6	emurielb76	2025-09-12	Economía 4º ESO Cristina Blanco	1018
129175	43	7	7	emurielb76	2025-09-12	Economía 1º Bach. Cristina Blanco	984
129176	14	7	7	emurielb76	2025-09-12	Hª Filosofía 2º Bach B Carlos	1020
129177	14	1	1	emurielb76	2025-09-15	MAITE	989
129178	45	2	2	emurielb76	2025-09-15	Intel. Artif. 1º Bach. Miguel	1022
129179	8	2	2	emurielb76	2025-09-15	Biología NB 1º ESO A Alba Fajardo	958
129180	62	2	2	emurielb76	2025-09-15	Mates NB 2º ESO A Raquel	962
129181	8	3	3	emurielb76	2025-09-15	Refuerzo Lengua 1º ESO A/B Maribel	960
129182	45	3	3	emurielb76	2025-09-15	Digit. Básica 1º ESO A/B Miguel	1023
129183	43	3	3	emurielb76	2025-09-15	Economía 1º Bach. Cristina Blanco	981
129184	22	3	3	emurielb76	2025-09-15	Latín 1º Bach. Juan José	993
129185	42	3	5	emurielb76	2025-09-15	2º GS Optativa. Rosa	1007
129186	14	3	3	emurielb76	2025-09-15	MAITE	990
129187	22	4	4	emurielb76	2025-09-15	Atendida por Carlos	996
129188	22	5	5	emurielb76	2025-09-15	Atendida por Inma	1000
129189	45	5	5	amfajardol01	2025-09-15	Alba FPB	\N
129190	63	5	5	emurielb76	2025-09-15	Biología 2º Bach Celia	1013
129191	55	6	6	emurielb76	2025-09-15	Economía 4º ESO Cristina Blanco	1018
129192	41	6	6	dmatasr01	2025-09-15	David Matas	\N
129193	14	6	6	emurielb76	2025-09-15	MAITE	991
129194	63	6	6	emurielb76	2025-09-15	CC Grales 2º Bach Elena G.	1014
129195	22	6	6	emurielb76	2025-09-15	Atendida por Matilde	1002
129196	55	7	7	emurielb76	2025-09-15	Matem. A 4º ESO Raquel	969
129197	55	1	1	emurielb76	2025-09-16	Latín 4º B Juan José	970
129198	55	3	3	emurielb76	2025-09-16	Matem. A 4º ESO Raquel	971
129199	14	3	3	emurielb76	2025-09-16	Itin. Empl. 1º CFGB Luis	985
129200	22	4	4	emurielb76	2025-09-16	Atendida por Patricia	998
129201	22	5	5	emurielb76	2025-09-16	Latín 1º Bach. Juan José	994
129202	41	5	5	omsanchezg01	2025-09-16	OLGA 3º DIVER	\N
129203	43	5	5	emurielb76	2025-09-16	Econ. Empr. 1º Bach. Cristina Blanco	980
129204	45	5	5	emurielb76	2025-09-16	Unión Europea Jorge 4º ESO	1021
129205	22	6	6	emurielb76	2025-09-16	Atendida por Inma	1001
129206	63	6	6	emurielb76	2025-09-16	Refuerzo Mates 2º ESO A/B INFORM.	967
129207	14	6	6	emurielb76	2025-09-16	Itin. Empl. 1º CFGB Luis	986
129208	62	6	6	emurielb76	2025-09-16	Refuerzo Lengua 2º ESO A/B Juan José	965
129209	40	6	6	emurielb76	2025-09-16	Biología 2º Bach Celia	1017
129210	14	7	7	emurielb76	2025-09-16	Hª Filosofía 2º Bach B Carlos	1020
129211	41	1	1	mdcpalaciosr01	2025-09-17	AMBITO PRACTICO 4º DIVER	\N
129212	45	2	2	emurielb76	2025-09-17	Intel. Artif. 1º Bach. Miguel	1022
129213	14	2	2	emurielb76	2025-09-17	MAITE	992
129214	8	2	2	emurielb76	2025-09-17	Biología NB 1º ESO A Alba Fajardo	958
129215	62	2	2	emurielb76	2025-09-17	Mates NB 2º ESO A Raquel	962
129216	42	2	2	dnarcisoc01	2025-09-17	Lola. 2º GM ADO	\N
129217	63	2	2	celita2	2025-09-17	CELIA 2º BACH	\N
129218	41	2	2	mdcpalaciosr01	2025-09-17	AMBITO PRACTICO 3º DIVER	\N
129219	42	3	3	emurielb76	2025-09-17	1º GM Digitalización. Peti	1005
129220	55	3	3	emurielb76	2025-09-17	Matem. A 4º ESO Raquel	971
129221	41	3	3	omsanchezg01	2025-09-17	Ámbito Científico 4º Diver	\N
129222	22	4	4	emurielb76	2025-09-17	Atendida por Inma	999
129223	63	5	5	egonzalezh18	2025-09-17	Elena 2º Bachillerato CCGG	\N
129224	45	5	5	emurielb76	2025-09-17	Digit. Básica 1º ESO A/B Miguel	1024
129225	8	5	5	emurielb76	2025-09-17	Refuerzo Lengua 1º ESO A/B Maribel	961
129226	14	5	5	emurielb76	2025-09-17	MAITE	1036
129227	55	5	5	emurielb76	2025-09-17	Economía 4º ESO Cristina Blanco	1019
129228	41	5	5	dmatasr01	2025-09-17	Tecnología 4ºB David Matas	\N
129229	43	6	6	emurielb76	2025-09-17	Economía 1º Bach. Cristina Blanco	982
129230	41	6	6	mgperezr02	2025-09-17	Grani. Formación y Orientación	\N
129231	42	7	7	emurielb76	2025-09-17	1º GS Digitalización. Peti	1040
129232	45	1	1	emurielb76	2025-09-18	Intel. Artif. 1º Bach. Informática	977
129233	47	1	7	emurielb76	2025-09-18	Itin. Empl.  Luis	\N
129234	41	1	1	omsanchezg01	2025-09-18	OLGA 4º DIVER	\N
129235	14	1	1	emurielb76	2025-09-18	Itin. Empl. 1º CFGB Luis	987
129236	14	2	2	emurielb76	2025-09-18	Itin. Empl. 1º CFGB Luis	988
129237	45	2	2	micostad01	2025-09-18	MARIBEL COSTA	\N
129238	63	3	3	emurielb76	2025-09-18	Refuerzo Mates 2º ESO A/B INFORM.	968
129239	43	3	3	emurielb76	2025-09-18	Economía 1º Bach. Cristina Blanco	981
129240	62	3	3	emurielb76	2025-09-18	Refuerzo Lengua 2º ESO A/B Juan José	966
129241	55	3	3	cjlozanop01	2025-09-18	Carlos J. Lozano	\N
129242	22	4	4	emurielb76	2025-09-18	Atendida por Patricia	998
129243	67	4	5	emurielb76	2025-09-18	Equipo directivo	\N
129244	14	5	5	omsanchezg01	2025-09-18	OLGA 3º DIVER	\N
129245	43	5	5	emurielb76	2025-09-18	Econ. Empr. 1º Bach. Cristina Blanco	980
129246	62	5	5	emurielb76	2025-09-18	Mates NB 2º ESO A Raquel	963
129247	41	5	5	mgperezr02	2025-09-18	Grani. Formación y Orientación	\N
129248	22	5	5	emurielb76	2025-09-18	Latín 1º Bach. Juan José	994
129249	45	5	5	emurielb76	2025-09-18	Digitalización 4º ESO A/B Miguel	1027
129250	63	6	6	egonzalezh18	2025-09-18	Elena 2º Bachillerato CCGG	\N
129251	45	6	6	celita2	2025-09-18	CELIA 1º ESO	\N
129252	55	6	6	emurielb76	2025-09-18	Latín 4º B Juan José	972
129253	43	6	6	celita2	2025-09-18	CELIA 1º ESO	\N
129254	42	7	7	emurielb76	2025-09-18	2º GS Proyecto. Rosa	1009
129255	14	7	7	emurielb76	2025-09-18	Hª Filosofía 2º Bach B Carlos	1020
129256	62	1	1	emurielb76	2025-09-19	Mates NB 2º ESO A Raquel	964
129257	42	1	1	isabel22	2025-09-19	Isabel Panadero	\N
129258	67	2	2	isabel22	2025-09-19	Isabel Panadero	\N
129259	43	2	2	emurielb76	2025-09-19	Econ. Empr. 1º Bach. Cristina Blanco	983
129260	41	2	2	mdcpalaciosr01	2025-09-19	AMBITO PRACTICO 4º DIVER	\N
129261	22	2	2	emurielb76	2025-09-19	Latín 1º Bach. Juan José	995
129262	41	3	3	omsanchezg01	2025-09-19	OLGA 3º DIVER	\N
129263	55	3	3	emurielb76	2025-09-19	Latín 4º B Juan José	973
129264	8	3	3	emurielb76	2025-09-19	Biología NB 1º ESO A Alba Fajardo	959
129265	67	3	5	isabel22	2025-09-19	Isabel Panadero	\N
129266	22	4	4	emurielb76	2025-09-19	Atendida por Inma	999
129267	45	5	5	micostad01	2025-09-19	MARIBEL COSTA	\N
129268	63	5	5	celita2	2025-09-19	CELIA 2º BACH	\N
129269	22	5	5	emurielb76	2025-09-19	Atendida por Matilde	1004
129270	55	5	5	emurielb76	2025-09-19	Matem. A 4º ESO Raquel	974
129271	63	6	6	egonzalezh18	2025-09-19	Elena 2º Bachillerato CCGG	\N
129272	45	6	6	micostad01	2025-09-19	MARIBEL COSTA	\N
129273	43	6	6	dmatasr01	2025-09-19	David Matas	\N
129274	41	6	6	omsanchezg01	2025-09-19	OLGA 4º DIVER	\N
129275	55	6	6	emurielb76	2025-09-19	Economía 4º ESO Cristina Blanco	1018
129276	41	7	7	pagarciam27	2025-09-19	Patricia 2ºESO	\N
129277	14	7	7	emurielb76	2025-09-19	Hª Filosofía 2º Bach B Carlos	1020
129278	43	7	7	emurielb76	2025-09-19	Economía 1º Bach. Cristina Blanco	984
129279	43	1	1	amfajardol01	2025-09-22	Alba FPB	\N
129280	14	1	1	emurielb76	2025-09-22	MAITE	989
129281	8	2	2	emurielb76	2025-09-22	Biología NB 1º ESO A Alba Fajardo	958
129282	62	2	2	emurielb76	2025-09-22	Mates NB 2º ESO A Raquel	962
129283	45	2	2	emurielb76	2025-09-22	Intel. Artif. 1º Bach. Miguel	1022
129284	42	2	2	isabel22	2025-09-22	isabel panadero	\N
129285	43	3	3	emurielb76	2025-09-22	Economía 1º Bach. Cristina Blanco	981
129286	22	3	3	emurielb76	2025-09-22	Latín 1º Bach. Juan José	993
129287	14	3	3	emurielb76	2025-09-22	MAITE	990
129288	42	3	5	emurielb76	2025-09-22	2º GS Optativa. Rosa	1007
129289	8	3	3	emurielb76	2025-09-22	Refuerzo Lengua 1º ESO A/B Maribel	960
129290	45	3	3	emurielb76	2025-09-22	Digit. Básica 1º ESO A/B Miguel	1023
129291	22	4	4	emurielb76	2025-09-22	Atendida por Carlos	996
129292	45	5	5	emurielb76	2025-09-22	Digitalización 4º ESO A/B Miguel	1026
129293	22	5	5	emurielb76	2025-09-22	Atendida por Inma	1000
129294	67	5	5	isabel22	2025-09-22	Isabel Panadero	\N
129295	63	5	5	emurielb76	2025-09-22	Biología 2º Bach Celia	1013
129296	41	5	5	mgperezr02	2025-09-22	Grani. Formación y Orientación	\N
129297	43	5	5	emurielb76	2025-09-22	Maribel  2º ESO A	\N
129298	14	6	6	emurielb76	2025-09-22	MAITE	991
129299	55	6	6	emurielb76	2025-09-22	Economía 4º ESO Cristina Blanco	1018
129300	42	6	7	rmvegac01	2025-09-22	DCM	\N
129301	22	6	6	emurielb76	2025-09-22	Atendida por Matilde	1002
129302	63	6	6	egonzalezh18	2025-09-22	Elena 2º Bachillerato CCGG	\N
129303	41	6	6	dmatasr01	2025-09-22	David Matas	\N
129304	45	7	7	emurielb76	2025-09-22	TyD 2º ESO B Miguel	1028
129305	43	7	7	micostad01	2025-09-22	MARIBEL COSTA	\N
129306	55	7	7	emurielb76	2025-09-22	Matem. A 4º ESO Raquel	969
129307	41	7	7	omsanchezg01	2025-09-22	OLGA 4º DIVER	\N
129308	55	1	1	emurielb76	2025-09-23	Latín 4º B Juan José	970
129309	55	3	3	emurielb76	2025-09-23	Matem. A 4º ESO Raquel	971
129310	14	3	3	emurielb76	2025-09-23	Itin. Empl. 1º CFGB Luis	985
129311	45	3	3	emurielb76	2025-09-23	Intel. Artif. 1º Bach. Miguel	1029
129312	22	4	4	emurielb76	2025-09-23	Atendida por Patricia	998
129313	22	5	5	emurielb76	2025-09-23	Latín 1º Bach. Juan José	994
129314	41	5	5	pagarciam27	2025-09-23	Patricia TAE	\N
129315	67	5	5	jjmorcillor01	2025-09-23	Juan José	\N
129316	45	5	5	emurielb76	2025-09-23	Unión Europea Jorge 4º ESO	1021
129317	43	5	5	emurielb76	2025-09-23	Econ. Empr. 1º Bach. Cristina Blanco	980
129318	63	6	6	emurielb76	2025-09-23	Refuerzo Mates 2º ESO A/B INFORM.	967
129319	14	6	6	emurielb76	2025-09-23	Itin. Empl. 1º CFGB Luis	986
129320	62	6	6	emurielb76	2025-09-23	Refuerzo Lengua 2º ESO A/B Juan José	965
129321	40	6	6	emurielb76	2025-09-23	Biología 2º Bach Celia	1017
129322	22	6	6	emurielb76	2025-09-23	Atendida por Inma	1001
129323	14	7	7	emurielb76	2025-09-23	Hª Filosofía 2º Bach B Carlos	1020
129324	42	1	1	rmvegac01	2025-09-24	DCM	\N
129325	45	1	1	emurielb76	2025-09-24	TyD  2º ESO A Miguel	1030
129326	41	1	1	mdcpalaciosr01	2025-09-24	AMBITO PRACTICO 4º DIVER	\N
129327	41	2	2	mdcpalaciosr01	2025-09-24	AMBITO PRACTICO 3º DIVER	\N
129328	45	2	2	emurielb76	2025-09-24	Intel. Artif. 1º Bach. Miguel	1022
129329	8	2	2	emurielb76	2025-09-24	Biología NB 1º ESO A Alba Fajardo	958
129330	62	2	2	emurielb76	2025-09-24	Mates NB 2º ESO A Raquel	962
129331	63	2	2	emurielb76	2025-09-24	Biología 2º Bach Celia	1011
129332	14	2	2	emurielb76	2025-09-24	MAITE	992
129333	55	3	3	emurielb76	2025-09-24	Matem. A 4º ESO Raquel	971
129334	67	3	3	rmvegac01	2025-09-24	PROYECTO	\N
129335	42	3	3	emurielb76	2025-09-24	1º GM Digitalización. Peti	1005
129336	22	4	4	emurielb76	2025-09-24	Atendida por Inma	999
129337	63	5	5	emurielb76	2025-09-24	CC Grales 2º Bach Elena G.	1015
129338	45	5	5	emurielb76	2025-09-24	Digit. Básica 1º ESO A/B Miguel	1024
129339	8	5	5	emurielb76	2025-09-24	Refuerzo Lengua 1º ESO A/B Maribel	961
129340	14	5	5	emurielb76	2025-09-24	MAITE	1036
129341	55	5	5	emurielb76	2025-09-24	Economía 4º ESO Cristina Blanco	1019
129342	41	5	5	dmatasr01	2025-09-24	David Matas	\N
129343	67	6	7	rmvegac01	2025-09-24	IFAM	\N
129344	41	6	6	mgperezr02	2025-09-24	Grani. Formación y Orientación	\N
129345	45	6	6	emurielb76	2025-09-24	Digitalización 4º ESO A/B Miguel	1031
129346	43	6	6	emurielb76	2025-09-24	Economía 1º Bach. Cristina Blanco	982
129347	41	7	7	omsanchezg01	2025-09-24	OLGA 3º DIVER	\N
129348	42	7	7	emurielb76	2025-09-24	1º GS Digitalización. Peti	1040
129349	14	1	1	emurielb76	2025-09-25	Itin. Empl. 1º CFGB Luis	987
129350	45	1	1	emurielb76	2025-09-25	Intel. Artif. 1º Bach. Informática	977
129351	42	1	1	ndelorzac02	2025-09-25	nieves	\N
129352	43	2	2	pagarciam27	2025-09-25	Patricia TAE	\N
129353	42	2	2	efranciscor01	2025-09-25	2 Grado Medio	\N
129354	41	2	2	celita2	2025-09-25	CELIA 1º ESO	\N
129355	14	2	2	emurielb76	2025-09-25	Itin. Empl. 1º CFGB Luis	988
129356	62	3	3	emurielb76	2025-09-25	Refuerzo Lengua 2º ESO A/B Juan José	966
129357	43	3	3	emurielb76	2025-09-25	Economía 1º Bach. Cristina Blanco	981
129358	63	3	3	emurielb76	2025-09-25	Refuerzo Mates 2º ESO A/B INFORM.	968
129359	22	4	4	emurielb76	2025-09-25	Atendida por Patricia	998
129360	22	5	5	emurielb76	2025-09-25	Latín 1º Bach. Juan José	994
129361	62	5	5	emurielb76	2025-09-25	Mates NB 2º ESO A Raquel	963
129362	43	5	5	emurielb76	2025-09-25	Econ. Empr. 1º Bach. Cristina Blanco	980
129363	45	5	5	emurielb76	2025-09-25	Digitalización 4º ESO A/B Miguel	1026
129364	42	5	5	isabel22	2025-09-25	isabel panadero	\N
129365	41	5	5	mgperezr02	2025-09-25	Grani. Formación y Orientación	\N
129366	14	5	5	mahernandezr06	2025-09-25	Digitalización 4°	\N
129367	67	6	6	rmvegac01	2025-09-25	DCM	\N
129368	63	6	6	egonzalezh18	2025-09-25	Elena 2º Bachillerato CCGG	\N
129369	55	6	6	emurielb76	2025-09-25	Latín 4º B Juan José	972
129370	42	6	6	ndelorzac02	2025-09-25	Nieves	\N
129371	42	7	7	emurielb76	2025-09-25	2º GS Proyecto. Rosa	1009
129372	67	7	7	dnarcisoc01	2025-09-25	LOLA 1ºGS APSI	\N
129373	14	7	7	emurielb76	2025-09-25	Hª Filosofía 2º Bach B Carlos	1020
129374	43	7	7	ndelorzac02	2025-09-25	Nieves	\N
129375	45	7	7	emurielb76	2025-09-25	TyD 2º ESO B Miguel	1028
129376	42	1	1	rmvegac01	2025-09-26	DCM	\N
129377	62	1	1	emurielb76	2025-09-26	Mates NB 2º ESO A Raquel	964
129378	22	2	2	emurielb76	2025-09-26	Latín 1º Bach. Juan José	995
129379	43	2	2	emurielb76	2025-09-26	Econ. Empr. 1º Bach. Cristina Blanco	983
129380	8	3	3	emurielb76	2025-09-26	Biología NB 1º ESO A Alba Fajardo	959
129381	43	3	3	emurielb76	2025-09-26	1º Bach AE. Virginia	\N
129382	55	3	3	emurielb76	2025-09-26	Latín 4º B Juan José	973
129383	22	4	4	emurielb76	2025-09-26	Atendida por Inma	999
129384	45	5	5	emurielb76	2025-09-26	TyD  2º ESO A Miguel	1032
129385	22	5	5	emurielb76	2025-09-26	Atendida por Matilde	1004
129386	43	5	5	micostad01	2025-09-26	MARIBEL COSTA	\N
129387	55	5	5	emurielb76	2025-09-26	Matem. A 4º ESO Raquel	974
129388	42	5	5	rmvegac01	2025-09-26	DCM	\N
129389	63	5	5	emurielb76	2025-09-26	Biología 2º Bach Celia	1012
129390	67	5	5	ndelorzac02	2025-09-26	Nieves	\N
129391	55	6	6	emurielb76	2025-09-26	Economía 4º ESO Cristina Blanco	1018
129392	43	6	6	micostad01	2025-09-26	MARIBEL COSTA	\N
129393	41	6	6	dmatasr01	2025-09-26	David Matas	\N
129394	63	6	6	egonzalezh18	2025-09-26	Elena 2º Bachillerato CCGG	\N
129395	41	7	7	pagarciam27	2025-09-26	Patricia 2ºESO	\N
129396	14	7	7	emurielb76	2025-09-26	Hª Filosofía 2º Bach B Carlos	1020
129397	43	7	7	emurielb76	2025-09-26	Economía 1º Bach. Cristina Blanco	984
129398	14	1	1	emurielb76	2025-09-29	MAITE	989
129399	8	2	2	emurielb76	2025-09-29	Biología NB 1º ESO A Alba Fajardo	958
129400	62	2	2	emurielb76	2025-09-29	Mates NB 2º ESO A Raquel	962
129401	45	2	2	emurielb76	2025-09-29	Intel. Artif. 1º Bach. Miguel	1022
129402	22	3	3	emurielb76	2025-09-29	Latín 1º Bach. Juan José	993
129403	14	3	3	emurielb76	2025-09-29	MAITE	990
129404	42	3	5	emurielb76	2025-09-29	2º GS Optativa. Rosa	1007
129405	43	3	3	emurielb76	2025-09-29	Economía 1º Bach. Cristina Blanco	981
129406	8	3	3	emurielb76	2025-09-29	Refuerzo Lengua 1º ESO A/B Maribel	960
129407	45	3	3	emurielb76	2025-09-29	Digit. Básica 1º ESO A/B Miguel	1023
129408	30	3	3	bcrespoc01	2025-09-29	AAP	\N
129409	22	4	4	emurielb76	2025-09-29	Atendida por Carlos	996
129410	63	5	5	emurielb76	2025-09-29	Biología 2º Bach Celia	1013
129411	43	5	5	micostad01	2025-09-29	MARIBEL COSTA	\N
129412	45	5	5	emurielb76	2025-09-29	Digitalización 4º ESO A/B Miguel	1027
129413	67	5	5	dnarcisoc01	2025-09-29	Lola ADO	\N
129414	22	5	5	emurielb76	2025-09-29	Atendida por Inma	1000
129415	41	5	5	mgperezr02	2025-09-29	FOPP. Grani	\N
129416	22	6	6	emurielb76	2025-09-29	Atendida por Matilde	1002
129417	67	6	6	dmatasr01	2025-09-29	David Matas	\N
129418	63	6	6	emurielb76	2025-09-29	CC Grales 2º Bach Elena G.	1014
129419	55	6	6	emurielb76	2025-09-29	Economía 4º ESO Cristina Blanco	1018
129420	41	6	6	dmatasr01	2025-09-29	David Matas	\N
129421	14	6	6	emurielb76	2025-09-29	MAITE	991
129422	41	7	7	dnarcisoc01	2025-09-29	LOLA APC	\N
129423	55	7	7	emurielb76	2025-09-29	Matem. A 4º ESO Raquel	969
129424	45	7	7	emurielb76	2025-09-29	TyD 2º ESO B Miguel	1028
129425	43	7	7	micostad01	2025-09-29	MARIBEL COSTA	\N
129426	42	7	7	rmvegac01	2025-09-29	DCM	\N
129427	55	1	1	emurielb76	2025-09-30	Latín 4º B Juan José	970
129428	42	1	1	emurielb76	2025-09-30	Elena Muriel 1º GM	\N
129429	45	3	3	emurielb76	2025-09-30	Intel. Artif. 1º Bach. Miguel	1029
129430	42	3	3	pety78	2025-09-30	Pety	\N
129431	55	3	3	emurielb76	2025-09-30	Matem. A 4º ESO Raquel	971
129432	67	3	5	ndelorzac02	2025-09-30	Nieves	\N
129433	14	3	3	emurielb76	2025-09-30	Itin. Empl. 1º CFGB Luis	985
129434	22	4	4	emurielb76	2025-09-30	Atendida por Patricia	998
129435	41	5	5	pagarciam27	2025-09-30	Patricia TAE	\N
129436	45	5	5	emurielb76	2025-09-30	Unión Europea Jorge 4º ESO	1021
129437	43	5	5	emurielb76	2025-09-30	Econ. Empr. 1º Bach. Cristina Blanco	980
129438	42	5	5	pety78	2025-09-30	Pety	\N
129439	22	5	5	emurielb76	2025-09-30	Latín 1º Bach. Juan José	994
129440	62	6	6	emurielb76	2025-09-30	Refuerzo Lengua 2º ESO A/B Juan José	965
129441	40	6	6	emurielb76	2025-09-30	Biología 2º Bach Celia	1017
129442	22	6	6	emurielb76	2025-09-30	Atendida por Inma	1001
129443	63	6	6	emurielb76	2025-09-30	Refuerzo Mates 2º ESO A/B INFORM.	967
129444	14	6	6	emurielb76	2025-09-30	Itin. Empl. 1º CFGB Luis	986
129445	45	7	7	igomezc12	2025-09-30	2º CFGB	\N
129446	14	7	7	emurielb76	2025-09-30	Hª Filosofía 2º Bach B Carlos	1020
129447	45	1	1	emurielb76	2025-10-01	TyD  2º ESO A Miguel	1030
129448	41	1	1	mdcpalaciosr01	2025-10-01	AMBITO PRACTICO 4º DIVER	\N
129449	63	2	2	emurielb76	2025-10-01	Biología 2º Bach Celia	1011
129450	41	2	2	mdcpalaciosr01	2025-10-01	AMBITO PRACTICO 3º DIVER	\N
129451	14	2	2	emurielb76	2025-10-01	MAITE	992
129452	45	2	2	emurielb76	2025-10-01	Intel. Artif. 1º Bach. Miguel	1022
129453	8	2	2	emurielb76	2025-10-01	Biología NB 1º ESO A Alba Fajardo	958
129454	43	2	2	amfajardol01	2025-10-01	Biología 1º eso ALBA	\N
129455	62	2	2	emurielb76	2025-10-01	Mates NB 2º ESO A Raquel	962
129456	55	3	3	emurielb76	2025-10-01	Matem. A 4º ESO Raquel	971
129457	42	3	3	emurielb76	2025-10-01	1º GM Digitalización. Peti	1005
129458	45	3	3	sromang06	2025-10-01	3ºA física y química	\N
129459	22	4	4	emurielb76	2025-10-01	Atendida por Inma	999
129460	14	5	5	emurielb76	2025-10-01	MAITE	1036
129461	55	5	5	emurielb76	2025-10-01	Economía 4º ESO Cristina Blanco	1019
129462	42	5	5	efranciscor01	2025-10-01	Estela JIM	\N
129463	67	5	6	isabel22	2025-10-01	isabel panadero	\N
129464	63	5	5	emurielb76	2025-10-01	CC Grales 2º Bach Elena G.	1015
129465	45	5	5	emurielb76	2025-10-01	Digit. Básica 1º ESO A/B Miguel	1024
129466	8	5	5	emurielb76	2025-10-01	Refuerzo Lengua 1º ESO A/B Maribel	961
129467	43	6	6	emurielb76	2025-10-01	Economía 1º Bach. Cristina Blanco	982
129468	41	6	6	mgperezr02	2025-10-01	Grani. Formación y Orientación	\N
129469	45	6	6	emurielb76	2025-10-01	Digitalización 4º ESO A/B Miguel	1031
129470	45	7	7	djuliog01	2025-10-01	Diana Julio (3º B)	\N
129471	42	7	7	pety78	2025-10-01	Pety	\N
129472	45	1	1	emurielb76	2025-10-02	Intel. Artif. 1º Bach. Informática	977
129473	42	1	1	isabel22	2025-10-02	isabel panadero	\N
129474	41	1	1	pety78	2025-10-02	Pety	\N
129475	14	1	1	emurielb76	2025-10-02	Itin. Empl. 1º CFGB Luis	987
129476	45	2	2	sromang06	2025-10-02	2ºB física y química	\N
129477	14	2	2	emurielb76	2025-10-02	Itin. Empl. 1º CFGB Luis	988
129478	41	2	2	pety78	2025-10-02	Pety	\N
129479	8	2	7	vpalaciosg06	2025-10-02	VIRGINIA	\N
129480	43	2	2	pagarciam27	2025-10-02	Patricia TAE	\N
129481	42	2	2	efranciscor01	2025-10-02	2 Grado Medio	\N
129482	63	3	3	emurielb76	2025-10-02	Refuerzo Mates 2º ESO A/B INFORM.	968
129483	42	3	3	isabel22	2025-10-02	isabel panadero	\N
129484	62	3	3	emurielb76	2025-10-02	Refuerzo Lengua 2º ESO A/B Juan José	966
129485	43	3	3	emurielb76	2025-10-02	Economía 1º Bach. Cristina Blanco	981
129486	22	4	4	emurielb76	2025-10-02	Atendida por Patricia	998
129487	41	5	5	mgperezr02	2025-10-02	Grani. Formación y Orientación	\N
129488	67	5	5	isabel22	2025-10-02	isabel panadero	\N
129489	45	5	5	emurielb76	2025-10-02	Digitalización 4º ESO A/B Miguel	1026
129490	22	5	5	emurielb76	2025-10-02	Latín 1º Bach. Juan José	994
129491	62	5	5	emurielb76	2025-10-02	Mates NB 2º ESO A Raquel	963
129492	43	5	5	emurielb76	2025-10-02	Econ. Empr. 1º Bach. Cristina Blanco	980
129493	55	6	6	emurielb76	2025-10-02	Latín 4º B Juan José	972
129494	43	6	6	mebravom01	2025-10-02	1º Bachillerato de Religión	\N
129495	63	6	6	emurielb76	2025-10-02	CC Grales 2º Bach Elena G.	1014
129496	45	7	7	emurielb76	2025-10-02	TyD 2º ESO B Miguel	1028
129497	14	7	7	emurielb76	2025-10-02	Hª Filosofía 2º Bach B Carlos	1020
129498	42	7	7	emurielb76	2025-10-02	2º GS Proyecto. Rosa	1009
129499	62	1	1	emurielb76	2025-10-03	Mates NB 2º ESO A Raquel	964
129500	22	2	2	emurielb76	2025-10-03	Latín 1º Bach. Juan José	995
129501	43	2	2	emurielb76	2025-10-03	Econ. Empr. 1º Bach. Cristina Blanco	983
129502	42	2	2	dnarcisoc01	2025-10-03	LOLA 1ºGS APSI	\N
129503	45	3	3	mji3003	2025-10-03	Inma Molina	\N
129504	43	3	3	amfajardol01	2025-10-03	Biología 1º eso ALBA	\N
129505	55	3	3	emurielb76	2025-10-03	Latín 4º B Juan José	973
129506	8	3	3	emurielb76	2025-10-03	Biología NB 1º ESO A Alba Fajardo	959
129507	42	3	3	pety78	2025-10-03	Pety	\N
129508	41	3	3	mebravom01	2025-10-03	1º Bachillerato de Religión	\N
129509	67	3	3	isabel22	2025-10-03	isabel panadero	\N
129510	22	4	4	emurielb76	2025-10-03	Atendida por Inma	999
129511	42	5	5	pety78	2025-10-03	Pety	\N
129512	55	5	5	emurielb76	2025-10-03	Matem. A 4º ESO Raquel	974
129513	41	5	5	mafloresm01	2025-10-03	M ÁNGELES FLORES MARÍA	\N
129514	43	5	5	micostad01	2025-10-03	MARIBEL COSTA	\N
129515	63	5	5	emurielb76	2025-10-03	Biología 2º Bach Celia	1012
129516	45	5	5	micostad01	2025-10-03	MARIBEL COSTA	\N
129517	22	5	5	emurielb76	2025-10-03	Atendida por Matilde	1004
129518	43	6	6	micostad01	2025-10-03	MARIBEL COSTA	\N
129519	55	6	6	emurielb76	2025-10-03	Economía 4º ESO Cristina Blanco	1018
129520	63	6	6	emurielb76	2025-10-03	CC Grales 2º Bach Elena G.	1014
129521	45	6	6	micostad01	2025-10-03	MARIBEL COSTA	\N
129522	42	6	6	amfajardol01	2025-10-03	Alba PAUX	\N
129523	43	7	7	emurielb76	2025-10-03	Economía 1º Bach. Cristina Blanco	984
129524	14	7	7	emurielb76	2025-10-03	Hª Filosofía 2º Bach B Carlos	1020
129525	45	7	7	egonzalezh18	2025-10-03	Elena González 4º ESO	\N
129526	42	7	7	amfajardol01	2025-10-03	Alba PAUX	\N
129527	41	7	7	pagarciam27	2025-10-03	Patricia 2ºESO	\N
129528	67	7	7	mahernandezr06	2025-10-03	AE 4º ESO Miguel	\N
129529	45	2	2	emurielb76	2025-10-06	Intel. Artif. 1º Bach. Miguel	1022
129530	8	2	2	emurielb76	2025-10-06	Biología NB 1º ESO A Alba Fajardo	958
129531	62	2	2	emurielb76	2025-10-06	Mates NB 2º ESO A Raquel	962
129532	45	3	3	emurielb76	2025-10-06	Digit. Básica 1º ESO A/B Miguel	1023
129533	43	3	3	emurielb76	2025-10-06	Economía 1º Bach. Cristina Blanco	981
129534	22	3	3	emurielb76	2025-10-06	Latín 1º Bach. Juan José	993
129535	14	3	3	emurielb76	2025-10-06	MAITE	990
129536	42	3	5	emurielb76	2025-10-06	2º GS Optativa. Rosa	1007
129537	8	3	3	emurielb76	2025-10-06	Refuerzo Lengua 1º ESO A/B Maribel	960
129538	22	4	4	emurielb76	2025-10-06	Atendida por Carlos	996
129539	22	5	5	emurielb76	2025-10-06	Atendida por Inma	1000
129540	43	5	5	micostad01	2025-10-06	MARIBEL COSTA	\N
129541	63	5	5	emurielb76	2025-10-06	Biología 2º Bach Celia	1013
129542	45	5	5	micostad01	2025-10-06	MARIBEL COSTA	\N
129543	63	6	6	emurielb76	2025-10-06	CC Grales 2º Bach Elena G.	1014
129544	14	6	6	emurielb76	2025-10-06	MAITE	991
129545	22	6	6	emurielb76	2025-10-06	Atendida por Matilde	1002
129546	55	6	6	emurielb76	2025-10-06	Economía 4º ESO Cristina Blanco	1018
129547	55	7	7	emurielb76	2025-10-06	Matem. A 4º ESO Raquel	969
129548	43	7	7	micostad01	2025-10-06	MARIBEL COSTA	\N
129549	14	7	7	emurielb76	2025-10-06	MAITE	989
129550	45	7	7	micostad01	2025-10-06	MARIBEL COSTA	\N
129551	55	1	1	emurielb76	2025-10-07	Latín 4º B Juan José	970
129552	14	3	3	emurielb76	2025-10-07	Itin. Empl. 1º CFGB Luis	985
129553	45	3	3	emurielb76	2025-10-07	Intel. Artif. 1º Bach. Miguel	1029
129554	55	3	3	emurielb76	2025-10-07	Matem. A 4º ESO Raquel	971
129555	22	4	4	emurielb76	2025-10-07	Atendida por Patricia	998
129556	43	5	5	emurielb76	2025-10-07	Econ. Empr. 1º Bach. Cristina Blanco	980
129557	45	5	5	emurielb76	2025-10-07	Unión Europea Jorge 4º ESO	1021
129558	22	5	5	emurielb76	2025-10-07	Latín 1º Bach. Juan José	994
129559	22	6	6	emurielb76	2025-10-07	Atendida por Inma	1001
129560	63	6	6	emurielb76	2025-10-07	Refuerzo Mates 2º ESO A/B INFORM.	967
129561	14	6	6	emurielb76	2025-10-07	Itin. Empl. 1º CFGB Luis	986
129562	62	6	6	emurielb76	2025-10-07	Refuerzo Lengua 2º ESO A/B Juan José	965
129563	40	6	6	emurielb76	2025-10-07	Biología 2º Bach Celia	1017
129564	14	7	7	emurielb76	2025-10-07	Hª Filosofía 2º Bach B Carlos	1020
129565	41	1	1	mdcpalaciosr01	2025-10-08	AMBITO PRACTICO 4º DIVER	\N
129566	45	1	1	emurielb76	2025-10-08	TyD  2º ESO A Miguel	1030
129567	63	2	2	emurielb76	2025-10-08	Biología 2º Bach Celia	1011
129568	14	2	2	emurielb76	2025-10-08	MAITE	992
129569	8	2	2	emurielb76	2025-10-08	Biología NB 1º ESO A Alba Fajardo	958
129570	62	2	2	emurielb76	2025-10-08	Mates NB 2º ESO A Raquel	962
129571	41	2	2	mdcpalaciosr01	2025-10-08	AMBITO PRACTICO 3º DIVER	\N
129572	45	2	2	emurielb76	2025-10-08	Intel. Artif. 1º Bach. Miguel	1022
129573	22	2	2	efranciscor01	2025-10-08	Estela	\N
129574	42	3	3	emurielb76	2025-10-08	1º GM Digitalización. Peti	1005
129575	55	3	3	emurielb76	2025-10-08	Matem. A 4º ESO Raquel	971
129576	22	3	3	efranciscor01	2025-10-08	Estela	\N
129577	67	3	3	rmvegac01	2025-10-08	Proyecto	\N
129578	45	3	3	sromang06	2025-10-08	3ºA física y química	\N
129579	22	4	4	emurielb76	2025-10-08	Atendida por Inma	999
129580	63	5	5	emurielb76	2025-10-08	CC Grales 2º Bach Elena G.	1015
129581	45	5	5	emurielb76	2025-10-08	Digit. Básica 1º ESO A/B Miguel	1024
129582	8	5	5	emurielb76	2025-10-08	Refuerzo Lengua 1º ESO A/B Maribel	961
129583	14	5	5	emurielb76	2025-10-08	MAITE	1036
129584	55	5	5	emurielb76	2025-10-08	Economía 4º ESO Cristina Blanco	1019
129585	43	6	6	emurielb76	2025-10-08	Economía 1º Bach. Cristina Blanco	982
129586	45	6	6	emurielb76	2025-10-08	Digitalización 4º ESO A/B Miguel	1031
129587	41	6	6	mgperezr02	2025-10-08	Grani. Formación y Orientación	\N
129588	30	7	7	susana	2025-10-08	CHARLA DIABETES	\N
129589	42	7	7	emurielb76	2025-10-08	1º GS Digitalización. Peti	1040
129590	14	1	1	emurielb76	2025-10-09	Itin. Empl. 1º CFGB Luis	987
129591	30	1	1	emurielb76	2025-10-09	Elena Muriel 1º GM	\N
129592	43	1	1	jjmorcillor01	2025-10-09	Juan José Morcillo Valores 2º B	\N
129593	45	1	1	emurielb76	2025-10-09	Intel. Artif. 1º Bach. Informática	977
129594	22	2	2	efranciscor01	2025-10-09	Estela	\N
129595	14	2	2	emurielb76	2025-10-09	Itin. Empl. 1º CFGB Luis	988
129596	67	2	3	ndelorzac02	2025-10-09	nieves	\N
129597	45	2	2	sromang06	2025-10-09	3ºB Física y química	\N
129598	42	2	2	efranciscor01	2025-10-09	2 Grado Medio Estela	\N
129599	63	3	3	emurielb76	2025-10-09	Refuerzo Mates 2º ESO A/B INFORM.	968
129600	43	3	3	emurielb76	2025-10-09	Economía 1º Bach. Cristina Blanco	981
129601	62	3	3	emurielb76	2025-10-09	Refuerzo Lengua 2º ESO A/B Juan José	966
129602	45	3	3	bcrespoc01	2025-10-09	1º GM	\N
129603	42	3	3	efranciscor01	2025-10-09	1º GS Estela	\N
129604	22	3	3	efranciscor01	2025-10-09	Estela	\N
129605	22	4	4	emurielb76	2025-10-09	Atendida por Patricia	998
129606	43	5	5	emurielb76	2025-10-09	Econ. Empr. 1º Bach. Cristina Blanco	980
129607	41	5	5	mgperezr02	2025-10-09	Grani. Formación y Orientación	\N
129608	62	5	5	emurielb76	2025-10-09	Mates NB 2º ESO A Raquel	963
129609	22	5	5	emurielb76	2025-10-09	Latín 1º Bach. Juan José	994
129610	45	5	5	emurielb76	2025-10-09	Digitalización 4º ESO A/B Miguel	1026
129611	42	5	5	bcrespoc01	2025-10-09	BEATRIZ CRESPO	\N
129612	55	6	6	emurielb76	2025-10-09	Latín 4º B Juan José	972
129613	41	6	6	mebravom01	2025-10-09	1º Bachillerato de Religión	\N
129614	42	6	6	dnarcisoc01	2025-10-09	Lola. Dolores Narciso	\N
129615	63	6	6	emurielb76	2025-10-09	CC Grales 2º Bach Elena G.	1014
129616	43	7	7	egonzalezh18	2025-10-09	Elena Gonzalez	\N
129617	41	7	7	mebravom01	2025-10-09	1º ESO	\N
129618	14	7	7	emurielb76	2025-10-09	Hª Filosofía 2º Bach B Carlos	1020
129619	42	7	7	emurielb76	2025-10-09	2º GS Proyecto. Rosa	1009
129620	45	7	7	emurielb76	2025-10-09	TyD 2º ESO B Miguel	1028
129621	62	1	1	emurielb76	2025-10-10	Mates NB 2º ESO A Raquel	964
129622	42	1	1	rmvegac01	2025-10-10	dcm	\N
129623	41	1	1	mebravom01	2025-10-10	3º ESO	\N
129624	67	1	1	ndelorzac02	2025-10-10	Nieves	\N
129625	43	2	2	emurielb76	2025-10-10	Econ. Empr. 1º Bach. Cristina Blanco	983
129626	45	2	2	igomezc12	2025-10-10	2º CFGB	\N
129627	42	2	3	rmvegac01	2025-10-10	IFAM	\N
129628	22	2	2	emurielb76	2025-10-10	Latín 1º Bach. Juan José	995
129629	55	3	3	emurielb76	2025-10-10	Latín 4º B Juan José	973
129630	45	3	3	sromang06	2025-10-10	2ºB física y química	\N
129631	41	3	3	omsanchezg01	2025-10-10	OLGA 3º DIVER	\N
129632	8	3	3	emurielb76	2025-10-10	Biología NB 1º ESO A Alba Fajardo	959
129633	43	3	3	vpalaciosg06	2025-10-10	VIRGINIA	\N
129634	22	4	4	emurielb76	2025-10-10	Atendida por Inma	999
129635	30	4	5	emurielb76	2025-10-10	Re. Prospectora FP	\N
129636	63	5	5	emurielb76	2025-10-10	Biología 2º Bach Celia	1012
129637	45	5	5	micostad01	2025-10-10	MARIBEL COSTA	\N
129638	22	5	5	emurielb76	2025-10-10	Atendida por Matilde	1004
129639	55	5	5	emurielb76	2025-10-10	Matem. A 4º ESO Raquel	974
129640	42	5	5	pety78	2025-10-10	Pety	\N
129641	42	6	6	rmvegac01	2025-10-10	DCM	\N
129642	45	6	6	micostad01	2025-10-10	MARIBEL COSTA	\N
129643	63	6	6	emurielb76	2025-10-10	CC Grales 2º Bach Elena G.	1014
129644	43	6	6	sromang06	2025-10-10	2ºA física y química	\N
129645	55	6	6	emurielb76	2025-10-10	Economía 4º ESO Cristina Blanco	1018
129646	14	6	6	celita2	2025-10-10	celia 4º eso	\N
129647	14	7	7	emurielb76	2025-10-10	Hª Filosofía 2º Bach B Carlos	1020
129648	67	7	7	dmacarrillam01	2025-10-10	David Macarrilla 2º CFPBasica	\N
129649	43	7	7	emurielb76	2025-10-10	Economía 1º Bach. Cristina Blanco	984
129650	45	7	7	egonzalezh18	2025-10-10	Elena González 4º ESO	\N
129651	41	7	7	pagarciam27	2025-10-10	Patricia 2ºESO	\N
129652	14	1	1	emurielb76	2025-10-13	MAITE	989
129653	45	2	2	emurielb76	2025-10-13	Intel. Artif. 1º Bach. Miguel	1022
129654	8	2	2	emurielb76	2025-10-13	Biología NB 1º ESO A Alba Fajardo	958
129655	62	2	2	emurielb76	2025-10-13	Mates NB 2º ESO A Raquel	962
129656	22	3	3	emurielb76	2025-10-13	Latín 1º Bach. Juan José	993
129657	14	3	3	emurielb76	2025-10-13	MAITE	990
129658	42	3	5	emurielb76	2025-10-13	2º GS Optativa. Rosa	1007
129659	8	3	3	emurielb76	2025-10-13	Refuerzo Lengua 1º ESO A/B Maribel	960
129660	45	3	3	emurielb76	2025-10-13	Digit. Básica 1º ESO A/B Miguel	1023
129661	43	3	3	emurielb76	2025-10-13	Economía 1º Bach. Cristina Blanco	981
129662	22	4	4	emurielb76	2025-10-13	Atendida por Carlos	996
129663	22	5	5	emurielb76	2025-10-13	Atendida por Inma	1000
129664	63	5	5	emurielb76	2025-10-13	Biología 2º Bach Celia	1013
129665	45	5	5	micostad01	2025-10-13	MARIBEL COSTA	\N
129666	63	6	6	emurielb76	2025-10-13	CC Grales 2º Bach Elena G.	1014
129667	14	6	6	emurielb76	2025-10-13	MAITE	991
129668	55	6	6	emurielb76	2025-10-13	Economía 4º ESO Cristina Blanco	1018
129669	22	6	6	emurielb76	2025-10-13	Atendida por Matilde	1002
129670	45	7	7	micostad01	2025-10-13	MARIBEL COSTA	\N
129671	55	7	7	emurielb76	2025-10-13	Matem. A 4º ESO Raquel	969
129672	55	1	1	emurielb76	2025-10-14	Latín 4º B Juan José	970
129673	8	1	7	emurielb76	2025-10-14	CLASES 1º ESO B SERÁN EN ESTE AULA.	\N
129674	55	3	3	emurielb76	2025-10-14	Matem. A 4º ESO Raquel	971
129675	14	3	3	emurielb76	2025-10-14	Itin. Empl. 1º CFGB Luis	985
129676	45	3	3	emurielb76	2025-10-14	Intel. Artif. 1º Bach. Miguel	1029
129677	42	3	5	pety78	2025-10-14	Pety	\N
129678	22	4	4	emurielb76	2025-10-14	Atendida por Patricia	998
129679	22	5	5	emurielb76	2025-10-14	Latín 1º Bach. Juan José	994
129680	41	5	5	dmatasr01	2025-10-14	David Matas	\N
129681	45	5	5	emurielb76	2025-10-14	Unión Europea Jorge 4º ESO	1021
129682	43	5	5	emurielb76	2025-10-14	Econ. Empr. 1º Bach. Cristina Blanco	980
129683	63	6	6	emurielb76	2025-10-14	Refuerzo Mates 2º ESO A/B INFORM.	967
129684	14	6	6	emurielb76	2025-10-14	Itin. Empl. 1º CFGB Luis	986
129685	62	6	6	emurielb76	2025-10-14	Refuerzo Lengua 2º ESO A/B Juan José	965
129686	40	6	6	emurielb76	2025-10-14	Biología 2º Bach Celia	1017
129687	22	6	6	emurielb76	2025-10-14	Atendida por Inma	1001
129688	45	7	7	dmatasr01	2025-10-14	David Matas	\N
129689	14	7	7	emurielb76	2025-10-14	Hª Filosofía 2º Bach B Carlos	1020
129690	41	1	1	mdcpalaciosr01	2025-10-15	AMBITO PRACTICO 4º DIVER	\N
129691	45	1	1	emurielb76	2025-10-15	TyD  2º ESO A Miguel	1030
129692	43	2	2	omsanchezg01	2025-10-15	OLGA 4º DIVER	\N
129693	45	2	2	emurielb76	2025-10-15	Intel. Artif. 1º Bach. Miguel	1022
129694	8	2	2	emurielb76	2025-10-15	Biología NB 1º ESO A Alba Fajardo	958
129695	62	2	2	emurielb76	2025-10-15	Mates NB 2º ESO A Raquel	962
129696	63	2	2	emurielb76	2025-10-15	Biología 2º Bach Celia	1011
129697	41	2	2	mdcpalaciosr01	2025-10-15	AMBITO PRACTICO 3º DIVER	\N
129698	14	2	2	emurielb76	2025-10-15	MAITE	992
129699	55	3	3	emurielb76	2025-10-15	Matem. A 4º ESO Raquel	971
129700	43	3	3	omsanchezg01	2025-10-15	OLGA 4º DIVER	\N
129701	42	3	3	emurielb76	2025-10-15	1º GM Digitalización. Peti	1005
129702	45	3	3	sromang06	2025-10-15	3ºA física y química	\N
129703	22	4	4	emurielb76	2025-10-15	Atendida por Inma	999
129704	63	5	5	emurielb76	2025-10-15	CC Grales 2º Bach Elena G.	1015
129705	45	5	5	emurielb76	2025-10-15	Digit. Básica 1º ESO A/B Miguel	1024
129706	8	5	5	emurielb76	2025-10-15	Refuerzo Lengua 1º ESO A/B Maribel	961
129707	14	5	5	emurielb76	2025-10-15	MAITE	1036
129708	55	5	5	emurielb76	2025-10-15	Economía 4º ESO Cristina Blanco	1019
129709	42	5	5	rmvegac01	2025-10-15	DCM	\N
129710	14	6	6	mtmarting03	2025-10-15	MAITE PT	\N
129711	45	6	6	emurielb76	2025-10-15	Digitalización 4º ESO A/B Miguel	1031
129712	41	6	6	mgperezr02	2025-10-15	Grani. Formación y Orientación	\N
129713	43	6	6	emurielb76	2025-10-15	Economía 1º Bach. Cristina Blanco	982
129714	41	7	7	omsanchezg01	2025-10-15	OLGA 3º DIVER	\N
129715	42	7	7	emurielb76	2025-10-15	1º GS Digitalización. Peti	1040
129716	45	7	7	mrcarmonav01	2025-10-15	Remedios Carmona Vinagre 3ºA	\N
129717	42	1	1	dnarcisoc01	2025-10-16	Lola TLA	\N
129718	14	1	1	emurielb76	2025-10-16	Itin. Empl. 1º CFGB Luis	987
129719	45	1	1	emurielb76	2025-10-16	Intel. Artif. 1º Bach. Informática	977
129720	42	2	2	efranciscor01	2025-10-16	2 Grado Medio Estela	\N
129721	45	2	2	sromang06	2025-10-16	3ºB Física y química	\N
129722	14	2	2	emurielb76	2025-10-16	Itin. Empl. 1º CFGB Luis	988
129723	42	3	3	efranciscor01	2025-10-16	Estela 1ºEI	\N
129724	43	3	3	emurielb76	2025-10-16	Economía 1º Bach. Cristina Blanco	981
129725	63	3	3	emurielb76	2025-10-16	Refuerzo Mates 2º ESO A/B INFORM.	968
129726	41	3	3	dmatasr01	2025-10-16	David Matas	\N
129727	62	3	3	emurielb76	2025-10-16	Refuerzo Lengua 2º ESO A/B Juan José	966
129728	22	4	4	emurielb76	2025-10-16	Atendida por Patricia	998
129729	62	5	5	emurielb76	2025-10-16	Mates NB 2º ESO A Raquel	963
129730	43	5	5	emurielb76	2025-10-16	Econ. Empr. 1º Bach. Cristina Blanco	980
129731	45	5	5	emurielb76	2025-10-16	Digitalización 4º ESO A/B Miguel	1026
129732	14	5	5	omsanchezg01	2025-10-16	OLGA 3º DIVER	\N
129733	22	5	5	emurielb76	2025-10-16	Latín 1º Bach. Juan José	994
129734	41	5	5	mgperezr02	2025-10-16	Grani. Formación y Orientación	\N
129735	55	6	6	emurielb76	2025-10-16	Latín 4º B Juan José	972
129736	63	6	6	emurielb76	2025-10-16	CC Grales 2º Bach Elena G.	1014
129737	42	7	7	emurielb76	2025-10-16	2º GS Proyecto. Rosa	1009
129738	14	7	7	emurielb76	2025-10-16	Hª Filosofía 2º Bach B Carlos	1020
129739	45	7	7	emurielb76	2025-10-16	TyD 2º ESO B Miguel	1028
129740	22	7	7	pagarciam27	2025-10-16	Elisa, 2ºA	\N
129741	43	7	7	egonzalezh18	2025-10-16	Elena Gonzalez	\N
129742	62	1	1	emurielb76	2025-10-17	Mates NB 2º ESO A Raquel	964
129743	42	1	1	isabel22	2025-10-17	isabel panadero	\N
129744	45	2	2	omsanchezg01	2025-10-17	OLGA 3º DIVER	\N
129745	42	2	2	igomezc12	2025-10-17	2º CFGB	\N
129746	22	2	2	emurielb76	2025-10-17	Latín 1º Bach. Juan José	995
129747	43	2	2	emurielb76	2025-10-17	Econ. Empr. 1º Bach. Cristina Blanco	983
129748	41	2	3	bcrespoc01	2025-10-17	BEATRIZ CRESPO	\N
129749	30	3	3	pety78	2025-10-17	Pety	\N
129750	45	3	3	emurielb76	2025-10-17	1º Bach AE. Virginia	1033
129751	42	3	3	isabel22	2025-10-17	isabel panadero	\N
129752	55	3	3	emurielb76	2025-10-17	Latín 4º B Juan José	973
129753	8	3	3	emurielb76	2025-10-17	Biología NB 1º ESO A Alba Fajardo	959
129754	22	4	4	emurielb76	2025-10-17	Atendida por Inma	999
129755	22	5	5	emurielb76	2025-10-17	Atendida por Matilde	1004
129756	42	5	5	isabel22	2025-10-17	isabel panadero	\N
129757	14	5	5	mrcarmonav01	2025-10-17	Remedios Carmona Vinagre 3ºDIVER	\N
129758	55	5	5	emurielb76	2025-10-17	Matem. A 4º ESO Raquel	974
129759	63	5	5	emurielb76	2025-10-17	Biología 2º Bach Celia	1012
129760	45	5	5	emurielb76	2025-10-17	TyD  2º ESO A Miguel	1032
129761	43	5	5	micostad01	2025-10-17	MARIBEL COSTA	\N
129762	63	6	6	emurielb76	2025-10-17	CC Grales 2º Bach Elena G.	1014
129763	41	6	6	jjmorcillor01	2025-10-17	Juanjo	\N
129764	43	6	6	micostad01	2025-10-17	MARIBEL COSTA	\N
129765	55	6	6	emurielb76	2025-10-17	Economía 4º ESO Cristina Blanco	1018
129766	45	6	6	djuliog01	2025-10-17	Diana Julio (2ºB)	\N
129767	43	7	7	emurielb76	2025-10-17	Economía 1º Bach. Cristina Blanco	984
129768	41	7	7	pagarciam27	2025-10-17	Patricia 2ºESO	\N
129769	45	7	7	dmatasr01	2025-10-17	David Matas	\N
129770	14	7	7	emurielb76	2025-10-17	Hª Filosofía 2º Bach B Carlos	1020
129771	14	1	1	emurielb76	2025-10-20	MAITE	989
129772	8	2	2	emurielb76	2025-10-20	Biología NB 1º ESO A Alba Fajardo	958
129773	62	2	2	emurielb76	2025-10-20	Mates NB 2º ESO A Raquel	962
129774	41	2	2	omsanchezg01	2025-10-20	OLGA 3º DIVER	\N
129775	45	2	2	emurielb76	2025-10-20	Intel. Artif. 1º Bach. Miguel	1022
129776	43	3	3	emurielb76	2025-10-20	Economía 1º Bach. Cristina Blanco	981
129777	22	3	3	emurielb76	2025-10-20	Latín 1º Bach. Juan José	993
129778	14	3	3	emurielb76	2025-10-20	MAITE	990
129779	42	3	5	emurielb76	2025-10-20	2º GS Optativa. Rosa	1007
129780	8	3	3	emurielb76	2025-10-20	Refuerzo Lengua 1º ESO A/B Maribel	960
129781	45	3	3	emurielb76	2025-10-20	Digit. Básica 1º ESO A/B Miguel	1023
129782	41	3	3	omsanchezg01	2025-10-20	OLGA APOYO MATES	\N
129783	22	4	4	emurielb76	2025-10-20	Atendida por Carlos	996
129784	45	5	5	emurielb76	2025-10-20	Digitalización 4º ESO A/B Miguel	1026
129785	43	5	5	micostad01	2025-10-20	MARIBEL COSTA	\N
129786	41	5	5	vpalaciosg06	2025-10-20	GRANI	1035
129787	22	5	5	emurielb76	2025-10-20	Atendida por Inma	1000
129788	63	5	5	emurielb76	2025-10-20	Biología 2º Bach Celia	1013
129789	22	6	6	emurielb76	2025-10-20	Atendida por Matilde	1002
129790	55	6	6	emurielb76	2025-10-20	Economía 4º ESO Cristina Blanco	1018
129791	14	6	6	emurielb76	2025-10-20	MAITE	991
129792	63	6	6	emurielb76	2025-10-20	CC Grales 2º Bach Elena G.	1014
129793	41	7	7	omsanchezg01	2025-10-20	OLGA 4º DIVER	\N
129794	55	7	7	emurielb76	2025-10-20	Matem. A 4º ESO Raquel	969
129795	67	7	7	igomezc12	2025-10-20	2º CFGB	\N
129796	43	7	7	micostad01	2025-10-20	MARIBEL COSTA	\N
129797	45	7	7	emurielb76	2025-10-20	TyD 2º ESO B Miguel	1028
129798	67	1	1	isabel22	2025-10-21	isabel panadero	\N
129799	45	1	1	sromang06	2025-10-21	3ºA física y química	\N
129800	42	1	1	emurielb76	2025-10-21	Elena Muriel 1º GM	\N
129801	55	1	1	emurielb76	2025-10-21	Latín 4º B Juan José	970
129802	43	2	2	jjmorcillor01	2025-10-21	Juanjo Morcillo	\N
129803	41	2	2	dmatasr01	2025-10-21	David Matas	\N
129804	55	3	3	emurielb76	2025-10-21	Matem. A 4º ESO Raquel	971
129805	67	3	3	isabel22	2025-10-21	isabel panadero	\N
129806	14	3	3	emurielb76	2025-10-21	Itin. Empl. 1º CFGB Luis	985
129807	45	3	3	emurielb76	2025-10-21	Intel. Artif. 1º Bach. Miguel	1029
129808	42	3	3	rmvegac01	2025-10-21	Rosa Vega	\N
129809	22	4	4	emurielb76	2025-10-21	Atendida por Patricia	998
129810	30	4	4	mahernandezr06	2025-10-21	Reunión 2 ESO B	\N
129811	43	5	5	emurielb76	2025-10-21	Econ. Empr. 1º Bach. Cristina Blanco	980
129812	45	5	5	emurielb76	2025-10-21	Unión Europea Jorge 4º ESO	1021
129813	14	5	5	dmatasr01	2025-10-21	David Matas	\N
129814	22	5	5	emurielb76	2025-10-21	Latín 1º Bach. Juan José	994
129815	41	5	5	sromang06	2025-10-21	3ºB Física y química	\N
129816	40	6	6	emurielb76	2025-10-21	Biología 2º Bach Celia	1017
129817	22	6	6	emurielb76	2025-10-21	Atendida por Inma	1001
129818	63	6	6	emurielb76	2025-10-21	Refuerzo Mates 2º ESO A/B INFORM.	967
129819	14	6	6	emurielb76	2025-10-21	Itin. Empl. 1º CFGB Luis	986
129820	62	6	6	emurielb76	2025-10-21	Refuerzo Lengua 2º ESO A/B Juan José	965
129821	41	7	7	dmatasr01	2025-10-21	David Matas	\N
129822	45	7	7	jjmorcillor01	2025-10-21	Juanjo Morcillo	\N
129823	14	7	7	emurielb76	2025-10-21	Hª Filosofía 2º Bach B Carlos	1020
129824	43	7	7	omsanchezg01	2025-10-21	OLGA 4º DIVER	\N
129825	45	1	1	emurielb76	2025-10-22	TyD  2º ESO A Miguel	1030
129826	42	1	2	emurielb76	2025-10-22	Elena Muriel 1º GM	\N
129827	30	1	1	dnarcisoc01	2025-10-22	ADO. LOLA	\N
129828	41	1	1	mdcpalaciosr01	2025-10-22	AMBITO PRACTICO 3º DIVER	\N
129829	30	2	2	dnarcisoc01	2025-10-22	Lola ADO	\N
129830	63	2	2	emurielb76	2025-10-22	Biología 2º Bach Celia	1011
129831	45	2	2	emurielb76	2025-10-22	Intel. Artif. 1º Bach. Miguel	1022
129832	14	2	2	emurielb76	2025-10-22	MAITE	992
129833	41	2	2	mdcpalaciosr01	2025-10-22	AMBITO PRACTICO 4º DIVER	\N
129834	8	2	2	emurielb76	2025-10-22	Biología NB 1º ESO A Alba Fajardo	958
129835	62	2	2	emurielb76	2025-10-22	Mates NB 2º ESO A Raquel	962
129836	45	3	3	sromang06	2025-10-22	3ºA física y química	\N
129837	14	3	3	mtcerezog01	2025-10-22	Teresa	\N
129838	42	3	3	emurielb76	2025-10-22	1º GM Digitalización. Peti	1005
129839	55	3	3	emurielb76	2025-10-22	Matem. A 4º ESO Raquel	971
129840	22	4	4	emurielb76	2025-10-22	Atendida por Inma	999
129841	41	5	5	omsanchezg01	2025-10-22	OLGA APOYO 1º eso	\N
129842	42	5	5	rmvegac01	2025-10-22	ISABEL	\N
129843	63	5	5	emurielb76	2025-10-22	CC Grales 2º Bach Elena G.	1015
129844	45	5	5	emurielb76	2025-10-22	Digit. Básica 1º ESO A/B Miguel	1024
129845	8	5	5	emurielb76	2025-10-22	Refuerzo Lengua 1º ESO A/B Maribel	961
129846	14	5	5	emurielb76	2025-10-22	MAITE	1036
129847	55	5	5	emurielb76	2025-10-22	Economía 4º ESO Cristina Blanco	1019
129848	43	6	6	emurielb76	2025-10-22	Economía 1º Bach. Cristina Blanco	982
129849	14	6	6	isabel22	2025-10-22	isabel panadero	\N
129850	45	6	6	emurielb76	2025-10-22	Digitalización 4º ESO A/B Miguel	1031
129851	42	7	7	efranciscor01	2025-10-22	Estela	\N
129852	14	7	7	omsanchezg01	2025-10-22	OLGA 3º DIVER	\N
129853	45	1	1	emurielb76	2025-10-23	Intel. Artif. 1º Bach. Informática	977
129854	41	1	1	omsanchezg01	2025-10-23	OLGA 4º DIVER	\N
129855	14	1	1	emurielb76	2025-10-23	Itin. Empl. 1º CFGB Luis	987
129856	41	2	2	efranciscor01	2025-10-23	2 Grado Medio Estela	\N
129857	14	2	2	emurielb76	2025-10-23	Itin. Empl. 1º CFGB Luis	988
129858	45	2	2	sromang06	2025-10-23	3ºB Física y química	\N
129859	14	3	3	mtcerezog01	2025-10-23	Teresa 3º diver	\N
129860	63	3	3	emurielb76	2025-10-23	Refuerzo Mates 2º ESO A/B INFORM.	968
129861	62	3	3	emurielb76	2025-10-23	Refuerzo Lengua 2º ESO A/B Juan José	966
129862	43	3	3	emurielb76	2025-10-23	Economía 1º Bach. Cristina Blanco	981
129863	45	3	3	dmatasr01	2025-10-23	David Matas	\N
129864	22	4	4	emurielb76	2025-10-23	Atendida por Patricia	998
129865	22	5	5	emurielb76	2025-10-23	Latín 1º Bach. Juan José	994
129866	41	5	5	rmvegac01	2025-10-23	Isabel Panadero	\N
129867	43	5	5	emurielb76	2025-10-23	Econ. Empr. 1º Bach. Cristina Blanco	980
129868	62	5	5	emurielb76	2025-10-23	Mates NB 2º ESO A Raquel	963
129869	45	5	5	emurielb76	2025-10-23	Digitalización 4º ESO A/B Miguel	1026
129870	63	6	6	emurielb76	2025-10-23	CC Grales 2º Bach Elena G.	1014
129871	45	6	6	djuliog01	2025-10-23	Diana Julio (2ºA)	\N
129872	55	6	6	emurielb76	2025-10-23	Latín 4º B Juan José	972
129873	14	7	7	emurielb76	2025-10-23	Hª Filosofía 2º Bach B Carlos	1020
129874	41	7	7	mji3003	2025-10-23	Inma Molina	\N
129875	43	7	7	egonzalezh18	2025-10-23	Elena Gonzalez	\N
129876	45	7	7	emurielb76	2025-10-23	TyD 2º ESO B Miguel	1028
129877	42	7	7	emurielb76	2025-10-23	2º GS Proyecto. Rosa	1009
129878	62	1	1	emurielb76	2025-10-24	Mates NB 2º ESO A Raquel	964
129879	45	2	2	egonzalezh18	2025-10-24	Elena González 3º ESO	\N
129880	43	2	2	emurielb76	2025-10-24	Econ. Empr. 1º Bach. Cristina Blanco	983
129881	22	2	2	emurielb76	2025-10-24	Latín 1º Bach. Juan José	995
129882	8	2	2	isabel22	2025-10-24	isabel panadero	\N
129883	45	3	3	emurielb76	2025-10-24	1º Bach AE. Virginia	1033
129884	55	3	3	emurielb76	2025-10-24	Latín 4º B Juan José	973
129885	8	3	3	emurielb76	2025-10-24	Biología NB 1º ESO A Alba Fajardo	959
129886	14	3	3	omsanchezg01	2025-10-24	OLGA 3º DIVER	\N
129887	22	4	4	emurielb76	2025-10-24	Atendida por Inma	999
129888	55	5	5	emurielb76	2025-10-24	Matem. A 4º ESO Raquel	974
129889	63	5	5	emurielb76	2025-10-24	Biología 2º Bach Celia	1012
129890	45	5	5	emurielb76	2025-10-24	TyD  2º ESO A Miguel	1032
129891	43	5	5	micostad01	2025-10-24	MARIBEL COSTA	\N
129892	67	5	5	ndelorzac02	2025-10-24	nieves	\N
129893	22	5	5	emurielb76	2025-10-24	Atendida por Matilde	1004
129894	43	6	6	micostad01	2025-10-24	MARIBEL COSTA	\N
129895	55	6	6	emurielb76	2025-10-24	Economía 4º ESO Cristina Blanco	1018
129896	63	6	6	emurielb76	2025-10-24	CC Grales 2º Bach Elena G.	1014
129897	45	6	6	djuliog01	2025-10-24	Diana Julio (2ºB)	\N
129898	41	6	6	omsanchezg01	2025-10-24	OLGA 4º DIVER	\N
129899	42	6	6	jjmorcillor01	2025-10-24	Juanjo	\N
129900	14	6	6	mrcarmonav01	2025-10-24	Remedios Carmona Vinagre 3ºDIVER	\N
129901	41	7	7	pagarciam27	2025-10-24	Patricia 2ºESO	\N
129902	45	7	7	dmatasr01	2025-10-24	David Matas	\N
129903	14	7	7	emurielb76	2025-10-24	Hª Filosofía 2º Bach B Carlos	1020
129904	43	7	7	emurielb76	2025-10-24	Economía 1º Bach. Cristina Blanco	984
129905	14	1	1	emurielb76	2025-10-27	MAITE	989
129906	8	2	2	emurielb76	2025-10-27	Biología NB 1º ESO A Alba Fajardo	958
129907	62	2	2	emurielb76	2025-10-27	Mates NB 2º ESO A Raquel	962
129908	43	2	2	isabel22	2025-10-27	isabel panadero	\N
129909	45	2	2	emurielb76	2025-10-27	Intel. Artif. 1º Bach. Miguel	1022
129910	45	3	3	emurielb76	2025-10-27	Digit. Básica 1º ESO A/B Miguel	1023
129911	43	3	3	emurielb76	2025-10-27	Economía 1º Bach. Cristina Blanco	981
129912	41	3	3	rmvegac01	2025-10-27	Rosa Vega	\N
129913	22	3	3	emurielb76	2025-10-27	Latín 1º Bach. Juan José	993
129914	14	3	3	emurielb76	2025-10-27	MAITE	990
129915	42	3	5	emurielb76	2025-10-27	2º GS Optativa. Rosa	1007
129916	8	3	3	emurielb76	2025-10-27	Refuerzo Lengua 1º ESO A/B Maribel	960
129917	22	4	4	emurielb76	2025-10-27	Atendida por Carlos	996
129918	41	5	5	cblancoa02	2025-10-27	Cristina Blanco Ávila	\N
129919	45	5	5	emurielb76	2025-10-27	Digitalización 4º ESO A/B Miguel	1026
129920	22	5	5	emurielb76	2025-10-27	Atendida por Inma	1000
129921	63	5	5	emurielb76	2025-10-27	Biología 2º Bach Celia	1013
129922	43	5	5	micostad01	2025-10-27	MARIBEL COSTA	\N
129923	30	5	5	rmvegac01	2025-10-27	Rosa Vega	\N
129924	14	6	6	emurielb76	2025-10-27	MAITE	991
129925	22	6	6	emurielb76	2025-10-27	Atendida por Matilde	1002
129926	55	6	6	emurielb76	2025-10-27	Economía 4º ESO Cristina Blanco	1018
129927	63	6	6	emurielb76	2025-10-27	CC Grales 2º Bach Elena G.	1014
129928	41	7	7	omsanchezg01	2025-10-27	OLGA 4º DIVER	\N
129929	45	7	7	emurielb76	2025-10-27	TyD 2º ESO B Miguel	1028
129930	43	7	7	micostad01	2025-10-27	MARIBEL COSTA	\N
129931	30	7	7	efranciscor01	2025-10-27	Estela	\N
129932	55	7	7	emurielb76	2025-10-27	Matem. A 4º ESO Raquel	969
129933	67	1	1	isabel22	2025-10-28	isabel panadero	\N
129934	42	1	1	amfajardol01	2025-10-28	Lola	\N
129935	55	1	1	emurielb76	2025-10-28	Latín 4º B Juan José	970
129936	43	2	2	emurielb76	2025-10-28	Economía 1º Bach. Cristina Blanco	1037
129937	14	3	3	emurielb76	2025-10-28	Itin. Empl. 1º CFGB Luis	985
129938	55	3	3	emurielb76	2025-10-28	Matem. A 4º ESO Raquel	971
129939	45	3	3	emurielb76	2025-10-28	Intel. Artif. 1º Bach. Miguel	1029
129940	41	3	3	omsanchezg01	2025-10-28	OLGA 3º DIVER	\N
129941	22	4	4	emurielb76	2025-10-28	Atendida por Patricia	998
129942	30	4	4	amfajardol01	2025-10-28	alba AH examen	\N
129943	43	5	5	emurielb76	2025-10-28	Econ. Empr. 1º Bach. Cristina Blanco	980
129944	41	5	5	dmatasr01	2025-10-28	David Matas	\N
129945	22	5	5	emurielb76	2025-10-28	Latín 1º Bach. Juan José	994
129946	45	5	5	emurielb76	2025-10-28	Unión Europea Jorge 4º ESO	1021
129947	30	5	5	amfajardol01	2025-10-28	alba AH examen	\N
129948	22	6	6	emurielb76	2025-10-28	Atendida por Inma	1001
129949	63	6	6	emurielb76	2025-10-28	Refuerzo Mates 2º ESO A/B INFORM.	967
129950	43	6	6	lpcamarac01	2025-10-28	2º ESO Luis Pedro Cámara	\N
129951	14	6	6	emurielb76	2025-10-28	Itin. Empl. 1º CFGB Luis	986
129952	62	6	6	emurielb76	2025-10-28	Refuerzo Lengua 2º ESO A/B Juan José	965
129953	40	6	6	emurielb76	2025-10-28	Biología 2º Bach Celia	1017
129954	41	6	6	jjmorcillor01	2025-10-28	Juan José Morcillo Romero	\N
129955	45	6	6	djuliog01	2025-10-28	Diana Julio (3º B)	\N
129956	45	7	7	dmatasr01	2025-10-28	David Matas	\N
129957	14	7	7	emurielb76	2025-10-28	Hª Filosofía 2º Bach B Carlos	1020
129958	43	7	7	celita2	2025-10-28	celia 4º eso	\N
129959	41	7	7	celita2	2025-10-28	celia 4º eso	\N
129960	41	1	1	mdcpalaciosr01	2025-10-29	AMBITO PRACTICO 3º DIVER	\N
129961	45	1	1	emurielb76	2025-10-29	TyD  2º ESO A Miguel	1030
129962	14	2	2	emurielb76	2025-10-29	MAITE	992
129963	30	2	2	efranciscor01	2025-10-29	1º GS Estela	\N
129964	45	2	2	emurielb76	2025-10-29	Intel. Artif. 1º Bach. Miguel	1022
129965	41	2	2	mdcpalaciosr01	2025-10-29	AMBITO PRACTICO 4º DIVER	\N
129966	43	2	2	mjcorralesg01	2025-10-29	1º Bach	\N
129967	63	2	2	emurielb76	2025-10-29	Biología 2º Bach Celia	1011
129968	8	2	2	emurielb76	2025-10-29	Biología NB 1º ESO A Alba Fajardo	958
129969	62	2	2	emurielb76	2025-10-29	Mates NB 2º ESO A Raquel	962
129970	42	3	3	emurielb76	2025-10-29	1º GM Digitalización. Peti	1005
129971	55	3	3	emurielb76	2025-10-29	Matem. A 4º ESO Raquel	971
129972	41	3	3	omsanchezg01	2025-10-29	OLGA 4º DIVER	\N
129973	14	3	3	mtcerezog01	2025-10-29	Teresa 3º diver	\N
129974	63	3	3	egonzalezh18	2025-10-29	Elena 1º bachillerato	\N
129975	30	3	3	efranciscor01	2025-10-29	Estela 1ºEI	\N
129976	45	3	3	sromang06	2025-10-29	3ºA física y química	\N
129977	22	4	4	emurielb76	2025-10-29	Atendida por Inma	999
129978	43	5	5	amfajardol01	2025-10-29	alba bio	\N
129979	42	5	5	isabel22	2025-10-29	isabel panadero	\N
129980	41	5	5	omsanchezg01	2025-10-29	OLGA APOYO	\N
129981	67	5	5	rmvegac01	2025-10-29	Rosa Vega	\N
129982	63	5	5	emurielb76	2025-10-29	CC Grales 2º Bach Elena G.	1015
129983	45	5	5	emurielb76	2025-10-29	Digit. Básica 1º ESO A/B Miguel	1024
129984	8	5	5	emurielb76	2025-10-29	Refuerzo Lengua 1º ESO A/B Maribel	961
129985	14	5	5	emurielb76	2025-10-29	MAITE	1036
129986	55	5	5	emurielb76	2025-10-29	Economía 4º ESO Cristina Blanco	1019
129987	45	6	6	emurielb76	2025-10-29	Digitalización 4º ESO A/B Miguel	1031
129988	67	6	6	isabel22	2025-10-29	isabel panadero	\N
129989	43	6	6	emurielb76	2025-10-29	Economía 1º Bach. Cristina Blanco	982
129990	42	7	7	emurielb76	2025-10-29	1º GS Digitalización. Peti	1040
129991	45	7	7	djuliog01	2025-10-29	Diana Julio (3º B)	\N
129992	41	7	7	omsanchezg01	2025-10-29	OLGA 3º DIVER	\N
129993	67	7	7	ndelorzac02	2025-10-29	Nieves	\N
129994	14	1	1	emurielb76	2025-10-30	Itin. Empl. 1º CFGB Luis	987
129995	42	1	1	dnarcisoc01	2025-10-30	Lola TLA	\N
129996	45	1	1	emurielb76	2025-10-30	Intel. Artif. 1º Bach. Informática	977
129997	14	2	2	emurielb76	2025-10-30	Itin. Empl. 1º CFGB Luis	988
129998	45	2	2	sromang06	2025-10-30	3ºB Física y química	\N
129999	42	2	2	efranciscor01	2025-10-30	Proyecto 2GM	\N
130000	45	3	3	mjcorralesg01	2025-10-30	2º FPB	\N
130001	62	3	3	emurielb76	2025-10-30	Refuerzo Lengua 2º ESO A/B Juan José	966
130002	41	3	3	rmvegac01	2025-10-30	PROYECTO	\N
130003	43	3	3	emurielb76	2025-10-30	Economía 1º Bach. Cristina Blanco	981
130004	63	3	3	emurielb76	2025-10-30	Refuerzo Mates 2º ESO A/B INFORM.	968
130005	14	3	3	lpcamarac01	2025-10-30	2º ESO Luis Pedro Cámara	\N
130006	22	4	4	emurielb76	2025-10-30	Atendida por Patricia	998
130007	45	5	5	emurielb76	2025-10-30	Digitalización 4º ESO A/B Miguel	1026
130008	14	5	5	omsanchezg01	2025-10-30	OLGA 3º DIVER	\N
130009	62	5	5	emurielb76	2025-10-30	Mates NB 2º ESO A Raquel	963
130010	22	5	5	emurielb76	2025-10-30	Latín 1º Bach. Juan José	994
130011	43	5	5	emurielb76	2025-10-30	Econ. Empr. 1º Bach. Cristina Blanco	980
130012	55	6	6	emurielb76	2025-10-30	Latín 4º B Juan José	972
130013	63	6	6	emurielb76	2025-10-30	CC Grales 2º Bach Elena G.	1014
130014	14	7	7	emurielb76	2025-10-30	Hª Filosofía 2º Bach B Carlos	1020
130015	42	7	7	emurielb76	2025-10-30	2º GS Proyecto. Rosa	1009
130016	22	7	7	mji3003	2025-10-30	Inma Molina	\N
130017	45	7	7	emurielb76	2025-10-30	TyD 2º ESO B Miguel	1028
130018	22	1	1	mafloresm01	2025-10-31	Mª Ángeles Flores (INGLÉS)	\N
130019	14	1	1	mtcerezog01	2025-10-31	Teresa 3º A	\N
130020	45	1	1	omsanchezg01	2025-10-31	Olga 3º eso B	\N
130021	62	1	1	emurielb76	2025-10-31	Mates NB 2º ESO A Raquel	964
130022	41	1	1	mebravom01	2025-10-31	3º de la ESO DE RELIGIÓN	\N
130023	22	2	2	emurielb76	2025-10-31	Latín 1º Bach. Juan José	995
130024	14	2	2	omsanchezg01	2025-10-31	OLGA 3º DIVER	\N
130025	43	2	2	emurielb76	2025-10-31	Econ. Empr. 1º Bach. Cristina Blanco	983
130026	55	3	3	emurielb76	2025-10-31	Latín 4º B Juan José	973
130027	8	3	3	emurielb76	2025-10-31	Biología NB 1º ESO A Alba Fajardo	959
130028	14	3	3	omsanchezg01	2025-10-31	OLGA 3º DIVER	\N
130029	45	3	3	emurielb76	2025-10-31	1º Bach AE. Virginia	1033
130030	30	4	4	susana	2025-10-31	CHARLA CENTRO SALUD	\N
130031	22	4	4	emurielb76	2025-10-31	Atendida por Inma	999
130032	41	4	4	mebravom01	2025-10-31	1º Bachillerato de Religión	\N
130033	14	5	5	cjlozanop01	2025-10-31	Carlos J. - Filosofía	\N
130034	22	5	5	emurielb76	2025-10-31	Atendida por Matilde	1004
130035	55	5	5	emurielb76	2025-10-31	Matem. A 4º ESO Raquel	974
130036	63	5	5	emurielb76	2025-10-31	Biología 2º Bach Celia	1012
130037	45	5	5	emurielb76	2025-10-31	TyD  2º ESO A Miguel	1032
130038	63	6	6	emurielb76	2025-10-31	CC Grales 2º Bach Elena G.	1014
130039	43	6	6	mjcorralesg01	2025-10-31	Formulario 3º	\N
130040	55	6	6	emurielb76	2025-10-31	Economía 4º ESO Cristina Blanco	1018
130041	41	6	6	omsanchezg01	2025-10-31	OLGA 4º DIVER	\N
130042	45	6	6	mjcorralesg01	2025-10-31	3º ESO	\N
130043	45	7	7	mebravom01	2025-10-31	M. Eugenia Bravo 4º ESO	\N
130044	43	7	7	emurielb76	2025-10-31	Economía 1º Bach. Cristina Blanco	984
130045	41	7	7	pagarciam27	2025-10-31	Patricia 2ºESO B	\N
130046	14	7	7	emurielb76	2025-10-31	Hª Filosofía 2º Bach B Carlos	1020
130047	14	1	1	emurielb76	2025-11-03	MAITE	989
130048	45	2	2	emurielb76	2025-11-03	Intel. Artif. 1º Bach. Miguel	1022
130049	43	2	2	amfajardol01	2025-11-03	alba bio	\N
130050	8	2	2	emurielb76	2025-11-03	Biología NB 1º ESO A Alba Fajardo	958
130051	42	2	2	emurielb76	2025-11-03	Elena 1º GM	\N
130052	62	2	2	emurielb76	2025-11-03	Mates NB 2º ESO A Raquel	962
130053	22	3	3	emurielb76	2025-11-03	Latín 1º Bach. Juan José	993
130054	14	3	3	emurielb76	2025-11-03	MAITE	990
130055	42	3	5	emurielb76	2025-11-03	2º GS Optativa. Rosa	1007
130056	8	3	3	emurielb76	2025-11-03	Refuerzo Lengua 1º ESO A/B Maribel	960
130057	43	3	3	emurielb76	2025-11-03	Economía 1º Bach. Cristina Blanco	981
130058	45	3	3	emurielb76	2025-11-03	Digit. Básica 1º ESO A/B Miguel	1023
130059	30	4	4	vpalaciosg06	2025-11-03	VIRGINIA	\N
130060	22	4	4	emurielb76	2025-11-03	Atendida por Carlos	996
130061	22	5	5	emurielb76	2025-11-03	Atendida por Inma	1000
130062	63	5	5	emurielb76	2025-11-03	Biología 2º Bach Celia	1013
130063	45	5	5	emurielb76	2025-11-03	Digitalización 4º ESO A/B Miguel	1026
130064	14	6	6	emurielb76	2025-11-03	MAITE	991
130065	22	6	6	emurielb76	2025-11-03	Atendida por Matilde	1002
130066	63	6	6	emurielb76	2025-11-03	CC Grales 2º Bach Elena G.	1014
130067	55	6	6	emurielb76	2025-11-03	Economía 4º ESO Cristina Blanco	1018
130068	43	7	7	omsanchezg01	2025-11-03	OLGA 4º DIVER	\N
130069	67	7	7	ndelorzac02	2025-11-03	Nieves	\N
130070	45	7	7	emurielb76	2025-11-03	TyD 2º ESO B Miguel	1028
130071	55	7	7	emurielb76	2025-11-03	Matem. A 4º ESO Raquel	969
130072	55	1	1	emurielb76	2025-11-04	Latín 4º B Juan José	970
130073	30	1	1	dnarcisoc01	2025-11-04	Lola TLA	\N
130074	67	1	1	isabel22	2025-11-04	isabel panadero	\N
130075	45	1	1	mahernandezr06	2025-11-04	TyD 2º ESO B (Miguel)	\N
130076	43	2	2	emurielb76	2025-11-04	Economía 1º Bach. Cristina Blanco	1037
130077	45	2	2	jjmorcillor01	2025-11-04	Juanjo Morcillo	\N
130078	14	3	3	emurielb76	2025-11-04	Itin. Empl. 1º CFGB Luis	985
130079	45	3	3	emurielb76	2025-11-04	Intel. Artif. 1º Bach. Miguel	1029
130080	67	3	5	ndelorzac02	2025-11-04	Nieves	\N
130081	55	3	3	emurielb76	2025-11-04	Matem. A 4º ESO Raquel	971
130082	43	3	3	isabel22	2025-11-04	isabel panadero	\N
130083	22	4	4	emurielb76	2025-11-04	Atendida por Patricia	998
130084	45	5	5	emurielb76	2025-11-04	Unión Europea Jorge 4º ESO	1021
130085	43	5	5	emurielb76	2025-11-04	Econ. Empr. 1º Bach. Cristina Blanco	980
130086	22	5	5	emurielb76	2025-11-04	Latín 1º Bach. Juan José	994
130087	14	6	6	emurielb76	2025-11-04	Itin. Empl. 1º CFGB Luis	986
130088	62	6	6	emurielb76	2025-11-04	Refuerzo Lengua 2º ESO A/B Juan José	965
130089	40	6	6	emurielb76	2025-11-04	Biología 2º Bach Celia	1017
130090	30	6	7	bcrespoc01	2025-11-04	Bea 1GM	\N
130091	43	6	6	lpcamarac01	2025-11-04	2º ESO Luis Pedro Cámara	\N
130092	45	6	6	mahernandezr06	2025-11-04	Refuerzo científico Miguel	\N
130093	22	6	6	emurielb76	2025-11-04	Atendida por Inma	1001
130094	63	6	6	emurielb76	2025-11-04	Refuerzo Mates 2º ESO A/B INFORM.	967
130095	14	7	7	emurielb76	2025-11-04	Hª Filosofía 2º Bach B Carlos	1020
130096	45	7	7	jjmorcillor01	2025-11-04	Juanjo Morcillo	\N
130097	42	1	2	emurielb76	2025-11-05	Elena 1º GM	\N
130098	45	1	1	emurielb76	2025-11-05	TyD  2º ESO A Miguel	1030
130099	41	1	1	mdcpalaciosr01	2025-11-05	AMBITO PRACTICO 3º DIVER	\N
130100	8	2	2	emurielb76	2025-11-05	Biología NB 1º ESO A Alba Fajardo	958
130101	62	2	2	emurielb76	2025-11-05	Mates NB 2º ESO A Raquel	962
130102	63	2	2	emurielb76	2025-11-05	Biología 2º Bach Celia	1011
130103	14	2	2	emurielb76	2025-11-05	MAITE	992
130104	43	2	2	egonzalezh18	2025-11-05	Elena Gonzalez 1º ESO Biligüe	\N
130105	45	2	2	emurielb76	2025-11-05	Intel. Artif. 1º Bach. Miguel	1022
130106	30	2	2	emurielb76	2025-11-05	Montaña	\N
130107	41	2	2	mdcpalaciosr01	2025-11-05	AMBITO PRACTICO 4º DIVER	\N
130108	55	3	3	emurielb76	2025-11-05	Matem. A 4º ESO Raquel	971
130109	45	3	3	egonzalezh18	2025-11-05	Elena 1º bachillerato	\N
130110	43	3	3	mji3003	2025-11-05	Inma Molina	\N
130111	42	3	3	emurielb76	2025-11-05	1º GM Digitalización. Peti	1005
130112	14	3	3	omsanchezg01	2025-11-05	OLGA 4º DIVER	\N
130113	30	4	4	susana	2025-11-05	CHARLA CENTRO SALUD	\N
130114	22	4	4	emurielb76	2025-11-05	Atendida por Inma	999
130115	45	5	5	emurielb76	2025-11-05	Digit. Básica 1º ESO A/B Miguel	1024
130116	8	5	5	emurielb76	2025-11-05	Refuerzo Lengua 1º ESO A/B Maribel	961
130117	14	5	5	emurielb76	2025-11-05	MAITE	1036
130118	55	5	5	emurielb76	2025-11-05	Economía 4º ESO Cristina Blanco	1019
130119	43	5	5	omsanchezg01	2025-11-05	OLGA APOYO	\N
130120	41	5	5	mafloresm01	2025-11-05	Mª Ángeles Flores (4º ESO-Diver)	\N
130121	63	5	5	emurielb76	2025-11-05	CC Grales 2º Bach Elena G.	1015
130122	45	6	6	emurielb76	2025-11-05	Digitalización 4º ESO A/B Miguel	1031
130123	67	6	7	rmvegac01	2025-11-05	IFAM	\N
130124	43	6	6	emurielb76	2025-11-05	Economía 1º Bach. Cristina Blanco	982
130125	14	6	6	mrcarmonav01	2025-11-05	Remedios Carmona Vinagre 3ºDIVER	\N
130126	41	6	6	egonzalezh18	2025-11-05	Elena González 3º ESO	\N
130127	45	7	7	mrcarmonav01	2025-11-05	Remedios Carmona Vinagre 3ºA	\N
130128	42	7	7	pety78	2025-11-05	Pety	\N
130129	14	7	7	omsanchezg01	2025-11-05	OLGA 3º DIVER	\N
130130	14	1	1	emurielb76	2025-11-06	Itin. Empl. 1º CFGB Luis	987
130131	45	1	1	emurielb76	2025-11-06	Intel. Artif. 1º Bach. Informática	977
130132	43	1	1	emurielb76	2025-11-06	Elena 1º GM	\N
130133	42	2	2	efranciscor01	2025-11-06	2º GM PROYECTO	\N
130134	14	2	2	emurielb76	2025-11-06	Itin. Empl. 1º CFGB Luis	988
130135	43	3	3	emurielb76	2025-11-06	Economía 1º Bach. Cristina Blanco	981
130136	41	3	3	mahernandezr06	2025-11-06	Refuerzo científico Miguel	\N
130137	63	3	3	emurielb76	2025-11-06	Refuerzo Mates 2º ESO A/B INFORM.	968
130138	14	3	3	lpcamarac01	2025-11-06	Luis Pedro Cámara - 2º ESO	\N
130139	62	3	3	emurielb76	2025-11-06	Refuerzo Lengua 2º ESO A/B Juan José	966
130140	45	3	3	mahernandezr06	2025-11-06	Isabel Francés 2º ESO	\N
130141	30	4	4	mmhernandezr01	2025-11-06	montaña	\N
130142	22	4	4	emurielb76	2025-11-06	Atendida por Patricia	998
130143	14	5	5	omsanchezg01	2025-11-06	OLGA 3º DIVER	\N
130144	41	5	5	vpalaciosg06	2025-11-06	GRANI	1038
130145	43	5	5	emurielb76	2025-11-06	Econ. Empr. 1º Bach. Cristina Blanco	980
130146	45	5	5	emurielb76	2025-11-06	Digitalización 4º ESO A/B Miguel	1026
130147	22	5	5	emurielb76	2025-11-06	Latín 1º Bach. Juan José	994
130148	30	5	6	rmvegac01	2025-11-06	DCM	\N
130149	62	5	5	emurielb76	2025-11-06	Mates NB 2º ESO A Raquel	963
130150	55	6	6	emurielb76	2025-11-06	Latín 4º B Juan José	972
130151	63	6	6	emurielb76	2025-11-06	CC Grales 2º Bach Elena G.	1014
130152	45	6	6	jrodriguezt18	2025-11-06	3º ESO B Jorge	\N
130153	45	7	7	emurielb76	2025-11-06	TyD 2º ESO B Miguel	1028
130154	30	7	7	mafloresm01	2025-11-06	Mª Ángeles Flores (2º Bachillerato)	\N
130155	14	7	7	emurielb76	2025-11-06	Hª Filosofía 2º Bach B Carlos	1020
130156	42	7	7	emurielb76	2025-11-06	2º GS Proyecto. Rosa	1009
130157	67	1	2	isabel22	2025-11-07	isabel panadero	\N
130158	14	1	1	mtcerezog01	2025-11-07	Teresa.  3º Atención Educativa	\N
130159	42	1	1	emurielb76	2025-11-07	Elena 1º GM	\N
130160	62	1	1	emurielb76	2025-11-07	Mates NB 2º ESO A Raquel	964
130161	45	1	1	omsanchezg01	2025-11-07	3º ESO B ATENCIÓN EDUCATIVA	\N
130162	42	2	2	dnarcisoc01	2025-11-07	LOLA 1ºGS APSI	\N
130163	22	2	2	emurielb76	2025-11-07	Latín 1º Bach. Juan José	995
130164	14	2	2	omsanchezg01	2025-11-07	OLGA 3º DIVER	\N
130165	43	2	2	emurielb76	2025-11-07	Econ. Empr. 1º Bach. Cristina Blanco	983
130166	45	2	2	mafloresm01	2025-11-07	M ÁNGELES FLORES MARÍA (4º ESO-A)	\N
130167	45	3	3	emurielb76	2025-11-07	1º Bach AE. Virginia	1033
130168	55	3	3	emurielb76	2025-11-07	Latín 4º B Juan José	973
130169	14	3	3	omsanchezg01	2025-11-07	OLGA 3º DIVER	\N
130170	67	3	5	isabel22	2025-11-07	Isabel Panadero	\N
130171	42	3	5	pety78	2025-11-07	Pety	\N
130172	8	3	3	emurielb76	2025-11-07	Biología NB 1º ESO A Alba Fajardo	959
130173	22	4	4	emurielb76	2025-11-07	Atendida por Inma	999
130174	55	5	5	emurielb76	2025-11-07	Matem. A 4º ESO Raquel	974
130175	63	5	5	emurielb76	2025-11-07	Biología 2º Bach Celia	1012
130176	43	5	5	lpcamarac01	2025-11-07	Luis Pedro Cámara - 2º ESO B	\N
130177	45	5	5	emurielb76	2025-11-07	TyD  2º ESO A Miguel	1032
130178	14	5	5	mrcarmonav01	2025-11-07	Remedios Carmona Vinagre 3ºDIVER	\N
130179	41	5	5	vpalaciosg06	2025-11-07	GRANI	1038
130180	22	5	5	emurielb76	2025-11-07	Atendida por Matilde	1004
130181	41	6	6	omsanchezg01	2025-11-07	OLGA 4º DIVER	\N
130182	43	6	6	lpcamarac01	2025-11-07	Luis Pedro Cámara - 1º ESO A	\N
130183	42	6	6	rmvegac01	2025-11-07	Rosa Vega	\N
130184	55	6	6	emurielb76	2025-11-07	Economía 4º ESO Cristina Blanco	1018
130185	63	6	6	emurielb76	2025-11-07	CC Grales 2º Bach Elena G.	1014
130186	42	7	7	rmvegac01	2025-11-07	Proyecto	\N
130187	43	7	7	emurielb76	2025-11-07	Economía 1º Bach. Cristina Blanco	984
130188	45	7	7	mahernandezr06	2025-11-07	Atención Educativa 4º Diver	\N
130189	14	7	7	emurielb76	2025-11-07	Hª Filosofía 2º Bach B Carlos	1020
130190	41	5	5	vpalaciosg06	2025-11-08	GRANI	1038
130191	41	5	5	vpalaciosg06	2025-11-09	GRANI	1038
130192	14	1	1	emurielb76	2025-11-10	MAITE	989
130193	55	1	3	emurielb76	2025-11-10	1º BAch A	\N
130194	47	1	3	emurielb76	2025-11-10	3º ESO A	\N
130195	45	2	2	emurielb76	2025-11-10	Intel. Artif. 1º Bach. Miguel	1022
130196	42	2	2	isabel22	2025-11-10	isabel panadero	\N
130197	8	2	2	emurielb76	2025-11-10	Biología NB 1º ESO A Alba Fajardo	958
130198	62	2	2	emurielb76	2025-11-10	Mates NB 2º ESO A Raquel	962
130199	8	3	3	emurielb76	2025-11-10	Refuerzo Lengua 1º ESO A/B Maribel	960
130200	45	3	3	emurielb76	2025-11-10	Digit. Básica 1º ESO A/B Miguel	1023
130201	41	3	3	ilozano1977	2025-11-10	Isabel Lozano 1º ESO	\N
130202	43	3	3	emurielb76	2025-11-10	Economía 1º Bach. Cristina Blanco	981
130203	22	3	3	emurielb76	2025-11-10	Latín 1º Bach. Juan José	993
130204	14	3	3	emurielb76	2025-11-10	MAITE	990
130205	42	3	5	emurielb76	2025-11-10	2º GS Optativa. Rosa	1007
130206	22	4	4	emurielb76	2025-11-10	Atendida por Carlos	996
130207	30	4	4	sromang06	2025-11-10	"Reunión Meteoescuela"	\N
130208	41	5	5	vpalaciosg06	2025-11-10	GRANI	1038
130209	22	5	5	emurielb76	2025-11-10	Atendida por Inma	1000
130210	43	5	5	lpcamarac01	2025-11-10	Luis Pedro Cámara - 2º ESO A	\N
130211	63	5	5	emurielb76	2025-11-10	Biología 2º Bach Celia	1013
130212	45	5	5	emurielb76	2025-11-10	Digitalización 4º ESO A/B Miguel	1026
130213	55	6	6	emurielb76	2025-11-10	Economía 4º ESO Cristina Blanco	1018
130214	45	6	6	jrodriguezt18	2025-11-10	3º ESO A Jorge	\N
130215	63	6	6	emurielb76	2025-11-10	CC Grales 2º Bach Elena G.	1014
130216	14	6	6	emurielb76	2025-11-10	MAITE	991
130217	22	6	6	emurielb76	2025-11-10	Atendida por Matilde	1002
130218	55	7	7	emurielb76	2025-11-10	Matem. A 4º ESO Raquel	969
130219	43	7	7	lpcamarac01	2025-11-10	Luis Pedro Cámara - 1º ESO B	\N
130220	67	7	7	ndelorzac02	2025-11-10	Nieves	\N
130221	45	7	7	emurielb76	2025-11-10	TyD 2º ESO B Miguel	1028
130222	41	7	7	omsanchezg01	2025-11-10	OLGA 4º DIVER	\N
130223	42	1	1	isabel22	2025-11-11	Isabel Panadero	\N
130224	55	1	1	emurielb76	2025-11-11	Latín 4º B Juan José	970
130225	45	2	2	omsanchezg01	2025-11-11	OLGA 4º DIVER	\N
130226	43	2	2	emurielb76	2025-11-11	Economía 1º Bach. Cristina Blanco	1037
130227	55	3	3	emurielb76	2025-11-11	Matem. A 4º ESO Raquel	971
130228	43	3	3	amfajardol01	2025-11-11	alba	\N
130229	14	3	3	emurielb76	2025-11-11	Itin. Empl. 1º CFGB Luis	985
130230	45	3	3	emurielb76	2025-11-11	Intel. Artif. 1º Bach. Miguel	1029
130231	42	3	3	isabel22	2025-11-11	isabel panadero	\N
130232	22	4	4	emurielb76	2025-11-11	Atendida por Patricia	998
130233	22	5	5	emurielb76	2025-11-11	Latín 1º Bach. Juan José	994
130234	41	5	5	vpalaciosg06	2025-11-11	GRANI	1038
130235	42	5	5	omsanchezg01	2025-11-11	OLGA 3º DIVER	\N
130236	14	5	5	pagarciam27	2025-11-11	Patricia TAE	\N
130237	43	5	5	emurielb76	2025-11-11	Econ. Empr. 1º Bach. Cristina Blanco	980
130238	45	5	5	emurielb76	2025-11-11	Unión Europea Jorge 4º ESO	1021
130239	42	6	7	pety78	2025-11-11	Pety	\N
130240	55	6	6	emurielb76	2025-11-11	Juan Mª 2º Bach	\N
130241	22	6	6	emurielb76	2025-11-11	Atendida por Inma	1001
130242	41	6	6	omsanchezg01	2025-11-11	OLGA 4º DIVER	\N
130243	63	6	6	emurielb76	2025-11-11	Refuerzo Mates 2º ESO A/B INFORM.	967
130244	14	6	6	emurielb76	2025-11-11	Itin. Empl. 1º CFGB Luis	986
130245	62	6	6	emurielb76	2025-11-11	Refuerzo Lengua 2º ESO A/B Juan José	965
130246	40	6	6	emurielb76	2025-11-11	Biología 2º Bach Celia	1017
130247	43	6	6	lpcamarac01	2025-11-11	2º ESO Luis Pedro Cámara	\N
130248	14	7	7	emurielb76	2025-11-11	Hª Filosofía 2º Bach B Carlos	1020
130249	45	7	7	jjmorcillor01	2025-11-11	Juanjo Morcillo	\N
130250	41	7	7	omsanchezg01	2025-11-11	OLGA 4º DIVER	\N
130251	43	1	1	mdcpalaciosr01	2025-11-12	AMBITO PRACTICO 4º DIVER	\N
130252	45	1	1	emurielb76	2025-11-12	TyD  2º ESO A Miguel	1030
130253	43	2	2	mdcpalaciosr01	2025-11-12	AMBITO PRACTICO 3º DIVER	\N
130254	45	2	2	emurielb76	2025-11-12	Intel. Artif. 1º Bach. Miguel	1022
130255	41	2	2	omsanchezg01	2025-11-12	OLGA 4º DIVER	\N
130256	63	2	2	emurielb76	2025-11-12	Biología 2º Bach Celia	1011
130257	14	2	2	emurielb76	2025-11-12	MAITE	992
130258	8	2	2	emurielb76	2025-11-12	Biología NB 1º ESO A Alba Fajardo	958
130259	62	2	2	emurielb76	2025-11-12	Mates NB 2º ESO A Raquel	962
130260	42	3	3	emurielb76	2025-11-12	1º GM Digitalización. Peti	1005
130261	55	3	3	emurielb76	2025-11-12	Matem. A 4º ESO Raquel	971
130262	22	4	4	emurielb76	2025-11-12	Atendida por Inma	999
130263	42	5	5	isabel22	2025-11-12	isabel panadero	\N
130264	63	5	5	emurielb76	2025-11-12	CC Grales 2º Bach Elena G.	1015
130265	45	5	5	emurielb76	2025-11-12	Digit. Básica 1º ESO A/B Miguel	1024
130266	8	5	5	emurielb76	2025-11-12	Refuerzo Lengua 1º ESO A/B Maribel	961
130267	14	5	5	emurielb76	2025-11-12	MAITE	1036
130268	55	5	5	emurielb76	2025-11-12	Economía 4º ESO Cristina Blanco	1019
130269	41	5	5	vpalaciosg06	2025-11-12	GRANI	1038
130270	43	6	6	emurielb76	2025-11-12	Economía 1º Bach. Cristina Blanco	982
130271	67	6	6	isabel22	2025-11-12	isabel panadero	\N
130272	45	6	6	emurielb76	2025-11-12	Digitalización 4º ESO A/B Miguel	1031
130273	14	7	7	omsanchezg01	2025-11-12	OLGA 3º DIVER	\N
130274	42	7	7	emurielb76	2025-11-12	1º GS Digitalización. Peti	1040
130275	41	1	1	omsanchezg01	2025-11-13	OLGA 4º DIVER	\N
130276	45	1	1	emurielb76	2025-11-13	Intel. Artif. 1º Bach. Informática	977
130277	47	1	1	emurielb76	2025-11-13	4º ESO	\N
130278	42	1	1	dnarcisoc01	2025-11-13	Lola TLA	\N
130279	14	1	1	emurielb76	2025-11-13	Itin. Empl. 1º CFGB Luis	987
130280	55	1	1	emurielb76	2025-11-13	4º eso	\N
130281	22	2	2	cjlozanop01	2025-11-13	Carlos. J. Filosofía	\N
130282	14	2	2	emurielb76	2025-11-13	Itin. Empl. 1º CFGB Luis	988
130283	42	2	2	efranciscor01	2025-11-13	Proyecto 2GM	\N
130284	41	2	2	pagarciam27	2025-11-13	Patricia TAE	\N
130285	67	2	2	ilozano1977	2025-11-13	Isabel Lozano	\N
130286	63	3	3	emurielb76	2025-11-13	Refuerzo Mates 2º ESO A/B INFORM.	968
130287	43	3	3	emurielb76	2025-11-13	Economía 1º Bach. Cristina Blanco	981
130288	62	3	3	emurielb76	2025-11-13	Refuerzo Lengua 2º ESO A/B Juan José	966
130289	41	3	3	dmatasr01	2025-11-13	David Matas	\N
130290	45	3	3	ilozano1977	2025-11-13	Isabel Lozano 2 ESO	\N
130291	22	4	4	emurielb76	2025-11-13	Atendida por Patricia	998
130292	42	5	5	isabel22	2025-11-13	isabel panadero	\N
130293	43	5	5	emurielb76	2025-11-13	Econ. Empr. 1º Bach. Cristina Blanco	980
130294	41	5	5	vpalaciosg06	2025-11-13	GRANI	1038
130295	45	5	5	emurielb76	2025-11-13	Digitalización 4º ESO A/B Miguel	1026
130296	62	5	5	emurielb76	2025-11-13	Mates NB 2º ESO A Raquel	963
130297	22	5	5	emurielb76	2025-11-13	Latín 1º Bach. Juan José	994
130298	67	6	6	ndelorzac02	2025-11-13	Nieves	\N
130299	63	6	6	emurielb76	2025-11-13	CC Grales 2º Bach Elena G.	1014
130300	22	6	6	vpalaciosg06	2025-11-13	VIRGINIA	\N
130301	45	6	6	mjcorralesg01	2025-11-13	1º de ESO	\N
130302	55	6	6	emurielb76	2025-11-13	Latín 4º B Juan José	972
130303	41	7	7	emparrag02	2025-11-13	Elisa Parra LCL	\N
130304	45	7	7	emurielb76	2025-11-13	TyD 2º ESO B Miguel	1028
130305	67	7	7	celita2	2025-11-13	celia 4º eso	\N
130306	42	7	7	emurielb76	2025-11-13	2º GS Proyecto. Rosa	1009
130307	14	7	7	emurielb76	2025-11-13	Hª Filosofía 2º Bach B Carlos	1020
130308	43	7	7	mji3003	2025-11-13	Inma Molina	\N
130309	62	1	1	emurielb76	2025-11-14	Mates NB 2º ESO A Raquel	964
130310	41	1	1	mebravom01	2025-11-14	3º de la ESO DE RELIGIÓN	\N
130311	42	1	2	isabel22	2025-11-14	isabel panadero	\N
130312	14	1	1	mtcerezog01	2025-11-14	Teresa.  3º Atención Educativa	\N
130313	45	1	1	omsanchezg01	2025-11-14	OLGA 3ºeso ´B	\N
130314	43	2	2	emurielb76	2025-11-14	Econ. Empr. 1º Bach. Cristina Blanco	983
130315	14	2	2	omsanchezg01	2025-11-14	OLGA 3º DIVER	\N
130316	22	2	2	emurielb76	2025-11-14	Latín 1º Bach. Juan José	995
130317	41	2	2	mebravom01	2025-11-14	2º ESO Reli	\N
130318	30	3	4	pety78	2025-11-14	Pety	\N
130319	43	3	3	sromang06	2025-11-14	2ºB física y química	\N
130320	55	3	3	emurielb76	2025-11-14	Latín 4º B Juan José	973
130321	8	3	3	emurielb76	2025-11-14	Biología NB 1º ESO A Alba Fajardo	959
130322	41	3	3	mebravom01	2025-11-14	1º Bachillerato de Religión	\N
130323	67	3	3	ilozano1977	2025-11-14	Isabel Lozano	\N
130324	45	3	3	emurielb76	2025-11-14	1º Bach AE. Virginia	1033
130325	22	4	4	emurielb76	2025-11-14	Atendida por Inma	999
130326	43	5	5	lpcamarac01	2025-11-14	Luis Pedro Cámara - 2º ESO B	\N
130327	41	5	5	vpalaciosg06	2025-11-14	GRANI	1038
130328	63	5	5	emurielb76	2025-11-14	Biología 2º Bach Celia	1012
130329	45	5	5	emurielb76	2025-11-14	TyD  2º ESO A Miguel	1032
130330	14	5	5	mrcarmonav01	2025-11-14	Remedios Carmona Vinagre 3ºDIVER	\N
130331	22	5	5	emurielb76	2025-11-14	Atendida por Matilde	1004
130332	67	5	5	isabel22	2025-11-14	isabel panadero	\N
130333	55	5	5	emurielb76	2025-11-14	Matem. A 4º ESO Raquel	974
130334	45	6	6	sromang06	2025-11-14	2ºA física y química	\N
130335	41	6	6	omsanchezg01	2025-11-14	OLGA 4º DIVER	\N
130336	30	6	6	amfajardol01	2025-11-14	alba PAUX examen	\N
130337	43	6	6	lpcamarac01	2025-11-14	Luis Pedro Cámara - 1º ESO A	\N
130338	63	6	6	emurielb76	2025-11-14	CC Grales 2º Bach Elena G.	1014
130339	55	6	6	emurielb76	2025-11-14	Economía 4º ESO Cristina Blanco	1018
130340	14	6	6	celita2	2025-11-14	celia 4º eso	\N
130341	42	7	7	emparrag02	2025-11-14	ELISA 2eso	\N
130342	55	7	7	mebravom01	2025-11-14	4º ESO Reli	\N
130343	14	7	7	emurielb76	2025-11-14	Hª Filosofía 2º Bach B Carlos	1020
130344	45	7	7	mahernandezr06	2025-11-14	4 Diver	\N
130345	43	7	7	emurielb76	2025-11-14	Economía 1º Bach. Cristina Blanco	984
130346	41	5	5	vpalaciosg06	2025-11-15	GRANI	1038
130347	41	5	5	vpalaciosg06	2025-11-16	GRANI	1038
130348	30	1	2	emurielb76	2025-11-17	Elena Muriel 1º GM	\N
130349	14	1	1	emurielb76	2025-11-17	MAITE	989
130350	8	2	2	emurielb76	2025-11-17	Biología NB 1º ESO A Alba Fajardo	958
130351	62	2	2	emurielb76	2025-11-17	Mates NB 2º ESO A Raquel	962
130352	42	2	2	isabel22	2025-11-17	isabel panadero	\N
130353	63	2	2	sromang06	2025-11-17	2 bachillerato quimica	\N
130354	43	2	2	ilozano1977	2025-11-17	Isabel Lozano	\N
130355	45	2	2	emurielb76	2025-11-17	Intel. Artif. 1º Bach. Miguel	1022
130356	43	3	3	emurielb76	2025-11-17	Economía 1º Bach. Cristina Blanco	981
130357	22	3	3	emurielb76	2025-11-17	Latín 1º Bach. Juan José	993
130358	14	3	3	emurielb76	2025-11-17	MAITE	990
130359	42	3	5	emurielb76	2025-11-17	2º GS Optativa. Rosa	1007
130360	8	3	3	emurielb76	2025-11-17	Refuerzo Lengua 1º ESO A/B Maribel	960
130361	45	3	3	emurielb76	2025-11-17	Digit. Básica 1º ESO A/B Miguel	1023
130362	63	3	3	sromang06	2025-11-17	2 bachillerato quimica	\N
130363	22	4	4	emurielb76	2025-11-17	Atendida por Carlos	996
130364	45	5	5	emurielb76	2025-11-17	Digitalización 4º ESO A/B Miguel	1026
130365	22	5	5	emurielb76	2025-11-17	Atendida por Inma	1000
130366	63	5	5	emurielb76	2025-11-17	Biología 2º Bach Celia	1013
130367	41	5	5	vpalaciosg06	2025-11-17	GRANI	1038
130368	14	6	6	emurielb76	2025-11-17	MAITE	991
130369	30	6	6	bcrespoc01	2025-11-17	BEATRIZ CRESPO	\N
130370	67	6	6	mtcerezog01	2025-11-17	Teresa 3º diver	\N
130371	63	6	6	emurielb76	2025-11-17	CC Grales 2º Bach Elena G.	1014
130372	55	6	6	emurielb76	2025-11-17	Economía 4º ESO Cristina Blanco	1018
130373	22	6	6	emurielb76	2025-11-17	Atendida por Matilde	1002
130374	42	6	7	isabel22	2025-11-17	Rosa vega	\N
130375	41	7	7	omsanchezg01	2025-11-17	OLGA 4º DIVER	\N
130376	55	7	7	emurielb76	2025-11-17	Matem. A 4º ESO Raquel	969
130377	45	7	7	emurielb76	2025-11-17	TyD 2º ESO B Miguel	1028
130378	84	7	7	omsanchezg01	2025-11-17	4º diver	\N
130379	55	1	1	emurielb76	2025-11-18	Latín 4º B Juan José	970
130380	42	1	1	isabel22	2025-11-18	isabel panadero	\N
130381	30	1	1	susana	2025-11-18	CHALA PROPREFAME (1º ESO B)	\N
130382	43	2	2	emurielb76	2025-11-18	Economía 1º Bach. Cristina Blanco	1037
130383	55	3	3	emurielb76	2025-11-18	Matem. A 4º ESO Raquel	971
130384	14	3	3	emurielb76	2025-11-18	Itin. Empl. 1º CFGB Luis	985
130385	45	3	3	emurielb76	2025-11-18	Intel. Artif. 1º Bach. Miguel	1029
130386	67	3	3	omsanchezg01	2025-11-18	OLGA 3º DIVER	\N
130387	22	4	4	emurielb76	2025-11-18	Atendida por Patricia	998
130388	43	4	4	pagarciam27	2025-11-18	Patricia TAE	\N
130389	67	4	4	omsanchezg01	2025-11-18	OLGA 3º DIVER	\N
130390	43	5	5	emurielb76	2025-11-18	Econ. Empr. 1º Bach. Cristina Blanco	980
130391	14	5	5	dmatasr01	2025-11-18	David Matas	\N
130392	22	5	5	emurielb76	2025-11-18	Latín 1º Bach. Juan José	994
130393	45	5	5	emurielb76	2025-11-18	Unión Europea Jorge 4º ESO	1021
130394	41	5	5	vpalaciosg06	2025-11-18	GRANI	1038
130395	67	5	5	ilozano1977	2025-11-18	Isabel Lozano	\N
130396	41	6	6	omsanchezg01	2025-11-18	OLGA 4º DIVER	\N
130397	43	6	6	lpcamarac01	2025-11-18	2º ESO Luis Pedro Cámara	\N
130398	45	6	6	ilozano1977	2025-11-18	Isabel Lozano 2 ESO	\N
130399	63	6	6	emurielb76	2025-11-18	Refuerzo Mates 2º ESO A/B INFORM.	967
130400	67	6	6	mahernandezr06	2025-11-18	Refuerzo Científico (Miguel)	\N
130401	14	6	6	emurielb76	2025-11-18	Itin. Empl. 1º CFGB Luis	986
130402	62	6	6	emurielb76	2025-11-18	Refuerzo Lengua 2º ESO A/B Juan José	965
130403	40	6	6	emurielb76	2025-11-18	Biología 2º Bach Celia	1017
130404	22	6	6	emurielb76	2025-11-18	Atendida por Inma	1001
130405	14	7	7	emurielb76	2025-11-18	Hª Filosofía 2º Bach B Carlos	1020
130406	41	7	7	omsanchezg01	2025-11-18	OLGA 4º DIVER	\N
130407	45	1	1	emurielb76	2025-11-19	TyD  2º ESO A Miguel	1030
130408	41	1	1	mdcpalaciosr01	2025-11-19	AMBITO PRACTICO 4º DIVER	\N
130409	67	2	2	egonzalezh18	2025-11-19	Elena Gonzalez 1º ESO Biligüe	\N
130410	45	2	2	emurielb76	2025-11-19	Intel. Artif. 1º Bach. Miguel	1022
130411	41	2	2	mdcpalaciosr01	2025-11-19	AMBITO PRACTICO 3º DIVER	\N
130412	8	2	2	emurielb76	2025-11-19	Biología NB 1º ESO A Alba Fajardo	958
130413	62	2	2	emurielb76	2025-11-19	Mates NB 2º ESO A Raquel	962
130414	63	2	2	emurielb76	2025-11-19	Biología 2º Bach Celia	1011
130415	43	2	2	ilozano1977	2025-11-19	Isabel Lozano	\N
130416	42	2	2	emurielb76	2025-11-19	Elena 1º GM	\N
130417	14	2	2	emurielb76	2025-11-19	MAITE	992
130418	14	3	3	mtcerezog01	2025-11-19	Teresa 3º diver	\N
130419	55	3	3	emurielb76	2025-11-19	Matem. A 4º ESO Raquel	971
130420	42	3	3	emurielb76	2025-11-19	1º GM Digitalización. Peti	1005
130421	22	4	4	emurielb76	2025-11-19	Atendida por Inma	999
130422	63	5	5	emurielb76	2025-11-19	CC Grales 2º Bach Elena G.	1015
130423	41	5	5	vpalaciosg06	2025-11-19	GRANI	1038
130424	45	5	5	emurielb76	2025-11-19	Digit. Básica 1º ESO A/B Miguel	1024
130425	8	5	5	emurielb76	2025-11-19	Refuerzo Lengua 1º ESO A/B Maribel	961
130426	14	5	5	emurielb76	2025-11-19	MAITE	1036
130427	55	5	5	emurielb76	2025-11-19	Economía 4º ESO Cristina Blanco	1019
130428	45	6	6	emurielb76	2025-11-19	Digitalización 4º ESO A/B Miguel	1031
130429	42	6	6	pety78	2025-11-19	Pety	\N
130430	43	6	6	emurielb76	2025-11-19	Economía 1º Bach. Cristina Blanco	982
130431	42	7	7	emurielb76	2025-11-19	1º GS Digitalización. Peti	1040
130432	43	7	7	mji3003	2025-11-19	Inma Molina	\N
130433	45	7	7	mrcarmonav01	2025-11-19	Remedios Carmona Vinagre 3ºA	\N
130434	14	7	7	omsanchezg01	2025-11-19	OLGA 3º DIVER	\N
130435	67	1	1	ndelorzac02	2025-11-20	nieves	\N
130436	41	1	1	omsanchezg01	2025-11-20	OLGA 4º DIVER	\N
130437	14	1	1	emurielb76	2025-11-20	Itin. Empl. 1º CFGB Luis	987
130438	45	1	1	emurielb76	2025-11-20	Intel. Artif. 1º Bach. Informática	977
130439	41	2	2	emurielb76	2025-11-20	Elena 1º GM	\N
130440	63	2	2	emurielb76	2025-11-20	Raquel apoyo	1039
130441	22	2	2	cjlozanop01	2025-11-20	Carlos. J. Filosofía	\N
130442	14	2	2	emurielb76	2025-11-20	Itin. Empl. 1º CFGB Luis	988
130443	42	2	2	efranciscor01	2025-11-20	PROYECTO 2GM	\N
130444	62	3	3	emurielb76	2025-11-20	Refuerzo Lengua 2º ESO A/B Juan José	966
130445	22	3	3	pagarciam27	2025-11-20	Patricia TAE	\N
130446	14	3	3	lpcamarac01	2025-11-20	2º ESO Luis Pedro Cámara	\N
130447	43	3	3	emurielb76	2025-11-20	Economía 1º Bach. Cristina Blanco	981
130448	63	3	3	emurielb76	2025-11-20	Refuerzo Mates 2º ESO A/B INFORM.	968
130449	22	4	4	emurielb76	2025-11-20	Atendida por Patricia	998
130450	47	5	5	jrodriguezt18	2025-11-20	3º ESO A Jorge	\N
130451	22	5	5	emurielb76	2025-11-20	Latín 1º Bach. Juan José	994
130452	62	5	5	emurielb76	2025-11-20	Mates NB 2º ESO A Raquel	963
130453	14	5	5	omsanchezg01	2025-11-20	OLGA 3º DIVER	\N
130454	43	5	5	emurielb76	2025-11-20	Econ. Empr. 1º Bach. Cristina Blanco	980
130455	42	5	5	isabel22	2025-11-20	isabel panadero	\N
130456	45	5	5	emurielb76	2025-11-20	Digitalización 4º ESO A/B Miguel	1026
130457	41	5	5	vpalaciosg06	2025-11-20	GRANI	1038
130458	63	6	6	emurielb76	2025-11-20	CC Grales 2º Bach Elena G.	1014
130459	45	6	6	jrodriguezt18	2025-11-20	3º ESO B Jorge	\N
130460	42	6	6	isabel22	2025-11-20	Rosa vega	\N
130461	55	6	6	emurielb76	2025-11-20	Latín 4º B Juan José	972
130462	42	7	7	emurielb76	2025-11-20	2º GS Proyecto. Rosa	1009
130463	8	7	7	mebravom01	2025-11-20	1º eso	\N
130464	45	7	7	emurielb76	2025-11-20	TyD 2º ESO B Miguel	1028
130465	14	7	7	emurielb76	2025-11-20	Hª Filosofía 2º Bach B Carlos	1020
130466	41	7	7	emparrag02	2025-11-20	Elisa Parra LCL	\N
130467	55	7	7	mebravom01	2025-11-20	1º eso	\N
130468	45	1	1	omsanchezg01	2025-11-21	Olga 3º ESO B ATENCIÓN EDUCATIVA	\N
130469	42	1	1	emurielb76	2025-11-21	Elena 1º GM	\N
130470	62	1	1	emurielb76	2025-11-21	Mates NB 2º ESO A Raquel	964
130471	14	1	1	mtcerezog01	2025-11-21	Teresa.  3º Atención Educativa	\N
130472	14	2	2	omsanchezg01	2025-11-21	OLGA 3º DIVER	\N
130473	45	2	2	egonzalezh18	2025-11-21	Elena Gonzalez	\N
130474	22	2	2	emurielb76	2025-11-21	Latín 1º Bach. Juan José	995
130475	43	2	2	emurielb76	2025-11-21	Econ. Empr. 1º Bach. Cristina Blanco	983
130476	42	2	2	isabel22	2025-11-21	isabel panadero	\N
130477	8	3	3	emurielb76	2025-11-21	Biología NB 1º ESO A Alba Fajardo	959
130478	45	3	3	emurielb76	2025-11-21	1º Bach AE. Virginia	1033
130479	14	3	3	omsanchezg01	2025-11-21	OLGA 3º DIVER	\N
130480	41	3	3	mtcerezog01	2025-11-21	Teresa 4º Diver	\N
130481	43	3	3	sromang06	2025-11-21	2ºB física y química	\N
130482	55	3	3	emurielb76	2025-11-21	Latín 4º B Juan José	973
130483	22	4	4	emurielb76	2025-11-21	Atendida por Inma	999
130484	22	5	5	emurielb76	2025-11-21	Atendida por Matilde	1004
130485	41	5	5	vpalaciosg06	2025-11-21	GRANI	1038
130486	55	5	5	emurielb76	2025-11-21	Matem. A 4º ESO Raquel	974
130487	43	5	5	lpcamarac01	2025-11-21	Luis Pedro Cámara - 2º ESO B	\N
130488	67	5	5	ndelorzac02	2025-11-21	nieves	\N
130489	63	5	5	emurielb76	2025-11-21	Biología 2º Bach Celia	1012
130490	45	5	5	emurielb76	2025-11-21	TyD  2º ESO A Miguel	1032
130491	14	5	5	mrcarmonav01	2025-11-21	Remedios Carmona Vinagre 3ºDIVER	\N
130492	55	6	6	emurielb76	2025-11-21	Economía 4º ESO Cristina Blanco	1018
130493	43	6	6	lpcamarac01	2025-11-21	Luis Pedro Cámara - 1º ESO A	\N
130494	41	6	6	omsanchezg01	2025-11-21	OLGA 4º DIVER	\N
130495	63	6	6	emurielb76	2025-11-21	CC Grales 2º Bach Elena G.	1014
130496	45	6	6	sromang06	2025-11-21	2ºA física y química	\N
130497	30	7	7	emurielb76	2025-11-21	Juanjo Guardia 4º ESO	\N
130498	14	7	7	emurielb76	2025-11-21	Hª Filosofía 2º Bach B Carlos	1020
130499	41	7	7	emparrag02	2025-11-21	Elisa Parra LCL	\N
130500	43	7	7	emurielb76	2025-11-21	Economía 1º Bach. Cristina Blanco	984
130501	67	7	7	mtcerezog01	2025-11-21	Teresa 3º Diver.	\N
130502	45	7	7	djuliog01	2025-11-21	Diana Julio (1ºB)	\N
130503	41	5	5	vpalaciosg06	2025-11-22	GRANI	1038
130504	41	5	5	vpalaciosg06	2025-11-23	GRANI	1038
130505	42	1	2	emurielb76	2025-11-24	Elena Muriel 1º GM	\N
130506	14	1	1	emurielb76	2025-11-24	MAITE	989
130507	14	2	2	omsanchezg01	2025-11-24	OLGA 3º DIVER	\N
130508	8	2	2	emurielb76	2025-11-24	Biología NB 1º ESO A Alba Fajardo	958
130509	62	2	2	emurielb76	2025-11-24	Mates NB 2º ESO A Raquel	962
130510	45	2	2	emurielb76	2025-11-24	Intel. Artif. 1º Bach. Miguel	1022
130511	22	3	3	emurielb76	2025-11-24	Latín 1º Bach. Juan José	993
130512	14	3	3	emurielb76	2025-11-24	MAITE	990
130513	42	3	5	emurielb76	2025-11-24	2º GS Optativa. Rosa	1007
130514	43	3	3	emurielb76	2025-11-24	Economía 1º Bach. Cristina Blanco	981
130515	8	3	3	emurielb76	2025-11-24	Refuerzo Lengua 1º ESO A/B Maribel	960
130516	67	3	5	pety78	2025-11-24	Pety	\N
130517	45	3	3	emurielb76	2025-11-24	Digit. Básica 1º ESO A/B Miguel	1023
130518	22	4	4	emurielb76	2025-11-24	Atendida por Carlos	996
130519	63	5	5	emurielb76	2025-11-24	Biología 2º Bach Celia	1013
130520	41	5	5	vpalaciosg06	2025-11-24	GRANI	1038
130521	45	5	5	emurielb76	2025-11-24	Digitalización 4º ESO A/B Miguel	1026
130522	22	5	5	emurielb76	2025-11-24	Atendida por Inma	1000
130523	43	5	5	lpcamarac01	2025-11-24	Luis Pedro Cámara - 2º ESO A	\N
130524	22	6	6	emurielb76	2025-11-24	Atendida por Matilde	1002
130525	63	6	6	emurielb76	2025-11-24	CC Grales 2º Bach Elena G.	1014
130526	55	6	6	emurielb76	2025-11-24	Economía 4º ESO Cristina Blanco	1018
130527	14	6	6	emurielb76	2025-11-24	MAITE	991
130528	67	6	6	mtcerezog01	2025-11-24	Teresa 3º Diver	\N
130529	41	7	7	omsanchezg01	2025-11-24	OLGA 4º DIVER	\N
130530	45	7	7	emurielb76	2025-11-24	TyD 2º ESO B Miguel	1028
130531	55	7	7	emurielb76	2025-11-24	Matem. A 4º ESO Raquel	969
130532	43	7	7	lpcamarac01	2025-11-24	Luis Pedro Cámara - 1º ESO B	\N
130533	22	7	7	mji3003	2025-11-24	Inma Molina	\N
130534	55	1	1	emurielb76	2025-11-25	Latín 4º B Juan José	970
130535	42	1	1	emurielb76	2025-11-25	Elena 1º GM	\N
130536	30	1	2	susana	2025-11-25	CHARLA TRATA DE PERSONAS	\N
130537	43	2	2	emurielb76	2025-11-25	Economía 1º Bach. Cristina Blanco	1037
130538	45	3	3	emurielb76	2025-11-25	Intel. Artif. 1º Bach. Miguel	1029
130539	42	3	5	pety78	2025-11-25	Pety	\N
130540	55	3	3	emurielb76	2025-11-25	Matem. A 4º ESO Raquel	971
130541	67	3	3	omsanchezg01	2025-11-25	OLGA 3º DIVER	\N
130542	14	3	3	emurielb76	2025-11-25	Itin. Empl. 1º CFGB Luis	985
130543	22	4	4	emurielb76	2025-11-25	Atendida por Patricia	998
130544	45	5	5	emurielb76	2025-11-25	Unión Europea Jorge 4º ESO	1021
130545	43	5	5	emurielb76	2025-11-25	Econ. Empr. 1º Bach. Cristina Blanco	980
130546	30	5	5	igomezc12	2025-11-25	Isabel Gomez Crespo	\N
130547	8	5	5	amfajardol01	2025-11-25	alba AH examen	\N
130548	22	5	5	emurielb76	2025-11-25	Latín 1º Bach. Juan José	994
130549	67	5	5	lmoralesg04	2025-11-25	LUIS MORALES	\N
130550	14	5	5	omsanchezg01	2025-11-25	OLGA 3º DIVER	\N
130551	41	5	5	vpalaciosg06	2025-11-25	GRANI	1038
130552	62	6	6	emurielb76	2025-11-25	Refuerzo Lengua 2º ESO A/B Juan José	965
130553	43	6	6	lpcamarac01	2025-11-25	2º ESO Luis Pedro Cámara	\N
130554	40	6	6	emurielb76	2025-11-25	Biología 2º Bach Celia	1017
130555	45	6	6	celita2	2025-11-25	RAQUEL 1ºESO	\N
130556	41	6	6	omsanchezg01	2025-11-25	OLGA 4º DIVER	\N
130557	22	6	6	emurielb76	2025-11-25	Atendida por Inma	1001
130558	30	6	7	bcrespoc01	2025-11-25	Bea 1GM	\N
130559	63	6	6	emurielb76	2025-11-25	Refuerzo Mates 2º ESO A/B INFORM.	967
130560	14	6	6	emurielb76	2025-11-25	Itin. Empl. 1º CFGB Luis	986
130561	41	7	7	jjmorcillor01	2025-11-25	Juanjo Morcillo	\N
130562	45	7	7	emparrag02	2025-11-25	Elisa Parra LCL 2º ESO	\N
130563	14	7	7	emurielb76	2025-11-25	Hª Filosofía 2º Bach B Carlos	1020
130564	45	1	1	emurielb76	2025-11-26	TyD  2º ESO A Miguel	1030
130565	14	1	1	mtcerezog01	2025-11-26	Teresa 3º Diver	\N
130566	41	1	1	mdcpalaciosr01	2025-11-26	AMBITO PRÁCTICO 4º DIVER	\N
130567	42	1	2	emurielb76	2025-11-26	Elena. 1º GM	\N
130568	30	2	2	isabel22	2025-11-26	isabel panadero	\N
130569	63	2	2	emurielb76	2025-11-26	Biología 2º Bach Celia	1011
130570	14	2	2	emurielb76	2025-11-26	MAITE	992
130571	45	2	2	emurielb76	2025-11-26	Intel. Artif. 1º Bach. Miguel	1022
130572	41	2	2	mdcpalaciosr01	2025-11-26	AMBITO PRÁCTICO 3º DIVER	\N
130573	8	2	2	emurielb76	2025-11-26	Biología NB 1º ESO A Alba Fajardo	958
130574	62	2	2	emurielb76	2025-11-26	Mates NB 2º ESO A Raquel	962
130575	55	3	3	emurielb76	2025-11-26	Matem. A 4º ESO Raquel	971
130576	42	3	3	emurielb76	2025-11-26	1º GM Digitalización. Peti	1005
130577	14	3	3	mtcerezog01	2025-11-26	Teresa 3º Diver	\N
130578	22	4	4	emurielb76	2025-11-26	Atendida por Inma	999
130579	42	5	5	bcrespoc01	2025-11-26	Bea 2º GM	\N
130580	14	5	5	emurielb76	2025-11-26	MAITE	1036
130581	55	5	5	emurielb76	2025-11-26	Economía 4º ESO Cristina Blanco	1019
130582	67	5	5	omsanchezg01	2025-11-26	OLGA APOYO 1º eso	\N
130583	41	5	5	vpalaciosg06	2025-11-26	GRANI	1038
130584	43	5	5	mafloresm01	2025-11-26	Mª Ángeles Flores (4º ESO-Diver)	\N
130585	63	5	5	emurielb76	2025-11-26	CC Grales 2º Bach Elena G.	1015
130586	45	5	5	emurielb76	2025-11-26	Digit. Básica 1º ESO A/B Miguel	1024
130587	8	5	5	emurielb76	2025-11-26	Refuerzo Lengua 1º ESO A/B Maribel	961
130588	30	6	7	rmvegac01	2025-11-26	IFAM	\N
130589	43	6	6	emurielb76	2025-11-26	Economía 1º Bach. Cristina Blanco	982
130590	47	6	6	cblancoa02	2025-11-26	Cristina Blanco Ávila	\N
130591	42	6	6	egonzalezh18	2025-11-26	Elena González 3º ESO	\N
130592	41	6	6	egonzalezh18	2025-11-26	Elena González 3º ESO	\N
130593	45	6	6	emurielb76	2025-11-26	Digitalización 4º ESO A/B Miguel	1031
130594	42	7	7	emurielb76	2025-11-26	1º GS Digitalización. Peti	1040
130595	41	7	7	pety78	2025-11-26	Pety	\N
130596	45	7	7	omsanchezg01	2025-11-26	OLGA 3º DIVER	\N
130597	45	1	1	emurielb76	2025-11-27	Intel. Artif. 1º Bach. Informática	977
130598	14	1	1	emurielb76	2025-11-27	Itin. Empl. 1º CFGB Luis	987
130599	14	2	2	emurielb76	2025-11-27	Itin. Empl. 1º CFGB Luis	988
130600	63	2	2	emurielb76	2025-11-27	Raquel apoyo	1039
130601	42	2	2	efranciscor01	2025-11-27	PROYECTO 2GM	\N
130602	63	3	3	emurielb76	2025-11-27	Refuerzo Mates 2º ESO A/B INFORM.	968
130603	62	3	3	emurielb76	2025-11-27	Refuerzo Lengua 2º ESO A/B Juan José	966
130604	43	3	3	emurielb76	2025-11-27	Economía 1º Bach. Cristina Blanco	981
130605	22	4	4	emurielb76	2025-11-27	Atendida por Patricia	998
130606	45	5	5	emurielb76	2025-11-27	Digitalización 4º ESO A/B Miguel	1026
130607	41	5	5	vpalaciosg06	2025-11-27	GRANI	1038
130608	22	5	5	emurielb76	2025-11-27	Latín 1º Bach. Juan José	994
130609	62	5	5	emurielb76	2025-11-27	Mates NB 2º ESO A Raquel	963
130610	43	5	5	emurielb76	2025-11-27	Econ. Empr. 1º Bach. Cristina Blanco	980
130611	55	6	6	emurielb76	2025-11-27	Latín 4º B Juan José	972
130612	63	6	6	emurielb76	2025-11-27	CC Grales 2º Bach Elena G.	1014
130613	14	7	7	emurielb76	2025-11-27	Hª Filosofía 2º Bach B Carlos	1020
130614	45	7	7	emurielb76	2025-11-27	TyD 2º ESO B Miguel	1028
130615	42	7	7	emurielb76	2025-11-27	2º GS Proyecto. Rosa	1009
130616	62	1	1	emurielb76	2025-11-28	Mates NB 2º ESO A Raquel	964
130617	22	2	2	emurielb76	2025-11-28	Latín 1º Bach. Juan José	995
130618	43	2	2	emurielb76	2025-11-28	Econ. Empr. 1º Bach. Cristina Blanco	983
130619	45	3	3	emurielb76	2025-11-28	1º Bach AE. Virginia	1033
130620	55	3	3	emurielb76	2025-11-28	Latín 4º B Juan José	973
130621	8	3	3	emurielb76	2025-11-28	Biología NB 1º ESO A Alba Fajardo	959
130622	22	4	4	emurielb76	2025-11-28	Atendida por Inma	999
130623	55	5	5	emurielb76	2025-11-28	Matem. A 4º ESO Raquel	974
130624	63	5	5	emurielb76	2025-11-28	Biología 2º Bach Celia	1012
130625	45	5	5	emurielb76	2025-11-28	TyD  2º ESO A Miguel	1032
130626	22	5	5	emurielb76	2025-11-28	Atendida por Matilde	1004
130627	41	5	5	vpalaciosg06	2025-11-28	GRANI	1038
130628	55	6	6	emurielb76	2025-11-28	Economía 4º ESO Cristina Blanco	1018
130629	63	6	6	emurielb76	2025-11-28	CC Grales 2º Bach Elena G.	1014
130630	43	7	7	emurielb76	2025-11-28	Economía 1º Bach. Cristina Blanco	984
130631	14	7	7	emurielb76	2025-11-28	Hª Filosofía 2º Bach B Carlos	1020
130632	41	5	5	vpalaciosg06	2025-11-29	GRANI	1038
130633	41	5	5	vpalaciosg06	2025-11-30	GRANI	1038
130634	14	1	1	emurielb76	2025-12-01	MAITE	989
130635	45	1	1	rencinasr02	2025-12-01	Raquel Encinas 1º ESO "B"	\N
130636	45	2	2	emurielb76	2025-12-01	Intel. Artif. 1º Bach. Miguel	1022
130637	42	2	2	isabel22	2025-12-01	isabel panadero	\N
130638	30	2	2	dnarcisoc01	2025-12-01	LOLA 1ºGS APSI	\N
130639	8	2	2	emurielb76	2025-12-01	Biología NB 1º ESO A Alba Fajardo	958
130640	62	2	2	emurielb76	2025-12-01	Mates NB 2º ESO A Raquel	962
130641	45	3	3	emurielb76	2025-12-01	Digit. Básica 1º ESO A/B Miguel	1023
130642	67	3	3	omsanchezg01	2025-12-01	OLGA APOYO 1º eso	\N
130643	43	3	3	emurielb76	2025-12-01	Economía 1º Bach. Cristina Blanco	981
130644	22	3	3	emurielb76	2025-12-01	Latín 1º Bach. Juan José	993
130645	42	3	5	emurielb76	2025-12-01	2º GS Optativa. Rosa	1007
130646	14	3	3	emurielb76	2025-12-01	MAITE	990
130647	41	3	3	omsanchezg01	2025-12-01	OLGA 3º DIVER	\N
130648	8	3	3	emurielb76	2025-12-01	Refuerzo Lengua 1º ESO A/B Maribel	960
130649	22	4	4	emurielb76	2025-12-01	Atendida por Carlos	996
130650	43	5	5	omsanchezg01	2025-12-01	OLGA 3º DIVER	\N
130651	22	5	5	emurielb76	2025-12-01	Atendida por Inma	1000
130652	45	5	5	emurielb76	2025-12-01	Digitalización 4º ESO A/B Miguel	1026
130653	63	5	5	emurielb76	2025-12-01	Biología 2º Bach Celia	1013
130654	41	5	5	vpalaciosg06	2025-12-01	GRANI	1038
130655	63	6	6	emurielb76	2025-12-01	CC Grales 2º Bach Elena G.	1014
130656	14	6	6	emurielb76	2025-12-01	MAITE	991
130657	41	6	6	jrodriguezt18	2025-12-01	3º ESOB Jorge	\N
130658	22	6	6	emurielb76	2025-12-01	Atendida por Matilde	1002
130659	42	6	6	bcrespoc01	2025-12-01	Bea 2º GM	\N
130660	55	6	6	emurielb76	2025-12-01	Economía 4º ESO Cristina Blanco	1018
130661	55	7	7	emurielb76	2025-12-01	Matem. A 4º ESO Raquel	969
130662	41	7	7	omsanchezg01	2025-12-01	OLGA 4º DIVER	\N
130663	45	7	7	emurielb76	2025-12-01	TyD 2º ESO B Miguel	1028
130664	43	1	1	egonzalezh18	2025-12-02	Elena Gonzalez 1º bachillerato	\N
130665	55	1	1	emurielb76	2025-12-02	Latín 4º B Juan José	970
130666	42	2	3	bcrespoc01	2025-12-02	Bea 2º GM	\N
130667	43	2	2	emurielb76	2025-12-02	Economía 1º Bach. Cristina Blanco	1037
130668	45	2	2	mjcorralesg01	2025-12-02	3º ESO	\N
130669	14	3	3	emurielb76	2025-12-02	Itin. Empl. 1º CFGB Luis	985
130670	45	3	3	emurielb76	2025-12-02	Intel. Artif. 1º Bach. Miguel	1029
130671	55	3	3	emurielb76	2025-12-02	Matem. A 4º ESO Raquel	971
130672	43	3	3	egonzalezh18	2025-12-02	Elena González 3º ESO	\N
130673	41	3	3	pety78	2025-12-02	Pety	\N
130674	22	4	4	emurielb76	2025-12-02	Atendida por Patricia	998
130675	41	5	5	vpalaciosg06	2025-12-02	GRANI	1038
130676	14	5	5	omsanchezg01	2025-12-02	OLGA 3º DIVER	\N
130677	43	5	5	emurielb76	2025-12-02	Econ. Empr. 1º Bach. Cristina Blanco	980
130678	45	5	5	emurielb76	2025-12-02	Unión Europea Jorge 4º ESO	1021
130679	22	5	5	emurielb76	2025-12-02	Latín 1º Bach. Juan José	994
130680	30	6	6	pety78	2025-12-02	Pety	\N
130681	22	6	6	emurielb76	2025-12-02	Atendida por Inma	1001
130682	43	6	6	lpcamarac01	2025-12-02	2º ESO Luis Pedro Cámara	\N
130683	45	6	6	omsanchezg01	2025-12-02	OLGA 4º DIVER	\N
130684	63	6	6	emurielb76	2025-12-02	Refuerzo Mates 2º ESO A/B INFORM.	967
130685	42	6	7	bcrespoc01	2025-12-02	1º GM	\N
130686	14	6	6	emurielb76	2025-12-02	Itin. Empl. 1º CFGB Luis	986
130687	62	6	6	emurielb76	2025-12-02	Refuerzo Lengua 2º ESO A/B Juan José	965
130688	40	6	6	emurielb76	2025-12-02	Biología 2º Bach Celia	1017
130689	43	7	7	djuliog01	2025-12-02	Diana Julio (1ºB)	\N
130690	30	7	7	susana	2025-12-02	CHARLA ASPACE	\N
130691	14	7	7	emurielb76	2025-12-02	Hª Filosofía 2º Bach B Carlos	1020
130692	41	7	7	emparrag02	2025-12-02	Elisa Parra LCL	\N
130693	41	1	1	mdcpalaciosr01	2025-12-03	AMBITO PRÁCTICO 4º DIVER	\N
130694	45	1	1	emurielb76	2025-12-03	TyD  2º ESO A Miguel	1030
130695	22	1	1	mji3003	2025-12-03	Inma Molina	\N
130696	63	2	2	emurielb76	2025-12-03	Biología 2º Bach Celia	1011
130697	43	2	2	jrodriguezt18	2025-12-03	3º ESO A Jorge	\N
130698	14	2	2	emurielb76	2025-12-03	MAITE	992
130699	41	2	2	mdcpalaciosr01	2025-12-03	AMBITO PRÁCTICO 3º DIVER	\N
130700	8	2	2	emurielb76	2025-12-03	Biología NB 1º ESO A Alba Fajardo	958
130701	62	2	2	emurielb76	2025-12-03	Mates NB 2º ESO A Raquel	962
130702	42	2	2	omsanchezg01	2025-12-03	OLGA 3º DIVER	\N
130703	30	2	2	mmhernandezr01	2025-12-03	montaña	\N
130704	45	2	2	emurielb76	2025-12-03	Intel. Artif. 1º Bach. Miguel	1022
130705	42	3	3	emurielb76	2025-12-03	1º GM Digitalización. Peti	1005
130706	55	3	3	emurielb76	2025-12-03	Matem. A 4º ESO Raquel	971
130707	22	3	3	mji3003	2025-12-03	Inma Molina	\N
130708	41	3	3	omsanchezg01	2025-12-03	OLGA 4º DIVER	\N
130709	45	3	3	sromang06	2025-12-03	3ºA física y química	\N
130710	14	3	3	mtcerezog01	2025-12-03	Teresa 3º Diver	\N
130711	43	3	5	bcrespoc01	2025-12-03	2ºGM	\N
130712	30	4	4	emurielb76	2025-12-03	Consejo Escolar.	\N
130713	22	4	4	emurielb76	2025-12-03	Atendida por Inma	999
130714	42	5	5	isabel22	2025-12-03	isabel panadero	\N
130715	63	5	5	emurielb76	2025-12-03	CC Grales 2º Bach Elena G.	1015
130716	45	5	5	emurielb76	2025-12-03	Digit. Básica 1º ESO A/B Miguel	1024
130717	41	5	5	jrodriguezt18	2025-12-03	3º ESO B Jorge	\N
130718	8	5	5	emurielb76	2025-12-03	Refuerzo Lengua 1º ESO A/B Maribel	961
130719	14	5	5	emurielb76	2025-12-03	MAITE	1036
130720	55	5	5	emurielb76	2025-12-03	Economía 4º ESO Cristina Blanco	1019
130721	67	5	5	mtcerezog01	2025-12-03	Teresa 3º Diver	\N
130722	42	6	6	pety78	2025-12-03	Pety	\N
130723	43	6	6	emurielb76	2025-12-03	Economía 1º Bach. Cristina Blanco	982
130724	67	6	6	isabel22	2025-12-03	isabel panadero	\N
130725	41	6	6	vpalaciosg06	2025-12-03	GRANI	1041
130726	45	6	6	emurielb76	2025-12-03	Digitalización 4º ESO A/B Miguel	1031
130727	14	6	6	mrcarmonav01	2025-12-03	Remedios Carmona Vinagre 3ºDIVER	\N
130728	30	7	7	susana	2025-12-03	CHARLA ASPACE	\N
130729	42	7	7	emurielb76	2025-12-03	1º GS Digitalización. Peti	1040
130730	14	7	7	omsanchezg01	2025-12-03	OLGA 3º DIVER	\N
130731	41	1	1	omsanchezg01	2025-12-04	OLGA 4º DIVER	\N
130732	14	1	1	emurielb76	2025-12-04	Itin. Empl. 1º CFGB Luis	987
130733	43	1	1	mjcorralesg01	2025-12-04	1º Bach	\N
130734	42	1	1	pety78	2025-12-04	Pety	\N
130735	45	1	1	emurielb76	2025-12-04	Intel. Artif. 1º Bach. Informática	977
130736	41	2	2	pagarciam27	2025-12-04	Patricia TAE	\N
130737	14	2	2	emurielb76	2025-12-04	Itin. Empl. 1º CFGB Luis	988
130738	42	2	2	efranciscor01	2025-12-04	2 Grado Medio Estela	\N
130739	22	2	2	cjlozanop01	2025-12-04	Carlos J. -Filosofía	\N
130740	63	2	2	emurielb76	2025-12-04	Raquel apoyo	1039
130741	45	2	2	sromang06	2025-12-04	3ºB Física y química	\N
130742	63	3	3	emurielb76	2025-12-04	Refuerzo Mates 2º ESO A/B INFORM.	968
130743	14	3	3	mahernandezr06	2025-12-04	Refuerzo Científico (Miguel)	\N
130744	45	3	3	mrcarmonav01	2025-12-04	Remedios Carmona Vinagre 3ºA	\N
130745	43	3	3	emurielb76	2025-12-04	Economía 1º Bach. Cristina Blanco	981
130746	42	3	5	bcrespoc01	2025-12-04	1º GM	\N
130747	62	3	3	emurielb76	2025-12-04	Refuerzo Lengua 2º ESO A/B Juan José	966
130748	30	3	3	susana	2025-12-04	SESIÓN 1. CHARLA FEAFES	\N
130749	22	4	4	emurielb76	2025-12-04	Atendida por Patricia	998
130750	30	4	4	emurielb76	2025-12-04	Chisco y profes.	\N
130751	43	5	5	emurielb76	2025-12-04	Econ. Empr. 1º Bach. Cristina Blanco	980
130752	45	5	5	emurielb76	2025-12-04	Digitalización 4º ESO A/B Miguel	1026
130753	14	5	5	omsanchezg01	2025-12-04	OLGA 3º DIVER	\N
130754	62	5	5	emurielb76	2025-12-04	Mates NB 2º ESO A Raquel	963
130755	22	5	5	emurielb76	2025-12-04	Latín 1º Bach. Juan José	994
130756	30	5	5	susana	2025-12-04	SESIÓN 1. CHARLA FEAFES	\N
130757	41	5	5	vpalaciosg06	2025-12-04	GRANI	1038
130758	42	6	6	dnarcisoc01	2025-12-04	lola	\N
130759	30	6	6	susana	2025-12-04	SESIÓN 1. CHARLA FEAFES	\N
130760	55	6	6	emurielb76	2025-12-04	Latín 4º B Juan José	972
130761	63	6	6	emurielb76	2025-12-04	CC Grales 2º Bach Elena G.	1014
130762	43	6	6	rmvegac01	2025-12-04	Rosa Vega	\N
130763	45	7	7	emurielb76	2025-12-04	TyD 2º ESO B Miguel	1028
130764	30	7	7	susana	2025-12-04	SESIÓN 1. CHARLA FEAFES	\N
130765	41	7	7	emparrag02	2025-12-04	Elisa Parra LCL	\N
130766	14	7	7	emurielb76	2025-12-04	Hª Filosofía 2º Bach B Carlos	1020
130767	42	7	7	emurielb76	2025-12-04	2º GS Proyecto. Rosa	1009
130768	43	7	7	dmatasr01	2025-12-04	David Matas	\N
130769	62	1	1	emurielb76	2025-12-05	Mates NB 2º ESO A Raquel	964
130770	30	1	1	mmhernandezr01	2025-12-05	montaña	\N
130771	14	1	1	mtcerezog01	2025-12-05	Teresa.  3º Atención Educativa	\N
130772	43	2	2	emurielb76	2025-12-05	Econ. Empr. 1º Bach. Cristina Blanco	983
130773	30	2	2	mmhernandezr01	2025-12-05	montaña	\N
130774	63	2	2	mssalomonp02	2025-12-05	Marisol Aula Convivencia	\N
130775	22	2	2	emurielb76	2025-12-05	Latín 1º Bach. Juan José	995
130776	42	2	3	bcrespoc01	2025-12-05	1º GM	\N
130777	22	3	3	mtcerezog01	2025-12-05	Teresa 4º Diver	\N
130778	55	3	3	emurielb76	2025-12-05	Latín 4º B Juan José	973
130779	8	3	3	emurielb76	2025-12-05	Biología NB 1º ESO A Alba Fajardo	959
130780	41	3	4	pety78	2025-12-05	Pety	\N
130781	45	3	3	emurielb76	2025-12-05	1º Bach AE. Virginia	1033
130782	22	4	4	emurielb76	2025-12-05	Atendida por Inma	999
130783	30	4	4	vpalaciosg06	2025-12-05	VIRGINIA	\N
130784	63	5	5	emurielb76	2025-12-05	Biología 2º Bach Celia	1012
130785	45	5	5	emurielb76	2025-12-05	TyD  2º ESO A Miguel	1032
130786	43	5	5	mssalomonp02	2025-12-05	Marisol 4º ESO	\N
130787	14	5	5	mrcarmonav01	2025-12-05	Remedios Carmona Vinagre	\N
130788	22	5	5	emurielb76	2025-12-05	Atendida por Matilde	1004
130789	41	5	5	vpalaciosg06	2025-12-05	GRANI	1038
130790	55	5	5	emurielb76	2025-12-05	Matem. A 4º ESO Raquel	974
130791	63	6	6	emurielb76	2025-12-05	CC Grales 2º Bach Elena G.	1014
130792	55	6	6	emurielb76	2025-12-05	Economía 4º ESO Cristina Blanco	1018
130793	14	7	7	emurielb76	2025-12-05	Hª Filosofía 2º Bach B Carlos	1020
130794	67	7	7	mtcerezog01	2025-12-05	Teresa 3º Diver	\N
130795	43	7	7	emurielb76	2025-12-05	Economía 1º Bach. Cristina Blanco	984
130796	45	7	7	pagarciam27	2025-12-05	Patricia 2ºESO Efecto Matilda	\N
130797	41	5	5	vpalaciosg06	2025-12-06	GRANI	1038
130798	41	5	5	vpalaciosg06	2025-12-07	GRANI	1038
130799	14	1	1	emurielb76	2025-12-08	MAITE	989
130800	45	2	2	emurielb76	2025-12-08	Intel. Artif. 1º Bach. Miguel	1022
130801	8	2	2	emurielb76	2025-12-08	Biología NB 1º ESO A Alba Fajardo	958
130802	62	2	2	emurielb76	2025-12-08	Mates NB 2º ESO A Raquel	962
130803	22	3	3	emurielb76	2025-12-08	Latín 1º Bach. Juan José	993
130804	42	3	5	emurielb76	2025-12-08	2º GS Optativa. Rosa	1007
130805	14	3	3	emurielb76	2025-12-08	MAITE	990
130806	8	3	3	emurielb76	2025-12-08	Refuerzo Lengua 1º ESO A/B Maribel	960
130807	45	3	3	emurielb76	2025-12-08	Digit. Básica 1º ESO A/B Miguel	1023
130808	43	3	3	emurielb76	2025-12-08	Economía 1º Bach. Cristina Blanco	981
130809	22	4	4	emurielb76	2025-12-08	Atendida por Carlos	996
130810	22	5	5	emurielb76	2025-12-08	Atendida por Inma	1000
130811	63	5	5	emurielb76	2025-12-08	Biología 2º Bach Celia	1013
130812	41	5	5	vpalaciosg06	2025-12-08	GRANI	1038
130813	45	5	5	emurielb76	2025-12-08	Digitalización 4º ESO A/B Miguel	1026
130814	63	6	6	emurielb76	2025-12-08	CC Grales 2º Bach Elena G.	1014
130815	14	6	6	emurielb76	2025-12-08	MAITE	991
130816	55	6	6	emurielb76	2025-12-08	Economía 4º ESO Cristina Blanco	1018
130817	22	6	6	emurielb76	2025-12-08	Atendida por Matilde	1002
130818	55	7	7	emurielb76	2025-12-08	Matem. A 4º ESO Raquel	969
130819	45	7	7	emurielb76	2025-12-08	TyD 2º ESO B Miguel	1028
130820	55	1	1	emurielb76	2025-12-09	Latín 4º B Juan José	970
130821	30	1	1	dnarcisoc01	2025-12-09	Lola TLA	\N
130822	43	2	2	emurielb76	2025-12-09	Economía 1º Bach. Cristina Blanco	1037
130823	42	2	3	bcrespoc01	2025-12-09	Bea 2º GM	\N
130824	30	2	3	rmvegac01	2025-12-09	Rosa Vega	\N
130825	55	3	3	emurielb76	2025-12-09	Matem. A 4º ESO Raquel	971
130826	14	3	3	emurielb76	2025-12-09	Itin. Empl. 1º CFGB Luis	985
130827	45	3	3	emurielb76	2025-12-09	Intel. Artif. 1º Bach. Miguel	1029
130828	41	3	3	pety78	2025-12-09	Pety	\N
130829	22	4	4	emurielb76	2025-12-09	Atendida por Patricia	998
130830	14	5	5	pagarciam27	2025-12-09	Patricia TAE	\N
130831	41	5	5	vpalaciosg06	2025-12-09	GRANI	1038
130832	22	5	5	emurielb76	2025-12-09	Latín 1º Bach. Juan José	994
130833	45	5	5	emurielb76	2025-12-09	Unión Europea Jorge 4º ESO	1021
130834	43	5	5	emurielb76	2025-12-09	Econ. Empr. 1º Bach. Cristina Blanco	980
130835	42	5	5	efranciscor01	2025-12-09	Estela juego	\N
130836	67	5	5	omsanchezg01	2025-12-09	OLGA 3º DIVER	\N
130837	63	6	6	emurielb76	2025-12-09	Refuerzo Mates 2º ESO A/B INFORM.	967
130838	14	6	6	emurielb76	2025-12-09	Itin. Empl. 1º CFGB Luis	986
130839	62	6	6	emurielb76	2025-12-09	Refuerzo Lengua 2º ESO A/B Juan José	965
130840	40	6	6	emurielb76	2025-12-09	Biología 2º Bach Celia	1017
130841	22	6	6	emurielb76	2025-12-09	Atendida por Inma	1001
130842	45	6	6	mahernandezr06	2025-12-09	Refuerzo Matemáticas Miguel	\N
130843	14	7	7	emurielb76	2025-12-09	Hª Filosofía 2º Bach B Carlos	1020
130844	45	7	7	omsanchezg01	2025-12-09	OLGA 4º DIVER	\N
130845	41	7	7	emparrag02	2025-12-09	Elisa Parra LCL	\N
130846	30	1	2	rmvegac01	2025-12-10	Rosa Vega	\N
130847	42	1	2	pety78	2025-12-10	Pety	\N
130848	45	1	1	emurielb76	2025-12-10	TyD  2º ESO A Miguel	1030
130849	41	1	1	mdcpalaciosr01	2025-12-10	AMBITO PRÁCTICO 4º DIVER	\N
130850	67	1	1	nmaciasp02	2025-12-10	Noelia	\N
130851	45	2	2	emurielb76	2025-12-10	Intel. Artif. 1º Bach. Miguel	1022
130852	22	2	2	cjlozanop01	2025-12-10	Carlos J. -Filosofía	\N
130853	41	2	2	mdcpalaciosr01	2025-12-10	AMBITO PRÁCTICO 3º DIVER	\N
130854	8	2	2	emurielb76	2025-12-10	Biología NB 1º ESO A Alba Fajardo	958
130855	62	2	2	emurielb76	2025-12-10	Mates NB 2º ESO A Raquel	962
130856	55	2	2	emurielb76	2025-12-10	Pilar Martínez	\N
130857	63	2	2	emurielb76	2025-12-10	Biología 2º Bach Celia	1011
130858	14	2	2	emurielb76	2025-12-10	MAITE	992
130859	67	3	3	mtcerezog01	2025-12-10	Teresa 3º Diver	\N
130860	55	3	3	emurielb76	2025-12-10	Matem. A 4º ESO Raquel	971
130861	42	3	3	emurielb76	2025-12-10	1º GM Digitalización. Peti	1005
130862	22	4	4	emurielb76	2025-12-10	Atendida por Inma	999
130863	63	5	5	emurielb76	2025-12-10	CC Grales 2º Bach Elena G.	1015
130864	45	5	5	emurielb76	2025-12-10	Digit. Básica 1º ESO A/B Miguel	1024
130865	8	5	5	emurielb76	2025-12-10	Refuerzo Lengua 1º ESO A/B Maribel	961
130866	14	5	5	emurielb76	2025-12-10	MAITE	1036
130867	55	5	5	emurielb76	2025-12-10	Economía 4º ESO Cristina Blanco	1019
130868	41	5	5	vpalaciosg06	2025-12-10	GRANI	1038
130869	41	6	6	vpalaciosg06	2025-12-10	GRANI	1041
130870	45	6	6	emurielb76	2025-12-10	Digitalización 4º ESO A/B Miguel	1031
130871	14	6	6	mrcarmonav01	2025-12-10	Remedios Carmona Vinagre 3ºDIVER	\N
130872	43	6	6	emurielb76	2025-12-10	Economía 1º Bach. Cristina Blanco	982
130873	45	7	7	mrcarmonav01	2025-12-10	Remedios Carmona Vinagre 3ºA	\N
130874	42	7	7	emurielb76	2025-12-10	1º GS Digitalización. Peti	1040
130875	14	7	7	omsanchezg01	2025-12-10	OLGA 3º DIVER	\N
130876	14	1	1	emurielb76	2025-12-11	Itin. Empl. 1º CFGB Luis	987
130877	43	1	1	nmaciasp02	2025-12-11	Noelia 3º ESO	\N
130878	41	1	2	pety78	2025-12-11	Pety	\N
130879	45	1	1	emurielb76	2025-12-11	Intel. Artif. 1º Bach. Informática	977
130880	42	2	2	efranciscor01	2025-12-11	2 GRADO MEDIO PROYECTO Estela	\N
130881	63	2	2	emurielb76	2025-12-11	Raquel apoyo	1039
130882	67	2	2	ilozano1977	2025-12-11	Isabel Lozano	\N
130883	22	2	2	cjlozanop01	2025-12-11	Carlos Filosofía	\N
130884	14	2	2	emurielb76	2025-12-11	Itin. Empl. 1º CFGB Luis	988
130885	45	2	2	pagarciam27	2025-12-11	Patricia TAE	\N
130886	30	3	3	susana	2025-12-11	SESIÓN 1. CHARLA FEAFES	\N
130887	43	3	3	emurielb76	2025-12-11	Economía 1º Bach. Cristina Blanco	981
130888	63	3	3	emurielb76	2025-12-11	Refuerzo Mates 2º ESO A/B INFORM.	968
130889	62	3	3	emurielb76	2025-12-11	Refuerzo Lengua 2º ESO A/B Juan José	966
130890	22	4	4	emurielb76	2025-12-11	Atendida por Patricia	998
130891	62	5	5	emurielb76	2025-12-11	Mates NB 2º ESO A Raquel	963
130892	30	5	5	susana	2025-12-11	SESIÓN 1. CHARLA FEAFES	\N
130893	41	5	5	vpalaciosg06	2025-12-11	GRANI	1038
130894	43	5	5	emurielb76	2025-12-11	Econ. Empr. 1º Bach. Cristina Blanco	980
130895	45	5	5	emurielb76	2025-12-11	Digitalización 4º ESO A/B Miguel	1026
130896	14	5	5	omsanchezg01	2025-12-11	OLGA 3º DIVER	\N
130897	22	5	5	emurielb76	2025-12-11	Latín 1º Bach. Juan José	994
130898	55	6	6	emurielb76	2025-12-11	Latín 4º B Juan José	972
130899	63	6	6	emurielb76	2025-12-11	CC Grales 2º Bach Elena G.	1014
130900	30	6	6	susana	2025-12-11	SESIÓN 1. CHARLA FEAFES	\N
130901	42	7	7	emurielb76	2025-12-11	2º GS Proyecto. Rosa	1009
130902	45	7	7	emurielb76	2025-12-11	TyD 2º ESO B Miguel	1028
130903	14	7	7	emurielb76	2025-12-11	Hª Filosofía 2º Bach B Carlos	1020
130904	30	7	7	susana	2025-12-11	SESIÓN 1. CHARLA FEAFES	\N
130905	14	1	1	mtcerezog01	2025-12-12	Teresa 3º A	\N
130906	62	1	1	emurielb76	2025-12-12	Mates NB 2º ESO A Raquel	964
130907	22	2	2	emurielb76	2025-12-12	Latín 1º Bach. Juan José	995
130908	43	2	2	emurielb76	2025-12-12	Econ. Empr. 1º Bach. Cristina Blanco	983
130909	42	3	3	omsanchezg01	2025-12-12	OLGA 3º DIVER	\N
130910	67	3	3	ilozano1977	2025-12-12	Isabel Lozano	\N
130911	41	3	3	nmaciasp02	2025-12-12	Noelia 3º ESO	\N
130912	43	3	3	sromang06	2025-12-12	2ºB física y química	\N
130913	14	3	3	mtcerezog01	2025-12-12	Teresa 4º Diver	\N
130914	45	3	3	emurielb76	2025-12-12	1º Bach AE. Virginia	1033
130915	55	3	3	emurielb76	2025-12-12	Latín 4º B Juan José	973
130916	8	3	3	emurielb76	2025-12-12	Biología NB 1º ESO A Alba Fajardo	959
130917	22	4	4	emurielb76	2025-12-12	Atendida por Inma	999
130918	22	5	5	emurielb76	2025-12-12	Atendida por Matilde	1004
130919	14	5	5	mrcarmonav01	2025-12-12	Remedios Carmona Vinagre 3ºDIVER	\N
130920	55	5	5	emurielb76	2025-12-12	Matem. A 4º ESO Raquel	974
130921	45	5	5	emurielb76	2025-12-12	TyD  2º ESO A Miguel	1032
130922	63	5	5	emurielb76	2025-12-12	Biología 2º Bach Celia	1012
130923	43	5	5	a_carlosss76	2025-12-12	Agustin C Ortego	\N
130924	41	5	5	vpalaciosg06	2025-12-12	GRANI	1038
130925	45	6	6	sromang06	2025-12-12	2ºA física y química	\N
130926	63	6	6	emurielb76	2025-12-12	CC Grales 2º Bach Elena G.	1014
130927	55	6	6	emurielb76	2025-12-12	Economía 4º ESO Cristina Blanco	1018
130928	67	7	7	mtcerezog01	2025-12-12	Teresa 3º Diver	\N
130929	43	7	7	emurielb76	2025-12-12	Economía 1º Bach. Cristina Blanco	984
130930	45	7	7	djuliog01	2025-12-12	Diana Julio (1ºB)	\N
130931	14	7	7	emurielb76	2025-12-12	Hª Filosofía 2º Bach B Carlos	1020
130932	41	5	5	vpalaciosg06	2025-12-13	GRANI	1038
130933	41	5	5	vpalaciosg06	2025-12-14	GRANI	1038
130934	14	1	1	emurielb76	2025-12-15	MAITE	989
130935	22	1	1	mji3003	2025-12-15	Inma Molina	\N
130936	8	2	2	emurielb76	2025-12-15	Biología NB 1º ESO A Alba Fajardo	958
130937	62	2	2	emurielb76	2025-12-15	Mates NB 2º ESO A Raquel	962
130938	43	2	2	ilozano1977	2025-12-15	Isabel Lozano	\N
130939	45	2	2	emurielb76	2025-12-15	Intel. Artif. 1º Bach. Miguel	1022
130940	41	2	2	omsanchezg01	2025-12-15	OLGA 3º DIVER	\N
130941	14	2	2	mtcerezog01	2025-12-15	Teresa 4º Diver	\N
130942	43	3	3	emurielb76	2025-12-15	Economía 1º Bach. Cristina Blanco	981
130943	22	3	3	emurielb76	2025-12-15	Latín 1º Bach. Juan José	993
130944	42	3	5	emurielb76	2025-12-15	2º GS Optativa. Rosa	1007
130945	14	3	3	emurielb76	2025-12-15	MAITE	990
130946	8	3	3	emurielb76	2025-12-15	Refuerzo Lengua 1º ESO A/B Maribel	960
130947	67	3	3	isabel22	2025-12-15	isabel panadero	\N
130948	45	3	3	emurielb76	2025-12-15	Digit. Básica 1º ESO A/B Miguel	1023
130949	62	4	4	egonzalezh18	2025-12-15	Elena 1º y 2º bachillerato biología	\N
130950	22	4	4	emurielb76	2025-12-15	Atendida por Carlos	996
130951	43	5	5	nmaciasp02	2025-12-15	Noelia 3º ESO	\N
130952	45	5	5	emurielb76	2025-12-15	Digitalización 4º ESO A/B Miguel	1026
130953	62	5	5	egonzalezh18	2025-12-15	Elena 1º bachillerato	\N
130954	22	5	5	emurielb76	2025-12-15	Atendida por Inma	1000
130955	14	5	5	mrcarmonav01	2025-12-15	Remedios Carmona Vinagre 3ºDIVER	\N
130956	8	5	5	fatimapc20	2025-12-15	Fátima Peña Cantonero	\N
130957	41	5	5	vpalaciosg06	2025-12-15	GRANI	1038
130958	63	5	5	emurielb76	2025-12-15	Biología 2º Bach Celia	1013
130959	22	6	6	emurielb76	2025-12-15	Atendida por Matilde	1002
130960	55	6	6	emurielb76	2025-12-15	Economía 4º ESO Cristina Blanco	1018
130961	8	6	6	fatimapc20	2025-12-15	Fátima Peña Cantonero	\N
130962	43	6	6	dmatasr01	2025-12-15	David Matas	\N
130963	62	6	6	egonzalezh18	2025-12-15	Elena 2º bachillerato	\N
130964	14	6	6	emurielb76	2025-12-15	MAITE	991
130965	67	6	6	mtcerezog01	2025-12-15	Teresa 3º Diver	\N
130966	63	6	6	emurielb76	2025-12-15	CC Grales 2º Bach Elena G.	1014
130967	55	7	7	emurielb76	2025-12-15	Matem. A 4º ESO Raquel	969
130968	62	7	7	egonzalezh18	2025-12-15	Elena 2º bachillerato	\N
130969	42	7	7	dnarcisoc01	2025-12-15	lola	\N
130970	45	7	7	emurielb76	2025-12-15	TyD 2º ESO B Miguel	1028
130971	43	7	7	pagarciam27	2025-12-15	Patricia 2ºESO Efecto Matilda	\N
130972	67	1	1	igomezc12	2025-12-16	Isabel Gomez Crespo	\N
130973	45	1	1	egonzalezh18	2025-12-16	Elena 1º bachillerato biología	\N
130974	55	1	1	emurielb76	2025-12-16	Latín 4º B Juan José	970
130975	67	2	2	mtcerezog01	2025-12-16	Teresa 4º Diver	\N
130976	43	2	2	emurielb76	2025-12-16	Economía 1º Bach. Cristina Blanco	1037
130977	55	3	3	emurielb76	2025-12-16	Matem. A 4º ESO Raquel	971
130978	41	3	3	emparrag02	2025-12-16	Elisa Parra LCL	\N
130979	43	3	3	ilozano1977	2025-12-16	Isabel Lozano	\N
130980	14	3	3	emurielb76	2025-12-16	Itin. Empl. 1º CFGB Luis	985
130981	45	3	3	emurielb76	2025-12-16	Intel. Artif. 1º Bach. Miguel	1029
130982	22	4	4	emurielb76	2025-12-16	Atendida por Patricia	998
130983	43	5	5	emurielb76	2025-12-16	Econ. Empr. 1º Bach. Cristina Blanco	980
130984	45	5	5	emurielb76	2025-12-16	Unión Europea Jorge 4º ESO	1021
130985	14	5	5	omsanchezg01	2025-12-16	3º diver	\N
130986	22	5	5	emurielb76	2025-12-16	Latín 1º Bach. Juan José	994
130987	41	5	5	vpalaciosg06	2025-12-16	GRANI	1038
130988	40	6	6	emurielb76	2025-12-16	Biología 2º Bach Celia	1017
130989	22	6	6	emurielb76	2025-12-16	Atendida por Inma	1001
130990	63	6	6	emurielb76	2025-12-16	Refuerzo Mates 2º ESO A/B INFORM.	967
130991	14	6	6	emurielb76	2025-12-16	Itin. Empl. 1º CFGB Luis	986
130992	62	6	6	emurielb76	2025-12-16	Refuerzo Lengua 2º ESO A/B Juan José	965
130993	43	7	7	jjmorcillor01	2025-12-16	Juanjo Morcillo	\N
130994	14	7	7	emurielb76	2025-12-16	Hª Filosofía 2º Bach B Carlos	1020
130995	22	7	7	mji3003	2025-12-16	Inma Molina	\N
130996	45	1	1	emurielb76	2025-12-17	TyD  2º ESO A Miguel	1030
130997	41	1	1	nmaciasp02	2025-12-17	Noelia 3º ESO	\N
130998	22	2	2	pagarciam27	2025-12-17	Patricia 4ºESO	\N
130999	63	2	2	emurielb76	2025-12-17	Biología 2º Bach Celia	1011
131000	45	2	2	emurielb76	2025-12-17	Intel. Artif. 1º Bach. Miguel	1022
131001	14	2	2	emurielb76	2025-12-17	MAITE	992
131002	43	2	2	ilozano1977	2025-12-17	Isabel Lozano	\N
131003	8	2	2	emurielb76	2025-12-17	Biología NB 1º ESO A Alba Fajardo	958
131004	62	2	2	emurielb76	2025-12-17	Mates NB 2º ESO A Raquel	962
131005	47	2	2	jmmurillon01	2025-12-17	2º Fis Bach JMa	\N
131006	14	3	3	mtcerezog01	2025-12-17	Teresa 3º Diver	\N
131007	45	3	3	egonzalezh18	2025-12-17	Elena 1º bachillerato biología	\N
131008	47	3	3	jmmurillon01	2025-12-17	2º Bach Fisica	\N
131009	42	3	3	emurielb76	2025-12-17	1º GM Digitalización. Peti	1005
131010	55	3	3	emurielb76	2025-12-17	Matem. A 4º ESO Raquel	971
131011	22	4	4	emurielb76	2025-12-17	Atendida por Inma	999
131012	41	5	5	vpalaciosg06	2025-12-17	GRANI	1038
131013	67	5	5	omsanchezg01	2025-12-17	OLGA APOYO	\N
131014	63	5	5	emurielb76	2025-12-17	CC Grales 2º Bach Elena G.	1015
131015	45	5	5	emurielb76	2025-12-17	Digit. Básica 1º ESO A/B Miguel	1024
131016	43	5	5	egonzalezh18	2025-12-17	Elena 2º bachillerato	\N
131017	8	5	5	emurielb76	2025-12-17	Refuerzo Lengua 1º ESO A/B Maribel	961
131018	14	5	5	emurielb76	2025-12-17	MAITE	1036
131019	55	5	5	emurielb76	2025-12-17	Economía 4º ESO Cristina Blanco	1019
131020	43	6	6	emurielb76	2025-12-17	Economía 1º Bach. Cristina Blanco	982
131021	14	6	6	mrcarmonav01	2025-12-17	Remedios Carmona Vinagre 3ºDIVER	\N
131022	41	6	6	vpalaciosg06	2025-12-17	GRANI	1041
131023	45	6	6	emurielb76	2025-12-17	Digitalización 4º ESO A/B Miguel	1031
131024	45	7	7	mrcarmonav01	2025-12-17	Remedios Carmona Vinagre 3ºA	\N
131025	42	7	7	emurielb76	2025-12-17	1º GS Digitalización. Peti	1040
131026	41	1	1	nmaciasp02	2025-12-18	Noelia 3º ESO	\N
131027	43	1	1	jjmorcillor01	2025-12-18	Juanjo Morcillo	\N
131028	45	1	1	emurielb76	2025-12-18	Intel. Artif. 1º Bach. Informática	977
131029	14	1	1	emurielb76	2025-12-18	Itin. Empl. 1º CFGB Luis	987
131030	14	2	2	emurielb76	2025-12-18	Itin. Empl. 1º CFGB Luis	988
131031	43	2	2	lpcamarac01	2025-12-18	Luis Pedro Cámara - 1º ESO B	\N
131032	63	2	2	emurielb76	2025-12-18	Raquel apoyo	1039
131033	63	3	3	emurielb76	2025-12-18	Refuerzo Mates 2º ESO A/B INFORM.	968
131034	62	3	3	emurielb76	2025-12-18	Refuerzo Lengua 2º ESO A/B Juan José	966
131035	43	3	3	emurielb76	2025-12-18	Economía 1º Bach. Cristina Blanco	981
131036	22	4	4	emurielb76	2025-12-18	Atendida por Patricia	998
131037	22	5	5	emurielb76	2025-12-18	Latín 1º Bach. Juan José	994
131038	62	5	5	emurielb76	2025-12-18	Mates NB 2º ESO A Raquel	963
131039	43	5	5	emurielb76	2025-12-18	Econ. Empr. 1º Bach. Cristina Blanco	980
131040	45	5	5	emurielb76	2025-12-18	Digitalización 4º ESO A/B Miguel	1026
131041	41	5	5	vpalaciosg06	2025-12-18	GRANI	1038
131042	63	6	6	emurielb76	2025-12-18	CC Grales 2º Bach Elena G.	1014
131043	14	6	6	egonzalezh18	2025-12-18	Elena 2º bachillerato	\N
131044	45	6	6	vpalaciosg06	2025-12-18	VIRGINIA	\N
131045	55	6	6	emurielb76	2025-12-18	Latín 4º B Juan José	972
131046	14	7	7	emurielb76	2025-12-18	Hª Filosofía 2º Bach B Carlos	1020
131047	22	7	7	mji3003	2025-12-18	Inma Molina	\N
131048	45	7	7	emurielb76	2025-12-18	TyD 2º ESO B Miguel	1028
131049	42	7	7	emurielb76	2025-12-18	2º GS Proyecto. Rosa	1009
131050	62	1	1	emurielb76	2025-12-19	Mates NB 2º ESO A Raquel	964
131051	43	2	2	emurielb76	2025-12-19	Econ. Empr. 1º Bach. Cristina Blanco	983
131052	22	2	2	emurielb76	2025-12-19	Latín 1º Bach. Juan José	995
131053	45	3	3	emurielb76	2025-12-19	1º Bach AE. Virginia	1033
131054	55	3	3	emurielb76	2025-12-19	Latín 4º B Juan José	973
131055	8	3	3	emurielb76	2025-12-19	Biología NB 1º ESO A Alba Fajardo	959
131056	22	4	4	emurielb76	2025-12-19	Atendida por Inma	999
131057	55	5	5	emurielb76	2025-12-19	Matem. A 4º ESO Raquel	974
131058	45	5	5	emurielb76	2025-12-19	TyD  2º ESO A Miguel	1032
131059	63	5	5	emurielb76	2025-12-19	Biología 2º Bach Celia	1012
131060	41	5	5	vpalaciosg06	2025-12-19	GRANI	1038
131061	22	5	5	emurielb76	2025-12-19	Atendida por Matilde	1004
131062	55	6	6	emurielb76	2025-12-19	Economía 4º ESO Cristina Blanco	1018
131063	63	6	6	emurielb76	2025-12-19	CC Grales 2º Bach Elena G.	1014
131064	14	7	7	emurielb76	2025-12-19	Hª Filosofía 2º Bach B Carlos	1020
131065	43	7	7	emurielb76	2025-12-19	Economía 1º Bach. Cristina Blanco	984
131066	41	5	5	vpalaciosg06	2025-12-20	GRANI	1038
131067	41	5	5	vpalaciosg06	2025-12-21	GRANI	1038
131068	14	1	1	emurielb76	2025-12-22	MAITE	989
131069	43	1	1	lpcamarac01	2025-12-22	Luis Pedro Cámara - 1º ESO A	\N
131070	8	2	2	emurielb76	2025-12-22	Biología NB 1º ESO A Alba Fajardo	958
131071	62	2	2	emurielb76	2025-12-22	Mates NB 2º ESO A Raquel	962
131072	43	2	2	celita2	2025-12-22	CELIA 1º ESO	\N
131073	45	2	2	emurielb76	2025-12-22	Intel. Artif. 1º Bach. Miguel	1022
131074	45	3	3	emurielb76	2025-12-22	Digit. Básica 1º ESO A/B Miguel	1023
131075	43	3	3	emurielb76	2025-12-22	Economía 1º Bach. Cristina Blanco	981
131076	22	3	3	emurielb76	2025-12-22	Latín 1º Bach. Juan José	993
131077	42	3	5	emurielb76	2025-12-22	2º GS Optativa. Rosa	1007
131078	14	3	3	emurielb76	2025-12-22	MAITE	990
131079	8	3	3	emurielb76	2025-12-22	Refuerzo Lengua 1º ESO A/B Maribel	960
131080	22	4	4	emurielb76	2025-12-22	Atendida por Carlos	996
131081	41	5	5	vpalaciosg06	2025-12-22	GRANI	1038
131082	45	5	5	emurielb76	2025-12-22	Digitalización 4º ESO A/B Miguel	1026
131083	22	5	5	emurielb76	2025-12-22	Atendida por Inma	1000
131084	63	5	5	emurielb76	2025-12-22	Biología 2º Bach Celia	1013
131085	14	6	6	emurielb76	2025-12-22	MAITE	991
131086	22	6	6	emurielb76	2025-12-22	Atendida por Matilde	1002
131087	55	6	6	emurielb76	2025-12-22	Economía 4º ESO Cristina Blanco	1018
131088	63	6	6	emurielb76	2025-12-22	CC Grales 2º Bach Elena G.	1014
131089	45	7	7	emurielb76	2025-12-22	TyD 2º ESO B Miguel	1028
131090	55	7	7	emurielb76	2025-12-22	Matem. A 4º ESO Raquel	969
131091	55	1	1	emurielb76	2025-12-23	Latín 4º B Juan José	970
131092	43	2	2	emurielb76	2025-12-23	Economía 1º Bach. Cristina Blanco	1037
131093	14	3	3	emurielb76	2025-12-23	Itin. Empl. 1º CFGB Luis	985
131094	45	3	3	emurielb76	2025-12-23	Intel. Artif. 1º Bach. Miguel	1029
131095	55	3	3	emurielb76	2025-12-23	Matem. A 4º ESO Raquel	971
131096	22	4	4	emurielb76	2025-12-23	Atendida por Patricia	998
131097	43	5	5	emurielb76	2025-12-23	Econ. Empr. 1º Bach. Cristina Blanco	980
131098	45	5	5	emurielb76	2025-12-23	Unión Europea Jorge 4º ESO	1021
131099	22	5	5	emurielb76	2025-12-23	Latín 1º Bach. Juan José	994
131100	41	5	5	vpalaciosg06	2025-12-23	GRANI	1038
131101	22	6	6	emurielb76	2025-12-23	Atendida por Inma	1001
131102	63	6	6	emurielb76	2025-12-23	Refuerzo Mates 2º ESO A/B INFORM.	967
131103	14	6	6	emurielb76	2025-12-23	Itin. Empl. 1º CFGB Luis	986
131104	62	6	6	emurielb76	2025-12-23	Refuerzo Lengua 2º ESO A/B Juan José	965
131105	40	6	6	emurielb76	2025-12-23	Biología 2º Bach Celia	1017
131106	14	7	7	emurielb76	2025-12-23	Hª Filosofía 2º Bach B Carlos	1020
131107	45	1	1	emurielb76	2025-12-24	TyD  2º ESO A Miguel	1030
131108	14	2	2	emurielb76	2025-12-24	MAITE	992
131109	45	2	2	emurielb76	2025-12-24	Intel. Artif. 1º Bach. Miguel	1022
131110	63	2	2	emurielb76	2025-12-24	Biología 2º Bach Celia	1011
131111	8	2	2	emurielb76	2025-12-24	Biología NB 1º ESO A Alba Fajardo	958
131112	62	2	2	emurielb76	2025-12-24	Mates NB 2º ESO A Raquel	962
131113	42	3	3	emurielb76	2025-12-24	1º GM Digitalización. Peti	1005
131114	55	3	3	emurielb76	2025-12-24	Matem. A 4º ESO Raquel	971
131115	22	4	4	emurielb76	2025-12-24	Atendida por Inma	999
131116	63	5	5	emurielb76	2025-12-24	CC Grales 2º Bach Elena G.	1015
131117	45	5	5	emurielb76	2025-12-24	Digit. Básica 1º ESO A/B Miguel	1024
131118	8	5	5	emurielb76	2025-12-24	Refuerzo Lengua 1º ESO A/B Maribel	961
131119	41	5	5	vpalaciosg06	2025-12-24	GRANI	1038
131120	14	5	5	emurielb76	2025-12-24	MAITE	1036
131121	55	5	5	emurielb76	2025-12-24	Economía 4º ESO Cristina Blanco	1019
131122	41	6	6	vpalaciosg06	2025-12-24	GRANI	1041
131123	45	6	6	emurielb76	2025-12-24	Digitalización 4º ESO A/B Miguel	1031
131124	43	6	6	emurielb76	2025-12-24	Economía 1º Bach. Cristina Blanco	982
131125	42	7	7	emurielb76	2025-12-24	1º GS Digitalización. Peti	1040
131126	14	1	1	emurielb76	2025-12-25	Itin. Empl. 1º CFGB Luis	987
131127	45	1	1	emurielb76	2025-12-25	Intel. Artif. 1º Bach. Informática	977
131128	14	2	2	emurielb76	2025-12-25	Itin. Empl. 1º CFGB Luis	988
131129	63	2	2	emurielb76	2025-12-25	Raquel apoyo	1039
131130	62	3	3	emurielb76	2025-12-25	Refuerzo Lengua 2º ESO A/B Juan José	966
131131	43	3	3	emurielb76	2025-12-25	Economía 1º Bach. Cristina Blanco	981
131132	63	3	3	emurielb76	2025-12-25	Refuerzo Mates 2º ESO A/B INFORM.	968
131133	22	4	4	emurielb76	2025-12-25	Atendida por Patricia	998
131134	45	5	5	emurielb76	2025-12-25	Digitalización 4º ESO A/B Miguel	1026
131135	41	5	5	vpalaciosg06	2025-12-25	GRANI	1038
131136	62	5	5	emurielb76	2025-12-25	Mates NB 2º ESO A Raquel	963
131137	22	5	5	emurielb76	2025-12-25	Latín 1º Bach. Juan José	994
131138	43	5	5	emurielb76	2025-12-25	Econ. Empr. 1º Bach. Cristina Blanco	980
131139	55	6	6	emurielb76	2025-12-25	Latín 4º B Juan José	972
131140	63	6	6	emurielb76	2025-12-25	CC Grales 2º Bach Elena G.	1014
131141	14	7	7	emurielb76	2025-12-25	Hª Filosofía 2º Bach B Carlos	1020
131142	42	7	7	emurielb76	2025-12-25	2º GS Proyecto. Rosa	1009
131143	45	7	7	emurielb76	2025-12-25	TyD 2º ESO B Miguel	1028
131144	62	1	1	emurielb76	2025-12-26	Mates NB 2º ESO A Raquel	964
131145	22	2	2	emurielb76	2025-12-26	Latín 1º Bach. Juan José	995
131146	43	2	2	emurielb76	2025-12-26	Econ. Empr. 1º Bach. Cristina Blanco	983
131147	55	3	3	emurielb76	2025-12-26	Latín 4º B Juan José	973
131148	8	3	3	emurielb76	2025-12-26	Biología NB 1º ESO A Alba Fajardo	959
131149	45	3	3	emurielb76	2025-12-26	1º Bach AE. Virginia	1033
131150	22	4	4	emurielb76	2025-12-26	Atendida por Inma	999
131151	22	5	5	emurielb76	2025-12-26	Atendida por Matilde	1004
131152	55	5	5	emurielb76	2025-12-26	Matem. A 4º ESO Raquel	974
131153	41	5	5	vpalaciosg06	2025-12-26	GRANI	1038
131154	45	5	5	emurielb76	2025-12-26	TyD  2º ESO A Miguel	1032
131155	63	5	5	emurielb76	2025-12-26	Biología 2º Bach Celia	1012
131156	63	6	6	emurielb76	2025-12-26	CC Grales 2º Bach Elena G.	1014
131157	55	6	6	emurielb76	2025-12-26	Economía 4º ESO Cristina Blanco	1018
131158	43	7	7	emurielb76	2025-12-26	Economía 1º Bach. Cristina Blanco	984
131159	14	7	7	emurielb76	2025-12-26	Hª Filosofía 2º Bach B Carlos	1020
131160	41	5	5	vpalaciosg06	2025-12-27	GRANI	1038
131161	41	5	5	vpalaciosg06	2025-12-28	GRANI	1038
131162	14	1	1	emurielb76	2025-12-29	MAITE	989
131163	45	2	2	emurielb76	2025-12-29	Intel. Artif. 1º Bach. Miguel	1022
131164	8	2	2	emurielb76	2025-12-29	Biología NB 1º ESO A Alba Fajardo	958
131165	62	2	2	emurielb76	2025-12-29	Mates NB 2º ESO A Raquel	962
131166	22	3	3	emurielb76	2025-12-29	Latín 1º Bach. Juan José	993
131167	42	3	5	emurielb76	2025-12-29	2º GS Optativa. Rosa	1007
131168	14	3	3	emurielb76	2025-12-29	MAITE	990
131169	8	3	3	emurielb76	2025-12-29	Refuerzo Lengua 1º ESO A/B Maribel	960
131170	43	3	3	emurielb76	2025-12-29	Economía 1º Bach. Cristina Blanco	981
131171	45	3	3	emurielb76	2025-12-29	Digit. Básica 1º ESO A/B Miguel	1023
131172	22	4	4	emurielb76	2025-12-29	Atendida por Carlos	996
131173	22	5	5	emurielb76	2025-12-29	Atendida por Inma	1000
131174	63	5	5	emurielb76	2025-12-29	Biología 2º Bach Celia	1013
131175	41	5	5	vpalaciosg06	2025-12-29	GRANI	1038
131176	45	5	5	emurielb76	2025-12-29	Digitalización 4º ESO A/B Miguel	1026
131177	14	6	6	emurielb76	2025-12-29	MAITE	991
131178	22	6	6	emurielb76	2025-12-29	Atendida por Matilde	1002
131179	63	6	6	emurielb76	2025-12-29	CC Grales 2º Bach Elena G.	1014
131180	55	6	6	emurielb76	2025-12-29	Economía 4º ESO Cristina Blanco	1018
131181	45	7	7	emurielb76	2025-12-29	TyD 2º ESO B Miguel	1028
131182	55	7	7	emurielb76	2025-12-29	Matem. A 4º ESO Raquel	969
131183	55	1	1	emurielb76	2025-12-30	Latín 4º B Juan José	970
131184	43	2	2	emurielb76	2025-12-30	Economía 1º Bach. Cristina Blanco	1037
131185	14	3	3	emurielb76	2025-12-30	Itin. Empl. 1º CFGB Luis	985
131186	45	3	3	emurielb76	2025-12-30	Intel. Artif. 1º Bach. Miguel	1029
131187	55	3	3	emurielb76	2025-12-30	Matem. A 4º ESO Raquel	971
131188	22	4	4	emurielb76	2025-12-30	Atendida por Patricia	998
131189	41	5	5	vpalaciosg06	2025-12-30	GRANI	1038
131190	45	5	5	emurielb76	2025-12-30	Unión Europea Jorge 4º ESO	1021
131191	43	5	5	emurielb76	2025-12-30	Econ. Empr. 1º Bach. Cristina Blanco	980
131192	22	5	5	emurielb76	2025-12-30	Latín 1º Bach. Juan José	994
131193	14	6	6	emurielb76	2025-12-30	Itin. Empl. 1º CFGB Luis	986
131194	62	6	6	emurielb76	2025-12-30	Refuerzo Lengua 2º ESO A/B Juan José	965
131195	40	6	6	emurielb76	2025-12-30	Biología 2º Bach Celia	1017
131196	22	6	6	emurielb76	2025-12-30	Atendida por Inma	1001
131197	63	6	6	emurielb76	2025-12-30	Refuerzo Mates 2º ESO A/B INFORM.	967
131198	14	7	7	emurielb76	2025-12-30	Hª Filosofía 2º Bach B Carlos	1020
131199	45	1	1	emurielb76	2025-12-31	TyD  2º ESO A Miguel	1030
131200	8	2	2	emurielb76	2025-12-31	Biología NB 1º ESO A Alba Fajardo	958
131201	62	2	2	emurielb76	2025-12-31	Mates NB 2º ESO A Raquel	962
131202	63	2	2	emurielb76	2025-12-31	Biología 2º Bach Celia	1011
131203	14	2	2	emurielb76	2025-12-31	MAITE	992
131204	45	2	2	emurielb76	2025-12-31	Intel. Artif. 1º Bach. Miguel	1022
131205	55	3	3	emurielb76	2025-12-31	Matem. A 4º ESO Raquel	971
131206	42	3	3	emurielb76	2025-12-31	1º GM Digitalización. Peti	1005
131207	22	4	4	emurielb76	2025-12-31	Atendida por Inma	999
131208	45	5	5	emurielb76	2025-12-31	Digit. Básica 1º ESO A/B Miguel	1024
131209	8	5	5	emurielb76	2025-12-31	Refuerzo Lengua 1º ESO A/B Maribel	961
131210	14	5	5	emurielb76	2025-12-31	MAITE	1036
131211	55	5	5	emurielb76	2025-12-31	Economía 4º ESO Cristina Blanco	1019
131212	41	5	5	vpalaciosg06	2025-12-31	GRANI	1038
131213	63	5	5	emurielb76	2025-12-31	CC Grales 2º Bach Elena G.	1015
131214	41	6	6	vpalaciosg06	2025-12-31	GRANI	1041
131215	45	6	6	emurielb76	2025-12-31	Digitalización 4º ESO A/B Miguel	1031
131216	43	6	6	emurielb76	2025-12-31	Economía 1º Bach. Cristina Blanco	982
131217	42	7	7	emurielb76	2025-12-31	1º GS Digitalización. Peti	1040
131218	14	1	1	emurielb76	2026-01-01	Itin. Empl. 1º CFGB Luis	987
131219	45	1	1	emurielb76	2026-01-01	Intel. Artif. 1º Bach. Informática	977
131220	14	2	2	emurielb76	2026-01-01	Itin. Empl. 1º CFGB Luis	988
131221	63	2	2	emurielb76	2026-01-01	Raquel apoyo	1039
131222	43	3	3	emurielb76	2026-01-01	Economía 1º Bach. Cristina Blanco	981
131223	63	3	3	emurielb76	2026-01-01	Refuerzo Mates 2º ESO A/B INFORM.	968
131224	62	3	3	emurielb76	2026-01-01	Refuerzo Lengua 2º ESO A/B Juan José	966
131225	22	4	4	emurielb76	2026-01-01	Atendida por Patricia	998
131226	43	5	5	emurielb76	2026-01-01	Econ. Empr. 1º Bach. Cristina Blanco	980
131227	45	5	5	emurielb76	2026-01-01	Digitalización 4º ESO A/B Miguel	1026
131228	41	5	5	vpalaciosg06	2026-01-01	GRANI	1038
131229	22	5	5	emurielb76	2026-01-01	Latín 1º Bach. Juan José	994
131230	62	5	5	emurielb76	2026-01-01	Mates NB 2º ESO A Raquel	963
131231	55	6	6	emurielb76	2026-01-01	Latín 4º B Juan José	972
131232	63	6	6	emurielb76	2026-01-01	CC Grales 2º Bach Elena G.	1014
131233	45	7	7	emurielb76	2026-01-01	TyD 2º ESO B Miguel	1028
131234	14	7	7	emurielb76	2026-01-01	Hª Filosofía 2º Bach B Carlos	1020
131235	42	7	7	emurielb76	2026-01-01	2º GS Proyecto. Rosa	1009
131236	62	1	1	emurielb76	2026-01-02	Mates NB 2º ESO A Raquel	964
131237	22	2	2	emurielb76	2026-01-02	Latín 1º Bach. Juan José	995
131238	43	2	2	emurielb76	2026-01-02	Econ. Empr. 1º Bach. Cristina Blanco	983
131239	45	3	3	emurielb76	2026-01-02	1º Bach AE. Virginia	1033
131240	55	3	3	emurielb76	2026-01-02	Latín 4º B Juan José	973
131241	8	3	3	emurielb76	2026-01-02	Biología NB 1º ESO A Alba Fajardo	959
131242	22	4	4	emurielb76	2026-01-02	Atendida por Inma	999
131243	41	5	5	vpalaciosg06	2026-01-02	GRANI	1038
131244	55	5	5	emurielb76	2026-01-02	Matem. A 4º ESO Raquel	974
131245	45	5	5	emurielb76	2026-01-02	TyD  2º ESO A Miguel	1032
131246	63	5	5	emurielb76	2026-01-02	Biología 2º Bach Celia	1012
131247	22	5	5	emurielb76	2026-01-02	Atendida por Matilde	1004
131248	55	6	6	emurielb76	2026-01-02	Economía 4º ESO Cristina Blanco	1018
131249	63	6	6	emurielb76	2026-01-02	CC Grales 2º Bach Elena G.	1014
131250	43	7	7	emurielb76	2026-01-02	Economía 1º Bach. Cristina Blanco	984
131251	14	7	7	emurielb76	2026-01-02	Hª Filosofía 2º Bach B Carlos	1020
131252	41	5	5	vpalaciosg06	2026-01-03	GRANI	1038
131253	41	5	5	vpalaciosg06	2026-01-04	GRANI	1038
131254	14	1	1	emurielb76	2026-01-05	MAITE	989
131255	45	2	2	emurielb76	2026-01-05	Intel. Artif. 1º Bach. Miguel	1022
131256	8	2	2	emurielb76	2026-01-05	Biología NB 1º ESO A Alba Fajardo	958
131257	62	2	2	emurielb76	2026-01-05	Mates NB 2º ESO A Raquel	962
131258	14	3	3	emurielb76	2026-01-05	MAITE	990
131259	8	3	3	emurielb76	2026-01-05	Refuerzo Lengua 1º ESO A/B Maribel	960
131260	45	3	3	emurielb76	2026-01-05	Digit. Básica 1º ESO A/B Miguel	1023
131261	43	3	3	emurielb76	2026-01-05	Economía 1º Bach. Cristina Blanco	981
131262	22	3	3	emurielb76	2026-01-05	Latín 1º Bach. Juan José	993
131263	42	3	5	emurielb76	2026-01-05	2º GS Optativa. Rosa	1007
131264	22	4	4	emurielb76	2026-01-05	Atendida por Carlos	996
131265	41	5	5	vpalaciosg06	2026-01-05	GRANI	1038
131266	22	5	5	emurielb76	2026-01-05	Atendida por Inma	1000
131267	63	5	5	emurielb76	2026-01-05	Biología 2º Bach Celia	1013
131268	45	5	5	emurielb76	2026-01-05	Digitalización 4º ESO A/B Miguel	1026
131269	55	6	6	emurielb76	2026-01-05	Economía 4º ESO Cristina Blanco	1018
131270	63	6	6	emurielb76	2026-01-05	CC Grales 2º Bach Elena G.	1014
131271	14	6	6	emurielb76	2026-01-05	MAITE	991
131272	22	6	6	emurielb76	2026-01-05	Atendida por Matilde	1002
131273	55	7	7	emurielb76	2026-01-05	Matem. A 4º ESO Raquel	969
131274	45	7	7	emurielb76	2026-01-05	TyD 2º ESO B Miguel	1028
131275	55	1	1	emurielb76	2026-01-06	Latín 4º B Juan José	970
131276	43	2	2	emurielb76	2026-01-06	Economía 1º Bach. Cristina Blanco	1037
131277	55	3	3	emurielb76	2026-01-06	Matem. A 4º ESO Raquel	971
131278	14	3	3	emurielb76	2026-01-06	Itin. Empl. 1º CFGB Luis	985
131279	45	3	3	emurielb76	2026-01-06	Intel. Artif. 1º Bach. Miguel	1029
131280	22	4	4	emurielb76	2026-01-06	Atendida por Patricia	998
131281	22	5	5	emurielb76	2026-01-06	Latín 1º Bach. Juan José	994
131282	41	5	5	vpalaciosg06	2026-01-06	GRANI	1038
131283	43	5	5	emurielb76	2026-01-06	Econ. Empr. 1º Bach. Cristina Blanco	980
131284	45	5	5	emurielb76	2026-01-06	Unión Europea Jorge 4º ESO	1021
131285	22	6	6	emurielb76	2026-01-06	Atendida por Inma	1001
131286	63	6	6	emurielb76	2026-01-06	Refuerzo Mates 2º ESO A/B INFORM.	967
131287	14	6	6	emurielb76	2026-01-06	Itin. Empl. 1º CFGB Luis	986
131288	62	6	6	emurielb76	2026-01-06	Refuerzo Lengua 2º ESO A/B Juan José	965
131289	40	6	6	emurielb76	2026-01-06	Biología 2º Bach Celia	1017
131290	14	7	7	emurielb76	2026-01-06	Hª Filosofía 2º Bach B Carlos	1020
131291	45	1	1	emurielb76	2026-01-07	TyD  2º ESO A Miguel	1030
131292	45	2	2	emurielb76	2026-01-07	Intel. Artif. 1º Bach. Miguel	1022
131293	63	2	2	emurielb76	2026-01-07	Biología 2º Bach Celia	1011
131294	14	2	2	emurielb76	2026-01-07	MAITE	992
131295	8	2	2	emurielb76	2026-01-07	Biología NB 1º ESO A Alba Fajardo	958
131296	62	2	2	emurielb76	2026-01-07	Mates NB 2º ESO A Raquel	962
131297	42	3	3	emurielb76	2026-01-07	1º GM Digitalización. Peti	1005
131298	55	3	3	emurielb76	2026-01-07	Matem. A 4º ESO Raquel	971
131299	22	4	4	emurielb76	2026-01-07	Atendida por Inma	999
131300	41	5	5	vpalaciosg06	2026-01-07	GRANI	1038
131301	63	5	5	emurielb76	2026-01-07	CC Grales 2º Bach Elena G.	1015
131302	45	5	5	emurielb76	2026-01-07	Digit. Básica 1º ESO A/B Miguel	1024
131303	8	5	5	emurielb76	2026-01-07	Refuerzo Lengua 1º ESO A/B Maribel	961
131304	14	5	5	emurielb76	2026-01-07	MAITE	1036
131305	55	5	5	emurielb76	2026-01-07	Economía 4º ESO Cristina Blanco	1019
131306	43	6	6	emurielb76	2026-01-07	Economía 1º Bach. Cristina Blanco	982
131307	41	6	6	vpalaciosg06	2026-01-07	GRANI	1041
131308	45	6	6	emurielb76	2026-01-07	Digitalización 4º ESO A/B Miguel	1031
131309	42	7	7	emurielb76	2026-01-07	1º GS Digitalización. Peti	1040
131310	45	1	1	emurielb76	2026-01-08	Intel. Artif. 1º Bach. Informática	977
131311	14	1	1	emurielb76	2026-01-08	Itin. Empl. 1º CFGB Luis	987
131312	42	2	2	efranciscor01	2026-01-08	2 GRADO MEDIO PROYECTO Estela	\N
131313	14	2	2	emurielb76	2026-01-08	Itin. Empl. 1º CFGB Luis	988
131314	63	2	2	emurielb76	2026-01-08	Raquel apoyo	1039
131315	63	3	3	emurielb76	2026-01-08	Refuerzo Mates 2º ESO A/B INFORM.	968
131316	43	3	3	emurielb76	2026-01-08	Economía 1º Bach. Cristina Blanco	981
131317	62	3	3	emurielb76	2026-01-08	Refuerzo Lengua 2º ESO A/B Juan José	966
131318	22	4	4	emurielb76	2026-01-08	Atendida por Patricia	998
131319	43	5	5	emurielb76	2026-01-08	Econ. Empr. 1º Bach. Cristina Blanco	980
131320	62	5	5	emurielb76	2026-01-08	Mates NB 2º ESO A Raquel	963
131321	45	5	5	emurielb76	2026-01-08	Digitalización 4º ESO A/B Miguel	1026
131322	14	5	5	omsanchezg01	2026-01-08	OLGA 3º DIVER	\N
131323	42	5	5	isabel22	2026-01-08	isabel panadero	\N
131324	22	5	5	emurielb76	2026-01-08	Latín 1º Bach. Juan José	994
131325	41	5	5	vpalaciosg06	2026-01-08	GRANI	1038
131326	45	6	6	mgperezr02	2026-01-08	Grani	\N
131327	63	6	6	emurielb76	2026-01-08	CC Grales 2º Bach Elena G.	1014
131328	42	6	6	rmvegac01	2026-01-08	DCM	\N
131329	55	6	6	emurielb76	2026-01-08	Latín 4º B Juan José	972
131330	45	7	7	emurielb76	2026-01-08	TyD 2º ESO B Miguel	1028
131331	30	7	7	mafloresm01	2026-01-08	Mª Ángeles Flores (2º Bachillerato)	\N
131332	43	7	7	dmatasr01	2026-01-08	David Matas	\N
131333	42	7	7	emurielb76	2026-01-08	2º GS Proyecto. Rosa	1009
131334	14	7	7	emurielb76	2026-01-08	Hª Filosofía 2º Bach B Carlos	1020
131335	42	1	1	rmvegac01	2026-01-09	dcm	\N
131336	62	1	1	emurielb76	2026-01-09	Mates NB 2º ESO A Raquel	964
131337	45	1	1	omsanchezg01	2026-01-09	OLGA APOYO	\N
131338	43	2	2	emurielb76	2026-01-09	Econ. Empr. 1º Bach. Cristina Blanco	983
131339	45	2	2	mafloresm01	2026-01-09	M ÁNGELES FLORES MARÍA (4º ESO-A)	\N
131340	42	2	2	rmvegac01	2026-01-09	IFAM	\N
131341	22	2	2	emurielb76	2026-01-09	Latín 1º Bach. Juan José	995
131342	55	3	3	emurielb76	2026-01-09	Latín 4º B Juan José	973
131343	14	3	3	omsanchezg01	2026-01-09	OLGA 3º DIVER	\N
131344	8	3	3	emurielb76	2026-01-09	Biología NB 1º ESO A Alba Fajardo	959
131345	45	3	3	emurielb76	2026-01-09	1º Bach AE. Virginia	1033
131346	22	4	4	emurielb76	2026-01-09	Atendida por Inma	999
131347	45	5	5	emurielb76	2026-01-09	TyD  2º ESO A Miguel	1032
131348	63	5	5	emurielb76	2026-01-09	Biología 2º Bach Celia	1012
131349	41	5	5	vpalaciosg06	2026-01-09	GRANI	1038
131350	22	5	5	emurielb76	2026-01-09	Charla (Preguntar a Carlos Lozano)	1004
131351	55	5	5	emurielb76	2026-01-09	Matem. A 4º ESO Raquel	974
131352	14	5	5	mafloresm01	2026-01-09	Mª Ángeles Flores (4º ESO-Diver)	\N
131353	42	6	6	rmvegac01	2026-01-09	DCM	\N
131354	55	6	6	emurielb76	2026-01-09	Economía 4º ESO Cristina Blanco	1018
131355	63	6	6	emurielb76	2026-01-09	CC Grales 2º Bach Elena G.	1014
131356	30	7	7	mafloresm01	2026-01-09	Mª Ángeles Flores (2º Bachillerato)	\N
131357	45	7	7	pagarciam27	2026-01-09	Patricia 2ºESO	\N
131358	14	7	7	emurielb76	2026-01-09	Hª Filosofía 2º Bach B Carlos	1020
131359	43	7	7	emurielb76	2026-01-09	Economía 1º Bach. Cristina Blanco	984
131360	67	7	7	mahernandezr06	2026-01-09	Atención educativa Miguel	\N
131361	42	7	7	rmvegac01	2026-01-09	IFAM	\N
131362	41	5	5	vpalaciosg06	2026-01-10	GRANI	1038
131363	41	5	5	vpalaciosg06	2026-01-11	GRANI	1038
131364	14	1	1	emurielb76	2026-01-12	MAITE	989
131365	8	2	2	emurielb76	2026-01-12	Biología NB 1º ESO A Alba Fajardo	958
131366	62	2	2	emurielb76	2026-01-12	Mates NB 2º ESO A Raquel	962
131367	43	2	2	celita2	2026-01-12	CELIA 1º ESO	\N
131368	45	2	2	emurielb76	2026-01-12	Intel. Artif. 1º Bach. Miguel	1022
131369	43	3	3	emurielb76	2026-01-12	Economía 1º Bach. Cristina Blanco	981
131370	67	3	3	omsanchezg01	2026-01-12	OLGA APOYO	\N
131371	22	3	3	emurielb76	2026-01-12	Latín 1º Bach. Juan José	993
131372	42	3	5	emurielb76	2026-01-12	2º GS Optativa. Rosa	1007
131373	14	3	3	emurielb76	2026-01-12	MAITE	990
131374	8	3	3	emurielb76	2026-01-12	Refuerzo Lengua 1º ESO A/B Maribel	960
131375	45	3	3	emurielb76	2026-01-12	Digit. Básica 1º ESO A/B Miguel	1023
131376	22	4	4	emurielb76	2026-01-12	Atendida por Carlos	996
131377	45	5	5	emurielb76	2026-01-12	Digitalización 4º ESO A/B Miguel	1026
131378	22	5	5	emurielb76	2026-01-12	Atendida por Inma	1000
131379	41	5	5	vpalaciosg06	2026-01-12	GRANI	1038
131380	63	5	5	emurielb76	2026-01-12	Biología 2º Bach Celia	1013
131381	42	6	7	rmvegac01	2026-01-12	DCM	\N
131382	14	6	6	emurielb76	2026-01-12	MAITE	991
131383	55	6	6	emurielb76	2026-01-12	Economía 4º ESO Cristina Blanco	1018
131384	63	6	6	emurielb76	2026-01-12	CC Grales 2º Bach Elena G.	1014
131385	22	6	6	emurielb76	2026-01-12	Atendida por Matilde	1002
131386	67	6	6	mtcerezog01	2026-01-12	Teresa 3º diver	\N
131387	41	7	7	omsanchezg01	2026-01-12	OLGA 4º DIVER	\N
131388	55	7	7	emurielb76	2026-01-12	Matem. A 4º ESO Raquel	969
131389	45	7	7	emurielb76	2026-01-12	TyD 2º ESO B Miguel	1028
131390	55	1	1	emurielb76	2026-01-13	Latín 4º B Juan José	970
131391	43	2	2	emurielb76	2026-01-13	Economía 1º Bach. Cristina Blanco	1037
131392	14	2	2	mtcerezog01	2026-01-13	Teresa 4º Diver	\N
131393	41	2	2	jjmorcillor01	2026-01-13	Juanjo Morcillo 3º Cultura Clásica	\N
131394	55	3	3	emurielb76	2026-01-13	Matem. A 4º ESO Raquel	971
131395	14	3	3	emurielb76	2026-01-13	Itin. Empl. 1º CFGB Luis	985
131396	45	3	3	emurielb76	2026-01-13	Intel. Artif. 1º Bach. Miguel	1029
131397	22	4	4	emurielb76	2026-01-13	Atendida por Patricia	998
131398	43	5	5	emurielb76	2026-01-13	Econ. Empr. 1º Bach. Cristina Blanco	980
131399	41	5	5	vpalaciosg06	2026-01-13	GRANI	1038
131400	14	5	5	omsanchezg01	2026-01-13	OLGA 3º DIVER	\N
131401	22	5	5	emurielb76	2026-01-13	Latín 1º Bach. Juan José	994
131402	45	5	5	emurielb76	2026-01-13	Unión Europea Jorge 4º ESO	1021
131403	63	6	6	emurielb76	2026-01-13	Refuerzo Mates 2º ESO A/B INFORM.	967
131404	14	6	6	emurielb76	2026-01-13	Itin. Empl. 1º CFGB Luis	986
131405	62	6	6	emurielb76	2026-01-13	Refuerzo Lengua 2º ESO A/B Juan José	965
131406	40	6	6	emurielb76	2026-01-13	Biología 2º Bach Celia	1017
131407	45	6	6	jjmorcillor01	2026-01-13	Juanjo Morcillo	\N
131408	22	6	6	emurielb76	2026-01-13	Atendida por Inma	1001
131409	14	7	7	emurielb76	2026-01-13	Hª Filosofía 2º Bach B Carlos	1020
131410	41	1	1	mdcpalaciosr01	2026-01-14	AMBITO PRACTICO 4º DIVER	\N
131411	45	1	1	emurielb76	2026-01-14	TyD  2º ESO A Miguel	1030
131412	45	2	2	emurielb76	2026-01-14	Intel. Artif. 1º Bach. Miguel	1022
131413	8	2	2	emurielb76	2026-01-14	Biología NB 1º ESO A Alba Fajardo	958
131414	62	2	2	emurielb76	2026-01-14	Mates NB 2º ESO A Raquel	962
131415	63	2	2	emurielb76	2026-01-14	Biología 2º Bach Celia	1011
131416	14	2	2	emurielb76	2026-01-14	MAITE	992
131417	41	2	2	mdcpalaciosr01	2026-01-14	AMBITO PRACTICO 3º DIVER	\N
131418	55	3	3	emurielb76	2026-01-14	Matem. A 4º ESO Raquel	971
131419	42	3	3	emurielb76	2026-01-14	1º GM Digitalización. Peti	1005
131420	22	4	4	emurielb76	2026-01-14	Atendida por Inma	999
131421	63	5	5	emurielb76	2026-01-14	CC Grales 2º Bach Elena G.	1015
131422	45	5	5	emurielb76	2026-01-14	Digit. Básica 1º ESO A/B Miguel	1024
131423	8	5	5	emurielb76	2026-01-14	Refuerzo Lengua 1º ESO A/B Maribel	961
131424	14	5	5	emurielb76	2026-01-14	MAITE	1036
131425	55	5	5	emurielb76	2026-01-14	Economía 4º ESO Cristina Blanco	1019
131426	41	5	5	vpalaciosg06	2026-01-14	GRANI	1038
131427	43	5	5	mafloresm01	2026-01-14	Mª Ángeles Flores (4º ESO-Diver)	\N
131428	42	5	5	bcrespoc01	2026-01-14	ADO	\N
131429	41	6	6	vpalaciosg06	2026-01-14	GRANI	1041
131430	45	6	6	emurielb76	2026-01-14	Digitalización 4º ESO A/B Miguel	1031
131431	43	6	6	emurielb76	2026-01-14	Economía 1º Bach. Cristina Blanco	982
131432	14	7	7	omsanchezg01	2026-01-14	OLGA 3º DIVER	\N
131433	42	7	7	emurielb76	2026-01-14	1º GS Digitalización. Peti	1040
131434	14	1	1	emurielb76	2026-01-15	Itin. Empl. 1º CFGB Luis	987
131435	45	1	1	emurielb76	2026-01-15	Intel. Artif. 1º Bach. Informática	977
131436	63	2	2	emurielb76	2026-01-15	Raquel apoyo	1039
131437	22	2	2	cjlozanop01	2026-01-15	Carlos J. -Filosofía	\N
131438	42	2	2	efranciscor01	2026-01-15	2 GRADO MEDIO PROYECTO Estela	\N
131439	14	2	2	emurielb76	2026-01-15	Itin. Empl. 1º CFGB Luis	988
131440	62	3	3	emurielb76	2026-01-15	Refuerzo Lengua 2º ESO A/B Juan José	966
131441	30	3	3	susana	2026-01-15	CHARLA FEAFES	\N
131442	43	3	3	emurielb76	2026-01-15	Economía 1º Bach. Cristina Blanco	981
131443	63	3	3	emurielb76	2026-01-15	Refuerzo Mates 2º ESO A/B INFORM.	968
131444	22	4	4	emurielb76	2026-01-15	Atendida por Patricia	998
131445	22	5	5	emurielb76	2026-01-15	Latín 1º Bach. Juan José	994
131446	62	5	5	emurielb76	2026-01-15	Mates NB 2º ESO A Raquel	963
131447	41	5	5	vpalaciosg06	2026-01-15	GRANI	1038
131448	43	5	5	emurielb76	2026-01-15	Econ. Empr. 1º Bach. Cristina Blanco	980
131449	14	5	5	celita2	2026-01-15	CELIA 1º ESO	\N
131450	45	5	5	emurielb76	2026-01-15	Digitalización 4º ESO A/B Miguel	1026
131451	30	5	5	susana	2026-01-15	CHARLA FEAFES	\N
131452	63	6	6	emurielb76	2026-01-15	CC Grales 2º Bach Elena G.	1014
131453	55	6	6	emurielb76	2026-01-15	Latín 4º B Juan José	972
131454	42	6	6	dnarcisoc01	2026-01-15	Lola. APC	\N
131455	41	6	6	jjmorcillor01	2026-01-15	Juanjo Morcillo Latín 4º ESO	\N
131456	43	6	6	mebravom01	2026-01-15	1º Bachillerato de Religión	\N
131457	45	6	6	mgperezr02	2026-01-15	Grani	\N
131458	43	7	7	dmatasr01	2026-01-15	David Matas	\N
131459	42	7	7	emurielb76	2026-01-15	2º GS Proyecto. Rosa	1009
131460	45	7	7	emurielb76	2026-01-15	TyD 2º ESO B Miguel	1028
131461	14	7	7	emurielb76	2026-01-15	Hª Filosofía 2º Bach B Carlos	1020
131462	30	7	7	mafloresm01	2026-01-15	Mª Ángeles Flores (2º Bachillerato)	\N
131463	22	7	7	mji3003	2026-01-15	Inma	\N
131464	41	1	1	mji3003	2026-01-16	Inma	\N
131465	14	1	1	mtcerezog01	2026-01-16	Teresa.  3º Atención Educativa	\N
131466	67	1	1	isabel22	2026-01-16	isabel panadero	\N
131467	45	1	1	omsanchezg01	2026-01-16	3º ESO B ATENCIÓN EDUCATIVA	\N
131468	42	1	1	emurielb76	2026-01-16	Elena Muriel 1º GM	\N
131469	62	1	1	emurielb76	2026-01-16	Mates NB 2º ESO A Raquel	964
131470	14	2	2	omsanchezg01	2026-01-16	OLGA 3º DIVER	\N
131471	22	2	2	emurielb76	2026-01-16	Latín 1º Bach. Juan José	995
131472	43	2	2	emurielb76	2026-01-16	Econ. Empr. 1º Bach. Cristina Blanco	983
131473	45	2	2	mafloresm01	2026-01-16	M ÁNGELES FLORES MARÍA (4º ESO-A)	\N
131474	8	3	3	emurielb76	2026-01-16	Biología NB 1º ESO A Alba Fajardo	959
131475	43	3	3	mebravom01	2026-01-16	1º Bachillerato de Religión	\N
131476	45	3	3	emurielb76	2026-01-16	1º Bach AE. Virginia	1033
131477	55	3	3	emurielb76	2026-01-16	Latín 4º B Juan José	973
131478	22	4	4	emurielb76	2026-01-16	Atendida por Inma	999
131479	55	5	5	emurielb76	2026-01-16	Matem. A 4º ESO Raquel	974
131480	22	5	5	emurielb76	2026-01-16	Atendida por Matilde	1004
131481	14	5	5	mrcarmonav01	2026-01-16	Remedios Carmona Vinagre 3ºDIVER	\N
131482	45	5	5	emurielb76	2026-01-16	TyD  2º ESO A Miguel	1032
131483	63	5	5	emurielb76	2026-01-16	Biología 2º Bach Celia	1012
131484	41	5	5	vpalaciosg06	2026-01-16	GRANI	1038
131485	41	6	6	omsanchezg01	2026-01-16	OLGA 4º DIVER	\N
131486	55	6	6	emurielb76	2026-01-16	Economía 4º ESO Cristina Blanco	1018
131487	45	6	6	ilozano1977	2026-01-16	Isabel Lozano 3º ESO	\N
131488	63	6	6	emurielb76	2026-01-16	CC Grales 2º Bach Elena G.	1014
131489	55	7	7	mebravom01	2026-01-16	4º ESO	\N
131490	14	7	7	emurielb76	2026-01-16	Hª Filosofía 2º Bach B Carlos	1020
131491	45	7	7	mahernandezr06	2026-01-16	Atención educativa Miguel y Elena	\N
131492	43	7	7	emurielb76	2026-01-16	Economía 1º Bach. Cristina Blanco	984
131493	67	7	7	mtcerezog01	2026-01-16	Teresa 3º diver	\N
131494	41	5	5	vpalaciosg06	2026-01-17	GRANI	1038
131495	41	5	5	vpalaciosg06	2026-01-18	GRANI	1038
131496	14	1	1	emurielb76	2026-01-19	MAITE	989
131497	8	2	2	emurielb76	2026-01-19	Biología NB 1º ESO A Alba Fajardo	958
131498	62	2	2	emurielb76	2026-01-19	Mates NB 2º ESO A Raquel	962
131499	43	2	2	mafloresm01	2026-01-19	Mª Ángeles Flores (4º ESO-Diver)	\N
131500	67	2	2	omsanchezg01	2026-01-19	OLGA 3º DIVER	\N
131501	45	2	2	emurielb76	2026-01-19	Intel. Artif. 1º Bach. Miguel	1022
131502	22	3	3	emurielb76	2026-01-19	Latín 1º Bach. Juan José	993
131503	42	3	5	emurielb76	2026-01-19	2º GS Optativa. Rosa	1007
131504	43	3	3	emurielb76	2026-01-19	Economía 1º Bach. Cristina Blanco	981
131505	14	3	3	emurielb76	2026-01-19	MAITE	990
131506	8	3	3	emurielb76	2026-01-19	Refuerzo Lengua 1º ESO A/B Maribel	960
131507	45	3	3	emurielb76	2026-01-19	Digit. Básica 1º ESO A/B Miguel	1023
131508	22	4	4	emurielb76	2026-01-19	Atendida por Carlos	996
131509	63	5	5	emurielb76	2026-01-19	Biología 2º Bach Celia	1013
131510	45	5	5	emurielb76	2026-01-19	Digitalización 4º ESO A/B Miguel	1026
131511	43	5	5	jjmorcillor01	2026-01-19	Juanjo Morcillo	\N
131512	41	5	5	vpalaciosg06	2026-01-19	GRANI	1038
131513	22	5	5	emurielb76	2026-01-19	Atendida por Inma	1000
131514	42	6	6	dnarcisoc01	2026-01-19	Lola. APC	\N
131515	22	6	6	emurielb76	2026-01-19	Atendida por Matilde	1002
131516	63	6	6	emurielb76	2026-01-19	CC Grales 2º Bach Elena G.	1014
131517	55	6	6	emurielb76	2026-01-19	Economía 4º ESO Cristina Blanco	1018
131518	14	6	6	emurielb76	2026-01-19	MAITE	991
131519	42	7	7	dnarcisoc01	2026-01-19	Lola. APC	\N
131520	45	7	7	emurielb76	2026-01-19	TyD 2º ESO B Miguel	1028
131521	55	7	7	emurielb76	2026-01-19	Matem. A 4º ESO Raquel	969
131522	41	7	7	omsanchezg01	2026-01-19	OLGA 4º DIVER	\N
131523	55	1	1	emurielb76	2026-01-20	Latín 4º B Juan José	970
131524	45	1	1	dmatasr01	2026-01-20	David Matas	\N
131525	41	1	1	jjmorcillor01	2026-01-20	Juanjo Morcillo	\N
131526	41	2	2	jjmorcillor01	2026-01-20	Juanjo Morcillo	\N
131527	14	2	2	mtcerezog01	2026-01-20	Teresa 4º Diver	\N
131528	43	2	2	emurielb76	2026-01-20	Economía 1º Bach. Cristina Blanco	1037
131529	45	3	3	emurielb76	2026-01-20	Intel. Artif. 1º Bach. Miguel	1029
131530	43	3	3	celita2	2026-01-20	CELIA 1º ESO	\N
131531	55	3	3	emurielb76	2026-01-20	Matem. A 4º ESO Raquel	971
131532	14	3	3	emurielb76	2026-01-20	Itin. Empl. 1º CFGB Luis	985
131533	22	4	4	emurielb76	2026-01-20	Atendida por Patricia	998
131534	45	5	5	emurielb76	2026-01-20	Unión Europea Jorge 4º ESO	1021
131535	43	5	5	emurielb76	2026-01-20	Econ. Empr. 1º Bach. Cristina Blanco	980
131536	42	5	5	dmatasr01	2026-01-20	David Matas	\N
131537	41	5	5	vpalaciosg06	2026-01-20	GRANI	1038
131538	67	5	5	jjmorcillor01	2026-01-20	Juanjo Morcillo	\N
131539	22	5	5	emurielb76	2026-01-20	Latín 1º Bach. Juan José	994
131540	14	5	5	omsanchezg01	2026-01-20	OLGA 3º DIVER	\N
131541	62	6	6	emurielb76	2026-01-20	Refuerzo Lengua 2º ESO A/B Juan José	965
131542	40	6	6	emurielb76	2026-01-20	Biología 2º Bach Celia	1017
131543	22	6	6	emurielb76	2026-01-20	Atendida por Inma	1001
131544	42	6	7	pety78	2026-01-20	Pety	\N
131545	63	6	6	emurielb76	2026-01-20	Refuerzo Mates 2º ESO A/B INFORM.	967
131546	14	6	6	emurielb76	2026-01-20	Itin. Empl. 1º CFGB Luis	986
131547	41	7	7	omsanchezg01	2026-01-20	OLGA 4º DIVER	\N
131548	45	7	7	jjmorcillor01	2026-01-20	Juanjo Morcillo	\N
131549	22	7	7	pagarciam27	2026-01-20	Inma	\N
131550	43	7	7	dmatasr01	2026-01-20	David Matas	\N
131551	14	7	7	emurielb76	2026-01-20	Hª Filosofía 2º Bach B Carlos	1020
131552	42	1	2	pety78	2026-01-21	Pety	\N
131553	45	1	1	emurielb76	2026-01-21	TyD  2º ESO A Miguel	1030
131554	41	1	1	mdcpalaciosr01	2026-01-21	AMBITO PRACTICO 4º DIVER	\N
131555	41	2	2	mdcpalaciosr01	2026-01-21	AMBITO PRACTICO 3º DIVER	\N
131556	63	2	2	emurielb76	2026-01-21	Biología 2º Bach Celia	1011
131557	14	2	2	emurielb76	2026-01-21	MAITE	992
131558	45	2	2	emurielb76	2026-01-21	Intel. Artif. 1º Bach. Miguel	1022
131559	8	2	2	emurielb76	2026-01-21	Biología NB 1º ESO A Alba Fajardo	958
131560	62	2	2	emurielb76	2026-01-21	Mates NB 2º ESO A Raquel	962
131561	55	3	3	emurielb76	2026-01-21	Matem. A 4º ESO Raquel	971
131562	14	3	3	mtcerezog01	2026-01-21	Teresa 3º diver	\N
131563	42	3	3	emurielb76	2026-01-21	1º GM Digitalización. Peti	1005
131564	41	3	3	dnarcisoc01	2026-01-21	LOLA 1ºGS APSI	\N
131565	45	3	3	dmatasr01	2026-01-21	David Matas	\N
131566	22	4	4	emurielb76	2026-01-21	Atendida por Inma	999
131567	41	5	5	vpalaciosg06	2026-01-21	GRANI	1038
131568	14	5	5	emurielb76	2026-01-21	MAITE	1036
131569	55	5	5	emurielb76	2026-01-21	Economía 4º ESO Cristina Blanco	1019
131570	42	5	5	pety78	2026-01-21	Pety	\N
131571	43	5	5	egonzalezh18	2026-01-21	Elena 2º bachillerato	\N
131572	63	5	5	emurielb76	2026-01-21	CC Grales 2º Bach Elena G.	1015
131573	45	5	5	emurielb76	2026-01-21	Digit. Básica 1º ESO A/B Miguel	1024
131574	8	5	5	emurielb76	2026-01-21	Refuerzo Lengua 1º ESO A/B Maribel	961
131575	14	6	6	cjlozanop01	2026-01-21	Carlos J. -Filosofía	\N
131576	67	6	6	rmvegac01	2026-01-21	Isabel Panadero	\N
131577	43	6	6	emurielb76	2026-01-21	Economía 1º Bach. Cristina Blanco	982
131578	47	6	6	djuliog01	2026-01-21	Diana Julio (2ºB)	\N
131579	42	6	6	dnarcisoc01	2026-01-21	Lola. APC	\N
131580	41	6	6	vpalaciosg06	2026-01-21	GRANI	1041
131581	45	6	6	emurielb76	2026-01-21	Digitalización 4º ESO A/B Miguel	1031
131582	42	7	7	emurielb76	2026-01-21	1º GS Digitalización. Peti	1040
131583	67	7	7	ndelorzac02	2026-01-21	Nieves	\N
131584	45	7	7	mrcarmonav01	2026-01-21	Remedios Carmona Vinagre 3ºA	\N
131585	43	1	1	ilozano1977	2026-01-22	Isabel Lozano	\N
131586	45	1	1	emurielb76	2026-01-22	Intel. Artif. 1º Bach. Informática	977
131587	67	1	1	ndelorzac02	2026-01-22	Nieves	\N
131588	14	1	1	emurielb76	2026-01-22	Itin. Empl. 1º CFGB Luis	987
131589	45	2	2	pagarciam27	2026-01-22	Patricia TAE	\N
131590	42	2	2	efranciscor01	2026-01-22	2 GRADO MEDIO PROYECTO Estela	\N
131591	30	2	2	rencinasr02	2026-01-22	Raquel Encinas Rivera	\N
131592	14	2	2	emurielb76	2026-01-22	Itin. Empl. 1º CFGB Luis	988
131593	43	2	2	emurielb76	2026-01-22	Elena Muriel 1º GM	\N
131594	63	2	2	emurielb76	2026-01-22	Raquel apoyo	1039
131595	41	2	2	ilozano1977	2026-01-22	Isabel Lozano	\N
131596	63	3	3	emurielb76	2026-01-22	Refuerzo Mates 2º ESO A/B INFORM.	968
131597	41	3	3	jjmorcillor01	2026-01-22	Juanjo Morcillo	\N
131598	62	3	3	emurielb76	2026-01-22	Refuerzo Lengua 2º ESO A/B Juan José	966
131599	43	3	3	emurielb76	2026-01-22	Economía 1º Bach. Cristina Blanco	981
131600	22	4	4	emurielb76	2026-01-22	Atendida por Patricia	998
131601	45	5	5	emurielb76	2026-01-22	Digitalización 4º ESO A/B Miguel	1026
131602	22	5	5	emurielb76	2026-01-22	Latín 1º Bach. Juan José	994
131603	47	5	5	mssalomonp02	2026-01-22	Marisol Matemáticas	\N
131604	41	5	5	vpalaciosg06	2026-01-22	GRANI	1038
131605	62	5	5	emurielb76	2026-01-22	Mates NB 2º ESO A Raquel	963
131606	43	5	5	emurielb76	2026-01-22	Econ. Empr. 1º Bach. Cristina Blanco	980
131607	45	6	6	mgperezr02	2026-01-22	Grani	\N
131608	43	6	6	celita2	2026-01-22	CELIA 1º ESO	\N
131609	42	6	6	dnarcisoc01	2026-01-22	Lola. APC	\N
131610	14	6	6	mtcerezog01	2026-01-22	Teresa 4º Diver	\N
131611	55	6	6	emurielb76	2026-01-22	Latín 4º B Juan José	972
131612	41	6	6	jjmorcillor01	2026-01-22	Juanjo Morcillo	\N
131613	63	6	6	emurielb76	2026-01-22	CC Grales 2º Bach Elena G.	1014
131614	30	7	7	mafloresm01	2026-01-22	Mª Ángeles Flores (2º Bachillerato)	\N
131615	14	7	7	emurielb76	2026-01-22	Hª Filosofía 2º Bach B Carlos	1020
131616	45	7	7	emurielb76	2026-01-22	TyD 2º ESO B Miguel	1028
131617	42	7	7	emurielb76	2026-01-22	2º GS Proyecto. Rosa	1009
131618	62	1	1	emurielb76	2026-01-23	Mates NB 2º ESO A Raquel	964
131619	42	1	1	emurielb76	2026-01-23	Elena 1º GM	\N
131620	45	1	1	omsanchezg01	2026-01-23	3º ESO B ATENCIÓN EDUCATIVA	\N
131621	14	1	1	mtcerezog01	2026-01-23	Teresa.  3º Atención Educativa	\N
131622	43	1	1	mebravom01	2026-01-23	3º de la ESO DE RELIGIÓN	\N
131623	45	2	2	mafloresm01	2026-01-23	M ÁNGELES FLORES MARÍA (4º ESO-A)	\N
131624	22	2	2	emurielb76	2026-01-23	Latín 1º Bach. Juan José	995
131625	43	2	2	emurielb76	2026-01-23	Econ. Empr. 1º Bach. Cristina Blanco	983
131626	41	2	2	mebravom01	2026-01-23	2º ESO Reli	\N
131627	41	3	3	jjmorcillor01	2026-01-23	Juanjo Morcillo	\N
131628	45	3	3	emurielb76	2026-01-23	1º Bach AE. Virginia	1033
131629	14	3	3	omsanchezg01	2026-01-23	OLGA 3º DIVER	\N
131630	55	3	3	emurielb76	2026-01-23	Latín 4º B Juan José	973
131631	8	3	3	emurielb76	2026-01-23	Biología NB 1º ESO A Alba Fajardo	959
131632	43	3	3	ilozano1977	2026-01-23	Isabel Lozano	\N
131633	22	4	4	emurielb76	2026-01-23	Atendida por Inma	999
131634	55	5	5	emurielb76	2026-01-23	Matem. A 4º ESO Raquel	974
131635	22	5	5	emurielb76	2026-01-23	Atendida por Matilde	1004
131636	41	5	5	vpalaciosg06	2026-01-23	GRANI	1038
131637	45	5	5	emurielb76	2026-01-23	TyD  2º ESO A Miguel	1032
131638	63	5	5	emurielb76	2026-01-23	Biología 2º Bach Celia	1012
131639	14	5	5	mrcarmonav01	2026-01-23	Remedios Carmona Vinagre 3ºDIVER	\N
131640	47	5	5	djuliog01	2026-01-23	Diana Julio (3º B)	\N
131641	47	6	6	egonzalezh18	2026-01-23	Elena González	\N
131642	41	6	6	egonzalezh18	2026-01-23	Elena 2º bachillerato	\N
131643	55	6	6	emurielb76	2026-01-23	Economía 4º ESO Cristina Blanco	1018
131644	43	6	6	jjmorcillor01	2026-01-23	Juanjo Morcillo	\N
131645	63	6	6	emurielb76	2026-01-23	CC Grales 2º Bach Elena G.	1014
131646	45	6	6	pagarciam27	2026-01-23	Patricia 4ºESO	\N
131647	43	7	7	emurielb76	2026-01-23	Economía 1º Bach. Cristina Blanco	984
131648	67	7	7	mtcerezog01	2026-01-23	Teresa 3º diver	\N
131649	47	7	7	djuliog01	2026-01-23	Diana Julio (1ºB)	\N
131650	14	7	7	emurielb76	2026-01-23	Hª Filosofía 2º Bach B Carlos	1020
131651	45	7	7	pagarciam27	2026-01-23	Patricia 2ºESO	\N
131652	41	7	7	mahernandezr06	2026-01-23	Atención Educativa 4º ESO (Elena y Miguel)	\N
131653	41	5	5	vpalaciosg06	2026-01-24	GRANI	1038
131654	41	5	5	vpalaciosg06	2026-01-25	GRANI	1038
131655	14	1	1	emurielb76	2026-01-26	MAITE	989
131656	42	2	2	isabel22	2026-01-26	isabel panadero	\N
131657	14	2	2	omsanchezg01	2026-01-26	OLGA 3º DIVER	\N
131658	45	2	2	emurielb76	2026-01-26	Intel. Artif. 1º Bach. Miguel	1022
131659	43	2	2	ilozano1977	2026-01-26	Isabel Lozano	\N
131660	41	2	2	mafloresm01	2026-01-26	Mª Ángeles Flores (4º ESO-Diver)	\N
131661	8	2	2	emurielb76	2026-01-26	Biología NB 1º ESO A Alba Fajardo	958
131662	62	2	2	emurielb76	2026-01-26	Mates NB 2º ESO A Raquel	962
131663	41	3	3	mafloresm01	2026-01-26	M ÁNGELES FLORES MARÍA (4º ESO-A)	\N
131664	45	3	3	emurielb76	2026-01-26	Digit. Básica 1º ESO A/B Miguel	1023
131665	43	3	3	emurielb76	2026-01-26	Economía 1º Bach. Cristina Blanco	981
131666	22	3	3	emurielb76	2026-01-26	Latín 1º Bach. Juan José	993
131667	42	3	5	emurielb76	2026-01-26	2º GS Optativa. Rosa	1007
131668	14	3	3	emurielb76	2026-01-26	MAITE	990
131669	8	3	3	emurielb76	2026-01-26	Refuerzo Lengua 1º ESO A/B Maribel	960
131670	22	4	4	emurielb76	2026-01-26	Atendida por Carlos	996
131671	41	5	5	vpalaciosg06	2026-01-26	GRANI	1038
131672	22	5	5	emurielb76	2026-01-26	Atendida por Inma	1000
131673	45	5	5	emurielb76	2026-01-26	Digitalización 4º ESO A/B Miguel	1026
131674	63	5	5	emurielb76	2026-01-26	Biología 2º Bach Celia	1013
131675	63	6	6	emurielb76	2026-01-26	CC Grales 2º Bach Elena G.	1014
131676	30	6	7	susana	2026-01-26	proyecto hombre 2º A Y B.	\N
131677	14	6	6	emurielb76	2026-01-26	MAITE	991
131678	22	6	6	emurielb76	2026-01-26	Atendida por Matilde	1002
131679	55	6	6	emurielb76	2026-01-26	Economía 4º ESO Cristina Blanco	1018
131680	55	7	7	emurielb76	2026-01-26	Matem. A 4º ESO Raquel	969
131681	22	7	7	mji3003	2026-01-26	Inma Molina	\N
131682	45	7	7	emurielb76	2026-01-26	TyD 2º ESO B Miguel	1028
131683	14	7	7	omsanchezg01	2026-01-26	OLGA 4º DIVER	\N
131684	41	7	7	omsanchezg01	2026-01-26	OLGA 4º DIVER	\N
131685	55	1	1	emurielb76	2026-01-27	Latín 4º B Juan José	970
131686	43	2	2	emurielb76	2026-01-27	Economía 1º Bach. Cristina Blanco	1037
131687	43	3	3	celita2	2026-01-27	3º ESO - CELIA	\N
131688	14	3	3	emurielb76	2026-01-27	Itin. Empl. 1º CFGB Luis	985
131689	22	3	3	pagarciam27	2026-01-27	2ºESO Proyecto Mujeres Extraordinarias	\N
131690	45	3	3	emurielb76	2026-01-27	Intel. Artif. 1º Bach. Miguel	1029
131691	67	3	3	ndelorzac02	2026-01-27	nieves	\N
131692	55	3	3	emurielb76	2026-01-27	Matem. A 4º ESO Raquel	971
131693	41	3	3	egonzalezh18	2026-01-27	Elena González 3º ESO	\N
131694	22	4	4	emurielb76	2026-01-27	Atendida por Patricia	998
131695	67	5	5	ndelorzac02	2026-01-27	nieves	\N
131696	43	5	5	emurielb76	2026-01-27	Econ. Empr. 1º Bach. Cristina Blanco	980
131697	41	5	5	vpalaciosg06	2026-01-27	GRANI	1038
131698	45	5	5	emurielb76	2026-01-27	Unión Europea Jorge 4º ESO	1021
131699	14	5	5	omsanchezg01	2026-01-27	OLGA 3º DIVER	\N
131700	22	5	5	emurielb76	2026-01-27	Latín 1º Bach. Juan José	994
131701	45	6	6	ilozano1977	2026-01-27	Isabel Lozano 2 ESO	\N
131702	22	6	6	emurielb76	2026-01-27	Atendida por Inma	1001
131703	63	6	6	emurielb76	2026-01-27	Refuerzo Mates 2º ESO A/B INFORM.	967
131704	14	6	6	emurielb76	2026-01-27	Itin. Empl. 1º CFGB Luis	986
131705	62	6	6	emurielb76	2026-01-27	Refuerzo Lengua 2º ESO A/B Juan José	965
131706	41	6	6	jjmorcillor01	2026-01-27	Juanjo Morcillo	\N
131707	42	6	7	pety78	2026-01-27	Pety	\N
131708	40	6	6	emurielb76	2026-01-27	Biología 2º Bach Celia	1017
131709	43	6	6	lpcamarac01	2026-01-27	2º ESO Luis Pedro Cámara	\N
131710	45	7	7	omsanchezg01	2026-01-27	OLGA 4º DIVER	\N
131711	14	7	7	emurielb76	2026-01-27	Hª Filosofía 2º Bach B Carlos	1020
131712	45	1	1	emurielb76	2026-01-28	TyD  2º ESO A Miguel	1030
131713	41	1	1	mdcpalaciosr01	2026-01-28	AMBITO PRACTICO 4º DIVER	\N
131714	63	2	2	emurielb76	2026-01-28	Biología 2º Bach Celia	1011
131715	43	2	2	ilozano1977	2026-01-28	Isabel Lozano	\N
131716	14	2	2	emurielb76	2026-01-28	MAITE	992
131717	30	2	2	mmhernandezr01	2026-01-28	montaña	\N
131718	8	2	2	emurielb76	2026-01-28	Biología NB 1º ESO A Alba Fajardo	958
131719	62	2	2	emurielb76	2026-01-28	Mates NB 2º ESO A Raquel	962
131720	41	2	2	mdcpalaciosr01	2026-01-28	AMBITO PRACTICO 3º DIVER	\N
131721	45	2	2	emurielb76	2026-01-28	Intel. Artif. 1º Bach. Miguel	1022
131722	14	3	3	mtcerezog01	2026-01-28	Teresa 3º diver	\N
131723	42	3	3	emurielb76	2026-01-28	1º GM Digitalización. Peti	1005
131724	55	3	3	emurielb76	2026-01-28	Matem. A 4º ESO Raquel	971
131725	30	3	3	pagarciam27	2026-01-28	Patricia	\N
131726	22	4	4	emurielb76	2026-01-28	Atendida por Inma	999
131727	41	5	5	vpalaciosg06	2026-01-28	GRANI	1038
131728	63	5	5	emurielb76	2026-01-28	CC Grales 2º Bach Elena G.	1015
131729	45	5	5	emurielb76	2026-01-28	Digit. Básica 1º ESO A/B Miguel	1024
131730	8	5	5	emurielb76	2026-01-28	Refuerzo Lengua 1º ESO A/B Maribel	961
131731	14	5	5	emurielb76	2026-01-28	MAITE	1036
131732	55	5	5	emurielb76	2026-01-28	Economía 4º ESO Cristina Blanco	1019
131733	42	6	6	dnarcisoc01	2026-01-28	Lola. APC	\N
131734	43	6	6	emurielb76	2026-01-28	Economía 1º Bach. Cristina Blanco	982
131735	30	6	7	rmvegac01	2026-01-28	Rosa Vega	\N
131736	41	6	6	vpalaciosg06	2026-01-28	GRANI	1041
131737	45	6	6	emurielb76	2026-01-28	Digitalización 4º ESO A/B Miguel	1031
131738	47	6	6	egonzalezh18	2026-01-28	Elena González 3º eso (A y B)	\N
131739	42	7	7	emurielb76	2026-01-28	1º GS Digitalización. Peti	1040
131740	14	1	1	emurielb76	2026-01-29	Itin. Empl. 1º CFGB Luis	987
131741	45	1	1	emurielb76	2026-01-29	Intel. Artif. 1º Bach. Informática	977
131742	30	2	3	mssalomonp02	2026-01-29	Inés Cancho CONFERENCIA MUJERES EXTRAORDINARIAS	\N
131743	42	2	2	efranciscor01	2026-01-29	2 GRADO MEDIO PROYECTO Estela	\N
131744	14	2	2	emurielb76	2026-01-29	Itin. Empl. 1º CFGB Luis	988
131745	63	2	2	emurielb76	2026-01-29	Raquel apoyo	1039
131746	67	2	2	ilozano1977	2026-01-29	Isabel Lozano	\N
131747	63	3	3	emurielb76	2026-01-29	Refuerzo Mates 2º ESO A/B INFORM.	968
131748	43	3	3	emurielb76	2026-01-29	Economía 1º Bach. Cristina Blanco	981
131749	62	3	3	emurielb76	2026-01-29	Refuerzo Lengua 2º ESO A/B Juan José	966
131750	41	3	4	chisco	2026-01-29	chisco prueba	\N
131751	42	3	3	igomezc12	2026-01-29	1 CFGB	\N
131752	45	3	3	ilozano1977	2026-01-29	Isabel Lozano 2 ESO	\N
131753	14	3	3	lpcamarac01	2026-01-29	2º ESO Luis Pedro Cámara	\N
131754	22	4	4	emurielb76	2026-01-29	Atendida por Patricia	998
131755	41	5	5	vpalaciosg06	2026-01-29	GRANI	1038
131756	43	5	5	emurielb76	2026-01-29	Econ. Empr. 1º Bach. Cristina Blanco	980
131757	67	5	5	mahernandezr06	2026-01-29	Miguel	\N
131758	45	5	5	emurielb76	2026-01-29	Digitalización 4º ESO A/B Miguel	1026
131759	62	5	5	emurielb76	2026-01-29	Mates NB 2º ESO A Raquel	963
131760	22	5	5	emurielb76	2026-01-29	Latín 1º Bach. Juan José	994
131761	55	6	6	emurielb76	2026-01-29	Latín 4º B Juan José	972
131762	45	6	6	mgperezr02	2026-01-29	Grani	\N
131763	42	6	6	dnarcisoc01	2026-01-29	Lola. APC	\N
131764	43	6	6	celita2	2026-01-29	CELIA 1º ESO	\N
131765	63	6	6	emurielb76	2026-01-29	CC Grales 2º Bach Elena G.	1014
131766	45	7	7	emurielb76	2026-01-29	TyD 2º ESO B Miguel	1028
131767	43	7	7	mebravom01	2026-01-29	M. Eugenia Bravo	\N
131768	14	7	7	emurielb76	2026-01-29	Hª Filosofía 2º Bach B Carlos	1020
131769	42	7	7	emurielb76	2026-01-29	2º GS Proyecto. Rosa	1009
131770	30	7	7	mafloresm01	2026-01-29	Mª Ángeles Flores (2º Bachillerato)	\N
131771	42	1	2	isabel22	2026-01-30	isabel panadero	\N
131772	62	1	1	emurielb76	2026-01-30	Mates NB 2º ESO A Raquel	964
131773	14	1	1	mtcerezog01	2026-01-30	Teresa.  3º Atención Educativa	\N
131774	43	2	2	emurielb76	2026-01-30	Econ. Empr. 1º Bach. Cristina Blanco	983
131775	47	2	2	egonzalezh18	2026-01-30	Elena González 3º eso (A y B)	\N
131776	30	2	3	mssalomonp02	2026-01-30	Coros y Danzas Virgen del Rosario CONFERENCIA MUJERES EXTRAORDINARIAS	\N
131777	45	2	2	mafloresm01	2026-01-30	M ÁNGELES FLORES MARÍA (4º ESO-A)	\N
131778	22	2	2	emurielb76	2026-01-30	Latín 1º Bach. Juan José	995
131779	41	2	2	mebravom01	2026-01-30	2º ESO Reli	\N
131780	55	3	3	emurielb76	2026-01-30	Latín 4º B Juan José	973
131781	8	3	3	emurielb76	2026-01-30	Biología NB 1º ESO A Alba Fajardo	959
131782	67	3	3	mtcerezog01	2026-01-30	Teresa 4º Diver	\N
131783	14	3	3	omsanchezg01	2026-01-30	OLGA 3º DIVER	\N
131784	42	3	5	pety78	2026-01-30	Pety	\N
131785	45	3	3	emurielb76	2026-01-30	1º Bach AE. Virginia	1033
131786	22	4	4	emurielb76	2026-01-30	Atendida por Inma	999
131787	45	5	5	emurielb76	2026-01-30	TyD  2º ESO A Miguel	1032
131788	63	5	5	emurielb76	2026-01-30	Biología 2º Bach Celia	1012
131789	41	5	5	vpalaciosg06	2026-01-30	GRANI	1038
131790	55	5	5	emurielb76	2026-01-30	Matem. A 4º ESO Raquel	974
131791	22	5	5	emurielb76	2026-01-30	Atendida por Matilde	1004
131792	30	6	7	emurielb76	2026-01-30	Aleandro 2º GM	\N
131793	63	6	6	emurielb76	2026-01-30	CC Grales 2º Bach Elena G.	1014
131794	55	6	6	emurielb76	2026-01-30	Economía 4º ESO Cristina Blanco	1018
131795	43	6	6	mafloresm01	2026-01-30	Mª Ángeles Flores (4º ESO-Diver)	\N
131796	14	7	7	emurielb76	2026-01-30	Hª Filosofía 2º Bach B Carlos	1020
131797	45	7	7	emparrag02	2026-01-30	Miguel	\N
131798	41	7	7	mahernandezr06	2026-01-30	Elisa	\N
131799	43	7	7	emurielb76	2026-01-30	Economía 1º Bach. Cristina Blanco	984
131800	22	7	7	pagarciam27	2026-01-30	4ºESO Proyecto Mujeres Extraordinarias	\N
131801	41	5	5	vpalaciosg06	2026-01-31	GRANI	1038
131802	41	5	5	vpalaciosg06	2026-02-01	GRANI	1038
131803	14	1	1	emurielb76	2026-02-02	MAITE	989
131804	30	1	1	mmhernandezr01	2026-02-02	examen	\N
131805	14	2	2	omsanchezg01	2026-02-02	OLGA 3º DIVER	\N
131806	42	2	2	pety78	2026-02-02	Pety	\N
131807	45	2	2	emurielb76	2026-02-02	Intel. Artif. 1º Bach. Miguel	1022
131808	8	2	2	emurielb76	2026-02-02	Biología NB 1º ESO A Alba Fajardo	958
131809	67	2	2	isabel22	2026-02-02	isabel panadero	\N
131810	62	2	2	emurielb76	2026-02-02	Mates NB 2º ESO A Raquel	962
131811	22	3	3	emurielb76	2026-02-02	Latín 1º Bach. Juan José	993
131812	42	3	5	emurielb76	2026-02-02	2º GS Optativa. Rosa	1007
131813	14	3	3	emurielb76	2026-02-02	MAITE	990
131814	8	3	3	emurielb76	2026-02-02	Refuerzo Lengua 1º ESO A/B Maribel	960
131815	67	3	3	omsanchezg01	2026-02-02	OLGA APOYO 1º eso	\N
131816	45	3	3	emurielb76	2026-02-02	Digit. Básica 1º ESO A/B Miguel	1023
131817	43	3	3	emurielb76	2026-02-02	Economía 1º Bach. Cristina Blanco	981
131818	22	4	4	emurielb76	2026-02-02	Atendida por Carlos	996
131819	22	5	5	emurielb76	2026-02-02	Atendida por Inma	1000
131820	63	5	5	emurielb76	2026-02-02	Biología 2º Bach Celia	1013
131821	67	5	5	dnarcisoc01	2026-02-02	Lola ADO.	\N
131822	41	5	5	vpalaciosg06	2026-02-02	GRANI	1038
131823	45	5	5	emurielb76	2026-02-02	Digitalización 4º ESO A/B Miguel	1026
131824	63	6	6	emurielb76	2026-02-02	CC Grales 2º Bach Elena G.	1014
131825	14	6	6	emurielb76	2026-02-02	MAITE	991
131826	55	6	6	emurielb76	2026-02-02	Economía 4º ESO Cristina Blanco	1018
131827	22	6	6	emurielb76	2026-02-02	Atendida por Matilde	1002
131828	14	7	7	omsanchezg01	2026-02-02	OLGA 4º DIVER	\N
131829	55	7	7	emurielb76	2026-02-02	Matem. A 4º ESO Raquel	969
131830	45	7	7	emurielb76	2026-02-02	TyD 2º ESO B Miguel	1028
131831	42	7	7	dnarcisoc01	2026-02-02	Lola. APC	\N
131832	45	1	1	igomezc12	2026-02-03	1º CFGB	\N
131833	55	1	1	emurielb76	2026-02-03	Latín 4º B Juan José	970
131834	14	1	7	emurielb76	2026-02-03	EQUIPO DIRECTIVO-INSPECCIÓN	\N
131835	43	2	2	emurielb76	2026-02-03	Economía 1º Bach. Cristina Blanco	1037
131836	45	2	2	cjlozanop01	2026-02-03	Carlos J. -Filosofía	\N
131837	41	2	2	ilozano1977	2026-02-03	Isabel Lozano 3º ESO	\N
131838	55	3	3	emurielb76	2026-02-03	Matem. A 4º ESO Raquel	971
131839	22	3	3	pagarciam27	2026-02-03	Encuentro Literario Bruno Puelles 1ºBachillerato	\N
131840	45	3	3	emurielb76	2026-02-03	Intel. Artif. 1º Bach. Miguel	1029
131841	30	3	3	emurielb76	2026-02-03	Itin. Empl. 1º CFGB Luis	985
131842	22	4	4	emurielb76	2026-02-03	Atendida por Patricia	998
131843	67	5	5	omsanchezg01	2026-02-03	OLGA 3º DIVER	\N
131844	41	5	5	vpalaciosg06	2026-02-03	GRANI	1038
131845	22	5	5	emurielb76	2026-02-03	Latín 1º Bach. Juan José	994
131846	45	5	5	emurielb76	2026-02-03	Unión Europea Jorge 4º ESO	1021
131847	43	5	5	emurielb76	2026-02-03	Econ. Empr. 1º Bach. Cristina Blanco	980
131848	63	6	6	emurielb76	2026-02-03	Refuerzo Mates 2º ESO A/B INFORM.	967
131849	62	6	6	emurielb76	2026-02-03	Refuerzo Lengua 2º ESO A/B Juan José	965
131850	40	6	6	emurielb76	2026-02-03	Biología 2º Bach Celia	1017
131851	30	6	6	emurielb76	2026-02-03	Itin. Empl. 1º CFGB Luis	986
131852	43	6	6	lpcamarac01	2026-02-03	2º ESO Luis Pedro Cámara	\N
131853	45	6	6	jjmorcillor01	2026-02-03	Juanjo Morcillo	\N
131854	22	6	6	emurielb76	2026-02-03	Atendida por Inma	1001
131855	30	7	7	emurielb76	2026-02-03	Hª Filosofía 2º Bach B Carlos	1020
131856	45	7	7	jjmorcillor01	2026-02-03	Juanjo Morcillo	\N
131857	41	1	1	mdcpalaciosr01	2026-02-04	AMBITO PRACTICO 4º DIVER	\N
131858	42	1	2	pety78	2026-02-04	Pety	\N
131859	47	1	1	mssalomonp02	2026-02-04	Marisol Matemáticas 3º ESO	\N
131860	45	1	1	emurielb76	2026-02-04	TyD  2º ESO A Miguel	1030
131861	45	2	2	emurielb76	2026-02-04	Intel. Artif. 1º Bach. Miguel	1022
131862	8	2	2	emurielb76	2026-02-04	Biología NB 1º ESO A Alba Fajardo	958
131863	62	2	2	emurielb76	2026-02-04	Mates NB 2º ESO A Raquel	962
131864	63	2	2	emurielb76	2026-02-04	Biología 2º Bach Celia	1011
131865	41	2	2	mdcpalaciosr01	2026-02-04	AMBITO PRACTICO 3º DIVER	\N
131866	14	2	2	emurielb76	2026-02-04	MAITE	992
131867	47	2	2	jrodriguezt18	2026-02-04	Jorge Geografía 3º ESO A	\N
131868	55	3	3	emurielb76	2026-02-04	Matem. A 4º ESO Raquel	971
131869	42	3	3	emurielb76	2026-02-04	1º GM Digitalización. Peti	1005
131870	22	4	4	emurielb76	2026-02-04	Atendida por Inma	999
131871	63	5	5	emurielb76	2026-02-04	CC Grales 2º Bach Elena G.	1015
131872	47	5	5	jrodriguezt18	2026-02-04	Jorge Geografía 3º ESO	\N
131873	45	5	5	emurielb76	2026-02-04	Digit. Básica 1º ESO A/B Miguel	1024
131874	8	5	5	emurielb76	2026-02-04	Refuerzo Lengua 1º ESO A/B Maribel	961
131875	14	5	5	emurielb76	2026-02-04	MAITE	1036
131876	55	5	5	emurielb76	2026-02-04	Economía 4º ESO Cristina Blanco	1019
131877	41	5	5	vpalaciosg06	2026-02-04	GRANI	1038
131878	41	6	6	vpalaciosg06	2026-02-04	GRANI	1041
131879	45	6	6	emurielb76	2026-02-04	Digitalización 4º ESO A/B Miguel	1031
131880	14	6	6	celita2	2026-02-04	3º ESO - CELIA	\N
131881	43	6	6	emurielb76	2026-02-04	Economía 1º Bach. Cristina Blanco	982
131882	42	6	6	rmvegac01	2026-02-04	Rosa Vega	\N
131883	67	6	6	dnarcisoc01	2026-02-04	Lola. APC	\N
131884	14	7	7	omsanchezg01	2026-02-04	OLGA 3º DIVER	\N
131885	42	7	7	emurielb76	2026-02-04	1º GS Digitalización. Peti	1040
131886	14	1	1	emurielb76	2026-02-05	Itin. Empl. 1º CFGB Luis	987
131887	45	1	1	emurielb76	2026-02-05	Intel. Artif. 1º Bach. Informática	977
131888	47	1	1	mssalomonp02	2026-02-05	Marisol Matemáticas 3º ESO	\N
131889	63	2	2	emurielb76	2026-02-05	Raquel apoyo	1039
131890	43	2	2	ilozano1977	2026-02-05	Isabel Lozano 2 ESO	\N
131891	42	2	2	efranciscor01	2026-02-05	2 GRADO MEDIO PROYECTO Estela	\N
131892	22	2	2	cjlozanop01	2026-02-05	Carlos J. -Filosofía	\N
131893	45	2	2	pagarciam27	2026-02-05	Patricia TAE	\N
131894	14	2	2	emurielb76	2026-02-05	Itin. Empl. 1º CFGB Luis	988
131895	30	3	3	bcrespoc01	2026-02-05	Bea 1GM	\N
131896	41	3	3	lpcamarac01	2026-02-05	2º ESO Luis Pedro Cámara	\N
131897	45	3	3	mafloresm01	2026-02-05	Mª Ángeles Flores (4º ESO-Diver)	\N
131898	43	3	3	emurielb76	2026-02-05	Economía 1º Bach. Cristina Blanco	981
131899	63	3	3	emurielb76	2026-02-05	Refuerzo Mates 2º ESO A/B INFORM.	968
131900	8	3	3	amfajardol01	2026-02-05	alba AH examen	\N
131901	62	3	3	emurielb76	2026-02-05	Refuerzo Lengua 2º ESO A/B Juan José	966
131902	8	4	4	amfajardol01	2026-02-05	alba AH examen	\N
131903	22	4	4	emurielb76	2026-02-05	Atendida por Patricia	998
131904	30	4	4	mgperezr02	2026-02-05	VIRGINIA	\N
131905	62	5	5	emurielb76	2026-02-05	Mates NB 2º ESO A Raquel	963
131906	47	5	5	jrodriguezt18	2026-02-05	Jorge Geografía 3º ESO A	\N
131907	43	5	5	emurielb76	2026-02-05	Econ. Empr. 1º Bach. Cristina Blanco	980
131908	41	5	5	vpalaciosg06	2026-02-05	GRANI	1038
131909	45	5	5	emurielb76	2026-02-05	Digitalización 4º ESO A/B Miguel	1026
131910	30	5	5	bcrespoc01	2026-02-05	BEATRIZ CRESPO	\N
131911	14	5	5	lpcamarac01	2026-02-05	Luis Pedro Cámara Casares	\N
131912	22	5	5	emurielb76	2026-02-05	Latín 1º Bach. Juan José	994
131913	55	6	6	emurielb76	2026-02-05	Latín 4º B Juan José	972
131914	45	6	6	mgperezr02	2026-02-05	Grani	\N
131915	42	6	6	dnarcisoc01	2026-02-05	Lola. APC	\N
131916	47	6	6	jrodriguezt18	2026-02-05	Jorge Geografía 3º ESO B	\N
131917	63	6	6	emurielb76	2026-02-05	CC Grales 2º Bach Elena G.	1014
131918	42	7	7	emurielb76	2026-02-05	2º GS Proyecto. Rosa	1009
131919	47	7	7	celita2	2026-02-05	CELIA 4ºESO	\N
131920	45	7	7	emurielb76	2026-02-05	TyD 2º ESO B Miguel	1028
131921	22	7	7	mji3003	2026-02-05	Inma	\N
131922	14	7	7	emurielb76	2026-02-05	Hª Filosofía 2º Bach B Carlos	1020
131923	42	1	2	isabel22	2026-02-06	isabel panadero	\N
131924	30	1	1	emurielb76	2026-02-06	Elena 1º GM	\N
131925	45	1	1	mebravom01	2026-02-06	3º eso	\N
131926	62	1	1	emurielb76	2026-02-06	Mates NB 2º ESO A Raquel	964
131927	14	1	1	mtcerezog01	2026-02-06	Teresa.  3º Atención Educativa	\N
131928	45	2	2	mebravom01	2026-02-06	2º de ESO	\N
131929	22	2	2	emurielb76	2026-02-06	Latín 1º Bach. Juan José	995
131930	43	2	2	emurielb76	2026-02-06	Econ. Empr. 1º Bach. Cristina Blanco	983
131931	47	3	3	mssalomonp02	2026-02-06	Marisol Matemáticas 3º ESO	\N
131932	45	3	3	emurielb76	2026-02-06	1º Bach AE. Virginia	1033
131933	30	3	3	vpalaciosg06	2026-02-06	VIRGINIA	\N
131934	14	3	3	omsanchezg01	2026-02-06	OLGA 3º DIVER	\N
131935	67	3	5	isabel22	2026-02-06	isabel panadero	\N
131936	43	3	3	mebravom01	2026-02-06	1º Bachillerato de Religión	\N
131937	55	3	3	emurielb76	2026-02-06	Latín 4º B Juan José	973
131938	8	3	3	emurielb76	2026-02-06	Biología NB 1º ESO A Alba Fajardo	959
131939	22	3	3	mji3003	2026-02-06	Inma	\N
131940	22	4	4	emurielb76	2026-02-06	Atendida por Inma	999
131941	41	5	5	vpalaciosg06	2026-02-06	GRANI	1038
131942	43	5	5	mafloresm01	2026-02-06	Mª Ángeles Flores (4º ESO-Diver)	\N
131943	30	5	5	vpalaciosg06	2026-02-06	VIRGINIA	\N
131944	14	5	5	nmaciasp02	2026-02-06	Noelia 4º ESO	\N
131945	55	5	5	emurielb76	2026-02-06	Matem. A 4º ESO Raquel	974
131946	22	5	5	emurielb76	2026-02-06	Atendida por Matilde	1004
131947	45	5	5	emurielb76	2026-02-06	TyD  2º ESO A Miguel	1032
131948	63	5	5	emurielb76	2026-02-06	Biología 2º Bach Celia	1012
131949	63	6	6	emurielb76	2026-02-06	CC Grales 2º Bach Elena G.	1014
131950	55	6	6	emurielb76	2026-02-06	Economía 4º ESO Cristina Blanco	1018
131951	43	6	6	ilozano1977	2026-02-06	Isabel Lozano 3º ESO	\N
131952	45	6	6	celita2	2026-02-06	CELIA 4ºESOB	\N
131953	43	7	7	emurielb76	2026-02-06	Economía 1º Bach. Cristina Blanco	984
131954	14	7	7	emurielb76	2026-02-06	Hª Filosofía 2º Bach B Carlos	\N
131955	41	7	7	mebravom01	2026-02-06	4º ESO Reli	\N
131956	41	5	5	vpalaciosg06	2026-02-07	GRANI	1038
131957	41	5	5	vpalaciosg06	2026-02-08	GRANI	1038
131958	14	1	1	emurielb76	2026-02-09	MAITE	989
131959	8	2	2	emurielb76	2026-02-09	Biología NB 1º ESO A Alba Fajardo	958
131960	62	2	2	emurielb76	2026-02-09	Mates NB 2º ESO A Raquel	962
131961	67	2	2	isabel22	2026-02-09	isabel panadero	\N
131962	42	2	2	efranciscor01	2026-02-09	2º GM PROYECTO ESTELA	\N
131963	45	2	2	emurielb76	2026-02-09	Intel. Artif. 1º Bach. Miguel	1022
131964	43	3	3	emurielb76	2026-02-09	Economía 1º Bach. Cristina Blanco	981
131965	22	3	3	emurielb76	2026-02-09	Latín 1º Bach. Juan José	993
131966	42	3	5	emurielb76	2026-02-09	2º GS Optativa. Rosa	1007
131967	14	3	3	emurielb76	2026-02-09	MAITE	990
131968	30	3	3	cjlozanop01	2026-02-09	Carlos J. -Filosofía	\N
131969	8	3	3	emurielb76	2026-02-09	Refuerzo Lengua 1º ESO A/B Maribel	960
131970	41	3	3	mssalomonp02	2026-02-09	Marisol Matemáticas	\N
131971	45	3	3	emurielb76	2026-02-09	Digit. Básica 1º ESO A/B Miguel	1023
131972	30	4	4	emurielb76	2026-02-09	Reunión GRADUACIÓN	\N
131973	22	4	4	emurielb76	2026-02-09	Atendida por Carlos	996
131974	45	5	5	emurielb76	2026-02-09	Digitalización 4º ESO A/B Miguel	1026
131975	22	5	5	emurielb76	2026-02-09	Atendida por Inma	1000
131976	41	5	5	vpalaciosg06	2026-02-09	GRANI	1038
131977	63	5	5	emurielb76	2026-02-09	Biología 2º Bach Celia	1013
131978	22	6	6	emurielb76	2026-02-09	Atendida por Matilde	1002
131979	55	6	6	emurielb76	2026-02-09	Economía 4º ESO Cristina Blanco	1018
131980	14	6	6	emurielb76	2026-02-09	MAITE	991
131981	30	6	7	susana	2026-02-09	proyecto hombre 2º A Y B.	\N
131982	63	6	6	emurielb76	2026-02-09	CC Grales 2º Bach Elena G.	1014
131983	43	6	6	dmatasr01	2026-02-09	David Matas	\N
131984	45	6	6	pagarciam27	2026-02-09	Patricia 4ºESO	\N
131985	55	7	7	emurielb76	2026-02-09	Matem. A 4º ESO Raquel	969
131986	41	7	7	omsanchezg01	2026-02-09	OLGA 4º DIVER	\N
131987	45	7	7	emurielb76	2026-02-09	TyD 2º ESO B Miguel	1028
131988	8	7	7	dnarcisoc01	2026-02-09	Dolores Narciso.	\N
131989	55	1	1	emurielb76	2026-02-10	Latín 4º B Juan José	970
131990	45	1	1	rencinasr02	2026-02-10	Raquel Encinas 1º ESO "B"	\N
131991	41	2	2	djuliog01	2026-02-10	Diana Julio (2ºA)	\N
131992	43	2	2	emurielb76	2026-02-10	Economía 1º Bach. Cristina Blanco	1037
131993	42	2	2	amfajardol01	2026-02-10	Alba PAUX	\N
131994	45	2	2	cjlozanop01	2026-02-10	Carlos J. -Filosofía	\N
131995	14	3	3	emurielb76	2026-02-10	Itin. Empl. 1º CFGB Luis	985
131996	55	3	3	emurielb76	2026-02-10	Matem. A 4º ESO Raquel	971
131997	45	3	3	emurielb76	2026-02-10	Intel. Artif. 1º Bach. Miguel	1029
131998	22	4	4	emurielb76	2026-02-10	Atendida por Patricia	998
131999	43	5	5	emurielb76	2026-02-10	Econ. Empr. 1º Bach. Cristina Blanco	980
132000	45	5	5	emurielb76	2026-02-10	Unión Europea Jorge 4º ESO	1021
132001	14	5	5	pagarciam27	2026-02-10	Patricia TAE	\N
132002	22	5	5	emurielb76	2026-02-10	Latín 1º Bach. Juan José	994
132003	41	5	5	vpalaciosg06	2026-02-10	GRANI	1038
132004	67	5	5	omsanchezg01	2026-02-10	OLGA 3º DIVER	\N
132005	40	6	6	emurielb76	2026-02-10	Biología 2º Bach Celia	1017
132006	14	6	6	emurielb76	2026-02-10	Itin. Empl. 1º CFGB Luis	986
132007	43	6	6	lpcamarac01	2026-02-10	2º ESO Luis Pedro Cámara	\N
132008	22	6	6	emurielb76	2026-02-10	Atendida por Inma	1001
132009	63	6	6	emurielb76	2026-02-10	Refuerzo Mates 2º ESO A/B INFORM.	967
132010	62	6	6	emurielb76	2026-02-10	Refuerzo Lengua 2º ESO A/B Juan José	965
132011	14	7	7	emurielb76	2026-02-10	Hª Filosofía 2º Bach B Carlos	1020
132012	45	1	1	emurielb76	2026-02-11	TyD  2º ESO A Miguel	1030
132013	41	1	1	mdcpalaciosr01	2026-02-11	AMBITO PRACTICO 3º DIVER	\N
132014	30	1	1	emurielb76	2026-02-11	Examen Montaña	\N
132015	41	2	2	mdcpalaciosr01	2026-02-11	AMBITO PRACTICO 4º DIVER	\N
132016	63	2	2	emurielb76	2026-02-11	Biología 2º Bach Celia	1011
132017	45	2	2	emurielb76	2026-02-11	Intel. Artif. 1º Bach. Miguel	1022
132018	14	2	2	emurielb76	2026-02-11	MAITE	992
132019	42	2	2	rmvegac01	2026-02-11	Rosa Vega	\N
132020	43	2	5	pagarciam27	2026-02-11	V Yincana STEAM LIBRARIUM	\N
132021	8	2	2	emurielb76	2026-02-11	Biología NB 1º ESO A Alba Fajardo	958
132022	62	2	2	emurielb76	2026-02-11	Mates NB 2º ESO A Raquel	962
132023	45	3	3	nmaciasp02	2026-02-11	Noelia 4º ESO	\N
132024	42	3	3	emurielb76	2026-02-11	1º GM Digitalización. Peti	1005
132025	55	3	3	emurielb76	2026-02-11	Matem. A 4º ESO Raquel	971
132026	22	4	4	emurielb76	2026-02-11	Atendida por Inma	999
132027	42	5	5	bcrespoc01	2026-02-11	Bea 2º GM	\N
132028	41	5	5	vpalaciosg06	2026-02-11	GRANI	1038
132029	67	5	5	omsanchezg01	2026-02-11	OLGA APOYO 1º eso	\N
132030	63	5	5	emurielb76	2026-02-11	CC Grales 2º Bach Elena G.	1015
132031	45	5	5	emurielb76	2026-02-11	Digit. Básica 1º ESO A/B Miguel	1024
132032	8	5	5	emurielb76	2026-02-11	Refuerzo Lengua 1º ESO A/B Maribel	961
132033	14	5	5	emurielb76	2026-02-11	MAITE	1036
132034	55	5	5	emurielb76	2026-02-11	Economía 4º ESO Cristina Blanco	1019
132035	43	6	6	emurielb76	2026-02-11	Economía 1º Bach. Cristina Blanco	982
132036	41	6	6	vpalaciosg06	2026-02-11	GRANI	1041
132037	45	6	6	emurielb76	2026-02-11	Digitalización 4º ESO A/B Miguel	1031
132038	55	6	6	vpalaciosg06	2026-02-11	JUAN MARÍA	\N
132039	47	6	6	djuliog01	2026-02-11	Diana Julio (2ºB)	\N
132040	14	7	7	omsanchezg01	2026-02-11	OLGA 3º DIVER	\N
132041	42	7	7	emurielb76	2026-02-11	1º GS Digitalización. Peti	1040
132042	45	1	1	emurielb76	2026-02-12	Intel. Artif. 1º Bach. Informática	977
132043	14	1	1	emurielb76	2026-02-12	Itin. Empl. 1º CFGB Luis	987
132044	14	2	2	emurielb76	2026-02-12	Itin. Empl. 1º CFGB Luis	988
132045	22	2	2	cjlozanop01	2026-02-12	Carlos J. -Filosofía	\N
132046	45	2	2	ilozano1977	2026-02-12	Isabel Lozano 2 ESO	\N
132047	63	2	2	emurielb76	2026-02-12	Raquel apoyo	1039
132048	42	2	2	efranciscor01	2026-02-12	2º GM PROYECTO ESTELA	\N
132049	63	3	3	emurielb76	2026-02-12	Refuerzo Mates 2º ESO A/B INFORM.	968
132050	14	3	3	ilozano1977	2026-02-12	Isabel Lozano 2 ESO	\N
132051	62	3	3	emurielb76	2026-02-12	Refuerzo Lengua 2º ESO A/B Juan José	966
132052	43	3	3	emurielb76	2026-02-12	Economía 1º Bach. Cristina Blanco	981
132053	45	3	3	jjmorcillor01	2026-02-12	Juanjo Morcillo	\N
132054	41	3	3	lpcamarac01	2026-02-12	2º ESO Luis Pedro Cámara	\N
132055	45	4	4	cjlozanop01	2026-02-12	Carlos J. -Filosofía	\N
132056	30	4	4	emurielb76	2026-02-12	Reunión Orientación Virginia	\N
132057	22	4	4	emurielb76	2026-02-12	Atendida por Patricia	998
132058	22	5	5	emurielb76	2026-02-12	Latín 1º Bach. Juan José	994
132059	62	5	5	emurielb76	2026-02-12	Mates NB 2º ESO A Raquel	963
132060	43	5	5	emurielb76	2026-02-12	Econ. Empr. 1º Bach. Cristina Blanco	980
132061	45	5	5	emurielb76	2026-02-12	Digitalización 4º ESO A/B Miguel	1026
132062	41	5	5	vpalaciosg06	2026-02-12	GRANI	1038
132063	63	6	6	emurielb76	2026-02-12	CC Grales 2º Bach Elena G.	1014
132064	67	6	6	ndelorzac02	2026-02-12	Nieves	\N
132065	45	6	6	vpalaciosg06	2026-02-12	VIRGINIA	\N
132066	55	6	6	emurielb76	2026-02-12	Latín 4º B Juan José	972
132067	43	6	6	mebravom01	2026-02-12	1º Bachillerato de Religión	\N
132068	67	7	7	ndelorzac02	2026-02-12	Nieves	\N
132069	43	7	7	mebravom01	2026-02-12	1º eso	\N
132070	45	7	7	emurielb76	2026-02-12	TyD 2º ESO B Miguel	1028
132071	42	7	7	emurielb76	2026-02-12	2º GS Proyecto. Rosa	1009
132072	14	7	7	emurielb76	2026-02-12	Hª Filosofía 2º Bach B Carlos	1020
1137	55	5	5	rencinasr02	2026-02-13	Matem. A 4º ESO Raquel	974
132074	43	1	1	mebravom01	2026-02-13	3º de la ESO DE RELIGIÓN	\N
132076	45	1	1	mji3003	2026-02-13	Inma	\N
132078	41	2	2	mebravom01	2026-02-13	2º ESO Reli	\N
1138	55	5	5	rencinasr02	2026-02-20	Matem. A 4º ESO Raquel	974
132080	45	3	3	emurielb76	2026-02-13	1º Bach AE. Virginia	1033
132083	43	3	3	mebravom01	2026-02-13	1º Bachillerato de Religión	\N
1139	55	5	5	rencinasr02	2026-02-27	Matem. A 4º ESO Raquel	974
132090	14	5	5	mrcarmonav01	2026-02-13	Remedios Carmona Vinagre 3ºDIVER	\N
1140	55	5	5	rencinasr02	2026-03-06	Matem. A 4º ESO Raquel	974
1141	55	5	5	rencinasr02	2026-03-13	Matem. A 4º ESO Raquel	974
132093	45	6	6	pagarciam27	2026-02-13	Patricia 4ºESO	\N
132094	41	7	7	mebravom01	2026-02-13	4º ESO Reli	\N
1142	55	5	5	rencinasr02	2026-03-20	Matem. A 4º ESO Raquel	974
132099	14	1	1	emurielb76	2026-02-16	MAITE	989
1143	55	5	5	rencinasr02	2026-03-27	Matem. A 4º ESO Raquel	974
1144	55	5	5	rencinasr02	2026-04-03	Matem. A 4º ESO Raquel	974
132102	45	2	2	emurielb76	2026-02-16	Intel. Artif. 1º Bach. Miguel	1022
1145	55	5	5	rencinasr02	2026-04-10	Matem. A 4º ESO Raquel	974
1146	55	5	5	rencinasr02	2026-04-17	Matem. A 4º ESO Raquel	974
1147	55	5	5	rencinasr02	2026-04-24	Matem. A 4º ESO Raquel	974
1148	55	5	5	rencinasr02	2026-05-01	Matem. A 4º ESO Raquel	974
132107	14	3	3	emurielb76	2026-02-16	MAITE	990
132108	8	3	3	emurielb76	2026-02-16	Refuerzo Lengua 1º ESO A/B Maribel	960
1149	55	5	5	rencinasr02	2026-05-08	Matem. A 4º ESO Raquel	974
1150	55	5	5	rencinasr02	2026-05-15	Matem. A 4º ESO Raquel	974
1151	55	5	5	rencinasr02	2026-05-22	Matem. A 4º ESO Raquel	974
132114	14	6	6	emurielb76	2026-02-16	MAITE	991
1152	55	5	5	rencinasr02	2026-05-29	Matem. A 4º ESO Raquel	974
1153	55	5	5	rencinasr02	2026-06-05	Matem. A 4º ESO Raquel	974
1154	55	5	5	rencinasr02	2026-06-12	Matem. A 4º ESO Raquel	974
1155	55	5	5	rencinasr02	2026-06-19	Matem. A 4º ESO Raquel	974
1156	63	5	5	celita2	2026-02-13	Biología 2º Bach Celia	1012
1157	63	5	5	celita2	2026-02-20	Biología 2º Bach Celia	1012
1158	63	5	5	celita2	2026-02-27	Biología 2º Bach Celia	1012
1159	63	5	5	celita2	2026-03-06	Biología 2º Bach Celia	1012
1160	63	5	5	celita2	2026-03-13	Biología 2º Bach Celia	1012
1161	63	5	5	celita2	2026-03-20	Biología 2º Bach Celia	1012
1162	63	5	5	celita2	2026-03-27	Biología 2º Bach Celia	1012
1163	63	5	5	celita2	2026-04-03	Biología 2º Bach Celia	1012
1164	63	5	5	celita2	2026-04-10	Biología 2º Bach Celia	1012
132132	63	6	6	emurielb76	2026-02-17	Refuerzo Mates 2º ESO A/B INFORM.	967
1165	63	5	5	celita2	2026-04-17	Biología 2º Bach Celia	1012
1166	63	5	5	celita2	2026-04-24	Biología 2º Bach Celia	1012
1167	63	5	5	celita2	2026-05-01	Biología 2º Bach Celia	1012
1168	63	5	5	celita2	2026-05-08	Biología 2º Bach Celia	1012
132138	14	2	2	emurielb76	2026-02-18	MAITE	992
132139	45	2	2	emurielb76	2026-02-18	Intel. Artif. 1º Bach. Miguel	1022
1169	63	5	5	celita2	2026-05-15	Biología 2º Bach Celia	1012
1170	63	5	5	celita2	2026-05-22	Biología 2º Bach Celia	1012
1171	63	5	5	celita2	2026-05-29	Biología 2º Bach Celia	1012
1172	63	5	5	celita2	2026-06-05	Biología 2º Bach Celia	1012
1173	63	5	5	celita2	2026-06-12	Biología 2º Bach Celia	1012
1174	63	5	5	celita2	2026-06-19	Biología 2º Bach Celia	1012
1616	41	2	2	mdcpalaciosr01	2026-02-25	ambito práctico	\N
1637	30	1	7	emurielb76	2026-03-05	Reserva provisional	\N
1658	43	1	7	emurielb76	2026-05-18	Preparación Evaluación de Diagnóstico 2º ESO	\N
132150	14	5	5	emurielb76	2026-02-18	MAITE	1036
1734	14	7	7	mtmarting03	2026-02-23	maite	\N
1768	14	3	3	mafloresm01	2026-02-25	1º FPB / INGLÉS	\N
1791	14	1	1	mtmarting03	2026-04-08	MAITE	\N
1964	45	1	1	omsanchezg01	2026-03-13	AE 3º ESO Olga	\N
1973	43	2	5	sromang06	2026-03-18	2ºA Física y Química	\N
132159	22	2	2	cjlozanop01	2026-02-19	Carlos J. -Filosofía	\N
132160	63	2	2	emurielb76	2026-02-19	Raquel apoyo	1039
132161	42	2	2	efranciscor01	2026-02-19	2º GM PROYECTO ESTELA	\N
2050	45	2	2	bpconejero78	2026-06-17	Intel. Artif. 1º Bach. Miguel	1022
132164	63	3	3	emurielb76	2026-02-19	Refuerzo Mates 2º ESO A/B INFORM.	968
2211	41	6	6	lpcamarac01	2026-03-17	2º ESO Emprendimiento Luis Pedro Cámara	\N
2288	14	3	3	mtcerezog01	2026-03-19	3º Diver. Teresa	\N
2299	41	3	3	egonzalezh18	2026-03-24	3º ESO Bilingüe 	\N
2310	42	1	2	pety78	2026-03-19	1º TEI	\N
2322	47	1	7	emurielb76	2026-04-14	Escuela 4.0	\N
2330	45	1	1	omsanchezg01	2026-03-20	3º eso Olga	\N
2340	14	2	2	omsanchezg01	2026-03-23	3º diver Olga	\N
2351	41	6	6	omsanchezg01	2026-03-23	Olga 4º diver	\N
2354	43	7	7	celita2	2026-03-24	4º ESO - CELIA	\N
1175	22	5	5	mgranadob01	2026-02-13	Atendida por Matilde	1004
1176	22	5	5	mgranadob01	2026-02-20	Atendida por Matilde	1004
1177	22	5	5	mgranadob01	2026-02-27	Atendida por Matilde	1004
132178	30	2	4	pagarciam27	2026-02-20	Taller de Ciencia Circular, 4ºESO	\N
132182	45	3	3	emurielb76	2026-02-20	1º Bach AE. Virginia	1033
1178	22	5	5	mgranadob01	2026-03-06	Atendida por Matilde	1004
1179	22	5	5	mgranadob01	2026-03-13	Atendida por Matilde	1004
1180	22	5	5	mgranadob01	2026-03-20	Atendida por Matilde	1004
1181	22	5	5	mgranadob01	2026-03-27	Atendida por Matilde	1004
132195	14	1	1	emurielb76	2026-02-23	MAITE	989
132196	45	2	2	emurielb76	2026-02-23	Intel. Artif. 1º Bach. Miguel	1022
1182	22	5	5	mgranadob01	2026-04-03	Atendida por Matilde	1004
1183	22	5	5	mgranadob01	2026-04-10	Atendida por Matilde	1004
1184	22	5	5	mgranadob01	2026-04-17	Atendida por Matilde	1004
1185	22	5	5	mgranadob01	2026-04-24	Atendida por Matilde	1004
132201	14	3	3	emurielb76	2026-02-23	MAITE	990
132202	8	3	3	emurielb76	2026-02-23	Refuerzo Lengua 1º ESO A/B Maribel	960
1186	22	5	5	mgranadob01	2026-05-01	Atendida por Matilde	1004
1187	22	5	5	mgranadob01	2026-05-08	Atendida por Matilde	1004
1188	22	5	5	mgranadob01	2026-05-15	Atendida por Matilde	1004
1189	22	5	5	mgranadob01	2026-05-22	Atendida por Matilde	1004
1190	22	5	5	mgranadob01	2026-05-29	Atendida por Matilde	1004
132210	14	6	6	emurielb76	2026-02-23	MAITE	991
1191	22	5	5	mgranadob01	2026-06-05	Atendida por Matilde	1004
1192	22	5	5	mgranadob01	2026-06-12	Atendida por Matilde	1004
1193	22	5	5	mgranadob01	2026-06-19	Atendida por Matilde	1004
1617	41	1	2	mdcpalaciosr01	2026-03-04	AMBITO PRÁCTICO	\N
1638	30	1	7	emurielb76	2026-03-06	Reserva provisional	\N
132217	45	2	2	cjlozanop01	2026-02-24	Carlos J. -Filosofía	\N
1659	41	1	7	emurielb76	2026-05-18	Preparación Evaluación de Diagnóstico 2º ESO	\N
1735	14	1	1	bfernandezt07	2026-02-24	FP básica 2º	\N
1769	45	7	7	djuliog01	2026-02-24	Diana (1º B)	\N
1792	14	1	1	mtmarting03	2026-04-15	MAITE	\N
1794	14	1	1	mtmarting03	2026-04-29	MAITE	\N
1965	22	2	2	cjlozanop01	2026-03-12	Introd. Filosofía	\N
2051	14	6	6	mtmarting03	2026-03-16	MAITE	991
2052	14	6	6	mtmarting03	2026-03-23	MAITE	991
2053	14	6	6	mtmarting03	2026-03-30	MAITE	991
132231	63	6	6	emurielb76	2026-02-24	Refuerzo Mates 2º ESO A/B INFORM.	967
2054	14	6	6	mtmarting03	2026-04-06	MAITE	991
2055	14	6	6	mtmarting03	2026-04-13	MAITE	991
2056	14	6	6	mtmarting03	2026-04-20	MAITE	991
2057	14	6	6	mtmarting03	2026-04-27	MAITE	991
132237	14	2	2	emurielb76	2026-02-25	MAITE	992
132238	45	2	2	emurielb76	2026-02-25	Intel. Artif. 1º Bach. Miguel	1022
2058	14	6	6	mtmarting03	2026-05-04	MAITE	991
2059	14	6	6	mtmarting03	2026-05-11	MAITE	991
2060	14	6	6	mtmarting03	2026-05-18	MAITE	991
2061	14	6	6	mtmarting03	2026-05-25	MAITE	991
2062	14	6	6	mtmarting03	2026-06-01	MAITE	991
132244	14	5	5	emurielb76	2026-02-25	MAITE	1036
2063	14	6	6	mtmarting03	2026-06-08	MAITE	991
2064	14	6	6	mtmarting03	2026-06-15	MAITE	991
2208	30	1	1	mrcarmonav01	2026-03-20	1ºBAch B	\N
2212	41	3	3	egonzalezh18	2026-03-17	3ºeso Bilingüe	\N
2289	14	1	1	mtcerezog01	2026-03-20	3º Atencion Educativa . Teresa	\N
2300	47	6	6	egonzalezh18	2026-03-25	3º ESO A-B Bilingüe 	\N
2311	43	1	1	ilozano1977	2026-03-19	Isabel 1Bach	\N
2323	47	1	7	emurielb76	2026-04-30	Escuela 4.0	\N
2331	67	4	4	omsanchezg01	2026-03-20	3º diver Olga	\N
2352	67	3	3	omsanchezg01	2026-03-24	3º diver Olga	\N
2355	42	6	6	celita2	2026-03-25	CELIA - 3º ESO	\N
1194	43	7	7	cblancoa02	2026-02-13	Economía 1º Bach. Cristina Blanco	984
1195	43	7	7	cblancoa02	2026-02-20	Economía 1º Bach. Cristina Blanco	984
1196	43	7	7	cblancoa02	2026-02-27	Economía 1º Bach. Cristina Blanco	984
1197	43	7	7	cblancoa02	2026-03-06	Economía 1º Bach. Cristina Blanco	984
132254	42	2	2	efranciscor01	2026-02-26	2º GM PROYECTO ESTELA	\N
1198	43	7	7	cblancoa02	2026-03-13	Economía 1º Bach. Cristina Blanco	984
132256	63	2	2	emurielb76	2026-02-26	Raquel apoyo	1039
1199	43	7	7	cblancoa02	2026-03-20	Economía 1º Bach. Cristina Blanco	984
132258	63	3	3	emurielb76	2026-02-26	Refuerzo Mates 2º ESO A/B INFORM.	968
1200	43	7	7	cblancoa02	2026-03-27	Economía 1º Bach. Cristina Blanco	984
1201	43	7	7	cblancoa02	2026-04-03	Economía 1º Bach. Cristina Blanco	984
1202	43	7	7	cblancoa02	2026-04-10	Economía 1º Bach. Cristina Blanco	984
1203	43	7	7	cblancoa02	2026-04-17	Economía 1º Bach. Cristina Blanco	984
1204	43	7	7	cblancoa02	2026-04-24	Economía 1º Bach. Cristina Blanco	984
1205	43	7	7	cblancoa02	2026-05-01	Economía 1º Bach. Cristina Blanco	984
1206	43	7	7	cblancoa02	2026-05-08	Economía 1º Bach. Cristina Blanco	984
1207	43	7	7	cblancoa02	2026-05-15	Economía 1º Bach. Cristina Blanco	984
1208	43	7	7	cblancoa02	2026-05-22	Economía 1º Bach. Cristina Blanco	984
1209	43	7	7	cblancoa02	2026-05-29	Economía 1º Bach. Cristina Blanco	984
132274	45	3	3	emurielb76	2026-02-27	1º Bach AE. Virginia	1033
1210	43	7	7	cblancoa02	2026-06-05	Economía 1º Bach. Cristina Blanco	984
1211	43	7	7	cblancoa02	2026-06-12	Economía 1º Bach. Cristina Blanco	984
1212	43	7	7	cblancoa02	2026-06-19	Economía 1º Bach. Cristina Blanco	984
132286	67	7	7	mtcerezog01	2026-02-27	Teresa 3º diver	\N
1618	41	1	1	mdcpalaciosr01	2026-03-11	AMBITO PRÁCTICO	\N
132290	14	1	1	emurielb76	2026-03-02	MAITE	989
132291	45	2	2	emurielb76	2026-03-02	Intel. Artif. 1º Bach. Miguel	1022
1639	30	1	7	emurielb76	2026-03-09	Reserva provisional	\N
1660	43	5	5	ilozano1977	2026-02-25	1ºESO Isabel Lozano	\N
132294	14	3	3	emurielb76	2026-03-02	MAITE	990
132295	8	3	3	emurielb76	2026-03-02	Refuerzo Lengua 1º ESO A/B Maribel	960
1736	45	6	6	mtmarting03	2026-02-24	MAITE	\N
1770	42	7	7	pety78	2026-02-24	2º TAPSD	\N
1793	14	1	1	mtmarting03	2026-04-22	MAITE	\N
1966	22	2	2	cjlozanop01	2026-03-19	Introd. Filosofía	\N
1975	43	1	1	sromang06	2026-03-25	2ºB Física y Química	\N
1985	45	1	1	afloresc27	2026-03-17	AnaFloresc-EF	\N
2065	14	1	1	mtmarting03	2026-03-16	MAITE	989
2066	14	1	1	mtmarting03	2026-03-23	MAITE	989
2067	14	1	1	mtmarting03	2026-03-30	MAITE	989
132307	14	6	6	emurielb76	2026-03-02	MAITE	991
2068	14	1	1	mtmarting03	2026-04-06	MAITE	989
2069	14	1	1	mtmarting03	2026-04-13	MAITE	989
2070	14	1	1	mtmarting03	2026-04-20	MAITE	989
132312	45	2	2	cjlozanop01	2026-03-03	Carlos J. -Filosofía	\N
2071	14	1	1	mtmarting03	2026-04-27	MAITE	989
2072	14	1	1	mtmarting03	2026-05-04	MAITE	989
2073	14	1	1	mtmarting03	2026-05-11	MAITE	989
2074	14	1	1	mtmarting03	2026-05-18	MAITE	989
2075	14	1	1	mtmarting03	2026-05-25	MAITE	989
2076	14	1	1	mtmarting03	2026-06-01	MAITE	989
2077	14	1	1	mtmarting03	2026-06-08	MAITE	989
2078	14	1	1	mtmarting03	2026-06-15	MAITE	989
2209	30	7	7	vpalaciosg06	2026-03-25	CHARLA ORIENTACIÓN 2º BACHILLERATO	\N
2213	42	6	6	dnarcisoc01	2026-03-19	lola APC	\N
2290	67	7	7	mtcerezog01	2026-03-20	3º Diver. Teresa	\N
2301	45	3	3	bfernandezt07	2026-03-18	Blanca_ Reunión con Madre de Roxana	\N
2312	22	3	3	mapavonb01	2026-03-19		\N
2313	22	6	6	mapavonb01	2026-03-19		\N
2324	47	1	7	emurielb76	2026-05-26	Escuela 4.0	\N
2332	41	7	7	egonzalezh18	2026-03-20	4º AE	\N
2342	67	5	5	mafloresm01	2026-03-25	4º ESO (Diversificación) / Inglés	\N
2356	41	2	2	celita2	2026-03-27	CELIA - 3º ESO	\N
132324	63	6	6	emurielb76	2026-03-03	Refuerzo Mates 2º ESO A/B INFORM.	967
1213	43	2	2	cblancoa02	2026-02-13	Econ. Empr. 1º Bach. Cristina Blanco	983
1214	43	2	2	cblancoa02	2026-02-20	Econ. Empr. 1º Bach. Cristina Blanco	983
1215	43	2	2	cblancoa02	2026-02-27	Econ. Empr. 1º Bach. Cristina Blanco	983
132329	45	2	2	emurielb76	2026-03-04	Intel. Artif. 1º Bach. Miguel	1022
1216	43	2	2	cblancoa02	2026-03-06	Econ. Empr. 1º Bach. Cristina Blanco	983
132331	14	2	2	emurielb76	2026-03-04	MAITE	992
1217	43	2	2	cblancoa02	2026-03-13	Econ. Empr. 1º Bach. Cristina Blanco	983
1218	43	2	2	cblancoa02	2026-03-20	Econ. Empr. 1º Bach. Cristina Blanco	983
1219	43	2	2	cblancoa02	2026-03-27	Econ. Empr. 1º Bach. Cristina Blanco	983
1220	43	2	2	cblancoa02	2026-04-03	Econ. Empr. 1º Bach. Cristina Blanco	983
1221	43	2	2	cblancoa02	2026-04-10	Econ. Empr. 1º Bach. Cristina Blanco	983
1222	43	2	2	cblancoa02	2026-04-17	Econ. Empr. 1º Bach. Cristina Blanco	983
1223	43	2	2	cblancoa02	2026-04-24	Econ. Empr. 1º Bach. Cristina Blanco	983
1224	43	2	2	cblancoa02	2026-05-01	Econ. Empr. 1º Bach. Cristina Blanco	983
132341	14	5	5	emurielb76	2026-03-04	MAITE	1036
1225	43	2	2	cblancoa02	2026-05-08	Econ. Empr. 1º Bach. Cristina Blanco	983
1226	43	2	2	cblancoa02	2026-05-15	Econ. Empr. 1º Bach. Cristina Blanco	983
1227	43	2	2	cblancoa02	2026-05-22	Econ. Empr. 1º Bach. Cristina Blanco	983
1228	43	2	2	cblancoa02	2026-05-29	Econ. Empr. 1º Bach. Cristina Blanco	983
1229	43	2	2	cblancoa02	2026-06-05	Econ. Empr. 1º Bach. Cristina Blanco	983
1230	43	2	2	cblancoa02	2026-06-12	Econ. Empr. 1º Bach. Cristina Blanco	983
132350	63	2	2	emurielb76	2026-03-05	Raquel apoyo	1039
132351	63	3	3	emurielb76	2026-03-05	Refuerzo Mates 2º ESO A/B INFORM.	968
1231	43	2	2	cblancoa02	2026-06-19	Econ. Empr. 1º Bach. Cristina Blanco	983
1619	41	2	2	mdcpalaciosr01	2026-03-11	AMBITO PRÁCTICO	\N
1640	30	1	7	emurielb76	2026-03-10	Reserva provisional	\N
1737	45	6	6	mtmarting03	2026-03-03	MAITE	\N
1967	45	2	2	cjlozanop01	2026-03-17	Filosofía -Meteoescuela	\N
1976	43	5	5	sromang06	2026-03-25	2ºA Física y Química	\N
1986	43	7	7	afloresc27	2026-03-19	AnaFlores-EF	\N
2079	63	6	6	egonzalezh18	2026-03-16	CC Grales 2º Bach Elena G.	1014
2080	63	6	6	egonzalezh18	2026-03-19	CC Grales 2º Bach Elena G.	1014
2081	63	6	6	egonzalezh18	2026-03-20	CC Grales 2º Bach Elena G.	1014
132370	45	3	3	emurielb76	2026-03-06	1º Bach AE. Virginia	1033
2082	63	6	6	egonzalezh18	2026-03-23	CC Grales 2º Bach Elena G.	1014
2083	63	6	6	egonzalezh18	2026-03-26	CC Grales 2º Bach Elena G.	1014
2084	63	6	6	egonzalezh18	2026-03-27	CC Grales 2º Bach Elena G.	1014
2085	63	6	6	egonzalezh18	2026-03-30	CC Grales 2º Bach Elena G.	1014
132383	14	1	1	emurielb76	2026-03-09	MAITE	989
2086	63	6	6	egonzalezh18	2026-04-02	CC Grales 2º Bach Elena G.	1014
2087	63	6	6	egonzalezh18	2026-04-03	CC Grales 2º Bach Elena G.	1014
132386	45	2	2	emurielb76	2026-03-09	Intel. Artif. 1º Bach. Miguel	1022
2088	63	6	6	egonzalezh18	2026-04-06	CC Grales 2º Bach Elena G.	1014
2089	63	6	6	egonzalezh18	2026-04-09	CC Grales 2º Bach Elena G.	1014
2090	63	6	6	egonzalezh18	2026-04-10	CC Grales 2º Bach Elena G.	1014
132390	14	3	3	emurielb76	2026-03-09	MAITE	990
132391	8	3	3	emurielb76	2026-03-09	Refuerzo Lengua 1º ESO A/B Maribel	960
2091	63	6	6	egonzalezh18	2026-04-13	CC Grales 2º Bach Elena G.	1014
2092	63	6	6	egonzalezh18	2026-04-16	CC Grales 2º Bach Elena G.	1014
132398	14	6	6	emurielb76	2026-03-09	MAITE	991
1232	55	3	3	jjmorcillor01	2026-02-13	Latín 4º B Juan José	973
1233	55	3	3	jjmorcillor01	2026-02-20	Latín 4º B Juan José	973
1234	55	3	3	jjmorcillor01	2026-02-27	Latín 4º B Juan José	973
1235	55	3	3	jjmorcillor01	2026-03-06	Latín 4º B Juan José	973
1236	55	3	3	jjmorcillor01	2026-03-13	Latín 4º B Juan José	973
1237	55	3	3	jjmorcillor01	2026-03-20	Latín 4º B Juan José	973
1238	55	3	3	jjmorcillor01	2026-03-27	Latín 4º B Juan José	973
1239	55	3	3	jjmorcillor01	2026-04-03	Latín 4º B Juan José	973
1240	55	3	3	jjmorcillor01	2026-04-10	Latín 4º B Juan José	973
1241	55	3	3	jjmorcillor01	2026-04-17	Latín 4º B Juan José	973
1242	55	3	3	jjmorcillor01	2026-04-24	Latín 4º B Juan José	973
132414	63	6	6	emurielb76	2026-03-10	Refuerzo Mates 2º ESO A/B INFORM.	967
1243	55	3	3	jjmorcillor01	2026-05-01	Latín 4º B Juan José	973
1244	55	3	3	jjmorcillor01	2026-05-08	Latín 4º B Juan José	973
1245	55	3	3	jjmorcillor01	2026-05-15	Latín 4º B Juan José	973
1246	55	3	3	jjmorcillor01	2026-05-22	Latín 4º B Juan José	973
1247	55	3	3	jjmorcillor01	2026-05-29	Latín 4º B Juan José	973
132421	45	2	2	emurielb76	2026-03-11	Intel. Artif. 1º Bach. Miguel	1022
1248	55	3	3	jjmorcillor01	2026-06-05	Latín 4º B Juan José	973
1249	55	3	3	jjmorcillor01	2026-06-12	Latín 4º B Juan José	973
1250	55	3	3	jjmorcillor01	2026-06-19	Latín 4º B Juan José	973
132425	14	2	2	emurielb76	2026-03-11	MAITE	992
1641	30	1	7	emurielb76	2026-04-27	Exposición Historietas e historia	\N
1661	22	1	3	emurielb76	2026-03-05	Charla Magistrado a 2º eso A (2ª hora) y B (3ª hora)	\N
1713	22	1	1	emparrag02	2026-02-23	Inma 2º Eso A	\N
132432	14	5	5	emurielb76	2026-03-11	MAITE	1036
1714	42	1	2	isabel22	2026-02-20		\N
1717	42	1	2	pety78	2026-02-23	2º TEI	\N
1738	45	6	6	mtmarting03	2026-03-10	MAITE	\N
1751	41	2	2	jjmorcillor01	2026-02-24	Juanjo Latín	\N
1772	14	5	5	mtmarting03	2026-03-30	MAITE	\N
132441	63	2	2	emurielb76	2026-03-12	Raquel apoyo	1039
1795	14	5	5	mafloresm01	2026-02-27	4º ESO (Diversificación) / Inglés	\N
1809	22	2	2	cjlozanop01	2026-02-26		\N
1821	42	1	1	rmvegac01	2026-02-27	Rosa	\N
132445	63	3	3	emurielb76	2026-03-12	Refuerzo Mates 2º ESO A/B INFORM.	968
1833	42	1	1	amfajardol01	2026-03-02	alba 2 fpb	\N
1845	42	2	2	jjmorcillor01	2026-03-03	Cultura CLÁSICA Juanjo	\N
1858	42	1	1	rmvegac01	2026-03-04	DCM	\N
1869	47	5	5	jrodriguezt18	2026-03-05	Geografía 3ºESO B	\N
1872	67	3	4	mssalomonp02	2026-03-05	Marisol	\N
1875	45	1	1	omsanchezg01	2026-03-06	1º eso AE Olga	\N
1880	45	2	2	cjlozanop01	2026-03-10	Meteoescuela, 1º A	\N
1890	43	6	6	lpcamarac01	2026-03-10	2º ESO- Luis Pedro Cámara	\N
1903	41	1	2	mdcpalaciosr01	2026-05-13	ambito práctico	\N
1968	14	6	6	cjlozanop01	2026-03-18	Filosofía -Meteoescuela	\N
1977	42	5	5	bfernandezt07	2026-03-12	blanca  FP básica	\N
1987	42	1	1	igomezc12	2026-03-13	1º CFGB	\N
2093	63	6	6	egonzalezh18	2026-04-17	CC Grales 2º Bach Elena G.	1014
2094	63	6	6	egonzalezh18	2026-04-20	CC Grales 2º Bach Elena G.	1014
2095	63	6	6	egonzalezh18	2026-04-23	CC Grales 2º Bach Elena G.	1014
2096	63	6	6	egonzalezh18	2026-04-24	CC Grales 2º Bach Elena G.	1014
2097	63	6	6	egonzalezh18	2026-04-27	CC Grales 2º Bach Elena G.	1014
2098	63	6	6	egonzalezh18	2026-04-30	CC Grales 2º Bach Elena G.	1014
2099	63	6	6	egonzalezh18	2026-05-01	CC Grales 2º Bach Elena G.	1014
2100	63	6	6	egonzalezh18	2026-05-04	CC Grales 2º Bach Elena G.	1014
2101	63	6	6	egonzalezh18	2026-05-07	CC Grales 2º Bach Elena G.	1014
2102	63	6	6	egonzalezh18	2026-05-08	CC Grales 2º Bach Elena G.	1014
2103	63	6	6	egonzalezh18	2026-05-11	CC Grales 2º Bach Elena G.	1014
2104	63	6	6	egonzalezh18	2026-05-14	CC Grales 2º Bach Elena G.	1014
2105	63	6	6	egonzalezh18	2026-05-15	CC Grales 2º Bach Elena G.	1014
2106	63	6	6	egonzalezh18	2026-05-18	CC Grales 2º Bach Elena G.	1014
2107	63	6	6	egonzalezh18	2026-05-21	CC Grales 2º Bach Elena G.	1014
2108	63	6	6	egonzalezh18	2026-05-22	CC Grales 2º Bach Elena G.	1014
2109	63	6	6	egonzalezh18	2026-05-25	CC Grales 2º Bach Elena G.	1014
2110	63	6	6	egonzalezh18	2026-05-28	CC Grales 2º Bach Elena G.	1014
2111	63	6	6	egonzalezh18	2026-05-29	CC Grales 2º Bach Elena G.	1014
2112	63	6	6	egonzalezh18	2026-06-01	CC Grales 2º Bach Elena G.	1014
2113	63	6	6	egonzalezh18	2026-06-04	CC Grales 2º Bach Elena G.	1014
2114	63	6	6	egonzalezh18	2026-06-05	CC Grales 2º Bach Elena G.	1014
2115	63	6	6	egonzalezh18	2026-06-08	CC Grales 2º Bach Elena G.	1014
2116	63	6	6	egonzalezh18	2026-06-11	CC Grales 2º Bach Elena G.	1014
2117	63	6	6	egonzalezh18	2026-06-12	CC Grales 2º Bach Elena G.	1014
2118	63	6	6	egonzalezh18	2026-06-15	CC Grales 2º Bach Elena G.	1014
1251	62	1	1	rencinasr02	2026-02-13	Mates NB 2º ESO A Raquel	964
1252	62	1	1	rencinasr02	2026-02-20	Mates NB 2º ESO A Raquel	964
1253	62	1	1	rencinasr02	2026-02-27	Mates NB 2º ESO A Raquel	964
1254	62	1	1	rencinasr02	2026-03-06	Mates NB 2º ESO A Raquel	964
1255	62	1	1	rencinasr02	2026-03-13	Mates NB 2º ESO A Raquel	964
1256	62	1	1	rencinasr02	2026-03-20	Mates NB 2º ESO A Raquel	964
1257	62	1	1	rencinasr02	2026-03-27	Mates NB 2º ESO A Raquel	964
1258	62	1	1	rencinasr02	2026-04-03	Mates NB 2º ESO A Raquel	964
1259	62	1	1	rencinasr02	2026-04-10	Mates NB 2º ESO A Raquel	964
1260	62	1	1	rencinasr02	2026-04-17	Mates NB 2º ESO A Raquel	964
1261	62	1	1	rencinasr02	2026-04-24	Mates NB 2º ESO A Raquel	964
1262	62	1	1	rencinasr02	2026-05-01	Mates NB 2º ESO A Raquel	964
1263	62	1	1	rencinasr02	2026-05-08	Mates NB 2º ESO A Raquel	964
1264	62	1	1	rencinasr02	2026-05-15	Mates NB 2º ESO A Raquel	964
1265	62	1	1	rencinasr02	2026-05-22	Mates NB 2º ESO A Raquel	964
1266	62	1	1	rencinasr02	2026-05-29	Mates NB 2º ESO A Raquel	964
1267	62	1	1	rencinasr02	2026-06-05	Mates NB 2º ESO A Raquel	964
1268	62	1	1	rencinasr02	2026-06-12	Mates NB 2º ESO A Raquel	964
1269	62	1	1	rencinasr02	2026-06-19	Mates NB 2º ESO A Raquel	964
1621	41	1	2	mdcpalaciosr01	2026-03-25	AMBITO PRÁCTICO	\N
2214	67	3	3	omsanchezg01	2026-03-17	Olga  3º Diver	\N
1642	30	1	7	emurielb76	2026-04-28	Exposición Historietas e historia	\N
1662	45	3	3	jjmorcillor01	2026-02-19	Juanjo Latín	\N
1715	22	3	3	mji3003	2026-02-20	Inma	\N
1739	45	6	6	mtmarting03	2026-03-17	MAITE	\N
1752	41	6	6	jjmorcillor01	2026-02-24	Juanjo Latín	\N
1773	14	7	7	mtmarting03	2026-03-30	MAITE	\N
1796	42	1	2	pety78	2026-02-25	2º TEI	\N
1810	30	4	4	emurielb76	2026-02-26	Pilar Alumnos Maribor	\N
1822	67	3	3	omsanchezg01	2026-02-27	3º diver Olga	\N
1834	8	1	1	dnarcisoc01	2026-03-03	Examen TLA 2º GM	\N
1846	47	7	7	egonzalezh18	2026-03-06	4º AE	\N
1859	22	6	6	mafloresm01	2026-03-05	4º ESO (A) / Inglés	\N
1870	47	6	6	jrodriguezt18	2026-03-05	Geografía 3ºESO B	\N
1873	41	6	6	mebravom01	2026-03-05	1º Bach	\N
1876	41	2	2	mebravom01	2026-03-06	2º ESO	\N
1881	14	6	6	cjlozanop01	2026-03-11	meteoescuela, 1º A	\N
1904	41	1	2	mdcpalaciosr01	2026-05-27	AMBITO PRÁCTICO	\N
1978	14	5	5	mrcarmonav01	2026-03-13	3ºdiver	\N
1988	41	6	6	jjmorcillor01	2026-03-13	Juanjo Cultura Clásica	\N
2119	63	6	6	egonzalezh18	2026-06-18	CC Grales 2º Bach Elena G.	1014
2120	63	6	6	egonzalezh18	2026-06-19	CC Grales 2º Bach Elena G.	1014
2302	14	7	7	omsanchezg01	2026-03-18	Olga 3º Diver	\N
2314	22	1	1	mapavonb01	2026-03-19		\N
2325	30	6	6	rmvegac01	2026-03-19	EXAMEN DCM	\N
2326	30	7	7	rmvegac01	2026-03-19	EXAMEN DCM	\N
2333	67	3	3	omsanchezg01	2026-03-20	Olga 3º Diver	\N
2343	41	3	3	mafloresm01	2026-03-26	4º ESO (Diversificación) / Inglés	\N
2357	43	3	3	celita2	2026-03-24	CELIA - 3º ESO	\N
1270	8	3	3	amfajardol01	2026-02-13	Biología NB 1º ESO A Alba Fajardo	959
1271	8	3	3	amfajardol01	2026-02-20	Biología NB 1º ESO A Alba Fajardo	959
1272	8	3	3	amfajardol01	2026-02-27	Biología NB 1º ESO A Alba Fajardo	959
1273	8	3	3	amfajardol01	2026-03-06	Biología NB 1º ESO A Alba Fajardo	959
1274	8	3	3	amfajardol01	2026-03-13	Biología NB 1º ESO A Alba Fajardo	959
1275	8	3	3	amfajardol01	2026-03-20	Biología NB 1º ESO A Alba Fajardo	959
1276	8	3	3	amfajardol01	2026-03-27	Biología NB 1º ESO A Alba Fajardo	959
1277	8	3	3	amfajardol01	2026-04-03	Biología NB 1º ESO A Alba Fajardo	959
1278	8	3	3	amfajardol01	2026-04-10	Biología NB 1º ESO A Alba Fajardo	959
1279	8	3	3	amfajardol01	2026-04-17	Biología NB 1º ESO A Alba Fajardo	959
1280	8	3	3	amfajardol01	2026-04-24	Biología NB 1º ESO A Alba Fajardo	959
1281	8	3	3	amfajardol01	2026-05-01	Biología NB 1º ESO A Alba Fajardo	959
1282	8	3	3	amfajardol01	2026-05-08	Biología NB 1º ESO A Alba Fajardo	959
1283	8	3	3	amfajardol01	2026-05-15	Biología NB 1º ESO A Alba Fajardo	959
1284	8	3	3	amfajardol01	2026-05-22	Biología NB 1º ESO A Alba Fajardo	959
1285	8	3	3	amfajardol01	2026-05-29	Biología NB 1º ESO A Alba Fajardo	959
1286	8	3	3	amfajardol01	2026-06-05	Biología NB 1º ESO A Alba Fajardo	959
1287	8	3	3	amfajardol01	2026-06-12	Biología NB 1º ESO A Alba Fajardo	959
1288	8	3	3	amfajardol01	2026-06-19	Biología NB 1º ESO A Alba Fajardo	959
1643	30	1	7	emurielb76	2026-04-29	Exposición Historietas e historia	\N
1716	41	6	6	jjmorcillor01	2026-02-20	Juanjo Cultura CLásica	\N
1719	43	2	2	celita2	2026-02-23	CELIA 1º ESO	\N
1740	45	6	6	mtmarting03	2026-03-24	MAITE	\N
1753	30	6	7	pety78	2026-02-24	Examen 2º TAPSD	\N
1774	14	1	1	mtmarting03	2026-03-04	MAITE	\N
1797	22	6	6	mafloresm01	2026-02-26	4º ESO (A) / Inglés	\N
1811	43	1	1	bfernandezt07	2026-02-27	FP Básica 1º Blanca	\N
1823	42	2	2	isabel22	2026-02-27		\N
1835	42	2	2	isabel22	2026-03-02		\N
1847	43	6	6	lpcamarac01	2026-03-03	2º ESO Luis Pedro Cámara	\N
1860	67	5	5	mtcerezog01	2026-03-04	3º Diver . Teresa	\N
1871	42	1	1	amfajardol01	2026-03-09	2FPB Alba 	\N
1874	41	7	7	mebravom01	2026-03-05	1º ESO Reli	\N
1877	41	2	2	celita2	2026-03-09	1º ESO - CELIA- BIO	\N
1882	43	2	2	amfajardol01	2026-03-12	2 FPB Alba 	\N
1892	41	3	3	lpcamarac01	2026-03-12	2º ESO - Luis Pedro Cámara	\N
1905	41	1	2	mdcpalaciosr01	2026-06-03	AMBITO PRÁCTICO	\N
1979	45	3	3	mrcarmonav01	2026-03-19	Tutoría	\N
1989	41	3	3	egonzalezh18	2026-03-13	1º eso A-B	\N
2121	14	3	3	mtmarting03	2026-03-16	MAITE	990
2122	14	3	3	mtmarting03	2026-03-23	MAITE	990
2123	14	3	3	mtmarting03	2026-03-30	MAITE	990
2124	14	3	3	mtmarting03	2026-04-06	MAITE	990
2125	14	3	3	mtmarting03	2026-04-13	MAITE	990
2126	14	3	3	mtmarting03	2026-04-20	MAITE	990
2127	14	3	3	mtmarting03	2026-04-27	MAITE	990
2128	14	3	3	mtmarting03	2026-05-04	MAITE	990
2129	14	3	3	mtmarting03	2026-05-11	MAITE	990
2130	14	3	3	mtmarting03	2026-05-18	MAITE	990
2131	14	3	3	mtmarting03	2026-05-25	MAITE	990
2132	14	3	3	mtmarting03	2026-06-01	MAITE	990
2133	14	3	3	mtmarting03	2026-06-08	MAITE	990
2134	14	3	3	mtmarting03	2026-06-15	MAITE	990
2215	14	5	5	omsanchezg01	2026-03-17	Olga 3º Diver	\N
2292	22	3	3	mtcerezog01	2026-03-20	4º Diver. Teresa	\N
2303	67	5	5	omsanchezg01	2026-03-18	Olga Apoyo 1ºESO 	\N
2327	42	5	5	rmvegac01	2026-03-19	ROSA	\N
2315	22	6	6	mapavonb01	2026-03-20		\N
2334	42	5	5	egonzalezh18	2026-03-20	1º de grado medio Mujeres	\N
2344	43	5	5	mafloresm01	2026-03-27	4º ESO (Diversificación) / Inglés	\N
2358	67	6	6	mtcerezog01	2026-03-26	4º Diver. Teresa	\N
1289	45	5	5	mahernandezr06	2026-02-16	Digitalización 4º ESO A/B Miguel	1026
1290	45	5	5	mahernandezr06	2026-02-19	Digitalización 4º ESO A/B Miguel	1026
1291	45	5	5	mahernandezr06	2026-02-23	Digitalización 4º ESO A/B Miguel	1026
1292	45	5	5	mahernandezr06	2026-02-26	Digitalización 4º ESO A/B Miguel	1026
1293	45	5	5	mahernandezr06	2026-03-02	Digitalización 4º ESO A/B Miguel	1026
1294	45	5	5	mahernandezr06	2026-03-05	Digitalización 4º ESO A/B Miguel	1026
1295	45	5	5	mahernandezr06	2026-03-09	Digitalización 4º ESO A/B Miguel	1026
1296	45	5	5	mahernandezr06	2026-03-12	Digitalización 4º ESO A/B Miguel	1026
1297	45	5	5	mahernandezr06	2026-03-16	Digitalización 4º ESO A/B Miguel	1026
1298	45	5	5	mahernandezr06	2026-03-19	Digitalización 4º ESO A/B Miguel	1026
1299	45	5	5	mahernandezr06	2026-03-23	Digitalización 4º ESO A/B Miguel	1026
1300	45	5	5	mahernandezr06	2026-03-26	Digitalización 4º ESO A/B Miguel	1026
1301	45	5	5	mahernandezr06	2026-03-30	Digitalización 4º ESO A/B Miguel	1026
1302	45	5	5	mahernandezr06	2026-04-02	Digitalización 4º ESO A/B Miguel	1026
1303	45	5	5	mahernandezr06	2026-04-06	Digitalización 4º ESO A/B Miguel	1026
1304	45	5	5	mahernandezr06	2026-04-09	Digitalización 4º ESO A/B Miguel	1026
1305	45	5	5	mahernandezr06	2026-04-13	Digitalización 4º ESO A/B Miguel	1026
1306	45	5	5	mahernandezr06	2026-04-16	Digitalización 4º ESO A/B Miguel	1026
1307	45	5	5	mahernandezr06	2026-04-20	Digitalización 4º ESO A/B Miguel	1026
1308	45	5	5	mahernandezr06	2026-04-23	Digitalización 4º ESO A/B Miguel	1026
1309	45	5	5	mahernandezr06	2026-04-27	Digitalización 4º ESO A/B Miguel	1026
1310	45	5	5	mahernandezr06	2026-04-30	Digitalización 4º ESO A/B Miguel	1026
1311	45	5	5	mahernandezr06	2026-05-04	Digitalización 4º ESO A/B Miguel	1026
1312	45	5	5	mahernandezr06	2026-05-07	Digitalización 4º ESO A/B Miguel	1026
1313	45	5	5	mahernandezr06	2026-05-14	Digitalización 4º ESO A/B Miguel	1026
1314	45	5	5	mahernandezr06	2026-05-21	Digitalización 4º ESO A/B Miguel	1026
1315	45	5	5	mahernandezr06	2026-05-25	Digitalización 4º ESO A/B Miguel	1026
1316	45	5	5	mahernandezr06	2026-05-28	Digitalización 4º ESO A/B Miguel	1026
1317	45	5	5	mahernandezr06	2026-06-01	Digitalización 4º ESO A/B Miguel	1026
1318	45	5	5	mahernandezr06	2026-06-04	Digitalización 4º ESO A/B Miguel	1026
1319	45	5	5	mahernandezr06	2026-06-08	Digitalización 4º ESO A/B Miguel	1026
1320	45	5	5	mahernandezr06	2026-06-11	Digitalización 4º ESO A/B Miguel	1026
1321	45	5	5	mahernandezr06	2026-06-15	Digitalización 4º ESO A/B Miguel	1026
1322	45	5	5	mahernandezr06	2026-06-18	Digitalización 4º ESO A/B Miguel	1026
1623	41	1	2	mdcpalaciosr01	2026-04-08	AMBITO PRÁCTICO	\N
1644	30	1	7	emurielb76	2026-04-30	Exposición Historietas e historia	\N
1664	41	3	3	mgperezr02	2026-02-25	4º Diver	\N
1720	41	2	2	mafloresm01	2026-02-23	4º ESO (DIVERSIFICACIÓN) ANGIE	\N
1741	45	6	6	mtmarting03	2026-03-31	MAITE	\N
1775	14	1	1	mtmarting03	2026-03-11	MAITE	\N
1798	43	7	7	celita2	2026-02-26	biología Celia	\N
1812	14	2	2	bfernandezt07	2026-02-27	FP Básica 2º Blanca	\N
1824	45	7	7	djuliog01	2026-02-27	Diana (1º B)	\N
1836	67	3	3	efranciscor01	2026-03-02	Estela	\N
1848	47	3	3	mafloresm01	2026-03-03	2º BACHILLERATO / INGLÉS	\N
1861	43	6	6	celita2	2026-03-05	BIOLOGÍA - 1º ESO	\N
1883	41	4	4	mgperezr02	2026-03-09	Grani	\N
1893	14	3	3	bfernandezt07	2026-03-11	Blanca _inscripción Yolanda pruebas GRADO MEDIO	\N
1906	41	1	2	mdcpalaciosr01	2026-06-10	AMBITO PRÁCTICO	\N
1990	45	7	7	egonzalezh18	2026-03-13	4º ESO A-B y Diver	\N
2135	63	6	6	bpconejero78	2026-03-17	Refuerzo Mates 2º ESO A/B INFORM.	967
2136	63	6	6	bpconejero78	2026-03-24	Refuerzo Mates 2º ESO A/B INFORM.	967
2137	63	6	6	bpconejero78	2026-03-31	Refuerzo Mates 2º ESO A/B INFORM.	967
2138	63	6	6	bpconejero78	2026-04-07	Refuerzo Mates 2º ESO A/B INFORM.	967
2139	63	6	6	bpconejero78	2026-04-14	Refuerzo Mates 2º ESO A/B INFORM.	967
2140	63	6	6	bpconejero78	2026-04-21	Refuerzo Mates 2º ESO A/B INFORM.	967
2141	63	6	6	bpconejero78	2026-04-28	Refuerzo Mates 2º ESO A/B INFORM.	967
2142	63	6	6	bpconejero78	2026-05-05	Refuerzo Mates 2º ESO A/B INFORM.	967
1323	45	3	3	mahernandezr06	2026-02-17	Intel. Artif. 1º Bach. Miguel	1029
1324	45	3	3	mahernandezr06	2026-02-24	Intel. Artif. 1º Bach. Miguel	1029
1325	45	3	3	mahernandezr06	2026-03-03	Intel. Artif. 1º Bach. Miguel	1029
1326	45	3	3	mahernandezr06	2026-03-10	Intel. Artif. 1º Bach. Miguel	1029
1327	45	3	3	mahernandezr06	2026-03-17	Intel. Artif. 1º Bach. Miguel	1029
1328	45	3	3	mahernandezr06	2026-03-24	Intel. Artif. 1º Bach. Miguel	1029
1329	45	3	3	mahernandezr06	2026-03-31	Intel. Artif. 1º Bach. Miguel	1029
1330	45	3	3	mahernandezr06	2026-04-07	Intel. Artif. 1º Bach. Miguel	1029
1331	45	3	3	mahernandezr06	2026-04-14	Intel. Artif. 1º Bach. Miguel	1029
1332	45	3	3	mahernandezr06	2026-04-21	Intel. Artif. 1º Bach. Miguel	1029
1333	45	3	3	mahernandezr06	2026-04-28	Intel. Artif. 1º Bach. Miguel	1029
1334	45	3	3	mahernandezr06	2026-05-05	Intel. Artif. 1º Bach. Miguel	1029
1336	45	3	3	mahernandezr06	2026-05-26	Intel. Artif. 1º Bach. Miguel	1029
1337	45	3	3	mahernandezr06	2026-06-02	Intel. Artif. 1º Bach. Miguel	1029
1338	45	3	3	mahernandezr06	2026-06-09	Intel. Artif. 1º Bach. Miguel	1029
1339	45	3	3	mahernandezr06	2026-06-16	Intel. Artif. 1º Bach. Miguel	1029
1624	41	1	2	mdcpalaciosr01	2026-04-15	AMBITO PRÁCTICO	\N
1645	30	1	7	emurielb76	2026-05-04	Exposición Historietas e historia	\N
1665	41	3	3	mgperezr02	2026-03-04	4º Diver	\N
1991	22	3	3	mtcerezog01	2026-03-13	4º Diver. Teresa ASL	\N
1742	14	5	5	mtmarting03	2026-03-02	MAITE	\N
1755	47	5	5	egonzalezh18	2026-02-25	2º Bach CCGG	\N
1776	14	1	1	mtmarting03	2026-03-18	MAITE	\N
1799	30	3	3	vpalaciosg06	2026-04-14	CHARLA MALVALUNA	\N
1813	14	3	3	bfernandezt07	2026-02-27	FP Básica 2º Blanca	\N
1825	45	6	6	djuliog01	2026-02-27	Diana (2º A)	\N
2143	63	6	6	bpconejero78	2026-05-12	Refuerzo Mates 2º ESO A/B INFORM.	967
1849	62	3	5	emurielb76	2026-03-04	Examen ADO	\N
1862	43	7	7	celita2	2026-03-05	BIOOGÍA - 4º ESO. CELIA	\N
1879	42	2	2	amfajardol01	2026-03-09	1ESOA Alba 	\N
1884	45	3	3	pagarciam27	2026-03-11	Lectura 2ºESO B	\N
1894	45	6	6	celita2	2026-03-12	celia - 1º ESO	\N
1907	45	6	6	lpcamarac01	2026-03-13	1º ESO A. Luis Pedro Cámara	\N
1981	45	7	7	mrcarmonav01	2026-03-18	3ºA	\N
2144	63	6	6	bpconejero78	2026-05-19	Refuerzo Mates 2º ESO A/B INFORM.	967
2145	63	6	6	bpconejero78	2026-05-26	Refuerzo Mates 2º ESO A/B INFORM.	967
2146	63	6	6	bpconejero78	2026-06-02	Refuerzo Mates 2º ESO A/B INFORM.	967
2147	63	6	6	bpconejero78	2026-06-09	Refuerzo Mates 2º ESO A/B INFORM.	967
2148	63	6	6	bpconejero78	2026-06-16	Refuerzo Mates 2º ESO A/B INFORM.	967
2216	41	7	7	omsanchezg01	2026-03-17	Olga 4º Diver	\N
2293	43	3	3	sromang06	2026-03-20	2ºB Física y Química	\N
2304	30	4	4	emurielb76	2026-03-23	Equipo Directivo	\N
2316	22	7	7	mapavonb01	2026-03-20		\N
2328	30	4	7	emurielb76	2026-03-24	Equipo Directivo	\N
2335	43	7	7	egonzalezh18	2026-03-25	1º eso Mujeres extraordinarias 	\N
2359	67	7	7	mtcerezog01	2026-03-27	·º Diver Teresa	\N
1340	45	7	7	mahernandezr06	2026-02-16	TyD 2º ESO B Miguel	1028
1625	41	1	2	mdcpalaciosr01	2026-04-22	AMBITO PRÁCTICO	\N
1646	30	1	7	emurielb76	2026-05-05	Exposición Historietas e historia	\N
1666	42	6	6	bfernandezt07	2026-02-19	 FPBásica 2º	\N
1722	67	3	3	mtcerezog01	2026-02-25	3º Diver. Teresa	\N
1743	14	7	7	mtmarting03	2026-03-02	MAITE	\N
1756	47	2	2	egonzalezh18	2026-02-25	1º ESO Bilingüe	\N
1777	14	1	1	mtmarting03	2026-03-25	MAITE	\N
1800	30	7	7	vpalaciosg06	2026-04-14	CHARLA MALVALUNA	\N
1814	14	5	5	omsanchezg01	2026-02-26	3º diver Olga	\N
1826	41	6	6	jjmorcillor01	2026-02-27	Juanjo Cultura Clásica	\N
1838	41	6	6	bfernandezt07	2026-03-02	FP básica 1º	\N
1850	67	2	2	isabel22	2026-03-03		\N
1863	43	3	3	amfajardol01	2026-03-06	1º ESO A Alba 	\N
1885	14	4	4	emurielb76	2026-03-09	Laly	\N
1895	41	6	6	jjmorcillor01	2026-03-10	Juanjo Latín	\N
1908	43	7	7	lpcamarac01	2026-03-16	1º ESO B - Luis Pedro Cámara	\N
1982	45	7	7	mrcarmonav01	2026-03-25	3ºA	\N
1992	67	3	3	rencinasr02	2026-03-13	Raquel	\N
2149	14	2	2	mtmarting03	2026-03-18	MAITE	992
2150	14	2	2	mtmarting03	2026-03-25	MAITE	992
2151	14	2	2	mtmarting03	2026-04-01	MAITE	992
2152	14	2	2	mtmarting03	2026-04-08	MAITE	992
2153	14	2	2	mtmarting03	2026-04-15	MAITE	992
2154	14	2	2	mtmarting03	2026-04-22	MAITE	992
2155	14	2	2	mtmarting03	2026-04-29	MAITE	992
2156	14	2	2	mtmarting03	2026-05-06	MAITE	992
2157	14	2	2	mtmarting03	2026-05-13	MAITE	992
2158	14	2	2	mtmarting03	2026-05-20	MAITE	992
2159	14	2	2	mtmarting03	2026-05-27	MAITE	992
2160	14	2	2	mtmarting03	2026-06-03	MAITE	992
2161	14	2	2	mtmarting03	2026-06-10	MAITE	992
2162	14	2	2	mtmarting03	2026-06-17	MAITE	992
2217	22	4	4	cjlozanop01	2026-03-17	Atendida por Carlos	998
2218	22	4	4	cjlozanop01	2026-03-24	Atendida por Carlos	998
2219	22	4	4	cjlozanop01	2026-03-31	Atendida por Carlos	998
2220	22	4	4	cjlozanop01	2026-04-07	Atendida por Carlos	998
2221	22	4	4	cjlozanop01	2026-04-14	Atendida por Carlos	998
2222	22	4	4	cjlozanop01	2026-04-21	Atendida por Carlos	998
2223	22	4	4	cjlozanop01	2026-04-28	Atendida por Carlos	998
2224	22	4	4	cjlozanop01	2026-05-05	Atendida por Carlos	998
2225	22	4	4	cjlozanop01	2026-05-12	Atendida por Carlos	998
2226	22	4	4	cjlozanop01	2026-05-19	Atendida por Carlos	998
2227	22	4	4	cjlozanop01	2026-05-26	Atendida por Carlos	998
2228	22	4	4	cjlozanop01	2026-06-02	Atendida por Carlos	998
2229	22	4	4	cjlozanop01	2026-06-09	Atendida por Carlos	998
2230	22	4	4	cjlozanop01	2026-06-16	Atendida por Carlos	998
2294	43	6	6	sromang06	2026-03-20	2ºA física y Química	\N
2305	14	3	3	cblancoa02	2026-03-20	Cristina, alumnos de religión 1º Bto	\N
2317	45	2	2	lpcamarac01	2026-03-19	1º ESO B. Luis Pedro Cámara	\N
2336	41	6	6	jjmorcillor01	2026-03-20	Cultura Clásica	\N
2360	14	1	1	mtcerezog01	2026-03-27	3·º A.E. Teresa	\N
1375	45	6	6	mahernandezr06	2026-02-18	Digitalización 4º ESO A/B Miguel	1031
1376	45	6	6	mahernandezr06	2026-02-25	Digitalización 4º ESO A/B Miguel	1031
1377	45	6	6	mahernandezr06	2026-03-04	Digitalización 4º ESO A/B Miguel	1031
1378	45	6	6	mahernandezr06	2026-03-11	Digitalización 4º ESO A/B Miguel	1031
1379	45	6	6	mahernandezr06	2026-03-18	Digitalización 4º ESO A/B Miguel	1031
1380	45	6	6	mahernandezr06	2026-03-25	Digitalización 4º ESO A/B Miguel	1031
1381	45	6	6	mahernandezr06	2026-04-01	Digitalización 4º ESO A/B Miguel	1031
1382	45	6	6	mahernandezr06	2026-04-08	Digitalización 4º ESO A/B Miguel	1031
1383	45	6	6	mahernandezr06	2026-04-15	Digitalización 4º ESO A/B Miguel	1031
1384	45	6	6	mahernandezr06	2026-04-22	Digitalización 4º ESO A/B Miguel	1031
1385	45	6	6	mahernandezr06	2026-04-29	Digitalización 4º ESO A/B Miguel	1031
1386	45	6	6	mahernandezr06	2026-05-06	Digitalización 4º ESO A/B Miguel	1031
1387	45	6	6	mahernandezr06	2026-05-13	Digitalización 4º ESO A/B Miguel	1031
1388	45	6	6	mahernandezr06	2026-05-27	Digitalización 4º ESO A/B Miguel	1031
1389	45	6	6	mahernandezr06	2026-06-03	Digitalización 4º ESO A/B Miguel	1031
1390	45	6	6	mahernandezr06	2026-06-10	Digitalización 4º ESO A/B Miguel	1031
1391	45	6	6	mahernandezr06	2026-06-17	Digitalización 4º ESO A/B Miguel	1031
1626	41	1	2	mdcpalaciosr01	2026-04-29	AMBITO PRÁCTICO	\N
1647	30	1	7	emurielb76	2026-05-06	Exposición Historietas e historia	\N
132880	30	2	5	emurielb76	2026-04-15	Charlas Guardia Civil	\N
1667	14	3	3	bfernandezt07	2026-02-20	FPbásica 2º	\N
1723	30	4	4	mdcpalaciosr01	2026-02-24	FOTOS ORLA	\N
1744	14	5	5	mtmarting03	2026-03-09	MAITE	\N
1757	47	6	6	egonzalezh18	2026-02-25	3º ESO Bilingüe diseño 3D	\N
1778	14	5	5	mtmarting03	2026-04-06	MAITE	\N
1801	30	6	6	vpalaciosg06	2026-04-14	CHARLA MALVALUNA	\N
1815	30	6	6	rmvegac01	2026-02-26	DCM Rosa Vega	\N
1827	43	2	2	mafloresm01	2026-03-02	4º ESO (Diversificación) / Inglés	\N
1839	14	1	1	bfernandezt07	2026-03-03	FP básica 2º	\N
1851	45	6	6	mgperezr02	2026-03-05		\N
1864	45	7	7	efranciscor01	2026-03-04	2º APSD	\N
1886	41	7	7	omsanchezg01	2026-03-09	4º Diver Olga 	\N
1896	67	7	7	mtcerezog01	2026-03-13	3º Diver Teresa	\N
1909	67	4	4	rencinasr02	2026-03-11		\N
1983	41	1	1	mebravom01	2026-03-13	3º ESO RELI	\N
1993	45	3	3	vpalaciosg06	2026-03-13	1º Bach AE. Virginia	1033
1994	45	3	3	vpalaciosg06	2026-03-20	1º Bach AE. Virginia	1033
1995	45	3	3	vpalaciosg06	2026-03-27	1º Bach AE. Virginia	1033
1996	45	3	3	vpalaciosg06	2026-04-03	1º Bach AE. Virginia	1033
1997	45	3	3	vpalaciosg06	2026-04-10	1º Bach AE. Virginia	1033
1998	45	3	3	vpalaciosg06	2026-04-17	1º Bach AE. Virginia	1033
1999	45	3	3	vpalaciosg06	2026-04-24	1º Bach AE. Virginia	1033
2000	45	3	3	vpalaciosg06	2026-05-01	1º Bach AE. Virginia	1033
2001	45	3	3	vpalaciosg06	2026-05-08	1º Bach AE. Virginia	1033
2002	45	3	3	vpalaciosg06	2026-05-15	1º Bach AE. Virginia	1033
2003	45	3	3	vpalaciosg06	2026-05-22	1º Bach AE. Virginia	1033
2004	45	3	3	vpalaciosg06	2026-05-29	1º Bach AE. Virginia	1033
1392	45	1	1	mahernandezr06	2026-02-18	TyD  2º ESO A Miguel	1030
1393	45	1	1	mahernandezr06	2026-02-25	TyD  2º ESO A Miguel	1030
1394	45	1	1	mahernandezr06	2026-03-04	TyD  2º ESO A Miguel	1030
1395	45	1	1	mahernandezr06	2026-03-11	TyD  2º ESO A Miguel	1030
1396	45	1	1	mahernandezr06	2026-03-18	TyD  2º ESO A Miguel	1030
1397	45	1	1	mahernandezr06	2026-03-25	TyD  2º ESO A Miguel	1030
1398	45	1	1	mahernandezr06	2026-04-01	TyD  2º ESO A Miguel	1030
1399	45	1	1	mahernandezr06	2026-04-08	TyD  2º ESO A Miguel	1030
1400	45	1	1	mahernandezr06	2026-04-15	TyD  2º ESO A Miguel	1030
1401	45	1	1	mahernandezr06	2026-04-22	TyD  2º ESO A Miguel	1030
1402	45	1	1	mahernandezr06	2026-04-29	TyD  2º ESO A Miguel	1030
1403	45	1	1	mahernandezr06	2026-05-06	TyD  2º ESO A Miguel	1030
1404	45	1	1	mahernandezr06	2026-05-13	TyD  2º ESO A Miguel	1030
1405	45	1	1	mahernandezr06	2026-05-27	TyD  2º ESO A Miguel	1030
1406	45	1	1	mahernandezr06	2026-06-03	TyD  2º ESO A Miguel	1030
1407	45	1	1	mahernandezr06	2026-06-10	TyD  2º ESO A Miguel	1030
1408	45	1	1	mahernandezr06	2026-06-17	TyD  2º ESO A Miguel	1030
1648	14	5	5	omsanchezg01	2026-02-19	3º diver	\N
1668	45	1	1	omsanchezg01	2026-02-20	Atención Educativa 3ºeso. Olga	\N
1724	30	3	3	mmhernandezr01	2026-02-24	FOTOS ORLA	\N
1745	14	7	7	mtmarting03	2026-03-09	MAITE	\N
1747	14	7	7	mtmarting03	2026-03-16	MAITE	\N
1758	43	6	6	lpcamarac01	2026-02-24	Emprendimiento 2º ESO Luis Pedro Cámara	\N
1779	14	7	7	mtmarting03	2026-04-06	MAITE	\N
1802	30	5	5	vpalaciosg06	2026-04-14	CHARLA MALVALUNA	\N
1816	30	7	7	rmvegac01	2026-02-26	DCM Rosa Vega	\N
1828	43	5	5	mafloresm01	2026-03-04	4º ESO (Diversificación) / Inglés	\N
1840	41	7	7	omsanchezg01	2026-03-02	4º diver Olga	\N
1865	42	2	2	efranciscor01	2026-03-05	2APSD	\N
1887	42	6	6	rmvegac01	2026-03-09	DCM	\N
1897	14	1	1	mtcerezog01	2026-03-13	3º atención educativa. Teresa	\N
1910	14	7	7	omsanchezg01	2026-03-11	3º diver Olga	\N
1984	41	7	7	mebravom01	2026-03-13	4º ESO RELI	\N
2005	45	3	3	vpalaciosg06	2026-06-05	1º Bach AE. Virginia	1033
2006	45	3	3	vpalaciosg06	2026-06-12	1º Bach AE. Virginia	1033
2007	45	3	3	vpalaciosg06	2026-06-19	1º Bach AE. Virginia	1033
2163	14	5	5	mtmarting03	2026-03-18	MAITE	1036
2164	14	5	5	mtmarting03	2026-03-25	MAITE	1036
2165	14	5	5	mtmarting03	2026-04-01	MAITE	1036
2166	14	5	5	mtmarting03	2026-04-08	MAITE	1036
2167	14	5	5	mtmarting03	2026-04-15	MAITE	1036
2168	14	5	5	mtmarting03	2026-04-22	MAITE	1036
2169	14	5	5	mtmarting03	2026-04-29	MAITE	1036
2170	14	5	5	mtmarting03	2026-05-06	MAITE	1036
2171	14	5	5	mtmarting03	2026-05-13	MAITE	1036
1409	45	5	5	mahernandezr06	2026-02-13	TyD  2º ESO A Miguel	1032
1410	45	5	5	mahernandezr06	2026-02-20	TyD  2º ESO A Miguel	1032
1411	45	5	5	mahernandezr06	2026-02-27	TyD  2º ESO A Miguel	1032
1412	45	5	5	mahernandezr06	2026-03-06	TyD  2º ESO A Miguel	1032
1413	45	5	5	mahernandezr06	2026-03-13	TyD  2º ESO A Miguel	1032
1414	45	5	5	mahernandezr06	2026-03-20	TyD  2º ESO A Miguel	1032
1415	45	5	5	mahernandezr06	2026-03-27	TyD  2º ESO A Miguel	1032
1416	45	5	5	mahernandezr06	2026-04-03	TyD  2º ESO A Miguel	1032
1417	45	5	5	mahernandezr06	2026-04-10	TyD  2º ESO A Miguel	1032
1418	45	5	5	mahernandezr06	2026-04-17	TyD  2º ESO A Miguel	1032
1419	45	5	5	mahernandezr06	2026-04-24	TyD  2º ESO A Miguel	1032
1420	45	5	5	mahernandezr06	2026-05-01	TyD  2º ESO A Miguel	1032
1421	45	5	5	mahernandezr06	2026-05-08	TyD  2º ESO A Miguel	1032
1422	45	5	5	mahernandezr06	2026-05-15	TyD  2º ESO A Miguel	1032
1423	45	5	5	mahernandezr06	2026-05-22	TyD  2º ESO A Miguel	1032
1424	45	5	5	mahernandezr06	2026-05-29	TyD  2º ESO A Miguel	1032
133029	30	1	14407	emurielb76	2026-05-07	Exposición "Historietas e historias"	\N
1425	45	5	5	mahernandezr06	2026-06-05	TyD  2º ESO A Miguel	1032
1426	45	5	5	mahernandezr06	2026-06-12	TyD  2º ESO A Miguel	1032
1427	45	5	5	mahernandezr06	2026-06-19	TyD  2º ESO A Miguel	1032
1628	30	1	1	dnarcisoc01	2026-02-25	Lola. Examen 2ºGM	\N
1649	42	3	3	omsanchezg01	2026-02-20	3º diver olga	\N
1725	30	5	5	mmhernandezr01	2026-02-24	FOTOS ORLA	\N
1746	14	5	5	mtmarting03	2026-03-16	MAITE	\N
1759	41	3	3	lpcamarac01	2026-02-26	Emprendimiento 2º ESO Luis Pedro Cámara	\N
1780	14	5	5	mtmarting03	2026-04-13	MAITE	\N
1803	22	1	1	mafloresm01	2026-03-17	1º ESO (A) / Inglés	\N
1817	41	6	6	mebravom01	2026-02-26	1º Bach	\N
1829	43	2	2	mafloresm01	2026-03-09	4º ESO (Diversificación) / Inglés	\N
1841	67	6	6	mssalomonp02	2026-03-02	Marisol	\N
1853	41	7	7	bfernandezt07	2026-03-04	FP Básica 1º Blanca TRABAJO TEMA 1	\N
1866	14	6	6	bfernandezt07	2026-03-04	FP básica 2º	\N
1888	42	7	7	rmvegac01	2026-03-09	DCM	\N
1898	42	5	5	pety78	2026-03-10	1º TEI	\N
1911	63	7	7	cjlozanop01	2026-03-12	Filosofía 2º Bach B	1044
1912	63	7	7	cjlozanop01	2026-03-13	Filosofía 2º Bach B	1044
1913	63	7	7	cjlozanop01	2026-03-17	Filosofía 2º Bach B	1044
1914	63	7	7	cjlozanop01	2026-03-19	Filosofía 2º Bach B	1044
1915	63	7	7	cjlozanop01	2026-03-20	Filosofía 2º Bach B	1044
1916	63	7	7	cjlozanop01	2026-03-24	Filosofía 2º Bach B	1044
1917	63	7	7	cjlozanop01	2026-03-26	Filosofía 2º Bach B	1044
1918	63	7	7	cjlozanop01	2026-03-27	Filosofía 2º Bach B	1044
1919	63	7	7	cjlozanop01	2026-03-31	Filosofía 2º Bach B	1044
1428	43	2	2	cblancoa02	2026-02-17	Economía 1º Bach. Cristina Blanco	1037
1429	43	2	2	cblancoa02	2026-02-24	Economía 1º Bach. Cristina Blanco	1037
1430	43	2	2	cblancoa02	2026-03-03	Economía 1º Bach. Cristina Blanco	1037
1431	43	2	2	cblancoa02	2026-03-10	Economía 1º Bach. Cristina Blanco	1037
1432	43	2	2	cblancoa02	2026-03-17	Economía 1º Bach. Cristina Blanco	1037
1433	43	2	2	cblancoa02	2026-03-24	Economía 1º Bach. Cristina Blanco	1037
1434	43	2	2	cblancoa02	2026-03-31	Economía 1º Bach. Cristina Blanco	1037
1435	43	2	2	cblancoa02	2026-04-07	Economía 1º Bach. Cristina Blanco	1037
1436	43	2	2	cblancoa02	2026-04-14	Economía 1º Bach. Cristina Blanco	1037
1437	43	2	2	cblancoa02	2026-04-21	Economía 1º Bach. Cristina Blanco	1037
1438	43	2	2	cblancoa02	2026-04-28	Economía 1º Bach. Cristina Blanco	1037
1439	43	2	2	cblancoa02	2026-05-05	Economía 1º Bach. Cristina Blanco	1037
1441	43	2	2	cblancoa02	2026-05-26	Economía 1º Bach. Cristina Blanco	1037
1442	43	2	2	cblancoa02	2026-06-02	Economía 1º Bach. Cristina Blanco	1037
1443	43	2	2	cblancoa02	2026-06-09	Economía 1º Bach. Cristina Blanco	1037
1444	43	2	2	cblancoa02	2026-06-16	Economía 1º Bach. Cristina Blanco	1037
1629	45	7	7	egonzalezh18	2026-02-20	AE 4º ESO	\N
1650	14	1	1	mtcerezog01	2026-02-20	Atención Educativa. Teresa	\N
1670	14	5	5	bfernandezt07	2026-02-23	FPbásica 2º	\N
1726	43	6	6	celita2	2026-02-26	CELIA 1º ESO	\N
1748	14	5	5	mtmarting03	2026-03-23	MAITE	\N
1760	14	2	2	ilozano1977	2026-02-24	3º ESO Isabel Lozano	\N
1781	14	7	7	mtmarting03	2026-04-13	MAITE	\N
1804	14	6	6	bfernandezt07	2026-02-25	FP básica 2º	\N
1818	41	7	7	mebravom01	2026-02-26	1º ESO	\N
1830	43	5	5	mafloresm01	2026-03-11	4º ESO (Diversificación) / Inglés	\N
1842	42	6	6	bcrespoc01	2026-03-02	ADO	\N
1854	47	6	7	pety78	2026-03-03	2º TAPSD	\N
1867	42	5	5	isabel22	2026-03-04		\N
1889	43	7	7	celita2	2026-03-09	celia 4ºESOA	\N
1899	67	3	3	mtcerezog01	2026-03-11	3º Diver . Teresa	\N
1920	63	7	7	cjlozanop01	2026-04-02	Filosofía 2º Bach B	1044
1921	63	7	7	cjlozanop01	2026-04-03	Filosofía 2º Bach B	1044
1922	63	7	7	cjlozanop01	2026-04-07	Filosofía 2º Bach B	1044
1923	63	7	7	cjlozanop01	2026-04-09	Filosofía 2º Bach B	1044
1924	63	7	7	cjlozanop01	2026-04-10	Filosofía 2º Bach B	1044
1925	63	7	7	cjlozanop01	2026-04-14	Filosofía 2º Bach B	1044
1926	63	7	7	cjlozanop01	2026-04-16	Filosofía 2º Bach B	1044
1927	63	7	7	cjlozanop01	2026-04-17	Filosofía 2º Bach B	1044
1928	63	7	7	cjlozanop01	2026-04-21	Filosofía 2º Bach B	1044
1929	63	7	7	cjlozanop01	2026-04-23	Filosofía 2º Bach B	1044
1930	63	7	7	cjlozanop01	2026-04-24	Filosofía 2º Bach B	1044
1931	63	7	7	cjlozanop01	2026-04-28	Filosofía 2º Bach B	1044
1932	63	7	7	cjlozanop01	2026-04-30	Filosofía 2º Bach B	1044
1933	63	7	7	cjlozanop01	2026-05-01	Filosofía 2º Bach B	1044
1445	41	5	5	mgperezr02	2026-02-13	GRANI - FYOPP	1038
1446	41	5	5	mgperezr02	2026-02-14	GRANI - FYOPP	1038
1447	41	5	5	mgperezr02	2026-02-15	GRANI - FYOPP	1038
1448	41	5	5	mgperezr02	2026-02-16	GRANI - FYOPP	1038
1449	41	5	5	mgperezr02	2026-02-17	GRANI - FYOPP	1038
1450	41	5	5	mgperezr02	2026-02-18	GRANI - FYOPP	1038
1451	41	5	5	mgperezr02	2026-02-19	GRANI - FYOPP	1038
1452	41	5	5	mgperezr02	2026-02-20	GRANI - FYOPP	1038
1453	41	5	5	mgperezr02	2026-02-21	GRANI - FYOPP	1038
1454	41	5	5	mgperezr02	2026-02-22	GRANI - FYOPP	1038
1455	41	5	5	mgperezr02	2026-02-23	GRANI - FYOPP	1038
1456	41	5	5	mgperezr02	2026-02-24	GRANI - FYOPP	1038
1457	41	5	5	mgperezr02	2026-02-25	GRANI - FYOPP	1038
1458	41	5	5	mgperezr02	2026-02-26	GRANI - FYOPP	1038
1459	41	5	5	mgperezr02	2026-02-27	GRANI - FYOPP	1038
1460	41	5	5	mgperezr02	2026-02-28	GRANI - FYOPP	1038
1461	41	5	5	mgperezr02	2026-03-01	GRANI - FYOPP	1038
1462	41	5	5	mgperezr02	2026-03-02	GRANI - FYOPP	1038
1463	41	5	5	mgperezr02	2026-03-03	GRANI - FYOPP	1038
1464	41	5	5	mgperezr02	2026-03-04	GRANI - FYOPP	1038
1465	41	5	5	mgperezr02	2026-03-05	GRANI - FYOPP	1038
1466	41	5	5	mgperezr02	2026-03-06	GRANI - FYOPP	1038
1467	41	5	5	mgperezr02	2026-03-07	GRANI - FYOPP	1038
1468	41	5	5	mgperezr02	2026-03-08	GRANI - FYOPP	1038
1469	41	5	5	mgperezr02	2026-03-09	GRANI - FYOPP	1038
1470	41	5	5	mgperezr02	2026-03-10	GRANI - FYOPP	1038
1471	41	5	5	mgperezr02	2026-03-11	GRANI - FYOPP	1038
1472	41	5	5	mgperezr02	2026-03-12	GRANI - FYOPP	1038
1473	41	5	5	mgperezr02	2026-03-13	GRANI - FYOPP	1038
1474	41	5	5	mgperezr02	2026-03-14	GRANI - FYOPP	1038
1475	41	5	5	mgperezr02	2026-03-15	GRANI - FYOPP	1038
1476	41	5	5	mgperezr02	2026-03-16	GRANI - FYOPP	1038
1477	41	5	5	mgperezr02	2026-03-17	GRANI - FYOPP	1038
1478	41	5	5	mgperezr02	2026-03-18	GRANI - FYOPP	1038
1479	41	5	5	mgperezr02	2026-03-19	GRANI - FYOPP	1038
1480	41	5	5	mgperezr02	2026-03-20	GRANI - FYOPP	1038
1481	41	5	5	mgperezr02	2026-03-21	GRANI - FYOPP	1038
1482	41	5	5	mgperezr02	2026-03-22	GRANI - FYOPP	1038
1483	41	5	5	mgperezr02	2026-03-23	GRANI - FYOPP	1038
1484	41	5	5	mgperezr02	2026-03-24	GRANI - FYOPP	1038
133213	45	1	7	emurielb76	2026-05-11	BLOQUEADO PARA PRUEBA EVAL DIAG 2º ESO	\N
133214	41	1	1447	emurielb76	2026-05-12	BLOQUEADO PARA PRUEBA EVAL DIAG 2º ESO	\N
133215	43	1	1447	emurielb76	2026-05-12	BLOQUEADO PARA PRUEBA EVAL DIAG 2º ESO	\N
1485	41	5	5	mgperezr02	2026-03-25	GRANI - FYOPP	1038
1486	41	5	5	mgperezr02	2026-03-26	GRANI - FYOPP	1038
1487	41	5	5	mgperezr02	2026-03-27	GRANI - FYOPP	1038
1488	41	5	5	mgperezr02	2026-03-28	GRANI - FYOPP	1038
1489	41	5	5	mgperezr02	2026-03-29	GRANI - FYOPP	1038
1490	41	5	5	mgperezr02	2026-03-30	GRANI - FYOPP	1038
1491	41	5	5	mgperezr02	2026-03-31	GRANI - FYOPP	1038
1492	41	5	5	mgperezr02	2026-04-01	GRANI - FYOPP	1038
1493	41	5	5	mgperezr02	2026-04-02	GRANI - FYOPP	1038
1494	41	5	5	mgperezr02	2026-04-03	GRANI - FYOPP	1038
1495	41	5	5	mgperezr02	2026-04-04	GRANI - FYOPP	1038
1496	41	5	5	mgperezr02	2026-04-05	GRANI - FYOPP	1038
1497	41	5	5	mgperezr02	2026-04-06	GRANI - FYOPP	1038
1498	41	5	5	mgperezr02	2026-04-07	GRANI - FYOPP	1038
1499	41	5	5	mgperezr02	2026-04-08	GRANI - FYOPP	1038
1500	41	5	5	mgperezr02	2026-04-09	GRANI - FYOPP	1038
1501	41	5	5	mgperezr02	2026-04-10	GRANI - FYOPP	1038
133232	45	1	7	emurielb76	2026-05-12	BLOQUEADO PARA PRUEBA EVAL DIAG 2º ESO	\N
1502	41	5	5	mgperezr02	2026-04-11	GRANI - FYOPP	1038
1503	41	5	5	mgperezr02	2026-04-12	GRANI - FYOPP	1038
1504	41	5	5	mgperezr02	2026-04-13	GRANI - FYOPP	1038
1505	41	5	5	mgperezr02	2026-04-14	GRANI - FYOPP	1038
1506	41	5	5	mgperezr02	2026-04-15	GRANI - FYOPP	1038
1507	41	5	5	mgperezr02	2026-04-16	GRANI - FYOPP	1038
1508	41	5	5	mgperezr02	2026-04-17	GRANI - FYOPP	1038
1509	41	5	5	mgperezr02	2026-04-18	GRANI - FYOPP	1038
1510	41	5	5	mgperezr02	2026-04-19	GRANI - FYOPP	1038
1511	41	5	5	mgperezr02	2026-04-20	GRANI - FYOPP	1038
1512	41	5	5	mgperezr02	2026-04-21	GRANI - FYOPP	1038
1513	41	5	5	mgperezr02	2026-04-22	GRANI - FYOPP	1038
1514	41	5	5	mgperezr02	2026-04-23	GRANI - FYOPP	1038
1515	41	5	5	mgperezr02	2026-04-24	GRANI - FYOPP	1038
1516	41	5	5	mgperezr02	2026-04-25	GRANI - FYOPP	1038
1517	41	5	5	mgperezr02	2026-04-26	GRANI - FYOPP	1038
1518	41	5	5	mgperezr02	2026-04-27	GRANI - FYOPP	1038
1519	41	5	5	mgperezr02	2026-04-28	GRANI - FYOPP	1038
1520	41	5	5	mgperezr02	2026-04-29	GRANI - FYOPP	1038
1521	41	5	5	mgperezr02	2026-04-30	GRANI - FYOPP	1038
1522	41	5	5	mgperezr02	2026-05-01	GRANI - FYOPP	1038
1523	41	5	5	mgperezr02	2026-05-02	GRANI - FYOPP	1038
1524	41	5	5	mgperezr02	2026-05-03	GRANI - FYOPP	1038
1525	41	5	5	mgperezr02	2026-05-04	GRANI - FYOPP	1038
1526	41	5	5	mgperezr02	2026-05-05	GRANI - FYOPP	1038
1527	41	5	5	mgperezr02	2026-05-06	GRANI - FYOPP	1038
1528	41	5	5	mgperezr02	2026-05-07	GRANI - FYOPP	1038
1529	41	5	5	mgperezr02	2026-05-08	GRANI - FYOPP	1038
1530	41	5	5	mgperezr02	2026-05-09	GRANI - FYOPP	1038
1531	41	5	5	mgperezr02	2026-05-10	GRANI - FYOPP	1038
1533	41	5	5	mgperezr02	2026-05-13	GRANI - FYOPP	1038
1534	41	5	5	mgperezr02	2026-05-14	GRANI - FYOPP	1038
1535	41	5	5	mgperezr02	2026-05-15	GRANI - FYOPP	1038
1536	41	5	5	mgperezr02	2026-05-16	GRANI - FYOPP	1038
1537	41	5	5	mgperezr02	2026-05-17	GRANI - FYOPP	1038
1540	41	5	5	mgperezr02	2026-05-21	GRANI - FYOPP	1038
1541	41	5	5	mgperezr02	2026-05-22	GRANI - FYOPP	1038
1542	41	5	5	mgperezr02	2026-05-23	GRANI - FYOPP	1038
1543	41	5	5	mgperezr02	2026-05-24	GRANI - FYOPP	1038
1544	41	5	5	mgperezr02	2026-05-25	GRANI - FYOPP	1038
1545	41	5	5	mgperezr02	2026-05-26	GRANI - FYOPP	1038
133298	43	1	2887	emurielb76	2026-05-20	BLOQUEADO PARA PRUEBA EVAL DIAG 2º ESO	\N
133300	45	1	2887	emurielb76	2026-05-20	BLOQUEADO PARA PRUEBA EVAL DIAG 2º ESO	\N
133301	41	1	2887	emurielb76	2026-05-20	BLOQUEADO PARA PRUEBA EVAL DIAG 2º ESO	\N
1546	41	5	5	mgperezr02	2026-05-27	GRANI - FYOPP	1038
1547	41	5	5	mgperezr02	2026-05-28	GRANI - FYOPP	1038
1548	41	5	5	mgperezr02	2026-05-29	GRANI - FYOPP	1038
1549	41	5	5	mgperezr02	2026-05-30	GRANI - FYOPP	1038
1550	41	5	5	mgperezr02	2026-05-31	GRANI - FYOPP	1038
1551	41	5	5	mgperezr02	2026-06-01	GRANI - FYOPP	1038
1552	41	5	5	mgperezr02	2026-06-02	GRANI - FYOPP	1038
1553	41	5	5	mgperezr02	2026-06-03	GRANI - FYOPP	1038
1554	41	5	5	mgperezr02	2026-06-04	GRANI - FYOPP	1038
1555	41	5	5	mgperezr02	2026-06-05	GRANI - FYOPP	1038
1556	41	5	5	mgperezr02	2026-06-06	GRANI - FYOPP	1038
1557	41	5	5	mgperezr02	2026-06-07	GRANI - FYOPP	1038
1558	41	5	5	mgperezr02	2026-06-08	GRANI - FYOPP	1038
1559	41	5	5	mgperezr02	2026-06-09	GRANI - FYOPP	1038
1560	41	5	5	mgperezr02	2026-06-10	GRANI - FYOPP	1038
1561	41	5	5	mgperezr02	2026-06-11	GRANI - FYOPP	1038
1562	41	5	5	mgperezr02	2026-06-12	GRANI - FYOPP	1038
1563	41	5	5	mgperezr02	2026-06-13	GRANI - FYOPP	1038
1564	41	5	5	mgperezr02	2026-06-14	GRANI - FYOPP	1038
1565	41	5	5	mgperezr02	2026-06-15	GRANI - FYOPP	1038
1566	41	5	5	mgperezr02	2026-06-16	GRANI - FYOPP	1038
1567	41	5	5	mgperezr02	2026-06-17	GRANI - FYOPP	1038
1568	41	5	5	mgperezr02	2026-06-18	GRANI - FYOPP	1038
1569	41	5	5	mgperezr02	2026-06-19	GRANI - FYOPP	1038
1570	41	5	5	mgperezr02	2026-06-20	GRANI - FYOPP	1038
1571	41	5	5	mgperezr02	2026-06-21	GRANI - FYOPP	1038
1572	41	5	5	mgperezr02	2026-06-22	GRANI - FYOPP	1038
1573	41	5	5	mgperezr02	2026-06-23	GRANI - FYOPP	1038
1574	41	5	5	mgperezr02	2026-06-24	GRANI - FYOPP	1038
1575	41	5	5	mgperezr02	2026-06-25	GRANI - FYOPP	1038
1576	41	5	5	mgperezr02	2026-06-26	GRANI - FYOPP	1038
1577	41	5	5	mgperezr02	2026-06-27	GRANI - FYOPP	1038
1578	41	5	5	mgperezr02	2026-06-28	GRANI - FYOPP	1038
1579	41	5	5	mgperezr02	2026-06-29	GRANI - FYOPP	1038
1580	41	5	5	mgperezr02	2026-06-30	GRANI - FYOPP	1038
1630	42	1	1	dnarcisoc01	2026-02-19	Lola.TLA	\N
1651	67	7	7	mtcerezog01	2026-02-20	Teresa.3º Diver	\N
1671	30	7	7	emurielb76	2026-02-20	ROSA VEGA	\N
1727	67	3	3	omsanchezg01	2026-02-23	Apoyo mates 1º Eso	\N
1749	14	7	7	mtmarting03	2026-03-23	MAITE	\N
1761	14	5	5	omsanchezg01	2026-02-24	Olga 3º diver	\N
1782	14	5	5	mtmarting03	2026-04-20	MAITE	\N
1805	67	7	7	mtcerezog01	2026-02-25	4º Diver. Teresa	\N
1819	41	7	7	mebravom01	2026-02-27	4º ESO	\N
1831	47	2	2	mafloresm01	2026-03-06	4º ESO (A) / Inglés	\N
1843	41	7	7	omsanchezg01	2026-03-03	4º diver  Olga	\N
1855	42	5	5	pety78	2026-03-03	1º TEI	\N
1868	45	6	6	ilozano1977	2026-03-06	Isabel Lozano 3º ESO	\N
1900	14	5	5	omsanchezg01	2026-03-10	3º diver Olga	\N
1934	63	7	7	cjlozanop01	2026-05-05	Filosofía 2º Bach B	1044
1935	63	7	7	cjlozanop01	2026-05-07	Filosofía 2º Bach B	1044
1936	63	7	7	cjlozanop01	2026-05-08	Filosofía 2º Bach B	1044
1937	63	7	7	cjlozanop01	2026-05-12	Filosofía 2º Bach B	1044
1938	63	7	7	cjlozanop01	2026-05-14	Filosofía 2º Bach B	1044
1939	63	7	7	cjlozanop01	2026-05-15	Filosofía 2º Bach B	1044
1940	63	7	7	cjlozanop01	2026-05-19	Filosofía 2º Bach B	1044
1941	63	7	7	cjlozanop01	2026-05-21	Filosofía 2º Bach B	1044
1942	63	7	7	cjlozanop01	2026-05-22	Filosofía 2º Bach B	1044
1943	63	7	7	cjlozanop01	2026-05-26	Filosofía 2º Bach B	1044
1944	63	7	7	cjlozanop01	2026-05-28	Filosofía 2º Bach B	1044
1945	63	7	7	cjlozanop01	2026-05-29	Filosofía 2º Bach B	1044
1946	63	7	7	cjlozanop01	2026-06-02	Filosofía 2º Bach B	1044
1947	63	7	7	cjlozanop01	2026-06-04	Filosofía 2º Bach B	1044
1948	63	7	7	cjlozanop01	2026-06-05	Filosofía 2º Bach B	1044
1949	63	7	7	cjlozanop01	2026-06-09	Filosofía 2º Bach B	1044
1581	41	6	6	mgperezr02	2026-02-18	GRANI - FYOPP	1041
1582	41	6	6	mgperezr02	2026-02-25	GRANI - FYOPP	1041
1583	41	6	6	mgperezr02	2026-03-04	GRANI - FYOPP	1041
1584	41	6	6	mgperezr02	2026-03-11	GRANI - FYOPP	1041
1585	41	6	6	mgperezr02	2026-03-18	GRANI - FYOPP	1041
1586	41	6	6	mgperezr02	2026-03-25	GRANI - FYOPP	1041
1587	41	6	6	mgperezr02	2026-04-01	GRANI - FYOPP	1041
1588	41	6	6	mgperezr02	2026-04-08	GRANI - FYOPP	1041
1589	41	6	6	mgperezr02	2026-04-15	GRANI - FYOPP	1041
1590	41	6	6	mgperezr02	2026-04-22	GRANI - FYOPP	1041
1591	41	6	6	mgperezr02	2026-04-29	GRANI - FYOPP	1041
1592	41	6	6	mgperezr02	2026-05-06	GRANI - FYOPP	1041
1593	41	6	6	mgperezr02	2026-05-13	GRANI - FYOPP	1041
1594	41	6	6	mgperezr02	2026-05-27	GRANI - FYOPP	1041
1595	41	6	6	mgperezr02	2026-06-03	GRANI - FYOPP	1041
1596	41	6	6	mgperezr02	2026-06-10	GRANI - FYOPP	1041
1597	41	6	6	mgperezr02	2026-06-17	GRANI - FYOPP	1041
1598	41	6	6	mgperezr02	2026-06-24	GRANI - FYOPP	1041
1631	43	3	3	amfajardol01	2026-02-20	Alba Biología	\N
1652	45	1	7	emurielb76	2026-05-19	Evaluación de Diagnóstico 2º ESO	\N
1672	67	6	6	ndelorzac02	2026-02-19		\N
1750	14	1	1	mtmarting03	2026-02-25	MAITE	\N
1762	41	2	2	afloresc27	2026-03-03	EF- AnaFlores	\N
1783	14	7	7	mtmarting03	2026-04-20	MAITE	\N
1785	14	7	7	mtmarting03	2026-04-27	MAITE	\N
1806	14	3	3	mafloresm01	2026-02-26	4º ESO (Diversificación) / Inglés	\N
1820	41	3	3	mebravom01	2026-02-27	1º Bach	\N
1832	47	7	7	egonzalezh18	2026-02-27	AE 4º ESO B 	\N
1844	14	5	5	omsanchezg01	2026-03-03	3º diver Olga	\N
1856	47	5	5	celita2	2026-03-03	biología 1º ESO	\N
1901	67	6	6	omsanchezg01	2026-03-10	4º diver Olga	\N
1950	63	7	7	cjlozanop01	2026-06-11	Filosofía 2º Bach B	1044
1951	63	7	7	cjlozanop01	2026-06-12	Filosofía 2º Bach B	1044
1952	63	7	7	cjlozanop01	2026-06-16	Filosofía 2º Bach B	1044
1953	63	7	7	cjlozanop01	2026-06-18	Filosofía 2º Bach B	1044
1954	63	7	7	cjlozanop01	2026-06-19	Filosofía 2º Bach B	1044
1955	63	7	7	cjlozanop01	2026-06-23	Filosofía 2º Bach B	1044
1956	63	7	7	cjlozanop01	2026-06-25	Filosofía 2º Bach B	1044
1957	63	7	7	cjlozanop01	2026-06-26	Filosofía 2º Bach B	1044
1958	63	7	7	cjlozanop01	2026-06-30	Filosofía 2º Bach B	1044
2008	30	6	6	dnarcisoc01	2026-03-13	Reserva para ROSA, examen. 	\N
2009	42	7	7	dnarcisoc01	2026-03-16	Lola. APC	\N
2172	14	5	5	mtmarting03	2026-05-20	MAITE	1036
2173	14	5	5	mtmarting03	2026-05-27	MAITE	1036
2174	14	5	5	mtmarting03	2026-06-03	MAITE	1036
2175	14	5	5	mtmarting03	2026-06-10	MAITE	1036
2176	14	5	5	mtmarting03	2026-06-17	MAITE	1036
2231	22	4	4	mji3003	2026-03-23	Atendida por Inma	996
2232	22	4	4	mji3003	2026-03-30	Atendida por Inma	996
2233	22	4	4	mji3003	2026-04-06	Atendida por Inma	996
2234	22	4	4	mji3003	2026-04-13	Atendida por Inma	996
2235	22	4	4	mji3003	2026-04-20	Atendida por Inma	996
2236	22	4	4	mji3003	2026-04-27	Atendida por Inma	996
2237	22	4	4	mji3003	2026-05-04	Atendida por Inma	996
2238	22	4	4	mji3003	2026-05-11	Atendida por Inma	996
2239	22	4	4	mji3003	2026-05-18	Atendida por Inma	996
2240	22	4	4	mji3003	2026-05-25	Atendida por Inma	996
2241	22	4	4	mji3003	2026-06-01	Atendida por Inma	996
2242	22	4	4	mji3003	2026-06-08	Atendida por Inma	996
2243	22	4	4	mji3003	2026-06-15	Atendida por Inma	996
2295	41	2	2	ilozano1977	2026-03-18	1 Bach Isabel Lozano	\N
2306	22	6	6	mapavonb01	2026-03-18		\N
2318	43	2	2	ilozano1977	2026-03-19	Isabel 2º bach	\N
2337	14	6	6	dmatasr01	2026-03-20	Tecnología 4ºB	\N
2361	42	3	5	pety78	2026-03-24	1º TEI	\N
1599	67	1	1	mtcerezog01	2026-02-13	Teresa. 3º Atención Educativa	\N
1600	67	2	2	omsanchezg01	2026-02-13	OLGA 3º DIVER	\N
1601	42	2	3	pety78	2026-02-13	Pety	\N
1602	67	3	3	omsanchezg01	2026-02-13	OLGA 3º DIVER	\N
1603	43	6	6	ilozano1977	2026-02-13	Isabel Lozano 3º ESO	\N
1604	67	6	6	omsanchezg01	2026-02-13	OLGA 4º DIVER	\N
1605	41	6	6	omsanchezg01	2026-02-13	OLGA 4º DIVER	\N
1606	41	3	3	lpcamarac01	2026-02-19	2º ESO Luis Pedro Cámara	\N
1607	14	5	5	mrcarmonav01	2026-02-20	Remedios Carmona Vinagre	\N
1608	30	6	6	emurielb76	2026-02-23	2º ESO A y B Proyecto Hombre (3ª sesión)	\N
1632	45	6	6	ilozano1977	2026-02-20	3ºESO Isabel Lozano	\N
1653	43	1	7	emurielb76	2026-05-19	Evaluación de Diagnóstico 2º ESO	\N
1673	67	7	7	ndelorzac02	2026-02-19		\N
1729	45	7	7	efranciscor01	2026-03-11	Estela	\N
1763	45	3	3	ilozano1977	2026-02-26	Isabel Lozano 2ºESO	\N
1784	14	5	5	mtmarting03	2026-04-27	MAITE	\N
1807	14	3	3	mafloresm01	2026-03-05	4º ESO (Diversificación) / Inglés	\N
1857	67	5	5	mafloresm01	2026-03-03	1º FPB / Inglés	\N
1902	67	5	5	jjmorcillor01	2026-03-10	Juanjo Latín	\N
1959	67	5	5	nmaciasp02	2026-03-11	NOELIA	\N
1969	8	1	7	emurielb76	2026-03-12	1º CFGB por avería en su aula	\N
2010	45	7	7	emparrag02	2026-03-20	2º ESO B Lengua	\N
2177	63	3	3	bpconejero78	2026-03-19	Refuerzo Mates 2º ESO A/B INFORM.	968
2178	63	3	3	bpconejero78	2026-03-26	Refuerzo Mates 2º ESO A/B INFORM.	968
2179	63	3	3	bpconejero78	2026-04-02	Refuerzo Mates 2º ESO A/B INFORM.	968
2180	63	3	3	bpconejero78	2026-04-09	Refuerzo Mates 2º ESO A/B INFORM.	968
2181	63	3	3	bpconejero78	2026-04-16	Refuerzo Mates 2º ESO A/B INFORM.	968
2182	63	3	3	bpconejero78	2026-04-23	Refuerzo Mates 2º ESO A/B INFORM.	968
2183	63	3	3	bpconejero78	2026-04-30	Refuerzo Mates 2º ESO A/B INFORM.	968
2184	63	3	3	bpconejero78	2026-05-07	Refuerzo Mates 2º ESO A/B INFORM.	968
2185	63	3	3	bpconejero78	2026-05-14	Refuerzo Mates 2º ESO A/B INFORM.	968
2186	63	3	3	bpconejero78	2026-05-21	Refuerzo Mates 2º ESO A/B INFORM.	968
2187	63	3	3	bpconejero78	2026-05-28	Refuerzo Mates 2º ESO A/B INFORM.	968
2188	63	3	3	bpconejero78	2026-06-04	Refuerzo Mates 2º ESO A/B INFORM.	968
2189	63	3	3	bpconejero78	2026-06-11	Refuerzo Mates 2º ESO A/B INFORM.	968
2190	63	3	3	bpconejero78	2026-06-18	Refuerzo Mates 2º ESO A/B INFORM.	968
2244	22	4	4	pagarciam27	2026-03-18	Atendida por Patricia	999
2245	22	4	4	pagarciam27	2026-03-19	Atendida por Patricia	999
2246	22	4	4	pagarciam27	2026-03-25	Atendida por Patricia	999
2247	22	4	4	pagarciam27	2026-03-26	Atendida por Patricia	999
2248	22	4	4	pagarciam27	2026-04-01	Atendida por Patricia	999
2249	22	4	4	pagarciam27	2026-04-02	Atendida por Patricia	999
2250	22	4	4	pagarciam27	2026-04-08	Atendida por Patricia	999
2251	22	4	4	pagarciam27	2026-04-09	Atendida por Patricia	999
2252	22	4	4	pagarciam27	2026-04-15	Atendida por Patricia	999
2253	22	4	4	pagarciam27	2026-04-16	Atendida por Patricia	999
2254	22	4	4	pagarciam27	2026-04-22	Atendida por Patricia	999
2255	22	4	4	pagarciam27	2026-04-23	Atendida por Patricia	999
2256	22	4	4	pagarciam27	2026-04-29	Atendida por Patricia	999
2257	22	4	4	pagarciam27	2026-04-30	Atendida por Patricia	999
2258	22	4	4	pagarciam27	2026-05-06	Atendida por Patricia	999
2259	22	4	4	pagarciam27	2026-05-07	Atendida por Patricia	999
2260	22	4	4	pagarciam27	2026-05-13	Atendida por Patricia	999
2261	22	4	4	pagarciam27	2026-05-14	Atendida por Patricia	999
2262	22	4	4	pagarciam27	2026-05-20	Atendida por Patricia	999
2263	22	4	4	pagarciam27	2026-05-21	Atendida por Patricia	999
2264	22	4	4	pagarciam27	2026-05-27	Atendida por Patricia	999
2265	22	4	4	pagarciam27	2026-05-28	Atendida por Patricia	999
2266	22	4	4	pagarciam27	2026-06-03	Atendida por Patricia	999
2267	22	4	4	pagarciam27	2026-06-04	Atendida por Patricia	999
2268	22	4	4	pagarciam27	2026-06-10	Atendida por Patricia	999
2269	22	4	4	pagarciam27	2026-06-11	Atendida por Patricia	999
2270	22	4	4	pagarciam27	2026-06-17	Atendida por Patricia	999
2271	22	4	4	pagarciam27	2026-06-18	Atendida por Patricia	999
2296	41	2	2	egonzalezh18	2026-03-23	1º ESO Bilingüe	\N
2307	22	7	7	mapavonb01	2026-03-18		\N
2319	41	3	3	ilozano1977	2026-03-19	Isabel 2 ESO	\N
2338	14	7	7	vpalaciosg06	2026-03-20	4º Diver	\N
2348	45	1	1	rencinasr02	2026-03-24	1º ESO "B"   Raquel Encinas	\N
2362	14	5	5	ndelorzac02	2026-03-24	G m Dependencia	\N
1633	14	7	7	omsanchezg01	2026-02-18	3º diver  Olga	\N
1654	41	1	7	emurielb76	2026-05-19	Evaluación de Diagnóstico 2º ESO	\N
1674	45	7	7	mahernandezr06	2026-06-22	TyD 2º ESO B	1042
1675	45	7	7	mahernandezr06	2026-06-25	TyD 2º ESO B	1042
1676	45	7	7	mahernandezr06	2026-06-29	TyD 2º ESO B	1042
2297	43	2	2	egonzalezh18	2026-03-25	1 ESO A-B Bilingüe 	\N
1609	30	1	1	emurielb76	2026-03-03	2º ESO 8M	\N
1730	42	2	2	efranciscor01	2026-03-12	Estela	\N
1764	30	6	6	amfajardol01	2026-02-27	ALBA examen PAUX GM	\N
1786	45	6	6	mtmarting03	2026-04-07	MAITE	\N
1787	45	6	6	mtmarting03	2026-04-14	MAITE	\N
1808	14	5	5	mrcarmonav01	2026-03-06	3ºDiver Inglés	\N
1960	30	4	4	emurielb76	2026-03-13	SSC reunión adaptación horarios	\N
1970	67	2	2	rencinasr02	2026-03-12		\N
2011	43	6	6	ilozano1977	2026-03-17	Isabel Lozano 2º ESO	\N
2191	63	2	2	rencinasr02	2026-03-19	Raquel apoyo	1039
2192	63	2	2	rencinasr02	2026-03-26	Raquel apoyo	1039
2193	63	2	2	rencinasr02	2026-04-02	Raquel apoyo	1039
2194	63	2	2	rencinasr02	2026-04-09	Raquel apoyo	1039
2195	63	2	2	rencinasr02	2026-04-16	Raquel apoyo	1039
2196	63	2	2	rencinasr02	2026-04-23	Raquel apoyo	1039
2197	63	2	2	rencinasr02	2026-04-30	Raquel apoyo	1039
2198	63	2	2	rencinasr02	2026-05-07	Raquel apoyo	1039
2199	63	2	2	rencinasr02	2026-05-14	Raquel apoyo	1039
2200	63	2	2	rencinasr02	2026-05-21	Raquel apoyo	1039
2201	63	2	2	rencinasr02	2026-05-28	Raquel apoyo	1039
2202	63	2	2	rencinasr02	2026-06-04	Raquel apoyo	1039
2203	63	2	2	rencinasr02	2026-06-11	Raquel apoyo	1039
2204	63	2	2	rencinasr02	2026-06-18	Raquel apoyo	1039
2205	63	2	2	rencinasr02	2026-06-25	Raquel apoyo	1039
2272	22	4	4	mji3003	2026-03-27	Atendida por Inma	1045
2273	22	4	4	mji3003	2026-04-03	Atendida por Inma	1045
2274	22	4	4	mji3003	2026-04-10	Atendida por Inma	1045
2275	22	4	4	mji3003	2026-04-17	Atendida por Inma	1045
2276	22	4	4	mji3003	2026-04-24	Atendida por Inma	1045
2277	22	4	4	mji3003	2026-05-01	Atendida por Inma	1045
2278	22	4	4	mji3003	2026-05-08	Atendida por Inma	1045
2279	22	4	4	mji3003	2026-05-15	Atendida por Inma	1045
2280	22	4	4	mji3003	2026-05-22	Atendida por Inma	1045
2281	22	4	4	mji3003	2026-05-29	Atendida por Inma	1045
2282	22	4	4	mji3003	2026-06-05	Atendida por Inma	1045
2283	22	4	4	mji3003	2026-06-12	Atendida por Inma	1045
2284	22	4	4	mji3003	2026-06-19	Atendida por Inma	1045
2285	22	4	4	mji3003	2026-06-26	Atendida por Inma	1045
2308	8	7	7	ndelorzac02	2026-03-18		\N
2320	45	6	6	lpcamarac01	2026-03-20	1º ESO A. Luis Pedro Cámara	\N
2349	14	6	6	mrcarmonav01	2026-03-25	3 Diver	\N
2363	45	3	3	ilozano1977	2026-03-26	yincana 2º ESO	\N
1634	67	5	5	omsanchezg01	2026-02-18	Olga 1ºeso apoyo	\N
1655	43	1	7	emurielb76	2026-05-11	Prueba Evaluación de Diagnóstico 2º ESO	\N
1677	45	6	6	mahernandezr06	2026-06-24	 Digitalización 4º ESO A/B	1043
1765	30	7	7	amfajardol01	2026-02-27	ALBA examen PAUX	\N
1788	45	6	6	mtmarting03	2026-04-21	MAITE	\N
1961	14	5	5	omsanchezg01	2026-03-12	Olga 3º Diver	\N
1971	45	3	3	sromang06	2026-03-25	3ª ESO A y B (Gynkana)	\N
2012	8	3	3	lpcamarac01	2026-03-16	Refuerzo Lengua 1º ESO A/B Maribel	960
2013	8	3	3	lpcamarac01	2026-03-23	Refuerzo Lengua 1º ESO A/B Maribel	960
2014	8	3	3	lpcamarac01	2026-03-30	Refuerzo Lengua 1º ESO A/B Maribel	960
2015	8	3	3	lpcamarac01	2026-04-06	Refuerzo Lengua 1º ESO A/B Maribel	960
2016	8	3	3	lpcamarac01	2026-04-13	Refuerzo Lengua 1º ESO A/B Maribel	960
2017	8	3	3	lpcamarac01	2026-04-20	Refuerzo Lengua 1º ESO A/B Maribel	960
2018	8	3	3	lpcamarac01	2026-04-27	Refuerzo Lengua 1º ESO A/B Maribel	960
2019	8	3	3	lpcamarac01	2026-05-04	Refuerzo Lengua 1º ESO A/B Maribel	960
2020	8	3	3	lpcamarac01	2026-05-11	Refuerzo Lengua 1º ESO A/B Maribel	960
2021	8	3	3	lpcamarac01	2026-05-18	Refuerzo Lengua 1º ESO A/B Maribel	960
2022	8	3	3	lpcamarac01	2026-05-25	Refuerzo Lengua 1º ESO A/B Maribel	960
2023	8	3	3	lpcamarac01	2026-06-01	Refuerzo Lengua 1º ESO A/B Maribel	960
2024	8	3	3	lpcamarac01	2026-06-08	Refuerzo Lengua 1º ESO A/B Maribel	960
2025	8	3	3	lpcamarac01	2026-06-15	Refuerzo Lengua 1º ESO A/B Maribel	960
2206	42	1	1	igomezc12	2026-03-17		\N
2210	43	3	3	lpcamarac01	2026-03-17	1º ESO -B. Luis Pedro Cámara	\N
2286	41	1	1	lpcamarac01	2026-03-18	1º ESO - A. Luis Pedro Cámara	\N
2287	14	3	3	mtcerezog01	2026-03-18	3º Diver . Teresa	\N
2298	41	3	3	egonzalezh18	2026-03-27	1º ESO A-B Bilingüe 	\N
2321	41	7	7	dmatasr01	2026-03-19	Tutoría 3ºB	\N
2329	30	3	4	mssalomonp02	2026-03-20	Marisol	\N
2339	43	2	2	mafloresm01	2026-03-23	4º ESO (Diversificación) / Inglés	\N
2350	14	5	5	mrcarmonav01	2026-03-27	3Diver Reme	\N
2353	43	6	6	lpcamarac01	2026-03-24	2º ESO - Luis Pedro Cámara	\N
2364	67	5	5	pety78	2026-03-24	GM Atención a personas en situación de dependencia	\N
1635	42	5	5	bcrespoc01	2026-02-18	ADO 2ºGM	\N
1656	41	1	7	emurielb76	2026-05-11	Prueba Evaluación de Diagnóstico 2º ESO	\N
1678	45	7	7	mahernandezr06	2026-02-19	TyD 2º ESO B Miguel	1028
1679	45	7	7	mahernandezr06	2026-02-23	TyD 2º ESO B Miguel	1028
1680	45	7	7	mahernandezr06	2026-02-26	TyD 2º ESO B Miguel	1028
1681	45	7	7	mahernandezr06	2026-03-02	TyD 2º ESO B Miguel	1028
1682	45	7	7	mahernandezr06	2026-03-05	TyD 2º ESO B Miguel	1028
1683	45	7	7	mahernandezr06	2026-03-09	TyD 2º ESO B Miguel	1028
1684	45	7	7	mahernandezr06	2026-03-12	TyD 2º ESO B Miguel	1028
1685	45	7	7	mahernandezr06	2026-03-16	TyD 2º ESO B Miguel	1028
1686	45	7	7	mahernandezr06	2026-03-19	TyD 2º ESO B Miguel	1028
1687	45	7	7	mahernandezr06	2026-03-23	TyD 2º ESO B Miguel	1028
1688	45	7	7	mahernandezr06	2026-03-26	TyD 2º ESO B Miguel	1028
133688	30	1	1	emurielb76	2026-06-17	GRADUACIÓN 4º ESO Y CFGB	\N
1689	45	7	7	mahernandezr06	2026-03-30	TyD 2º ESO B Miguel	1028
1690	45	7	7	mahernandezr06	2026-04-02	TyD 2º ESO B Miguel	1028
1691	45	7	7	mahernandezr06	2026-04-06	TyD 2º ESO B Miguel	1028
1692	45	7	7	mahernandezr06	2026-04-09	TyD 2º ESO B Miguel	1028
1693	45	7	7	mahernandezr06	2026-04-13	TyD 2º ESO B Miguel	1028
1694	45	7	7	mahernandezr06	2026-04-16	TyD 2º ESO B Miguel	1028
1695	45	7	7	mahernandezr06	2026-04-20	TyD 2º ESO B Miguel	1028
1696	45	7	7	mahernandezr06	2026-04-23	TyD 2º ESO B Miguel	1028
1697	45	7	7	mahernandezr06	2026-04-27	TyD 2º ESO B Miguel	1028
1698	45	7	7	mahernandezr06	2026-04-30	TyD 2º ESO B Miguel	1028
1699	45	7	7	mahernandezr06	2026-05-04	TyD 2º ESO B Miguel	1028
1700	45	7	7	mahernandezr06	2026-05-07	TyD 2º ESO B Miguel	1028
1701	45	7	7	mahernandezr06	2026-05-14	TyD 2º ESO B Miguel	1028
1702	45	7	7	mahernandezr06	2026-05-21	TyD 2º ESO B Miguel	1028
1703	45	7	7	mahernandezr06	2026-05-25	TyD 2º ESO B Miguel	1028
1704	45	7	7	mahernandezr06	2026-05-28	TyD 2º ESO B Miguel	1028
1705	45	7	7	mahernandezr06	2026-06-01	TyD 2º ESO B Miguel	1028
1706	45	7	7	mahernandezr06	2026-06-04	TyD 2º ESO B Miguel	1028
1707	45	7	7	mahernandezr06	2026-06-08	TyD 2º ESO B Miguel	1028
1708	45	7	7	mahernandezr06	2026-06-11	TyD 2º ESO B Miguel	1028
1709	45	7	7	mahernandezr06	2026-06-15	TyD 2º ESO B Miguel	1028
1710	45	7	7	mahernandezr06	2026-06-18	TyD 2º ESO B Miguel	1028
1732	41	3	3	efranciscor01	2026-03-09	Estela	\N
1766	30	5	5	amfajardol01	2026-03-03	ALBA examen AH GM	\N
1789	45	6	6	mtmarting03	2026-04-28	MAITE	\N
133727	30	1	1	emurielb76	2026-06-19	GRADUACIÓN BACHILLERATO Y CICLOS	\N
1962	42	6	6	dnarcisoc01	2026-03-12	lola	\N
1972	43	1	1	sromang06	2026-03-18	2º B física y química	\N
2026	45	2	2	bpconejero78	2026-03-16	Intel. Artif. 1º Bach. Miguel	1022
2027	45	2	2	bpconejero78	2026-03-18	Intel. Artif. 1º Bach. Miguel	1022
2028	45	2	2	bpconejero78	2026-03-23	Intel. Artif. 1º Bach. Miguel	1022
2029	45	2	2	bpconejero78	2026-03-25	Intel. Artif. 1º Bach. Miguel	1022
2030	45	2	2	bpconejero78	2026-03-30	Intel. Artif. 1º Bach. Miguel	1022
2031	45	2	2	bpconejero78	2026-04-01	Intel. Artif. 1º Bach. Miguel	1022
2032	45	2	2	bpconejero78	2026-04-06	Intel. Artif. 1º Bach. Miguel	1022
2033	45	2	2	bpconejero78	2026-04-08	Intel. Artif. 1º Bach. Miguel	1022
2034	45	2	2	bpconejero78	2026-04-13	Intel. Artif. 1º Bach. Miguel	1022
2035	45	2	2	bpconejero78	2026-04-15	Intel. Artif. 1º Bach. Miguel	1022
2036	45	2	2	bpconejero78	2026-04-20	Intel. Artif. 1º Bach. Miguel	1022
2037	45	2	2	bpconejero78	2026-04-22	Intel. Artif. 1º Bach. Miguel	1022
2038	45	2	2	bpconejero78	2026-04-27	Intel. Artif. 1º Bach. Miguel	1022
2039	45	2	2	bpconejero78	2026-04-29	Intel. Artif. 1º Bach. Miguel	1022
2040	45	2	2	bpconejero78	2026-05-04	Intel. Artif. 1º Bach. Miguel	1022
2041	45	2	2	bpconejero78	2026-05-06	Intel. Artif. 1º Bach. Miguel	1022
2042	45	2	2	bpconejero78	2026-05-13	Intel. Artif. 1º Bach. Miguel	1022
2043	45	2	2	bpconejero78	2026-05-25	Intel. Artif. 1º Bach. Miguel	1022
2044	45	2	2	bpconejero78	2026-05-27	Intel. Artif. 1º Bach. Miguel	1022
2045	45	2	2	bpconejero78	2026-06-01	Intel. Artif. 1º Bach. Miguel	1022
2046	45	2	2	bpconejero78	2026-06-03	Intel. Artif. 1º Bach. Miguel	1022
2047	45	2	2	bpconejero78	2026-06-08	Intel. Artif. 1º Bach. Miguel	1022
2048	45	2	2	bpconejero78	2026-06-10	Intel. Artif. 1º Bach. Miguel	1022
2049	45	2	2	bpconejero78	2026-06-15	Intel. Artif. 1º Bach. Miguel	1022
147	55	6	6	cblancoa02	2026-02-13	Economía 4º ESO Cristina Blanco	1018
148	55	6	6	cblancoa02	2026-02-16	Economía 4º ESO Cristina Blanco	1018
149	55	6	6	cblancoa02	2026-02-20	Economía 4º ESO Cristina Blanco	1018
150	55	6	6	cblancoa02	2026-02-23	Economía 4º ESO Cristina Blanco	1018
151	55	6	6	cblancoa02	2026-02-27	Economía 4º ESO Cristina Blanco	1018
152	55	6	6	cblancoa02	2026-03-02	Economía 4º ESO Cristina Blanco	1018
153	55	6	6	cblancoa02	2026-03-06	Economía 4º ESO Cristina Blanco	1018
154	55	6	6	cblancoa02	2026-03-09	Economía 4º ESO Cristina Blanco	1018
155	55	6	6	cblancoa02	2026-03-13	Economía 4º ESO Cristina Blanco	1018
156	55	6	6	cblancoa02	2026-03-16	Economía 4º ESO Cristina Blanco	1018
157	55	6	6	cblancoa02	2026-03-20	Economía 4º ESO Cristina Blanco	1018
158	55	6	6	cblancoa02	2026-03-23	Economía 4º ESO Cristina Blanco	1018
159	55	6	6	cblancoa02	2026-03-27	Economía 4º ESO Cristina Blanco	1018
160	55	6	6	cblancoa02	2026-03-30	Economía 4º ESO Cristina Blanco	1018
161	55	6	6	cblancoa02	2026-04-03	Economía 4º ESO Cristina Blanco	1018
162	55	6	6	cblancoa02	2026-04-06	Economía 4º ESO Cristina Blanco	1018
163	55	6	6	cblancoa02	2026-04-10	Economía 4º ESO Cristina Blanco	1018
164	55	6	6	cblancoa02	2026-04-13	Economía 4º ESO Cristina Blanco	1018
165	55	6	6	cblancoa02	2026-04-17	Economía 4º ESO Cristina Blanco	1018
166	55	6	6	cblancoa02	2026-04-20	Economía 4º ESO Cristina Blanco	1018
167	55	6	6	cblancoa02	2026-04-24	Economía 4º ESO Cristina Blanco	1018
168	55	6	6	cblancoa02	2026-04-27	Economía 4º ESO Cristina Blanco	1018
169	55	6	6	cblancoa02	2026-05-01	Economía 4º ESO Cristina Blanco	1018
170	55	6	6	cblancoa02	2026-05-04	Economía 4º ESO Cristina Blanco	1018
171	55	6	6	cblancoa02	2026-05-08	Economía 4º ESO Cristina Blanco	1018
172	55	6	6	cblancoa02	2026-05-11	Economía 4º ESO Cristina Blanco	1018
173	55	6	6	cblancoa02	2026-05-15	Economía 4º ESO Cristina Blanco	1018
174	55	6	6	cblancoa02	2026-05-18	Economía 4º ESO Cristina Blanco	1018
175	55	6	6	cblancoa02	2026-05-22	Economía 4º ESO Cristina Blanco	1018
176	55	6	6	cblancoa02	2026-05-25	Economía 4º ESO Cristina Blanco	1018
177	55	6	6	cblancoa02	2026-05-29	Economía 4º ESO Cristina Blanco	1018
178	55	6	6	cblancoa02	2026-06-01	Economía 4º ESO Cristina Blanco	1018
179	55	6	6	cblancoa02	2026-06-05	Economía 4º ESO Cristina Blanco	1018
180	55	6	6	cblancoa02	2026-06-08	Economía 4º ESO Cristina Blanco	1018
181	55	6	6	cblancoa02	2026-06-12	Economía 4º ESO Cristina Blanco	1018
182	55	6	6	cblancoa02	2026-06-15	Economía 4º ESO Cristina Blanco	1018
183	55	6	6	cblancoa02	2026-06-19	Economía 4º ESO Cristina Blanco	1018
184	63	5	5	celita2	2026-02-16	Biología 2º Bach Celia	1013
185	63	5	5	celita2	2026-02-23	Biología 2º Bach Celia	1013
186	63	5	5	celita2	2026-03-02	Biología 2º Bach Celia	1013
187	63	5	5	celita2	2026-03-09	Biología 2º Bach Celia	1013
188	63	5	5	celita2	2026-03-16	Biología 2º Bach Celia	1013
189	63	5	5	celita2	2026-03-23	Biología 2º Bach Celia	1013
190	63	5	5	celita2	2026-03-30	Biología 2º Bach Celia	1013
191	63	5	5	celita2	2026-04-06	Biología 2º Bach Celia	1013
192	63	5	5	celita2	2026-04-13	Biología 2º Bach Celia	1013
193	63	5	5	celita2	2026-04-20	Biología 2º Bach Celia	1013
194	63	5	5	celita2	2026-04-27	Biología 2º Bach Celia	1013
195	63	5	5	celita2	2026-05-04	Biología 2º Bach Celia	1013
196	63	5	5	celita2	2026-05-11	Biología 2º Bach Celia	1013
197	63	5	5	celita2	2026-05-18	Biología 2º Bach Celia	1013
198	63	5	5	celita2	2026-05-25	Biología 2º Bach Celia	1013
199	63	5	5	celita2	2026-06-01	Biología 2º Bach Celia	1013
200	63	5	5	celita2	2026-06-08	Biología 2º Bach Celia	1013
201	63	5	5	celita2	2026-06-15	Biología 2º Bach Celia	1013
202	22	6	6	mgranadob01	2026-02-16	Atendida por Matilde	1002
203	22	6	6	mgranadob01	2026-02-23	Atendida por Matilde	1002
204	22	6	6	mgranadob01	2026-03-02	Atendida por Matilde	1002
205	22	6	6	mgranadob01	2026-03-09	Atendida por Matilde	1002
206	22	6	6	mgranadob01	2026-03-16	Atendida por Matilde	1002
207	22	6	6	mgranadob01	2026-03-23	Atendida por Matilde	1002
208	22	6	6	mgranadob01	2026-03-30	Atendida por Matilde	1002
209	22	6	6	mgranadob01	2026-04-06	Atendida por Matilde	1002
210	22	6	6	mgranadob01	2026-04-13	Atendida por Matilde	1002
211	22	6	6	mgranadob01	2026-04-20	Atendida por Matilde	1002
212	22	6	6	mgranadob01	2026-04-27	Atendida por Matilde	1002
213	22	6	6	mgranadob01	2026-05-04	Atendida por Matilde	1002
214	22	6	6	mgranadob01	2026-05-11	Atendida por Matilde	1002
215	22	6	6	mgranadob01	2026-05-18	Atendida por Matilde	1002
216	22	6	6	mgranadob01	2026-05-25	Atendida por Matilde	1002
217	22	6	6	mgranadob01	2026-06-01	Atendida por Matilde	1002
218	22	6	6	mgranadob01	2026-06-08	Atendida por Matilde	1002
219	22	6	6	mgranadob01	2026-06-15	Atendida por Matilde	1002
220	22	3	3	jjmorcillor01	2026-02-16	Latín 1º Bach. Juan José	993
221	22	3	3	jjmorcillor01	2026-02-23	Latín 1º Bach. Juan José	993
222	22	3	3	jjmorcillor01	2026-03-02	Latín 1º Bach. Juan José	993
223	22	3	3	jjmorcillor01	2026-03-09	Latín 1º Bach. Juan José	993
224	22	3	3	jjmorcillor01	2026-03-16	Latín 1º Bach. Juan José	993
225	22	3	3	jjmorcillor01	2026-03-23	Latín 1º Bach. Juan José	993
226	22	3	3	jjmorcillor01	2026-03-30	Latín 1º Bach. Juan José	993
227	22	3	3	jjmorcillor01	2026-04-06	Latín 1º Bach. Juan José	993
228	22	3	3	jjmorcillor01	2026-04-13	Latín 1º Bach. Juan José	993
229	22	3	3	jjmorcillor01	2026-04-20	Latín 1º Bach. Juan José	993
230	22	3	3	jjmorcillor01	2026-04-27	Latín 1º Bach. Juan José	993
231	22	3	3	jjmorcillor01	2026-05-04	Latín 1º Bach. Juan José	993
232	22	3	3	jjmorcillor01	2026-05-11	Latín 1º Bach. Juan José	993
233	22	3	3	jjmorcillor01	2026-05-18	Latín 1º Bach. Juan José	993
234	22	3	3	jjmorcillor01	2026-05-25	Latín 1º Bach. Juan José	993
235	22	3	3	jjmorcillor01	2026-06-01	Latín 1º Bach. Juan José	993
236	22	3	3	jjmorcillor01	2026-06-08	Latín 1º Bach. Juan José	993
237	22	3	3	jjmorcillor01	2026-06-15	Latín 1º Bach. Juan José	993
238	55	7	7	rencinasr02	2026-02-16	Matem. A 4º ESO Raquel	969
239	55	7	7	rencinasr02	2026-02-23	Matem. A 4º ESO Raquel	969
240	55	7	7	rencinasr02	2026-03-02	Matem. A 4º ESO Raquel	969
241	55	7	7	rencinasr02	2026-03-09	Matem. A 4º ESO Raquel	969
242	55	7	7	rencinasr02	2026-03-16	Matem. A 4º ESO Raquel	969
243	55	7	7	rencinasr02	2026-03-23	Matem. A 4º ESO Raquel	969
244	55	7	7	rencinasr02	2026-03-30	Matem. A 4º ESO Raquel	969
245	55	7	7	rencinasr02	2026-04-06	Matem. A 4º ESO Raquel	969
246	55	7	7	rencinasr02	2026-04-13	Matem. A 4º ESO Raquel	969
247	55	7	7	rencinasr02	2026-04-20	Matem. A 4º ESO Raquel	969
248	55	7	7	rencinasr02	2026-04-27	Matem. A 4º ESO Raquel	969
249	55	7	7	rencinasr02	2026-05-04	Matem. A 4º ESO Raquel	969
250	55	7	7	rencinasr02	2026-05-11	Matem. A 4º ESO Raquel	969
251	55	7	7	rencinasr02	2026-05-18	Matem. A 4º ESO Raquel	969
252	55	7	7	rencinasr02	2026-05-25	Matem. A 4º ESO Raquel	969
253	55	7	7	rencinasr02	2026-06-01	Matem. A 4º ESO Raquel	969
254	55	7	7	rencinasr02	2026-06-08	Matem. A 4º ESO Raquel	969
255	55	7	7	rencinasr02	2026-06-15	Matem. A 4º ESO Raquel	969
256	22	4	4	cjlozanop01	2026-02-16	Atendida por Carlos	996
257	22	4	4	cjlozanop01	2026-02-23	Atendida por Carlos	996
258	22	4	4	cjlozanop01	2026-03-02	Atendida por Carlos	996
259	22	4	4	cjlozanop01	2026-03-09	Atendida por Carlos	996
260	22	4	4	cjlozanop01	2026-03-16	Atendida por Carlos	996
274	63	6	6	egonzalezh18	2026-02-13	CC Grales 2º Bach Elena G.	1014
275	63	6	6	egonzalezh18	2026-02-16	CC Grales 2º Bach Elena G.	1014
276	63	6	6	egonzalezh18	2026-02-19	CC Grales 2º Bach Elena G.	1014
277	63	6	6	egonzalezh18	2026-02-20	CC Grales 2º Bach Elena G.	1014
278	63	6	6	egonzalezh18	2026-02-23	CC Grales 2º Bach Elena G.	1014
279	63	6	6	egonzalezh18	2026-02-26	CC Grales 2º Bach Elena G.	1014
280	63	6	6	egonzalezh18	2026-02-27	CC Grales 2º Bach Elena G.	1014
281	63	6	6	egonzalezh18	2026-03-02	CC Grales 2º Bach Elena G.	1014
282	63	6	6	egonzalezh18	2026-03-05	CC Grales 2º Bach Elena G.	1014
283	63	6	6	egonzalezh18	2026-03-06	CC Grales 2º Bach Elena G.	1014
284	63	6	6	egonzalezh18	2026-03-09	CC Grales 2º Bach Elena G.	1014
285	63	6	6	egonzalezh18	2026-03-12	CC Grales 2º Bach Elena G.	1014
286	63	6	6	egonzalezh18	2026-03-13	CC Grales 2º Bach Elena G.	1014
329	42	3	5	rmvegac01	2026-02-16	2º GS Optativa. Rosa	1007
330	42	3	5	rmvegac01	2026-02-23	2º GS Optativa. Rosa	1007
331	42	3	5	rmvegac01	2026-03-02	2º GS Optativa. Rosa	1007
332	42	3	5	rmvegac01	2026-03-09	2º GS Optativa. Rosa	1007
333	42	3	5	rmvegac01	2026-03-16	2º GS Optativa. Rosa	1007
334	42	3	5	rmvegac01	2026-03-23	2º GS Optativa. Rosa	1007
335	42	3	5	rmvegac01	2026-03-30	2º GS Optativa. Rosa	1007
336	42	3	5	rmvegac01	2026-04-06	2º GS Optativa. Rosa	1007
337	42	3	5	rmvegac01	2026-04-13	2º GS Optativa. Rosa	1007
338	42	3	5	rmvegac01	2026-04-20	2º GS Optativa. Rosa	1007
339	42	3	5	rmvegac01	2026-04-27	2º GS Optativa. Rosa	1007
340	42	3	5	rmvegac01	2026-05-04	2º GS Optativa. Rosa	1007
341	42	3	5	rmvegac01	2026-05-11	2º GS Optativa. Rosa	1007
342	42	3	5	rmvegac01	2026-05-18	2º GS Optativa. Rosa	1007
343	42	3	5	rmvegac01	2026-05-25	2º GS Optativa. Rosa	1007
344	42	3	5	rmvegac01	2026-06-01	2º GS Optativa. Rosa	1007
345	42	3	5	rmvegac01	2026-06-08	2º GS Optativa. Rosa	1007
346	42	3	5	rmvegac01	2026-06-15	2º GS Optativa. Rosa	1007
347	8	2	2	amfajardol01	2026-02-16	Biología NB 1º ESO A Alba Fajardo	958
348	8	2	2	amfajardol01	2026-02-18	Biología NB 1º ESO A Alba Fajardo	958
349	8	2	2	amfajardol01	2026-02-23	Biología NB 1º ESO A Alba Fajardo	958
350	8	2	2	amfajardol01	2026-02-25	Biología NB 1º ESO A Alba Fajardo	958
351	8	2	2	amfajardol01	2026-03-02	Biología NB 1º ESO A Alba Fajardo	958
352	8	2	2	amfajardol01	2026-03-04	Biología NB 1º ESO A Alba Fajardo	958
353	8	2	2	amfajardol01	2026-03-09	Biología NB 1º ESO A Alba Fajardo	958
354	8	2	2	amfajardol01	2026-03-11	Biología NB 1º ESO A Alba Fajardo	958
355	8	2	2	amfajardol01	2026-03-16	Biología NB 1º ESO A Alba Fajardo	958
356	8	2	2	amfajardol01	2026-03-18	Biología NB 1º ESO A Alba Fajardo	958
357	8	2	2	amfajardol01	2026-03-23	Biología NB 1º ESO A Alba Fajardo	958
358	8	2	2	amfajardol01	2026-03-25	Biología NB 1º ESO A Alba Fajardo	958
359	8	2	2	amfajardol01	2026-03-30	Biología NB 1º ESO A Alba Fajardo	958
360	8	2	2	amfajardol01	2026-04-01	Biología NB 1º ESO A Alba Fajardo	958
361	8	2	2	amfajardol01	2026-04-06	Biología NB 1º ESO A Alba Fajardo	958
362	8	2	2	amfajardol01	2026-04-08	Biología NB 1º ESO A Alba Fajardo	958
363	8	2	2	amfajardol01	2026-04-13	Biología NB 1º ESO A Alba Fajardo	958
364	8	2	2	amfajardol01	2026-04-15	Biología NB 1º ESO A Alba Fajardo	958
365	8	2	2	amfajardol01	2026-04-20	Biología NB 1º ESO A Alba Fajardo	958
366	8	2	2	amfajardol01	2026-04-22	Biología NB 1º ESO A Alba Fajardo	958
367	8	2	2	amfajardol01	2026-04-27	Biología NB 1º ESO A Alba Fajardo	958
368	8	2	2	amfajardol01	2026-04-29	Biología NB 1º ESO A Alba Fajardo	958
369	8	2	2	amfajardol01	2026-05-04	Biología NB 1º ESO A Alba Fajardo	958
370	8	2	2	amfajardol01	2026-05-06	Biología NB 1º ESO A Alba Fajardo	958
371	8	2	2	amfajardol01	2026-05-11	Biología NB 1º ESO A Alba Fajardo	958
372	8	2	2	amfajardol01	2026-05-13	Biología NB 1º ESO A Alba Fajardo	958
373	8	2	2	amfajardol01	2026-05-18	Biología NB 1º ESO A Alba Fajardo	958
374	8	2	2	amfajardol01	2026-05-20	Biología NB 1º ESO A Alba Fajardo	958
375	8	2	2	amfajardol01	2026-05-25	Biología NB 1º ESO A Alba Fajardo	958
376	8	2	2	amfajardol01	2026-05-27	Biología NB 1º ESO A Alba Fajardo	958
377	8	2	2	amfajardol01	2026-06-01	Biología NB 1º ESO A Alba Fajardo	958
378	8	2	2	amfajardol01	2026-06-03	Biología NB 1º ESO A Alba Fajardo	958
379	8	2	2	amfajardol01	2026-06-08	Biología NB 1º ESO A Alba Fajardo	958
380	8	2	2	amfajardol01	2026-06-10	Biología NB 1º ESO A Alba Fajardo	958
381	8	2	2	amfajardol01	2026-06-15	Biología NB 1º ESO A Alba Fajardo	958
382	8	2	2	amfajardol01	2026-06-17	Biología NB 1º ESO A Alba Fajardo	958
383	22	5	5	mji3003	2026-02-16	Atendida por Inma	1000
384	22	5	5	mji3003	2026-02-23	Atendida por Inma	1000
385	22	5	5	mji3003	2026-03-02	Atendida por Inma	1000
386	22	5	5	mji3003	2026-03-09	Atendida por Inma	1000
387	22	5	5	mji3003	2026-03-16	Atendida por Inma	1000
388	22	5	5	mji3003	2026-03-23	Atendida por Inma	1000
389	22	5	5	mji3003	2026-03-30	Atendida por Inma	1000
390	22	5	5	mji3003	2026-04-06	Atendida por Inma	1000
391	22	5	5	mji3003	2026-04-13	Atendida por Inma	1000
392	22	5	5	mji3003	2026-04-20	Atendida por Inma	1000
393	22	5	5	mji3003	2026-04-27	Atendida por Inma	1000
394	22	5	5	mji3003	2026-05-04	Atendida por Inma	1000
395	22	5	5	mji3003	2026-05-11	Atendida por Inma	1000
396	22	5	5	mji3003	2026-05-18	Atendida por Inma	1000
397	22	5	5	mji3003	2026-05-25	Atendida por Inma	1000
398	22	5	5	mji3003	2026-06-01	Atendida por Inma	1000
399	22	5	5	mji3003	2026-06-08	Atendida por Inma	1000
400	22	5	5	mji3003	2026-06-15	Atendida por Inma	1000
401	62	2	2	rencinasr02	2026-02-16	Mates NB 2º ESO A Raquel	962
402	62	2	2	rencinasr02	2026-02-18	Mates NB 2º ESO A Raquel	962
403	62	2	2	rencinasr02	2026-02-23	Mates NB 2º ESO A Raquel	962
404	62	2	2	rencinasr02	2026-02-25	Mates NB 2º ESO A Raquel	962
405	62	2	2	rencinasr02	2026-03-02	Mates NB 2º ESO A Raquel	962
406	62	2	2	rencinasr02	2026-03-04	Mates NB 2º ESO A Raquel	962
407	62	2	2	rencinasr02	2026-03-09	Mates NB 2º ESO A Raquel	962
408	62	2	2	rencinasr02	2026-03-11	Mates NB 2º ESO A Raquel	962
409	62	2	2	rencinasr02	2026-03-16	Mates NB 2º ESO A Raquel	962
410	62	2	2	rencinasr02	2026-03-18	Mates NB 2º ESO A Raquel	962
411	62	2	2	rencinasr02	2026-03-23	Mates NB 2º ESO A Raquel	962
412	62	2	2	rencinasr02	2026-03-25	Mates NB 2º ESO A Raquel	962
413	62	2	2	rencinasr02	2026-03-30	Mates NB 2º ESO A Raquel	962
414	62	2	2	rencinasr02	2026-04-01	Mates NB 2º ESO A Raquel	962
415	62	2	2	rencinasr02	2026-04-06	Mates NB 2º ESO A Raquel	962
416	62	2	2	rencinasr02	2026-04-08	Mates NB 2º ESO A Raquel	962
417	62	2	2	rencinasr02	2026-04-13	Mates NB 2º ESO A Raquel	962
418	62	2	2	rencinasr02	2026-04-15	Mates NB 2º ESO A Raquel	962
419	62	2	2	rencinasr02	2026-04-20	Mates NB 2º ESO A Raquel	962
420	62	2	2	rencinasr02	2026-04-22	Mates NB 2º ESO A Raquel	962
421	62	2	2	rencinasr02	2026-04-27	Mates NB 2º ESO A Raquel	962
422	62	2	2	rencinasr02	2026-04-29	Mates NB 2º ESO A Raquel	962
423	62	2	2	rencinasr02	2026-05-04	Mates NB 2º ESO A Raquel	962
424	62	2	2	rencinasr02	2026-05-06	Mates NB 2º ESO A Raquel	962
425	62	2	2	rencinasr02	2026-05-11	Mates NB 2º ESO A Raquel	962
426	62	2	2	rencinasr02	2026-05-13	Mates NB 2º ESO A Raquel	962
427	62	2	2	rencinasr02	2026-05-18	Mates NB 2º ESO A Raquel	962
428	62	2	2	rencinasr02	2026-05-20	Mates NB 2º ESO A Raquel	962
429	62	2	2	rencinasr02	2026-05-25	Mates NB 2º ESO A Raquel	962
430	62	2	2	rencinasr02	2026-05-27	Mates NB 2º ESO A Raquel	962
431	62	2	2	rencinasr02	2026-06-01	Mates NB 2º ESO A Raquel	962
432	62	2	2	rencinasr02	2026-06-03	Mates NB 2º ESO A Raquel	962
433	62	2	2	rencinasr02	2026-06-08	Mates NB 2º ESO A Raquel	962
434	62	2	2	rencinasr02	2026-06-10	Mates NB 2º ESO A Raquel	962
435	62	2	2	rencinasr02	2026-06-15	Mates NB 2º ESO A Raquel	962
436	62	2	2	rencinasr02	2026-06-17	Mates NB 2º ESO A Raquel	962
437	43	3	3	cblancoa02	2026-02-16	Economía 1º Bach. Cristina Blanco	981
438	43	3	3	cblancoa02	2026-02-19	Economía 1º Bach. Cristina Blanco	981
439	43	3	3	cblancoa02	2026-02-23	Economía 1º Bach. Cristina Blanco	981
440	43	3	3	cblancoa02	2026-02-26	Economía 1º Bach. Cristina Blanco	981
441	43	3	3	cblancoa02	2026-03-02	Economía 1º Bach. Cristina Blanco	981
442	43	3	3	cblancoa02	2026-03-05	Economía 1º Bach. Cristina Blanco	981
443	43	3	3	cblancoa02	2026-03-09	Economía 1º Bach. Cristina Blanco	981
444	43	3	3	cblancoa02	2026-03-12	Economía 1º Bach. Cristina Blanco	981
445	43	3	3	cblancoa02	2026-03-16	Economía 1º Bach. Cristina Blanco	981
446	43	3	3	cblancoa02	2026-03-19	Economía 1º Bach. Cristina Blanco	981
447	43	3	3	cblancoa02	2026-03-23	Economía 1º Bach. Cristina Blanco	981
448	43	3	3	cblancoa02	2026-03-26	Economía 1º Bach. Cristina Blanco	981
449	43	3	3	cblancoa02	2026-03-30	Economía 1º Bach. Cristina Blanco	981
450	43	3	3	cblancoa02	2026-04-02	Economía 1º Bach. Cristina Blanco	981
451	43	3	3	cblancoa02	2026-04-06	Economía 1º Bach. Cristina Blanco	981
452	43	3	3	cblancoa02	2026-04-09	Economía 1º Bach. Cristina Blanco	981
453	43	3	3	cblancoa02	2026-04-13	Economía 1º Bach. Cristina Blanco	981
454	43	3	3	cblancoa02	2026-04-16	Economía 1º Bach. Cristina Blanco	981
455	43	3	3	cblancoa02	2026-04-20	Economía 1º Bach. Cristina Blanco	981
456	43	3	3	cblancoa02	2026-04-23	Economía 1º Bach. Cristina Blanco	981
457	43	3	3	cblancoa02	2026-04-27	Economía 1º Bach. Cristina Blanco	981
458	43	3	3	cblancoa02	2026-04-30	Economía 1º Bach. Cristina Blanco	981
459	43	3	3	cblancoa02	2026-05-04	Economía 1º Bach. Cristina Blanco	981
460	43	3	3	cblancoa02	2026-05-07	Economía 1º Bach. Cristina Blanco	981
462	43	3	3	cblancoa02	2026-05-14	Economía 1º Bach. Cristina Blanco	981
464	43	3	3	cblancoa02	2026-05-21	Economía 1º Bach. Cristina Blanco	981
465	43	3	3	cblancoa02	2026-05-25	Economía 1º Bach. Cristina Blanco	981
466	43	3	3	cblancoa02	2026-05-28	Economía 1º Bach. Cristina Blanco	981
467	43	3	3	cblancoa02	2026-06-01	Economía 1º Bach. Cristina Blanco	981
468	43	3	3	cblancoa02	2026-06-04	Economía 1º Bach. Cristina Blanco	981
469	43	3	3	cblancoa02	2026-06-08	Economía 1º Bach. Cristina Blanco	981
470	43	3	3	cblancoa02	2026-06-11	Economía 1º Bach. Cristina Blanco	981
471	43	3	3	cblancoa02	2026-06-15	Economía 1º Bach. Cristina Blanco	981
472	43	3	3	cblancoa02	2026-06-18	Economía 1º Bach. Cristina Blanco	981
473	45	3	3	mahernandezr06	2026-02-16	Digit. Básica 1º ESO A/B Miguel	1023
474	45	3	3	mahernandezr06	2026-02-23	Digit. Básica 1º ESO A/B Miguel	1023
475	45	3	3	mahernandezr06	2026-03-02	Digit. Básica 1º ESO A/B Miguel	1023
476	45	3	3	mahernandezr06	2026-03-09	Digit. Básica 1º ESO A/B Miguel	1023
477	45	3	3	mahernandezr06	2026-03-16	Digit. Básica 1º ESO A/B Miguel	1023
478	45	3	3	mahernandezr06	2026-03-23	Digit. Básica 1º ESO A/B Miguel	1023
479	45	3	3	mahernandezr06	2026-03-30	Digit. Básica 1º ESO A/B Miguel	1023
480	45	3	3	mahernandezr06	2026-04-06	Digit. Básica 1º ESO A/B Miguel	1023
481	45	3	3	mahernandezr06	2026-04-13	Digit. Básica 1º ESO A/B Miguel	1023
482	45	3	3	mahernandezr06	2026-04-20	Digit. Básica 1º ESO A/B Miguel	1023
483	45	3	3	mahernandezr06	2026-04-27	Digit. Básica 1º ESO A/B Miguel	1023
484	45	3	3	mahernandezr06	2026-05-04	Digit. Básica 1º ESO A/B Miguel	1023
486	45	3	3	mahernandezr06	2026-05-25	Digit. Básica 1º ESO A/B Miguel	1023
487	45	3	3	mahernandezr06	2026-06-01	Digit. Básica 1º ESO A/B Miguel	1023
488	45	3	3	mahernandezr06	2026-06-08	Digit. Básica 1º ESO A/B Miguel	1023
489	45	3	3	mahernandezr06	2026-06-15	Digit. Básica 1º ESO A/B Miguel	1023
490	62	6	6	jjmorcillor01	2026-02-17	Refuerzo Lengua 2º ESO A/B Juan José	965
491	62	6	6	jjmorcillor01	2026-02-24	Refuerzo Lengua 2º ESO A/B Juan José	965
492	62	6	6	jjmorcillor01	2026-03-03	Refuerzo Lengua 2º ESO A/B Juan José	965
493	62	6	6	jjmorcillor01	2026-03-10	Refuerzo Lengua 2º ESO A/B Juan José	965
494	62	6	6	jjmorcillor01	2026-03-17	Refuerzo Lengua 2º ESO A/B Juan José	965
495	62	6	6	jjmorcillor01	2026-03-24	Refuerzo Lengua 2º ESO A/B Juan José	965
496	62	6	6	jjmorcillor01	2026-03-31	Refuerzo Lengua 2º ESO A/B Juan José	965
497	62	6	6	jjmorcillor01	2026-04-07	Refuerzo Lengua 2º ESO A/B Juan José	965
498	62	6	6	jjmorcillor01	2026-04-14	Refuerzo Lengua 2º ESO A/B Juan José	965
499	62	6	6	jjmorcillor01	2026-04-21	Refuerzo Lengua 2º ESO A/B Juan José	965
500	62	6	6	jjmorcillor01	2026-04-28	Refuerzo Lengua 2º ESO A/B Juan José	965
501	62	6	6	jjmorcillor01	2026-05-05	Refuerzo Lengua 2º ESO A/B Juan José	965
502	62	6	6	jjmorcillor01	2026-05-12	Refuerzo Lengua 2º ESO A/B Juan José	965
503	62	6	6	jjmorcillor01	2026-05-19	Refuerzo Lengua 2º ESO A/B Juan José	965
504	62	6	6	jjmorcillor01	2026-05-26	Refuerzo Lengua 2º ESO A/B Juan José	965
505	62	6	6	jjmorcillor01	2026-06-02	Refuerzo Lengua 2º ESO A/B Juan José	965
506	62	6	6	jjmorcillor01	2026-06-09	Refuerzo Lengua 2º ESO A/B Juan José	965
507	62	6	6	jjmorcillor01	2026-06-16	Refuerzo Lengua 2º ESO A/B Juan José	965
508	14	6	6	lmoralesg04	2026-02-17	Itin. Empl. 1º CFGB Luis	986
509	14	6	6	lmoralesg04	2026-02-24	Itin. Empl. 1º CFGB Luis	986
510	14	6	6	lmoralesg04	2026-03-03	Itin. Empl. 1º CFGB Luis	986
511	14	6	6	lmoralesg04	2026-03-10	Itin. Empl. 1º CFGB Luis	986
512	14	6	6	lmoralesg04	2026-03-17	Itin. Empl. 1º CFGB Luis	986
513	14	6	6	lmoralesg04	2026-03-24	Itin. Empl. 1º CFGB Luis	986
514	14	6	6	lmoralesg04	2026-03-31	Itin. Empl. 1º CFGB Luis	986
515	14	6	6	lmoralesg04	2026-04-07	Itin. Empl. 1º CFGB Luis	986
516	14	6	6	lmoralesg04	2026-04-14	Itin. Empl. 1º CFGB Luis	986
517	14	6	6	lmoralesg04	2026-04-21	Itin. Empl. 1º CFGB Luis	986
518	14	6	6	lmoralesg04	2026-04-28	Itin. Empl. 1º CFGB Luis	986
519	14	6	6	lmoralesg04	2026-05-05	Itin. Empl. 1º CFGB Luis	986
520	14	6	6	lmoralesg04	2026-05-12	Itin. Empl. 1º CFGB Luis	986
521	14	6	6	lmoralesg04	2026-05-19	Itin. Empl. 1º CFGB Luis	986
522	14	6	6	lmoralesg04	2026-05-26	Itin. Empl. 1º CFGB Luis	986
523	14	6	6	lmoralesg04	2026-06-02	Itin. Empl. 1º CFGB Luis	986
524	14	6	6	lmoralesg04	2026-06-09	Itin. Empl. 1º CFGB Luis	986
525	14	6	6	lmoralesg04	2026-06-16	Itin. Empl. 1º CFGB Luis	986
526	14	3	3	lmoralesg04	2026-02-17	Itin. Empl. 1º CFGB Luis	985
527	14	3	3	lmoralesg04	2026-02-24	Itin. Empl. 1º CFGB Luis	985
528	14	3	3	lmoralesg04	2026-03-03	Itin. Empl. 1º CFGB Luis	985
529	14	3	3	lmoralesg04	2026-03-10	Itin. Empl. 1º CFGB Luis	985
530	14	3	3	lmoralesg04	2026-03-17	Itin. Empl. 1º CFGB Luis	985
531	14	3	3	lmoralesg04	2026-03-24	Itin. Empl. 1º CFGB Luis	985
532	14	3	3	lmoralesg04	2026-03-31	Itin. Empl. 1º CFGB Luis	985
533	14	3	3	lmoralesg04	2026-04-07	Itin. Empl. 1º CFGB Luis	985
534	14	3	3	lmoralesg04	2026-04-14	Itin. Empl. 1º CFGB Luis	985
535	14	3	3	lmoralesg04	2026-04-21	Itin. Empl. 1º CFGB Luis	985
536	14	3	3	lmoralesg04	2026-04-28	Itin. Empl. 1º CFGB Luis	985
537	14	3	3	lmoralesg04	2026-05-05	Itin. Empl. 1º CFGB Luis	985
538	14	3	3	lmoralesg04	2026-05-12	Itin. Empl. 1º CFGB Luis	985
539	14	3	3	lmoralesg04	2026-05-19	Itin. Empl. 1º CFGB Luis	985
540	14	3	3	lmoralesg04	2026-05-26	Itin. Empl. 1º CFGB Luis	985
541	14	3	3	lmoralesg04	2026-06-02	Itin. Empl. 1º CFGB Luis	985
542	14	3	3	lmoralesg04	2026-06-09	Itin. Empl. 1º CFGB Luis	985
543	14	3	3	lmoralesg04	2026-06-16	Itin. Empl. 1º CFGB Luis	985
544	40	6	6	celita2	2026-02-17	Biología 2º Bach Celia	1017
545	40	6	6	celita2	2026-02-24	Biología 2º Bach Celia	1017
546	40	6	6	celita2	2026-03-03	Biología 2º Bach Celia	1017
547	40	6	6	celita2	2026-03-10	Biología 2º Bach Celia	1017
548	40	6	6	celita2	2026-03-17	Biología 2º Bach Celia	1017
549	40	6	6	celita2	2026-03-24	Biología 2º Bach Celia	1017
550	40	6	6	celita2	2026-03-31	Biología 2º Bach Celia	1017
551	40	6	6	celita2	2026-04-07	Biología 2º Bach Celia	1017
552	40	6	6	celita2	2026-04-14	Biología 2º Bach Celia	1017
553	40	6	6	celita2	2026-04-21	Biología 2º Bach Celia	1017
554	40	6	6	celita2	2026-04-28	Biología 2º Bach Celia	1017
555	40	6	6	celita2	2026-05-05	Biología 2º Bach Celia	1017
556	40	6	6	celita2	2026-05-12	Biología 2º Bach Celia	1017
557	40	6	6	celita2	2026-05-19	Biología 2º Bach Celia	1017
558	40	6	6	celita2	2026-05-26	Biología 2º Bach Celia	1017
559	40	6	6	celita2	2026-06-02	Biología 2º Bach Celia	1017
560	40	6	6	celita2	2026-06-09	Biología 2º Bach Celia	1017
561	40	6	6	celita2	2026-06-16	Biología 2º Bach Celia	1017
562	45	5	5	jrodriguezt18	2026-02-17	Unión Europea Jorge 4º ESO	1021
563	45	5	5	jrodriguezt18	2026-02-24	Unión Europea Jorge 4º ESO	1021
564	45	5	5	jrodriguezt18	2026-03-03	Unión Europea Jorge 4º ESO	1021
565	45	5	5	jrodriguezt18	2026-03-10	Unión Europea Jorge 4º ESO	1021
566	45	5	5	jrodriguezt18	2026-03-17	Unión Europea Jorge 4º ESO	1021
567	45	5	5	jrodriguezt18	2026-03-24	Unión Europea Jorge 4º ESO	1021
568	45	5	5	jrodriguezt18	2026-03-31	Unión Europea Jorge 4º ESO	1021
569	45	5	5	jrodriguezt18	2026-04-07	Unión Europea Jorge 4º ESO	1021
570	45	5	5	jrodriguezt18	2026-04-14	Unión Europea Jorge 4º ESO	1021
571	45	5	5	jrodriguezt18	2026-04-21	Unión Europea Jorge 4º ESO	1021
572	45	5	5	jrodriguezt18	2026-04-28	Unión Europea Jorge 4º ESO	1021
573	45	5	5	jrodriguezt18	2026-05-05	Unión Europea Jorge 4º ESO	1021
575	45	5	5	jrodriguezt18	2026-05-26	Unión Europea Jorge 4º ESO	1021
576	45	5	5	jrodriguezt18	2026-06-02	Unión Europea Jorge 4º ESO	1021
577	45	5	5	jrodriguezt18	2026-06-09	Unión Europea Jorge 4º ESO	1021
578	45	5	5	jrodriguezt18	2026-06-16	Unión Europea Jorge 4º ESO	1021
579	55	3	3	rencinasr02	2026-02-17	Matem. A 4º ESO Raquel	971
580	55	3	3	rencinasr02	2026-02-18	Matem. A 4º ESO Raquel	971
581	55	3	3	rencinasr02	2026-02-24	Matem. A 4º ESO Raquel	971
582	55	3	3	rencinasr02	2026-02-25	Matem. A 4º ESO Raquel	971
583	55	3	3	rencinasr02	2026-03-03	Matem. A 4º ESO Raquel	971
584	55	3	3	rencinasr02	2026-03-04	Matem. A 4º ESO Raquel	971
585	55	3	3	rencinasr02	2026-03-10	Matem. A 4º ESO Raquel	971
586	55	3	3	rencinasr02	2026-03-11	Matem. A 4º ESO Raquel	971
587	55	3	3	rencinasr02	2026-03-17	Matem. A 4º ESO Raquel	971
588	55	3	3	rencinasr02	2026-03-18	Matem. A 4º ESO Raquel	971
589	55	3	3	rencinasr02	2026-03-24	Matem. A 4º ESO Raquel	971
590	55	3	3	rencinasr02	2026-03-25	Matem. A 4º ESO Raquel	971
591	55	3	3	rencinasr02	2026-03-31	Matem. A 4º ESO Raquel	971
592	55	3	3	rencinasr02	2026-04-01	Matem. A 4º ESO Raquel	971
593	55	3	3	rencinasr02	2026-04-07	Matem. A 4º ESO Raquel	971
594	55	3	3	rencinasr02	2026-04-08	Matem. A 4º ESO Raquel	971
595	55	3	3	rencinasr02	2026-04-14	Matem. A 4º ESO Raquel	971
596	55	3	3	rencinasr02	2026-04-15	Matem. A 4º ESO Raquel	971
597	55	3	3	rencinasr02	2026-04-21	Matem. A 4º ESO Raquel	971
598	55	3	3	rencinasr02	2026-04-22	Matem. A 4º ESO Raquel	971
599	55	3	3	rencinasr02	2026-04-28	Matem. A 4º ESO Raquel	971
600	55	3	3	rencinasr02	2026-04-29	Matem. A 4º ESO Raquel	971
601	55	3	3	rencinasr02	2026-05-05	Matem. A 4º ESO Raquel	971
602	55	3	3	rencinasr02	2026-05-06	Matem. A 4º ESO Raquel	971
603	55	3	3	rencinasr02	2026-05-12	Matem. A 4º ESO Raquel	971
604	55	3	3	rencinasr02	2026-05-13	Matem. A 4º ESO Raquel	971
605	55	3	3	rencinasr02	2026-05-19	Matem. A 4º ESO Raquel	971
606	55	3	3	rencinasr02	2026-05-20	Matem. A 4º ESO Raquel	971
607	55	3	3	rencinasr02	2026-05-26	Matem. A 4º ESO Raquel	971
608	55	3	3	rencinasr02	2026-05-27	Matem. A 4º ESO Raquel	971
609	55	3	3	rencinasr02	2026-06-02	Matem. A 4º ESO Raquel	971
610	55	3	3	rencinasr02	2026-06-03	Matem. A 4º ESO Raquel	971
611	55	3	3	rencinasr02	2026-06-09	Matem. A 4º ESO Raquel	971
612	55	3	3	rencinasr02	2026-06-10	Matem. A 4º ESO Raquel	971
613	55	3	3	rencinasr02	2026-06-16	Matem. A 4º ESO Raquel	971
614	55	3	3	rencinasr02	2026-06-17	Matem. A 4º ESO Raquel	971
615	55	1	1	jjmorcillor01	2026-02-17	Latín 4º B Juan José	970
616	55	1	1	jjmorcillor01	2026-02-24	Latín 4º B Juan José	970
617	55	1	1	jjmorcillor01	2026-03-03	Latín 4º B Juan José	970
618	55	1	1	jjmorcillor01	2026-03-10	Latín 4º B Juan José	970
619	55	1	1	jjmorcillor01	2026-03-17	Latín 4º B Juan José	970
620	55	1	1	jjmorcillor01	2026-03-24	Latín 4º B Juan José	970
621	55	1	1	jjmorcillor01	2026-03-31	Latín 4º B Juan José	970
622	55	1	1	jjmorcillor01	2026-04-07	Latín 4º B Juan José	970
623	55	1	1	jjmorcillor01	2026-04-14	Latín 4º B Juan José	970
624	55	1	1	jjmorcillor01	2026-04-21	Latín 4º B Juan José	970
625	55	1	1	jjmorcillor01	2026-04-28	Latín 4º B Juan José	970
626	55	1	1	jjmorcillor01	2026-05-05	Latín 4º B Juan José	970
627	55	1	1	jjmorcillor01	2026-05-12	Latín 4º B Juan José	970
628	55	1	1	jjmorcillor01	2026-05-19	Latín 4º B Juan José	970
629	55	1	1	jjmorcillor01	2026-05-26	Latín 4º B Juan José	970
630	55	1	1	jjmorcillor01	2026-06-02	Latín 4º B Juan José	970
631	55	1	1	jjmorcillor01	2026-06-09	Latín 4º B Juan José	970
632	55	1	1	jjmorcillor01	2026-06-16	Latín 4º B Juan José	970
633	14	7	7	cjlozanop01	2026-02-13	Hª Filosofía 2º Bach B Carlos	1020
634	14	7	7	cjlozanop01	2026-02-17	Hª Filosofía 2º Bach B Carlos	1020
635	14	7	7	cjlozanop01	2026-02-19	Hª Filosofía 2º Bach B Carlos	1020
636	14	7	7	cjlozanop01	2026-02-20	Hª Filosofía 2º Bach B Carlos	1020
637	14	7	7	cjlozanop01	2026-02-24	Hª Filosofía 2º Bach B Carlos	1020
638	14	7	7	cjlozanop01	2026-02-26	Hª Filosofía 2º Bach B Carlos	1020
639	14	7	7	cjlozanop01	2026-02-27	Hª Filosofía 2º Bach B Carlos	1020
640	14	7	7	cjlozanop01	2026-03-03	Hª Filosofía 2º Bach B Carlos	1020
641	14	7	7	cjlozanop01	2026-03-05	Hª Filosofía 2º Bach B Carlos	1020
642	14	7	7	cjlozanop01	2026-03-06	Hª Filosofía 2º Bach B Carlos	1020
643	14	7	7	cjlozanop01	2026-03-10	Hª Filosofía 2º Bach B Carlos	1020
688	22	6	6	mji3003	2026-02-17	Atendida por Inma	1001
689	22	6	6	mji3003	2026-02-24	Atendida por Inma	1001
690	22	6	6	mji3003	2026-03-03	Atendida por Inma	1001
691	22	6	6	mji3003	2026-03-10	Atendida por Inma	1001
692	22	6	6	mji3003	2026-03-17	Atendida por Inma	1001
693	22	6	6	mji3003	2026-03-24	Atendida por Inma	1001
694	22	6	6	mji3003	2026-03-31	Atendida por Inma	1001
695	22	6	6	mji3003	2026-04-07	Atendida por Inma	1001
696	22	6	6	mji3003	2026-04-14	Atendida por Inma	1001
697	22	6	6	mji3003	2026-04-21	Atendida por Inma	1001
698	22	6	6	mji3003	2026-04-28	Atendida por Inma	1001
699	22	6	6	mji3003	2026-05-05	Atendida por Inma	1001
700	22	6	6	mji3003	2026-05-12	Atendida por Inma	1001
701	22	6	6	mji3003	2026-05-19	Atendida por Inma	1001
702	22	6	6	mji3003	2026-05-26	Atendida por Inma	1001
703	22	6	6	mji3003	2026-06-02	Atendida por Inma	1001
704	22	6	6	mji3003	2026-06-09	Atendida por Inma	1001
705	22	6	6	mji3003	2026-06-16	Atendida por Inma	1001
706	22	4	4	pagarciam27	2026-02-17	Atendida por Patricia	998
707	22	4	4	pagarciam27	2026-02-19	Atendida por Patricia	998
708	22	4	4	pagarciam27	2026-02-24	Atendida por Patricia	998
709	22	4	4	pagarciam27	2026-02-26	Atendida por Patricia	998
710	22	4	4	pagarciam27	2026-03-03	Atendida por Patricia	998
711	22	4	4	pagarciam27	2026-03-05	Atendida por Patricia	998
712	22	4	4	pagarciam27	2026-03-10	Atendida por Patricia	998
713	22	4	4	pagarciam27	2026-03-12	Atendida por Patricia	998
742	22	5	5	jjmorcillor01	2026-02-17	Latín 1º Bach. Juan José	994
743	22	5	5	jjmorcillor01	2026-02-19	Latín 1º Bach. Juan José	994
744	22	5	5	jjmorcillor01	2026-02-24	Latín 1º Bach. Juan José	994
745	22	5	5	jjmorcillor01	2026-02-26	Latín 1º Bach. Juan José	994
746	22	5	5	jjmorcillor01	2026-03-03	Latín 1º Bach. Juan José	994
747	22	5	5	jjmorcillor01	2026-03-05	Latín 1º Bach. Juan José	994
748	22	5	5	jjmorcillor01	2026-03-10	Latín 1º Bach. Juan José	994
749	22	5	5	jjmorcillor01	2026-03-12	Latín 1º Bach. Juan José	994
750	22	5	5	jjmorcillor01	2026-03-17	Latín 1º Bach. Juan José	994
751	22	5	5	jjmorcillor01	2026-03-19	Latín 1º Bach. Juan José	994
752	22	5	5	jjmorcillor01	2026-03-24	Latín 1º Bach. Juan José	994
753	22	5	5	jjmorcillor01	2026-03-26	Latín 1º Bach. Juan José	994
754	22	5	5	jjmorcillor01	2026-03-31	Latín 1º Bach. Juan José	994
755	22	5	5	jjmorcillor01	2026-04-02	Latín 1º Bach. Juan José	994
756	22	5	5	jjmorcillor01	2026-04-07	Latín 1º Bach. Juan José	994
757	22	5	5	jjmorcillor01	2026-04-09	Latín 1º Bach. Juan José	994
758	22	5	5	jjmorcillor01	2026-04-14	Latín 1º Bach. Juan José	994
759	22	5	5	jjmorcillor01	2026-04-16	Latín 1º Bach. Juan José	994
760	22	5	5	jjmorcillor01	2026-04-21	Latín 1º Bach. Juan José	994
761	22	5	5	jjmorcillor01	2026-04-23	Latín 1º Bach. Juan José	994
762	22	5	5	jjmorcillor01	2026-04-28	Latín 1º Bach. Juan José	994
763	22	5	5	jjmorcillor01	2026-04-30	Latín 1º Bach. Juan José	994
764	22	5	5	jjmorcillor01	2026-05-05	Latín 1º Bach. Juan José	994
765	22	5	5	jjmorcillor01	2026-05-07	Latín 1º Bach. Juan José	994
766	22	5	5	jjmorcillor01	2026-05-12	Latín 1º Bach. Juan José	994
767	22	5	5	jjmorcillor01	2026-05-14	Latín 1º Bach. Juan José	994
768	22	5	5	jjmorcillor01	2026-05-19	Latín 1º Bach. Juan José	994
769	22	5	5	jjmorcillor01	2026-05-21	Latín 1º Bach. Juan José	994
770	22	5	5	jjmorcillor01	2026-05-26	Latín 1º Bach. Juan José	994
771	22	5	5	jjmorcillor01	2026-05-28	Latín 1º Bach. Juan José	994
772	22	5	5	jjmorcillor01	2026-06-02	Latín 1º Bach. Juan José	994
773	22	5	5	jjmorcillor01	2026-06-04	Latín 1º Bach. Juan José	994
774	22	5	5	jjmorcillor01	2026-06-09	Latín 1º Bach. Juan José	994
775	22	5	5	jjmorcillor01	2026-06-11	Latín 1º Bach. Juan José	994
776	22	5	5	jjmorcillor01	2026-06-16	Latín 1º Bach. Juan José	994
777	22	5	5	jjmorcillor01	2026-06-18	Latín 1º Bach. Juan José	994
778	43	5	5	cblancoa02	2026-02-17	Econ. Empr. 1º Bach. Cristina Blanco	980
779	43	5	5	cblancoa02	2026-02-19	Econ. Empr. 1º Bach. Cristina Blanco	980
780	43	5	5	cblancoa02	2026-02-24	Econ. Empr. 1º Bach. Cristina Blanco	980
781	43	5	5	cblancoa02	2026-02-26	Econ. Empr. 1º Bach. Cristina Blanco	980
782	43	5	5	cblancoa02	2026-03-03	Econ. Empr. 1º Bach. Cristina Blanco	980
783	43	5	5	cblancoa02	2026-03-05	Econ. Empr. 1º Bach. Cristina Blanco	980
784	43	5	5	cblancoa02	2026-03-10	Econ. Empr. 1º Bach. Cristina Blanco	980
785	43	5	5	cblancoa02	2026-03-12	Econ. Empr. 1º Bach. Cristina Blanco	980
786	43	5	5	cblancoa02	2026-03-17	Econ. Empr. 1º Bach. Cristina Blanco	980
787	43	5	5	cblancoa02	2026-03-19	Econ. Empr. 1º Bach. Cristina Blanco	980
788	43	5	5	cblancoa02	2026-03-24	Econ. Empr. 1º Bach. Cristina Blanco	980
789	43	5	5	cblancoa02	2026-03-26	Econ. Empr. 1º Bach. Cristina Blanco	980
790	43	5	5	cblancoa02	2026-03-31	Econ. Empr. 1º Bach. Cristina Blanco	980
791	43	5	5	cblancoa02	2026-04-02	Econ. Empr. 1º Bach. Cristina Blanco	980
792	43	5	5	cblancoa02	2026-04-07	Econ. Empr. 1º Bach. Cristina Blanco	980
793	43	5	5	cblancoa02	2026-04-09	Econ. Empr. 1º Bach. Cristina Blanco	980
794	43	5	5	cblancoa02	2026-04-14	Econ. Empr. 1º Bach. Cristina Blanco	980
795	43	5	5	cblancoa02	2026-04-16	Econ. Empr. 1º Bach. Cristina Blanco	980
796	43	5	5	cblancoa02	2026-04-21	Econ. Empr. 1º Bach. Cristina Blanco	980
797	43	5	5	cblancoa02	2026-04-23	Econ. Empr. 1º Bach. Cristina Blanco	980
798	43	5	5	cblancoa02	2026-04-28	Econ. Empr. 1º Bach. Cristina Blanco	980
799	43	5	5	cblancoa02	2026-04-30	Econ. Empr. 1º Bach. Cristina Blanco	980
800	43	5	5	cblancoa02	2026-05-05	Econ. Empr. 1º Bach. Cristina Blanco	980
801	43	5	5	cblancoa02	2026-05-07	Econ. Empr. 1º Bach. Cristina Blanco	980
802	43	5	5	cblancoa02	2026-05-14	Econ. Empr. 1º Bach. Cristina Blanco	980
804	43	5	5	cblancoa02	2026-05-21	Econ. Empr. 1º Bach. Cristina Blanco	980
805	43	5	5	cblancoa02	2026-05-26	Econ. Empr. 1º Bach. Cristina Blanco	980
806	43	5	5	cblancoa02	2026-05-28	Econ. Empr. 1º Bach. Cristina Blanco	980
807	43	5	5	cblancoa02	2026-06-02	Econ. Empr. 1º Bach. Cristina Blanco	980
808	43	5	5	cblancoa02	2026-06-04	Econ. Empr. 1º Bach. Cristina Blanco	980
809	43	5	5	cblancoa02	2026-06-09	Econ. Empr. 1º Bach. Cristina Blanco	980
810	43	5	5	cblancoa02	2026-06-11	Econ. Empr. 1º Bach. Cristina Blanco	980
811	43	5	5	cblancoa02	2026-06-16	Econ. Empr. 1º Bach. Cristina Blanco	980
812	43	5	5	cblancoa02	2026-06-18	Econ. Empr. 1º Bach. Cristina Blanco	980
813	42	7	7	pety78	2026-02-18	1º GS Digitalización. Peti	1040
814	42	7	7	pety78	2026-02-25	1º GS Digitalización. Peti	1040
815	42	7	7	pety78	2026-03-04	1º GS Digitalización. Peti	1040
816	42	7	7	pety78	2026-03-11	1º GS Digitalización. Peti	1040
817	42	7	7	pety78	2026-03-18	1º GS Digitalización. Peti	1040
818	42	7	7	pety78	2026-03-25	1º GS Digitalización. Peti	1040
819	42	7	7	pety78	2026-04-01	1º GS Digitalización. Peti	1040
820	42	7	7	pety78	2026-04-08	1º GS Digitalización. Peti	1040
821	42	7	7	pety78	2026-04-15	1º GS Digitalización. Peti	1040
822	42	7	7	pety78	2026-04-22	1º GS Digitalización. Peti	1040
823	42	7	7	pety78	2026-04-29	1º GS Digitalización. Peti	1040
824	42	7	7	pety78	2026-05-06	1º GS Digitalización. Peti	1040
825	42	7	7	pety78	2026-05-13	1º GS Digitalización. Peti	1040
826	42	7	7	pety78	2026-05-20	1º GS Digitalización. Peti	1040
827	42	7	7	pety78	2026-05-27	1º GS Digitalización. Peti	1040
828	42	7	7	pety78	2026-06-03	1º GS Digitalización. Peti	1040
829	42	7	7	pety78	2026-06-10	1º GS Digitalización. Peti	1040
830	42	7	7	pety78	2026-06-17	1º GS Digitalización. Peti	1040
831	8	5	5	micostad01	2026-02-18	Refuerzo Lengua 1º ESO A/B Maribel	961
832	8	5	5	micostad01	2026-02-25	Refuerzo Lengua 1º ESO A/B Maribel	961
833	8	5	5	micostad01	2026-03-04	Refuerzo Lengua 1º ESO A/B Maribel	961
834	8	5	5	micostad01	2026-03-11	Refuerzo Lengua 1º ESO A/B Maribel	961
835	8	5	5	micostad01	2026-03-18	Refuerzo Lengua 1º ESO A/B Maribel	961
836	8	5	5	micostad01	2026-03-25	Refuerzo Lengua 1º ESO A/B Maribel	961
837	8	5	5	micostad01	2026-04-01	Refuerzo Lengua 1º ESO A/B Maribel	961
838	8	5	5	micostad01	2026-04-08	Refuerzo Lengua 1º ESO A/B Maribel	961
839	8	5	5	micostad01	2026-04-15	Refuerzo Lengua 1º ESO A/B Maribel	961
840	8	5	5	micostad01	2026-04-22	Refuerzo Lengua 1º ESO A/B Maribel	961
841	8	5	5	micostad01	2026-04-29	Refuerzo Lengua 1º ESO A/B Maribel	961
842	8	5	5	micostad01	2026-05-06	Refuerzo Lengua 1º ESO A/B Maribel	961
843	8	5	5	micostad01	2026-05-13	Refuerzo Lengua 1º ESO A/B Maribel	961
844	8	5	5	micostad01	2026-05-20	Refuerzo Lengua 1º ESO A/B Maribel	961
845	8	5	5	micostad01	2026-05-27	Refuerzo Lengua 1º ESO A/B Maribel	961
846	8	5	5	micostad01	2026-06-03	Refuerzo Lengua 1º ESO A/B Maribel	961
847	8	5	5	micostad01	2026-06-10	Refuerzo Lengua 1º ESO A/B Maribel	961
848	8	5	5	micostad01	2026-06-17	Refuerzo Lengua 1º ESO A/B Maribel	961
849	45	5	5	mahernandezr06	2026-02-18	Digit. Básica 1º ESO A/B Miguel	1024
850	45	5	5	mahernandezr06	2026-02-25	Digit. Básica 1º ESO A/B Miguel	1024
851	45	5	5	mahernandezr06	2026-03-04	Digit. Básica 1º ESO A/B Miguel	1024
852	45	5	5	mahernandezr06	2026-03-11	Digit. Básica 1º ESO A/B Miguel	1024
853	45	5	5	mahernandezr06	2026-03-18	Digit. Básica 1º ESO A/B Miguel	1024
854	45	5	5	mahernandezr06	2026-03-25	Digit. Básica 1º ESO A/B Miguel	1024
855	45	5	5	mahernandezr06	2026-04-01	Digit. Básica 1º ESO A/B Miguel	1024
856	45	5	5	mahernandezr06	2026-04-08	Digit. Básica 1º ESO A/B Miguel	1024
857	45	5	5	mahernandezr06	2026-04-15	Digit. Básica 1º ESO A/B Miguel	1024
858	45	5	5	mahernandezr06	2026-04-22	Digit. Básica 1º ESO A/B Miguel	1024
859	45	5	5	mahernandezr06	2026-04-29	Digit. Básica 1º ESO A/B Miguel	1024
860	45	5	5	mahernandezr06	2026-05-06	Digit. Básica 1º ESO A/B Miguel	1024
861	45	5	5	mahernandezr06	2026-05-13	Digit. Básica 1º ESO A/B Miguel	1024
862	45	5	5	mahernandezr06	2026-05-27	Digit. Básica 1º ESO A/B Miguel	1024
863	45	5	5	mahernandezr06	2026-06-03	Digit. Básica 1º ESO A/B Miguel	1024
864	45	5	5	mahernandezr06	2026-06-10	Digit. Básica 1º ESO A/B Miguel	1024
865	45	5	5	mahernandezr06	2026-06-17	Digit. Básica 1º ESO A/B Miguel	1024
866	55	5	5	cblancoa02	2026-02-18	Economía 4º ESO Cristina Blanco	1019
867	55	5	5	cblancoa02	2026-02-25	Economía 4º ESO Cristina Blanco	1019
868	55	5	5	cblancoa02	2026-03-04	Economía 4º ESO Cristina Blanco	1019
869	55	5	5	cblancoa02	2026-03-11	Economía 4º ESO Cristina Blanco	1019
870	55	5	5	cblancoa02	2026-03-18	Economía 4º ESO Cristina Blanco	1019
871	55	5	5	cblancoa02	2026-03-25	Economía 4º ESO Cristina Blanco	1019
872	55	5	5	cblancoa02	2026-04-01	Economía 4º ESO Cristina Blanco	1019
873	55	5	5	cblancoa02	2026-04-08	Economía 4º ESO Cristina Blanco	1019
874	55	5	5	cblancoa02	2026-04-15	Economía 4º ESO Cristina Blanco	1019
875	55	5	5	cblancoa02	2026-04-22	Economía 4º ESO Cristina Blanco	1019
876	55	5	5	cblancoa02	2026-04-29	Economía 4º ESO Cristina Blanco	1019
877	55	5	5	cblancoa02	2026-05-06	Economía 4º ESO Cristina Blanco	1019
878	55	5	5	cblancoa02	2026-05-13	Economía 4º ESO Cristina Blanco	1019
879	55	5	5	cblancoa02	2026-05-20	Economía 4º ESO Cristina Blanco	1019
880	55	5	5	cblancoa02	2026-05-27	Economía 4º ESO Cristina Blanco	1019
881	55	5	5	cblancoa02	2026-06-03	Economía 4º ESO Cristina Blanco	1019
882	55	5	5	cblancoa02	2026-06-10	Economía 4º ESO Cristina Blanco	1019
883	55	5	5	cblancoa02	2026-06-17	Economía 4º ESO Cristina Blanco	1019
884	63	5	5	egonzalezh18	2026-02-18	CC Grales 2º Bach Elena G.	1015
885	63	5	5	egonzalezh18	2026-02-25	CC Grales 2º Bach Elena G.	1015
886	63	5	5	egonzalezh18	2026-03-04	CC Grales 2º Bach Elena G.	1015
887	63	5	5	egonzalezh18	2026-03-11	CC Grales 2º Bach Elena G.	1015
888	63	5	5	egonzalezh18	2026-03-18	CC Grales 2º Bach Elena G.	1015
889	63	5	5	egonzalezh18	2026-03-25	CC Grales 2º Bach Elena G.	1015
890	63	5	5	egonzalezh18	2026-04-01	CC Grales 2º Bach Elena G.	1015
891	63	5	5	egonzalezh18	2026-04-08	CC Grales 2º Bach Elena G.	1015
892	63	5	5	egonzalezh18	2026-04-15	CC Grales 2º Bach Elena G.	1015
893	63	5	5	egonzalezh18	2026-04-22	CC Grales 2º Bach Elena G.	1015
894	63	5	5	egonzalezh18	2026-04-29	CC Grales 2º Bach Elena G.	1015
895	63	5	5	egonzalezh18	2026-05-06	CC Grales 2º Bach Elena G.	1015
896	63	5	5	egonzalezh18	2026-05-13	CC Grales 2º Bach Elena G.	1015
897	63	5	5	egonzalezh18	2026-05-20	CC Grales 2º Bach Elena G.	1015
898	63	5	5	egonzalezh18	2026-05-27	CC Grales 2º Bach Elena G.	1015
899	63	5	5	egonzalezh18	2026-06-03	CC Grales 2º Bach Elena G.	1015
900	63	5	5	egonzalezh18	2026-06-10	CC Grales 2º Bach Elena G.	1015
901	63	5	5	egonzalezh18	2026-06-17	CC Grales 2º Bach Elena G.	1015
902	63	2	2	celita2	2026-02-18	Biología 2º Bach Celia	1011
903	63	2	2	celita2	2026-02-25	Biología 2º Bach Celia	1011
904	63	2	2	celita2	2026-03-04	Biología 2º Bach Celia	1011
905	63	2	2	celita2	2026-03-11	Biología 2º Bach Celia	1011
906	63	2	2	celita2	2026-03-18	Biología 2º Bach Celia	1011
907	63	2	2	celita2	2026-03-25	Biología 2º Bach Celia	1011
908	63	2	2	celita2	2026-04-01	Biología 2º Bach Celia	1011
909	63	2	2	celita2	2026-04-08	Biología 2º Bach Celia	1011
910	63	2	2	celita2	2026-04-15	Biología 2º Bach Celia	1011
911	63	2	2	celita2	2026-04-22	Biología 2º Bach Celia	1011
912	63	2	2	celita2	2026-04-29	Biología 2º Bach Celia	1011
913	63	2	2	celita2	2026-05-06	Biología 2º Bach Celia	1011
914	63	2	2	celita2	2026-05-13	Biología 2º Bach Celia	1011
915	63	2	2	celita2	2026-05-20	Biología 2º Bach Celia	1011
916	63	2	2	celita2	2026-05-27	Biología 2º Bach Celia	1011
917	63	2	2	celita2	2026-06-03	Biología 2º Bach Celia	1011
918	63	2	2	celita2	2026-06-10	Biología 2º Bach Celia	1011
919	63	2	2	celita2	2026-06-17	Biología 2º Bach Celia	1011
920	42	3	3	pety78	2026-02-18	1º GM Digitalización. Peti	1005
921	42	3	3	pety78	2026-02-25	1º GM Digitalización. Peti	1005
922	42	3	3	pety78	2026-03-04	1º GM Digitalización. Peti	1005
923	42	3	3	pety78	2026-03-11	1º GM Digitalización. Peti	1005
924	42	3	3	pety78	2026-03-18	1º GM Digitalización. Peti	1005
925	42	3	3	pety78	2026-03-25	1º GM Digitalización. Peti	1005
926	42	3	3	pety78	2026-04-01	1º GM Digitalización. Peti	1005
927	42	3	3	pety78	2026-04-08	1º GM Digitalización. Peti	1005
928	42	3	3	pety78	2026-04-15	1º GM Digitalización. Peti	1005
929	42	3	3	pety78	2026-04-22	1º GM Digitalización. Peti	1005
930	42	3	3	pety78	2026-04-29	1º GM Digitalización. Peti	1005
931	42	3	3	pety78	2026-05-06	1º GM Digitalización. Peti	1005
932	42	3	3	pety78	2026-05-13	1º GM Digitalización. Peti	1005
933	42	3	3	pety78	2026-05-20	1º GM Digitalización. Peti	1005
934	42	3	3	pety78	2026-05-27	1º GM Digitalización. Peti	1005
935	42	3	3	pety78	2026-06-03	1º GM Digitalización. Peti	1005
936	42	3	3	pety78	2026-06-10	1º GM Digitalización. Peti	1005
937	42	3	3	pety78	2026-06-17	1º GM Digitalización. Peti	1005
938	22	4	4	mji3003	2026-02-13	Atendida por Inma	999
939	22	4	4	mji3003	2026-02-18	Atendida por Inma	999
940	22	4	4	mji3003	2026-02-20	Atendida por Inma	999
941	22	4	4	mji3003	2026-02-25	Atendida por Inma	999
942	22	4	4	mji3003	2026-02-27	Atendida por Inma	999
943	22	4	4	mji3003	2026-03-04	Atendida por Inma	999
944	22	4	4	mji3003	2026-03-06	Atendida por Inma	999
945	22	4	4	mji3003	2026-03-11	Atendida por Inma	999
946	22	4	4	mji3003	2026-03-13	Atendida por Inma	999
975	43	6	6	cblancoa02	2026-02-18	Economía 1º Bach. Cristina Blanco	982
976	43	6	6	cblancoa02	2026-02-25	Economía 1º Bach. Cristina Blanco	982
977	43	6	6	cblancoa02	2026-03-04	Economía 1º Bach. Cristina Blanco	982
978	43	6	6	cblancoa02	2026-03-11	Economía 1º Bach. Cristina Blanco	982
979	43	6	6	cblancoa02	2026-03-18	Economía 1º Bach. Cristina Blanco	982
980	43	6	6	cblancoa02	2026-03-25	Economía 1º Bach. Cristina Blanco	982
981	43	6	6	cblancoa02	2026-04-01	Economía 1º Bach. Cristina Blanco	982
982	43	6	6	cblancoa02	2026-04-08	Economía 1º Bach. Cristina Blanco	982
983	43	6	6	cblancoa02	2026-04-15	Economía 1º Bach. Cristina Blanco	982
984	43	6	6	cblancoa02	2026-04-22	Economía 1º Bach. Cristina Blanco	982
985	43	6	6	cblancoa02	2026-04-29	Economía 1º Bach. Cristina Blanco	982
986	43	6	6	cblancoa02	2026-05-06	Economía 1º Bach. Cristina Blanco	982
987	43	6	6	cblancoa02	2026-05-13	Economía 1º Bach. Cristina Blanco	982
988	43	6	6	cblancoa02	2026-05-27	Economía 1º Bach. Cristina Blanco	982
989	43	6	6	cblancoa02	2026-06-03	Economía 1º Bach. Cristina Blanco	982
990	43	6	6	cblancoa02	2026-06-10	Economía 1º Bach. Cristina Blanco	982
991	43	6	6	cblancoa02	2026-06-17	Economía 1º Bach. Cristina Blanco	982
992	62	3	3	jjmorcillor01	2026-02-19	Refuerzo Lengua 2º ESO A/B Juan José	966
993	62	3	3	jjmorcillor01	2026-02-26	Refuerzo Lengua 2º ESO A/B Juan José	966
994	62	3	3	jjmorcillor01	2026-03-05	Refuerzo Lengua 2º ESO A/B Juan José	966
995	62	3	3	jjmorcillor01	2026-03-12	Refuerzo Lengua 2º ESO A/B Juan José	966
996	62	3	3	jjmorcillor01	2026-03-19	Refuerzo Lengua 2º ESO A/B Juan José	966
997	62	3	3	jjmorcillor01	2026-03-26	Refuerzo Lengua 2º ESO A/B Juan José	966
998	62	3	3	jjmorcillor01	2026-04-02	Refuerzo Lengua 2º ESO A/B Juan José	966
999	62	3	3	jjmorcillor01	2026-04-09	Refuerzo Lengua 2º ESO A/B Juan José	966
1613	41	1	2	pety78	2026-02-18	2º TEI	\N
1000	62	3	3	jjmorcillor01	2026-04-16	Refuerzo Lengua 2º ESO A/B Juan José	966
1001	62	3	3	jjmorcillor01	2026-04-23	Refuerzo Lengua 2º ESO A/B Juan José	966
1002	62	3	3	jjmorcillor01	2026-04-30	Refuerzo Lengua 2º ESO A/B Juan José	966
1003	62	3	3	jjmorcillor01	2026-05-07	Refuerzo Lengua 2º ESO A/B Juan José	966
1004	62	3	3	jjmorcillor01	2026-05-14	Refuerzo Lengua 2º ESO A/B Juan José	966
1005	62	3	3	jjmorcillor01	2026-05-21	Refuerzo Lengua 2º ESO A/B Juan José	966
1006	62	3	3	jjmorcillor01	2026-05-28	Refuerzo Lengua 2º ESO A/B Juan José	966
1007	62	3	3	jjmorcillor01	2026-06-04	Refuerzo Lengua 2º ESO A/B Juan José	966
1008	62	3	3	jjmorcillor01	2026-06-11	Refuerzo Lengua 2º ESO A/B Juan José	966
1009	62	3	3	jjmorcillor01	2026-06-18	Refuerzo Lengua 2º ESO A/B Juan José	966
1010	42	7	7	rmvegac01	2026-02-19	2º GS Proyecto. Rosa	1009
1011	42	7	7	rmvegac01	2026-02-26	2º GS Proyecto. Rosa	1009
1012	42	7	7	rmvegac01	2026-03-05	2º GS Proyecto. Rosa	1009
1013	42	7	7	rmvegac01	2026-03-12	2º GS Proyecto. Rosa	1009
1014	42	7	7	rmvegac01	2026-03-19	2º GS Proyecto. Rosa	1009
1015	42	7	7	rmvegac01	2026-03-26	2º GS Proyecto. Rosa	1009
1016	42	7	7	rmvegac01	2026-04-02	2º GS Proyecto. Rosa	1009
1017	42	7	7	rmvegac01	2026-04-09	2º GS Proyecto. Rosa	1009
1018	42	7	7	rmvegac01	2026-04-16	2º GS Proyecto. Rosa	1009
1019	42	7	7	rmvegac01	2026-04-23	2º GS Proyecto. Rosa	1009
1020	42	7	7	rmvegac01	2026-04-30	2º GS Proyecto. Rosa	1009
1021	42	7	7	rmvegac01	2026-05-07	2º GS Proyecto. Rosa	1009
1022	42	7	7	rmvegac01	2026-05-14	2º GS Proyecto. Rosa	1009
1023	42	7	7	rmvegac01	2026-05-21	2º GS Proyecto. Rosa	1009
1024	42	7	7	rmvegac01	2026-05-28	2º GS Proyecto. Rosa	1009
1025	42	7	7	rmvegac01	2026-06-04	2º GS Proyecto. Rosa	1009
1026	42	7	7	rmvegac01	2026-06-11	2º GS Proyecto. Rosa	1009
1027	42	7	7	rmvegac01	2026-06-18	2º GS Proyecto. Rosa	1009
1028	14	2	2	lmoralesg04	2026-02-19	Itin. Empl. 1º CFGB Luis	988
1029	14	2	2	lmoralesg04	2026-02-26	Itin. Empl. 1º CFGB Luis	988
1030	14	2	2	lmoralesg04	2026-03-05	Itin. Empl. 1º CFGB Luis	988
1031	14	2	2	lmoralesg04	2026-03-12	Itin. Empl. 1º CFGB Luis	988
1032	14	2	2	lmoralesg04	2026-03-19	Itin. Empl. 1º CFGB Luis	988
1033	14	2	2	lmoralesg04	2026-03-26	Itin. Empl. 1º CFGB Luis	988
1034	14	2	2	lmoralesg04	2026-04-02	Itin. Empl. 1º CFGB Luis	988
1035	14	2	2	lmoralesg04	2026-04-09	Itin. Empl. 1º CFGB Luis	988
1036	14	2	2	lmoralesg04	2026-04-16	Itin. Empl. 1º CFGB Luis	988
1037	14	2	2	lmoralesg04	2026-04-23	Itin. Empl. 1º CFGB Luis	988
1038	14	2	2	lmoralesg04	2026-04-30	Itin. Empl. 1º CFGB Luis	988
1039	14	2	2	lmoralesg04	2026-05-07	Itin. Empl. 1º CFGB Luis	988
1040	14	2	2	lmoralesg04	2026-05-14	Itin. Empl. 1º CFGB Luis	988
1041	14	2	2	lmoralesg04	2026-05-21	Itin. Empl. 1º CFGB Luis	988
1042	14	2	2	lmoralesg04	2026-05-28	Itin. Empl. 1º CFGB Luis	988
1043	14	2	2	lmoralesg04	2026-06-04	Itin. Empl. 1º CFGB Luis	988
1044	14	2	2	lmoralesg04	2026-06-11	Itin. Empl. 1º CFGB Luis	988
1045	14	2	2	lmoralesg04	2026-06-18	Itin. Empl. 1º CFGB Luis	988
1046	14	1	1	lmoralesg04	2026-02-19	Itin. Empl. 1º CFGB Luis	987
1047	14	1	1	lmoralesg04	2026-02-26	Itin. Empl. 1º CFGB Luis	987
1048	14	1	1	lmoralesg04	2026-03-05	Itin. Empl. 1º CFGB Luis	987
1049	14	1	1	lmoralesg04	2026-03-12	Itin. Empl. 1º CFGB Luis	987
1050	14	1	1	lmoralesg04	2026-03-19	Itin. Empl. 1º CFGB Luis	987
1051	14	1	1	lmoralesg04	2026-03-26	Itin. Empl. 1º CFGB Luis	987
1052	14	1	1	lmoralesg04	2026-04-02	Itin. Empl. 1º CFGB Luis	987
1053	14	1	1	lmoralesg04	2026-04-09	Itin. Empl. 1º CFGB Luis	987
1054	14	1	1	lmoralesg04	2026-04-16	Itin. Empl. 1º CFGB Luis	987
1055	14	1	1	lmoralesg04	2026-04-23	Itin. Empl. 1º CFGB Luis	987
1056	14	1	1	lmoralesg04	2026-04-30	Itin. Empl. 1º CFGB Luis	987
1057	14	1	1	lmoralesg04	2026-05-07	Itin. Empl. 1º CFGB Luis	987
1058	14	1	1	lmoralesg04	2026-05-14	Itin. Empl. 1º CFGB Luis	987
1059	14	1	1	lmoralesg04	2026-05-21	Itin. Empl. 1º CFGB Luis	987
1060	14	1	1	lmoralesg04	2026-05-28	Itin. Empl. 1º CFGB Luis	987
1061	14	1	1	lmoralesg04	2026-06-04	Itin. Empl. 1º CFGB Luis	987
1062	14	1	1	lmoralesg04	2026-06-11	Itin. Empl. 1º CFGB Luis	987
1063	14	1	1	lmoralesg04	2026-06-18	Itin. Empl. 1º CFGB Luis	987
1064	45	1	1	mahernandezr06	2026-02-19	Intel. Artif. 1º Bach. Informática	977
1065	45	1	1	mahernandezr06	2026-02-26	Intel. Artif. 1º Bach. Informática	977
1066	45	1	1	mahernandezr06	2026-03-05	Intel. Artif. 1º Bach. Informática	977
1067	45	1	1	mahernandezr06	2026-03-12	Intel. Artif. 1º Bach. Informática	977
1068	45	1	1	mahernandezr06	2026-03-19	Intel. Artif. 1º Bach. Informática	977
1069	45	1	1	mahernandezr06	2026-03-26	Intel. Artif. 1º Bach. Informática	977
1070	45	1	1	mahernandezr06	2026-04-02	Intel. Artif. 1º Bach. Informática	977
1071	45	1	1	mahernandezr06	2026-04-09	Intel. Artif. 1º Bach. Informática	977
1072	45	1	1	mahernandezr06	2026-04-16	Intel. Artif. 1º Bach. Informática	977
1073	45	1	1	mahernandezr06	2026-04-23	Intel. Artif. 1º Bach. Informática	977
1074	45	1	1	mahernandezr06	2026-04-30	Intel. Artif. 1º Bach. Informática	977
1075	45	1	1	mahernandezr06	2026-05-07	Intel. Artif. 1º Bach. Informática	977
1076	45	1	1	mahernandezr06	2026-05-14	Intel. Artif. 1º Bach. Informática	977
1077	45	1	1	mahernandezr06	2026-05-21	Intel. Artif. 1º Bach. Informática	977
1078	45	1	1	mahernandezr06	2026-05-28	Intel. Artif. 1º Bach. Informática	977
1079	45	1	1	mahernandezr06	2026-06-04	Intel. Artif. 1º Bach. Informática	977
1080	45	1	1	mahernandezr06	2026-06-11	Intel. Artif. 1º Bach. Informática	977
1081	45	1	1	mahernandezr06	2026-06-18	Intel. Artif. 1º Bach. Informática	977
1082	55	6	6	jjmorcillor01	2026-02-19	Latín 4º B Juan José	972
1083	55	6	6	jjmorcillor01	2026-02-26	Latín 4º B Juan José	972
1084	55	6	6	jjmorcillor01	2026-03-05	Latín 4º B Juan José	972
1085	55	6	6	jjmorcillor01	2026-03-12	Latín 4º B Juan José	972
1086	55	6	6	jjmorcillor01	2026-03-19	Latín 4º B Juan José	972
1087	55	6	6	jjmorcillor01	2026-03-26	Latín 4º B Juan José	972
1088	55	6	6	jjmorcillor01	2026-04-02	Latín 4º B Juan José	972
1089	55	6	6	jjmorcillor01	2026-04-09	Latín 4º B Juan José	972
1090	55	6	6	jjmorcillor01	2026-04-16	Latín 4º B Juan José	972
1091	55	6	6	jjmorcillor01	2026-04-23	Latín 4º B Juan José	972
1092	55	6	6	jjmorcillor01	2026-04-30	Latín 4º B Juan José	972
1093	55	6	6	jjmorcillor01	2026-05-07	Latín 4º B Juan José	972
1094	55	6	6	jjmorcillor01	2026-05-14	Latín 4º B Juan José	972
1095	55	6	6	jjmorcillor01	2026-05-21	Latín 4º B Juan José	972
1096	55	6	6	jjmorcillor01	2026-05-28	Latín 4º B Juan José	972
1097	55	6	6	jjmorcillor01	2026-06-04	Latín 4º B Juan José	972
1098	55	6	6	jjmorcillor01	2026-06-11	Latín 4º B Juan José	972
1099	55	6	6	jjmorcillor01	2026-06-18	Latín 4º B Juan José	972
1100	62	5	5	rencinasr02	2026-02-19	Mates NB 2º ESO A Raquel	963
1101	62	5	5	rencinasr02	2026-02-26	Mates NB 2º ESO A Raquel	963
1102	62	5	5	rencinasr02	2026-03-05	Mates NB 2º ESO A Raquel	963
1103	62	5	5	rencinasr02	2026-03-12	Mates NB 2º ESO A Raquel	963
1104	62	5	5	rencinasr02	2026-03-19	Mates NB 2º ESO A Raquel	963
1105	62	5	5	rencinasr02	2026-03-26	Mates NB 2º ESO A Raquel	963
1106	62	5	5	rencinasr02	2026-04-02	Mates NB 2º ESO A Raquel	963
1107	62	5	5	rencinasr02	2026-04-09	Mates NB 2º ESO A Raquel	963
1108	62	5	5	rencinasr02	2026-04-16	Mates NB 2º ESO A Raquel	963
1109	62	5	5	rencinasr02	2026-04-23	Mates NB 2º ESO A Raquel	963
1110	62	5	5	rencinasr02	2026-04-30	Mates NB 2º ESO A Raquel	963
1111	62	5	5	rencinasr02	2026-05-07	Mates NB 2º ESO A Raquel	963
1112	62	5	5	rencinasr02	2026-05-14	Mates NB 2º ESO A Raquel	963
1113	62	5	5	rencinasr02	2026-05-21	Mates NB 2º ESO A Raquel	963
1114	62	5	5	rencinasr02	2026-05-28	Mates NB 2º ESO A Raquel	963
1115	62	5	5	rencinasr02	2026-06-04	Mates NB 2º ESO A Raquel	963
1116	62	5	5	rencinasr02	2026-06-11	Mates NB 2º ESO A Raquel	963
1117	62	5	5	rencinasr02	2026-06-18	Mates NB 2º ESO A Raquel	963
1118	22	2	2	jjmorcillor01	2026-02-13	Latín 1º Bach. Juan José	995
1119	22	2	2	jjmorcillor01	2026-02-20	Latín 1º Bach. Juan José	995
1120	22	2	2	jjmorcillor01	2026-02-27	Latín 1º Bach. Juan José	995
1121	22	2	2	jjmorcillor01	2026-03-06	Latín 1º Bach. Juan José	995
1122	22	2	2	jjmorcillor01	2026-03-13	Latín 1º Bach. Juan José	995
1123	22	2	2	jjmorcillor01	2026-03-20	Latín 1º Bach. Juan José	995
1124	22	2	2	jjmorcillor01	2026-03-27	Latín 1º Bach. Juan José	995
1125	22	2	2	jjmorcillor01	2026-04-03	Latín 1º Bach. Juan José	995
1126	22	2	2	jjmorcillor01	2026-04-10	Latín 1º Bach. Juan José	995
1127	22	2	2	jjmorcillor01	2026-04-17	Latín 1º Bach. Juan José	995
1128	22	2	2	jjmorcillor01	2026-04-24	Latín 1º Bach. Juan José	995
1129	22	2	2	jjmorcillor01	2026-05-01	Latín 1º Bach. Juan José	995
1130	22	2	2	jjmorcillor01	2026-05-08	Latín 1º Bach. Juan José	995
1131	22	2	2	jjmorcillor01	2026-05-15	Latín 1º Bach. Juan José	995
1132	22	2	2	jjmorcillor01	2026-05-22	Latín 1º Bach. Juan José	995
1133	22	2	2	jjmorcillor01	2026-05-29	Latín 1º Bach. Juan José	995
1134	22	2	2	jjmorcillor01	2026-06-05	Latín 1º Bach. Juan José	995
1135	22	2	2	jjmorcillor01	2026-06-12	Latín 1º Bach. Juan José	995
1136	22	2	2	jjmorcillor01	2026-06-19	Latín 1º Bach. Juan José	995
1615	41	1	1	mdcpalaciosr01	2026-02-25	ambito practico	\N
1636	30	1	7	emurielb76	2026-03-04	Reserva provisional	\N
1657	45	1	7	emurielb76	2026-05-18	Preparación Evaluación de Diagnóstico 2º ESO	\N
1711	30	3	5	emurielb76	2026-02-25	Fotos orla 2º bach y ciclos gm y gs	\N
1733	45	6	6	bfernandezt07	2026-02-23	FP básica 1º	\N
1767	30	4	4	amfajardol01	2026-03-03	ALBA examen AH GM	\N
1790	14	1	1	mtmarting03	2026-04-01	MAITE	\N
1963	14	3	3	omsanchezg01	2026-03-13	Olga 3º Diver	\N
\.


--
-- Data for Name: reservas_estancias_repeticion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reservas_estancias_repeticion (id, uid, profesor, idestancia, idperiodo_inicio, idperiodo_fin, created_at, fecha_desde, fecha_hasta, descripcion, frecuencia, dias_semana) FROM stdin;
1018	emurielb76	cblancoa02	55	6	6	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Economía 4º ESO Cristina Blanco	semanal	{0,4}
1013	emurielb76	celita2	63	5	5	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Biología 2º Bach Celia	semanal	{0}
1002	emurielb76	mgranadob01	22	6	6	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Atendida por Matilde	semanal	{0}
993	emurielb76	jjmorcillor01	22	3	3	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Latín 1º Bach. Juan José	semanal	{0}
999	emurielb76	pagarciam27	22	4	4	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	Atendida por Patricia	semanal	{2,3}
990	emurielb76	mtmarting03	14	3	3	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	MAITE	semanal	{0}
1007	emurielb76	rmvegac01	42	3	5	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	2º GS Optativa. Rosa	semanal	{0}
1000	emurielb76	mji3003	22	5	5	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Atendida por Inma	semanal	{0}
981	emurielb76	cblancoa02	43	3	3	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Economía 1º Bach. Cristina Blanco	semanal	{0,3}
1023	emurielb76	mahernandezr06	45	3	3	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Digit. Básica 1º ESO A/B Miguel	semanal	{0}
986	emurielb76	lmoralesg04	14	6	6	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Itin. Empl. 1º CFGB Luis	semanal	{1}
985	emurielb76	lmoralesg04	14	3	3	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Itin. Empl. 1º CFGB Luis	semanal	{1}
1017	emurielb76	celita2	40	6	6	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Biología 2º Bach Celia	semanal	{1}
1021	emurielb76	jrodriguezt18	45	5	5	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Unión Europea Jorge 4º ESO	semanal	{1}
1033	emurielb76	vpalaciosg06	45	3	3	2026-02-12 12:51:34.675032	2025-10-17	2026-06-19	1º Bach AE. Virginia	semanal	{4}
1001	emurielb76	mji3003	22	6	6	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Atendida por Inma	semanal	{1}
996	emurielb76	mji3003	22	4	4	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Atendida por Inma	semanal	{0,4}
994	emurielb76	jjmorcillor01	22	5	5	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Latín 1º Bach. Juan José	semanal	{1,3}
980	emurielb76	cblancoa02	43	5	5	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Econ. Empr. 1º Bach. Cristina Blanco	semanal	{1,3}
1040	emurielb76	pety78	42	7	7	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	1º GS Digitalización. Peti	semanal	{2}
1024	emurielb76	mahernandezr06	45	5	5	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	Digit. Básica 1º ESO A/B Miguel	semanal	{2}
1019	emurielb76	cblancoa02	55	5	5	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	Economía 4º ESO Cristina Blanco	semanal	{2}
1015	emurielb76	egonzalezh18	63	5	5	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	CC Grales 2º Bach Elena G.	semanal	{2}
1011	emurielb76	celita2	63	2	2	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	Biología 2º Bach Celia	semanal	{2}
1005	emurielb76	pety78	42	3	3	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	1º GM Digitalización. Peti	semanal	{2}
1009	emurielb76	rmvegac01	42	7	7	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	2º GS Proyecto. Rosa	semanal	{3}
988	emurielb76	lmoralesg04	14	2	2	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	Itin. Empl. 1º CFGB Luis	semanal	{3}
987	emurielb76	lmoralesg04	14	1	1	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	Itin. Empl. 1º CFGB Luis	semanal	{3}
977	emurielb76	mahernandezr06	45	1	1	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	Intel. Artif. 1º Bach. Informática	semanal	{3}
995	emurielb76	jjmorcillor01	22	2	2	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Latín 1º Bach. Juan José	semanal	{4}
1012	emurielb76	celita2	63	5	5	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Biología 2º Bach Celia	semanal	{4}
1004	emurielb76	mgranadob01	22	5	5	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Atendida por Matilde	semanal	{4}
984	emurielb76	cblancoa02	43	7	7	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Economía 1º Bach. Cristina Blanco	semanal	{4}
983	emurielb76	cblancoa02	43	2	2	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Econ. Empr. 1º Bach. Cristina Blanco	semanal	{4}
1026	emurielb76	mahernandezr06	45	5	5	2026-02-12 12:51:34.675032	2025-09-22	2026-06-19	Digitalización 4º ESO A/B Miguel	semanal	{0,3}
1029	emurielb76	mahernandezr06	45	3	3	2026-02-12 12:51:34.675032	2025-09-23	2026-06-19	Intel. Artif. 1º Bach. Miguel	semanal	{1}
1022	emurielb76	bpconejero78	45	2	2	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Intel. Artif. 1º Bach. Miguel	semanal	{0,2}
1031	emurielb76	mahernandezr06	45	6	6	2026-02-12 12:51:34.675032	2025-09-24	2026-06-19	Digitalización 4º ESO A/B Miguel	semanal	{2}
1030	emurielb76	mahernandezr06	45	1	1	2026-02-12 12:51:34.675032	2025-09-24	2026-06-19	TyD  2º ESO A Miguel	semanal	{2}
1032	emurielb76	mahernandezr06	45	5	5	2026-02-12 12:51:34.675032	2025-09-26	2026-06-19	TyD  2º ESO A Miguel	semanal	{4}
1037	emurielb76	cblancoa02	43	2	2	2026-02-12 12:51:34.675032	2025-10-28	2026-06-19	Economía 1º Bach. Cristina Blanco	semanal	{1}
1038	vpalaciosg06	mgperezr02	41	5	5	2026-02-12 12:51:34.675032	2025-11-06	2026-06-30	GRANI - FYOPP	diaria	{}
1041	vpalaciosg06	mgperezr02	41	6	6	2026-02-12 12:51:34.675032	2025-12-03	2026-06-30	GRANI - FYOPP	semanal	{2}
1035	vpalaciosg06	mgperezr02	41	5	5	2026-02-12 12:51:34.675032	2025-10-20	2026-06-30	GRANI - FYOPP	mensual	{}
1028	emurielb76	mahernandezr06	45	7	7	2026-02-12 12:51:34.675032	2025-09-22	2026-06-19	TyD 2º ESO B Miguel	semanal	{0,3}
991	emurielb76	mtmarting03	14	6	6	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	MAITE	semanal	{0}
989	emurielb76	mtmarting03	14	1	1	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	MAITE	semanal	{0}
1014	emurielb76	egonzalezh18	63	6	6	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	CC Grales 2º Bach Elena G.	semanal	{0,3,4}
992	emurielb76	mtmarting03	14	2	2	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	MAITE	semanal	{2}
1036	emurielb76	mtmarting03	14	5	5	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	MAITE	semanal	{2}
1039	emurielb76	rencinasr02	63	2	2	2026-02-12 12:51:34.675032	2025-11-20	2026-06-30	Raquel apoyo	semanal	{3}
998	emurielb76	cjlozanop01	22	4	4	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Atendida por Carlos	semanal	{1}
1027	emurielb76	mahernandezr06	45	5	5	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Digitalización 4º ESO A/B Miguel	semanal	{0,3}
969	emurielb76	rencinasr02	55	7	7	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Matem. A 4º ESO Raquel	semanal	{0}
958	emurielb76	amfajardol01	8	2	2	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Biología NB 1º ESO A Alba Fajardo	semanal	{0,2}
962	emurielb76	rencinasr02	62	2	2	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Mates NB 2º ESO A Raquel	semanal	{0,2}
965	emurielb76	jjmorcillor01	62	6	6	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Refuerzo Lengua 2º ESO A/B Juan José	semanal	{1}
971	emurielb76	rencinasr02	55	3	3	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Matem. A 4º ESO Raquel	semanal	{1,2}
970	emurielb76	jjmorcillor01	55	1	1	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Latín 4º B Juan José	semanal	{1}
961	emurielb76	micostad01	8	5	5	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	Refuerzo Lengua 1º ESO A/B Maribel	semanal	{2}
982	emurielb76	cblancoa02	43	6	6	2026-02-12 12:51:34.675032	2025-09-10	2026-06-19	Economía 1º Bach. Cristina Blanco	semanal	{2}
966	emurielb76	jjmorcillor01	62	3	3	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	Refuerzo Lengua 2º ESO A/B Juan José	semanal	{3}
972	emurielb76	jjmorcillor01	55	6	6	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	Latín 4º B Juan José	semanal	{3}
963	emurielb76	rencinasr02	62	5	5	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	Mates NB 2º ESO A Raquel	semanal	{3}
974	emurielb76	rencinasr02	55	5	5	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Matem. A 4º ESO Raquel	semanal	{4}
973	emurielb76	jjmorcillor01	55	3	3	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Latín 4º B Juan José	semanal	{4}
964	emurielb76	rencinasr02	62	1	1	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Mates NB 2º ESO A Raquel	semanal	{4}
959	emurielb76	amfajardol01	8	3	3	2026-02-12 12:51:34.675032	2025-09-12	2026-06-19	Biología NB 1º ESO A Alba Fajardo	semanal	{4}
1042	emurielb76	mahernandezr06	45	7	7	2026-02-19 11:11:39.511579	2026-02-19	2026-06-30	TyD 2º ESO B	semanal	{0,3}
1043	emurielb76	mahernandezr06	45	6	6	2026-02-19 11:13:11.724947	2026-02-25	2026-06-30	 Digitalización 4º ESO A/B	semanal	{2}
1044	emurielb76	cjlozanop01	63	7	7	2026-03-11 10:32:56.038071	2026-03-12	2026-06-30	Filosofía 2º Bach B	semanal	{1,3,4}
960	emurielb76	lpcamarac01	8	3	3	2026-02-12 12:51:34.675032	2025-09-08	2026-06-19	Refuerzo Lengua 1º ESO A/B Maribel	semanal	{0}
967	emurielb76	bpconejero78	63	6	6	2026-02-12 12:51:34.675032	2025-09-09	2026-06-19	Refuerzo Mates 2º ESO A/B INFORM.	semanal	{1}
968	emurielb76	bpconejero78	63	3	3	2026-02-12 12:51:34.675032	2025-09-11	2026-06-19	Refuerzo Mates 2º ESO A/B INFORM.	semanal	{3}
1045	emurielb76	mji3003	22	4	4	2026-03-17 10:12:52.93439	2026-03-27	2026-06-30	Atendida por Inma	semanal	{4}
\.


--
-- Data for Name: restricciones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.restricciones (id, tipo, restriccion, descripcion, valor_num, valor_bool, rangos_bloqueados_json) FROM stdin;
196	llaves	llaves	reserva_previa	0	t	{"usuarios": ["chisco", "tecnicos", "ordenanza"]}
281	asuntos	asuntos	dias	4	f	\N
282	asuntos	asuntos	antelacion_min	15	f	\N
283	asuntos	asuntos	concurrentes	2	f	\N
284	asuntos	asuntos	antelacion_max	90	f	\N
285	asuntos	asuntos	mostrar_peticiones_dia	0	f	\N
286	asuntos	asuntos	consecutivos	2	f	\N
287	asuntos	asuntos	ofuscar	0	t	\N
11	asuntos	asuntos	rangos_bloqueados	0	f	{"rango_bloqueado": [{"fin": "2025-11-28", "inicio": "2025-11-27", "motivo": "Puente Docente"}, {"fin": "2026-01-07", "inicio": "2025-12-23", "motivo": "Navidad"}, {"fin": "2026-03-20", "inicio": "2026-03-16", "motivo": "erasmus + Profesores"}, {"fin": "2026-03-27", "inicio": "2026-03-23", "motivo": "erasmus +"}, {"fin": "2026-04-17", "inicio": "2026-04-13", "motivo": ""}, {"fin": "2026-05-14", "inicio": "2026-05-12", "motivo": ""}, {"fin": "2026-05-20", "inicio": "2026-05-19", "motivo": "Eval. diagnóstico 2º ESO"}, {"fin": "2026-05-22", "inicio": "2026-05-21", "motivo": ""}, {"fin": "2026-06-04", "inicio": "2026-06-02", "motivo": "PAU"}, {"fin": "2026-04-23", "inicio": "2026-04-23", "motivo": "Día del Centro"}, {"fin": "2026-06-22", "inicio": "2026-06-22", "motivo": "Eval. ordinaria ESO"}, {"fin": "2026-06-29", "inicio": "2026-06-24", "motivo": "Evaluaciones, reclamaciones, ccp final y claustro final."}, {"fin": "2026-06-19", "inicio": "2026-06-17", "motivo": "Evaluaciones "}]}
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
JDmC3TWcdTQxgeKrNZljB3E7eQS0XROa	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-24T08:22:24.470Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=ordenanza,ou=People,dc=instituto,dc=extremadura,dc=es","password":"ordenanza","employeeNumber":"12341234A","givenName":"Ordenanza","sn":"Ordenanza"},"user":{"username":"ordenanza","perfil":"ordenanza"}}	2026-03-25 08:21:39
-lQLBXBDaoDjrxpdq1sBMLAlpcsGFaGZ	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-24T11:51:18.500Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=lpcamarac01,ou=People,dc=instituto,dc=extremadura,dc=es","password":"76029212K","employeeNumber":"76029212K","givenName":"Luis Pedro","sn":"Camara Casares"},"user":{"username":"lpcamarac01","perfil":"profesor"}}	2026-03-25 07:46:56
Z9ZWPc80K9EDH7k1K4adg1esjcBiE4uz	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T08:51:00.078Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=emparrag02,ou=People,dc=instituto,dc=extremadura,dc=es","password":"8896503B","employeeNumber":"8896503B","givenName":"Elisa María","sn":"Parra Gómez"},"user":{"username":"emparrag02","perfil":"profesor"}}	2026-03-25 12:45:35
MWWqyZ8-Lz3uyXm6uYhd_rzeY8Xwwm9f	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T12:16:24.942Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"cn=admin,ou=People,dc=instituto,dc=extremadura,dc=es","password":"proc,7key","employeeNumber":null,"givenName":"","sn":""}}	2026-03-25 12:43:24
CKQW8qFGQfXhnBE5ruK9RU728XtC55Gv	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T11:48:13.234Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=bpconejero78,ou=People,dc=instituto,dc=extremadura,dc=es","password":"76024887C","employeeNumber":"76024887C","givenName":"Belen","sn":"Perez Conejero"},"user":{"username":"bpconejero78","perfil":"profesor"}}	2026-03-25 11:48:21
y6RN445epN53F_vFdSTeq-wa6-mLR5Mb	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T07:45:09.511Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=emurielb76,ou=People,dc=instituto,dc=extremadura,dc=es","password":"28942766A","employeeNumber":"28942766A","givenName":"Maria Elena","sn":"Muriel Blanco"},"user":{"username":"emurielb76","perfil":"directiva"}}	2026-03-25 10:36:39
X375estdC1JnEI4w4Rrv3_o_I1Mzt36r	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-24T11:24:56.422Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=djuliog01,ou=People,dc=instituto,dc=extremadura,dc=es","password":"28954341D","employeeNumber":"28954341D","givenName":"Diana","sn":"Julio Garcia"},"user":{"username":"djuliog01","perfil":"profesor"}}	2026-03-25 09:14:56
A3j7UQd-19-bQO0vyHjCjJ9AZKOeVGcK	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T08:32:24.541Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=ordenanza,ou=People,dc=instituto,dc=extremadura,dc=es","password":"ordenanza","employeeNumber":"12341234A","givenName":"Ordenanza","sn":"Ordenanza"},"user":{"username":"ordenanza","perfil":"ordenanza"}}	2026-03-25 12:06:22
V0eELQiAnxJksIYGKOWHMRDfCmHmjJ7B	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T09:23:11.127Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=omsanchezg01,ou=People,dc=instituto,dc=extremadura,dc=es","password":"28955973P","employeeNumber":"28955973P","givenName":"Olga Maria","sn":"Sanchez Gutierrez"},"user":{"username":"omsanchezg01","perfil":"profesor"}}	2026-03-25 09:23:19
bon-MpE-UvVgRhPVfKgk_olKZCpmhJdi	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T12:04:46.707Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=chisco,ou=People,dc=instituto,dc=extremadura,dc=es","password":"19ZooPAniC88","employeeNumber":"75539734Y","givenName":"Francisco Damian","sn":"Mendez Palma"},"user":{"username":"chisco","perfil":"directiva"}}	2026-03-25 12:42:35
NjH44wFltkDPDOIDe-QjZj8z4cv-pzlO	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T08:34:19.691Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=celita2,ou=People,dc=instituto,dc=extremadura,dc=es","password":"44777597R","employeeNumber":"44777597R","givenName":"Celia","sn":"Garcia la Orden"},"user":{"username":"celita2","perfil":"profesor"}}	2026-03-25 08:43:21
pfpsZHJ7gR1rokemhiJ573Zihja6okRN	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T10:15:35.802Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=cjlozanop01,ou=People,dc=instituto,dc=extremadura,dc=es","password":"7008628E","employeeNumber":"7008628E","givenName":"Carlos Jesús","sn":"Lozano Palacios"},"user":{"username":"cjlozanop01","perfil":"profesor"}}	2026-03-25 10:15:46
XNuEpGLVM9SrzfBkaGJcO2zBvkm485zV	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T07:50:26.652Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=amfajardol01,ou=People,dc=instituto,dc=extremadura,dc=es","password":"76041041M","employeeNumber":"76041041M","givenName":"Alba María","sn":"Fajardo Lindo"},"user":{"username":"amfajardol01","perfil":"profesor"}}	2026-03-25 07:52:49
MvF_RQwZQgreu4gq0P_LW4VHVNSZu_rz	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-24T13:17:25.866Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=ndelorzac02,ou=People,dc=instituto,dc=extremadura,dc=es","password":"11814307N","employeeNumber":"11814307N","givenName":"Nieves de","sn":"Lorza Campanario"},"user":{"username":"ndelorzac02","perfil":"profesor"}}	2026-03-25 10:17:05
dCmzp8oYpJqRFEG--idgHIjqMonp4sv2	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T12:45:08.889Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=vpalaciosg06,ou=People,dc=instituto,dc=extremadura,dc=es","password":"28940302T","employeeNumber":"28940302T","givenName":"Virginia","sn":"Palacios Garcia"},"user":{"username":"vpalaciosg06","perfil":"directiva"}}	2026-03-25 12:46:10
719VpLT9mhNBvt0YvhaUAbzKOpBOFmtd	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T11:52:16.412Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=jrodriguezt18,ou=People,dc=instituto,dc=extremadura,dc=es","password":"28950330T","employeeNumber":"28950330T","givenName":"Jorge","sn":"Rodriguez Timon"},"user":{"username":"jrodriguezt18","perfil":"profesor"}}	2026-03-25 11:53:31
BO5rLiClEmG1rzyDFhcMgUT_BH-lP45g	{"cookie":{"originalMaxAge":86400000,"expires":"2026-03-25T10:19:16.490Z","secure":true,"httpOnly":true,"path":"/","sameSite":"lax"},"ldap":{"dn":"uid=ilozano1977,ou=People,dc=instituto,dc=extremadura,dc=es","password":"7050749F","employeeNumber":"7050749F","givenName":"Isabel","sn":"Lozano Panadero"},"user":{"username":"ilozano1977","perfil":"profesor"}}	2026-03-25 10:20:14
\.


--
-- Name: api_cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.api_cursos_id_seq', 4, true);


--
-- Name: asuntos_permitidos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asuntos_permitidos_id_seq', 6, true);


--
-- Name: asuntos_propios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asuntos_propios_id_seq', 1757, true);


--
-- Name: ausencias_profesorado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ausencias_profesorado_id_seq', 1, false);


--
-- Name: avisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.avisos_id_seq', 36, true);


--
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursos_id_seq', 8, true);


--
-- Name: estancias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estancias_id_seq', 89, true);


--
-- Name: extraescolares_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.extraescolares_id_seq', 188, true);


--
-- Name: guardias_asignadas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.guardias_asignadas_id_seq', 1, false);


--
-- Name: horario_profesorado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.horario_profesorado_id_seq', 13123, true);


--
-- Name: libros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libros_id_seq', 52, true);


--
-- Name: materias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materias_id_seq', 111, true);


--
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.perfiles_usuario_id_seq', 18, true);


--
-- Name: periodos_horarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.periodos_horarios_id_seq', 7, true);


--
-- Name: prestamos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_id_seq', 3771, true);


--
-- Name: prestamos_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_items_id_seq', 3411, true);


--
-- Name: prestamos_llaves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_llaves_id_seq', 1181, true);


--
-- Name: reservas_estancias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_estancias_id_seq', 2364, true);


--
-- Name: reservas_estancias_repeticion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reservas_estancias_repeticion_id_seq', 1045, true);


--
-- Name: restricciones_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.restricciones_id_seq', 287, true);


--
-- Name: asuntos_permitidos asuntos_permitidos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asuntos_permitidos
    ADD CONSTRAINT asuntos_permitidos_pkey PRIMARY KEY (id);


--
-- Name: asuntos_permitidos asuntos_permitidos_uid_fecha_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asuntos_permitidos
    ADD CONSTRAINT asuntos_permitidos_uid_fecha_key UNIQUE (uid, fecha);


--
-- Name: permisos asuntos_propios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT asuntos_propios_pkey PRIMARY KEY (id);


--
-- Name: ausencias_profesorado ausencias_profesorado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ausencias_profesorado
    ADD CONSTRAINT ausencias_profesorado_pkey PRIMARY KEY (id);


--
-- Name: avisos avisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.avisos
    ADD CONSTRAINT avisos_pkey PRIMARY KEY (id);


--
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- Name: estancias estancias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias
    ADD CONSTRAINT estancias_pkey PRIMARY KEY (id);


--
-- Name: extraescolares extraescolares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares
    ADD CONSTRAINT extraescolares_pkey PRIMARY KEY (id);


--
-- Name: guardias_asignadas guardias_asignadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardias_asignadas
    ADD CONSTRAINT guardias_asignadas_pkey PRIMARY KEY (id);


--
-- Name: horario_profesorado horario_profesorado_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_profesorado
    ADD CONSTRAINT horario_profesorado_pkey PRIMARY KEY (id);


--
-- Name: libros libros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libros
    ADD CONSTRAINT libros_pkey PRIMARY KEY (id);


--
-- Name: materias materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias
    ADD CONSTRAINT materias_pkey PRIMARY KEY (id);


--
-- Name: perfiles_usuario perfiles_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_pkey PRIMARY KEY (id);


--
-- Name: perfiles_usuario perfiles_usuario_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_uid_key UNIQUE (uid);


--
-- Name: periodos_horarios periodos_horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_horarios
    ADD CONSTRAINT periodos_horarios_pkey PRIMARY KEY (id);


--
-- Name: prestamos_items prestamos_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_items
    ADD CONSTRAINT prestamos_items_pkey PRIMARY KEY (id);


--
-- Name: prestamos_llaves prestamos_llaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_pkey PRIMARY KEY (id);


--
-- Name: prestamos prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_pkey PRIMARY KEY (id);


--
-- Name: reservas_estancias reservas_estancias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_estancias
    ADD CONSTRAINT reservas_estancias_pkey PRIMARY KEY (id);


--
-- Name: reservas_estancias_repeticion reservas_estancias_repeticion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_estancias_repeticion
    ADD CONSTRAINT reservas_estancias_repeticion_pkey PRIMARY KEY (id);


--
-- Name: restricciones restricciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restricciones
    ADD CONSTRAINT restricciones_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: empleados usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (uid);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: horario_profesorado_guardia_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX horario_profesorado_guardia_unique ON public.horario_profesorado USING btree (uid, dia_semana, idperiodo, curso_academico) WHERE ((tipo)::text = 'guardia'::text);


--
-- Name: idx_ausencias_profesor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ausencias_profesor ON public.ausencias_profesorado USING btree (uid_profesor);


--
-- Name: idx_ausencias_rango; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_ausencias_rango ON public.ausencias_profesorado USING btree (fecha_inicio, fecha_fin);


--
-- Name: idx_guardias_ausente; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardias_ausente ON public.guardias_asignadas USING btree (uid_profesor_ausente);


--
-- Name: idx_guardias_cubridor; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardias_cubridor ON public.guardias_asignadas USING btree (uid_profesor_cubridor);


--
-- Name: idx_guardias_estado; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardias_estado ON public.guardias_asignadas USING btree (estado);


--
-- Name: idx_guardias_fecha; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardias_fecha ON public.guardias_asignadas USING btree (fecha);


--
-- Name: idx_guardias_fecha_periodo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_guardias_fecha_periodo ON public.guardias_asignadas USING btree (fecha, idperiodo);


--
-- Name: idx_horario_curso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_curso ON public.horario_profesorado USING btree (curso_academico);


--
-- Name: idx_horario_dia_periodo; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_dia_periodo ON public.horario_profesorado USING btree (dia_semana, idperiodo);


--
-- Name: idx_horario_uid; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_uid ON public.horario_profesorado USING btree (uid);


--
-- Name: idx_horario_uid_dia_curso; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_horario_uid_dia_curso ON public.horario_profesorado USING btree (uid, dia_semana, curso_academico);


--
-- Name: permisos_uid_fecha_tipo_uk; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX permisos_uid_fecha_tipo_uk ON public.permisos USING btree (uid, fecha, tipo);


--
-- Name: extraescolares trigger_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON public.extraescolares FOR EACH ROW EXECUTE FUNCTION public.actualizar_updated_at();


--
-- Name: ausencias_profesorado ausencias_profesorado_idperiodo_fin_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ausencias_profesorado
    ADD CONSTRAINT ausencias_profesorado_idperiodo_fin_fkey FOREIGN KEY (idperiodo_fin) REFERENCES public.periodos_horarios(id);


--
-- Name: ausencias_profesorado ausencias_profesorado_idperiodo_inicio_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ausencias_profesorado
    ADD CONSTRAINT ausencias_profesorado_idperiodo_inicio_fkey FOREIGN KEY (idperiodo_inicio) REFERENCES public.periodos_horarios(id);


--
-- Name: guardias_asignadas guardias_asignadas_idperiodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.guardias_asignadas
    ADD CONSTRAINT guardias_asignadas_idperiodo_fkey FOREIGN KEY (idperiodo) REFERENCES public.periodos_horarios(id);


--
-- Name: horario_profesorado horario_profesorado_idmateria_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_profesorado
    ADD CONSTRAINT horario_profesorado_idmateria_fkey FOREIGN KEY (idmateria) REFERENCES public.materias(id);


--
-- Name: horario_profesorado horario_profesorado_idperiodo_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.horario_profesorado
    ADD CONSTRAINT horario_profesorado_idperiodo_fkey FOREIGN KEY (idperiodo) REFERENCES public.periodos_horarios(id);


--
-- Name: prestamos_llaves prestamos_llaves_idestancia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_idestancia_fkey FOREIGN KEY (idestancia) REFERENCES public.estancias(id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict lYYJ05VYnGkrREql9x1ctpKBDsPQ0nOrqsV23ajgLq05dHvEGPFbE8MIDMi7RSJ

