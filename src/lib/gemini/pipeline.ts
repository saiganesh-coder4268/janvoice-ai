export async function analyzeComplaint(text: string) {
  console.log("Mocking Gemini analysis for:", text);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        detectedLanguage: "en",
        translatedText: text,
        title: text.substring(0, 30) + "...",
        summary: "Citizen reported an issue: " + text,
        keywords: ["issue", "complaint", "citizen"],
        category: "other",
        severity: "medium",
        confidenceScore: 85,
        priorityScore: 50
      });
    }, 1200);
  });
}