--
-- PostgreSQL database dump
--

\restrict 4Tw9iGYqw9mgq6fpkaSUpVm8Hf0csoMF9YU0fw5so1zvsjQwBcG7rvJzEdHosld

-- Dumped from database version 14.20 (Ubuntu 14.20-1.pgdg22.04+1)
-- Dumped by pg_dump version 18.1 (Ubuntu 18.1-1.pgdg22.04+2)

-- Started on 2025-11-24 13:45:35 CET

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 209 (class 1259 OID 16719)
-- Name: api_cursos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.api_cursos_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_cursos_id_seq OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 232 (class 1259 OID 16829)
-- Name: asuntos_propios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asuntos_propios (
    id integer NOT NULL,
    uid character varying NOT NULL,
    fecha date NOT NULL,
    descripcion text NOT NULL,
    estado integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.asuntos_propios OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16828)
-- Name: asuntos_propios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asuntos_propios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asuntos_propios_id_seq OWNER TO postgres;

--
-- TOC entry 3490 (class 0 OID 0)
-- Dependencies: 231
-- Name: asuntos_propios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asuntos_propios_id_seq OWNED BY public.asuntos_propios.id;


--
-- TOC entry 210 (class 1259 OID 16720)
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id bigint NOT NULL,
    curso character varying NOT NULL
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16725)
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
-- TOC entry 212 (class 1259 OID 16726)
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
-- TOC entry 213 (class 1259 OID 16733)
-- Name: estancias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.estancias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.estancias_id_seq OWNER TO postgres;

--
-- TOC entry 3491 (class 0 OID 0)
-- Dependencies: 213
-- Name: estancias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estancias_id_seq OWNED BY public.estancias.id;


--
-- TOC entry 233 (class 1259 OID 16839)
-- Name: extraescolares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extraescolares_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.extraescolares_id_seq OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16840)
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
    responsables_uids character varying[],
    ubicacion text,
    coords jsonb
);


ALTER TABLE public.extraescolares OWNER TO postgres;

--
-- TOC entry 214 (class 1259 OID 16734)
-- Name: libros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libros (
    id bigint NOT NULL,
    idcurso bigint NOT NULL,
    libro character varying NOT NULL
);


ALTER TABLE public.libros OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16739)
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
-- TOC entry 216 (class 1259 OID 16740)
-- Name: perfiles_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfiles_usuario (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    perfil character varying(50) NOT NULL
);


ALTER TABLE public.perfiles_usuario OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16743)
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.perfiles_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.perfiles_usuario_id_seq OWNER TO postgres;

--
-- TOC entry 3492 (class 0 OID 0)
-- Dependencies: 217
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfiles_usuario_id_seq OWNED BY public.perfiles_usuario.id;


--
-- TOC entry 218 (class 1259 OID 16744)
-- Name: periodos_horarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.periodos_horarios_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.periodos_horarios_id_seq OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16745)
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
-- TOC entry 220 (class 1259 OID 16751)
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
-- TOC entry 221 (class 1259 OID 16759)
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
-- TOC entry 222 (class 1259 OID 16760)
-- Name: prestamos_items_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prestamos_items_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prestamos_items_id_seq OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16761)
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
-- TOC entry 224 (class 1259 OID 16767)
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
-- TOC entry 225 (class 1259 OID 16774)
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
-- TOC entry 226 (class 1259 OID 16775)
-- Name: reservas_estancias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reservas_estancias_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reservas_estancias_id_seq OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16776)
-- Name: reservas_estancias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reservas_estancias (
    id integer DEFAULT nextval('public.reservas_estancias_id_seq'::regclass) NOT NULL,
    idestancia bigint NOT NULL,
    idperiodo_inicio bigint NOT NULL,
    idperiodo_fin bigint NOT NULL,
    uid character varying NOT NULL,
    fecha date,
    descripcion text NOT NULL
);


ALTER TABLE public.reservas_estancias OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16782)
-- Name: restricciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restricciones_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.restricciones_id_seq OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16783)
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
-- TOC entry 230 (class 1259 OID 16789)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 3310 (class 2604 OID 16832)
-- Name: asuntos_propios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asuntos_propios ALTER COLUMN id SET DEFAULT nextval('public.asuntos_propios_id_seq'::regclass);


--
-- TOC entry 3294 (class 2604 OID 16794)
-- Name: estancias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias ALTER COLUMN id SET DEFAULT nextval('public.estancias_id_seq'::regclass);


--
-- TOC entry 3298 (class 2604 OID 16795)
-- Name: perfiles_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario ALTER COLUMN id SET DEFAULT nextval('public.perfiles_usuario_id_seq'::regclass);


--
-- TOC entry 3342 (class 2606 OID 16836)
-- Name: asuntos_propios asuntos_propios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asuntos_propios
    ADD CONSTRAINT asuntos_propios_pkey PRIMARY KEY (id);


--
-- TOC entry 3317 (class 2606 OID 16797)
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- TOC entry 3319 (class 2606 OID 16799)
-- Name: estancias estancias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias
    ADD CONSTRAINT estancias_pkey PRIMARY KEY (id);


--
-- TOC entry 3344 (class 2606 OID 16851)
-- Name: extraescolares extraescolares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares
    ADD CONSTRAINT extraescolares_pkey PRIMARY KEY (id);


--
-- TOC entry 3321 (class 2606 OID 16801)
-- Name: libros libros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libros
    ADD CONSTRAINT libros_pkey PRIMARY KEY (id);


--
-- TOC entry 3323 (class 2606 OID 16803)
-- Name: perfiles_usuario perfiles_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 3325 (class 2606 OID 16805)
-- Name: perfiles_usuario perfiles_usuario_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_uid_key UNIQUE (uid);


--
-- TOC entry 3327 (class 2606 OID 16807)
-- Name: periodos_horarios periodos_horarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.periodos_horarios
    ADD CONSTRAINT periodos_horarios_pkey PRIMARY KEY (id);


--
-- TOC entry 3331 (class 2606 OID 16809)
-- Name: prestamos_items prestamos_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_items
    ADD CONSTRAINT prestamos_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3333 (class 2606 OID 16811)
-- Name: prestamos_llaves prestamos_llaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_pkey PRIMARY KEY (id);


--
-- TOC entry 3329 (class 2606 OID 16813)
-- Name: prestamos prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_pkey PRIMARY KEY (id);


--
-- TOC entry 3335 (class 2606 OID 16815)
-- Name: reservas_estancias reservas_estancias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reservas_estancias
    ADD CONSTRAINT reservas_estancias_pkey PRIMARY KEY (id);


--
-- TOC entry 3337 (class 2606 OID 16817)
-- Name: restricciones restricciones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restricciones
    ADD CONSTRAINT restricciones_pkey PRIMARY KEY (id);


--
-- TOC entry 3340 (class 2606 OID 16819)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3338 (class 1259 OID 16820)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 3345 (class 2606 OID 16821)
-- Name: prestamos_llaves prestamos_llaves_idestancia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_idestancia_fkey FOREIGN KEY (idestancia) REFERENCES public.estancias(id) ON DELETE CASCADE;


-- Completed on 2025-11-24 13:45:35 CET

--
-- PostgreSQL database dump complete
--

\unrestrict 4Tw9iGYqw9mgq6fpkaSUpVm8Hf0csoMF9YU0fw5so1zvsjQwBcG7rvJzEdHosld

