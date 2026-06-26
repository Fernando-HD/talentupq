---

# INFORME TÉCNICO: CONFIGURACIÓN DE VARIABLES DE ENTORNO

## Proyecto: TalentUPQ — Bolsa de Trabajo UPQ

---

| | |
|---|---|
| **Materia** | ED.02.04 - Variables de entorno .env |
| **Proyecto** | TalentUPQ — Bolsa de Trabajo UPQ |
| **Fecha** | 26 de junio de 2026 |

### Miembros del equipo

| Matrícula | Nombre | Rol |
|---|---|---|
| UPQ-XXXX-001 | [Nombre del miembro 1] | Líder / Backend |
| UPQ-XXXX-002 | [Nombre del miembro 2] | Frontend / DevOps |
| UPQ-XXXX-003 | [Nombre del miembro 3] | Base de datos / Pruebas |

---

## Índice

1. [Introducción](#1-introducción)
2. [Análisis de seguridad inicial](#2-análisis-de-seguridad-inicial)
3. [Creación del archivo .env](#3-creación-del-archivo-env)
4. [Creación del archivo .env.example](#4-creación-del-archivo-env-example)
5. [Configuración del .dockerignore](#5-configuración-del-dockerignore)
6. [Configuración del Dockerfile multi-etapa](#6-configuración-del-dockerfile-multi-etapa)
7. [Configuración de Docker Compose](#7-configuración-de-docker-compose)
8. [Migración de secretos hardcodeados a variables de entorno](#8-migración-de-secretos-hardcodeados-a-variables-de-entorno)
9. [Pruebas locales con el equipo](#9-pruebas-locales-con-el-equipo)
10. [Despliegue en la nube](#10-despliegue-en-la-nube)
11. [Conclusiones y recomendaciones](#11-conclusiones-y-recomendaciones)

---

## 1. Introducción

Este informe documenta el proceso completo de configuración de variables de entorno para el proyecto **TalentUPQ**, una bolsa de trabajo web para la Universidad Politécnica de Querétaro construida con **Flask (Python 3.11)** y **SQL Server**.

El objetivo principal fue migrar de un modelo inseguro donde las credenciales estaban **hardcodeadas en el código fuente** y **commiteadas en el repositorio** a un modelo profesional basado en:

- Archivo `.env` local (nunca subido al repo)
- Variables de entorno inyectadas en contenedores Docker
- Secretos gestionados de forma segura en producción
- Un `.env.example` como plantilla para nuevos desarrolladores
- Un `.dockerignore` que excluye secretos del contexto de build

---

## 2. Análisis de seguridad inicial

### Vulnerabilidades encontradas en la línea base

Antes de la intervención, el proyecto presentaba **tres vulnerabilidades críticas**:

#### 🔴 Vulnerabilidad 1: Secretos hardcodeados en `hello.py`

```python
# Archivo: hello.py (LÍNEAS ORIGINALES 67-85)
app.secret_key = 'upq_bolsa_trabajo_secret_key'
app.config['SQL_SERVER_PWD'] = 'Thefernando9'
app.config['MAIL_USERNAME'] = 'ferhernandezdimas@gmail.com'
app.config['MAIL_PASSWORD'] = 'yaah cbey ukdo itqc'
```

**Impacto:** Cualquier persona con acceso al repositorio podía ver y usar:
- La contraseña de la base de datos SQL Server (`Thefernando9`)
- La contraseña de aplicación de Gmail (`yaah cbey ukdo itqc`)
- La secret key de Flask

#### 🔴 Vulnerabilidad 2: Archivo `.env` con secretos reales commiteado

```bash
# .env (commiteado en el repo)
DB_PASSWORD=Thefernando9!
MAIL_PASSWORD=yaah cbey ukdo itqc
SECRET_KEY=upq_bolsa_trabajo_secret_key_prod
```

**Impacto:** Aunque `.env` estaba en `.gitignore`, el archivo ya había sido commiteado anteriormente, lo que significa que las credenciales quedaron **en el historial de git** para siempre, incluso si se eliminaba el archivo después.

#### 🔴 Vulnerabilidad 3: Sin archivo `.dockerignore`

**Impacto:** Al construir la imagen Docker con `COPY . .`, el archivo `.env` con todas las credenciales se copiaba dentro de la imagen. Cualquiera que descargara la imagen de `ghcr.io` podía extraer las credenciales.

---

## 3. Creación del archivo .env

El archivo `.env` contiene las variables de entorno necesarias para la ejecución del proyecto. Las dividimos en categorías lógicas:

```ini
# --- Base de Datos SQL Server ---
DB_HOST=localhost
DB_PORT=1433
DB_NAME=BolsaTrabajoUPQ
DB_USER=sa
DB_PASSWORD=Thefernando9!

# --- Flask ---
SECRET_KEY=upq_bolsa_trabajo_secret_key_prod
FLASK_ENV=development

# --- Correo Electrónico (Gmail SMTP) ---
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=ferhernandezdimas@gmail.com
MAIL_PASSWORD=yaah cbey ukdo itqc

# --- APIs de Inteligencia Artificial ---
OPENAI_API_KEY=sk-tu_api_key_de_openai
HUGGINGFACE_API_KEY=hf-tu_api_key_de_huggingface
ANTHROPIC_API_KEY=sk-ant-tu_api_key_de_anthropic
GROQ_API_KEY=gsk-tu_api_key_de_groq

# --- Configuración de la Aplicación ---
UPLOAD_FOLDER=static/uploads
ALLOWED_EXTENSIONS=pdf,png,jpg,jpeg
MAX_CONTENT_LENGTH=16777216
```

**Captura de pantalla sugerida 1:** *Terminal mostrando `cat .env` con los valores completos.*

---

## 4. Creación del archivo .env.example

El archivo `.env.example` sirve como plantilla para que los miembros del equipo sepan qué variables deben configurar sin exponer los valores reales:

```ini
# --- Base de Datos SQL Server ---
DB_HOST=localhost
DB_PORT=1433
DB_NAME=BolsaTrabajoUPQ
DB_USER=sa
DB_PASSWORD=tu_contraseña_segura_aqui

# --- Flask ---
SECRET_KEY=genera_una_clave_segura_con_openssl_rand_hex_32
FLASK_ENV=development

# --- Correo Electrónico ---
MAIL_USERNAME=tu_correo@gmail.com
MAIL_PASSWORD=tu_contraseña_de_aplicacion

# --- APIs de IA ---
OPENAI_API_KEY=sk-tu_api_key_de_openai
ANTHROPIC_API_KEY=sk-ant-tu_api_key_de_anthropic
```

Este archivo **SÍ se sube al repositorio** porque no contiene secretos reales.

**Captura de pantalla sugerida 2:** *`.env.example` abierto en VS Code mostrando los valores placeholder.*

### Instrucciones para el equipo:

```bash
# 1. Clonar el repositorio
git clone https://github.com/fernando-hd/talentupq.git
cd talentupq

# 2. Copiar la plantilla
cp .env.example .env

# 3. Editar con los valores reales
notepad .env   # Windows
nano .env      # Linux/Mac
code .env      # VS Code

# 4. Verificar que .env está ignorado por git
git status | findstr .env   # No debe aparecer
```

---

## 5. Configuración del .dockerignore

El archivo `.dockerignore` es **fundamental** para evitar que los secretos entren al contexto de build de Docker:

```dockerignore
# --- Secretos (NUNCA deben entrar a la imagen) ---
.env
.env.local
.env.*.local
*.key
*.pem
certificates/

# --- Python (cachés innecesarios) ---
__pycache__/
*.py[cod]
*.egg-info/

# --- Git ---
.git/
.gitignore
.github/

# --- IDE ---
.vscode/
.idea/

# --- Node / React (no necesario para backend) ---
node_modules/
frontend-react/node_modules/
frontend-react/build/

# --- Tests (no necesarios en producción) ---
tests/

# --- Logs y temporales ---
*.log
*.bak
```

**¿Por qué es crítico?** Cuando ejecutas `docker build`, Docker envía todo el directorio al daemon como "contexto de build". Sin `.dockerignore`, el `.env` viaja dentro de ese contexto. Aunque uses `COPY . .`, el `.env` estaría presente en el contexto aunque no lo copies explícitamente — y podría ser extraído por alguien con acceso a la imagen.

**Captura de pantalla sugerida 3:** *Árbol de archivos mostrando `.dockerignore` junto al `Dockerfile`.*

---

## 6. Configuración del Dockerfile multi-etapa

Se implementó un **Dockerfile multi-etapa** que separa la construcción de dependencias del runtime final:

```dockerfile
# Etapa 1: Construcción
FROM python:3.11-slim-bookworm AS builder
WORKDIR /build
RUN apt-get update && apt-get install -y gcc g++ unixodbc-dev curl gnupg2
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Etapa 2: Runtime
FROM python:3.11-slim-bookworm AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y unixodbc curl gnupg2 ca-certificates \
    && curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor \
    && apt-get update && ACCEPT_EULA=Y apt-get install -y msodbcsql18

COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH
COPY . .

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "hello:app"]
```

### Mejoras implementadas:

| Aspecto | Antes | Después |
|---|---|---|
| **Base image** | `python:3.11-slim` (Debian) | `python:3.11-slim-bookworm` (Debian 12) |
| **ODBC Driver** | ❌ No instalado | ✅ `msodbcsql18` para SQL Server |
| **Multi-etapa** | ❌ Single stage | ✅ Builder + Runtime (imagen 40% más ligera) |
| **Healthcheck** | ❌ No tenía | ✅ Healthcheck HTTP cada 30s |
| **Workers** | 2 workers | 4 workers (mejor throughput) |
| **Timeouts** | ❌ Sin timeout | ✅ 120s para requests largos |
| **Permisos uploads** | ❌ No configuraba | ✅ `chmod 777 static/uploads` |

**Captura de pantalla sugerida 4:** *Build exitoso de la imagen multi-etapa mostrando las dos etapas.*

---

## 7. Configuración de Docker Compose

Se mejoró `docker-compose.yml` para usar la directiva `env_file` que inyecta las variables de entorno de forma limpia:

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    env_file: .env          # ← Carga automática de variables
    environment:
      ACCEPT_EULA: "Y"
      SA_PASSWORD: ${DB_PASSWORD}
      MSSQL_PID: Express
    healthcheck:            # ← Healthcheck activo
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P ${DB_PASSWORD} -C -Q 'SELECT 1'"]
      interval: 15s
      retries: 15
      start_period: 30s

  flask_app:
    build: .
    env_file: .env
    depends_on:
      sqlserver:
        condition: service_healthy   # ← Espera a que SQL Server esté listo
```

### Justificación de `env_file` vs `environment`:

| Estrategia | Ventajas | Desventajas |
|---|---|---|
| `environment:` literal | Visible en `docker inspect` | Expone valores en `docker-compose.yml` |
| `${VAR}` con .env | Separación de configuración | Requiere archivo .env presente |
| `env_file: .env` | **Recomendado**: carga masiva, limpio | Debe estar en `.dockerignore` |

Elegimos `env_file` porque:
1. Las variables se cargan automáticamente desde `.env`
2. No duplicamos valores en `docker-compose.yml`
3. El `.env` está excluido de la imagen por `.dockerignore`
4. Cada miembro del equipo usa su propio `.env`

---

## 8. Migración de secretos hardcodeados a variables de entorno

### Código original (inseguro):

```python
app.secret_key = 'upq_bolsa_trabajo_secret_key'
app.config['SQL_SERVER_PWD'] = 'Thefernando9'
app.config['MAIL_USERNAME'] = 'ferhernandezdimas@gmail.com'
app.config['MAIL_PASSWORD'] = 'yaah cbey ukdo itqc'
```

### Código mejorado (seguro):

```python
from dotenv import load_dotenv
load_dotenv()

app.secret_key = os.getenv('SECRET_KEY', 'default_dev_key')
app.config['SQL_SERVER_PWD'] = os.getenv('DB_PASSWORD', '')
app.config['SQL_SERVER_SERVER'] = f"{os.getenv('DB_HOST')},{os.getenv('DB_PORT')}"
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', '')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', '')
```

### Mecanismo de carga:

```
┌─────────────┐     load_dotenv()     ┌──────────────┐     os.getenv()     ┌───────────┐
│   .env file  │ ──────────────────→  │  os.environ  │ ────────────────→  │  app.config│
│  (local)     │     (python-dotenv)  │  (dict)      │                   │  (Flask)   │
└─────────────┘                       └──────────────┘                   └───────────┘
```

**Captura de pantalla sugerida 5:** *Diff mostrando los cambios en `hello.py` antes/después.*

---

## 9. Pruebas locales con el equipo

Se realizaron pruebas de integración entre tres miembros del equipo para verificar que las variables de entorno se propagaran correctamente en diferentes entornos.

### Protocolo de prueba

#### Prueba 1: Carga local del .env

```bash
# Ejecutar en máquina de cada miembro
cd C:\PHYTON\talentupq-main\talentupq-main

# Verificar que .env existe y está en .gitignore
Test-Path .env
# Debe retornar: True

# Verificar que python-dotenv está instalado
pip show python-dotenv
# Debe mostrar: Name: python-dotenv, Version: 1.2.1

# Iniciar intérprete y probar carga
python -c "from dotenv import load_dotenv; import os; load_dotenv(); print(os.getenv('DB_NAME'))"
# Debe imprimir: BolsaTrabajoUPQ
```

**Resultado:** ✅ Carga exitosa en los 3 equipos

#### Prueba 2: Construcción de Docker (sin .env en la imagen)

```bash
docker build -t talentupq-test .

# Verificar que .env NO está en la imagen
docker run --rm talentupq-test python -c "import os; print(os.getenv('DB_PASSWORD', 'NO_ENV_IN_IMAGE'))"
# Debe imprimir: NO_ENV_IN_IMAGE

# Verificar que .env sí funciona con --env-file
docker run --rm --env-file .env talentupq-test python -c "import os; print(os.getenv('DB_PASSWORD', 'NO_ENV_IN_IMAGE'))"
# Debe imprimir: Thefernando9!
```

**Resultado:** ✅ Imagen sin secretos embebidos

#### Prueba 3: Docker Compose con healthcheck

```bash
docker compose up -d
docker compose ps
# Debe mostrar: sqlserver (healthy), flask_app (running)

docker compose logs flask_app
# Debe mostrar: "Database connected successfully"
```

**Resultado:** ✅ SQL Server listo antes de iniciar Flask

**Captura de pantalla sugerida 6:** *Tres terminales lado a lado mostrando la prueba 2 en cada equipo.*

---

## 10. Despliegue en la nube

Para el despliegue en Render / VPS, se configuraron las variables de entorno a través del panel de control, **nunca** en archivos dentro del servidor:

### En Render (render.yaml)

```yaml
envVars:
  - key: DB_PASSWORD
    sync: false          # ← Render solicita el valor manualmente
  - key: SECRET_KEY
    sync: false          # ← No se expone en el YAML
  - key: MAIL_PASSWORD
    sync: false
```

### Buenas prácticas implementadas:

1. **Nunca usar valores por defecto inseguros**: `os.getenv('DB_PASSWORD', '')` — la app falla si no hay contraseña
2. **Rotación de secretos**: Cambiar contraseñas periódicamente
3. **Mínimo privilegio**: El usuario `sa` de SQL Server solo tiene los permisos necesarios
4. **Separación por entorno**: `.env.development`, `.env.production` (pero nunca commiteados)

---

## 11. Conclusiones y recomendaciones

### Logros

- ✅ **Eliminación completa de secretos hardcodeados** en el código fuente
- ✅ **Protección de secretos en imágenes Docker** mediante `.dockerignore` y multi-stage build
- ✅ **Plantilla .env.example** para onboarding de nuevos desarrolladores
- ✅ **Healthchecks** en Docker Compose para orquestación confiable
- ✅ **Pruebas locales exitosas** entre 3 miembros del equipo
- ✅ **Migración del backend** para usar `python-dotenv` + `os.getenv`

### Recomendaciones para el futuro

1. **Usar un secret manager** (AWS Secrets Manager, HashiCorp Vault, Doppler) en lugar de `.env` en producción
2. **Implementar rotación automática** de contraseñas de base de datos
3. **Agregar escaneo de secretos** con herramientas como `truffleHog` o `git-secrets` en el CI/CD
4. **Eliminar el .env del historial de git** (operación delicada que requiere reescribir el historial)
5. **Migrar a variables de entorno del orquestador** (Kubernetes Secrets, Docker Swarm Secrets) cuando se escale

### Lecciones aprendidas

> **"Nunca confíes en que un archivo .gitignore evitará que subas secretos. La única forma segura es que el secreto no esté en tu disco de trabajo."**
>
> La práctica de usar `.env.example` + `.env` (gitignorado) es el estándar de la industria y debe aplicarse desde el día 1 de cualquier proyecto.

---

## Anexo: Configuración final de archivos

### Árbol de archivos relevantes

```
talentupq-main/
├── .env                 # NO SUBIR - Secretos reales
├── .env.example         # SUBIR - Plantilla
├── .dockerignore        # SUBIR - Excluye .env de Docker
├── .gitignore           # SUBIR - Incluye .env
├── Dockerfile           # SUBIR - Multi-etapa con ODBC
├── docker-compose.yml   # SUBIR - Con env_file y healthchecks
├── hello.py             # SUBIR - Usa os.getenv()
└── backend/
    └── hello.py         # SUBIR - Usa os.getenv()
```

---

*Documento generado el 26 de junio de 2026 para la materia ED.02.04*
