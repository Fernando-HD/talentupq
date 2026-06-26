# =============================================================================
# TalentUPQ - Dockerfile Multi-Etapa
# =============================================================================
# Etapa 1: Construcción de dependencias
# =============================================================================
FROM python:3.11-slim-bookworm AS builder

WORKDIR /build

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ unixodbc-dev curl gnupg2 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# =============================================================================
# Etapa 2: Imagen final (ligera)
# =============================================================================
FROM python:3.11-slim-bookworm AS runtime

WORKDIR /app

# Instalar solo runtime ODBC (no herramientas de build)
RUN apt-get update && apt-get install -y --no-install-recommends \
    unixodbc curl gnupg2 ca-certificates \
    && curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias desde builder
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

# Copiar solo código de la aplicación (sin .env gracias a .dockerignore)
COPY . .

# Crear carpeta de uploads
RUN mkdir -p static/uploads && chmod 777 static/uploads

EXPOSE 5000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:5000/health')" || exit 1

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "--timeout", "120", "hello:app"]
