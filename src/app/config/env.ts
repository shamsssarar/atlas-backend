import { z } from 'zod';
import dotenv from 'dotenv';
import handleZodError from '../errorHelpers/handleZodError';

// Load environment variables from .env file
dotenv.config();

// Define the schema for our environment variables
const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url(),
  FIREBASE_PROJECT_ID: z.string().min(1, 'Firebase Project ID is required'),
  FIREBASE_CLIENT_EMAIL: z.string().email('Invalid Firebase Client Email'),
  FIREBASE_PRIVATE_KEY: z.string().min(1, 'Firebase Private Key is required'),
  GEMINI_API_KEY: z.string().min(1, 'Gemini API Key is required'),
  REDIS_URL: z.string().url('Invalid Redis URL').optional(),
});

// Parse the environment variables against the schema
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  const formattedError = handleZodError(_env.error);
  console.error('❌ Invalid environment variables:');
  formattedError.errorMessages.forEach((err) => {
    console.error(`  - ${err.path}: ${err.message}`);
  });
  process.exit(1);
}

// Export the validated and typed object
export const config = _env.data;
