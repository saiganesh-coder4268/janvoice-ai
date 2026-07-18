import { NextResponse } from "next/server";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Complaint, AIAnalysis, ComplaintSeverity } from "@/types";
import gvmcWards from "@/lib/data/gvmc-wards.json";

export const maxDuration = 60; // Prevent 10s timeouts on Vercel hobby plan

// Helper function to call Gemini API with JSON parsing and retry logic
async function callGemini(prompt: string, retries = 1): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Strip markdown fences
    text = text.replace(/```json|```/g, '').trim();
    
    return JSON.parse(text);
  } catch (error) {
    if (retries > 0) {
      console.warn("Gemini JSON parse failed, retrying...", error);
      return callGemini(prompt, retries - 1);
    }
    throw error;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { description, location, createdBy } = body;

    if (!description || !location || !createdBy) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Get Ward Context
    const wardData = gvmcWards.find(w => w.wardNumber === location.ward);
    const densityTier = wardData ? wardData.densityTier : "Medium";
    const wardName = wardData ? wardData.wardName : "Unknown";

    // 2. Call Gemini for Classification & Scoring
    const classificationPrompt = `
You are an advanced government civic complaint analysis system. Analyze the following 
citizen submission from Visakhapatnam and calculate a Priority Score (0-100) based on severity, population density, and potential public impact.

Context Information:
- Submission text: "${description}"
- Ward: ${location.ward} (${wardName})
- Population Density Tier: ${densityTier}

Return ONLY valid JSON in the exact structure below:
{
  "detectedLanguage": "ISO 639-1 code",
  "translatedText": "English translation if not already English, else the original text",
  "title": "concise 5-8 word title",
  "summary": "1-2 sentence plain-language summary",
  "keywords": ["array", "of", "keywords"],
  "category": "roads" | "water" | "health" | "sanitation" | "safety" | "electricity" | "other",
  "severity": "critical" | "high" | "medium" | "low",
  "confidenceScore": <integer 0-100>,
  "priorityScore": <integer 0-100>,
  "priorityReasoning": "<one sentence explaining why this priority score was assigned based on the context>"
}
`;

    let aiResult;
    try {
      aiResult = await callGemini(classificationPrompt, 2); // 2 retries
    } catch (e: any) {
      console.error("AI Pipeline failed:", e);
      return NextResponse.json({ error: e.message || "AI Processing Failed. Did you set GEMINI_API_KEY in Vercel?" }, { status: 500 });
    }

    const totalPriorityScore = typeof aiResult.priorityScore === 'number' ? aiResult.priorityScore : 50;

    // 3. Save to Firestore
    const complaintRef = doc(collection(db, "complaints"));
    const complaintId = complaintRef.id;

    const newComplaint: Complaint = {
      id: complaintId,
      title: aiResult.title,
      description: description,
      originalLanguage: aiResult.detectedLanguage,
      translatedText: aiResult.translatedText,
      category: aiResult.category,
      severity: aiResult.severity,
      priorityScore: totalPriorityScore,
      status: "reported",
      location: location,
      imageURLs: body.imageURLs || [],
      voiceURL: null,
      createdBy: createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const newAIAnalysis: AIAnalysis = {
      complaintId: complaintId,
      summary: aiResult.summary,
      keywords: aiResult.keywords,
      duplicateOf: null,
      confidenceScore: aiResult.confidenceScore,
      recommendation: aiResult.priorityReasoning || "Pending automated clustering analysis",
      priorityBreakdown: {
        frequency: 0,
        severity: 0,
        infrastructure: 0,
        wardPopulationTier: 0,
        recurrence: 0,
      }
    };

    await setDoc(complaintRef, {
      ...newComplaint,
      createdAt: Timestamp.fromDate(newComplaint.createdAt),
      updatedAt: Timestamp.fromDate(newComplaint.updatedAt)
    });

    const aiAnalysisRef = doc(db, "aiAnalysis", complaintId);
    await setDoc(aiAnalysisRef, newAIAnalysis);

    return NextResponse.json({ success: true, complaintId, priorityScore: totalPriorityScore });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
