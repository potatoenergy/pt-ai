import { BrowserService } from './services/browser';
import { ChatListener } from './modules/chat/listener';
import { CommandHandler } from './modules/chat/handlers/commands';
import { EmoteHandler } from './modules/chat/handlers/emotes';
import { CloudflareBypasser } from './modules/cloudflare/bypass';
import { BrowserUtils } from './services/browser/utils';
import { CONFIG } from './config';
import { logger } from './utils/logger';
import { ChatMessage } from './types';
import { ChatHelper } from './utils/helpers';
import { AdvancedChatHandler } from './modules/chat/handlers/advanced';

async function main() {
  try {
    const browser = await BrowserService.launch();
    const page = await browser.newPage();

    await page.setUserAgent(CONFIG.BROWSER.USER_AGENT);
    await BrowserUtils.injectCookies(page);
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    logger.info('Navigating to pony.town');
    await page.goto('https://pony.town', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const cloudflareBypasser = new CloudflareBypasser(page);
    if (!await cloudflareBypasser.bypass()) {
      throw new Error('Cloudflare bypass failed');
    }

    logger.info('Initializing game...');
    await BrowserUtils.waitForGameLoad(page);
    await BrowserUtils.clickPlayButton(page);
    await page.waitForTimeout(5000);
    // await ChatHelper.sendMessage(page, 'Hi! :paws:');

    const chatListener = new ChatListener(page);
    const commandHandler = new CommandHandler(page);
    const emoteHandler = new EmoteHandler(page);
    const advancedHandler = new AdvancedChatHandler(page);

    chatListener.subscribe(async (message: ChatMessage) => {
      try {
        if (await commandHandler.handle(message)) return;
        if (await emoteHandler.handle(message)) return;
        if (await advancedHandler.handleAdvancedBehavior(message)) return;
      } catch (error) {
        logger.error(`Error processing message: ${error}`);
      }
    });

    logger.info('Starting chat listener...');
    await chatListener.startListening();

  } catch (error) {
    logger.error('Fatal initialization error:', error);
    process.exit(1);
  }
}

main();