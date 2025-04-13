import { Page } from 'puppeteer-core';

export type ChatMessage = {
  text: string;
  sender: string;
  timestamp: Date;
  isCommand: boolean;
};

export type CommandHandler = {
  canHandle(message: ChatMessage): boolean;
  handle(message: ChatMessage): Promise<void>;
};

export type BrowserConfig = {
  executablePath: string;
  userAgent: string;
  viewport: {
    width: number;
    height: number;
  };
  headless: boolean;
};

export type AIConfig = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      OPENAI_API_KEY: string;
      OPENAI_MODEL: string;
      OPENAI_BASE_URL?: string;
      USER_AGENT: string;
      CHROMIUM_PATH: string;
      SESSION: string;
      CF_CLEARANCE: string;
    }
  }
}

export interface ChatListener {
  subscribe(callback: (message: ChatMessage) => Promise<void>): void;
  startListening(): Promise<void>;
}