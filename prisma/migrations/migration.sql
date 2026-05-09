-- Create the vector extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS vector;

-- Create the HNSW index for lightning-fast similarity search using Cosine Distance
CREATE INDEX idx_document_embeddings_embedding ON document_embeddings USING hnsw (embedding vector_cosine_ops);