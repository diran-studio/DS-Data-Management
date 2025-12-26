
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { CitadelEvent, EventType } from "../types";

export const createAgent = (apiKey: string) => {
  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are the Citadel AI Agent, a helpful assistant for a local-first personal knowledge base.
    You help users organize their "Events" (files, notes, receipts).
    Everything is stored as an Event.
    
    You have access to the user's local events.
    Rules:
    - Never move or delete without asking for confirmation.
    - Be concise.
    - If you don't know something, say you don't know.
    - Suggest useful tags and folder structures.
  `;

  return {
    async chat(message: string, history: {role: string, parts: any}[], events: CitadelEvent[]) {
      const prompt = `
        Current context: There are ${events.length} events in the database.
        User message: "${message}"
        
        Recent events overview: ${JSON.stringify(events.slice(0, 5).map(e => ({id: e.id, title: e.title, type: e.event_type})))}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return response.text;
    },

    async suggestClassification(fileInfo: {name: string, type: string}) {
      const prompt = `Analyze this file: ${fileInfo.name} (${fileInfo.type}). 
      Suggest an Event Type (receipt, essay, note, quote, identity, correspondence, media, other), 
      a catchy title, and a 1-sentence summary. 
      Return JSON only.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["type", "title", "summary", "tags"]
          }
        }
      });
      
      try {
        return JSON.parse(response.text || "{}");
      } catch {
        return null;
      }
    }
  };
};
