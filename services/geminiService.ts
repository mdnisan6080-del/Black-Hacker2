import { GoogleGenAI, Type, Chat, GenerateContentResponse, Modality } from "@google/genai";
import type { Question, ChatMessage } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. App will not function correctly.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const questionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      correctAnswerIndex: { type: Type.INTEGER },
      explanation: { type: Type.STRING },
    },
    required: ['question', 'options', 'correctAnswerIndex', 'explanation'],
  },
};

export async function generateQuizQuestions(subject: string): Promise<Question[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: `Generate 5 unique, engaging multiple-choice questions about ${subject} for a high school student. Ensure one correct answer and three plausible but incorrect distractors. Provide a brief explanation for the correct answer.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: questionSchema,
      },
    });

    const parsedResponse = JSON.parse(response.text);
    return parsedResponse as Question[];
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    // Return mock data on error to allow UI to function
    return [
      {
        question: `What is the capital of France? (Error fallback)`,
        options: ["London", "Berlin", "Paris", "Madrid"],
        correctAnswerIndex: 2,
        explanation: "Paris is the capital and most populous city of France."
      }
    ];
  }
}

let chat: Chat | null = null;
function getChatInstance(): Chat {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: [],
            config: {
                systemInstruction: 'You are Quizy, a friendly and encouraging AI assistant for a learning app. Keep your answers concise and positive.',
            }
        });
    }
    return chat;
}

export async function getChatResponseStream(history: ChatMessage[], newMessage: string) {
    const chatInstance = getChatInstance();
    // In a real app, you might want to sync history more robustly.
    // For this example, we'll just use the instance's internal history after the first message.
    return chatInstance.sendMessageStream({ message: newMessage });
}


export async function generateSpeech(text: string): Promise<string | null> {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                // FIX: Use Modality.AUDIO enum instead of magic string 'AUDIO' per coding guidelines.
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ?? null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
}

export async function generateRewardImage(prompt: string): Promise<string | null> {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });
        const base64ImageBytes = response.generatedImages[0]?.image.imageBytes;
        return base64ImageBytes ? `data:image/png;base64,${base64ImageBytes}` : null;
    } catch (error) {
        console.error("Error generating reward image:", error);
        return null;
    }
}
