from .conftest import client
import uuid

email = f"{uuid.uuid4()}@test.com"
username = f"user_{uuid.uuid4().hex[:8]}"

user = {
    "username": username,
    "email": email,
    "password": "Password123!"
}


def test_register():
    response = client.post("/auth/register", json=user)

    assert response.status_code in [200, 201]


def test_login():
    response = client.post(
        "/auth/login",
        json={
            "email": email,
            "password": "Password123!"
        },
    )

    assert response.status_code == 200