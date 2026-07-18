import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { complaints } = await req.json();

    if (!complaints || !Array.isArray(complaints) || complaints.length === 0) {
      return NextResponse.json({ recommendations: [] }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key is not configured." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Format complaints for the prompt
    const complaintsSummary = complaints.map((c: any) => 
      `- Issue: ${c.title}\n  Category: ${c.category}\n  Priority: ${c.priorityScore}\n  Location: ${c.location?.address}`
    ).join('\n\n');

    const prompt = `
You are a strategic civic advisor to a Member of Parliament (MP) in Visakhapatnam, India.
Analyze the following recent civic complaints reported by citizens:

${complaintsSummary}

Identify the top 2 urgent patterns or systemic issues. Based on these patterns, provide 2 brief, actionable strategic recommendations for the MP to address them at a systemic level.
Output the response ONLY as a valid JSON array of strings (the recommendations). Do not use Markdown formatting or code blocks. Do NOT include phrases like "AI:" or "Recommendation:".
Example output:
["Work with the sanitation department to increase garbage pickup frequency in Zone 2.", "Allocate emergency funds for pothole repair on major arterial roads before monsoon season."]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Parse the JSON array. Handle potential markdown wrappers if the model ignores the instruction.
    let jsonStr = text;
    if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace("```json", "").replace(/```$/, "").trim();
    } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace("```", "").replace(/```$/, "").trim();
    }

    const recommendations = JSON.parse(jsonStr);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate recommendations" }, { status: 500 });
  }
}
