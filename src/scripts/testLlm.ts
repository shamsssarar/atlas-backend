import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const context = "Protocol for Lower Back Pain: If an athlete reports lower back pain or discomfort during Barbell Squats, the coach recommends substituting them with Bulgarian Split Squats. This reduces spinal loading while maintaining high leg drive and hypertrophy stimulus.";
  const question = "My lower back is really hurting on these squats today, what should I do?";

  const prompt = `
    You are an elite AI assistant trained exclusively on the proprietary methodology of this specific coach.
    Answer the athlete's question using ONLY the provided Coach Context below. 
    If the context does not contain the answer, say "I don't have enough context from your coach to answer that, but I will flag this for them to review." Do not attempt to guess or use outside knowledge.

    Coach Context:
    ${context}

    Athlete Question:
    ${question}
  `;

  console.log("Generating response...");
  const result = await model.generateContent(prompt);
  console.log("Response:", result.response.text());
}

main().catch(console.error);
