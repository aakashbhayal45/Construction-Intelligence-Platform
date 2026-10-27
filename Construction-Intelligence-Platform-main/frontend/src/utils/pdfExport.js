import { jsPDF } from 'jspdf';

const BRAND_NAME = 'ConstructAI Intelligence Platform';
const BRAND_SUB = 'Multimodal AI Decision Support for Construction Professionals';

function addHeader(doc, title, subtitle) {
  // Dark header banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 36, 'F');

  // Accent line
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 35, 210, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(245, 158, 11);
  doc.text(BRAND_NAME, 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(BRAND_SUB, 14, 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 30);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(203, 213, 225);
  const dateStr = `Generated: ${new Date().toLocaleString('en-IN')}`;
  doc.text(dateStr, 196, 30, { align: 'right' });
}

function addFooter(doc, pageNum, totalPages = 1) {
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(14, pageHeight - 12, 196, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Powered by Google Gemini Multimodal AI · Official Advisory Document', 14, pageHeight - 7);
  doc.text(`Page ${pageNum} of ${totalPages}`, 196, pageHeight - 7, { align: 'right' });
}

export function exportSafetyPDF(result, notes = '') {
  const doc = new jsPDF();
  addHeader(doc, 'OFFICIAL SITE SAFETY INSPECTION AUDIT', 'Safety Monitoring Module');

  let y = 46;

  // Score Banner
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Overall Safety Score: ${result.overall_score} / 100`, 20, y + 10);

  const riskColor = result.risk_level === 'LOW' ? [34, 197, 94]
    : result.risk_level === 'MEDIUM' ? [234, 179, 8]
    : [239, 68, 68];
  doc.setTextColor(...riskColor);
  doc.text(`Risk Level: ${result.risk_level}`, 20, y + 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  if (notes) {
    doc.text(`Inspector Notes: ${notes.substring(0, 70)}`, 110, y + 10);
  }
  doc.text(`Violations Count: ${result.violations?.length || 0}`, 110, y + 18);

  y += 32;

  // Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE SAFETY SUMMARY', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(result.summary || 'No summary available.', 182);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 4.5 + 6;

  // Violations Table
  if (result.violations?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('IDENTIFIED SAFETY VIOLATIONS', 14, y);
    y += 5;

    result.violations.forEach((v, idx) => {
      doc.setFillColor(254, 242, 242);
      doc.setDrawColor(254, 202, 202);
      doc.roundedRect(14, y, 182, 12, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28);
      doc.text(`${idx + 1}. [${v.category}]`, 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      const desc = v.location_in_image ? `${v.description} (Location: ${v.location_in_image})` : v.description;
      doc.text(desc.substring(0, 95), 18, y + 9.5);

      y += 15;
    });
    y += 3;
  }

  // Missing PPE
  if (result.missing_ppe?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('MISSING PERSONAL PROTECTIVE EQUIPMENT (PPE)', 14, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 38, 38);
    doc.text(`Required immediately: ${result.missing_ppe.join('  •  ')}`, 14, y);
    y += 10;
  }

  // Corrective Actions
  if (result.corrective_actions?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('MANDATORY CORRECTIVE ACTIONS', 14, y);
    y += 5;

    result.corrective_actions.forEach((act, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`[ ] ${idx + 1}. ${act}`, 16, y);
      y += 5;
    });
    y += 6;
  }

  // Disclaimer box
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, y, 182, 14, 2, 2, 'F');
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Notice: This AI-generated safety audit assists site management. It does not supersede statutory safety inspections required under IS 14489 / OSHA regulations.', 18, y + 8);

  addFooter(doc, 1, 1);
  doc.save(`Safety_Inspection_Report_${Date.now()}.pdf`);
}

export function exportCrackPDF(result, notes = '') {
  const doc = new jsPDF();
  addHeader(doc, 'STRUCTURAL CRACK DIAGNOSTIC REPORT', 'Structural Health Assessment');

  let y = 46;

  // Overview box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Crack Classification: ${result.crack_type?.toUpperCase()}`, 20, y + 9);

  const sevColor = result.severity === 'LOW' ? [34, 197, 94]
    : result.severity === 'MEDIUM' ? [234, 179, 8]
    : [239, 68, 68];
  doc.setTextColor(...sevColor);
  doc.text(`Severity: ${result.severity}  |  Urgency: ${result.urgency?.replace(/_/g, ' ')}`, 20, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Estimated Width: ${result.width_estimate_mm}`, 20, y + 24);
  if (notes) {
    doc.text(`Element: ${notes.substring(0, 50)}`, 110, y + 24);
  }

  y += 36;

  // Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE TECHNICAL SUMMARY', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const summaryLines = doc.splitTextToSize(result.summary || '', 182);
  doc.text(summaryLines, 14, y);
  y += summaryLines.length * 4.5 + 8;

  // Structural Risk
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('STRUCTURAL RISK EVALUATION', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const riskLines = doc.splitTextToSize(result.structural_risk || '', 182);
  doc.text(riskLines, 14, y);
  y += riskLines.length * 4.5 + 8;

  // Likely Causes
  if (result.likely_causes?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('IDENTIFIED LIKELY CAUSES', 14, y);
    y += 5;
    result.likely_causes.forEach((c) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`• ${c}`, 16, y);
      y += 5;
    });
    y += 5;
  }

  // Repair Recommendations
  if (result.repair_recommendations?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('ENGINEERING REPAIR RECOMMENDATIONS', 14, y);
    y += 5;
    result.repair_recommendations.forEach((r, idx) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${idx + 1}. ${r}`, 16, y);
      y += 5;
    });
    y += 8;
  }

  // Statutory Disclaimer
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(14, y, 182, 18, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('LEGAL & STATUTORY ENGINEERING DISCLAIMER:', 18, y + 6);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(153, 27, 27);
  doc.text(doc.splitTextToSize(result.disclaimer || 'Engineering assessment required.', 174), 18, y + 11);

  addFooter(doc, 1, 1);
  doc.save(`Crack_Diagnostic_Report_${Date.now()}.pdf`);
}

export function exportValuationPDF(result, form) {
  const doc = new jsPDF();
  addHeader(doc, 'REAL ESTATE VALUATION CERTIFICATE', 'AI Market Valuation Report');

  let y = 46;

  // Banner
  doc.setFillColor(240, 253, 244);
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(14, y, 182, 28, 3, 3, 'FD');

  const formatINR = (val) => {
    if (!val) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
    return `₹${val.toLocaleString('en-IN')}`;
  };

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(22, 101, 52);
  doc.text(`Valuation Range: ${formatINR(result.min_price_inr)} – ${formatINR(result.max_price_inr)}`, 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(21, 128, 61);
  doc.text(`Per Sq Ft Rate: ₹${result.per_sqft_rate_inr?.toLocaleString('en-IN')} / sq ft  |  Confidence: ${result.confidence}`, 20, y + 18);

  doc.setTextColor(71, 85, 105);
  doc.text(`Property: ${form.property_type?.toUpperCase()} in ${form.location} (${form.area_sqft} sq ft)`, 20, y + 25);

  y += 36;

  // Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE VALUATION SUMMARY', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const sumLines = doc.splitTextToSize(result.summary || '', 182);
  doc.text(sumLines, 14, y);
  y += sumLines.length * 4.5 + 8;

  // Drivers
  if (result.key_value_drivers?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(22, 101, 52);
    doc.text('KEY VALUE DRIVERS', 14, y);
    y += 5;
    result.key_value_drivers.forEach(d => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(`[+] ${d}`, 16, y);
      y += 5;
    });
    y += 5;
  }

  // Market Trend
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('MICRO-MARKET TREND ANALYSIS', 14, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  const trendLines = doc.splitTextToSize(result.market_trend || '', 182);
  doc.text(trendLines, 14, y);
  y += trendLines.length * 4.5 + 8;

  // Comparables
  if (result.comparable_properties?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('COMPARABLE MARKET TRANSACTIONS', 14, y);
    y += 5;
    result.comparable_properties.forEach(c => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`• ${c}`, 16, y);
      y += 5;
    });
  }

  addFooter(doc, 1, 1);
  doc.save(`Valuation_Certificate_${Date.now()}.pdf`);
}

export function exportPlanningPDF(result, form) {
  const doc = new jsPDF();
  addHeader(doc, 'CONSTRUCTION MASTER PROJECT PLAN', 'Execution Schedule & BOQ Estimates');

  let y = 46;

  // Overview box
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(186, 230, 253);
  doc.roundedRect(14, y, 182, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(3, 105, 161);
  doc.text(`Project Duration: ${result.total_duration_weeks} Weeks (${(result.total_duration_weeks / 4.33).toFixed(1)} Months)`, 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(14, 116, 144);
  doc.text(`Type: ${form.project_type?.toUpperCase()}  |  Area: ${form.size_sqft} sq ft  |  Workforce: ${form.workforce_count} workers`, 20, y + 17);

  y += 32;

  // Critical path
  if (result.critical_path?.length > 0) {
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(14, y, 182, 12, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('CRITICAL PATH:', 18, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(3, 105, 161);
    doc.text(result.critical_path.join(' → ').substring(0, 110), 18, y + 9.5);
    y += 18;
  }

  // Phases Table
  if (result.phases?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('PROJECT EXECUTION PHASES', 14, y);
    y += 6;

    result.phases.slice(0, 5).forEach(p => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`${p.phase_name} (Weeks ${p.start_week}–${p.end_week}, ${p.duration_weeks}w)`, 16, y);
      y += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Key Milestones: ${p.milestones?.join(', ') || 'N/A'}`, 20, y);
      y += 6;
    });
    y += 4;
  }

  // Materials & Labor Summary
  if (result.material_estimates?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('KEY MATERIAL ESTIMATES', 14, y);
    y += 6;

    result.material_estimates.slice(0, 4).forEach(m => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${m.material}: ${m.quantity} — Est. ₹${m.estimated_cost_inr?.toLocaleString('en-IN')}`, 16, y);
      y += 4.5;
    });
    y += 5;
  }

  addFooter(doc, 1, 1);
  doc.save(`Project_Plan_${Date.now()}.pdf`);
}

export function exportDailyPDF(result, location) {
  const doc = new jsPDF();
  addHeader(doc, 'DAILY SITE BRIEFING & WEATHER ADVISORY', `Location: ${location}`);

  let y = 46;
  const w = result.weather;

  // Weather block
  doc.setFillColor(250, 245, 255);
  doc.setDrawColor(233, 213, 255);
  doc.roundedRect(14, y, 182, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(126, 34, 206);
  doc.text(`Weather: ${w?.condition} (${w?.temperature_c}°C)  |  Site Status: ${result.overall_site_status}`, 20, y + 10);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(107, 33, 168);
  doc.text(`Wind: ${w?.wind_speed_kmh} km/h  |  Precipitation: ${w?.precipitation_mm} mm  |  Humidity: ${w?.humidity_percent}%`, 20, y + 18);

  y += 32;

  // Activities
  if (result.activity_advice?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('SCHEDULED ACTIVITY ADVISORIES', 14, y);
    y += 6;

    result.activity_advice.forEach(a => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(`[${a.recommendation}] ${a.activity}`, 16, y);
      y += 4.5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(71, 85, 105);
      doc.text(a.reason.substring(0, 110), 20, y);
      y += 6;
    });
    y += 4;
  }

  // Safety Briefing
  if (result.safety_briefing?.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text('MORNING TOOLBOX SAFETY BRIEFING', 14, y);
    y += 6;
    result.safety_briefing.forEach(s => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`• ${s}`, 16, y);
      y += 4.5;
    });
  }

  addFooter(doc, 1, 1);
  doc.save(`Daily_Site_Briefing_${Date.now()}.pdf`);
}
