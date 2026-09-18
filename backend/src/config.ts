import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CLIENT_ORIGIN: z.string().min(1).default("http://localhost:3000"),
  JWT_SECRET: z.string().min(10).optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error("Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join(".")}: ${issue.message}`);
  }
  process.exit(1);
}

const env = parsed.data;
const isProduction = env.NODE_ENV === "production";

if (!env.JWT_SECRET && isProduction) {
  console.error("JWT_SECRET is required in production");
  process.exit(1);
}

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

export const config = {
  nodeEnv: env.NODE_ENV,
  isProduction,
  port: env.PORT,
  clientOrigin: env.CLIENT_ORIGIN,
  isOriginAllowed: (origin: string) =>
    isProduction ? origin === env.CLIENT_ORIGIN : origin === env.CLIENT_ORIGIN || localOriginPattern.test(origin),
  jwtSecret: env.JWT_SECRET ?? "dev-secret-change-me",
};
