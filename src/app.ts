import { Browser } from 'puppeteer-core';
import { BrowserService } from './services/browser';
import { ChatListener } from './modules/chat/listener';
import { PluginManager } from './modules/plugins/manager';
import { EmoteHandler } from './modules/chat/handlers/emotes';
import { CommandHandler } from './modules/chat/handlers/commands';
import { AdvancedChatHandler } from './modules/chat/handlers/advanced';
import { ChatResponseHandler } from './modules/chat/handlers/response';
import { CloudflareBypasser } from './modules/cloudflare/bypass';
import { BrowserUtils } from './services/browser/utils';
import { CONFIG } from './config';
import { logger } from './utils/logger';

async function main() {
  let browser: Browser | null = null;

  try {
    browser = await BrowserService.launch();
    const page = await browser.newPage();

    const gracefulShutdown = async () => {
      if (browser) {
        await browser.close();
        logger.info('Browser correctly closed');
      }
      process.exit(0);
    };

    browser.on('disconnected', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    process.on('SIGTERM', gracefulShutdown);

    await BrowserUtils.injectCookies(page);
    await page.goto('https://pony.town', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const cloudflareBypasser = new CloudflareBypasser(page);
    if (!await cloudflareBypasser.bypass()) {
      throw new Error('Cloudflare bypass failed');
    }

    await BrowserUtils.waitForGameLoad(page);
    await BrowserUtils.clickPlayButton(page);
    await new Promise(resolve => setTimeout(resolve, 5000));

    const chatListener = new ChatListener(page);
    const pluginManager = new PluginManager();

    pluginManager.register(
      new EmoteHandler(page),
      new CommandHandler(page),
      new AdvancedChatHandler(page),
      new ChatResponseHandler(page)
    );

    chatListener.subscribe(async (message) => {
      try {
        const handled = await pluginManager.handleMessage(message);
        logger.debug(handled
          ? `Processed: ${pluginManager.lastHandler}`
          : `Unprocessed`);
      } catch (error) {
        logger.error(`Handling error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    logger.info('Chat listener launched');
    await chatListener.startListening();

  } catch (error) {
    logger.error(`Fatal error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    if (browser) await browser.close();
    process.exit(1);
  }
}

main();