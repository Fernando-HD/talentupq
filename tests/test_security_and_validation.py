import unittest
from unittest.mock import patch

import hello


class SecurityTests(unittest.TestCase):
    def test_sensitive_values_are_encrypted_and_authenticated(self):
        plaintext = '123456'
        encrypted = hello.encrypt_sensitive(plaintext)
        self.assertNotEqual(encrypted, plaintext)
        self.assertEqual(hello.decrypt_sensitive(encrypted), plaintext)
        self.assertTrue(hello.secure_equals_encrypted(encrypted, plaintext))
        self.assertFalse(hello.secure_equals_encrypted(encrypted, '654321'))

    def test_metrics_endpoint_uses_prometheus_format(self):
        response = hello.app.test_client().get('/metrics')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'talentupq_http_requests_total', response.data)

    def test_passkey_registration_requires_admin_session(self):
        response = hello.app.test_client().post('/admin/passkeys/register/options')
        self.assertEqual(response.status_code, 302)

    def test_passkey_options_require_device_verification(self):
        with hello.app.test_client() as client:
            with client.session_transaction() as session:
                session['tipo'] = 'admin'
                session['user_id'] = 1
                session['email'] = 'admin@upq.edu.mx'
            with patch.object(hello, 'execute_query', return_value=[]):
                response = client.post('/admin/passkeys/register/options')
        self.assertEqual(response.status_code, 200)
        options = response.get_json()
        self.assertEqual(options['rp']['id'], 'localhost')
        self.assertEqual(options['authenticatorSelection']['userVerification'], 'required')


class ValidationTests(unittest.TestCase):
    def test_candidate_registration_requires_upq_email(self):
        response = hello.app.test_client().post('/api/v1/auth/register', json={
            'nombre': 'Alumno',
            'apellido': 'Prueba',
            'email': 'alumno@gmail.com',
            'password': 'Password1',
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn('@upq.edu.mx', response.get_json()['error'])

    def test_rejects_invalid_phone_and_date(self):
        phone_error = hello.validate_api_fields({'Telefono': '123'}, phone_fields=('Telefono',))
        date_error = hello.validate_api_fields({'FechaInicio': '28/07/2026'}, date_fields=('FechaInicio',))
        self.assertIn('10 dígitos', phone_error)
        self.assertIn('AAAA-MM-DD', date_error)

    def test_rejects_missing_and_oversized_fields(self):
        missing = hello.validate_api_fields({}, required=('Nombre',))
        oversized = hello.validate_api_fields({'Nombre': 'x' * 11}, max_lengths={'Nombre': 10})
        self.assertIn('Nombre', missing)
        self.assertIn('10', oversized)

    def test_rejects_inverted_date_range(self):
        error = hello.validate_date_order(
            {'FechaInicio': '2026-07-28', 'FechaFin': '2026-01-01'},
            'FechaInicio',
            'FechaFin',
        )
        self.assertIsNotNone(error)


if __name__ == '__main__':
    unittest.main()
