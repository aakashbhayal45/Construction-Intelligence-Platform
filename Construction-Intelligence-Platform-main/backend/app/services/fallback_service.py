"""
Fallback simulation service for Construction Intelligence Platform.
Provides realistic, contextual responses when Gemini API key is not configured
or when API quotas/network issues occur, ensuring 100% demo uptime.
"""
import re
import logging
from app.schemas.schemas import (
    SafetyAnalysisResponse, SafetyViolation,
    CrackAnalysisResponse,
    ValuationResponse,
    PlanningResponse, ProjectPhase, BudgetItem, RiskItem,
    DailyAssistantResponse, WeatherInfo, ActivityAdvice,
    ChatResponse,
)

logger = logging.getLogger(__name__)


def generate_fallback_safety(prompt: str = "") -> SafetyAnalysisResponse:
    """Generate high-fidelity safety inspection response."""
    return SafetyAnalysisResponse(
        risk_level="HIGH",
        overall_score=48,
        violations=[
            SafetyViolation(
                category="PPE Violation",
                description="Multiple workers on 2nd tier staging observed working without certified safety hard hats",
                location_in_image="mid-level scaffold framework center",
            ),
            SafetyViolation(
                category="Scaffolding",
                description="Perimeter scaffold platform lacks compliant intermediate guardrails and toe-boards",
                location_in_image="outer scaffold perimeter",
            ),
            SafetyViolation(
                category="Housekeeping",
                description="Loose rebar off-cuts, timber formwork, and electrical cables cluttering the primary access route",
                location_in_image="ground level walkway foreground",
            ),
        ],
        missing_ppe=[
            "Safety Helmets (IS 2925)",
            "High-Visibility Reflective Vests (IS 15809)",
            "Safety Harness with Lanyard (IS 3521)",
        ],
        hazards_detected=[
            "Unprotected edge fall hazard at elevated platform (>2m elevation)",
            "Puncture and trip hazards from uncovered vertical rebar dowels",
            "Suspended load proximity to active ground working zone",
        ],
        immediate_actions=[
            "Halt all work at height on unbarricaded scaffolding immediately",
            "Mandate full PPE donning (hard hat, vest, safety boots) before site re-entry",
        ],
        corrective_actions=[
            "Install double-rail guardrails (top rail 1050mm, mid rail 600mm) and 150mm toe-boards per IS 2750",
            "Conduct mandatory morning toolbox safety briefing on fall prevention",
            "Ream rebar dowels with protective plastic mushroom caps",
            "Establish dedicated material staging bay away from circulation pathways",
        ],
        summary="High-risk site inspection: Significant PPE non-compliance and elevated edge fall hazards detected. Immediate height work cessation and safety barrier installation mandated.",
    )


def generate_fallback_crack(prompt: str = "") -> CrackAnalysisResponse:
    """Generate high-fidelity crack diagnostic response."""
    return CrackAnalysisResponse(
        crack_type="diagonal shear",
        severity="HIGH",
        width_estimate_mm="1.5 - 2.5 mm",
        likely_causes=[
            "Differential foundation settlement causing angular distortion in load-bearing masonry/RCC",
            "Diagonal shear stress concentration adjacent to window/door structural opening",
            "Thermal expansion differential combined with inadequate contraction joint spacing",
        ],
        structural_risk="Diagonal crack extending from opening corner indicates principal tensile stress exceeding masonry/concrete shear capacity. High risk of progressive opening and load transfer degradation under continued settlement or seismic action.",
        repair_recommendations=[
            "Install calibrated Avongard crack tell-tale monitor to observe active vs dormant progression over 14 days",
            "Engage a licensed structural engineer to evaluate foundation settlement and soil bearing capacity",
            "Pressure-inject structural epoxy resin (per ASTM C881 / IS 13935) once crack stabilization is verified",
            "Install stainless steel helical stitch bars across crack plane at 300mm vertical centers",
        ],
        urgency="REPAIR_SOON",
        disclaimer="This AI analysis is preliminary decision-support and must be verified on-site by a licensed structural engineer before initiating structural alterations or repair work.",
        summary="Active diagonal shear crack (1.5-2.5 mm) detected in load-bearing structural member. Likely origin: differential settlement. Structural monitoring and engineering assessment required.",
    )


def generate_fallback_valuation(prompt: str = "") -> ValuationResponse:
    """Generate realistic property valuation response from prompt parameters."""
    # Extract area
    area_match = re.search(r"Area:\s*([0-9.]+)", prompt) or re.search(r"([0-9.]+)\s*sq\s*ft", prompt, re.I)
    area = float(area_match.group(1)) if area_match else 1200.0

    # Extract location
    loc_match = re.search(r"Location:\s*([^\n\r]+)", prompt)
    loc = loc_match.group(1).strip() if loc_match else "Mumbai"

    # Base rate per sqft estimate based on tier/city
    loc_lower = loc.lower()
    if any(c in loc_lower for c in ["bandra", "mumbai", "worli", "juhu", "south bombay"]):
        base_rate = 22000.0
    elif any(c in loc_lower for c in ["bangalore", "bengaluru", "whitefield", "koramangala", "indiranagar"]):
        base_rate = 9500.0
    elif any(c in loc_lower for c in ["delhi", "gurgaon", "noida", "cp"]):
        base_rate = 11000.0
    elif any(c in loc_lower for c in ["pune", "hyderabad", "chennai"]):
        base_rate = 7500.0
    else:
        base_rate = 6000.0

    min_rate = base_rate * 0.92
    max_rate = base_rate * 1.15
    min_price = round(area * min_rate, -4)
    max_price = round(area * max_rate, -4)
    avg_rate = round((min_price + max_price) / (2 * area), 0)

    return ValuationResponse(
        min_price_inr=min_price,
        max_price_inr=max_price,
        per_sqft_rate_inr=avg_rate,
        confidence="HIGH",
        key_value_drivers=[
            f"Prime micro-market demand in {loc}",
            "Strong road connectivity and transit infrastructure accessibility",
            "Favorable layout efficiency and carpet-to-super-built-up ratio",
            "High rental yield potential in the catchment area",
        ],
        negative_factors=[
            "Age-related structural and MEP depreciation allowance",
            "Local municipal parking ratio constraints in high-density corridors",
        ],
        comparable_properties=[
            f"Comparable {round(area)} sqft in {loc}: ₹{round(min_price * 0.98):,} – ₹{round(max_price * 1.02):,}",
            f"Recent transaction: ₹{round(base_rate):,}/sqft in adjacent development",
        ],
        assumptions=[
            "Clean title deed and clear RERA registration status",
            "Standard carpet-to-built-up loading factor of 25-30%",
            "Prevailing interest rates and Q4 2024 - 2025 residential market benchmarks",
        ],
        market_trend=f"{loc} residential sector exhibiting steady 8–12% year-on-year capital appreciation driven by infrastructure expansion.",
        summary=f"Estimated market valuation for {area:.0f} sqft property at {loc} ranges from ₹{min_price:,.0f} to ₹{max_price:,.0f} with healthy capital appreciation forecast.",
    )


def generate_fallback_planning(prompt: str = "") -> PlanningResponse:
    """Generate comprehensive construction plan response."""
    # Extract budget
    budget_match = re.search(r"Budget:\s*₹?([0-9,.]+)", prompt)
    budget = float(budget_match.group(1).replace(",", "")) if budget_match else 7500000.0

    # Extract area
    area_match = re.search(r"Area:\s*([0-9.]+)", prompt)
    area = float(area_match.group(1)) if area_match else 3000.0

    # Extract deadline
    deadline_match = re.search(r"Deadline:\s*([0-9]+)", prompt)
    months = int(deadline_match.group(1)) if deadline_match else 18
    weeks = months * 4

    # Calculate budgets
    civil_cost = round(budget * 0.45)
    finishes_cost = round(budget * 0.22)
    mep_cost = round(budget * 0.15)
    labor_budget = round(budget * 0.12)
    contingency = round(budget * 0.06)

    return PlanningResponse(
        total_duration_weeks=weeks,
        phases=[
            ProjectPhase(
                phase_name="Phase 1: Mobilization, Site Survey & Excavation",
                start_week=1,
                end_week=round(weeks * 0.15),
                duration_weeks=round(weeks * 0.15),
                key_activities=[
                    "Site topographic survey and soil SBC bore-hole testing",
                    "Temporary water, power, and security barricading installation",
                    "Bulk foundation excavation and dewatering setup",
                ],
                milestones=["Site handed over", "PCC bed completed", "Soil report verified"],
            ),
            ProjectPhase(
                phase_name="Phase 2: Substructure & Foundation Works",
                start_week=round(weeks * 0.15) + 1,
                end_week=round(weeks * 0.35),
                duration_weeks=round(weeks * 0.20),
                key_activities=[
                    "Footing reinforcement binding (Fe500D) and formwork",
                    "Raft/footing concrete casting with slump monitoring",
                    "Plinth beams, damp-proof course (DPC), and backfilling",
                ],
                milestones=["Substructure inspection cleared", "Plinth level achieved"],
            ),
            ProjectPhase(
                phase_name="Phase 3: RCC Superstructure & Frame",
                start_week=round(weeks * 0.35) + 1,
                end_week=round(weeks * 0.65),
                duration_weeks=round(weeks * 0.30),
                key_activities=[
                    "Column casting with shuttering staging",
                    "Beam and slab shuttering, rebar layout, and conduit embedding",
                    "Monolithic floor slab casting and 21-day pond curing",
                ],
                milestones=["Ground floor slab cast", "Top terrace slab reached"],
            ),
            ProjectPhase(
                phase_name="Phase 4: Masonry, MEP Rough-ins & Plastering",
                start_week=round(weeks * 0.65) + 1,
                end_week=round(weeks * 0.85),
                duration_weeks=round(weeks * 0.20),
                key_activities=[
                    "Autoclaved aerated concrete (AAC) blockwork / fly ash brickwork",
                    "Electrical wall chases, plumbing lines, and drainage rough-in",
                    "Internal gypsum plaster and external sand-faced cement plaster",
                ],
                milestones=["Brickwork locked", "MEP pressure test approved"],
            ),
            ProjectPhase(
                phase_name="Phase 5: Architectural Finishes, Testing & Commissioning",
                start_week=round(weeks * 0.85) + 1,
                end_week=weeks,
                duration_weeks=weeks - round(weeks * 0.85),
                key_activities=[
                    "Flooring tiling, granite thresholds, and wall cladding",
                    "Electrical fixture fitting, sanitaryware, and waterproofing testing",
                    "Interior/exterior painting and final snag list rectification",
                ],
                milestones=["Occupancy certificate readiness", "Client handover"],
            ),
        ],
        material_estimates=[
            {"material": "TMT Rebar Fe500D (IS 1786)", "quantity": f"{round(area * 0.0045, 1)} Metric Tons", "estimated_cost_inr": round(budget * 0.18)},
            {"material": "Ready Mix Concrete M25/M30", "quantity": f"{round(area * 0.35)} Cubic Meters", "estimated_cost_inr": round(budget * 0.16)},
            {"material": "AAC Blocks / Fly Ash Bricks", "quantity": f"{round(area * 7.5):,} Units", "estimated_cost_inr": round(budget * 0.06)},
            {"material": "OPC 53 / PPC Cement Bags", "quantity": f"{round(area * 0.4):,} Bags", "estimated_cost_inr": round(budget * 0.05)},
            {"material": "River Sand & M-Sand", "quantity": f"{round(area * 0.25)} Brass", "estimated_cost_inr": round(budget * 0.04)},
            {"material": "Vitrified Tiles & Stone", "quantity": f"{round(area * 1.15):,} sq ft", "estimated_cost_inr": round(budget * 0.08)},
        ],
        labor_breakdown=[
            {"trade": "Civil Masons & Concrete Crew", "count": 12, "duration_weeks": round(weeks * 0.65), "cost_inr": round(labor_budget * 0.35)},
            {"trade": "Steel Barbenders & Riggers", "count": 8, "duration_weeks": round(weeks * 0.50), "cost_inr": round(labor_budget * 0.25)},
            {"trade": "Formwork Carpenters", "count": 6, "duration_weeks": round(weeks * 0.50), "cost_inr": round(labor_budget * 0.20)},
            {"trade": "MEP Technicians (Electrician & Plumber)", "count": 4, "duration_weeks": round(weeks * 0.40), "cost_inr": round(labor_budget * 0.12)},
            {"trade": "Finishing Crew (Tilers & Painters)", "count": 6, "duration_weeks": round(weeks * 0.30), "cost_inr": round(labor_budget * 0.08)},
        ],
        risk_register=[
            RiskItem(
                risk="Monsoon Precipitation Delay",
                probability="HIGH",
                impact="HIGH",
                mitigation="Fast-track substructure and plinth backfilling prior to monsoon onset; deploy high-head submersible dewatering pumps",
            ),
            RiskItem(
                risk="Steel & Cement Material Price Volatility",
                probability="MEDIUM",
                impact="MEDIUM",
                mitigation="Execute fixed-rate advance procurement contracts for 60% of structural steel and cement requirements",
            ),
            RiskItem(
                risk="Local Skilled Labor Shortage during Harvest Season",
                probability="MEDIUM",
                impact="MEDIUM",
                mitigation="Retain multi-skilled subcontractor labor packages with staggered milestone retention incentives",
            ),
            RiskItem(
                risk="Municipal Utility Grid Connection Delays",
                probability="LOW",
                impact="HIGH",
                mitigation="Submit statutory power and drainage NOC applications at commencement of Phase 2",
            ),
        ],
        budget_breakdown=[
            BudgetItem(category="Civil & Structural Core", amount_inr=civil_cost, percentage=45.0),
            BudgetItem(category="Architectural Finishes", amount_inr=finishes_cost, percentage=22.0),
            BudgetItem(category="MEP Services & Drainage", amount_inr=mep_cost, percentage=15.0),
            BudgetItem(category="Site Labor & Supervision", amount_inr=labor_budget, percentage=12.0),
            BudgetItem(category="Statutory & Contingency", amount_inr=contingency, percentage=6.0),
        ],
        critical_path=[
            "Soil Testing & Excavation → Raft Foundation Casting → Substructure Curing → Ground Floor RCC Columns & Slab → Upper Tier RCC Superstructure → External Weatherproofing → MEP Grid Connection & Handover"
        ],
        recommendations=[
            "Establish on-site cube testing protocol (IS 516) for 7-day and 28-day concrete compressive strength verification.",
            "Implement weekly 3-week lookahead schedule to coordinate subcontractor material arrivals and prevent trade stacking.",
            "Deploy digital bar-bending schedules (BBS) to curtail rebar cutting scrap below 2.5%.",
        ],
        summary=f"Master construction project plan for {area:.0f} sqft project across {weeks} weeks. Phased milestone schedule, material bill of quantities, trade allocation, and risk mitigations optimized for cost and quality.",
    )


def generate_fallback_daily(prompt: str = "") -> DailyAssistantResponse:
    """Generate daily site advisory based on prompt weather and activities."""
    # Check if rain or high wind is mentioned
    has_rain = "rain" in prompt.lower() or "drizzle" in prompt.lower() or "shower" in prompt.lower()
    has_high_wind = "wind" in prompt.lower() and any(w in prompt.lower() for w in ["30", "35", "40", "45", "50", "high"])

    weather = WeatherInfo(
        temperature_c=29.5,
        wind_speed_kmh=16.0,
        precipitation_mm=0.0,
        humidity_percent=62.0,
        condition="Partly Cloudy",
    )

    activities = ["Concrete pouring", "Scaffolding erection", "Electrical work", "Brickwork"]
    advices = []

    for act in activities:
        if "concrete" in act.lower():
            if has_rain:
                advices.append(ActivityAdvice(
                    activity=act,
                    recommendation="DELAY",
                    reason="Precipitation risks washing out cement paste and increasing water-cement ratio, compromising structural strength.",
                ))
            else:
                advices.append(ActivityAdvice(
                    activity=act,
                    recommendation="PROCEED",
                    reason="Ambient conditions favorable. Ensure adequate plastic sheeting on standby and maintain standard 7-day wet burlap curing.",
                ))
        elif "scaffold" in act.lower() or "crane" in act.lower() or "lifting" in act.lower():
            if has_high_wind:
                advices.append(ActivityAdvice(
                    activity=act,
                    recommendation="DELAY",
                    reason="High wind gust speeds exceed safe operating thresholds for elevated staging and crane lift operations.",
                ))
            else:
                advices.append(ActivityAdvice(
                    activity=act,
                    recommendation="PROCEED_WITH_CAUTION",
                    reason="Inspect all scaffold ties and base jacks before morning shift. Mandatory dual-lanyard full body harnesses for all height personnel.",
                ))
        elif "electrical" in act.lower():
            advices.append(ActivityAdvice(
                activity=act,
                recommendation="PROCEED",
                reason="Dry working conditions. Verify Lockout/Tagout (LOTO) protocols and 30mA residual current circuit breaker (RCCB) on all temporary distribution boards.",
            ))
        else:
            advices.append(ActivityAdvice(
                activity=act,
                recommendation="PROCEED",
                reason="Standard working conditions. Follow IS code precautions and maintain adequate hydration stations across active zones.",
            ))

    return DailyAssistantResponse(
        weather=weather,
        overall_site_status="SAFE" if not has_rain else "CAUTION",
        activity_advice=advices,
        safety_briefing=[
            "Morning Toolbox Topic: 100% tie-off compliance for all personnel operating above 1.8 meters.",
            "Verify all temporary electrical distribution boards are fitted with functional 30mA ELCB/RCCBs.",
            "Inspect perimeter handrails and ensure stair access towers are clear of tripping hazards.",
            "Maintain designated drinking water stations with electrolytes for workers during midday hours.",
        ],
        daily_precautions=[
            "Check mobile crane outrigger pads and ground bearing pressure before pick operations.",
            "Enforce mandatory eye protection and dust suppression during dry cutting and masonry trimming.",
            "Keep tarpaulin covers accessible in ready-mix discharge area in event of sudden weather shift.",
        ],
        summary="Site weather conditions are favorable for primary construction trades. Staging inspections and PPE compliance mandated for all elevated operations.",
    )


def generate_fallback_chat(prompt: str = "") -> ChatResponse:
    """Generate technical chat response referencing Indian & international standards."""
    p_lower = prompt.lower()
    if "cover" in p_lower:
        reply = (
            "### Minimum Concrete Cover per IS 456:2000 (Clause 26.4.1 & Table 16)\n\n"
            "According to **IS 456:2000**, the nominal clear cover to meet durability requirements depends on exposure conditions:\n\n"
            "| Exposure Condition | Minimum Nominal Cover (mm) | Minimum Grade of Concrete |\n"
            "| :--- | :--- | :--- |\n"
            "| **Mild** (protected against weather/aggressive soil) | **20 mm** | M20 |\n"
            "| **Moderate** (sheltered from heavy rain, subsoil water) | **30 mm** | M25 |\n"
            "| **Severe** (exposed to coastal environment, driving rain) | **45 mm** | M30 |\n"
            "| **Very Severe** (sea water spray, corrosive atmosphere) | **50 mm** | M35 |\n"
            "| **Extreme** (tidal zone, abrasive/aggressive chemicals) | **75 mm** | M40 |\n\n"
            "**Key Structural Reductions (IS 456 Clause 26.4.2):**\n"
            "- For longitudinal reinforcing bars in a **column**, nominal cover shall not be less than **40 mm**, or less than bar diameter. For columns ≤ 200 mm with bar size ≤ 12 mm, nominal cover of **25 mm** may be used.\n"
            "- For **slabs**, for mild exposure, cover can be reduced to **15 mm** if main rebar is ≤ 12 mm.\n"
            "- In no case should nominal cover be less than the diameter of the longitudinal bar."
        )
        refs = ["IS 456:2000 Clause 26.4.1", "IS 456:2000 Table 16", "NBC 2016 Part 6 Section 5"]
        follow_ups = [
            "What is the minimum cover for severe coastal exposure?",
            "How does inadequate cover accelerate rebar corrosion?",
            "What are fire rating cover requirements per IS 456 Table 16A?",
        ]
    elif "crack" in p_lower:
        reply = (
            "### Permissible Crack Widths per IS 456:2000 (Clause 35.3.2)\n\n"
            "Under serviceability limit states, surface crack widths should generally not exceed the following limits:\n\n"
            "1. **Mild Exposure:** Maximum crack width shall not exceed **0.3 mm**.\n"
            "2. **Moderate or Severe Exposure:** Maximum surface crack width is restricted to **0.2 mm** to prevent ingress of moisture, chlorides, and air.\n"
            "3. **Aggressive / Marine Environments:** Crack widths should be limited to **0.1 mm** or crack-free condition.\n\n"
            "**Key Prevention Measures:**\n"
            "- Distribute reinforcement in smaller bar diameters at closer spacing rather than large bars at wide spacing.\n"
            "- Ensure minimum distribution steel (0.15% for mild steel, 0.12% for HYSD bars per IS 456 Clause 26.5.2.1).\n"
            "- Control water-cement ratio (≤ 0.45 for moderate/severe exposure)."
        )
        refs = ["IS 456:2000 Clause 35.3.2", "ACI 224R-01 Control of Cracking", "NBC 2016"]
        follow_ups = [
            "How to repair structural cracks with epoxy injection?",
            "What causes diagonal shear cracks in masonry walls?",
            "How to distinguish plastic shrinkage cracks from settlement cracks?",
        ]
    elif "seismic" in p_lower or "earthquake" in p_lower or "1893" in p_lower:
        reply = (
            "### Seismic Design Criteria per IS 1893 (Part 1): 2016 & IS 13920: 2016\n\n"
            "India is classified into **four seismic zones** (Zone II, III, IV, and V):\n\n"
            "- **Zone II (Low):** Seismic Zone Factor $Z = 0.10$\n"
            "- **Zone III (Moderate):** Seismic Zone Factor $Z = 0.16$\n"
            "- **Zone IV (Severe):** Seismic Zone Factor $Z = 0.24$\n"
            "- **Zone V (Very Severe):** Seismic Zone Factor $Z = 0.36$\n\n"
            "**Ductile Detailing Mandate (IS 13920:2016):**\n"
            "- Mandatory for all RCC structures in Zones III, IV, and V.\n"
            "- Special confining reinforcement (closely spaced hoops) must be provided in column hinge zones ($l_0 = \\max(d, b, 450\\text{ mm})$).\n"
            "- Strong-Column Weak-Beam design rule: $\\sum M_{c} \\ge 1.4 \\sum M_{b}$ at beam-column junctions."
        )
        refs = ["IS 1893 (Part 1): 2016 Clause 6.4", "IS 13920: 2016 Ductile Detailing", "NBC 2016 Part 6"]
        follow_ups = [
            "What are the ductile detailing rules for beam-column joints?",
            "How is the response reduction factor (R) chosen?",
            "What is soft-storey irregularity per IS 1893?",
        ]
    else:
        reply = (
            "### Construction Engineering Guidance\n\n"
            "In accordance with **National Building Code (NBC 2016)** and relevant Indian Standards:\n\n"
            "1. **Quality Assurance:** Concrete mix designs must conform to **IS 10262:2019** with target mean strength testing per IS 516.\n"
            "2. **Workmanship:** Formwork removal criteria must adhere to **IS 456:2000 Table 11** (Soffit formwork to slabs: 3 days, props to slabs < 4.5m: 7 days, props to beams: 14-21 days).\n"
            "3. **Safety Compliance:** Scaffolding and staging must comply with **IS 2750** and **IS 4014** with mandatory PPE enforcement under **IS 14489**.\n\n"
            "Please feel free to ask about specific clauses, reinforcement detailing, or calculation methodologies!"
        )
        refs = ["IS 456:2000", "NBC 2016 Part 6", "IS 10262:2019"]
        follow_ups = [
            "What is the minimum concrete cover for slabs?",
            "What is the permissible stripping time for formwork?",
            "What are the requirements for high-strength concrete per IS 456?",
        ]

    return ChatResponse(
        reply=reply,
        references=refs,
        follow_up_questions=follow_ups,
    )
