--
-- PostgreSQL database dump
--

\restrict 3RIn72vkrEYelkhgg1K6MqOLKG2JixTHa63ydr4G0LMvetgE0crvAZezGDBZdnn

-- Dumped from database version 14.19 (Ubuntu 14.19-1.pgdg22.04+1)
-- Dumped by pg_dump version 14.19 (Ubuntu 14.19-1.pgdg22.04+1)

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
-- Name: asuntos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asuntos (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    descripcion character varying(255) NOT NULL,
    fecha date NOT NULL
);


ALTER TABLE public.asuntos OWNER TO postgres;

--
-- Name: asuntos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asuntos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.asuntos_id_seq OWNER TO postgres;

--
-- Name: asuntos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asuntos_id_seq OWNED BY public.asuntos.id;


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
-- Name: estancias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estancias (
    id integer NOT NULL,
    planta text NOT NULL,
    codigo text NOT NULL,
    descripcion text NOT NULL,
    totalllaves integer DEFAULT 1 NOT NULL,
    coordenadas_json jsonb NOT NULL,
    armario character varying,
    codigollave character varying,
    reservable boolean DEFAULT false
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
-- Name: extraescolares; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.extraescolares (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    fechainicio date NOT NULL,
    fechafin date NOT NULL
);


ALTER TABLE public.extraescolares OWNER TO postgres;

--
-- Name: extraescolares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extraescolares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.extraescolares_id_seq OWNER TO postgres;

--
-- Name: extraescolares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.extraescolares_id_seq OWNED BY public.extraescolares.id;


--
-- Name: extraescolares_periodos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.extraescolares_periodos (
    id integer NOT NULL,
    extraescolar_id integer NOT NULL,
    hora_inicio smallint NOT NULL,
    hora_fin smallint NOT NULL
);


ALTER TABLE public.extraescolares_periodos OWNER TO postgres;

--
-- Name: extraescolares_periodos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extraescolares_periodos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.extraescolares_periodos_id_seq OWNER TO postgres;

--
-- Name: extraescolares_periodos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.extraescolares_periodos_id_seq OWNED BY public.extraescolares_periodos.id;


--
-- Name: libros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libros (
    id bigint NOT NULL,
    idcurso bigint NOT NULL,
    libro character varying NOT NULL
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
-- Name: restricciones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.restricciones (
    id integer NOT NULL,
    tipo character varying(255) NOT NULL,
    restriccion character varying(255) NOT NULL,
    descripcion character varying(255) NOT NULL,
    valor_num integer NOT NULL,
    valor_bool boolean NOT NULL
);


ALTER TABLE public.restricciones OWNER TO postgres;

--
-- Name: restricciones_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.restricciones_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.restricciones_id_seq OWNER TO postgres;

--
-- Name: restricciones_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.restricciones_id_seq OWNED BY public.restricciones.id;


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
-- Name: asuntos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asuntos ALTER COLUMN id SET DEFAULT nextval('public.asuntos_id_seq'::regclass);


--
-- Name: estancias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias ALTER COLUMN id SET DEFAULT nextval('public.estancias_id_seq'::regclass);


--
-- Name: extraescolares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares ALTER COLUMN id SET DEFAULT nextval('public.extraescolares_id_seq'::regclass);


--
-- Name: extraescolares_periodos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares_periodos ALTER COLUMN id SET DEFAULT nextval('public.extraescolares_periodos_id_seq'::regclass);


--
-- Name: perfiles_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario ALTER COLUMN id SET DEFAULT nextval('public.perfiles_usuario_id_seq'::regclass);


--
-- Name: restricciones id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.restricciones ALTER COLUMN id SET DEFAULT nextval('public.restricciones_id_seq'::regclass);


--
-- Name: asuntos asuntos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asuntos
    ADD CONSTRAINT asuntos_pkey PRIMARY KEY (id);


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
-- Name: extraescolares_periodos extraescolares_periodos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares_periodos
    ADD CONSTRAINT extraescolares_periodos_pkey PRIMARY KEY (id);


--
-- Name: extraescolares extraescolares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares
    ADD CONSTRAINT extraescolares_pkey PRIMARY KEY (id);


--
-- Name: libros libros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libros
    ADD CONSTRAINT libros_pkey PRIMARY KEY (id);


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
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: extraescolares_periodos extraescolares_periodos_extraescolar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares_periodos
    ADD CONSTRAINT extraescolares_periodos_extraescolar_id_fkey FOREIGN KEY (extraescolar_id) REFERENCES public.extraescolares(id) ON DELETE CASCADE;


--
-- Name: prestamos_llaves prestamos_llaves_idestancia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_idestancia_fkey FOREIGN KEY (idestancia) REFERENCES public.estancias(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 3RIn72vkrEYelkhgg1K6MqOLKG2JixTHa63ydr4G0LMvetgE0crvAZezGDBZdnn

