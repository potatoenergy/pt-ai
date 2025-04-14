import OpenAI from 'openai';
import { CONFIG } from '../../config';
import { logger } from '../../utils/logger';
import { Page } from 'puppeteer-core';

export class AIClient {
  private client: OpenAI;
  private abortController?: AbortController;

  constructor(private page: Page) {
    this.client = new OpenAI({
      apiKey: CONFIG.OPENAI_API_KEY,
      baseURL: CONFIG.OPENAI_BASE_URL,
      fetch: (input, init) => {
        if (this.abortController) {
          init = init || {};
          init.signal = this.abortController.signal;
        }
        return fetch(input, init);
      }
    });
  }

  async generateResponse(prompt: string, context: string): Promise<string> {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        this.abortController = new AbortController();

        const response = await this.client.chat.completions.create({
          model: CONFIG.OPENAI_MODEL,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: context }
          ],
          temperature: CONFIG.OPENAI_TEMPERATURE,
          max_tokens: CONFIG.OPENAI_MAX_TOKENS
        });

        if (!response?.choices[0]?.message?.content) {
          throw new Error('Empty AI response');
        }

        return response.choices[0].message.content;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return '';
        }
        logger.error(`AI API Error: ${error}`);
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
      } finally {
        this.abortController = undefined;
      }
    }

    logger.error('All AI attempts failed');
    return '';
  }

  abortCurrentRequest(): void {
    this.abortController?.abort();
  }
}