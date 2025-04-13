import { Page } from 'puppeteer-core';
import { CONFIG } from '../../config';
import { logger } from '../../utils/logger';
import { BrowserUtils } from '../../services/browser/utils';

export class SessionManager {
  constructor(private page: Page) { }

  async validateAndRefresh() {
    if (!(await this.isSessionValid())) {
      logger.warn('Session invalid, attempting refresh...');
      await this.refreshSession();
    }
  }

  private async isSessionValid(): Promise<boolean> {
    return this.page.evaluate(() => {
      return !document.querySelector('.login-container');
    });
  }

  private async refreshSession() {
    await BrowserUtils.injectCookies(this.page);
    await this.page.reload({ waitUntil: 'networkidle2' });
    await this.page.waitForSelector('button[aria-haspopup="true"][dropdowntoggle][class="btn btn-lg btn-success text-truncate flex-grow-1"]', { timeout: 15000 });
  }
}
