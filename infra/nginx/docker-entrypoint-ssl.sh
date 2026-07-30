#!/bin/sh
set -eu

CERT_DIR=/etc/nginx/certs
mkdir -p "$CERT_DIR"
if [ ! -f "$CERT_DIR/talentupq.crt" ] || [ ! -f "$CERT_DIR/talentupq.key" ]; then
  openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
    -keyout "$CERT_DIR/talentupq.key" \
    -out "$CERT_DIR/talentupq.crt" \
    -subj "/C=MX/ST=Queretaro/L=Queretaro/O=TalentUPQ/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
fi
