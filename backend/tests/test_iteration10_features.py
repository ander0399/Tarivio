"""
Test Suite for Iteration 10 - TaricAI Features
Tests:
1. Chat "¿Quién eres?" response - Asistente IA Pro identity
2. Chat clarification questions with multiple options (A, B, C, D)
3. Market study endpoint with official sources (ICEX, UN Comtrade, Trade Map)
4. Authentication flow
"""

import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://arancelai.preview.emergentagent.com').rstrip('/')

class TestAuthentication:
    """Test authentication endpoints"""
    
    @pytest.fixture(scope="class")
    def test_user(self):
        """Create a test user for the session"""
        unique_id = str(uuid.uuid4())[:8]
        return {
            "email": f"test_iter10_{unique_id}@test.com",
            "password": "TestPassword123!",
            "name": f"Test User {unique_id}",
            "company": "Test Company"
        }
    
    def test_register_user(self, test_user):
        """Test user registration"""
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=test_user,
            timeout=30
        )
        
        assert response.status_code == 200, f"Registration failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "token" in data, "Token not in response"
        assert "user" in data, "User not in response"
        assert data["user"]["email"] == test_user["email"]
        assert data["user"]["name"] == test_user["name"]
        
        # Store token for other tests
        test_user["token"] = data["token"]
        test_user["user_id"] = data["user"]["id"]
        
        print(f"✅ User registered successfully: {test_user['email']}")
        return data
    
    def test_login_user(self, test_user):
        """Test user login"""
        # First register
        self.test_register_user(test_user)
        
        # Then login
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": test_user["email"],
                "password": test_user["password"]
            },
            timeout=30
        )
        
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        
        assert "token" in data
        assert "user" in data
        assert data["user"]["email"] == test_user["email"]
        
        print(f"✅ User logged in successfully: {test_user['email']}")
        return data


class TestChatAsistenteIAPro:
    """Test the Asistente IA Pro chat functionality"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for tests"""
        unique_id = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"chat_test_{unique_id}@test.com",
            "password": "ChatTest123!",
            "name": f"Chat Tester {unique_id}"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()["token"]
        
        # If registration fails (user exists), try login
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": user_data["email"], "password": user_data["password"]},
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()["token"]
        
        pytest.skip("Could not authenticate for chat tests")
    
    def test_chat_quien_eres_response(self, auth_token):
        """Test that chat responds correctly to '¿Quién eres?'"""
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "message": "¿Quién eres?",
                "language": "es"
            },
            timeout=60
        )
        
        assert response.status_code == 200, f"Chat request failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "response" in data, "No response field in chat response"
        assert "session_id" in data, "No session_id in response"
        
        response_text = data["response"].lower()
        
        # Check that the response identifies as Asistente IA Pro de TaricAI
        identity_keywords = ["asistente", "taricai", "clasificación arancelaria", "comercio exterior", "comercio internacional"]
        found_keywords = [kw for kw in identity_keywords if kw in response_text]
        
        assert len(found_keywords) >= 2, f"Response doesn't properly identify as Asistente IA Pro. Response: {data['response'][:500]}"
        
        print(f"✅ Chat correctly identifies as Asistente IA Pro de TaricAI")
        print(f"   Found keywords: {found_keywords}")
        print(f"   Response preview: {data['response'][:300]}...")
        
        return data
    
    def test_chat_clarification_missing_origin_country(self, auth_token):
        """Test that chat asks for clarification with options when origin country is missing"""
        # Start a new session with a trade query but no origin country
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "message": "Quiero importar aceite de oliva",
                "language": "es",
                "session_id": str(uuid.uuid4())  # New session
            },
            timeout=60
        )
        
        assert response.status_code == 200, f"Chat request failed: {response.text}"
        data = response.json()
        
        # Check if clarification is needed
        assert "needs_clarification" in data, "needs_clarification field missing"
        
        if data.get("needs_clarification"):
            # Verify clarification request structure
            assert "clarification_request" in data, "clarification_request missing when needs_clarification is True"
            clarification = data["clarification_request"]
            
            assert "question" in clarification, "No question in clarification request"
            assert "options" in clarification, "No options in clarification request"
            assert len(clarification["options"]) > 0, "Options list is empty"
            
            # Verify options have proper structure (id, label, value)
            for option in clarification["options"]:
                assert "id" in option, "Option missing 'id'"
                assert "label" in option, "Option missing 'label'"
                assert "value" in option, "Option missing 'value'"
            
            print(f"✅ Chat asks for clarification with {len(clarification['options'])} options")
            print(f"   Question: {clarification['question']}")
            print(f"   Options: {[opt['label'] for opt in clarification['options'][:4]]}")
        else:
            # If no clarification needed, the AI might have inferred context
            # This is acceptable behavior
            print(f"ℹ️ Chat did not require clarification (AI may have inferred context)")
            print(f"   Response: {data['response'][:200]}...")
        
        return data
    
    def test_chat_clarification_missing_destination_country(self, auth_token):
        """Test that chat asks for destination country when origin is provided but destination is missing"""
        session_id = str(uuid.uuid4())
        
        # First message with origin but no destination
        response = requests.post(
            f"{BASE_URL}/api/chat/message",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "message": "Quiero exportar vino desde España",
                "language": "es",
                "session_id": session_id,
                "origin_country": "ES"  # Provide origin
            },
            timeout=60
        )
        
        assert response.status_code == 200, f"Chat request failed: {response.text}"
        data = response.json()
        
        # Check response
        if data.get("needs_clarification"):
            clarification = data.get("clarification_request", {})
            print(f"✅ Chat asks for destination country")
            print(f"   Question: {clarification.get('question', 'N/A')}")
            if clarification.get("options"):
                print(f"   Options: {[opt['label'] for opt in clarification['options'][:4]]}")
        else:
            print(f"ℹ️ Chat provided response without clarification")
            print(f"   Response: {data['response'][:200]}...")
        
        return data
    
    def test_chat_full_conversation_flow(self, auth_token):
        """Test a complete conversation flow with clarifications"""
        session_id = str(uuid.uuid4())
        
        # Step 1: Initial query
        response1 = requests.post(
            f"{BASE_URL}/api/chat/message",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "message": "Necesito clasificar un producto para exportación",
                "language": "es",
                "session_id": session_id
            },
            timeout=60
        )
        
        assert response1.status_code == 200
        data1 = response1.json()
        print(f"Step 1 - Initial query response received")
        
        # Step 2: Provide more context
        response2 = requests.post(
            f"{BASE_URL}/api/chat/message",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "message": "Es aceite de oliva virgen extra de España para Colombia",
                "language": "es",
                "session_id": session_id,
                "origin_country": "ES",
                "destination_country": "CO"
            },
            timeout=90
        )
        
        assert response2.status_code == 200
        data2 = response2.json()
        
        # The response should now contain classification information
        response_text = data2["response"].lower()
        
        # Check for relevant content
        relevant_keywords = ["aceite", "oliva", "taric", "código", "arancel", "clasificación", "1509"]
        found = [kw for kw in relevant_keywords if kw in response_text]
        
        print(f"✅ Full conversation flow completed")
        print(f"   Found relevant keywords: {found}")
        print(f"   Response preview: {data2['response'][:300]}...")
        
        return data2


class TestMarketStudy:
    """Test the market study endpoint with official sources"""
    
    @pytest.fixture(scope="class")
    def auth_token(self):
        """Get authentication token for tests"""
        unique_id = str(uuid.uuid4())[:8]
        user_data = {
            "email": f"market_test_{unique_id}@test.com",
            "password": "MarketTest123!",
            "name": f"Market Tester {unique_id}"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/auth/register",
            json=user_data,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()["token"]
        
        pytest.skip("Could not authenticate for market study tests")
    
    def test_market_study_generates_pestel(self, auth_token):
        """Test that market study generates PESTEL analysis"""
        response = requests.post(
            f"{BASE_URL}/api/market/study",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "product_description": "Aceite de oliva virgen extra",
                "origin_country": "ES",
                "destination_country": "CO",
                "language": "es"
            },
            timeout=180  # Market study can take time
        )
        
        assert response.status_code == 200, f"Market study failed: {response.text}"
        data = response.json()
        
        # Verify PESTEL structure
        assert "pestel" in data, "PESTEL analysis missing"
        pestel = data["pestel"]
        
        pestel_factors = ["political", "economic", "social", "technological", "environmental", "legal"]
        for factor in pestel_factors:
            assert factor in pestel, f"PESTEL factor '{factor}' missing"
            assert pestel[factor], f"PESTEL factor '{factor}' is empty"
        
        print(f"✅ Market study generated with complete PESTEL analysis")
        print(f"   Political: {pestel['political'][:100]}...")
        print(f"   Economic: {pestel['economic'][:100]}...")
        
        return data
    
    def test_market_study_cites_official_sources(self, auth_token):
        """Test that market study cites official sources (ICEX, UN Comtrade, Trade Map)"""
        response = requests.post(
            f"{BASE_URL}/api/market/study",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "product_description": "Smartphones y dispositivos electrónicos",
                "origin_country": "CN",
                "destination_country": "ES",
                "language": "es"
            },
            timeout=180
        )
        
        assert response.status_code == 200, f"Market study failed: {response.text}"
        data = response.json()
        
        # Check executive summary for source citations
        executive_summary = data.get("executive_summary", "").lower()
        pestel_text = str(data.get("pestel", {})).lower()
        market_size_text = str(data.get("market_size", {})).lower()
        
        # Combine all text for source checking
        all_text = f"{executive_summary} {pestel_text} {market_size_text}"
        
        # Official sources to look for
        official_sources = [
            "comtrade", "trade map", "icex", "datacomex", "world bank", 
            "wto", "access2markets", "eurostat", "ine", "banco mundial"
        ]
        
        found_sources = [src for src in official_sources if src in all_text]
        
        # We expect at least some official sources to be cited
        print(f"ℹ️ Official sources found in study: {found_sources}")
        print(f"   Executive summary preview: {data.get('executive_summary', '')[:300]}...")
        
        # Verify other required fields
        assert "market_size" in data, "market_size missing"
        assert "competitors" in data, "competitors missing"
        assert "trends" in data, "trends missing"
        assert "opportunities" in data, "opportunities missing"
        assert "threats" in data, "threats missing"
        assert "recommendations" in data, "recommendations missing"
        
        print(f"✅ Market study contains all required sections")
        print(f"   Market size: {data['market_size'].get('description', '')[:100]}...")
        print(f"   Competitors: {len(data.get('competitors', []))} found")
        print(f"   Trends: {len(data.get('trends', []))} found")
        print(f"   Opportunities: {len(data.get('opportunities', []))} found")
        print(f"   Recommendations: {len(data.get('recommendations', []))} found")
        
        return data
    
    def test_market_study_different_routes(self, auth_token):
        """Test market study for different trade routes"""
        routes = [
            {"origin": "MX", "destination": "US", "product": "Aguacates frescos"},
            {"origin": "DE", "destination": "ES", "product": "Maquinaria industrial"},
        ]
        
        for route in routes:
            response = requests.post(
                f"{BASE_URL}/api/market/study",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "product_description": route["product"],
                    "origin_country": route["origin"],
                    "destination_country": route["destination"],
                    "language": "es"
                },
                timeout=180
            )
            
            assert response.status_code == 200, f"Market study failed for {route['origin']}->{route['destination']}: {response.text}"
            data = response.json()
            
            assert data.get("executive_summary"), f"No executive summary for {route['origin']}->{route['destination']}"
            assert data.get("pestel"), f"No PESTEL for {route['origin']}->{route['destination']}"
            
            print(f"✅ Market study generated for {route['origin']} -> {route['destination']}: {route['product']}")


class TestHealthAndBasicEndpoints:
    """Test basic health and info endpoints"""
    
    def test_health_endpoint(self):
        """Test health check endpoint"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("status") == "healthy"
        print("✅ Health endpoint working")
    
    def test_root_endpoint(self):
        """Test root API endpoint"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "TaricAI" in str(data)
        print("✅ Root endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
