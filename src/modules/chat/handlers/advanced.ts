import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ResponseGenerator } from '../generator';
import { CONFIG } from '../../../config';

export class AdvancedChatHandler {
  private generator: ResponseGenerator;
  private lastResponseTime = 0;

  constructor(private page: Page) {
    this.generator = new ResponseGenerator(page);
  }

  async handleAdvancedBehavior(message: ChatMessage): Promise<boolean> {
    try {
      return await this.handleTimedResponse();
    } catch (error) {
      logger.error('Advanced handler error:', error);
      return false;
    }
  }

  private async handleTimedResponse(): Promise<boolean> {
    const interval = CONFIG.BOT.RESPONSE_INTERVAL;
    const now = Date.now();
    const shouldRespond = (now - this.lastResponseTime) > interval;

    if (shouldRespond) {
      try {
        const response = await this.generateIdleResponse();
        await this.sendResponse(response);
        this.lastResponseTime = now;
        return true;
      } catch (error) {
        logger.error('Timed response failed:', error);
      }
    }
    return false;
  }

  private async generateIdleResponse(): Promise<string> {
    const context = "Initiate organic social interaction";
    return this.generator.generate(
      "Generate environmental observation or social prompt", 
      context,
      CONFIG.BOT.PERSONALITY.NAME
    );
  }

  private async sendResponse(text: string): Promise<void> {
    await this.page.evaluate((text) => {
      const chat = document.querySelector('chat-box');
      if (chat) {
        const textarea = chat.querySelector('textarea[aria-label="Chat message"]') as HTMLTextAreaElement;
        const sendButton = chat.querySelector('button[title="Send message"]') as HTMLElement;
        if (textarea && sendButton) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          sendButton.click();
        }
      }
    }, text);
  }
}