import { Page } from 'puppeteer-core';
import { ChatHandler } from './base';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ResponseGenerator } from '../generator';
import { CONFIG } from '../../../config';
import { ChatHelper } from '../../../utils/helpers';

export class ChatResponseHandler extends ChatHandler {
  static override priority = 800;
  private generator: ResponseGenerator;

  constructor(page: Page) {
    super(page);
    this.generator = new ResponseGenerator(page);
  }

  async shouldHandle(message: ChatMessage): Promise<boolean> {
    return CONFIG.CHAT_RESPONSE_ENABLED &&
      Math.random() < CONFIG.CHAT_RESPONSE_PROBABILITY;
  }

  async handle(message: ChatMessage): Promise<boolean> {
    try {
      const response = await this.generator.generate(
        message.text,
        `Respond to ${message.sender}`,
        message.sender
      );
      await ChatHelper.sendMessage(this.page, response);
      return true;
    } catch (error) {
      logger.error('Response error:', error);
      return false;
    }
  }
}