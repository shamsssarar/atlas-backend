import { DocumentEmbeddingService } from "../app/modules/aiInsight/documentEmbedding.service";
import prisma from "../shared/prisma";

async function main() {
  const coach = await prisma.user.findFirst({
    where: { role: "COACH" },
  });

  if (!coach) {
    console.error("No Coach found.");
    process.exit(1);
  }

  console.log(`Testing search for Coach ID: ${coach.id}`);
  
  const question = "My lower back is really hurting on these squats today, what should I do?";
  
  const similarDocs = await DocumentEmbeddingService.searchSimilarDocuments(
    question,
    "COACH_RULE",
    coach.id,
    3,
  );

  console.log("Search Results:");
  console.log(JSON.stringify(similarDocs, null, 2));
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
