import Groq from "groq-sdk";

let groq = null;

export function getGroq() {
  if (!groq) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn(
        "GROQ_API_KEY is not set; Groq AI calls will fail until configured."
      );
    }
    groq = new Groq({ apiKey });
  }
  return groq;
}

/** Override with GROQ_MODEL in .env (e.g. llama-3.3-70b-versatile). */
export function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}
