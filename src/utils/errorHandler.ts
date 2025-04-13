import { Page } from 'puppeteer-core';
import { logger } from './logger';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';

export class ErrorHandler {
  static async handle(page: Page, error: unknown, context: string) {
    if (error instanceof Error) {
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
      
      if (error.name === 'TimeoutError') {
        logger.warn(`${context} timeout - возможны ложные срабатывания`);
      }
    } else {
      logger.error(`${context}: Unknown error type occurred`);
    }
  }
}