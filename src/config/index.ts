import dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { join } from 'path';
import { z } from 'zod';

const envConfig = dotenv.config({
  path: join(__dirname, '../../.env')
});
dotenvExpand.expand(envConfig);

const ConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  LANGUAGE: z.enum(['en', 'ru']).default('ru'),
  OPENAI_API_KEY: z.string().min(10),
  OPENAI_MODEL: z.string().default('gpt-3.5-turbo'),
  OPENAI_BASE_URL: z.string().url().optional(),
  OPENAI_TEMPERATURE: z.coerce.number().min(0).max(2).default(0.8),
  OPENAI_MAX_TOKENS: z.coerce.number().min(10).max(4000).default(150),
  PERSONALITY_NAME: z.string().default('MyBot'),
  PERSONALITY_TRAITS: z.string()
    .transform(s => s.split(',').map(t => t.trim().toLowerCase()))
    .default('friendly'),
  PERSONALITY_SPEECH_STYLE: z.string().optional(),
  RESPONSE_INTERVAL: z.coerce.number().min(30000).default(180000),
  MIN_DELAY: z.coerce.number().default(3000),
  CHAT_RESPONSE_ENABLED: z.coerce.boolean().default(false),
  CHAT_RESPONSE_PROBABILITY: z.coerce.number().min(0).max(1).default(0.2),
  MAX_MESSAGE_LENGTH: z.coerce.number().default(149),
  MAX_EMOTES_PER_MIN: z.coerce.number().default(5),
  USER_AGENT: z.string().default(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ),
  CHROMIUM_PATH: z.string(),
  SESSION: z.string(),
  CF_CLEARANCE: z.string().default(''),
  PROMPTS_GREETING: z.string().optional(),
  PROMPTS_IDLE: z.string().optional(),
  DEBUG_MODE: z.coerce.boolean().default(false)
});

export type AppConfig = z.infer<typeof ConfigSchema>;

export const CONFIG = ConfigSchema.parse({
  ...process.env,
  PERSONALITY_TRAITS: process.env.PERSONALITY_TRAITS || 'friendly'
});