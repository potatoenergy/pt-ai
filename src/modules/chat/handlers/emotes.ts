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

      await this.sendEmoteCommand(emoteCommand);
      return true;
    } catch (error) {
      await ErrorHandler.handle(this.page, error, 'EmoteHandler');
      return false;
    }
  }

  private determineEmoteCommand(text: string): string | null {
    const normalizedText = this.normalizeText(text);

    const emotionPatterns = {
      agreement: [
        /\b(соглас[еннаоы]|да+|угу|конечно|прав(а|ы|ильно)?|точно|верно)\b/,
        /(^|\s)ага?($|\s)/,
        /подтвержд(аю|яю|ение)/
      ],
      disagreement: [
        /\b(несоглас[еннаоы]|нет[у]?|неверно|ошиб(аешься|ка)|заблуждаешься)\b/,
        /(не\s+прав)|(нет\s+так)/,
        /отрица(ю|ние|тельно)/
      ],
      positive: [
        /\b(сме(ю|ёшь|х|шно)|рж(у|ешь)|хах?а|хех?е|лол|рад(а|ы|о)|весел(а|о|ы)|ура|шутк(а|и))\b/,
        /(^|\s)хо($|\s)/,
        /улыб(аюсь|ается|ни)/
      ],
      negative: [
        /\b(груст(но|ен|на|ь)|печал(ен|ь|но|лю)|зл(а|о|ы)|бесит|разочарован|обид(а|но|ело))\b/,
        /(^|\s)плак(аю|у|ал)($|\s)/,
        /тоск(а|но|ливо)/
      ],
      neutral: [
        /\b(дума(ю|ешь)|задума(лся|лась)|уста(л|ла|ло)|сонно|чих|апчхи|размышляю)\b/,
        /(усталость|нейтрально)/,
        /(скучн[оа]|без\s+эмоций)/
      ]
    };

    for (const [emotion, patterns] of Object.entries(emotionPatterns)) {
      if (patterns.some(p => p.test(normalizedText))) {
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
      .replace(/[^\p{L}\s]/gu, "")
      .replace(/\s+/g, " ");
  }

  private getRandomCommand(commands: string[]): string {
    return commands[Math.floor(Math.random() * commands.length)];
  }

  private async sendEmoteCommand(command: string): Promise<void> {
    try {
      await ChatHelper.sendMessage(this.page, command);

      await new Promise((resolve) => setTimeout(resolve, 1000));
      logger.debug(`Emote triggered: ${command}`);

    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Timeout')) {
          logger.warn(`Emote delay detected: ${command}`);
          return;
        }
        throw new Error(`Emote failed: ${error.message}`);
      }
      throw new Error('Unknown error in emote handling');
    }
  }
}