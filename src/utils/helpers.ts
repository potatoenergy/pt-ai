import { Page } from 'puppeteer-core';
import { ChatMessage } from '../types';
import { logger } from '../utils/logger';

export class ChatHelper {
  static async sendMessage(page: Page, text: string): Promise<void> {
    try {
      const isChatOpen = await page.evaluate(() => {
        const chatBox = document.querySelector('chat-box > div.chat-box');
        return chatBox && !chatBox.hasAttribute('hidden');
      });

      if (!isChatOpen) {
        await page.click('chat-box ui-button[title="Toggle chat"] button');
        await page.waitForSelector('chat-box > div.chat-box:not([hidden])', { timeout: 10000 });
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }

      const textareaSelector = 'chat-box textarea[aria-label="Chat message"]';
      await page.waitForSelector(textareaSelector, { visible: true, timeout: 15000 });

      await page.evaluate((selector: string) => {
        const textarea = document.querySelector(selector) as HTMLTextAreaElement;
        if (textarea) textarea.value = '';
      }, textareaSelector);

      for (const char of text) {
        await page.type(textareaSelector, char, { delay: Math.random() * 80 + 40 });
        await new Promise((resolve) => setTimeout(resolve, Math.random() * 150));
      }

      const sendButtonSelector = 'chat-box ui-button[title="Send message (hold Shift to send without closing input)"] button';
      await page.waitForSelector(sendButtonSelector, {
        visible: true,
        timeout: 30000
      });

      await page.waitForFunction((selector: string) => {
        const button = document.querySelector(selector) as HTMLElement;
        return button &&
          button.offsetWidth > 0 &&
          !button.hasAttribute('disabled');
      }, { timeout: 15000 }, sendButtonSelector);

      await page.hover(sendButtonSelector);
      await new Promise((resolve) => setTimeout(resolve, 500 + Math.random() * 300));
      await page.click(sendButtonSelector);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      logger.info(`Message sent: ${text}`);
    } catch (error) {
      logger.error(`Failed to send message: ${error}`);
      throw error;
    }
  }

  static parseMessage(element: Element): ChatMessage {
    return {
      sender: element.querySelector('.chat-line-name-content')?.textContent?.trim() || 'Unknown',
      text: element.querySelector('.chat-line-message')?.textContent?.trim() || '',
      timestamp: new Date(),
      isCommand: false
    };
  }
}