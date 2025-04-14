import { Page } from 'puppeteer-core';
import { ChatHandler } from './base';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ResponseGenerator } from '../generator';
import { CONFIG } from '../../../config';
import { ChatHelper } from '../../../utils/helpers';

export class AdvancedChatHandler extends ChatHandler {
  static override priority = 100;
  private generator: ResponseGenerator;
  private lastResponseTime = 0;

  constructor(page: Page) {
    super(page);
    this.generator = new ResponseGenerator(page);
  }

  async shouldHandle(message: ChatMessage): Promise<boolean> {
    const interval = CONFIG.RESPONSE_INTERVAL;
    return (Date.now() - this.lastResponseTime) > interval;
  }

  async handle(message: ChatMessage): Promise<boolean> {
    try {
      const response = await this.generateIdleResponse();
      await this.sendResponse(response);
      this.lastResponseTime = Date.now();
      return true;
    } catch (error) {
      logger.error('Advanced handler error:', error);
      return false;
    }
  }

  private async generateIdleResponse(): Promise<string> {
    return this.generator.generate(
      "Generate environmental observation",
      "Initiate social interaction",
      CONFIG.PERSONALITY_NAME
    );
  }

  private async sendResponse(text: string): Promise<void> {
    await ChatHelper.sendMessage(this.page, text);
  }
}