import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

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
      tools: [{ googleSearch: {} }],
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse trending news", e);
    return [];
  }
};

export const analyzeNews = async (query: string): Promise<NewsAnalysis> => {
  const prompt = `
    Search for news about: "${query}".
    Find at least 5 different mainstream media reports on this topic.
    If fewer than 5 are found, explain why.
    
    IMPORTANT: You MUST use the actual URLs found in the search results. DO NOT hallucinate or make up URLs.
    
    For each source, extract:
    1. The title of the report.
    2. The REAL URL of the report from search results.
    3. The name of the media outlet.
    4. A brief summary of their coverage.
    5. Their unique perspective or angle on the story.
    
    Also, synthesize the "Core Facts" that are consistent across all sources.
    Identify any "Potential Bias Warnings" or framing differences between the outlets.
    
    Return the result in JSON format.
  `;

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

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    console.error("Failed to parse news analysis", e);
    throw new Error("Analysis failed");
  }
};
