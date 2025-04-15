import { Page } from 'puppeteer-core';
import { logger } from './logger';
import { CONFIG } from '../config';

export class ChatHelper {
  static async sendMessage(page: Page, text: string): Promise<void> {
    const SELECTORS = {
      CHAT_TOGGLE: 'chat-box ui-button[title="Toggle chat"] button',
      CHAT_INPUT: 'chat-box textarea[aria-label="Chat message"]',
      CHAT_BOX: 'chat-box .chat-box'
    };

    try {
      const isChatOpen = await page.evaluate((selector) => {
        const el = document.querySelector(selector);
        return el && !el.hasAttribute('hidden');
      }, SELECTORS.CHAT_BOX);

      if (!isChatOpen) {
        await page.click(SELECTORS.CHAT_TOGGLE);
        await page.waitForSelector(SELECTORS.CHAT_INPUT, {
          visible: true,
          timeout: 5000
        });
      }

      await page.evaluate((inputSelector) => {
        const input = document.querySelector(inputSelector) as HTMLTextAreaElement;
        if (input) input.value = '';
      }, SELECTORS.CHAT_INPUT);

      await page.type(SELECTORS.CHAT_INPUT, text, { delay: 50 });
      await page.keyboard.press('Enter');
      await new Promise(resolve => setTimeout(resolve, CONFIG.RESPONSE_DELAY));

      logger.info(`Message sent: "${text}"`);
    } catch (error) {
      logger.error(`Send error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}