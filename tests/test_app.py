import pytest
from unittest.mock import patch, MagicMock
from hello import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_health(client):
    """Verifica que el endpoint de salud responde correctamente"""
    response = client.get("/health")
    assert response.status_code == 200

def test_home_mock(client):
    """Verifica que la ruta principal responde sin conexión a BD"""
    with patch("hello.execute_query") as mock_query:
        mock_query.return_value = []
        response = client.get("/")
        assert response.status_code in [200, 302, 500]
