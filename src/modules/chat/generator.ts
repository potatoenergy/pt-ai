import { CONFIG } from '../../config';
import { AIClient } from '../../services/ai/client';
import { Page } from 'puppeteer-core';
import { logger } from '../../utils/logger';

export class ResponseGenerator {
  private aiClient: AIClient;

  constructor(private page: Page) {
    this.aiClient = new AIClient(page);
  }

  async generate(text: string, context: string, sender: string): Promise<string> {
    const prompt = this.buildPrompt(text, context);
    const response = await this.aiClient.generateResponse(prompt, sender);

    if (!response) {
      logger.warn('Empty response from AI client');
      return '';
    }

    return this.postProcess(response);
  }

  private buildPrompt(text: string, context: string): string {
    return [
      `${CONFIG.PERSONALITY_NAME} Context-Aware Response Rules:`,
      `Identity: Speaks like ${CONFIG.PERSONALITY_TRAITS.join(', ')} personality`,
      `Style: ${CONFIG.PERSONALITY_SPEECH_STYLE} | ${CONFIG.LANGUAGE} | ${this.getEmotionalVector()}`,
      '',
      `Response MUST:`,
      `1. Be 1-2 casual phrases (110-140 chars)`,
      `2. Use spoken language with flow errors`,
      `3. Reflect environment context: ${context}`,
      `4. Add ONE relevant emoji at end (replaces punctuation)`,
      `5. Format: single line without markdown`,
      '',
      `Restrictions:`,
      `- No bot/AI mentions`,
      `- No meta-commentary`,
      `- Never use !😊 or ?🤔 formats`,
      `- Avoid nested emojis`,
      '',
      `Input: "${text}"`,
      `Organic response with emoji placement:`
    ].join('\n');
  }

  private getEmotionalVector(): string {
    const traits = CONFIG.PERSONALITY_TRAITS;
    const emotionalMap: Record<string, string> = {
      friendly: 'Warm welcoming phrases',
      playful: 'Lighthearted jokes',
      observant: 'Detailed observations',
      curious: 'Inquisitive questions',
      witty: 'Clever wordplay'
    };

    return traits
      .map((t: string) => emotionalMap[t] || t)
      .join(', ');
  }

  private postProcess(text: string): string {
    return text
      .replace(/[\*\_\[\]\(\)]/g, '')
      .replace(/(\p{Emoji})/gu, (match, emoji) => {
        const lastChar = text.slice(-1);
        return lastChar === emoji ? emoji : `${lastChar} ${emoji}`;
      })
      .substring(0, 149)
      .trim();
  }
}