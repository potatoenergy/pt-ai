import puppeteer from 'puppeteer-core';
import { CONFIG } from '../../config';
import { ErrorHandler } from '../../utils/errorHandler';

export class BrowserService {
  static async launch() {
    try {
      return await puppeteer.launch({
        executablePath: CONFIG.CHROMIUM_PATH,
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process'
        ]
      });
    } catch (error) {
      throw new Error(`Browser launch failed: ${error}`);
    }
  }
}