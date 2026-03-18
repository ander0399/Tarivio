"""
Test file for Iteration 9 bug fixes:
1. Image classification - "Failed to execute json on Response: body stream already read" error
2. Market study - Not generating results for aceite de oliva España->Colombia

These tests verify that the frontend fixes for reading response.text() first
and then JSON.parse() work correctly with the backend APIs.
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAuthentication:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "Test123!"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "token" in data, "No token in response"
        assert "user" in data, "No user in response"
        return data["token"]


class TestImageAnalysis:
    """Test image analysis endpoint - Bug fix for 'body stream already read' error"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "Test123!"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_image_analyze_perfume(self, auth_token):
        """Test image analysis with perfume image from Unsplash"""
        # Download and encode image
        img_response = requests.get("https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop")
        assert img_response.status_code == 200, "Failed to download test image"
        
        image_b64 = base64.b64encode(img_response.content).decode('utf-8')
        data_url = f"data:image/jpeg;base64,{image_b64}"
        
        # Call the API
        response = requests.post(
            f"{BASE_URL}/api/image/analyze",
            json={"image_base64": data_url},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        
        assert response.status_code == 200, f"Image analysis failed: {response.text}"
        
        data = response.json()
        assert "product_description" in data, "No product_description in response"
        assert "components" in data, "No components in response"
        assert "confidence" in data, "No confidence in response"
        assert len(data["product_description"]) > 10, "Description too short"
        print(f"Perfume analysis: {data['product_description'][:100]}...")
    
    def test_image_analyze_olive_oil(self, auth_token):
        """Test image analysis with olive oil image"""
        # Download and encode image
        img_response = requests.get("https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop")
        assert img_response.status_code == 200, "Failed to download test image"
        
        image_b64 = base64.b64encode(img_response.content).decode('utf-8')
        data_url = f"data:image/jpeg;base64,{image_b64}"
        
        # Call the API
        response = requests.post(
            f"{BASE_URL}/api/image/analyze",
            json={"image_base64": data_url},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        
        assert response.status_code == 200, f"Image analysis failed: {response.text}"
        
        data = response.json()
        assert "product_description" in data, "No product_description in response"
        print(f"Olive oil analysis: {data['product_description'][:100]}...")
    
    def test_image_analyze_phone(self, auth_token):
        """Test image analysis with phone/electronics image"""
        # Download and encode image  
        img_response = requests.get("https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop")
        assert img_response.status_code == 200, "Failed to download test image"
        
        image_b64 = base64.b64encode(img_response.content).decode('utf-8')
        data_url = f"data:image/jpeg;base64,{image_b64}"
        
        # Call the API
        response = requests.post(
            f"{BASE_URL}/api/image/analyze",
            json={"image_base64": data_url},
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=60
        )
        
        assert response.status_code == 200, f"Image analysis failed: {response.text}"
        
        data = response.json()
        assert "product_description" in data, "No product_description in response"
        print(f"Phone analysis: {data['product_description'][:100]}...")


class TestMarketStudy:
    """Test market study endpoint - Bug fix for not generating results"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@test.com",
            "password": "Test123!"
        })
        if response.status_code == 200:
            return response.json().get("token")
        pytest.skip("Authentication failed")
    
    def test_market_study_olive_oil_spain_colombia(self, auth_token):
        """Test market study for aceite de oliva España -> Colombia"""
        response = requests.post(
            f"{BASE_URL}/api/market/study",
            json={
                "product_description": "aceite de oliva virgen extra",
                "origin_country": "España",
                "destination_country": "Colombia",
                "language": "es"
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120  # Market study can take longer
        )
        
        assert response.status_code == 200, f"Market study failed: {response.text}"
        
        data = response.json()
        
        # Verify all required fields are present
        assert "executive_summary" in data, "No executive_summary in response"
        assert "pestel" in data, "No pestel in response"
        assert "market_size" in data, "No market_size in response"
        assert "competitors" in data, "No competitors in response"
        assert "trends" in data, "No trends in response"
        assert "opportunities" in data, "No opportunities in response"
        assert "threats" in data, "No threats in response"
        assert "recommendations" in data, "No recommendations in response"
        
        # Verify PESTEL has all components
        pestel = data["pestel"]
        assert "political" in pestel, "No political in PESTEL"
        assert "economic" in pestel, "No economic in PESTEL"
        assert "social" in pestel, "No social in PESTEL"
        assert "technological" in pestel, "No technological in PESTEL"
        assert "environmental" in pestel, "No environmental in PESTEL"
        assert "legal" in pestel, "No legal in PESTEL"
        
        # Verify content is substantial
        assert len(data["executive_summary"]) > 100, "Executive summary too short"
        assert len(pestel["political"]) > 50, "Political analysis too short"
        assert len(pestel["economic"]) > 50, "Economic analysis too short"
        
        print(f"Market study generated successfully!")
        print(f"Executive summary preview: {data['executive_summary'][:200]}...")
    
    def test_market_study_electronics_china_spain(self, auth_token):
        """Test market study for electronics China -> Spain"""
        response = requests.post(
            f"{BASE_URL}/api/market/study",
            json={
                "product_description": "smartphone con pantalla OLED y 5G",
                "origin_country": "China",
                "destination_country": "España",
                "language": "es"
            },
            headers={"Authorization": f"Bearer {auth_token}"},
            timeout=120
        )
        
        assert response.status_code == 200, f"Market study failed: {response.text}"
        
        data = response.json()
        assert "executive_summary" in data, "No executive_summary in response"
        assert "pestel" in data, "No pestel in response"
        print(f"Electronics market study preview: {data['executive_summary'][:200]}...")


class TestHealthAndBasics:
    """Test basic health and API endpoints"""
    
    def test_health(self):
        """Test health endpoint"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_root(self):
        """Test root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
