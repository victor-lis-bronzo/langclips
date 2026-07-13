import path from "path";
import dotenv from "dotenv";
import { z } from "zod";

// Carrega o arquivo .env resolvendo o caminho relativo ao diretório atual do processo
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const envSchema = z.object({
  // Cloudflare R2 / Storage
  STORAGE_ENDPOINT: z.string().url(),
  STORAGE_REGION: z.string().default("auto"),
  STORAGE_ACCESS_KEY_ID: z.string().min(1),
  STORAGE_SECRET_ACCESS_KEY: z.string().min(1),
  STORAGE_FORCE_PATH_STYLE: z
    .string()
    .transform((v) => v === "true")
    .default(true),
  STORAGE_BUCKET_NAME: z.string().min(1),

  // Redis
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),

  // Groq
  GROQ_API_KEY: z.string().min(1, "A chave da Groq é obrigatória"),

  // General
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Variáveis de ambiente inválidas:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
