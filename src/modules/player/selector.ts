import { Page } from 'puppeteer-core';
import { logger } from '../../utils/logger';

export class PlayerSelector {
  constructor(private page: Page) { }

  async getSelectedPlayerName(): Promise<string | null> {
    try {
      return await this.page.evaluate(() => {
        const ponyBox = document.querySelector('pony-box#pony-box');
        if (!ponyBox) return null;

        const nameElement = ponyBox.querySelector('.pony-box-name-text');
        if (!nameElement) return null;

        return Array.from(nameElement.childNodes)
          .filter(n => n.nodeType === Node.TEXT_NODE)
          .map(n => n.textContent?.trim() || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
      });
    } catch (error) {
      logger.error('Error detecting selected player:', error);
      return null;
    }
  }

  async isAnyPlayerSelected(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return !!document.querySelector('pony-box#pony-box:not([hidden])');
    });
  }
}