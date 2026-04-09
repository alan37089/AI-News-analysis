import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export interface NewsSource {
  title: string;
  url: string;
  outlet: string;
  summary: string;
  perspective: string;
}

export interface NewsAnalysis {
  topic: string;
  coreFacts: string[];
  sources: NewsSource[];
  biasWarnings: string[];
  foundCount: number;
}

export interface TrendingNews {
  title: string;
  description: string;
  category: string;
}

export const getTrendingNews = async (): Promise<TrendingNews[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "List 5 current trending global news topics. For each, provide a title, a brief description, and a category (e.g., Politics, Tech, Science).",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["title", "description", "category"],
          },
        },
      },
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Trending News Error:", e);
    return [];
  }
};

export const analyzeNews = async (query: string): Promise<NewsAnalysis> => {
  const prompt = `
    Search for news about: "${query}".
    Find at least 5 different mainstream media reports on this topic.
    Return the result in JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            coreFacts: { type: Type.ARRAY, items: { type: Type.STRING } },
            sources: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  url: { type: Type.STRING },
                  outlet: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  perspective: { type: Type.STRING },
                },
                required: ["title", "url", "outlet", "summary", "perspective"],
              },
            },
            biasWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
            foundCount: { type: Type.NUMBER },
          },
          required: ["topic", "coreFacts", "sources", "biasWarnings", "foundCount"],
        },
        tools: [{ googleSearch: {} }],
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Analysis Error:", e);
    throw e;
  }
};
