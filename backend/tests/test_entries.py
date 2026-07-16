from .conftest import client


def test_list_entries_without_login():
    response = client.get("/entries")
    assert response.status_code in [401, 403]