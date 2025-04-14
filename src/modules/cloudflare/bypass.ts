import { Page } from 'puppeteer-core';
import { logger } from '../../utils/logger';
import { ErrorHandler } from '../../utils/errorHandler';
import { CONFIG } from '../../config';

export class CloudflareBypasser {
  private static readonly MAX_RETRIES = CONFIG.DEBUG_MODE ? 10 : 5;
  private static readonly CHECK_INTERVAL = 5000;

  constructor(private page: Page) { }

  async bypass(): Promise<boolean> {
    for (let attempt = 1; attempt <= CloudflareBypasser.MAX_RETRIES; attempt++) {
      try {
        if (await this.isCloudflareChallengePresent()) {
          logger.info(`Attempting Cloudflare bypass (${attempt}/${CloudflareBypasser.MAX_RETRIES})`);
          await this.solveChallenge();
          await new Promise(resolve => setTimeout(resolve, CloudflareBypasser.CHECK_INTERVAL));
          continue;
        }
        return true;
      } catch (error) {
        await ErrorHandler.handle(this.page, error as Error, 'CloudflareBypasser');
      }
    }
    return false;
  }

  private async isCloudflareChallengePresent(): Promise<boolean> {
    return this.page.evaluate(() => {
      return document.querySelector('div#cf-challenge-running') !== null ||
        document.querySelector('iframe[src*="challenge"]') !== null;
    });
  }

  private async solveChallenge(): Promise<void> {
    await this.page.evaluate(() => {
      const challengeFrame = document.querySelector<HTMLIFrameElement>(
        'iframe[src*="challenge"]'
      );
      if (challengeFrame?.contentWindow?.document) {
        const checkbox = challengeFrame.contentWindow.document.querySelector<HTMLElement>(
          'input[type="checkbox"]'
        );
        checkbox?.click();
      }
    });
  }
}
