import { NextResponse } from "next/server";

// Comprehensive health knowledge base for realistic responses
const healthContexts: Record<string, { 
  analysis: string; 
  indicators: string[]; 
  recommendations: string[]; 
  risks: string[]; 
}> = {
  headache: {
    analysis: "The patient is reporting cephalalgia (headache) symptoms. Based on common clinical patterns, this may be attributed to tension-type factors, dehydration, or ocular strain. However, the presence of localized pain or neurological symptoms must be monitored.",
    indicators: ["Bilateral pressure or 'band' around the head", "Increased sensitivity to light or sound", "Muscle tension in neck/shoulders"],
    recommendations: ["Increase hydration immediately (2L daily minimum)", "Temporary cessation of screen-based activity (digital detox)", "Gentle physical massage of the suboccipital region"],
    risks: ["If pain becomes sharp, sudden, or is accompanied by confusion, immediate emergency care is required."]
  },
  fever: {
    analysis: "Febrile response detected. Fever is a physiological defense mechanism against pathogenic infection. Temperatures above 38°C (100.4°F) suggest the immune system is actively combating an underlying stimulus.",
    indicators: ["Elevated core temperature", "Systemic chills and rigors", "General malaise and muscle aches"],
    recommendations: ["Frequent monitoring of body temperature every 4 hours", "Maintenance of electrolyte balance through clear fluids", "Bed rest to prioritize metabolic energy for immune response"],
    risks: ["Prolonged high fever (>39.5°C) or respiratory distress requires urgent intervention."]
  },
  cough: {
    analysis: "Respiratory irritant response observed. A cough is a protective reflex to clear the airways of mucus or foreign particles. The duration and productivity (wet vs. dry) are key diagnostic markers.",
    indicators: ["Throat irritation or 'tickle'", "Presence of phlegm or sputum", "Chest tightness during expiration"],
    recommendations: ["Use of a humidifier to maintain airway moisture", "Elevation of the head during sleep to prevent post-nasal drip", "Warm saline gargles to reduce pharyngeal inflammation"],
    risks: ["Coughs lasting more than 21 days or containing blood require immediate clinical workup."]
  },
  stomach: {
    analysis: "Gastrointestinal distress identified. Symptoms may range from functional dyspepsia (indigestion) to acute gastroenteritis. Patterns related to food intake are critical for diagnosis.",
    indicators: ["Epigastric pain or discomfort", "Nausea or early satiety", "Altered bowel frequency"],
    recommendations: ["Implementation of the BRAT protocol (Banana, Rice, Apple, Toast)", "Gradual reintroduction of solids following 24-hour liquid diet", "Avoidance of NSAIDs (like ibuprofen) which may irritate gastric lining"],
    risks: ["Severe abdominal pain localized to the lower right quadrant or high fever warrants emergency screening."]
  },
  anxiety: {
    analysis: "Psychophysiological stress response noted. Anxiety often manifests as a hyperactive sympathetic nervous system, leading to both emotional and physical symptoms of 'fight or flight'.",
    indicators: ["Tachycardia (rapid heartbeat)", "Shallow thoracic breathing", "Cognitive rumination or 'racing thoughts'"],
    recommendations: ["Controlled diaphragmatic breathing exercises (Box breathing)", "Systematic muscle relaxation starting from extremities", "Limiting stimulant intake (caffeine/nicotine)"],
    risks: ["If symptoms lead to a persistent inability to function, professional psychiatric consult is recommended."]
  },
  fatigue: {
    analysis: "Significant energy depletion reported. Chronic fatigue can be multifactorial, involving sleep quality, nutritional balance (anemia/vitamin deficiency), or endocrine function.",
    indicators: ["Persistent lethargy despite rest", "Cognitive 'fog' or reduced focus", "Muscle weakness during daily tasks"],
    recommendations: ["Scheduling blood screening for Iron, Vitamin D, and B12", "Optimizing sleep architecture (cold/dark/quiet environment)", "Light physical activity to jumpstart metabolic energy"],
    risks: ["Sudden profound fatigue accompanied by chest pain or shortness of breath is a medical emergency."]
  },
};

const defaultAnalysis = {
  analysis: "I am analyzing your query through our clinical knowledge framework. While several factors could be involved, I am providing a general health analysis based on the information provided.",
  indicators: ["General health symptoms", "Vague discomfort", "Lifestyle-related factors"],
  recommendations: ["Consult with your primary care physician", "Maintain a detailed symptom log", "Focus on core wellness: sleep, hydration, and nutrition"],
  risks: ["Always seek professional medical advice for persistent symptoms."]
};

function processQuery(prompt: string) {
  const lower = prompt.toLowerCase();
  
  // Find keyword
  const keywords = Object.keys(healthContexts);
  const matched = keywords.find(k => lower.includes(k)) || 
                  (lower.includes("head") ? "headache" : null) ||
                  (lower.includes("hurt") && lower.includes("stomach") ? "stomach" : null) ||
                  (lower.includes("tired") ? "fatigue" : null);

  const context = matched ? healthContexts[matched] : defaultAnalysis;
  const subject = matched ? matched.charAt(0).toUpperCase() + matched.slice(1) : "General Analysis";

  let response = `## SYMPTAX AI HEALTH ANALYSIS: ${subject.toUpperCase()}\n\n`;
  response += `### 🧠 AGENT ANALYSIS\n${context.analysis}\n\n`;
  
  response += `### 🔍 KEY INDICATORS\n`;
  context.indicators.forEach(i => response += `• ${i}\n`);
  
  response += `\n### ✅ STRATEGIC RECOMMENDATIONS\n`;
  context.recommendations.forEach(r => response += `• ${r}\n`);
  
  response += `\n### ⚠️ CRITICAL RISKS\n`;
  context.risks.forEach(rk => response += `• ${rk}\n`);
  
  response += `\n---\n**SYMPTAX DISPATCH:** This analysis was generated by the SympTax AI Agent. It is for informational purposes and **NOT a medical diagnosis**. Please consult your doctor for clinical decisions.`;

  return response;
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ message: "Prompt is required" }, { status: 400 });
    }

    // Agentic "Thinking" delay
    const delay = 1500 + Math.random() * 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const response = processQuery(prompt);

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
