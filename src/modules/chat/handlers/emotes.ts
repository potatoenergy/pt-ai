import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ErrorHandler } from '../../../utils/errorHandler';

const EMOTE_MAP: Record<string, string> = {
  'смех': 'Laugh',
  'плач': 'Cry',
  'сердце': 'Love',
  'сон': 'Sleep'
};

export class EmoteHandler {
  constructor(private page: Page) { }

  async handle(message: ChatMessage): Promise<boolean> {
    const emoteCommand = this.parseEmoteCommand(message.text);
    if (!emoteCommand) return false;

    try {
      await this.page.evaluate(this.clickEmoteButton, emoteCommand);
      logger.info(`Emote executed: ${emoteCommand}`);
      return true;
    } catch (error) {
      await ErrorHandler.handle(this.page, error as Error, 'EmoteHandler');
      return false;
    }
  }

  private parseEmoteCommand(text: string): string | null {
    const lowerText = text.toLowerCase();
    for (const [key, value] of Object.entries(EMOTE_MAP)) {
      if (lowerText.includes(key)) return value;
    }
    return null;
  }

  private clickEmoteButton(emote: string) {
    const selector = `button[title="${emote}"]`;
    const button = document.querySelector<HTMLElement>(selector);
    if (button) {
      button.click();
      return true;
    }
    return false;
  }
}