import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(req) {
  try {
    const { prompt, contextoCursos, historial, nombreUsuario } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const esPrimerMensaje = !historial || historial.length === 0;

    let promptFinal = prompt;
    
    if (contextoCursos) {
      promptFinal = `
        CONOCIMIENTO BASE (ÚNICA FUENTE DE VERDAD):
        ${contextoCursos}

        INSTRUCCIONES:
        Si el usuario no pregunta nada acerca de cursos, responde normal.
        Si pregunta por cursos, usa SOLO la lista de arriba, ponlos en forma de bullet list.
        
        PREGUNTA: ${prompt}
      `;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [
        ...historial, 
        {
          role: "user",
          parts: [{ text: promptFinal }]
        }
      ],
      config: {
        systemInstruction: `
          Eres el asistente oficial de Whirlpool Learning. 
          1. Solo puedes hablar de los cursos proporcionados en el contexto base. 
          2. No inventes cursos que no estén en la lista.
          3. Mantén un tono corporativo, profesional y amable.
          ${esPrimerMensaje ? `Saluda a ${nombreUsuario} usando solo su primer nombre y preséntate como Whirlpool AI solo una vez.` : "No te presentes de nuevo."}
        `
      }
    });

    const text = response.text;
    return NextResponse.json({ text_content: text });

  } catch (error) {
    console.error("Error en API:", error);
    return NextResponse.json({ error: "Error al generar contenido" }, { status: 500 });
  }
}