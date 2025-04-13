import dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { join } from 'path';

const envConfig = dotenv.config({
  path: join(__dirname, '../../.env')
});

dotenvExpand.expand(envConfig);

export const CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  AI: {
    API_KEY: process.env.OPENAI_API_KEY!,
    MODEL: process.env.OPENAI_MODEL!,
    BASE_URL: process.env.OPENAI_BASE_URL,
    MAX_TOKENS: 150,
    TEMPERATURE: 0.7
  },
  BROWSER: {
    USER_AGENT: process.env.USER_AGENT!,
    CHROMIUM_PATH: process.env.CHROMIUM_PATH!,
    VIEWPORT: null
  },
  SESSION: {
    CF_CLEARANCE: process.env.CF_CLEARANCE!,
    SESSION: process.env.SESSION!
  },
  BOT: {
    RESPONSE_INTERVAL: parseInt(process.env.RESPONSE_INTERVAL || '300000'),
    PERSONALITY: {
      NAME: process.env.PERSONALITY_NAME || 'Unknown',
      TRAITS: [process.env.RESPONSE_INTERVAL || 'адаптивный', 'наблюдательный', 'отзывчивый'],
      SPEECH_STYLE: process.env.PERSONALITY_SPEECH_STYLE || 'Используй контекст игры и реакцию на окружение'
    },
    PROMPTS: {
      TARGET_SELECTED: 'Обнаружен выбранный игрок: {name} 🎯',
      GREETING: process.env.PROMPTS_GREETING || 'Приветствую всех в Pony Town! 🦄',
      IDLE: process.env.PROMPTS_IDLE || 'Осматриваю окрестности... Вижу много интересного! 🌈'
    }
  }
};
