import { DocumentEmbeddingService } from "../app/modules/aiInsight/documentEmbedding.service";
import prisma from "../shared/prisma";
import crypto from "crypto";

async function main() {
  console.log("Starting seed script...");

  // Get the dummy coach
  const coach = await prisma.user.findFirst({
    where: { role: "COACH" },
  });

  if (!coach) {
    console.error("No Coach found in the database. Please create a dummy coach first.");
    process.exit(1);
  }

  console.log(`Found Coach: ${coach.email} (ID: ${coach.id})`);

  const content = "Protocol for Lower Back Pain: If an athlete reports lower back pain or discomfort during Barbell Squats, the coach recommends substituting them with Bulgarian Split Squats. This reduces spinal loading while maintaining high leg drive and hypertrophy stimulus.";

  console.log("Generating and saving embedding...");
  
  await DocumentEmbeddingService.addDocumentChunk({
    chunkKey: `coach-rule-${crypto.randomUUID()}`,
    sourceType: "COACH_RULE",
    sourceId: coach.id,
    content: content,
    metadata: { ruleType: "Injury Protocol", tags: ["squat", "lower back pain"] }
  });

  console.log("✅ Successfully saved the embedding to PostgreSQL pgvector!");
}

main()
  .catch((e) => {
    console.error("Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
