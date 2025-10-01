--
-- PostgreSQL database dump
--

\restrict Nfzopoco48qbyQwCca8yLIlMp7RfF2WnyXbLDNeub8Uyh9nnHQ0oUlAVqnixU5E

-- Dumped from database version 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.10 (Ubuntu 16.10-1.pgdg22.04+1)

-- Started on 2025-10-01 09:12:39 CEST

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
-- TOC entry 5 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 3519 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 215 (class 1259 OID 16388)
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
-- TOC entry 216 (class 1259 OID 16389)
-- Name: cursos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cursos (
    id bigint NOT NULL,
    curso character varying NOT NULL
);


ALTER TABLE public.cursos OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16394)
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
-- TOC entry 218 (class 1259 OID 16395)
-- Name: estancias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.estancias (
    id integer NOT NULL,
    planta text NOT NULL,
    codigo text NOT NULL,
    descripcion text NOT NULL,
    totalllaves integer DEFAULT 1 NOT NULL,
    coordenadas_json jsonb NOT NULL
);


ALTER TABLE public.estancias OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16401)
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
-- TOC entry 3520 (class 0 OID 0)
-- Dependencies: 219
-- Name: estancias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.estancias_id_seq OWNED BY public.estancias.id;


--
-- TOC entry 220 (class 1259 OID 16402)
-- Name: libros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libros (
    id bigint NOT NULL,
    idcurso bigint NOT NULL,
    libro character varying NOT NULL
);


ALTER TABLE public.libros OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16407)
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
-- TOC entry 230 (class 1259 OID 16459)
-- Name: perfiles_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfiles_usuario (
    id integer NOT NULL,
    uid character varying(255) NOT NULL,
    perfil character varying(50) NOT NULL
);


ALTER TABLE public.perfiles_usuario OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16458)
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
-- TOC entry 3521 (class 0 OID 0)
-- Dependencies: 229
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfiles_usuario_id_seq OWNED BY public.perfiles_usuario.id;


--
-- TOC entry 222 (class 1259 OID 16408)
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
-- TOC entry 223 (class 1259 OID 16416)
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
-- TOC entry 224 (class 1259 OID 16417)
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
-- TOC entry 225 (class 1259 OID 16418)
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
-- TOC entry 226 (class 1259 OID 16424)
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
-- TOC entry 227 (class 1259 OID 16431)
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
-- TOC entry 228 (class 1259 OID 16432)
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- TOC entry 3324 (class 2604 OID 16437)
-- Name: estancias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias ALTER COLUMN id SET DEFAULT nextval('public.estancias_id_seq'::regclass);


--
-- TOC entry 3334 (class 2604 OID 16462)
-- Name: perfiles_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario ALTER COLUMN id SET DEFAULT nextval('public.perfiles_usuario_id_seq'::regclass);


--
-- TOC entry 3499 (class 0 OID 16389)
-- Dependencies: 216
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
-- TOC entry 3501 (class 0 OID 16395)
-- Dependencies: 218
-- Data for Name: estancias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.estancias (id, planta, codigo, descripcion, totalllaves, coordenadas_json) FROM stdin;
1	baja	Aula 6	Optativa 1	1	[[0.6413043478260869, 0.006996812629565662], [0.7450592885375494, 0.005830677191304718], [0.7450592885375494, 0.1422685234678351], [0.642292490118577, 0.14110238802957417]]
2	baja	Aula 5	1º ESO A	2	[[0.642292490118577, 0.2087382434487089], [0.7450592885375494, 0.2087382434487089], [0.7460474308300395, 0.34400995428697834], [0.6432806324110671, 0.3451760897252393]]
3	baja	Biblioteca	Biblioteca	3	[[0.5385375494071146, 0.888597354323822], [0.7045454545454546, 0.8850989395430195], [0.7035573122529645, 0.9725593090630807], [0.5395256916996047, 0.9760577238438832]]
4	baja	Aula 1	1º ESO B	2	[[0.7816205533596838, 0.7591560074341314], [0.8675889328063241, 0.7568237309135964], [0.8675889328063241, 0.854779344776065], [0.7816205533596838, 0.8559454830363324]]
5	baja	Aula 4	1º ESO B	1	[[0.642292490118577, 0.3486753398199774], [0.7440711462450593, 0.3486753398199774], [0.7460474308300395, 0.480448963230203], [0.6432806324110671, 0.48278123975073794]]
\.


--
-- TOC entry 3503 (class 0 OID 16402)
-- Dependencies: 220
-- Data for Name: libros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libros (id, idcurso, libro) FROM stdin;
3	1	LENGUA CASTELLANA Y LITERATURA (1-2-3)
4	1	BIOLOGÍA Y GEOLOGÍA
13	1	2ª LENGUA EXTRANJERA: FRANCÉS
6	1	1ª LENGUA EXTRANJERA: INGLÉS
14	3	FÍSICA Y QUÍMICA
15	3	GEOGRAFÍA E HISTORIA
16	1	MATEMÁTICAS (1-2-3)
17	3	INGLES
18	3	LENGUA CASTELLANA Y LITERATURA (1-2-3)
19	3	MATEMÁTICAS (1-2-3)
20	3	TECNOLOGÍA Y DIGITALIZACIÓN
21	4	BIOLOGÍA Y GEOLOGÍA
22	4	ECONOMÍA
23	4	FÍSICA Y QUÍMICA
24	4	FORMACIÓN Y ORIENTACIÓN PERSONAL Y PROFESIONAL
25	4	GEOGRAFÍA E HISTORIA
26	4	INGLÉS
27	4	LENGUA CASTELLANA Y LITERATURA
28	4	MATEMÁTICAS A (1-2-3)
29	4	MATEMÁTICAS B (1-2-3)
\.


--
-- TOC entry 3513 (class 0 OID 16459)
-- Dependencies: 230
-- Data for Name: perfiles_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.perfiles_usuario (id, uid, perfil) FROM stdin;
1	admin	administrador
2	susana	educadora
3	ordenanza	ordenanza
\.


--
-- TOC entry 3505 (class 0 OID 16408)
-- Dependencies: 222
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
\.


--
-- TOC entry 3508 (class 0 OID 16418)
-- Dependencies: 225
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
\.


--
-- TOC entry 3509 (class 0 OID 16424)
-- Dependencies: 226
-- Data for Name: prestamos_llaves; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prestamos_llaves (id, idestancia, unidades, fechaentrega, fechadevolucion, uid) FROM stdin;
2	2	1	2025-09-03 09:33:41.205+02	2025-09-03 09:33:55.754+02	cblancoa02
4	4	1	2025-09-03 11:51:49.809+02	2025-09-03 11:52:29.367+02	jbellidoc01
5	4	1	2025-09-03 11:52:14.584+02	2025-09-03 11:52:29.367+02	cblancoa02
3	2	1	2025-09-03 09:40:32.173+02	2025-09-03 11:54:49.276+02	mebravom01
1	1	1	2025-09-03 09:32:49.397+02	2025-09-03 11:55:48.598+02	mvandujarl01
6	2	1	2025-09-03 11:54:19.495+02	2025-09-03 11:55:52.884+02	mapavonb01
7	2	1	2025-09-03 11:57:28.942+02	2025-09-03 11:57:38.656+02	mvandujarl01
9	1	1	2025-09-03 12:33:57.196+02	2025-09-03 12:34:16.258+02	igordog01
8	2	1	2025-09-03 12:01:43.006+02	2025-09-03 12:34:29.323+02	mvandujarl01
10	2	1	2025-09-03 12:34:03.378+02	2025-09-03 12:34:29.323+02	cblancoa02
11	3	1	2025-09-04 10:53:36.655+02	2025-09-04 11:22:29.068+02	cblancoa02
12	3	1	2025-09-04 10:54:04.227+02	2025-09-04 11:22:29.068+02	jbellidoc01
13	3	1	2025-09-04 10:54:07.503+02	2025-09-04 11:22:29.068+02	mvandujarl01
14	2	1	2025-09-04 11:49:21.264+02	\N	vpalaciosg06
15	4	1	2025-09-04 11:49:31.559+02	\N	jbellidoc01
16	3	1	2025-09-04 11:49:48.668+02	\N	mdcpalaciosr01
17	3	1	2025-09-04 12:15:43.905+02	2025-09-04 12:18:53.47+02	cblancoa02
18	5	1	2025-09-15 14:06:29.392+02	\N	egonzalezh18
\.


--
-- TOC entry 3511 (class 0 OID 16432)
-- Dependencies: 228
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
\.


--
-- TOC entry 3522 (class 0 OID 0)
-- Dependencies: 215
-- Name: api_cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.api_cursos_id_seq', 4, true);


--
-- TOC entry 3523 (class 0 OID 0)
-- Dependencies: 217
-- Name: cursos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cursos_id_seq', 8, true);


--
-- TOC entry 3524 (class 0 OID 0)
-- Dependencies: 219
-- Name: estancias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.estancias_id_seq', 5, true);


--
-- TOC entry 3525 (class 0 OID 0)
-- Dependencies: 221
-- Name: libros_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libros_id_seq', 32, true);


--
-- TOC entry 3526 (class 0 OID 0)
-- Dependencies: 229
-- Name: perfiles_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.perfiles_usuario_id_seq', 3, true);


--
-- TOC entry 3527 (class 0 OID 0)
-- Dependencies: 223
-- Name: prestamos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_id_seq', 3607, true);


--
-- TOC entry 3528 (class 0 OID 0)
-- Dependencies: 224
-- Name: prestamos_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_items_id_seq', 2413, true);


--
-- TOC entry 3529 (class 0 OID 0)
-- Dependencies: 227
-- Name: prestamos_llaves_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prestamos_llaves_id_seq', 18, true);


--
-- TOC entry 3336 (class 2606 OID 16439)
-- Name: cursos cursos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cursos
    ADD CONSTRAINT cursos_pkey PRIMARY KEY (id);


--
-- TOC entry 3338 (class 2606 OID 16441)
-- Name: estancias estancias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.estancias
    ADD CONSTRAINT estancias_pkey PRIMARY KEY (id);


--
-- TOC entry 3340 (class 2606 OID 16443)
-- Name: libros libros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libros
    ADD CONSTRAINT libros_pkey PRIMARY KEY (id);


--
-- TOC entry 3351 (class 2606 OID 16465)
-- Name: perfiles_usuario perfiles_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 3353 (class 2606 OID 16467)
-- Name: perfiles_usuario perfiles_usuario_uid_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfiles_usuario
    ADD CONSTRAINT perfiles_usuario_uid_key UNIQUE (uid);


--
-- TOC entry 3344 (class 2606 OID 16445)
-- Name: prestamos_items prestamos_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_items
    ADD CONSTRAINT prestamos_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3346 (class 2606 OID 16447)
-- Name: prestamos_llaves prestamos_llaves_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_pkey PRIMARY KEY (id);


--
-- TOC entry 3342 (class 2606 OID 16449)
-- Name: prestamos prestamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos
    ADD CONSTRAINT prestamos_pkey PRIMARY KEY (id);


--
-- TOC entry 3349 (class 2606 OID 16451)
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- TOC entry 3347 (class 1259 OID 16452)
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- TOC entry 3354 (class 2606 OID 16453)
-- Name: prestamos_llaves prestamos_llaves_idestancia_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prestamos_llaves
    ADD CONSTRAINT prestamos_llaves_idestancia_fkey FOREIGN KEY (idestancia) REFERENCES public.estancias(id) ON DELETE CASCADE;


-- Completed on 2025-10-01 09:12:39 CEST

--
-- PostgreSQL database dump complete
--

\unrestrict Nfzopoco48qbyQwCca8yLIlMp7RfF2WnyXbLDNeub8Uyh9nnHQ0oUlAVqnixU5E

