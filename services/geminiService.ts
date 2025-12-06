
import { GoogleGenAI, Type } from "@google/genai";
import { SEOData } from '../types';

// FIX: Initialize GoogleGenAI directly with the environment variable as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeSEO = async (title: string, content: string): Promise<SEOData> => {
  try {
    const prompt = `Analyze the following article for SEO.
    Title: ${title}
    Content: ${content.substring(0, 3000)}...

    Return a JSON object with:
    - score: A number between 0-100 based on readability, keyword usage, and structure.
    - keywords: Array of top 5 extracted keywords.
    - suggestions: Array of 3 specific actionable improvements.
    - metaDescription: A concise 150-char meta description.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
            metaDescription: { type: Type.STRING },
          },
          required: ["score", "keywords", "suggestions", "metaDescription"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as SEOData;

  } catch (error) {
    console.error("SEO Analysis failed:", error);
    return {
      score: 0,
      keywords: [],
      suggestions: ["AI Service unavailable. Check API Key."],
      metaDescription: ""
    };
  }
};

export const generateArticleImage = async (prompt: string): Promise<string | null> => {
  try {
    // Note: Using gemini-2.5-flash-image for generation as per guidance, 
    // although normally Imagen models are specialized for this.
    // If the key doesn't support image generation on this model tier, we fallback gracefully in UI.
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', 
      contents: {
        parts: [{ text: `Generate a photorealistic, artistic editorial cover image for an article about: ${prompt}` }]
      }
    });

    // Check for inline data in the response parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Image generation failed:", error);
    return null;
  }
};

export const proofreadContent = async (content: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Proofread and improve the following text for an editorial magazine. Make it engaging, correct grammar, and improve flow. Keep HTML/Markdown formatting if present. \n\n Text: ${content}`,
    });
    return response.text || content;
  } catch (error) {
    console.error("Proofreading failed", error);
    return content;
  }
};
