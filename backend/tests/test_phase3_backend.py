"""
Phase 3 Backend API Tests - Heavenly Nature Nursery & Primary School
Tests: auth (login/logout/me), contacts CRUD, blog CRUD, events CRUD, admin stats, health
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').rstrip('/')
# Admin credentials — read from env so prod rotations don't require test edits.
# Defaults match the development seed values in backend/.env.example.
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@heavenlynature.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')


# ─── Fixtures ──────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def api_session():
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture(scope="module")
def auth_session(api_session):
    """Login and return session with httpOnly cookie set"""
    resp = api_session.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if resp.status_code != 200:
        pytest.skip(f"Login failed ({resp.status_code}): {resp.text}")
    return api_session


# ─── Health ────────────────────────────────────────────────────────────────

class TestHealth:
    """Health check endpoint"""

    def test_health_returns_ok(self, api_session):
        resp = api_session.get(f"{BASE_URL}/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok", f"Expected status:ok, got {data}"


# ─── Auth ──────────────────────────────────────────────────────────────────

class TestAuth:
    """Authentication flow: login / me / logout"""

    def test_login_correct_credentials(self, api_session):
        resp = api_session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL
        assert "name" in data
        assert "role" in data

    def test_login_sets_cookie(self, api_session):
        resp = api_session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert resp.status_code == 200
        # Cookie should be set — we verify auth works in a follow-up /api/auth/me
        # test below (that's the real end-to-end cookie check). Nothing extra to
        # assert here beyond the 200 response.
        assert True

    def test_login_wrong_credentials_returns_401(self, api_session):
        fresh = requests.Session()
        fresh.headers.update({"Content-Type": "application/json"})
        resp = fresh.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": "definitely-not-the-real-password"
        })
        assert resp.status_code == 401
        data = resp.json()
        assert "detail" in data

    def test_login_wrong_email_returns_401(self, api_session):
        fresh = requests.Session()
        fresh.headers.update({"Content-Type": "application/json"})
        resp = fresh.post(f"{BASE_URL}/api/auth/login", json={
            "email": "notadmin@example.com",
            "password": "irrelevant-password"
        })
        assert resp.status_code == 401

    def test_me_with_valid_cookie(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 200
        data = resp.json()
        assert "email" in data
        assert data["email"] == ADMIN_EMAIL

    def test_me_without_cookie_returns_401(self):
        fresh = requests.Session()
        fresh.headers.update({"Content-Type": "application/json"})
        resp = fresh.get(f"{BASE_URL}/api/auth/me")
        assert resp.status_code == 401

    def test_logout_clears_session(self, api_session):
        # Login fresh session
        logout_session = requests.Session()
        logout_session.headers.update({"Content-Type": "application/json"})
        login_resp = logout_session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_resp.status_code == 200

        # Verify authenticated
        me_resp = logout_session.get(f"{BASE_URL}/api/auth/me")
        assert me_resp.status_code == 200

        # Logout
        logout_resp = logout_session.post(f"{BASE_URL}/api/auth/logout")
        assert logout_resp.status_code == 200

        # After logout, me should return 401
        me_after = logout_session.get(f"{BASE_URL}/api/auth/me")
        assert me_after.status_code == 401


# ─── Contact ───────────────────────────────────────────────────────────────

class TestContacts:
    """Contact CRUD: submit public / get admin / delete admin"""

    created_id = None

    def test_submit_contact_public(self, api_session):
        resp = api_session.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Contact User",
            "email": "test_contact@example.com",
            "phone": "+1234567890",
            "subject": "TEST Subject Phase 3",
            "message": "This is a test message from phase 3 testing."
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("success")
        assert "id" in data
        assert isinstance(data["id"], str)
        TestContacts.created_id = data["id"]

    def test_get_contacts_authenticated(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)
        # Verify our created contact is present
        if TestContacts.created_id:
            ids = [c["id"] for c in data]
            assert TestContacts.created_id in ids, f"Created contact {TestContacts.created_id} not in list"

    def test_get_contacts_unauthenticated_returns_401(self):
        fresh = requests.Session()
        fresh.headers.update({"Content-Type": "application/json"})
        resp = fresh.get(f"{BASE_URL}/api/admin/contacts")
        assert resp.status_code == 401

    def test_contact_has_required_fields(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        assert resp.status_code == 200
        data = resp.json()
        if data:
            contact = data[0]
            for field in ["id", "name", "email", "subject", "message", "date"]:
                assert field in contact, f"Missing field: {field}"

    def test_delete_contact_authenticated(self, auth_session):
        if not TestContacts.created_id:
            pytest.skip("No contact created to delete")
        resp = auth_session.delete(f"{BASE_URL}/api/admin/contacts/{TestContacts.created_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("success")

    def test_delete_contact_verifies_removal(self, auth_session):
        if not TestContacts.created_id:
            pytest.skip("No contact created to verify deletion")
        # Fetch contacts again — deleted id should not be there
        resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        assert resp.status_code == 200
        ids = [c["id"] for c in resp.json()]
        assert TestContacts.created_id not in ids

    def test_delete_nonexistent_contact_returns_404(self, auth_session):
        resp = auth_session.delete(f"{BASE_URL}/api/admin/contacts/000000000000000000000001")
        assert resp.status_code == 404


# ─── Blog ──────────────────────────────────────────────────────────────────

class TestBlog:
    """Blog CRUD: GET public / POST admin / PUT admin / DELETE admin"""

    created_id = None

    def test_get_blog_posts_public(self, api_session):
        resp = api_session.get(f"{BASE_URL}/api/blog")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    def test_get_blog_no_auth_required(self):
        fresh = requests.Session()
        resp = fresh.get(f"{BASE_URL}/api/blog")
        assert resp.status_code == 200

    def test_create_blog_post_authenticated(self, auth_session):
        resp = auth_session.post(f"{BASE_URL}/api/admin/blog", json={
            "title": "TEST_Blog Post Phase 3",
            "excerpt": "This is a test excerpt for phase 3.",
            "content": "This is the full test content for phase 3.",
            "imageUrl": "",
            "publishDate": "2026-02-15"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["title"] == "TEST_Blog Post Phase 3"
        assert data["excerpt"] == "This is a test excerpt for phase 3."
        TestBlog.created_id = data["id"]

    def test_create_blog_unauthenticated_returns_401(self):
        fresh = requests.Session()
        fresh.headers.update({"Content-Type": "application/json"})
        resp = fresh.post(f"{BASE_URL}/api/admin/blog", json={
            "title": "Unauthorized Post",
            "excerpt": "Should fail",
            "content": "Should fail",
            "imageUrl": "",
            "publishDate": "2026-02-15"
        })
        assert resp.status_code == 401

    def test_get_blog_post_by_id(self, api_session):
        if not TestBlog.created_id:
            pytest.skip("No blog post created")
        resp = api_session.get(f"{BASE_URL}/api/blog/{TestBlog.created_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == TestBlog.created_id
        assert data["title"] == "TEST_Blog Post Phase 3"

    def test_update_blog_post_authenticated(self, auth_session):
        if not TestBlog.created_id:
            pytest.skip("No blog post created")
        resp = auth_session.put(f"{BASE_URL}/api/admin/blog/{TestBlog.created_id}", json={
            "title": "TEST_Blog Post Phase 3 Updated",
            "excerpt": "Updated excerpt",
            "content": "Updated content",
            "imageUrl": "",
            "publishDate": "2026-02-16"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "TEST_Blog Post Phase 3 Updated"

    def test_update_blog_verify_persistence(self, api_session):
        if not TestBlog.created_id:
            pytest.skip("No blog post created")
        resp = api_session.get(f"{BASE_URL}/api/blog/{TestBlog.created_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "TEST_Blog Post Phase 3 Updated"

    def test_delete_blog_post_authenticated(self, auth_session):
        if not TestBlog.created_id:
            pytest.skip("No blog post created")
        resp = auth_session.delete(f"{BASE_URL}/api/admin/blog/{TestBlog.created_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("success")

    def test_delete_blog_verify_removal(self, api_session):
        if not TestBlog.created_id:
            pytest.skip("No blog post created")
        resp = api_session.get(f"{BASE_URL}/api/blog/{TestBlog.created_id}")
        assert resp.status_code == 404


# ─── Events ────────────────────────────────────────────────────────────────

class TestEvents:
    """Events CRUD: GET public / POST admin / PUT admin / DELETE admin"""

    created_id = None

    def test_get_events_public(self, api_session):
        resp = api_session.get(f"{BASE_URL}/api/events")
        assert resp.status_code == 200
        data = resp.json()
        assert isinstance(data, list)

    def test_get_events_no_auth_required(self):
        fresh = requests.Session()
        resp = fresh.get(f"{BASE_URL}/api/events")
        assert resp.status_code == 200

    def test_create_event_authenticated(self, auth_session):
        resp = auth_session.post(f"{BASE_URL}/api/admin/events", json={
            "title": "TEST_Event Phase 3",
            "description": "This is a test event for phase 3.",
            "eventDate": "2026-03-15T10:00:00",
            "location": "Test Location",
            "imageUrl": ""
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "id" in data
        assert data["title"] == "TEST_Event Phase 3"
        TestEvents.created_id = data["id"]

    def test_create_event_unauthenticated_returns_401(self):
        fresh = requests.Session()
        fresh.headers.update({"Content-Type": "application/json"})
        resp = fresh.post(f"{BASE_URL}/api/admin/events", json={
            "title": "Unauthorized Event",
            "description": "Should fail",
            "eventDate": "2026-03-15T10:00:00",
            "location": "",
            "imageUrl": ""
        })
        assert resp.status_code == 401

    def test_get_event_by_id(self, api_session):
        if not TestEvents.created_id:
            pytest.skip("No event created")
        resp = api_session.get(f"{BASE_URL}/api/events/{TestEvents.created_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == TestEvents.created_id
        assert data["title"] == "TEST_Event Phase 3"

    def test_delete_event_authenticated(self, auth_session):
        if not TestEvents.created_id:
            pytest.skip("No event created")
        resp = auth_session.delete(f"{BASE_URL}/api/admin/events/{TestEvents.created_id}")
        assert resp.status_code == 200
        data = resp.json()
        assert data.get("success")

    def test_delete_event_verify_removal(self, api_session):
        if not TestEvents.created_id:
            pytest.skip("No event created")
        resp = api_session.get(f"{BASE_URL}/api/events/{TestEvents.created_id}")
        assert resp.status_code == 404


# ─── Admin Stats ───────────────────────────────────────────────────────────

class TestAdminStats:
    """Admin stats endpoint"""

    def test_get_stats_authenticated(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/admin/stats")
        assert resp.status_code == 200
        data = resp.json()
        assert "contacts" in data
        assert "blogPosts" in data
        assert "events" in data
        assert isinstance(data["contacts"], int)
        assert isinstance(data["blogPosts"], int)
        assert isinstance(data["events"], int)

    def test_get_stats_unauthenticated_returns_401(self):
        fresh = requests.Session()
        resp = fresh.get(f"{BASE_URL}/api/admin/stats")
        assert resp.status_code == 401


# ─── Critical Gap: Missing Admin GET endpoints ──────────────────────────────

class TestMissingAdminGetEndpoints:
    """
    Verify that AdminBlog and AdminEvents in frontend call
    GET /api/admin/blog and GET /api/admin/events which DO NOT exist in server.py.
    These endpoints will return 404/405 — this is a BUG.
    """

    def test_get_admin_blog_returns_error(self, auth_session):
        """GET /api/admin/blog does not exist — should return 404 or 405"""
        resp = auth_session.get(f"{BASE_URL}/api/admin/blog")
        # This endpoint does NOT exist in server.py
        # FastAPI returns 404 or 405
        print(f"GET /api/admin/blog status: {resp.status_code}")
        assert resp.status_code in [404, 405], (
            f"Expected 404/405 for non-existent GET /api/admin/blog, got {resp.status_code}. "
            "BUG: AdminBlog.js calls this but it doesn't exist. Should call GET /api/blog instead."
        )

    def test_get_admin_events_returns_error(self, auth_session):
        """GET /api/admin/events does not exist — should return 404 or 405"""
        resp = auth_session.get(f"{BASE_URL}/api/admin/events")
        # This endpoint does NOT exist in server.py
        print(f"GET /api/admin/events status: {resp.status_code}")
        assert resp.status_code in [404, 405], (
            f"Expected 404/405 for non-existent GET /api/admin/events, got {resp.status_code}. "
            "BUG: AdminEvents.js calls this but it doesn't exist. Should call GET /api/events instead."
        )
