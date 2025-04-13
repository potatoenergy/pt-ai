import { Page } from 'puppeteer-core';
import { logger } from './logger';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';

export class ErrorHandler {
  static async handle(page: Page, error: Error, context: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = join(process.cwd(), 'logs/screenshots', `error-${timestamp}.png`);

    ensureDirSync(join(process.cwd(), 'logs/screenshots'));

    try {
      await page.screenshot({ path: screenshotPath });
      logger.error(`Screenshot saved: ${screenshotPath}`);
    } catch (screenshotError) {
      logger.error('Failed to take screenshot:', screenshotError);
    }

    logger.error(`${context}: ${error.message}`);
  }
}