import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { AIClient } from '../../../services/ai/client';
import { CONFIG } from '../../../config';
import { ChatHelper } from '../../../utils/helpers';

export class ChatResponseHandler {
  private aiClient: AIClient;

  constructor(private page: Page) {
    this.aiClient = new AIClient(page);
  }

  async handle(message: ChatMessage): Promise<boolean> {
    if (!CONFIG.BOT.CHAT_RESPONSE.ENABLED) {
      logger.debug('Chat response handler is disabled');
      return false;
    }

    const shouldRespond = Math.random() < CONFIG.BOT.CHAT_RESPONSE.PROBABILITY;
    if (!shouldRespond) {
      logger.debug(`Skipping response due to probability check (probability: ${CONFIG.BOT.CHAT_RESPONSE.PROBABILITY})`);
      return false;
    }

    try {
      const response = await this.generateResponse(message.text, message.sender);
      if (response) {
        await ChatHelper.sendMessage(this.page, response);
        logger.info(`Responded to chat message from: ${message.sender}`);
        return true;
      }
    } catch (error) {
      logger.error('Chat response handling error:', error);
    }
    return false;
  }

  private async generateResponse(text: string, sender: string): Promise<string | null> {
    const prompt = [
      `${CONFIG.BOT.PERSONALITY.NAME} (${CONFIG.BOT.PERSONALITY.TRAITS.join(', ')})`,
      `Language: ${CONFIG.BOT.LANGUAGE}`,
      `Style: ${CONFIG.BOT.PERSONALITY.SPEECH_STYLE}`,
      `Core directives:`,
      `- Roleplay as in-game character`,
      `- Use ${CONFIG.BOT.LANGUAGE} language`,
      `- Respond to environment interactions`,
      `- Keep responses 1-2 sentences (max 149 chars)`,
      `- Use gaming slang and emojis`,
      `Message: "${text}"`,
      `Generate in-character response:`
    ].join('\n');

    try {
      const response = await this.aiClient.generateResponse(prompt, sender);
      return response || null;
    } catch (error) {
      logger.error('Failed to generate chat response:', error);
      return null;
    }
  }
}
