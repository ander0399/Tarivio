"""
TARIC AI Bug Fixes Tests - Iteration 8
Testing bug fixes for:
1. Image classification with real images (zapatillas, relojes, auriculares)
2. Check-clarification endpoint - questions BEFORE classification
3. Market study for aceite de oliva España->Colombia
"""

import pytest
import requests
import os
import uuid
import base64
from io import BytesIO

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test image URLs provided
TEST_IMAGES = {
    "zapatilla": "https://images.unsplash.com/photo-1542291026-7eec264c27ff",
    "reloj": "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
    "auriculares": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
}


def get_auth_token():
    """Get authentication token"""
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={
            "email": "test@test.com",
            "password": "Test123!"
        }
    )
    if response.status_code == 200:
        return response.json()["token"]
    
    # Try registering
    unique_id = str(uuid.uuid4())[:8]
    register_response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json={
            "email": f"TEST_bug_{unique_id}@test.com",
            "password": "Test123!",
            "name": "Bug Test User",
            "company": "Test"
        }
    )
    if register_response.status_code == 200:
        return register_response.json()["token"]
    return None


def download_image_as_base64(url):
    """Download image from URL and convert to base64"""
    try:
        # Use smaller size for faster download
        small_url = f"{url}?w=400&h=400&fit=crop"
        response = requests.get(small_url, timeout=30)
        if response.status_code == 200:
            img_base64 = base64.b64encode(response.content).decode('utf-8')
            # Return with data URL prefix
            content_type = response.headers.get('content-type', 'image/jpeg')
            return f"data:{content_type};base64,{img_base64}"
    except Exception as e:
        print(f"Error downloading image: {e}")
    return None


class TestClarificationEndpoint:
    """Test /api/taric/check-clarification endpoint - Bug fix #2"""
    
    @pytest.fixture
    def auth_token(self):
        token = get_auth_token()
        if not token:
            pytest.skip("Could not authenticate")
        return token
    
    def test_check_clarification_endpoint_exists(self, auth_token):
        """Test that check-clarification endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/taric/check-clarification",
            json={"product_description": "zapatos"},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        
        assert response.status_code == 200, f"Endpoint failed: {response.status_code} - {response.text}"
        print("✓ check-clarification endpoint exists and returns 200")
    
    def test_vague_description_triggers_clarification(self, auth_token):
        """Test that vague descriptions like 'camisas' trigger clarification questions"""
        # Test with vague descriptions that SHOULD need clarification
        vague_descriptions = ["camisas", "zapatos", "aceite", "cable"]
        
        for desc in vague_descriptions:
            response = requests.post(
                f"{BASE_URL}/api/taric/check-clarification",
                json={"product_description": desc},
                headers={"Authorization": f"Bearer {auth_token}"},
                timeout=60
            )
            
            assert response.status_code == 200, f"Failed for '{desc}': {response.status_code}"
            data = response.json()
            
            # Check response structure
            assert "needs_clarification" in data, "Missing needs_clarification field"
            assert "clarification_questions" in data, "Missing clarification_questions field"
            
            print(f"✓ '{desc}' - needs_clarification: {data['needs_clarification']}, questions: {len(data.get('clarification_questions', []))}")
    
    def test_specific_description_no_clarification(self, auth_token):
        """Test that specific descriptions don't need clarification"""
        # Very specific description
        specific_desc = "Aceite de oliva virgen extra en botella de vidrio de 500ml para consumo humano"
        
        response = requests.post(
            f"{BASE_URL}/api/taric/check-clarification",
            json={"product_description": specific_desc},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        
        assert response.status_code == 200, f"Failed: {response.status_code}"
        data = response.json()
        
        # Specific description should NOT need clarification (or minimal)
        print(f"✓ Specific description - needs_clarification: {data['needs_clarification']}")
    
    def test_clarification_questions_have_options(self, auth_token):
        """Test that clarification questions include options"""
        response = requests.post(
            f"{BASE_URL}/api/taric/check-clarification",
            json={"product_description": "ropa"},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        
        assert response.status_code == 200
        data = response.json()
        
        if data.get("needs_clarification") and data.get("clarification_questions"):
            for q in data["clarification_questions"]:
                assert "question" in q, "Question missing 'question' field"
                assert "options" in q, "Question missing 'options' field"
                assert isinstance(q["options"], list), "Options should be a list"
                assert len(q["options"]) >= 2, "Should have at least 2 options"
                print(f"✓ Question: {q['question'][:50]}... with {len(q['options'])} options")


class TestImageAnalysisWithRealImages:
    """Test /api/image/analyze with real images - Bug fix #1"""
    
    @pytest.fixture
    def auth_token(self):
        token = get_auth_token()
        if not token:
            pytest.skip("Could not authenticate")
        return token
    
    def test_image_analyze_with_zapatilla(self, auth_token):
        """Test image analysis with zapatilla (sneaker) image"""
        image_base64 = download_image_as_base64(TEST_IMAGES["zapatilla"])
        
        if not image_base64:
            pytest.skip("Could not download test image")
        
        response = requests.post(
            f"{BASE_URL}/api/image/analyze",
            json={"image_base64": image_base64},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120
        )
        
        print(f"Zapatilla response status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        
        assert response.status_code == 200, f"Image analysis failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "product_description" in data, "Missing product_description"
        assert data["product_description"], "Empty product_description"
        
        print(f"✓ Zapatilla identified: {data['product_description'][:100]}...")
    
    def test_image_analyze_with_reloj(self, auth_token):
        """Test image analysis with reloj (watch) image"""
        image_base64 = download_image_as_base64(TEST_IMAGES["reloj"])
        
        if not image_base64:
            pytest.skip("Could not download test image")
        
        response = requests.post(
            f"{BASE_URL}/api/image/analyze",
            json={"image_base64": image_base64},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120
        )
        
        print(f"Reloj response status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        
        assert response.status_code == 200, f"Image analysis failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "product_description" in data, "Missing product_description"
        print(f"✓ Reloj identified: {data['product_description'][:100]}...")
    
    def test_image_analyze_with_auriculares(self, auth_token):
        """Test image analysis with auriculares (headphones) image"""
        image_base64 = download_image_as_base64(TEST_IMAGES["auriculares"])
        
        if not image_base64:
            pytest.skip("Could not download test image")
        
        response = requests.post(
            f"{BASE_URL}/api/image/analyze",
            json={"image_base64": image_base64},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120
        )
        
        print(f"Auriculares response status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        
        assert response.status_code == 200, f"Image analysis failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert "product_description" in data, "Missing product_description"
        print(f"✓ Auriculares identified: {data['product_description'][:100]}...")


class TestMarketStudyOliveOil:
    """Test /api/market/study for aceite de oliva España->Colombia - Bug fix #3"""
    
    @pytest.fixture
    def auth_token(self):
        token = get_auth_token()
        if not token:
            pytest.skip("Could not authenticate")
        return token
    
    def test_market_study_olive_oil_spain_colombia(self, auth_token):
        """Test market study for olive oil from Spain to Colombia"""
        response = requests.post(
            f"{BASE_URL}/api/market/study",
            json={
                "product_description": "Aceite de oliva virgen extra",
                "taric_code": "1509100000",
                "origin_country": "ES",
                "destination_country": "CO",
                "language": "es"
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=150  # 2.5 minute timeout for AI generation
        )
        
        print(f"Market study response status: {response.status_code}")
        if response.status_code != 200:
            print(f"Error: {response.text}")
        
        assert response.status_code == 200, f"Market study failed: {response.status_code} - {response.text}"
        
        data = response.json()
        
        # Verify essential fields
        assert "executive_summary" in data, "Missing executive_summary"
        assert data["executive_summary"], "Empty executive_summary"
        
        assert "pestel" in data, "Missing pestel"
        pestel = data["pestel"]
        pestel_fields = ["political", "economic", "social", "technological", "environmental", "legal"]
        for field in pestel_fields:
            assert field in pestel, f"Missing PESTEL field: {field}"
            print(f"  ✓ {field}: {len(pestel[field])} chars")
        
        # Verify market size
        assert "market_size" in data, "Missing market_size"
        
        # Verify recommendations
        assert "recommendations" in data, "Missing recommendations"
        
        print(f"✓ Market study for olive oil ES->CO generated successfully")
        print(f"  Summary: {data['executive_summary'][:150]}...")
        print(f"  Recommendations: {len(data.get('recommendations', []))} items")


class TestTaricSearchWithCountries:
    """Test TARIC search with origin/destination countries"""
    
    @pytest.fixture
    def auth_token(self):
        token = get_auth_token()
        if not token:
            pytest.skip("Could not authenticate")
        return token
    
    def test_taric_search_requires_origin(self, auth_token):
        """Test that TARIC search requires origin_country"""
        response = requests.post(
            f"{BASE_URL}/api/taric/search",
            json={
                "product_description": "Aceite de oliva",
                "destination_country": "ES"
                # Missing origin_country
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        
        # Should return validation error
        assert response.status_code in [400, 422], f"Expected error, got {response.status_code}"
        print("✓ TARIC search requires origin_country")
    
    def test_taric_search_spain_colombia(self, auth_token):
        """Test TARIC search for olive oil ES->CO"""
        response = requests.post(
            f"{BASE_URL}/api/taric/search",
            json={
                "product_description": "Aceite de oliva virgen extra en botella de vidrio de 750ml",
                "origin_country": "ES",
                "destination_country": "CO"
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120
        )
        
        assert response.status_code == 200, f"Search failed: {response.status_code}"
        
        data = response.json()
        assert "taric_code" in data, "Missing taric_code"
        assert data["taric_code"] != "0000000000", "Got error code"
        
        print(f"✓ TARIC search ES->CO: {data['taric_code']} - {data.get('taric_description', '')[:50]}...")


class TestHealthAndBasicAPIs:
    """Basic health and API tests"""
    
    def test_api_health(self):
        """Test API health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("✓ API health check passed")
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "TaricAI" in data.get("message", "")
        print("✓ API root check passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
