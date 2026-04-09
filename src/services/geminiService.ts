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
  isFallback?: boolean;
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
      contents: "List 5 current trending global news topics. For each, provide a title, a brief description, and a category (e.g., Politics, Tech, Science). Use your internal knowledge, do not use search tools for this request.",
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
  const schema = {
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
  };

  const prompt = `
    Search for news about: "${query}".
    Find at least 5 different mainstream media reports on this topic.
    Return the result in JSON format.
  `;

  try {
    // Attempt 1: With Google Search
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        tools: [{ googleSearch: {} }],
      },
    });
    return JSON.parse(response.text || "{}");
  } catch (e: any) {
    const errorMsg = e?.message || String(e);
    console.error("Search Analysis Error:", e);

    // If it's a quota error (429), attempt fallback without search
    if (errorMsg.includes("429") || errorMsg.includes("quota")) {
      console.warn("Quota exceeded, falling back to internal knowledge...");
      try {
        const fallbackPrompt = `
          Provide an analysis based on your internal knowledge about: "${query}".
          Since real-time search is currently unavailable, provide the most recent facts you know.
          Return the result in JSON format.
        `;
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: fallbackPrompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        });
        const result = JSON.parse(fallbackResponse.text || "{}");
        return { ...result, isFallback: true };
      } catch (fallbackError) {
        console.error("Fallback Analysis Error:", fallbackError);
        throw e; // Throw the original quota error if fallback also fails
      }
    }
    throw e;
  }
};
