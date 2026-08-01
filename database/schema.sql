--
-- PostgreSQL database dump
--

\restrict TbnWtklaug4PNPbJBBbMDLz8Kh1natNfIxKmAxRz5HWVWWCzOTfCdtxYEbPX5bi

-- Dumped from database version 15.18 (Homebrew)
-- Dumped by pg_dump version 15.18 (Homebrew)

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

ALTER TABLE IF EXISTS ONLY public.vacantesrevision DROP CONSTRAINT IF EXISTS vacantesrevision_vacanteid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantesrevision DROP CONSTRAINT IF EXISTS vacantesrevision_administradorid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantesaprobadas DROP CONSTRAINT IF EXISTS vacantesaprobadas_vacanteid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantesaprobadas DROP CONSTRAINT IF EXISTS vacantesaprobadas_administradorid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantes DROP CONSTRAINT IF EXISTS vacantes_empresaid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantehabilidadesrequeridas DROP CONSTRAINT IF EXISTS vacantehabilidadesrequeridas_vacanteid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantehabilidadesrequeridas DROP CONSTRAINT IF EXISTS vacantehabilidadesrequeridas_habilidadid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantehabilidadesopcionales DROP CONSTRAINT IF EXISTS vacantehabilidadesopcionales_vacanteid_fkey;
ALTER TABLE IF EXISTS ONLY public.vacantehabilidadesopcionales DROP CONSTRAINT IF EXISTS vacantehabilidadesopcionales_habilidadid_fkey;
ALTER TABLE IF EXISTS ONLY public.referencias DROP CONSTRAINT IF EXISTS referencias_candidatoid_fkey;
ALTER TABLE IF EXISTS ONLY public.preparacionacademica DROP CONSTRAINT IF EXISTS preparacionacademica_candidatoid_fkey;
ALTER TABLE IF EXISTS ONLY public.postulaciones DROP CONSTRAINT IF EXISTS postulaciones_vacanteid_fkey;
ALTER TABLE IF EXISTS ONLY public.postulaciones DROP CONSTRAINT IF EXISTS postulaciones_candidatoid_fkey;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_vacanteid_fkey;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_empresaid_fkey;
ALTER TABLE IF EXISTS ONLY public.mensajes DROP CONSTRAINT IF EXISTS mensajes_conversacionid_fkey;
ALTER TABLE IF EXISTS ONLY public.experiencialaboral DROP CONSTRAINT IF EXISTS experiencialaboral_candidatoid_fkey;
ALTER TABLE IF EXISTS ONLY public.empresas DROP CONSTRAINT IF EXISTS empresas_usuarioid_fkey;
ALTER TABLE IF EXISTS ONLY public.conversaciones DROP CONSTRAINT IF EXISTS conversaciones_vacanteid_fkey;
ALTER TABLE IF EXISTS ONLY public.conversaciones DROP CONSTRAINT IF EXISTS conversaciones_empresaid_fkey;
ALTER TABLE IF EXISTS ONLY public.conversaciones DROP CONSTRAINT IF EXISTS conversaciones_candidatoid_fkey;
ALTER TABLE IF EXISTS ONLY public.candidatos DROP CONSTRAINT IF EXISTS candidatos_usuarioid_fkey;
ALTER TABLE IF EXISTS ONLY public.candidatohabilidades DROP CONSTRAINT IF EXISTS candidatohabilidades_habilidadid_fkey;
ALTER TABLE IF EXISTS ONLY public.candidatohabilidades DROP CONSTRAINT IF EXISTS candidatohabilidades_candidatoid_fkey;
ALTER TABLE IF EXISTS ONLY public.candidatocompetencias DROP CONSTRAINT IF EXISTS candidatocompetencias_competenciaid_fkey;
ALTER TABLE IF EXISTS ONLY public.candidatocompetencias DROP CONSTRAINT IF EXISTS candidatocompetencias_candidatoid_fkey;
ALTER TABLE IF EXISTS ONLY public.administradores DROP CONSTRAINT IF EXISTS administradores_usuarioid_fkey;
DROP INDEX IF EXISTS public.ix_vacantes_estatus;
DROP INDEX IF EXISTS public.ix_usuarios_email;
DROP INDEX IF EXISTS public.ix_postulaciones_vacante;
DROP INDEX IF EXISTS public.ix_postulaciones_candidato;
DROP INDEX IF EXISTS public.ix_mensajes_leido;
DROP INDEX IF EXISTS public.ix_mensajes_conversacion;
DROP INDEX IF EXISTS public.ix_conversaciones_vacante;
ALTER TABLE IF EXISTS ONLY public.vacantesrevision DROP CONSTRAINT IF EXISTS vacantesrevision_pkey;
ALTER TABLE IF EXISTS ONLY public.vacantesaprobadas DROP CONSTRAINT IF EXISTS vacantesaprobadas_pkey;
ALTER TABLE IF EXISTS ONLY public.vacantes DROP CONSTRAINT IF EXISTS vacantes_pkey;
ALTER TABLE IF EXISTS ONLY public.vacantehabilidadesrequeridas DROP CONSTRAINT IF EXISTS vacantehabilidadesrequeridas_pkey;
ALTER TABLE IF EXISTS ONLY public.vacantehabilidadesopcionales DROP CONSTRAINT IF EXISTS vacantehabilidadesopcionales_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_pkey;
ALTER TABLE IF EXISTS ONLY public.usuarios DROP CONSTRAINT IF EXISTS usuarios_email_key;
ALTER TABLE IF EXISTS ONLY public.postulaciones DROP CONSTRAINT IF EXISTS uq_postulacion;
ALTER TABLE IF EXISTS ONLY public.referencias DROP CONSTRAINT IF EXISTS referencias_pkey;
ALTER TABLE IF EXISTS ONLY public.preparacionacademica DROP CONSTRAINT IF EXISTS preparacionacademica_pkey;
ALTER TABLE IF EXISTS ONLY public.postulaciones DROP CONSTRAINT IF EXISTS postulaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.notificaciones DROP CONSTRAINT IF EXISTS notificaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.mensajes DROP CONSTRAINT IF EXISTS mensajes_pkey;
ALTER TABLE IF EXISTS ONLY public.habilidades DROP CONSTRAINT IF EXISTS habilidades_pkey;
ALTER TABLE IF EXISTS ONLY public.habilidades DROP CONSTRAINT IF EXISTS habilidades_nombre_key;
ALTER TABLE IF EXISTS ONLY public.experiencialaboral DROP CONSTRAINT IF EXISTS experiencialaboral_pkey;
ALTER TABLE IF EXISTS ONLY public.empresas DROP CONSTRAINT IF EXISTS empresas_usuarioid_key;
ALTER TABLE IF EXISTS ONLY public.empresas DROP CONSTRAINT IF EXISTS empresas_pkey;
ALTER TABLE IF EXISTS ONLY public.conversaciones DROP CONSTRAINT IF EXISTS conversaciones_pkey;
ALTER TABLE IF EXISTS ONLY public.competencias DROP CONSTRAINT IF EXISTS competencias_pkey;
ALTER TABLE IF EXISTS ONLY public.competencias DROP CONSTRAINT IF EXISTS competencias_nombre_key;
ALTER TABLE IF EXISTS ONLY public.candidatos DROP CONSTRAINT IF EXISTS candidatos_usuarioid_key;
ALTER TABLE IF EXISTS ONLY public.candidatos DROP CONSTRAINT IF EXISTS candidatos_pkey;
ALTER TABLE IF EXISTS ONLY public.candidatohabilidades DROP CONSTRAINT IF EXISTS candidatohabilidades_pkey;
ALTER TABLE IF EXISTS ONLY public.candidatocompetencias DROP CONSTRAINT IF EXISTS candidatocompetencias_pkey;
ALTER TABLE IF EXISTS ONLY public.administradores DROP CONSTRAINT IF EXISTS administradores_usuarioid_key;
ALTER TABLE IF EXISTS ONLY public.administradores DROP CONSTRAINT IF EXISTS administradores_pkey;
ALTER TABLE IF EXISTS public.vacantes ALTER COLUMN vacanteid DROP DEFAULT;
ALTER TABLE IF EXISTS public.usuarios ALTER COLUMN usuarioid DROP DEFAULT;
ALTER TABLE IF EXISTS public.referencias ALTER COLUMN referenciaid DROP DEFAULT;
ALTER TABLE IF EXISTS public.preparacionacademica ALTER COLUMN preparacionid DROP DEFAULT;
ALTER TABLE IF EXISTS public.postulaciones ALTER COLUMN postulacionid DROP DEFAULT;
ALTER TABLE IF EXISTS public.notificaciones ALTER COLUMN notificacionid DROP DEFAULT;
ALTER TABLE IF EXISTS public.mensajes ALTER COLUMN mensajeid DROP DEFAULT;
ALTER TABLE IF EXISTS public.habilidades ALTER COLUMN habilidadid DROP DEFAULT;
ALTER TABLE IF EXISTS public.experiencialaboral ALTER COLUMN experienciaid DROP DEFAULT;
ALTER TABLE IF EXISTS public.conversaciones ALTER COLUMN conversacionid DROP DEFAULT;
ALTER TABLE IF EXISTS public.competencias ALTER COLUMN competenciaid DROP DEFAULT;
DROP TABLE IF EXISTS public.vacantesrevision;
DROP TABLE IF EXISTS public.vacantesaprobadas;
DROP SEQUENCE IF EXISTS public.vacantes_vacanteid_seq;
DROP TABLE IF EXISTS public.vacantes;
DROP TABLE IF EXISTS public.vacantehabilidadesrequeridas;
DROP TABLE IF EXISTS public.vacantehabilidadesopcionales;
DROP SEQUENCE IF EXISTS public.usuarios_usuarioid_seq;
DROP TABLE IF EXISTS public.usuarios;
DROP SEQUENCE IF EXISTS public.referencias_referenciaid_seq;
DROP TABLE IF EXISTS public.referencias;
DROP SEQUENCE IF EXISTS public.preparacionacademica_preparacionid_seq;
DROP TABLE IF EXISTS public.preparacionacademica;
DROP SEQUENCE IF EXISTS public.postulaciones_postulacionid_seq;
DROP TABLE IF EXISTS public.postulaciones;
DROP SEQUENCE IF EXISTS public.notificaciones_notificacionid_seq;
DROP TABLE IF EXISTS public.notificaciones;
DROP SEQUENCE IF EXISTS public.mensajes_mensajeid_seq;
DROP TABLE IF EXISTS public.mensajes;
DROP SEQUENCE IF EXISTS public.habilidades_habilidadid_seq;
DROP TABLE IF EXISTS public.habilidades;
DROP SEQUENCE IF EXISTS public.experiencialaboral_experienciaid_seq;
DROP TABLE IF EXISTS public.experiencialaboral;
DROP TABLE IF EXISTS public.empresas;
DROP SEQUENCE IF EXISTS public.conversaciones_conversacionid_seq;
DROP TABLE IF EXISTS public.conversaciones;
DROP SEQUENCE IF EXISTS public.competencias_competenciaid_seq;
DROP TABLE IF EXISTS public.competencias;
DROP TABLE IF EXISTS public.candidatos;
DROP TABLE IF EXISTS public.candidatohabilidades;
DROP TABLE IF EXISTS public.candidatocompetencias;
DROP TABLE IF EXISTS public.administradores;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: administradores; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.administradores (
    administradorid integer NOT NULL,
    usuarioid integer NOT NULL
);


--
-- Name: candidatocompetencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidatocompetencias (
    candidatoid integer NOT NULL,
    competenciaid integer NOT NULL
);


--
-- Name: candidatohabilidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidatohabilidades (
    candidatoid integer NOT NULL,
    habilidadid integer NOT NULL
);


--
-- Name: candidatos; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.candidatos (
    candidatoid integer NOT NULL,
    usuarioid integer NOT NULL,
    nombre character varying(50) NOT NULL,
    apellidopaterno character varying(50) NOT NULL,
    apellidomaterno character varying(50),
    telefono character varying(20),
    estadocivil character varying(20),
    sexo character varying(10),
    fechanacimiento date,
    nacionalidad character varying(50),
    rfc character varying(20),
    direccion character varying(200),
    reubicacion boolean DEFAULT false,
    viajar boolean DEFAULT false,
    licenciaconducir boolean DEFAULT false,
    modalidadtrabajo character varying(50),
    puestoactual character varying(100),
    puestosolicitado character varying(100),
    fotoperfil text,
    cv character varying(255),
    resumenprofesional text
);


--
-- Name: competencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.competencias (
    competenciaid integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: competencias_competenciaid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.competencias_competenciaid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: competencias_competenciaid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.competencias_competenciaid_seq OWNED BY public.competencias.competenciaid;


--
-- Name: conversaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.conversaciones (
    conversacionid integer NOT NULL,
    vacanteid integer NOT NULL,
    candidatoid integer NOT NULL,
    empresaid integer NOT NULL,
    fechainicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activa boolean DEFAULT true
);


--
-- Name: conversaciones_conversacionid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.conversaciones_conversacionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: conversaciones_conversacionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.conversaciones_conversacionid_seq OWNED BY public.conversaciones.conversacionid;


--
-- Name: empresas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.empresas (
    empresaid integer NOT NULL,
    usuarioid integer NOT NULL,
    nombre character varying(100) NOT NULL,
    direccion character varying(200),
    telefono character varying(20),
    sitioweb character varying(100),
    descripcion text,
    logo character varying(255),
    fecharegistro timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: experiencialaboral; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.experiencialaboral (
    experienciaid integer NOT NULL,
    candidatoid integer NOT NULL,
    empresa character varying(100) NOT NULL,
    domicilio character varying(200),
    telefono character varying(20),
    puesto character varying(100) NOT NULL,
    fechaingreso date NOT NULL,
    fechasalida date,
    funciones text NOT NULL,
    sueldoinicial numeric(10,2),
    sueldofinal numeric(10,2),
    motivoseparacion character varying(200)
);


--
-- Name: experiencialaboral_experienciaid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.experiencialaboral_experienciaid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: experiencialaboral_experienciaid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.experiencialaboral_experienciaid_seq OWNED BY public.experiencialaboral.experienciaid;


--
-- Name: habilidades; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.habilidades (
    habilidadid integer NOT NULL,
    nombre character varying(50) NOT NULL
);


--
-- Name: habilidades_habilidadid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.habilidades_habilidadid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: habilidades_habilidadid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.habilidades_habilidadid_seq OWNED BY public.habilidades.habilidadid;


--
-- Name: mensajes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mensajes (
    mensajeid integer NOT NULL,
    conversacionid integer NOT NULL,
    remitenteid integer NOT NULL,
    remitentetipo character varying(20) NOT NULL,
    mensaje text NOT NULL,
    fechaenvio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    leido boolean DEFAULT false,
    fechalectura timestamp without time zone,
    CONSTRAINT mensajes_remitentetipo_check CHECK (((remitentetipo)::text = ANY ((ARRAY['candidato'::character varying, 'empresa'::character varying])::text[])))
);


--
-- Name: mensajes_mensajeid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mensajes_mensajeid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mensajes_mensajeid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mensajes_mensajeid_seq OWNED BY public.mensajes.mensajeid;


--
-- Name: notificaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notificaciones (
    notificacionid integer NOT NULL,
    empresaid integer NOT NULL,
    mensaje character varying(255) NOT NULL,
    tipo character varying(20) NOT NULL,
    fecha timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    leida boolean DEFAULT false,
    vacanteid integer,
    comentarios text
);


--
-- Name: notificaciones_notificacionid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notificaciones_notificacionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notificaciones_notificacionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notificaciones_notificacionid_seq OWNED BY public.notificaciones.notificacionid;


--
-- Name: postulaciones; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.postulaciones (
    postulacionid integer NOT NULL,
    vacanteid integer NOT NULL,
    candidatoid integer NOT NULL,
    fechapostulacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    estatus character varying(20) NOT NULL,
    comentarios text,
    CONSTRAINT postulaciones_estatus_check CHECK (((estatus)::text = ANY ((ARRAY['pendiente'::character varying, 'aceptado'::character varying, 'rechazado'::character varying])::text[])))
);


--
-- Name: postulaciones_postulacionid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.postulaciones_postulacionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: postulaciones_postulacionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.postulaciones_postulacionid_seq OWNED BY public.postulaciones.postulacionid;


--
-- Name: preparacionacademica; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.preparacionacademica (
    preparacionid integer NOT NULL,
    candidatoid integer NOT NULL,
    grado character varying(50) NOT NULL,
    cedula character varying(50),
    estatus character varying(20) NOT NULL,
    institucion character varying(100) NOT NULL,
    pais character varying(50) NOT NULL,
    fechainicio date NOT NULL,
    fechafin date
);


--
-- Name: preparacionacademica_preparacionid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.preparacionacademica_preparacionid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: preparacionacademica_preparacionid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.preparacionacademica_preparacionid_seq OWNED BY public.preparacionacademica.preparacionid;


--
-- Name: referencias; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.referencias (
    referenciaid integer NOT NULL,
    candidatoid integer NOT NULL,
    nombre character varying(100) NOT NULL,
    ocupacion character varying(100) NOT NULL,
    telefono character varying(20) NOT NULL,
    anosconocer integer NOT NULL,
    empresa character varying(100),
    documento character varying(255)
);


--
-- Name: referencias_referenciaid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.referencias_referenciaid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: referencias_referenciaid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.referencias_referenciaid_seq OWNED BY public.referencias.referenciaid;


--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuarios (
    usuarioid integer NOT NULL,
    email character varying(100) NOT NULL,
    passwordhash character varying(255) NOT NULL,
    tipousuario character varying(20) NOT NULL,
    fecharegistro timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activo boolean DEFAULT true,
    resettoken character varying(100),
    resettokenexpira timestamp without time zone,
    CONSTRAINT usuarios_tipousuario_check CHECK (((tipousuario)::text = ANY ((ARRAY['candidato'::character varying, 'empresa'::character varying, 'admin'::character varying])::text[])))
);


--
-- Name: usuarios_usuarioid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.usuarios_usuarioid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: usuarios_usuarioid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.usuarios_usuarioid_seq OWNED BY public.usuarios.usuarioid;


--
-- Name: vacantehabilidadesopcionales; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacantehabilidadesopcionales (
    vacanteid integer NOT NULL,
    habilidadid integer NOT NULL
);


--
-- Name: vacantehabilidadesrequeridas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacantehabilidadesrequeridas (
    vacanteid integer NOT NULL,
    habilidadid integer NOT NULL
);


--
-- Name: vacantes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacantes (
    vacanteid integer NOT NULL,
    empresaid integer NOT NULL,
    puesto character varying(100) NOT NULL,
    gradoestudios character varying(50) NOT NULL,
    resumen text NOT NULL,
    plazas integer DEFAULT 1 NOT NULL,
    plazasdisponibles integer DEFAULT 1 NOT NULL,
    estatus character varying(20) NOT NULL,
    fechapublicacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fechaaprobacion timestamp without time zone,
    comentariosadmin text,
    salario character varying(100),
    tipocontrato character varying(50) NOT NULL,
    modalidad character varying(20) NOT NULL,
    ubicacion character varying(200),
    experienciarequerida character varying(50) NOT NULL,
    beneficios text,
    fechacierre date,
    CONSTRAINT vacantes_estatus_check CHECK (((estatus)::text = ANY ((ARRAY['en_revision'::character varying, 'aprobada'::character varying, 'rechazada'::character varying, 'cerrada'::character varying])::text[])))
);


--
-- Name: vacantes_vacanteid_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vacantes_vacanteid_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vacantes_vacanteid_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vacantes_vacanteid_seq OWNED BY public.vacantes.vacanteid;


--
-- Name: vacantesaprobadas; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacantesaprobadas (
    administradorid integer NOT NULL,
    vacanteid integer NOT NULL
);


--
-- Name: vacantesrevision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vacantesrevision (
    administradorid integer NOT NULL,
    vacanteid integer NOT NULL
);


--
-- Name: competencias competenciaid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencias ALTER COLUMN competenciaid SET DEFAULT nextval('public.competencias_competenciaid_seq'::regclass);


--
-- Name: conversaciones conversacionid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones ALTER COLUMN conversacionid SET DEFAULT nextval('public.conversaciones_conversacionid_seq'::regclass);


--
-- Name: experiencialaboral experienciaid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiencialaboral ALTER COLUMN experienciaid SET DEFAULT nextval('public.experiencialaboral_experienciaid_seq'::regclass);


--
-- Name: habilidades habilidadid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habilidades ALTER COLUMN habilidadid SET DEFAULT nextval('public.habilidades_habilidadid_seq'::regclass);


--
-- Name: mensajes mensajeid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes ALTER COLUMN mensajeid SET DEFAULT nextval('public.mensajes_mensajeid_seq'::regclass);


--
-- Name: notificaciones notificacionid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones ALTER COLUMN notificacionid SET DEFAULT nextval('public.notificaciones_notificacionid_seq'::regclass);


--
-- Name: postulaciones postulacionid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postulaciones ALTER COLUMN postulacionid SET DEFAULT nextval('public.postulaciones_postulacionid_seq'::regclass);


--
-- Name: preparacionacademica preparacionid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preparacionacademica ALTER COLUMN preparacionid SET DEFAULT nextval('public.preparacionacademica_preparacionid_seq'::regclass);


--
-- Name: referencias referenciaid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referencias ALTER COLUMN referenciaid SET DEFAULT nextval('public.referencias_referenciaid_seq'::regclass);


--
-- Name: usuarios usuarioid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuarioid SET DEFAULT nextval('public.usuarios_usuarioid_seq'::regclass);


--
-- Name: vacantes vacanteid; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantes ALTER COLUMN vacanteid SET DEFAULT nextval('public.vacantes_vacanteid_seq'::regclass);


--
-- Name: administradores administradores_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_pkey PRIMARY KEY (administradorid);


--
-- Name: administradores administradores_usuarioid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_usuarioid_key UNIQUE (usuarioid);


--
-- Name: candidatocompetencias candidatocompetencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatocompetencias
    ADD CONSTRAINT candidatocompetencias_pkey PRIMARY KEY (candidatoid, competenciaid);


--
-- Name: candidatohabilidades candidatohabilidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatohabilidades
    ADD CONSTRAINT candidatohabilidades_pkey PRIMARY KEY (candidatoid, habilidadid);


--
-- Name: candidatos candidatos_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatos
    ADD CONSTRAINT candidatos_pkey PRIMARY KEY (candidatoid);


--
-- Name: candidatos candidatos_usuarioid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatos
    ADD CONSTRAINT candidatos_usuarioid_key UNIQUE (usuarioid);


--
-- Name: competencias competencias_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencias
    ADD CONSTRAINT competencias_nombre_key UNIQUE (nombre);


--
-- Name: competencias competencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.competencias
    ADD CONSTRAINT competencias_pkey PRIMARY KEY (competenciaid);


--
-- Name: conversaciones conversaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_pkey PRIMARY KEY (conversacionid);


--
-- Name: empresas empresas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_pkey PRIMARY KEY (empresaid);


--
-- Name: empresas empresas_usuarioid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_usuarioid_key UNIQUE (usuarioid);


--
-- Name: experiencialaboral experiencialaboral_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiencialaboral
    ADD CONSTRAINT experiencialaboral_pkey PRIMARY KEY (experienciaid);


--
-- Name: habilidades habilidades_nombre_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habilidades
    ADD CONSTRAINT habilidades_nombre_key UNIQUE (nombre);


--
-- Name: habilidades habilidades_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.habilidades
    ADD CONSTRAINT habilidades_pkey PRIMARY KEY (habilidadid);


--
-- Name: mensajes mensajes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_pkey PRIMARY KEY (mensajeid);


--
-- Name: notificaciones notificaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (notificacionid);


--
-- Name: postulaciones postulaciones_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postulaciones
    ADD CONSTRAINT postulaciones_pkey PRIMARY KEY (postulacionid);


--
-- Name: preparacionacademica preparacionacademica_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preparacionacademica
    ADD CONSTRAINT preparacionacademica_pkey PRIMARY KEY (preparacionid);


--
-- Name: referencias referencias_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referencias
    ADD CONSTRAINT referencias_pkey PRIMARY KEY (referenciaid);


--
-- Name: postulaciones uq_postulacion; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postulaciones
    ADD CONSTRAINT uq_postulacion UNIQUE (vacanteid, candidatoid);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuarioid);


--
-- Name: vacantehabilidadesopcionales vacantehabilidadesopcionales_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantehabilidadesopcionales
    ADD CONSTRAINT vacantehabilidadesopcionales_pkey PRIMARY KEY (vacanteid, habilidadid);


--
-- Name: vacantehabilidadesrequeridas vacantehabilidadesrequeridas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantehabilidadesrequeridas
    ADD CONSTRAINT vacantehabilidadesrequeridas_pkey PRIMARY KEY (vacanteid, habilidadid);


--
-- Name: vacantes vacantes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantes
    ADD CONSTRAINT vacantes_pkey PRIMARY KEY (vacanteid);


--
-- Name: vacantesaprobadas vacantesaprobadas_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantesaprobadas
    ADD CONSTRAINT vacantesaprobadas_pkey PRIMARY KEY (administradorid, vacanteid);


--
-- Name: vacantesrevision vacantesrevision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantesrevision
    ADD CONSTRAINT vacantesrevision_pkey PRIMARY KEY (administradorid, vacanteid);


--
-- Name: ix_conversaciones_vacante; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_conversaciones_vacante ON public.conversaciones USING btree (vacanteid);


--
-- Name: ix_mensajes_conversacion; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mensajes_conversacion ON public.mensajes USING btree (conversacionid);


--
-- Name: ix_mensajes_leido; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_mensajes_leido ON public.mensajes USING btree (leido);


--
-- Name: ix_postulaciones_candidato; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_postulaciones_candidato ON public.postulaciones USING btree (candidatoid);


--
-- Name: ix_postulaciones_vacante; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_postulaciones_vacante ON public.postulaciones USING btree (vacanteid);


--
-- Name: ix_usuarios_email; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_usuarios_email ON public.usuarios USING btree (email);


--
-- Name: ix_vacantes_estatus; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_vacantes_estatus ON public.vacantes USING btree (estatus);


--
-- Name: administradores administradores_usuarioid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.administradores
    ADD CONSTRAINT administradores_usuarioid_fkey FOREIGN KEY (usuarioid) REFERENCES public.usuarios(usuarioid);


--
-- Name: candidatocompetencias candidatocompetencias_candidatoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatocompetencias
    ADD CONSTRAINT candidatocompetencias_candidatoid_fkey FOREIGN KEY (candidatoid) REFERENCES public.candidatos(candidatoid);


--
-- Name: candidatocompetencias candidatocompetencias_competenciaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatocompetencias
    ADD CONSTRAINT candidatocompetencias_competenciaid_fkey FOREIGN KEY (competenciaid) REFERENCES public.competencias(competenciaid);


--
-- Name: candidatohabilidades candidatohabilidades_candidatoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatohabilidades
    ADD CONSTRAINT candidatohabilidades_candidatoid_fkey FOREIGN KEY (candidatoid) REFERENCES public.candidatos(candidatoid);


--
-- Name: candidatohabilidades candidatohabilidades_habilidadid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatohabilidades
    ADD CONSTRAINT candidatohabilidades_habilidadid_fkey FOREIGN KEY (habilidadid) REFERENCES public.habilidades(habilidadid);


--
-- Name: candidatos candidatos_usuarioid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.candidatos
    ADD CONSTRAINT candidatos_usuarioid_fkey FOREIGN KEY (usuarioid) REFERENCES public.usuarios(usuarioid);


--
-- Name: conversaciones conversaciones_candidatoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_candidatoid_fkey FOREIGN KEY (candidatoid) REFERENCES public.candidatos(candidatoid);


--
-- Name: conversaciones conversaciones_empresaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_empresaid_fkey FOREIGN KEY (empresaid) REFERENCES public.empresas(empresaid);


--
-- Name: conversaciones conversaciones_vacanteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.conversaciones
    ADD CONSTRAINT conversaciones_vacanteid_fkey FOREIGN KEY (vacanteid) REFERENCES public.vacantes(vacanteid);


--
-- Name: empresas empresas_usuarioid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.empresas
    ADD CONSTRAINT empresas_usuarioid_fkey FOREIGN KEY (usuarioid) REFERENCES public.usuarios(usuarioid);


--
-- Name: experiencialaboral experiencialaboral_candidatoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.experiencialaboral
    ADD CONSTRAINT experiencialaboral_candidatoid_fkey FOREIGN KEY (candidatoid) REFERENCES public.candidatos(candidatoid);


--
-- Name: mensajes mensajes_conversacionid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mensajes
    ADD CONSTRAINT mensajes_conversacionid_fkey FOREIGN KEY (conversacionid) REFERENCES public.conversaciones(conversacionid);


--
-- Name: notificaciones notificaciones_empresaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_empresaid_fkey FOREIGN KEY (empresaid) REFERENCES public.empresas(empresaid);


--
-- Name: notificaciones notificaciones_vacanteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notificaciones
    ADD CONSTRAINT notificaciones_vacanteid_fkey FOREIGN KEY (vacanteid) REFERENCES public.vacantes(vacanteid);


--
-- Name: postulaciones postulaciones_candidatoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postulaciones
    ADD CONSTRAINT postulaciones_candidatoid_fkey FOREIGN KEY (candidatoid) REFERENCES public.candidatos(candidatoid);


--
-- Name: postulaciones postulaciones_vacanteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.postulaciones
    ADD CONSTRAINT postulaciones_vacanteid_fkey FOREIGN KEY (vacanteid) REFERENCES public.vacantes(vacanteid);


--
-- Name: preparacionacademica preparacionacademica_candidatoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.preparacionacademica
    ADD CONSTRAINT preparacionacademica_candidatoid_fkey FOREIGN KEY (candidatoid) REFERENCES public.candidatos(candidatoid);


--
-- Name: referencias referencias_candidatoid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.referencias
    ADD CONSTRAINT referencias_candidatoid_fkey FOREIGN KEY (candidatoid) REFERENCES public.candidatos(candidatoid);


--
-- Name: vacantehabilidadesopcionales vacantehabilidadesopcionales_habilidadid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantehabilidadesopcionales
    ADD CONSTRAINT vacantehabilidadesopcionales_habilidadid_fkey FOREIGN KEY (habilidadid) REFERENCES public.habilidades(habilidadid);


--
-- Name: vacantehabilidadesopcionales vacantehabilidadesopcionales_vacanteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantehabilidadesopcionales
    ADD CONSTRAINT vacantehabilidadesopcionales_vacanteid_fkey FOREIGN KEY (vacanteid) REFERENCES public.vacantes(vacanteid);


--
-- Name: vacantehabilidadesrequeridas vacantehabilidadesrequeridas_habilidadid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantehabilidadesrequeridas
    ADD CONSTRAINT vacantehabilidadesrequeridas_habilidadid_fkey FOREIGN KEY (habilidadid) REFERENCES public.habilidades(habilidadid);


--
-- Name: vacantehabilidadesrequeridas vacantehabilidadesrequeridas_vacanteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantehabilidadesrequeridas
    ADD CONSTRAINT vacantehabilidadesrequeridas_vacanteid_fkey FOREIGN KEY (vacanteid) REFERENCES public.vacantes(vacanteid);


--
-- Name: vacantes vacantes_empresaid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantes
    ADD CONSTRAINT vacantes_empresaid_fkey FOREIGN KEY (empresaid) REFERENCES public.empresas(empresaid);


--
-- Name: vacantesaprobadas vacantesaprobadas_administradorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantesaprobadas
    ADD CONSTRAINT vacantesaprobadas_administradorid_fkey FOREIGN KEY (administradorid) REFERENCES public.administradores(administradorid);


--
-- Name: vacantesaprobadas vacantesaprobadas_vacanteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantesaprobadas
    ADD CONSTRAINT vacantesaprobadas_vacanteid_fkey FOREIGN KEY (vacanteid) REFERENCES public.vacantes(vacanteid);


--
-- Name: vacantesrevision vacantesrevision_administradorid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantesrevision
    ADD CONSTRAINT vacantesrevision_administradorid_fkey FOREIGN KEY (administradorid) REFERENCES public.administradores(administradorid);


--
-- Name: vacantesrevision vacantesrevision_vacanteid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vacantesrevision
    ADD CONSTRAINT vacantesrevision_vacanteid_fkey FOREIGN KEY (vacanteid) REFERENCES public.vacantes(vacanteid);


--
-- PostgreSQL database dump complete
--

\unrestrict TbnWtklaug4PNPbJBBbMDLz8Kh1natNfIxKmAxRz5HWVWWCzOTfCdtxYEbPX5bi
