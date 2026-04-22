import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface AnalysisResult {
  score: number; // 0-100
  feedback: {
    positive: string[];
    toImprove: string[];
  };
  transcript: string;
  advice: string;
}

export async function analyzePerformance(audioBase64: string, mimeType: string, context: string): Promise<AnalysisResult> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Tu es un coach expert en art oratoire et en éloquence. 
    Analyse cette performance audio. 
    Contexte de l'exercice : ${context}
    
    Porte une attention particulière à :
    1. La clarté de la diction (articulation).
    2. Le rythme et le débit (ni trop lent, ni trop rapide).
    3. L'intonation et l'énergie.
    4. Le contenu (si c'est de l'improvisation).
    
    Réponds au format JSON strict avec la structure suivante :
    {
      "score": nombre entre 0 et 100,
      "feedback": {
        "positive": ["point fort 1", "point fort 2"],
        "toImprove": ["point à améliorer 1", "point à améliorer 2"]
      },
      "transcript": "Transcription fidèle de ce qui a été dit",
      "advice": "Un conseil personnalisé pour progresser"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: audioBase64,
              },
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      score: result.score || 0,
      feedback: result.feedback || { positive: [], toImprove: [] },
      transcript: result.transcript || "",
      advice: result.advice || "Continue ton entraînement pour voir des résultats !",
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Impossible d'analyser la performance pour le moment.");
  }
}
