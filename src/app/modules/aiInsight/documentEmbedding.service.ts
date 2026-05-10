import { DocumentEmbedding } from "@prisma/client";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "../../../shared/prisma";
import { AppError } from "../../errorHelpers/AppError";

// Initialize the Google Generative AI client (per your instructions using process.env)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

export interface AddDocumentChunkPayload {
  chunkKey: string;
  sourceType: string;
  sourceId: string;
  content: string;
  metadata?: any;
}

export interface SimilaritySearchResult {
  id: string;
  content: string;
  similarity: number;
}

const generateEmbedding = async (text: string): Promise<number[]> => {
  try {
    const result = await model.embedContent(text);
    return result.embedding.values.slice(0, 768);
  } catch (error: any) {
    throw new AppError(
      500,
      `Failed to generate embedding: ${error.message || "Unknown GenAI Error"}`,
    );
  }
};

const addDocumentChunk = async (
  payload: AddDocumentChunkPayload,
): Promise<void> => {
  try {
    // 1. Generate the 768-dimensional float array via Gemini
    const embedding = await generateEmbedding(payload.content);

    // 2. Format it exactly how PostgreSQL expects a vector string
    const vectorString = `[${embedding.join(",")}]`;
    const newId = crypto.randomUUID(); // Generate ID in Node

    // 3. Use Raw SQL to guarantee the vector array is written to the database
    await prisma.$executeRaw`
      INSERT INTO document_embeddings (
        "id", 
        "chunkKey", 
        "sourceType", 
        "sourceId", 
        "content", 
        "metadata", 
        "embedding", 
        "updatedAt"
      )
      VALUES (
        ${newId}, 
        ${payload.chunkKey}, 
        ${payload.sourceType}, 
        ${payload.sourceId}, 
        ${payload.content}, 
        ${payload.metadata ? JSON.stringify(payload.metadata) : null}::jsonb, 
        ${vectorString}::vector, 
        NOW()
      )
    `;
  } catch (error: any) {
    throw new AppError(
      500,
      `Failed to ingest document chunk: ${error.message}`,
    );
  }
};

const searchSimilarDocuments = async (
  queryText: string,
  sourceType: string,
  sourceId: string,
  limit: number = 3,
): Promise<SimilaritySearchResult[]> => {
  try {
    // 1. Generate embedding vector for the search query
    const embedding = await generateEmbedding(queryText);
    const vectorString = `[${embedding.join(",")}]`;

    // 2. Perform Bulletproof Raw SQL search
    // We use <=> which calculates cosine distance. Cosine similarity is (1 - cosine_distance).
    return await prisma.$queryRaw<SimilaritySearchResult[]>`
      SELECT 
        id, 
        content, 
        1 - (embedding <=> ${vectorString}::vector) AS similarity
      FROM document_embeddings
      WHERE "sourceType" = ${sourceType}
        AND "sourceId" = ${sourceId}
        AND "isDeleted" = false
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `;
  } catch (error: any) {
    throw new AppError(
      500,
      `Failed to perform similarity search: ${error.message}`,
    );
  }
};

export const DocumentEmbeddingService = {
  generateEmbedding,
  addDocumentChunk,
  searchSimilarDocuments,
};
