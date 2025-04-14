import { Page } from 'puppeteer-core';
import { logger } from '../../utils/logger';
import { CONFIG } from '../../config';

export class BrowserUtils {
  static async injectCookies(page: Page): Promise<void> {
    const cookies = [
      {
        name: 'session',
        value: CONFIG.SESSION,
        domain: 'pony.town',
        path: '/',
        httpOnly: true,
        secure: true
      },
      {
        name: 'cf_clearance',
        value: CONFIG.CF_CLEARANCE,
        domain: 'pony.town',
        path: '/',
        httpOnly: true,
        secure: true
      }
    ];

    try {
      await page.setCookie(...cookies.filter(c => c.value.trim() !== ''));
      logger.info(`Injected cookies: ${cookies.map(c => c.name).join(', ')}`);
    } catch (error) {
      logger.error('Cookie injection failed:', error);
      throw new Error('Failed to set cookies');
    }
  }

  static async waitForGameLoad(page: Page, timeout = 60000): Promise<void> {
    const selector = 'button[aria-haspopup="true"][dropdowntoggle].btn-success';
    try {
      await page.waitForSelector(selector, { timeout });
      logger.info('Game interface loaded successfully');
    } catch (error) {
      logger.error('Game load timeout - selector not found:', selector);
      throw new Error('Game loading failed');
    }
  }

  static async clickPlayButton(page: Page): Promise<void> {
    const selector = 'button[aria-haspopup="true"][dropdowntoggle].btn-success';
    try {
      await page.waitForSelector(selector, { visible: true, timeout: 15000 });
      await page.click(selector);
      logger.info('Play button clicked successfully');
      await new Promise(resolve => setTimeout(resolve, 3000));
    } catch (error) {
      logger.error('Failed to click play button:', error);
      throw new Error('Play button interaction failed');
    }
  }
}