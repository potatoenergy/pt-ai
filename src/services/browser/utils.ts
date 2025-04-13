import { Page } from 'puppeteer-core';
import { logger } from '../../utils/logger';
import { CONFIG } from '../../config';

export class BrowserUtils {
  static async injectCookies(page: Page) {
    try {
      await page.setCookie(
        {
          name: 'session',
          value: CONFIG.SESSION.SESSION,
          domain: 'pony.town',
          path: '/',
          httpOnly: true,
          secure: true
        },
        {
          name: 'cf_clearance',
          value: CONFIG.SESSION.CF_CLEARANCE,
          domain: 'pony.town',
          path: '/',
          httpOnly: true,
          secure: true
        }
      );
      logger.info('Session cookies injected successfully');
    } catch (error) {
      logger.error('Failed to inject cookies:', error);
      throw error;
    }
  }

  static async waitForGameLoad(page: Page, timeout = 60000) {
    try {
      await page.waitForSelector('button[aria-haspopup="true"][dropdowntoggle][class="btn btn-lg btn-success text-truncate flex-grow-1"]', { timeout });
      logger.info('Play button found successfully');
    } catch (error) {
      logger.error('Play button not found:', error);
      throw error;
    }
  }

  static async clickPlayButton(page: Page) {
    try {
      const playButtonSelector = 'button[aria-haspopup="true"][dropdowntoggle][class="btn btn-lg btn-success text-truncate flex-grow-1"]';
      await page.waitForSelector(playButtonSelector, { visible: true, timeout: 10000 });
      await page.click(playButtonSelector);
      logger.info('Play button clicked successfully');
    } catch (error) {
      logger.error('Failed to click Play button:', error);
      throw error;
    }
  }
}
