"""
Pytest configuration and session-wide test fixtures
"""
import pytest
from app.db.firestore_client import get_db
from app.db.seed_data import seed_initial_data

@pytest.fixture(scope="session", autouse=True)
def initialize_test_database():
    db = get_db()
    seed_initial_data(db)
    yield
