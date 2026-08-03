# Evidencias de la rúbrica — TalentUPQ

## Prueba automática

Después de desplegar el Blueprint, ejecutar:

```bash
TALENTUPQ_TEST_EMAIL="alumno@upq.edu.mx" \
TALENTUPQ_TEST_PASSWORD="contraseña-de-prueba" \
python3.13 scripts/verify_cloud.py | tee evidencia-cloud.txt
```

El archivo resultante comprueba HTTPS, conexión API/BD, firewall, métricas,
rechazo sin JWT, aceptación con JWT y catálogos públicos.

## Capturas necesarias

1. Render **Resources**: API, PostgreSQL, Prometheus y Grafana disponibles.
2. Render **Scaling**: `talentupq-api` con dos instancias.
3. Navegador: `https://talentupq-api.onrender.com` con candado HTTPS.
4. Grafana: dashboard **TalentUPQ - Operación y seguridad**, mostrando
   peticiones, latencia, PostgreSQL y bloqueos del firewall.
5. Terminal: salida completa de `scripts/verify_cloud.py`.
6. APK: página de EAS en estado **Finished** y QR de instalación.
7. Dos capturas (web y móvil) del mismo dato modificado, por ejemplo una
   habilidad o mensaje, para demostrar que comparten API y PostgreSQL.

## Prueba manual de la app móvil

En un Android distinto a la computadora, instalar el APK y marcar:

- [ ] Registro de candidato restringido a `@upq.edu.mx` y correo de bienvenida.
- [ ] Inicio, cierre y recuperación de sesión.
- [ ] Perfil y fotografía visibles después de cerrar y abrir la app.
- [ ] Alta, edición y eliminación de experiencia, preparación y referencias.
- [ ] Habilidades y competencias guardadas y reflejadas en web.
- [ ] Vacantes, detalle, postulación, favoritos y cancelación.
- [ ] Mensajes enviados/recibidos y contador de no leídos.
- [ ] Chatbot y tarjeta visual de compatibilidad.
- [ ] Navegación sin superponerse con barras del sistema.

Conservar las capturas de cada bloque. La compilación automática demuestra que
el APK es válido; esta lista demuestra que cada flujo de negocio funciona.
