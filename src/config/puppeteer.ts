import { CONFIG } from './index';
import { BrowserLaunchArgumentOptions, LaunchOptions } from 'puppeteer-core';

export const getLaunchOptions = (): LaunchOptions & BrowserLaunchArgumentOptions => ({
  executablePath: CONFIG.BROWSER.CHROMIUM_PATH,
  headless: CONFIG.NODE_ENV === 'production',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    `--user-agent=${CONFIG.BROWSER.USER_AGENT}`
  ]
});
