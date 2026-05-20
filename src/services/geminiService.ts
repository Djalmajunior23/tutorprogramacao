import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  explainError: async (code: string, error: string) => {
    const prompt = `Como um tutor de programação didático, explique por que este pseudocódigo VisuAlg está falhando:
    
    CÓDIGO:
    ${code}
    
    ERRO RELATADO:
    ${error}
    
    Dê uma explicação amigável, foque na lógica e dê uma pequena dica de como corrigir, sem dar a resposta completa se possível.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  },

  askTutor: async (question: string, context?: string) => {
    const prompt = `Você é o "Tutor I.D.E.A", um guia especializado em ensinar lógica de programação para iniciantes usando Pseudocódigo.
    Seja motivador, use analogias do mundo real e incentive o pensamento computacional.
    
    CONTEXTO ATUAL (Módulo/Código):
    ${context || 'Início da jornada'}
    
    PERGUNTA DO ALUNO:
    ${question}
    
    Responda de forma concisa e pedagógica.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  }
};
