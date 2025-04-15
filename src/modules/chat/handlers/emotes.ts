import { Page } from 'puppeteer-core';
import { ChatHandler } from './base';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { ErrorHandler } from '../../../utils/errorHandler';
import { ChatHelper } from '../../../utils/helpers';
import { CONFIG } from '../../../config';

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

export class EmoteHandler extends ChatHandler {
  static override priority = 1000;

  constructor(page: Page) {
    super(page);
  }

  async shouldHandle(message: ChatMessage): Promise<boolean> {
    const isSelfMessage = message.sender.trim().toLowerCase() === CONFIG.PERSONALITY_NAME.toLowerCase().trim();
    return !isSelfMessage && !!this.determineEmoteCommand(message.text);
  }

  async handle(message: ChatMessage): Promise<boolean> {
    try {
      const command = this.determineEmoteCommand(message.text);
      if (!command) return false;

      logger.debug(`Sending emote: ${command}`);
      await ChatHelper.sendMessage(this.page, command);
      return true;
    } catch (error) {
      await ErrorHandler.handle(this.page, error as Error, 'EmoteHandler');
      return false;
    }
  }

  private determineEmoteCommand(text: string): string | null {
    const cleanText = this.normalizeText(text);
    const patterns = {
      agreement: ['соглас', 'да', 'верно', 'точно', 'прав ', 'угу', 'конечно', 'подтверж', 'accept', 'yes', 'agree'],
      disagreement: ['не соглас', 'нет', 'неверно', 'не прав', 'отказ', 'error', 'disagree', 'no', 'неа', 'ноуп'],
      positive: ['смех', 'радость', 'весел', 'шутк', 'хах', 'хех', 'ржу', 'lol', 'laugh', 'happy', 'рад', 'ура'],
      negative: ['груст', 'злость', 'печал', 'разочарован', 'обид', 'плач', 'слез', 'angry', 'sad', 'бесит'],
      neutral: ['думаю', 'задума', 'устал', 'сонно', 'чих', 'апчхи', 'think', 'нейтрал', 'скучно']
    };

    for (const [emotion, keywords] of Object.entries(patterns)) {
      if (keywords.some(k => cleanText.includes(k))) {
        return this.getRandomCommand(EMOTE_COMMANDS[emotion]);
      }
    }
    return null;
  }

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\p{L}\p{M}\p{N}\p{P}\p{S}\p{Z}]/gu, '')
      .replace(/\s+/g, ' ')
      .replace(/[!?,.-]+/g, ' ')
      .trim();
  }

  private getRandomCommand(commands: string[]): string {
    return commands[Math.floor(Math.random() * commands.length)];
  }
}