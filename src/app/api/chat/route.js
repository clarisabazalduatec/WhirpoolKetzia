import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";


const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        {
          role: "user",
          parts: [{ text: `Eres un asistente de Whirlpool Learning. ${prompt}` }]
        }
      ],
      config: {
        systemInstruction: "Responde de forma breve y profesional en español."
      }
    });

    const text = response.text;

    return NextResponse.json({ text_content: text });

  } catch (error) {
    console.error("Error con @google/genai:", error);
    return NextResponse.json({ 
      error: "Error al generar contenido", 
      details: error.message 
    }, { status: 500 });
  }
}