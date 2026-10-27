"""
Tests for Construction Intelligence Platform.
Uses pytest-asyncio + httpx AsyncClient with mocked Gemini calls.
"""
import json
import pytest
import pytest_asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.schemas.schemas import (
    SafetyAnalysisResponse, SafetyViolation,
    CrackAnalysisResponse,
    ValuationRequest, ValuationResponse,
    PlanningRequest, PlanningResponse,
)


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest_asyncio.fixture
async def client():
    from app.db import init_db
    await init_db()
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as ac:
        yield ac


# ── Schema Tests ──────────────────────────────────────────────────────────────

class TestSchemas:
    def test_safety_response_valid(self):
        data = {
            "risk_level": "HIGH",
            "overall_score": 45,
            "violations": [
                {"category": "PPE", "description": "No helmet", "location_in_image": "center"}
            ],
            "missing_ppe": ["helmet"],
            "hazards_detected": ["open trench"],
            "corrective_actions": ["Provide helmets"],
            "immediate_actions": [],
            "summary": "High risk site.",
        }
        resp = SafetyAnalysisResponse(**data)
        assert resp.risk_level == "HIGH"
        assert resp.overall_score == 45
        assert len(resp.violations) == 1

    def test_safety_response_invalid_risk_level(self):
        from pydantic import ValidationError
        data = {
            "risk_level": "EXTREME",  # Invalid
            "overall_score": 10,
            "violations": [],
            "missing_ppe": [],
            "hazards_detected": [],
            "corrective_actions": [],
            "summary": "Test",
        }
        with pytest.raises(ValidationError):
            SafetyAnalysisResponse(**data)

    def test_crack_response_valid(self):
        data = {
            "crack_type": "structural",
            "severity": "HIGH",
            "width_estimate_mm": "1-3 mm",
            "likely_causes": ["settlement"],
            "structural_risk": "High risk",
            "repair_recommendations": ["Epoxy injection"],
            "urgency": "REPAIR_SOON",
            "disclaimer": "Engineer required.",
            "summary": "Structural crack detected.",
        }
        resp = CrackAnalysisResponse(**data)
        assert resp.severity == "HIGH"
        assert resp.urgency == "REPAIR_SOON"

    def test_valuation_request_valid(self):
        req = ValuationRequest(
            location="Mumbai, Maharashtra",
            area_sqft=1200.0,
            property_type="apartment",
            age_years=5,
            condition="GOOD",
        )
        assert req.location == "Mumbai, Maharashtra"

    def test_planning_request_valid(self):
        req = PlanningRequest(
            project_type="residential",
            size_sqft=2000.0,
            budget_inr=5000000.0,
            deadline_months=18,
            workforce_count=25,
        )
        assert req.project_type == "residential"


# ── Endpoint Tests ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
class TestHealthEndpoint:
    async def test_health_check(self, client: AsyncClient):
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "version" in data
        assert "platform" in data


@pytest.mark.asyncio
class TestSafetyEndpoint:
    MOCK_SAFETY_RESPONSE = SafetyAnalysisResponse(
        risk_level="HIGH",
        overall_score=55,
        violations=[
            SafetyViolation(category="PPE", description="No helmet", location_in_image="center")
        ],
        missing_ppe=["helmet", "vest"],
        hazards_detected=["open trench"],
        corrective_actions=["Provide PPE immediately"],
        immediate_actions=["Stop work"],
        summary="High risk site conditions detected.",
    )

    async def test_safety_analyze_success(self, client: AsyncClient):
        """Test safety endpoint with mocked Gemini."""
        with patch(
            "app.routers.safety.call_gemini_vision_bytes",
            new_callable=AsyncMock,
            return_value=self.MOCK_SAFETY_RESPONSE,
        ):
            # Create a minimal valid JPEG in memory
            import io
            from PIL import Image
            img = Image.new("RGB", (100, 100), color=(255, 0, 0))
            buf = io.BytesIO()
            img.save(buf, format="JPEG")
            buf.seek(0)

            response = await client.post(
                "/api/safety/analyze",
                files={"image": ("test.jpg", buf, "image/jpeg")},
                data={"notes": "Test analysis"},
            )
        assert response.status_code == 200
        data = response.json()
        assert data["risk_level"] == "HIGH"
        assert data["overall_score"] == 55
        assert len(data["violations"]) == 1

    async def test_safety_invalid_file_type(self, client: AsyncClient):
        """Test rejection of non-image files."""
        response = await client.post(
            "/api/safety/analyze",
            files={"image": ("test.pdf", b"fake pdf content", "application/pdf")},
        )
        assert response.status_code == 400


@pytest.mark.asyncio
class TestValuationEndpoint:
    MOCK_VALUATION_RESPONSE = ValuationResponse(
        min_price_inr=5000000.0,
        max_price_inr=6500000.0,
        per_sqft_rate_inr=4583.0,
        confidence="MEDIUM",
        key_value_drivers=["Location", "Amenities"],
        negative_factors=["Age"],
        comparable_properties=["Similar 2BHK: ₹52-60 lakh"],
        assumptions=["Market rate 2024"],
        market_trend="Appreciating 8-10% annually",
        summary="Good investment opportunity.",
    )

    async def test_valuation_estimate_success(self, client: AsyncClient):
        """Test valuation endpoint with mocked Gemini."""
        with patch(
            "app.routers.valuation.call_gemini_text",
            new_callable=AsyncMock,
            return_value=self.MOCK_VALUATION_RESPONSE,
        ):
            payload = {
                "location": "Mumbai, Maharashtra",
                "area_sqft": 1200,
                "property_type": "apartment",
                "age_years": 5,
                "condition": "GOOD",
                "amenities": ["parking", "gym"],
            }
            response = await client.post("/api/valuation/estimate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["min_price_inr"] == 5000000.0
        assert data["confidence"] == "MEDIUM"

    async def test_valuation_missing_required_fields(self, client: AsyncClient):
        """Test validation error for missing fields."""
        response = await client.post(
            "/api/valuation/estimate",
            json={"location": "Mumbai"},  # Missing required fields
        )
        assert response.status_code == 422


@pytest.mark.asyncio
class TestCrackEndpoint:
    async def test_crack_analyze_success(self, client: AsyncClient):
        import io
        from PIL import Image
        img = Image.new("RGB", (100, 100), color=(128, 128, 128))
        buf = io.BytesIO()
        img.save(buf, format="JPEG")
        buf.seek(0)

        response = await client.post(
            "/api/cracks/analyze",
            files={"image": ("crack.jpg", buf, "image/jpeg")},
            data={"notes": "Diagonal crack near window"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "crack_type" in data
        assert "severity" in data
        assert "repair_recommendations" in data


@pytest.mark.asyncio
class TestPlanningEndpoint:
    async def test_planning_generate_success(self, client: AsyncClient):
        payload = {
            "project_type": "residential",
            "size_sqft": 3000,
            "budget_inr": 7500000,
            "deadline_months": 18,
            "workforce_count": 30,
            "location": "Pune, Maharashtra",
        }
        response = await client.post("/api/planning/generate", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "phases" in data
        assert "material_estimates" in data
        assert "labor_breakdown" in data
        assert "risk_register" in data
        assert "budget_breakdown" in data


@pytest.mark.asyncio
class TestAssistantEndpoint:
    async def test_daily_advisory_success(self, client: AsyncClient):
        payload = {
            "location": "Mumbai",
            "activities": ["Concrete pouring", "Scaffolding erection"],
            "workforce_count": 40,
        }
        response = await client.post("/api/assistant/daily", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "weather" in data
        assert "activity_advice" in data
        assert "safety_briefing" in data

    async def test_chat_success(self, client: AsyncClient):
        payload = {
            "message": "What is the minimum concrete cover for slabs per IS 456?",
            "history": [],
        }
        response = await client.post("/api/assistant/chat", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "references" in data


@pytest.mark.asyncio
class TestHistoryAndSettings:
    async def test_history_crud(self, client: AsyncClient):
        # Fetch history
        resp = await client.get("/api/history")
        assert resp.status_code == 200
        items = resp.json()
        assert isinstance(items, list)

        # Clear history
        del_resp = await client.delete("/api/history")
        assert del_resp.status_code == 200

        # Verify empty
        after_resp = await client.get("/api/history")
        assert after_resp.status_code == 200
        assert len(after_resp.json()) == 0

    async def test_settings_endpoints(self, client: AsyncClient):
        get_resp = await client.get("/api/settings")
        assert get_resp.status_code == 200
        data = get_resp.json()
        assert "gemini_model" in data
        assert "is_demo_mode" in data

        test_resp = await client.post("/api/settings/test-key")
        assert test_resp.status_code == 200

