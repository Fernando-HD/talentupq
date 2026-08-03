#!/usr/bin/env python3
"""Genera evidencia reproducible de los controles desplegados de TalentUPQ."""

import json
import os
import sys
from urllib.parse import urlparse

import requests


BASE_URL = os.getenv('TALENTUPQ_URL', 'https://talentupq-api.onrender.com').rstrip('/')
EMAIL = os.getenv('TALENTUPQ_TEST_EMAIL', '').strip()
PASSWORD = os.getenv('TALENTUPQ_TEST_PASSWORD', '')
TIMEOUT = 30


def check(name, condition, detail):
    result = {'punto': name, 'cumple': bool(condition), 'evidencia': detail}
    print(json.dumps(result, ensure_ascii=False))
    if not condition:
        raise AssertionError(f'{name}: {detail}')


def get(path, **kwargs):
    return requests.get(f'{BASE_URL}{path}', timeout=TIMEOUT, **kwargs)


def main():
    parsed = urlparse(BASE_URL)
    check('HTTPS/SSL', parsed.scheme == 'https', BASE_URL)

    health = get('/api/v1/health')
    check('API y PostgreSQL', health.status_code == 200 and health.json().get('database') == 'ok', health.text)

    security = get('/api/v1/security/status')
    security_body = security.json() if security.ok else {}
    check(
        'Firewall de aplicación',
        security.ok and security_body.get('firewall') == 'active' and security_body.get('rate_limit') is True,
        security.text,
    )

    attack = get('/api/v1/vacantes', params={'q': '<script>alert(1)</script>'})
    check('Bloqueo del firewall', attack.status_code == 403, f'HTTP {attack.status_code}: {attack.text}')

    metrics = get('/metrics')
    required_metrics = (
        'talentupq_http_requests_total',
        'talentupq_database_available',
        'talentupq_firewall_blocked_requests_total',
    )
    check(
        'Métricas Prometheus',
        metrics.ok and all(metric in metrics.text for metric in required_metrics),
        ', '.join(required_metrics),
    )

    protected = get('/api/v1/auth/me')
    check('JWT rechaza sin token', protected.status_code == 401, f'HTTP {protected.status_code}')

    if EMAIL and PASSWORD:
        login = requests.post(
            f'{BASE_URL}/api/v1/auth/login',
            json={'email': EMAIL, 'password': PASSWORD},
            timeout=TIMEOUT,
        )
        token = (login.json() if login.headers.get('content-type', '').startswith('application/json') else {}).get('access_token')
        check('Login devuelve JWT', login.ok and bool(token), f'HTTP {login.status_code}')
        accepted = get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
        check('JWT válido permite acceso', accepted.ok, f'HTTP {accepted.status_code}: {accepted.text}')
    else:
        print(json.dumps({
            'punto': 'JWT válido permite acceso',
            'cumple': None,
            'evidencia': 'Ejecuta con TALENTUPQ_TEST_EMAIL y TALENTUPQ_TEST_PASSWORD para comprobarlo.',
        }, ensure_ascii=False))

    for path, label in (('/api/v1/vacantes', 'Vacantes'), ('/api/v1/habilidades', 'Habilidades')):
        response = get(path)
        check(f'API pública: {label}', response.ok and isinstance(response.json(), list), f'HTTP {response.status_code}')

    print('\nVerificación de nube terminada correctamente.')


if __name__ == '__main__':
    try:
        main()
    except (AssertionError, requests.RequestException, ValueError) as exc:
        print(f'ERROR: {exc}', file=sys.stderr)
        raise SystemExit(1)
