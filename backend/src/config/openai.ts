import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY || "your-gemini-api-key-here";

export const openai = new OpenAI({
    apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.includes("your-gemini-api-key")) {
    console.warn("⚠️  Gemini API Key not configured — AI features will not work");
}
