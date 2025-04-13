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
      `${CONFIG.BOT.PERSONALITY.NAME} Personality Matrix:`,
      `- Core Traits: ${CONFIG.BOT.PERSONALITY.TRAITS.join(', ')}`,
      `- Speech Style: ${CONFIG.BOT.PERSONALITY.SPEECH_STYLE}`,
      `- Language: ${CONFIG.BOT.LANGUAGE}`,
      `- Emotional Profile: ${this.getEmotionalVector()}`,
      '',
      `Operational Constraints:`,
      `1. STRICT FORMAT: Plain text only, NO Markdown/BBcode/HTML`,
      `2. LENGTH: 1-2 natural sentences (120-149 characters)`,
      `3. EMOJI USAGE: Only 1 relevant emoji at sentence end`,
      `4. CONTEXT AWARENESS: ${context}`,
      `5. INTERACTION RULES:`,
      `   - Never mention being an AI/bot`,
      `   - Avoid meta-commentary`,
      `   - Use informal spoken language`,
      `   - Allow minor grammar imperfections`,
      `   - Respond to environmental cues`,
      '',
      `Current Input: "${text}"`,
      `Generate organic in-character response:`
    ].join('\n');
  }

  private getEmotionalVector(): string {
    const traits = CONFIG.BOT.PERSONALITY.TRAITS;
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