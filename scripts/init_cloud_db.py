"""Inicializa de forma idempotente PostgreSQL para despliegues cloud."""

import os
from pathlib import Path
from urllib.parse import quote_plus

import psycopg2
from werkzeug.security import generate_password_hash


ROOT = Path(__file__).resolve().parents[1]
LOCK_ID = 847_2026_0730


def sql_without_psql_commands(path):
    return '\n'.join(
        line for line in path.read_text(encoding='utf-8').splitlines()
        if not line.startswith('\\')
    )


def main():
    database_url = os.getenv('DATABASE_URL')
    if not database_url:
        user = quote_plus(os.getenv('DB_USER', 'postgres'))
        password = quote_plus(os.getenv('DB_PASSWORD', 'postgres'))
        host = os.getenv('DB_HOST', 'localhost')
        port = os.getenv('DB_PORT', '5432')
        name = os.getenv('DB_NAME', 'bolsatrabajoupq')
        database_url = f'postgresql://{user}:{password}@{host}:{port}/{name}'
    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            cursor.execute('SELECT pg_advisory_xact_lock(%s)', (LOCK_ID,))
            cursor.execute("SELECT to_regclass('public.usuarios')")
            if cursor.fetchone()[0] is None:
                cursor.execute(sql_without_psql_commands(ROOT / 'database' / 'schema.sql'))
                print('Esquema PostgreSQL creado.')
            cursor.execute('SET search_path TO public')
            # Fotos embebidas: evita perder archivos en discos efímeros o entre instancias.
            cursor.execute('ALTER TABLE candidatos ALTER COLUMN fotoperfil TYPE TEXT')
            cursor.execute((ROOT / 'database' / 'seed_catalogs.sql').read_text(encoding='utf-8'))
            print('Catálogos PostgreSQL verificados.')

            admin_email = os.getenv('INITIAL_ADMIN_EMAIL', '').strip().lower()
            admin_password = os.getenv('INITIAL_ADMIN_PASSWORD', '')
            if admin_email and admin_password:
                cursor.execute(
                    "SELECT usuarioid FROM usuarios WHERE LOWER(email) = %s",
                    (admin_email,),
                )
                row = cursor.fetchone()
                if row is None:
                    cursor.execute(
                        """INSERT INTO usuarios (email, passwordhash, tipousuario, activo)
                           VALUES (%s, %s, 'admin', TRUE) RETURNING usuarioid""",
                        (admin_email, generate_password_hash(admin_password)),
                    )
                    user_id = cursor.fetchone()[0]
                    cursor.execute(
                        """INSERT INTO administradores (administradorid, usuarioid)
                           VALUES (%s, %s)""",
                        (user_id, user_id),
                    )
                    print('Administrador inicial creado desde variables seguras.')


if __name__ == '__main__':
    main()
