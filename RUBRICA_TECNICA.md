# Evidencia técnica de la rúbrica — TalentUPQ

## Estado implementado

| Punto | Estado demostrable | Evidencia |
|---|---|---|
| Hasheado y cifrado | Cumple en código | Werkzeug aplica hash irreversible a contraseñas. Fernet cifra de forma autenticada los códigos de recuperación almacenados en PostgreSQL. |
| Servidor público y privado | Cumple en Docker | `public_gateway` es el único servicio público. `api_1`, `api_2`, PostgreSQL y Prometheus están en la red Docker `backend` marcada como `internal`. |
| Prometheus y Grafana | Cumple en Docker | Flask publica métricas en `/metrics`, Prometheus recopila ambas API y Nginx, y Grafana carga automáticamente el tablero “TalentUPQ - Operación y seguridad”. |
| Firewall | Cumple como firewall de aplicación | Nginx limita peticiones y conexiones por IP, limita tamaño del cuerpo, oculta versión, bloquea `/metrics`, registra eventos y añade encabezados defensivos. |
| JWT | Cumple | Los recursos privados exigen JWT Bearer; los tokens de recuperación sólo sirven para cambiar contraseña por la claim `purpose=password_reset`. |
| SSL | Cumple localmente / preparado en nube | Nginx fuerza HTTPS TLS 1.2/1.3 con certificado local. En Render, el certificado público confiable se emite y renueva automáticamente al desplegar. |
| Balanceador | Cumple en Docker / preparado en nube | Nginx usa `least_conn` entre `api_1` y `api_2`. Render está preparado con `numInstances: 2`, donde su balanceador distribuye tráfico entre instancias. |
| Formularios validados | Cumple en API principal | Se validan campos obligatorios, correo, contraseña, teléfono, RFC, fechas, orden cronológico, longitudes, años y listas tanto en `POST` como `PUT`. |
| Web/API/BD en nube | Preparado, requiere despliegue | `render.yaml` define PostgreSQL sin acceso externo, API escalada a dos instancias y cliente web. No debe marcarse como desplegado hasta comprobar las URL de Render. |

## Arquitectura

```text
Internet / teléfono
       |
 HTTPS :8443
       |
 Nginx público
 firewall + rate limit + balanceador
       |
 red privada Docker (internal)
   +---+---+
   |       |
 api_1   api_2 ---- PostgreSQL
   |       |
   +--- Prometheus --- Grafana (sólo 127.0.0.1:3001)
```

## Puesta en marcha

1. Copiar `.env.example` a `.env` y colocar secretos reales.
2. Generar una llave de cifrado:

   ```bash
   python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
   ```

3. Guardarla como `DATA_ENCRYPTION_KEY` en `.env`. No cambiarla después de cifrar datos.
4. Construir y arrancar:

   ```bash
   docker compose up --build -d
   docker compose ps
   ```

5. Abrir:

   - Plataforma HTTPS: `https://localhost:8443`
   - Grafana administrativo: `http://127.0.0.1:3001`

El certificado local es autofirmado, por lo que el navegador muestra una advertencia únicamente en desarrollo. Para una demostración con candado confiable debe usarse la URL desplegada en Render.

## Pruebas para grabar como evidencia

### Separación pública/privada

```bash
docker compose ps
docker network inspect occ_backend
```

Sólo `public_gateway` debe mostrar puertos públicos. PostgreSQL, APIs y Prometheus sólo muestran puertos internos.

### HTTPS y encabezados del firewall

```bash
curl -kI https://localhost:8443/api/v1/health
curl -kI https://localhost:8443/metrics
```

La primera petición debe incluir HSTS, `X-Content-Type-Options` y `X-Frame-Options`. La segunda debe devolver `403` desde el gateway.

### Balanceo y tolerancia a fallos

```bash
docker compose stop api_1
curl -k https://localhost:8443/api/v1/health
docker compose start api_1
```

La API debe seguir respondiendo mediante `api_2`.

### Rate limiting / firewall

```bash
for i in $(seq 1 80); do curl -ks -o /dev/null -w "%{http_code}\n" https://localhost:8443/api/v1/health & done; wait
docker compose logs public_gateway --tail=100
```

Se observarán solicitudes limitadas en los códigos y registros de Nginx.

### Monitoreo

En Grafana abrir el tablero aprovisionado y mostrar:

- disponibilidad de las dos API;
- disponibilidad de PostgreSQL;
- peticiones por segundo y códigos HTTP;
- latencia p95;
- conexiones activas del gateway/firewall.

## Despliegue en Render

`render.yaml` mantiene PostgreSQL sin acceso desde Internet (`ipAllowList: []`), configura dos instancias de API, health check contra PostgreSQL y secretos separados para sesión, JWT y cifrado. El escalado a dos instancias tiene costo en Render. Después del despliegue:

1. Configurar `DATA_ENCRYPTION_KEY`, `CORS_ORIGINS`, `MAIL_USERNAME` y `MAIL_PASSWORD`.
2. Confirmar `https://talentupq-api.onrender.com/api/v1/health`.
3. Cambiar `EXPO_PUBLIC_API_URL` en la app móvil a la URL HTTPS real.
4. Generar un nuevo bundle móvil.
5. Capturar el certificado del navegador y las dos instancias en el panel de Render.

## Límites honestos

- Los archivos de Render dejan el despliegue preparado, pero no prueban que el servicio ya exista en la nube.
- El certificado autofirmado sirve para demostrar TLS local, pero la evidencia final de SSL público debe ser la URL HTTPS de Render.
- El firewall implementado es de capa de aplicación/red Docker. Un firewall de infraestructura en nube se evidencia además con las reglas de acceso de Render.
