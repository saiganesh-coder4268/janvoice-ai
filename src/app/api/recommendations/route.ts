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

    // Pre-processing
    const openComplaints = complaints.filter((c: any) => c.status !== 'resolved');

    const issuesByWard = openComplaints.reduce((acc: any, c: any) => {
      const ward = c.location?.ward || 'Unknown';
      acc[ward] = (acc[ward] || 0) + 1;
      return acc;
    }, {});
    const wardSummary = Object.entries(issuesByWard).map(([ward, count]) => `Ward ${ward}: ${count} open issues`).join('\n');

    const clusterMap = openComplaints.reduce((acc: any, c: any) => {
      const key = `Ward ${c.location?.ward} - ${c.category}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const clusters = Object.entries(clusterMap).filter(([k, v]: any) => v >= 2).map(([k, v]) => `${k} (${v} reports)`).join('\n'); // using 2+ for testing since 3 might be rare
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentComplaints = complaints.filter((c: any) => {
      const cDate = c.createdAt?.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
      return cDate > sevenDaysAgo;
    });
    const categoriesCount = recentComplaints.reduce((acc: any, c: any) => {
      acc[c.category] = (acc[c.category] || 0) + 1;
      return acc;
    }, {});
    const top3Categories = Object.entries(categoriesCount)
      .sort((a: any, b: any) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, count]) => `${cat}: ${count} reports`)
      .join('\n');

    const prompt = `
You are a strategic civic advisor to a Member of Parliament (MP) in Visakhapatnam, India.
Analyze the following aggregated civic complaint data and provide exactly 2 brief, highly-specific, and actionable strategic recommendations.

**DATA SUMMARY:**
Open Issues by Ward:
${wardSummary || "None"}

Top Categories (Last 7 Days):
${top3Categories || "None"}

Hotspot Clusters (Multiple issues in same ward):
${clusters || "None"}

**INSTRUCTIONS:**
- Identify the top 2 most critical patterns.
- Your recommendations MUST cite specific numbers and specific Ward names based strictly on the data above.
- Do NOT output generic sentences like "Work with sanitation crews". Tell the MP exactly what to do and where.
- Output the response ONLY as a valid JSON array of strings (the recommendations). Do not use Markdown formatting or code blocks.
- Example output:
  ["3 pothole reports clustered in Ward 12 in the last 7 days requires immediate emergency dispatch to the area.", "Ward 5 currently has 10 open sanitation issues; recommend auditing the local sanitation contractor for that zone."]
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
