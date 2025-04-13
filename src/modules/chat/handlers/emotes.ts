import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ErrorHandler } from '../../../utils/errorHandler';

const EMOTE_COMMANDS: Record<string, string[]> = {
  agreement: [
    '/nod', '/agree', '/yes', '/nodopeneyes', '/doublenod',
    '/nodtwice', '/2nod', '/doublenodopeneyes'
  ],
  disagreement: [
    '/shakehead', '/no', '/smh', '/headshakeopeneyes', '/headshakesmiling'
  ],
  positive: [
    '/smile', '/happy', '/laugh', '/haha', '/hehe', '/хаха',
    '/jaja', '/lol', '/giggle', '/happywink', '/wink', '/cheekywink', '/sillywink'
  ],
  negative: [
    '/frown', '/angry', '/sad', '/annoyed', '/annoyedeyeroll'
  ],
  neutral: [
    '/thinking', '/yawn', '/sneeze', '/achoo'
  ]
};

export class EmoteHandler {
  constructor(private page: Page) { }

  async handle(message: ChatMessage): Promise<boolean> {
    const emoteCommand = this.determineEmoteCommand(message.text);
    if (!emoteCommand) return false;

    try {
      await this.sendEmoteCommand(emoteCommand);
      logger.info(`Emote executed: ${emoteCommand}`);
      return true;
    } catch (error) {
      await ErrorHandler.handle(this.page, error as Error, 'EmoteHandler');
      return false;
    }
  }

  private determineEmoteCommand(text: string): string | null {
    const lowerText = text.toLowerCase();

    if (this.containsKeywords(lowerText, ['согласен', 'да', 'верно', 'точно'])) {
      return this.getRandomCommand(EMOTE_COMMANDS.agreement);
    }
    if (this.containsKeywords(lowerText, ['не согласен', 'нет', 'неверно', 'неправильно'])) {
      return this.getRandomCommand(EMOTE_COMMANDS.disagreement);
    }
    if (this.containsKeywords(lowerText, ['смех', 'радость', 'веселье', 'шутка'])) {
      return this.getRandomCommand(EMOTE_COMMANDS.positive);
    }
    if (this.containsKeywords(lowerText, ['грусть', 'злость', 'печаль', 'разочарование'])) {
      return this.getRandomCommand(EMOTE_COMMANDS.negative);
    }
    if (this.containsKeywords(lowerText, ['задумчивость', 'усталость', 'нейтрально'])) {
      return this.getRandomCommand(EMOTE_COMMANDS.neutral);
    }

    return null;
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  private getRandomCommand(commands: string[]): string {
    return commands[Math.floor(Math.random() * commands.length)];
  }

  private async sendEmoteCommand(command: string): Promise<void> {
    await this.page.evaluate((cmd) => {
      const chatInput = document.querySelector('textarea[aria-label="Chat message"]') as HTMLTextAreaElement;
      if (chatInput) {
        chatInput.value = cmd;
        const event = new Event('input', { bubbles: true });
        chatInput.dispatchEvent(event);

        const sendButton = document.querySelector('button[title="Send message"]') as HTMLElement;
        if (sendButton) {
          sendButton.click();
        }
      }
    }, command);
  }
}