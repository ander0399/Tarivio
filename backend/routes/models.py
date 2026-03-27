"""
Modelos Pydantic compartidos para TaricAI
"""
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any

# User & Organization Models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    name: str
    company: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    company: Optional[str] = None
    role: str = "admin"
    organization_id: Optional[str] = None
    created_at: str

class TeamMemberCreate(BaseModel):
    email: EmailStr
    name: str
    role: str = "operator"

class TeamMemberResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    member_status: str = "active"
    created_at: str
    last_active: Optional[str] = None

class OrganizationStats(BaseModel):
    total_searches: int
    searches_this_month: int
    team_members: int
    saved_operations: int

# TARIC Models
class TaricSearchRequest(BaseModel):
    product_description: str
    origin_country: str
    destination_country: str = "ES"
    client_reference: Optional[str] = None
    trade_agreements: Optional[List[str]] = None

class DocumentRequirement(BaseModel):
    name: str
    type: str
    required: bool
    description: str
    official_link: Optional[str] = None
    issuing_authority: Optional[str] = None
    pdf_form: Optional[str] = None
    pdf_guide: Optional[str] = None
    online_portal: Optional[str] = None
    validity_days: Optional[int] = None
    processing_time: Optional[str] = None

class TariffDetail(BaseModel):
    duty_type: str
    rate: str
    description: str
    legal_base: Optional[str] = None

class ComplianceAlert(BaseModel):
    type: str
    severity: str
    message: str
    official_reference: Optional[str] = None

class ClarificationQuestion(BaseModel):
    question: str
    options: List[str]
    impacts: Optional[str] = None

class ClarificationCheckRequest(BaseModel):
    product_description: str
    origin_country: Optional[str] = None
    destination_country: Optional[str] = None

class ClarificationCheckResponse(BaseModel):
    needs_clarification: bool
    questions: List[ClarificationQuestion] = []
    clarification_message: Optional[str] = None

class TaricResult(BaseModel):
    id: str
    user_id: str
    organization_id: Optional[str]
    product_description: str
    origin_country: str
    destination_country: str
    client_reference: Optional[str]
    taric_code: str
    taric_description: str
    chapter: str
    heading: str
    subheading: str
    tariffs: List[TariffDetail]
    documents: List[DocumentRequirement]
    compliance_alerts: List[ComplianceAlert]
    total_duty_estimate: str
    vat_rate: str
    preferential_duties: Optional[str]
    trade_agreements_applied: Optional[List[str]]
    official_sources: List[dict]
    ai_explanation: str
    ai_confidence: str
    needs_clarification: bool = False
    clarification_questions: List[ClarificationQuestion] = []
    created_at: str

class SearchHistoryItem(BaseModel):
    id: str
    product_description: str
    taric_code: str
    client_reference: Optional[str]
    created_at: str
    user_name: Optional[str] = None

class RegulatoryAlert(BaseModel):
    id: str
    type: str
    title: str
    description: str
    affected_codes: List[str]
    effective_date: str
    source: str
    created_at: str

# Chat Models
class ChatMessage(BaseModel):
    role: str
    content: str
    timestamp: str
    sources: Optional[List[dict]] = None

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    origin_country: Optional[str] = None
    destination_country: Optional[str] = None
    product_description: Optional[str] = None
    language: str = "es"
    selected_option: Optional[str] = None

class ChatOption(BaseModel):
    id: str
    label: str
    value: str

class ChatClarificationRequest(BaseModel):
    question: str
    options: List[ChatOption]
    allow_custom: bool = True
    custom_placeholder: str = "Escribe tu respuesta..."

class ChatResponse(BaseModel):
    response: str
    session_id: str
    sources: List[dict]
    suggested_questions: List[str]
    context: Optional[dict] = None
    needs_clarification: bool = False
    clarification_request: Optional[ChatClarificationRequest] = None

class CountryTradeInfo(BaseModel):
    origin_country: str
    destination_country: str
    language: str = "es"

# Import Cost Models
class ImportCostRequest(BaseModel):
    hs_code: str
    product_description: str
    origin_country: str
    destination_country: str
    fob_value: float
    currency: str = "USD"
    weight_kg: float
    quantity: int = 1
    unit: str = "unidades"
    incoterm: str = "FOB"
    freight_cost: Optional[float] = None
    insurance_cost: Optional[float] = None
    language: str = "es"

class ImportCostResponse(BaseModel):
    summary: dict
    breakdown: dict
    documents_required: List[str]
    warnings: List[str]
    sources: List[dict]
    ai_analysis: str

# Market Study Models
class MarketStudyRequest(BaseModel):
    product_description: str
    taric_code: Optional[str] = None
    origin_country: str
    destination_country: str
    language: str = "es"

class PestelAnalysis(BaseModel):
    political: str
    economic: str
    social: str
    technological: str
    environmental: str
    legal: str

class MarketSize(BaseModel):
    description: str
    value: str
    growth_rate: str

class Competitor(BaseModel):
    name: str
    description: str
    market_share: str

class MarketStudyResult(BaseModel):
    product_name: str
    executive_summary: str
    pestel: PestelAnalysis
    market_size: MarketSize
    competitors: List[Competitor]
    trends: List[str]
    opportunities: List[str]
    threats: List[str]
    recommendations: List[str]

# Image Analysis Models
class ImageAnalysisRequest(BaseModel):
    image_base64: str
    origin_country: Optional[str] = None
    destination_country: str = "ES"
    additional_context: Optional[str] = None
    language: str = "es"

class ImageAnalysisResult(BaseModel):
    id: str
    identified_product: str
    product_category: str
    material_composition: Optional[str]
    taric_codes: List[dict]
    confidence: str
    ai_description: str
    recommendations: List[str]
    created_at: str

# Alert Subscription Models
class AlertSubscriptionRequest(BaseModel):
    email: str
    product_categories: List[str]
    hs_codes: Optional[List[str]] = None
    countries: Optional[List[str]] = None
    alert_types: List[str] = ["tariff_change", "regulation_change", "trade_agreement"]

class AlertSubscriptionResponse(BaseModel):
    id: str
    email: str
    product_categories: List[str]
    hs_codes: List[str]
    countries: List[str]
    alert_types: List[str]
    status: str
    created_at: str

# Batch Classification Models
class BatchProductItem(BaseModel):
    line_number: int
    product_description: str
    origin_country: Optional[str] = None
    destination_country: Optional[str] = None

class BatchClassificationRequest(BaseModel):
    products: List[BatchProductItem]
    default_origin: str
    default_destination: str = "ES"
    language: str = "es"

class BatchResultItem(BaseModel):
    line_number: int
    product_description: str
    taric_code: str
    taric_description: str
    confidence: str
    tariff_rate: str
    status: str
    error_message: Optional[str] = None

class BatchClassificationResponse(BaseModel):
    batch_id: str
    total_products: int
    successful: int
    failed: int
    results: List[BatchResultItem]
    processing_time: float

# Usage Stats Models
class UsageStatsResponse(BaseModel):
    total_searches: int
    searches_this_month: int
    searches_by_day: List[dict]
    top_products: List[dict]
    top_countries: List[dict]
    classification_accuracy: float
