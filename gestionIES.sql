--
-- PostgreSQL database dump
--

\restrict 4KdJH4ycP8zirBJV9RpjN6Xu6iuVjDPB9BPZRHppUkxLZdLLOdesEqd31S6OJ7G

-- Dumped from database version 14.19 (Ubuntu 14.19-1.pgdg22.04+1)
-- Dumped by pg_dump version 18.0 (Ubuntu 18.0-1.pgdg22.04+3)

-- Started on 2025-10-15 10:25:38 CEST

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
-- TOC entry 209 (class 1259 OID 16552)
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
-- TOC entry 210 (class 1259 OID 16553)
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id bigint NOT NULL,
    curso character varying NOT NULL
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 16558)
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
-- TOC entry 212 (class 1259 OID 16559)
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
    codigollave character varying
);


ALTER TABLE public.estancias OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16565)
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
-- TOC entry 3464 (class 0 OID 0)
-- Dependencies: 213
-- Name: estancias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estancias_id_seq OWNED BY public.estancias.id;


--
-- TOC entry 226 (class 1259 OID 16632)
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
-- TOC entry 225 (class 1259 OID 16631)
-- Name: extraescolares_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extraescolares_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.extraescolares_id_seq OWNER TO postgres;

--
-- TOC entry 3465 (class 0 OID 0)
-- Dependencies: 225
-- Name: extraescolares_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.extraescolares_id_seq OWNED BY public.extraescolares.id;


--
-- TOC entry 228 (class 1259 OID 16641)
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
-- TOC entry 227 (class 1259 OID 16640)
-- Name: extraescolares_periodos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.extraescolares_periodos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.extraescolares_periodos_id_seq OWNER TO postgres;

--
-- TOC entry 3466 (class 0 OID 0)
-- Dependencies: 227
-- Name: extraescolares_periodos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.extraescolares_periodos_id_seq OWNED BY public.extraescolares_periodos.id;


--
-- TOC entry 214 (class 1259 OID 16566)
-- Name: libros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libros (
    id bigint NOT NULL,
    idcurso bigint NOT NULL,
    libro character varying NOT NULL
);


ALTER TABLE public.libros OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16571)
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
-- TOC entry 216 (class 1259 OID 16572)
-- Name: perfiles_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfiles_usuario (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    perfil character varying(50) NOT NULL
);


ALTER TABLE public.perfiles_usuario OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16575)
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
-- TOC entry 3467 (class 0 OID 0)
-- Dependencies: 217
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfiles_usuario_id_seq OWNED BY public.perfiles_usuario.id;


--
-- TOC entry 218 (class 1259 OID 16576)
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
-- TOC entry 219 (class 1259 OID 16584)
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
-- TOC entry 220 (class 1259 OID 16585)
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
-- TOC entry 221 (class 1259 OID 16586)
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
-- TOC entry 222 (class 1259 OID 16592)
-- Name: prestamos_llaves; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prestamos_llaves (
    id integer NOT NULL,
    idestancia integer NOT NULL,
    unidades integer DEFAULT 1 NOT NULL,
    fechaentrega timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fechadevolucion timestamp with time zone,
    uid character varying NOT NULL
);


ALTER TABLE public.prestamos_llaves OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16599)
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
-- TOC entry 224 (class 1259 OID 16600)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 3282 (class 2604 OID 16605)
-- Name: estancias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias ALTER COLUMN id SET DEFAULT nextval('public.estancias_id_seq'::regclass);


--
-- TOC entry 3293 (class 2604 OID 16635)
-- Name: extraescolares id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares ALTER COLUMN id SET DEFAULT nextval('public.extraescolares_id_seq'::regclass);


--
-- TOC entry 3294 (class 2604 OID 16644)
-- Name: extraescolares_periodos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares_periodos ALTER COLUMN id SET DEFAULT nextval('public.extraescolares_periodos_id_seq'::regclass);


--
-- TOC entry 3284 (class 2604 OID 16606)
-- Name: perfiles_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario ALTER COLUMN id SET DEFAULT nextval('public.perfiles_usuario_id_seq'::regclass);


--
-- TOC entry 3296 (class 2606 OID 16608)
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- TOC entry 3298 (class 2606 OID 16610)
-- Name: estancias estancias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias
    ADD CONSTRAINT estancias_pkey PRIMARY KEY (id);


--
-- TOC entry 3317 (class 2606 OID 16646)
-- Name: extraescolares_periodos extraescolares_periodos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares_periodos
    ADD CONSTRAINT extraescolares_periodos_pkey PRIMARY KEY (id);


--
-- TOC entry 3315 (class 2606 OID 16639)
-- Name: extraescolares extraescolares_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares
    ADD CONSTRAINT extraescolares_pkey PRIMARY KEY (id);


--
-- TOC entry 3300 (class 2606 OID 16612)
-- Name: libros libros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libros
    ADD CONSTRAINT libros_pkey PRIMARY KEY (id);


--
-- TOC entry 3302 (class 2606 OID 16614)
-- Name: perfiles_usuario perfiles_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 3304 (class 2606 OID 16616)
-- Name: perfiles_usuario perfiles_usuario_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_uid_key UNIQUE (uid);


--
-- TOC entry 3308 (class 2606 OID 16618)
-- Name: prestamos_items prestamos_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_items
    ADD CONSTRAINT prestamos_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3310 (class 2606 OID 16620)
-- Name: prestamos_llaves prestamos_llaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_pkey PRIMARY KEY (id);


--
-- TOC entry 3306 (class 2606 OID 16622)
-- Name: prestamos prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_pkey PRIMARY KEY (id);


--
-- TOC entry 3313 (class 2606 OID 16624)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3311 (class 1259 OID 16625)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 3319 (class 2606 OID 16647)
-- Name: extraescolares_periodos extraescolares_periodos_extraescolar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.extraescolares_periodos
    ADD CONSTRAINT extraescolares_periodos_extraescolar_id_fkey FOREIGN KEY (extraescolar_id) REFERENCES public.extraescolares(id) ON DELETE CASCADE;


--
-- TOC entry 3318 (class 2606 OID 16626)
-- Name: prestamos_llaves prestamos_llaves_idestancia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_idestancia_fkey FOREIGN KEY (idestancia) REFERENCES public.estancias(id) ON DELETE CASCADE;


-- Completed on 2025-10-15 10:25:38 CEST

--
-- PostgreSQL database dump complete
--

\unrestrict 4KdJH4ycP8zirBJV9RpjN6Xu6iuVjDPB9BPZRHppUkxLZdLLOdesEqd31S6OJ7G

