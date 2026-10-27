from pydantic import BaseModel, Field, ConfigDict
from typing import Literal


# ── Safety ──────────────────────────────────────────────────────────────────

class SafetyViolation(BaseModel):
    category: str = Field(..., description="Category of violation e.g. PPE, Scaffolding")
    description: str
    location_in_image: str = Field(default="", description="Where in the image")


class SafetyAnalysisResponse(BaseModel):
    risk_level: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    overall_score: int = Field(..., ge=0, le=100, description="Safety score 0-100")
    violations: list[SafetyViolation]
    missing_ppe: list[str]
    hazards_detected: list[str]
    corrective_actions: list[str]
    immediate_actions: list[str] = Field(default_factory=list)
    summary: str


# ── Crack Detection ──────────────────────────────────────────────────────────

class CrackAnalysisResponse(BaseModel):
    crack_type: str = Field(..., description="hairline/shrinkage/settlement/structural/diagonal/map/other")
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    width_estimate_mm: str = Field(..., description="e.g. '<0.1 mm', '0.3-1 mm'")
    likely_causes: list[str]
    structural_risk: str
    repair_recommendations: list[str]
    urgency: Literal["MONITOR", "REPAIR_SOON", "REPAIR_IMMEDIATELY", "EVACUATE"]
    disclaimer: str
    summary: str


# ── Real Estate Valuation ────────────────────────────────────────────────────

class ValuationRequest(BaseModel):
    location: str
    area_sqft: float = Field(..., gt=0)
    property_type: str = Field(..., description="apartment/villa/plot/commercial/warehouse")
    age_years: int = Field(..., ge=0)
    bedrooms: int = Field(default=0, ge=0)
    bathrooms: int = Field(default=0, ge=0)
    amenities: list[str] = Field(default_factory=list)
    condition: Literal["POOR", "FAIR", "GOOD", "EXCELLENT"] = "GOOD"
    floor_number: int | None = None
    total_floors: int | None = None
    notes: str = ""


class ValuationResponse(BaseModel):
    min_price_inr: float
    max_price_inr: float
    per_sqft_rate_inr: float
    confidence: Literal["LOW", "MEDIUM", "HIGH"]
    key_value_drivers: list[str]
    negative_factors: list[str]
    comparable_properties: list[str] = Field(default_factory=list)
    assumptions: list[str]
    market_trend: str
    summary: str


# ── Project Planning ─────────────────────────────────────────────────────────

class PlanningRequest(BaseModel):
    project_type: str = Field(..., description="residential/commercial/industrial/infrastructure")
    size_sqft: float = Field(..., gt=0)
    budget_inr: float = Field(..., gt=0)
    deadline_months: int = Field(..., gt=0)
    workforce_count: int = Field(..., gt=0)
    location: str = ""
    special_requirements: list[str] = Field(default_factory=list)
    notes: str = ""


class ProjectPhase(BaseModel):
    phase_name: str
    duration_weeks: int
    start_week: int
    end_week: int
    key_activities: list[str]
    milestones: list[str]


class RiskItem(BaseModel):
    risk: str
    probability: Literal["LOW", "MEDIUM", "HIGH"]
    impact: Literal["LOW", "MEDIUM", "HIGH"]
    mitigation: str


class BudgetItem(BaseModel):
    category: str
    amount_inr: float
    percentage: float


class PlanningResponse(BaseModel):
    total_duration_weeks: int
    phases: list[ProjectPhase]
    material_estimates: list[dict]
    labor_breakdown: list[dict]
    risk_register: list[RiskItem]
    budget_breakdown: list[BudgetItem]
    critical_path: list[str]
    recommendations: list[str]
    summary: str


# ── Daily Assistant ──────────────────────────────────────────────────────────

class DailyAssistantRequest(BaseModel):
    location: str
    activities: list[str]
    workforce_count: int = 0
    notes: str = ""


class WeatherInfo(BaseModel):
    temperature_c: float
    wind_speed_kmh: float
    precipitation_mm: float
    condition: str
    humidity_percent: float


class ActivityAdvice(BaseModel):
    activity: str
    recommendation: Literal["PROCEED", "PROCEED_WITH_CAUTION", "DELAY", "CANCEL"]
    reason: str


class DailyAssistantResponse(BaseModel):
    weather: WeatherInfo
    overall_site_status: Literal["SAFE", "CAUTION", "UNSAFE"]
    activity_advice: list[ActivityAdvice]
    safety_briefing: list[str]
    daily_precautions: list[str]
    summary: str


# ── Chat / Knowledge Assistant ───────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    references: list[str] = Field(default_factory=list)
    follow_up_questions: list[str] = Field(default_factory=list)


# ── History ──────────────────────────────────────────────────────────────────

class HistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module: str
    input_summary: str
    result_json: str
    image_path: str | None
    created_at: str


# ── Generic Error ─────────────────────────────────────────────────────────────

class ErrorResponse(BaseModel):
    error: str
    detail: str = ""
