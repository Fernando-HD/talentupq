FROM nginx:1.29-alpine

RUN apk add --no-cache openssl
COPY nginx.conf /etc/nginx/nginx.conf
COPY docker-entrypoint-ssl.sh /docker-entrypoint.d/20-generate-local-certificate.sh
RUN chmod +x /docker-entrypoint.d/20-generate-local-certificate.sh
