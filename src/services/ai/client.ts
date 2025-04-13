import OpenAI from 'openai';
import { CONFIG } from '../../config';
import { logger } from '../../utils/logger';
import { ChatHelper } from '../../utils/helpers';
import { Page } from 'puppeteer-core';

export class AIClient {
  private client: OpenAI;
  private abortController?: AbortController;

  constructor(private page: Page) {
    this.client = new OpenAI({
      apiKey: CONFIG.AI.API_KEY,
      baseURL: CONFIG.AI.BASE_URL,
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
          model: CONFIG.AI.MODEL,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: context }
          ],
          temperature: CONFIG.AI.TEMPERATURE,
          max_tokens: CONFIG.AI.MAX_TOKENS
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
        await ChatHelper.sendMessage(this.page, "Проблема с API. Попробуем еще раз...");
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 5000 * attempt));
      } finally {
        this.abortController = undefined;
      }
    }

    await ChatHelper.sendMessage(this.page, "Не удалось получить ответ после нескольких попыток.");
    return '';
  }

  abortCurrentRequest() {
    this.abortController?.abort();
  }
}