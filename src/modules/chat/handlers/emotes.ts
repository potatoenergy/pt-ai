import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ErrorHandler } from '../../../utils/errorHandler';
import { ChatHelper } from '../../../utils/helpers';

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
    try {
      const emoteCommand = this.determineEmoteCommand(message.text);
      if (!emoteCommand) return false;

      logger.debug(`Detected emotion: ${emoteCommand} in message: "${message.text}"`);
      await this.sendEmoteCommand(emoteCommand);
      return true;
    } catch (error) {
      await ErrorHandler.handle(this.page, error as Error, 'EmoteHandler');
      return false;
    }
  }

  private determineEmoteCommand(text: string): string | null {
    const cleanText = this.normalizeText(text);
    logger.debug(`Processing message: "${text}" → Normalized: "${cleanText}"`);

    const patterns = {
      agreement: [
        'соглас', 'да', 'верно', 'точно', 'прав ', 'угу', 
        'конечно', 'подтверж', 'accept', 'yes', 'agree'
      ],
      disagreement: [
        'не соглас', 'нет', 'неверно', 'не прав', 'отказ', 
        'error', 'disagree', 'no', 'неа', 'ноуп'
      ],
      positive: [
        'смех', 'радость', 'весел', 'шутк', 'хах', 'хех', 
        'ржу', 'lol', 'laugh', 'happy', 'рад', 'ура'
      ],
      negative: [
        'груст', 'злость', 'печал', 'разочарован', 'обид', 
        'плач', 'слез', 'angry', 'sad', 'бесит'
      ],
      neutral: [
        'думаю', 'задума', 'устал', 'сонно', 'чих', 
        'апчхи', 'think', 'нейтрал', 'скучно'
      ]
    };

    for (const [emotion, keywords] of Object.entries(patterns)) {
      if (keywords.some(k => cleanText.includes(k))) {
        logger.debug(`Matched ${emotion} pattern`);
        return this.getRandomCommand(EMOTE_COMMANDS[emotion]);
      }
    }

    return null;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Удаляем акценты
      .replace(/[^\p{L}\p{M}\p{N}\p{P}\p{S}\p{Z}]/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/[!?,.-]+/g, ' ') // Нормализуем пунктуацию
      .trim();
  }

  private getRandomCommand(commands: string[]): string {
    return commands[Math.floor(Math.random() * commands.length)];
  }

  private async sendEmoteCommand(command: string): Promise<void> {
    try {
      await ChatHelper.sendMessage(this.page, command);
      
      // Проверка успешности отправки
      await this.page.waitForFunction(
        (cmd: string) => {
          const messages = Array.from(document.querySelectorAll('.chat-line-message'));
          return messages.some(m => m.textContent?.trim() === cmd);
        },
        { timeout: 5000 },
        command
      );
      
      logger.info(`Emote successfully sent: ${command}`);
    } catch (error) {
      logger.error(`Failed to send emote ${command}: ${error}`);
      throw new Error(`Emote send failed: ${command}`);
    }
  }
}