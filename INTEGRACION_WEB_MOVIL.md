# Integración web, móvil y PostgreSQL

TalentUPQ usa una sola API Flask y una sola base PostgreSQL:

```text
Web Flask / React ─┐
                   ├── Flask API /api/v1 ── PostgreSQL
TalentUPQ-Mobile2 ─┘
```

Los cambios realizados desde la app móvil se guardan en las mismas tablas que
usa la web. Por ejemplo, una postulación móvil aparece en el panel web de la
empresa y una vacante aprobada desde la web aparece en la app móvil.

## Ejecución local

1. Iniciar PostgreSQL.
2. Instalar las dependencias del backend y arrancar Flask:

   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   python hello.py
   ```

3. Confirmar que la API responde:

   ```text
   http://localhost:5001/api/v1/health
   ```

4. Conectar el teléfono y la computadora a la misma red Wi-Fi.
5. Configurar `TalentUPQ-Mobile2/.env` con la IP local de la computadora:

   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.48:5001/api/v1
   ```

6. Iniciar Expo:

   ```bash
   cd TalentUPQ-Mobile2
   npm install
   npx expo start
   ```

Si cambia la red Wi-Fi, también puede cambiar la IP. Se obtiene la IP actual en
macOS con `ipconfig getifaddr en0`.

## Endpoints compartidos principales

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/auth/me`
- `GET|PUT /api/v1/perfil`
- `GET /api/v1/vacantes`
- `GET /api/v1/vacantes/<id>`
- `POST /api/v1/vacantes/<id>/postular`
- `GET /api/v1/postulaciones`
- `DELETE /api/v1/postulaciones/<id>`
- `GET|POST /api/v1/experiencias`
- `PUT|DELETE /api/v1/experiencias/<id>`
- `GET|POST /api/v1/preparaciones`
- `PUT|DELETE /api/v1/preparaciones/<id>`
- `GET|POST /api/v1/referencias`
- `PUT|DELETE /api/v1/referencias/<id>`
- `GET|PUT /api/v1/perfil/habilidades`
- `GET /api/v1/conversaciones`
- `GET /api/v1/conversaciones/<id>`
- `POST /api/v1/conversaciones/<id>/mensajes`
- `GET /api/v1/health`

Las rutas privadas requieren `Authorization: Bearer <JWT>`. La app almacena el
token mediante Expo SecureStore.

## Producción

`render.yaml` define:

- API Flask pública con HTTPS y health check.
- PostgreSQL administrado accesible mediante red interna.
- Cliente React web.

En producción se deben configurar `CORS_ORIGINS`, `MAIL_USERNAME` y
`MAIL_PASSWORD`. Render genera valores diferentes para `SECRET_KEY` y
`JWT_SECRET_KEY`.
