# 🏗️ Demo Script — Multimodal Construction Intelligence Platform

## Prerequisites
- Backend running on `http://localhost:8000`
- Frontend running on `http://localhost:5173`
- *Optional:* Valid `GEMINI_API_KEY` in `backend/.env` or configured directly via the UI header. If not provided, the platform automatically runs in **Zero-Config Demo Mode** with high-fidelity simulated intelligence responses.

---

## Step 1: Dashboard & System Health
1. Open browser → `http://localhost:5173`
2. **Observe**: Dark-themed modern dashboard with 4 stats counters and 6 AI module cards.
3. **Point out**:
   - System Status bar showing Backend connectivity, SQLite database status, Open-Meteo Weather integration, and AI engine status.
   - **Configure Gemini Key** modal button to test or enter a Google AI Studio API key at runtime.
   - **Test AI Link** button to verify connectivity.
   - Recent Inspections & Analyses feed.

---

## Step 2: Construction Site Safety Monitoring
1. Click **Safety Monitor** in sidebar (or from Dashboard).
2. Click **"✨ Load Demo Site Photo"** (or upload your own photo).
3. Click a preset chip (e.g. `3-story scaffold with active hot work`).
4. Click **Analyze Safety**.
5. **Show results**:
   - Animated circular safety score meter (0–100) with color indicators.
   - Color-coded risk badge (CRITICAL / HIGH / MEDIUM / LOW).
   - Side-by-side inspected photo preview.
   - Violations list with categories and spatial image location tags (e.g., `📍 mid-level scaffold center`).
   - Missing PPE tags (IS 2925 helmets, vests, harnesses).
   - Hazards detected & Immediate Actions required.
   - Corrective actions checklist.
6. Click **"Export PDF Report"** to download an official, formatted **Site Safety Inspection Audit PDF**.
7. Click **"JSON"** to view or export raw structured JSON.

---

## Step 3: Structural Crack Detection
1. Click **Crack Detection** in sidebar.
2. Click **"✨ Load Demo Crack Photo"** (loads calibrated crack gauge inspection photo).
3. Select a preset (e.g. `Diagonal crack near window on load-bearing masonry wall`).
4. Click **Analyze Crack**.
5. **Show results**:
   - Crack type (e.g., diagonal shear) and estimated width badge (e.g., `1.5 - 2.5 mm`).
   - Severity badge + urgency indicator (e.g., `REPAIR_SOON`).
   - Structural risk evaluation according to IS 456 & ACI 224R.
   - Likely root causes & Engineering repair recommendations (crack gauge monitoring, epoxy injection, helical stitching).
   - Prominent statutory engineering disclaimer box.
6. Click **"Download Diagnostic PDF"** to export a professional engineering report.

---

## Step 4: Real Estate Valuation
1. Click **Real Estate Valuation** in sidebar.
2. Click one of the one-click presets:
   - **Bandra West 2BHK Flat** (Mumbai)
   - **Whitefield 3BHK Villa** (Bangalore)
   - **Connaught Place Commercial** (Delhi)
3. Form instantly populates with location, area, bedrooms, age, condition, and amenity tags.
4. Click **Estimate Market Valuation**.
5. **Show results**:
   - Fair market value range banner in INR (e.g. `₹1.80 Cr – ₹2.20 Cr`).
   - Per sq ft rate and confidence level badge.
   - Key positive value drivers vs negative depreciation factors.
   - Micro-market trend analysis and comparable market transactions.
6. Click **"Download Valuation Certificate PDF"**.

---

## Step 5: Project Planning & BOQ Generation
1. Click **Project Planning** in sidebar.
2. Click a preset template:
   - `3,000 sqft Residential Villa (₹75L, 18 Months)`
   - `12,000 sqft Commercial Tech Park (₹3.5 Cr, 24 Months)`
3. Click **Generate Comprehensive Project Plan**.
4. **Show results**:
   - Total project duration in weeks and months with Critical Path dependency chain.
   - Phased execution timeline table (Site Prep → Foundations → Superstructure → Masonry/MEP → Finishes).
   - **Material Bill of Quantities (BOQ)** with quantities and estimated costs (TMT Rebar, RMC Concrete, Bricks, Cement).
   - **Labor & Trade Allocation table** (Civil masons, barbenders, carpenters, MEP crew with worker counts and durations).
   - Capital budget breakdown with progress percentage bars.
   - Risk register with probability, impact, and mitigation protocols.
5. Click **"Download Master Plan PDF"**.

---

## Step 6: Daily Site Assistant + Live Weather
1. Click **Daily Assistant** in sidebar.
2. Select a quick scenario: `Monsoon Pouring (Mumbai)` or `High-Rise Scaffolding (Delhi)`.
3. Click **Get Daily Advisory & Briefing**.
4. **Show results**:
   - Live Open-Meteo meteorological card: temperature, wind speed, precipitation, and humidity.
   - Overall site status badge (`SAFE` / `CAUTION` / `UNSAFE`).
   - Activity-by-activity advisories (`PROCEED`, `PROCEED_WITH_CAUTION`, `DELAY`, `CANCEL`) with engineering justifications.
   - Morning toolbox talk safety briefing checklist.
5. Click **"Download Toolbox Briefing PDF"** for site superintendents.

---

## Step 7: Knowledge Assistant Chat
1. Click **Knowledge Chat** in sidebar.
2. Click a quick starter prompt chip:
   - `What is the minimum concrete cover for slabs per IS 456?`
   - `What are permissible crack widths per IS 456:2000?`
   - `What are seismic zone criteria and ductile detailing per IS 1893?`
3. **Show**:
   - Formatted markdown response with code clauses, comparative tables, and bold highlights.
   - Reference standard badges (IS 456:2000 Clause 26.4.1, Table 16, NBC 2016).
   - Follow-up question suggestion chips (click one to continue conversational exploration).
   - Quick **Copy** button to copy response text to clipboard.

---

## Step 8: Analysis History & Vault
1. Click **History** in sidebar.
2. **Show**:
   - Visual audit table with photo thumbnails of inspected sites and cracks.
   - Clicking any photo thumbnail opens an enlarged **Lightbox preview**.
   - Search filter to instantly find audits by keyword or module.
   - **Dual View Mode**: Switch between formatted **Visual** card breakdown and raw **JSON** schema data.
   - Delete single record or clear entire history with confirmation.
