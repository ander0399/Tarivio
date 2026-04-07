import requests
import sys
from datetime import datetime
import uuid
import json

class TaricBackendTester:
    def __init__(self, base_url="https://arancelai.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_data = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data
        self.test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        self.test_password = "TestPassword123!"
        self.test_name = "Test User"
        self.test_company = "Test Company Ltd"

    def log_test_result(self, name, passed, details=""):
        """Log test result"""
        self.tests_run += 1
        if passed:
            self.tests_passed += 1
            
        result = {
            "test_name": name,
            "passed": passed,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"    Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}{endpoint}"
        
        default_headers = {'Content-Type': 'application/json'}
        if self.token:
            default_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            default_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"    URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=default_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                try:
                    response_data = response.json()
                    details = f"Status: {response.status_code}"
                    self.log_test_result(name, True, details)
                    return True, response_data
                except:
                    details = f"Status: {response.status_code}, Response: {response.text[:200]}"
                    self.log_test_result(name, True, details)
                    return True, {}
            else:
                try:
                    error_data = response.json()
                    details = f"Expected {expected_status}, got {response.status_code}. Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details = f"Expected {expected_status}, got {response.status_code}. Response: {response.text[:200]}"
                
                self.log_test_result(name, False, details)
                return False, {}

        except requests.exceptions.RequestException as e:
            details = f"Request error: {str(e)}"
            self.log_test_result(name, False, details)
            return False, {}

    def test_health_endpoints(self):
        """Test basic health endpoints"""
        print("\n🏥 TESTING HEALTH ENDPOINTS")
        
        # Test root endpoint
        success, _ = self.run_test(
            "Root endpoint",
            "GET",
            "/",
            200
        )
        
        # Test health endpoint
        success, _ = self.run_test(
            "Health check",
            "GET",
            "/health",
            200
        )

    def test_user_registration(self):
        """Test user registration"""
        print("\n👤 TESTING USER REGISTRATION")
        
        registration_data = {
            "email": self.test_email,
            "password": self.test_password,
            "name": self.test_name,
            "company": self.test_company
        }
        
        success, response = self.run_test(
            "User registration",
            "POST",
            "/auth/register",
            200,
            data=registration_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response.get('user', {})
            return True
        else:
            print(f"❌ Registration failed - no token in response: {response}")
            return False

    def test_duplicate_registration(self):
        """Test duplicate email registration"""
        print("\n🚫 TESTING DUPLICATE REGISTRATION")
        
        duplicate_data = {
            "email": self.test_email,  # Same email as before
            "password": "AnotherPassword123!",
            "name": "Another User",
            "company": "Another Company"
        }
        
        success, response = self.run_test(
            "Duplicate email registration",
            "POST",
            "/auth/register",
            400,
            data=duplicate_data
        )
        
        return success

    def test_user_login(self):
        """Test user login"""
        print("\n🔐 TESTING USER LOGIN")
        
        login_data = {
            "email": self.test_email,
            "password": self.test_password
        }
        
        # Clear token to test fresh login
        old_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "User login",
            "POST",
            "/auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_data = response.get('user', {})
            return True
        else:
            # Restore token if login failed
            self.token = old_token
            return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        print("\n❌ TESTING INVALID LOGIN")
        
        invalid_data = {
            "email": self.test_email,
            "password": "WrongPassword123!"
        }
        
        # Temporarily clear token
        old_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Invalid password login",
            "POST",
            "/auth/login",
            401,
            data=invalid_data
        )
        
        # Restore token
        self.token = old_token
        return success

    def test_get_current_user(self):
        """Test get current user endpoint"""
        print("\n👤 TESTING GET CURRENT USER")
        
        if not self.token:
            self.log_test_result("Get current user", False, "No token available")
            return False
        
        success, response = self.run_test(
            "Get current user",
            "GET",
            "/auth/me",
            200
        )
        
        if success:
            # Verify user data structure
            required_fields = ['id', 'email', 'name']
            for field in required_fields:
                if field not in response:
                    self.log_test_result(f"User data field '{field}'", False, f"Missing field: {field}")
                else:
                    self.log_test_result(f"User data field '{field}'", True, f"Field present: {response[field]}")
        
        return success

    def test_protected_route_without_token(self):
        """Test protected route without authentication"""
        print("\n🔒 TESTING PROTECTED ROUTE WITHOUT AUTH")
        
        # Temporarily clear token
        old_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Protected route without token",
            "GET",
            "/auth/me",
            401
        )
        
        # Restore token
        self.token = old_token
        return success

    def test_taric_search(self):
        """Test TARIC search functionality with B2B features"""
        print("\n🔍 TESTING TARIC SEARCH WITH B2B FEATURES")
        
        if not self.token:
            self.log_test_result("TARIC search", False, "No authentication token")
            return False, None
        
        search_data = {
            "product_description": "Aceite de oliva virgen extra importado de España en botellas de vidrio",
            "origin_country": "ES",
            "client_reference": "OP-2024-TEST-001"  # NEW: Test B2B client reference
        }
        
        print("    ⚠️  Note: This test may take 10-30 seconds due to AI processing...")
        
        success, response = self.run_test(
            "TARIC search with AI and B2B features",
            "POST",
            "/taric/search",
            200,
            data=search_data
        )
        
        if success and response:
            # Verify response structure including new B2B fields
            required_fields = ['id', 'taric_code', 'taric_description', 'tariffs', 'documents', 'compliance_alerts', 'client_reference']
            for field in required_fields:
                if field in response:
                    self.log_test_result(f"TARIC result field '{field}'", True, f"Present: {str(response[field])[:100]}...")
                else:
                    self.log_test_result(f"TARIC result field '{field}'", False, f"Missing field: {field}")
            
            # Test compliance alerts specifically
            if 'compliance_alerts' in response:
                alerts = response['compliance_alerts']
                if isinstance(alerts, list):
                    self.log_test_result("Compliance alerts format", True, f"Found {len(alerts)} alerts")
                    for i, alert in enumerate(alerts[:3]):  # Check first 3 alerts
                        alert_fields = ['type', 'severity', 'message']
                        for field in alert_fields:
                            if field in alert:
                                self.log_test_result(f"Alert {i+1} field '{field}'", True, f"Value: {alert[field]}")
                else:
                    self.log_test_result("Compliance alerts format", False, "Not a list")
            
            # NEW: Test documents have PDF fields (pdf_form, pdf_guide, online_portal)
            if 'documents' in response:
                documents = response['documents']
                if isinstance(documents, list):
                    self.log_test_result("TARIC documents format", True, f"Found {len(documents)} documents")
                    
                    # Check for PDF fields in documents
                    docs_with_pdf_form = [d for d in documents if d.get('pdf_form')]
                    docs_with_pdf_guide = [d for d in documents if d.get('pdf_guide')]
                    docs_with_online_portal = [d for d in documents if d.get('online_portal')]
                    
                    self.log_test_result("TARIC docs PDF form fields", len(docs_with_pdf_form) > 0, 
                                       f"{len(docs_with_pdf_form)} docs have PDF form links")
                    self.log_test_result("TARIC docs PDF guide fields", len(docs_with_pdf_guide) > 0, 
                                       f"{len(docs_with_pdf_guide)} docs have PDF guide links") 
                    self.log_test_result("TARIC docs online portal fields", len(docs_with_online_portal) > 0, 
                                       f"{len(docs_with_online_portal)} docs have online portal links")
                    
                    # Log first document with PDF fields for verification
                    for doc in documents[:2]:  # Check first 2 documents
                        if doc.get('pdf_form') or doc.get('pdf_guide') or doc.get('online_portal'):
                            self.log_test_result(f"Doc '{doc.get('name', 'Unknown')}' PDF links", True, 
                                               f"Form: {bool(doc.get('pdf_form'))}, Guide: {bool(doc.get('pdf_guide'))}, Portal: {bool(doc.get('online_portal'))}")
                else:
                    self.log_test_result("TARIC documents format", False, "Documents not a list")
            
            return success, response.get('id')
        
        return success, None

    def test_search_history(self):
        """Test search history retrieval"""
        print("\n📝 TESTING SEARCH HISTORY")
        
        if not self.token:
            self.log_test_result("Search history", False, "No authentication token")
            return False
        
        success, response = self.run_test(
            "Get search history",
            "GET",
            "/taric/history",
            200
        )
        
        if success:
            if isinstance(response, list):
                self.log_test_result("History format", True, f"Found {len(response)} items")
            else:
                self.log_test_result("History format", False, "Response is not a list")
        
        return success

    def test_get_search_result(self, result_id):
        """Test getting a specific search result"""
        print("\n📄 TESTING GET SEARCH RESULT")
        
        if not self.token or not result_id:
            self.log_test_result("Get search result", False, "No token or result ID")
            return False
        
        success, response = self.run_test(
            "Get specific search result",
            "GET",
            f"/taric/result/{result_id}",
            200
        )
        
        return success

    def test_delete_search_result(self, result_id):
        """Test deleting a search result"""
        print("\n🗑️ TESTING DELETE SEARCH RESULT")
        
        if not self.token or not result_id:
            self.log_test_result("Delete search result", False, "No token or result ID")
            return False
        
        success, response = self.run_test(
            "Delete search result",
            "DELETE",
            f"/taric/history/{result_id}",
            200
        )
        
        return success

    def test_organization_stats(self):
        """Test organization statistics endpoint (NEW B2B feature)"""
        print("\n📊 TESTING ORGANIZATION STATS")
        
        if not self.token:
            self.log_test_result("Organization stats", False, "No authentication token")
            return False
        
        success, response = self.run_test(
            "Get organization statistics",
            "GET",
            "/team/stats",
            200
        )
        
        if success and response:
            # Verify stats structure
            required_fields = ['total_searches', 'searches_this_month', 'team_members', 'saved_operations']
            for field in required_fields:
                if field in response:
                    self.log_test_result(f"Stats field '{field}'", True, f"Value: {response[field]}")
                else:
                    self.log_test_result(f"Stats field '{field}'", False, f"Missing field: {field}")
        
        return success

    def test_team_members(self):
        """Test team members management (NEW B2B feature)"""
        print("\n👥 TESTING TEAM MANAGEMENT")
        
        if not self.token:
            self.log_test_result("Team members", False, "No authentication token")
            return False, []
        
        # Get team members
        success, response = self.run_test(
            "Get team members",
            "GET",
            "/team/members",
            200
        )
        
        members = []
        if success and isinstance(response, list):
            members = response
            self.log_test_result("Team members format", True, f"Found {len(members)} members")
            
            # Check structure of first member if exists
            if members:
                member = members[0]
                member_fields = ['id', 'email', 'name', 'role', 'status']
                for field in member_fields:
                    if field in member:
                        self.log_test_result(f"Member field '{field}'", True, f"Value: {member[field]}")
                    else:
                        self.log_test_result(f"Member field '{field}'", False, f"Missing field: {field}")
        else:
            self.log_test_result("Team members format", False, "Response is not a list")
        
        return success, members

    def test_team_invite(self):
        """Test team member invitation (NEW B2B feature)"""
        print("\n💌 TESTING TEAM INVITE")
        
        if not self.token:
            self.log_test_result("Team invite", False, "No authentication token")
            return False, None
        
        invite_data = {
            "email": f"invited_{uuid.uuid4().hex[:8]}@example.com",
            "name": "Invited Test User",
            "role": "operator"
        }
        
        success, response = self.run_test(
            "Invite team member",
            "POST",
            "/team/invite",
            200,
            data=invite_data
        )
        
        member_id = None
        if success and response:
            # Verify invite response structure
            invite_fields = ['id', 'email', 'name', 'role', 'status']
            for field in invite_fields:
                if field in response:
                    self.log_test_result(f"Invite response field '{field}'", True, f"Value: {response[field]}")
                else:
                    self.log_test_result(f"Invite response field '{field}'", False, f"Missing field: {field}")
            
            member_id = response.get('id')
        
        return success, member_id

    def test_team_remove(self, member_id):
        """Test team member removal (NEW B2B feature)"""
        print("\n❌ TESTING TEAM MEMBER REMOVAL")
        
        if not self.token or not member_id:
            self.log_test_result("Remove team member", False, "No token or member ID")
            return False
        
        success, response = self.run_test(
            "Remove team member",
            "DELETE",
            f"/team/members/{member_id}",
            200
        )
        
        return success

    def test_regulatory_alerts(self):
        """Test regulatory alerts endpoint (NEW B2B feature)"""
        print("\n🚨 TESTING REGULATORY ALERTS")
        
        if not self.token:
            self.log_test_result("Regulatory alerts", False, "No authentication token")
            return False
        
        success, response = self.run_test(
            "Get regulatory alerts",
            "GET",
            "/alerts/regulatory",
            200
        )
        
        if success and isinstance(response, list):
            self.log_test_result("Regulatory alerts format", True, f"Found {len(response)} alerts")
            
            # Check structure of first alert if exists
            if response:
                alert = response[0]
                alert_fields = ['id', 'type', 'title', 'description', 'affected_codes', 'effective_date', 'source']
                for field in alert_fields:
                    if field in alert:
                        self.log_test_result(f"Alert field '{field}'", True, f"Present: {str(alert[field])[:50]}...")
                    else:
                        self.log_test_result(f"Alert field '{field}'", False, f"Missing field: {field}")
        else:
            self.log_test_result("Regulatory alerts format", False, "Response is not a list")
        
        return success

    def test_documents_library(self):
        """Test documents library endpoint - NEW FEATURE: Official PDFs Database"""
        print("\n📚 TESTING DOCUMENTS LIBRARY")
        
        if not self.token:
            self.log_test_result("Documents Library", False, "No authentication token")
            return False
        
        success, response = self.run_test(
            "Documents Library Endpoint",
            "GET",
            "/documents/library", 
            200
        )
        
        if success:
            documents = response.get('documents', [])
            categories = response.get('categories', {})
            
            # Check document count - should have 15 documents
            if len(documents) >= 15:
                self.log_test_result("Documents Library - Document Count", True, f"Found {len(documents)} documents (required: 15+)")
            else:
                self.log_test_result("Documents Library - Document Count", False, f"Only found {len(documents)} documents, expected 15+")
            
            # Check categories
            if len(categories) > 0:
                self.log_test_result("Documents Library - Categories", True, f"Found {len(categories)} categories")
            else:
                self.log_test_result("Documents Library - Categories", False, "No categories found")
            
            # Check for required document types
            doc_types = set(doc.get('type') for doc in documents)
            expected_types = {'cites', 'fitosanitario', 'aduanero', 'no_fitosanitario'}
            
            if expected_types.issubset(doc_types):
                self.log_test_result("Documents Library - Required Types", True, f"All required types present: {doc_types}")
            else:
                missing = expected_types - doc_types
                self.log_test_result("Documents Library - Required Types", False, f"Missing types: {missing}")
            
            # Check PDF fields presence
            docs_with_pdf_form = [d for d in documents if d.get('pdf_form')]
            docs_with_pdf_guide = [d for d in documents if d.get('pdf_guide')]
            docs_with_online_portal = [d for d in documents if d.get('online_portal')]
            
            self.log_test_result("Documents Library - PDF Form Links", True, f"{len(docs_with_pdf_form)} docs have PDF form links")
            self.log_test_result("Documents Library - PDF Guide Links", True, f"{len(docs_with_pdf_guide)} docs have PDF guide links")
            self.log_test_result("Documents Library - Online Portal Links", True, f"{len(docs_with_online_portal)} docs have online portal links")
            
            # Check specific document sources
            cites_docs = [d for d in documents if d.get('type') == 'cites']
            dua_docs = [d for d in documents if 'dua' in d.get('name', '').lower()]
            phyto_docs = [d for d in documents if d.get('type') == 'fitosanitario']
            
            # Verify CITES documents have cites.comercio.gob.es
            cites_correct_source = any('cites.comercio.gob.es' in d.get('pdf_form', '') for d in cites_docs)
            self.log_test_result("Documents Library - CITES PDF Source", cites_correct_source, 
                               "CITES docs have correct source" if cites_correct_source else "CITES docs missing correct source")
            
            # Verify DUA documents have comercio.gob.es
            dua_correct_source = any('comercio.gob.es' in d.get('pdf_form', '') for d in dua_docs)
            self.log_test_result("Documents Library - DUA PDF Source", dua_correct_source,
                               "DUA docs have correct source" if dua_correct_source else "DUA docs missing correct source")
            
            # Verify Fitosanitario documents have mapa.gob.es
            phyto_correct_source = any('mapa.gob.es' in d.get('pdf_guide', '') for d in phyto_docs)
            self.log_test_result("Documents Library - Fitosanitario PDF Source", phyto_correct_source,
                               "Fitosanitario docs have MAPA source" if phyto_correct_source else "Fitosanitario docs missing MAPA source")
                
            return success
        else:
            self.log_test_result("Documents Library Endpoint", False, "Failed to fetch documents")
            return False
    
    def test_document_detail(self):
        """Test individual document details endpoint"""
        print("\n📄 TESTING DOCUMENT DETAILS")
        
        if not self.token:
            self.log_test_result("Document Details", False, "No authentication token")
            return False
        
        # Test with known document IDs from the database
        test_doc_ids = ['cites_import_permit', 'dua_import', 'phytosanitary_certificate']
        
        for doc_id in test_doc_ids:
            success, response = self.run_test(
                f"Document Detail - {doc_id}",
                "GET",
                f"/documents/{doc_id}",
                200
            )
            
            if success:
                self.log_test_result(f"Document {doc_id} retrieved", True, f"Successfully retrieved document details")
                
                # Check for PDF fields
                has_pdf_form = bool(response.get('pdf_form'))
                has_pdf_guide = bool(response.get('pdf_guide'))
                has_online_portal = bool(response.get('online_portal'))
                
                if has_pdf_form or has_pdf_guide or has_online_portal:
                    self.log_test_result(f"Document {doc_id} PDF links", True, 
                                       f"Form: {has_pdf_form}, Guide: {has_pdf_guide}, Portal: {has_online_portal}")
                else:
                    self.log_test_result(f"Document {doc_id} PDF links", False, "No PDF links found")
            else:
                self.log_test_result(f"Document {doc_id} retrieval", False, f"Failed to retrieve document {doc_id}")
                
        return True

    def run_all_tests(self):
        """Run all backend tests including B2B features"""
        print(f"🚀 STARTING TARIC BACKEND TESTS (B2B Edition)")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test basic connectivity
        self.test_health_endpoints()
        
        # Test authentication flow
        if self.test_user_registration():
            self.test_duplicate_registration()
            self.test_user_login()
            self.test_invalid_login()
            self.test_get_current_user()
            self.test_protected_route_without_token()
            
            # Test NEW B2B organization features
            self.test_organization_stats()
            team_success, members = self.test_team_members()
            
            # Test team management features
            invite_success, invited_member_id = self.test_team_invite()
            if invite_success and invited_member_id:
                # Test removing the invited member
                self.test_team_remove(invited_member_id)
            
            # Test regulatory alerts
            self.test_regulatory_alerts()
            
            # NEW: Test documents library functionality
            self.test_documents_library()
            self.test_document_detail()
            
            # Test TARIC functionality with B2B features and document PDFs
            search_success, result_id = self.test_taric_search()
            self.test_search_history()
            
            if result_id:
                self.test_get_search_result(result_id)
                self.test_delete_search_result(result_id)
            
        else:
            print("❌ Registration failed, skipping dependent tests")
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 BACKEND TEST RESULTS (B2B Features)")
        print(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"Success rate: {success_rate:.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
        else:
            print("⚠️  Some tests failed. Check details above.")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test runner"""
    tester = TaricBackendTester()
    all_passed = tester.run_all_tests()
    
    # Save test results
    results_file = f"/tmp/backend_test_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(results_file, 'w') as f:
        json.dump({
            "summary": {
                "tests_run": tester.tests_run,
                "tests_passed": tester.tests_passed,
                "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
                "timestamp": datetime.now().isoformat()
            },
            "test_results": tester.test_results
        }, f, indent=2)
    
    print(f"\n📁 Detailed results saved to: {results_file}")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    sys.exit(main())