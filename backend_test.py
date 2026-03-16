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
        """Test TARIC search functionality"""
        print("\n🔍 TESTING TARIC SEARCH")
        
        if not self.token:
            self.log_test_result("TARIC search", False, "No authentication token")
            return False, None
        
        search_data = {
            "product_description": "Manzanas frescas rojas de origen español para consumo directo",
            "origin_country": "ES"
        }
        
        print("    ⚠️  Note: This test may take 10-30 seconds due to AI processing...")
        
        success, response = self.run_test(
            "TARIC search with AI",
            "POST",
            "/taric/search",
            200,
            data=search_data
        )
        
        if success and response:
            # Verify response structure
            required_fields = ['id', 'taric_code', 'taric_description', 'tariffs', 'documents']
            for field in required_fields:
                if field in response:
                    self.log_test_result(f"TARIC result field '{field}'", True, f"Present: {str(response[field])[:100]}...")
                else:
                    self.log_test_result(f"TARIC result field '{field}'", False, f"Missing field: {field}")
            
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

    def run_all_tests(self):
        """Run all backend tests"""
        print(f"🚀 STARTING TARIC BACKEND TESTS")
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
            
            # Test TARIC functionality
            search_success, result_id = self.test_taric_search()
            self.test_search_history()
            
            if result_id:
                self.test_get_search_result(result_id)
                self.test_delete_search_result(result_id)
            
        else:
            print("❌ Registration failed, skipping dependent tests")
        
        # Print final results
        print("\n" + "=" * 60)
        print(f"📊 BACKEND TEST RESULTS")
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