import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const getGeminiVisionModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

export const getGeminiTextModel = () => {
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};
