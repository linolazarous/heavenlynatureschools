"""
P2 Feature Tests (Iteration 3) - Heavenly Nature School
Tests: blog edit (PUT), event edit (PUT), contacts read/unread (PATCH), stats unreadContacts
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001').rstrip('/')
# Admin credentials — read from env so prod rotations don't require test edits.
# Defaults match the development seed values in backend/.env.example.
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'admin@heavenlynature.com')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')


# ─── Fixtures ─────────────────────────────────────────────────────────────────

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


# ─── Admin Stats with unreadContacts ──────────────────────────────────────────

class TestAdminStats:
    """GET /api/admin/stats returns unreadContacts field"""

    def test_stats_returns_200(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/admin/stats")
        assert resp.status_code == 200, f"Stats returned {resp.status_code}: {resp.text}"

    def test_stats_has_required_fields(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/admin/stats")
        data = resp.json()
        assert "contacts" in data, f"Missing 'contacts' in stats: {data}"
        assert "unreadContacts" in data, f"Missing 'unreadContacts' in stats: {data}"
        assert "blogPosts" in data, f"Missing 'blogPosts' in stats: {data}"
        assert "events" in data, f"Missing 'events' in stats: {data}"

    def test_stats_unread_contacts_is_integer(self, auth_session):
        resp = auth_session.get(f"{BASE_URL}/api/admin/stats")
        data = resp.json()
        assert isinstance(data["unreadContacts"], int), f"unreadContacts should be int, got {type(data['unreadContacts'])}"

    def test_stats_unread_count_matches_contacts(self, auth_session):
        """unreadContacts in stats should match count of unread contacts in contacts list"""
        stats_resp = auth_session.get(f"{BASE_URL}/api/admin/stats")
        contacts_resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        stats_data = stats_resp.json()
        contacts_data = contacts_resp.json()
        actual_unread = sum(1 for c in contacts_data if not c.get("read", False))
        assert stats_data["unreadContacts"] == actual_unread, (
            f"Stats says {stats_data['unreadContacts']} unread but contacts list has {actual_unread} unread"
        )

    def test_stats_requires_auth(self, api_session):
        """Stats endpoint must reject unauthenticated requests"""
        fresh_session = requests.Session()
        fresh_session.headers.update({"Content-Type": "application/json"})
        resp = fresh_session.get(f"{BASE_URL}/api/admin/stats")
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"


# ─── Contacts Read/Unread ─────────────────────────────────────────────────────

class TestContactsReadUnread:
    """PATCH /api/admin/contacts/{id} — mark as read/unread"""

    @pytest.fixture(scope="class")
    def test_contact_id(self, auth_session):
        """Get the first contact's ID for read/unread testing, or create one"""
        resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        assert resp.status_code == 200
        contacts = resp.json()
        if contacts:
            return contacts[0]["id"]
        # Create a contact if none exist
        create_resp = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_ReadUnread User",
            "email": "test_readunread@example.com",
            "phone": "1234567890",
            "subject": "TEST read/unread subject",
            "message": "TEST read/unread message"
        })
        assert create_resp.status_code == 200
        return create_resp.json()["id"]

    def test_patch_mark_as_read(self, auth_session, test_contact_id):
        """PATCH with {read: true} marks contact as read"""
        resp = auth_session.patch(
            f"{BASE_URL}/api/admin/contacts/{test_contact_id}",
            json={"read": True}
        )
        assert resp.status_code == 200, f"PATCH returned {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("success"), f"Expected success:true, got {data}"
        assert data.get("read"), f"Expected read:true in response, got {data}"

    def test_get_contact_is_read_after_patch(self, auth_session, test_contact_id):
        """After marking as read, contact list should show read=True for that contact"""
        # Mark as read
        auth_session.patch(
            f"{BASE_URL}/api/admin/contacts/{test_contact_id}",
            json={"read": True}
        )
        # Verify in contacts list
        resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        assert resp.status_code == 200
        contacts = resp.json()
        contact = next((c for c in contacts if c["id"] == test_contact_id), None)
        assert contact is not None, f"Contact {test_contact_id} not found in list"
        assert contact["read"], f"Contact should be read=True, got {contact['read']}"

    def test_patch_mark_as_unread(self, auth_session, test_contact_id):
        """PATCH with {read: false} marks contact as unread"""
        resp = auth_session.patch(
            f"{BASE_URL}/api/admin/contacts/{test_contact_id}",
            json={"read": False}
        )
        assert resp.status_code == 200, f"PATCH returned {resp.status_code}: {resp.text}"
        data = resp.json()
        assert data.get("success")
        assert not data.get("read"), f"Expected read:false in response, got {data}"

    def test_get_contact_is_unread_after_patch(self, auth_session, test_contact_id):
        """After marking as unread, contact list should show read=False"""
        auth_session.patch(
            f"{BASE_URL}/api/admin/contacts/{test_contact_id}",
            json={"read": False}
        )
        resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        contacts = resp.json()
        contact = next((c for c in contacts if c["id"] == test_contact_id), None)
        assert contact is not None
        assert not contact["read"], f"Contact should be read=False, got {contact['read']}"

    def test_stats_unread_count_decreases_after_marking_read(self, auth_session):
        """When a contact is marked read, unreadContacts in stats should decrease"""
        # Get a list of unread contacts
        contacts_resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        contacts = contacts_resp.json()
        unread_contacts = [c for c in contacts if not c.get("read", False)]
        if not unread_contacts:
            pytest.skip("No unread contacts to test with")
        
        contact_id = unread_contacts[0]["id"]
        
        # Get initial unread count from stats
        stats_before = auth_session.get(f"{BASE_URL}/api/admin/stats").json()
        count_before = stats_before["unreadContacts"]
        
        # Mark as read
        auth_session.patch(f"{BASE_URL}/api/admin/contacts/{contact_id}", json={"read": True})
        
        # Get new stats
        stats_after = auth_session.get(f"{BASE_URL}/api/admin/stats").json()
        count_after = stats_after["unreadContacts"]
        
        assert count_after == count_before - 1, (
            f"Expected unread count to decrease from {count_before} to {count_before-1}, got {count_after}"
        )
        
        # Restore to unread
        auth_session.patch(f"{BASE_URL}/api/admin/contacts/{contact_id}", json={"read": False})

    def test_patch_invalid_id_returns_404(self, auth_session):
        """PATCH with non-existent ID returns 404"""
        resp = auth_session.patch(
            f"{BASE_URL}/api/admin/contacts/000000000000000000000000",
            json={"read": True}
        )
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"

    def test_patch_requires_auth(self):
        """PATCH contacts requires authentication"""
        fresh_session = requests.Session()
        fresh_session.headers.update({"Content-Type": "application/json"})
        resp = fresh_session.patch(
            f"{BASE_URL}/api/admin/contacts/000000000000000000000000",
            json={"read": True}
        )
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    def test_delete_contact_still_works(self, auth_session):
        """DELETE contact still works after read/unread feature added"""
        # Create a test contact to delete
        create_resp = requests.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Delete Contact",
            "email": "test_delete@example.com",
            "subject": "TEST delete subject",
            "message": "TEST delete message"
        })
        assert create_resp.status_code == 200
        contact_id = create_resp.json()["id"]
        
        # Delete it
        del_resp = auth_session.delete(f"{BASE_URL}/api/admin/contacts/{contact_id}")
        assert del_resp.status_code == 200, f"DELETE returned {del_resp.status_code}: {del_resp.text}"
        
        # Verify it's gone
        contacts_resp = auth_session.get(f"{BASE_URL}/api/admin/contacts")
        contacts = contacts_resp.json()
        assert not any(c["id"] == contact_id for c in contacts), "Contact still exists after deletion"


# ─── Blog Edit (PUT) ──────────────────────────────────────────────────────────

class TestBlogEdit:
    """PUT /api/admin/blog/{id} — edit blog post"""

    @pytest.fixture(scope="class")
    def test_blog_id(self, auth_session):
        """Create a test blog post and return its ID"""
        resp = auth_session.post(f"{BASE_URL}/api/admin/blog", json={
            "title": "TEST_Edit Blog Original Title",
            "excerpt": "TEST original excerpt",
            "content": "TEST original content for edit test",
            "imageUrl": "",
            "publishDate": "2026-01-01"
        })
        assert resp.status_code == 200, f"Failed to create test blog: {resp.text}"
        return resp.json()["id"]

    def test_put_blog_returns_200(self, auth_session, test_blog_id):
        """PUT /api/admin/blog/{id} returns 200"""
        resp = auth_session.put(f"{BASE_URL}/api/admin/blog/{test_blog_id}", json={
            "title": "TEST_Edit Blog Updated Title",
            "excerpt": "TEST updated excerpt",
            "content": "TEST updated content",
            "imageUrl": "",
            "publishDate": "2026-02-01"
        })
        assert resp.status_code == 200, f"PUT returned {resp.status_code}: {resp.text}"

    def test_put_blog_updates_title(self, auth_session, test_blog_id):
        """PUT updates blog title"""
        new_title = "TEST_Blog Title After Edit"
        resp = auth_session.put(f"{BASE_URL}/api/admin/blog/{test_blog_id}", json={
            "title": new_title,
            "excerpt": "TEST excerpt",
            "content": "TEST content",
            "imageUrl": "",
            "publishDate": "2026-02-15"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == new_title, f"Title not updated: {data['title']}"

    def test_put_blog_persists_in_db(self, auth_session, test_blog_id):
        """After PUT, GET /api/blog/{id} returns updated content"""
        updated_title = "TEST_Persisted Blog Title"
        auth_session.put(f"{BASE_URL}/api/admin/blog/{test_blog_id}", json={
            "title": updated_title,
            "excerpt": "TEST persisted excerpt",
            "content": "TEST persisted content",
            "imageUrl": "",
            "publishDate": "2026-03-01"
        })
        # GET to verify persistence
        get_resp = auth_session.get(f"{BASE_URL}/api/blog/{test_blog_id}")
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert data["title"] == updated_title, f"DB not updated: {data['title']}"

    def test_put_blog_invalid_id_returns_404(self, auth_session):
        """PUT with non-existent ID returns 404"""
        resp = auth_session.put(f"{BASE_URL}/api/admin/blog/000000000000000000000000", json={
            "title": "TEST title",
            "excerpt": "TEST excerpt",
            "content": "TEST content",
            "imageUrl": "",
            "publishDate": "2026-01-01"
        })
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"

    def test_put_blog_requires_auth(self):
        """PUT blog requires authentication"""
        fresh_session = requests.Session()
        fresh_session.headers.update({"Content-Type": "application/json"})
        resp = fresh_session.put(f"{BASE_URL}/api/admin/blog/000000000000000000000000", json={
            "title": "title",
            "excerpt": "excerpt",
            "content": "content",
            "imageUrl": "",
            "publishDate": "2026-01-01"
        })
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    def test_cleanup_test_blog(self, auth_session, test_blog_id):
        """Cleanup: delete the test blog post"""
        resp = auth_session.delete(f"{BASE_URL}/api/admin/blog/{test_blog_id}")
        assert resp.status_code == 200, f"Cleanup failed: {resp.text}"


# ─── Event Edit (PUT) ─────────────────────────────────────────────────────────

class TestEventEdit:
    """PUT /api/admin/events/{id} — edit event"""

    @pytest.fixture(scope="class")
    def test_event_id(self, auth_session):
        """Create a test event and return its ID"""
        resp = auth_session.post(f"{BASE_URL}/api/admin/events", json={
            "title": "TEST_Edit Event Original Title",
            "description": "TEST original event description",
            "eventDate": "2026-06-01T10:00:00",
            "location": "TEST Original Location",
            "imageUrl": ""
        })
        assert resp.status_code == 200, f"Failed to create test event: {resp.text}"
        return resp.json()["id"]

    def test_put_event_returns_200(self, auth_session, test_event_id):
        """PUT /api/admin/events/{id} returns 200"""
        resp = auth_session.put(f"{BASE_URL}/api/admin/events/{test_event_id}", json={
            "title": "TEST_Edit Event Updated Title",
            "description": "TEST updated description",
            "eventDate": "2026-07-01T14:00:00",
            "location": "TEST Updated Location",
            "imageUrl": ""
        })
        assert resp.status_code == 200, f"PUT returned {resp.status_code}: {resp.text}"

    def test_put_event_updates_title(self, auth_session, test_event_id):
        """PUT updates event title"""
        new_title = "TEST_Event Title After Edit"
        resp = auth_session.put(f"{BASE_URL}/api/admin/events/{test_event_id}", json={
            "title": new_title,
            "description": "TEST description",
            "eventDate": "2026-08-01T09:00:00",
            "location": "TEST Location",
            "imageUrl": ""
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == new_title, f"Title not updated: {data['title']}"

    def test_put_event_persists_in_db(self, auth_session, test_event_id):
        """After PUT, GET /api/events/{id} returns updated content"""
        updated_title = "TEST_Persisted Event Title"
        auth_session.put(f"{BASE_URL}/api/admin/events/{test_event_id}", json={
            "title": updated_title,
            "description": "TEST persisted description",
            "eventDate": "2026-09-01T10:00:00",
            "location": "TEST Persisted Location",
            "imageUrl": ""
        })
        get_resp = auth_session.get(f"{BASE_URL}/api/events/{test_event_id}")
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert data["title"] == updated_title, f"DB not updated: {data['title']}"

    def test_put_event_invalid_id_returns_404(self, auth_session):
        """PUT with non-existent ID returns 404"""
        resp = auth_session.put(f"{BASE_URL}/api/admin/events/000000000000000000000000", json={
            "title": "TEST title",
            "description": "TEST desc",
            "eventDate": "2026-01-01T10:00:00",
            "location": "",
            "imageUrl": ""
        })
        assert resp.status_code == 404, f"Expected 404, got {resp.status_code}"

    def test_put_event_requires_auth(self):
        """PUT event requires authentication"""
        fresh_session = requests.Session()
        fresh_session.headers.update({"Content-Type": "application/json"})
        resp = fresh_session.put(f"{BASE_URL}/api/admin/events/000000000000000000000000", json={
            "title": "title",
            "description": "desc",
            "eventDate": "2026-01-01T10:00:00",
            "location": "",
            "imageUrl": ""
        })
        assert resp.status_code == 401, f"Expected 401, got {resp.status_code}"

    def test_cleanup_test_event(self, auth_session, test_event_id):
        """Cleanup: delete the test event"""
        resp = auth_session.delete(f"{BASE_URL}/api/admin/events/{test_event_id}")
        assert resp.status_code == 200, f"Cleanup failed: {resp.text}"
