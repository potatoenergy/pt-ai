import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ResponseGenerator } from '../generator';
import { CONFIG } from '../../../config';
import { ChatHelper } from '../../../utils/helpers';

export class ChatResponseHandler {
  private generator: ResponseGenerator;

  constructor(private page: Page) {
    this.generator = new ResponseGenerator(page);
  }

  async handle(message: ChatMessage): Promise<boolean> {
    if (!CONFIG.BOT.CHAT_RESPONSE.ENABLED) return false;
    if (Math.random() >= CONFIG.BOT.CHAT_RESPONSE.PROBABILITY) return false;

    try {
      const response = await this.generator.generate(
        message.text,
        `Respond to ${message.sender}'s message`,
        message.sender
      );
      
      await ChatHelper.sendMessage(this.page, response);
      return true;
    } catch (error) {
      logger.error('Chat response error:', error);
      return false;
    }
  }
}