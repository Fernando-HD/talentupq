FROM python:3.13-slim

WORKDIR /app

# Instalar dependencias del sistema para ODBC
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    unixodbc-dev \
    curl \
    gnupg2 \
    && curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add - \
    && curl https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18

# Copiar requirements.txt e instalar dependencias Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la aplicación
COPY . .

# Crear directorio para uploads
RUN mkdir -p static/uploads

# Exponer puerto
EXPOSE 5000

# Comando para ejecutar la app con Gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "hello:app"]
