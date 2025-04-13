import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../types';
import { logger } from '../../utils/logger';
import { CONFIG } from '../../config';

type MessageCallback = (message: ChatMessage) => Promise<void>;

export class ChatListener {
  private subscribers: MessageCallback[] = [];
  private lastMessageTime: number = Date.now();

  constructor(private page: Page) { }

  public subscribe(callback: MessageCallback): void {
    this.subscribers.push(callback);
  }

  public async startListening(): Promise<void> {
    let lastMessageCount = 0;

    while (true) {
      try {
        const messages = await this.page.evaluate(() => {
          return Array.from(document.querySelectorAll('.chat-line'))
            .map(el => ({
              sender: el.querySelector('.chat-line-name-content')?.textContent?.trim() || 'Unknown',
              text: el.querySelector('.chat-line-message')?.textContent?.trim() || '',
              timestamp: new Date(),
              isCommand: false
            }));
        });

        if (messages.length > lastMessageCount) {
          const newMessages = messages.slice(lastMessageCount);
          for (const message of newMessages) {
            await this.notifySubscribers(message);
          }
          lastMessageCount = messages.length;
          this.lastMessageTime = Date.now();
        }

        if (Date.now() - this.lastMessageTime > 180000) {
          await this.handleIdleState();
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error(`Chat listening error: ${error}`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }

  private async notifySubscribers(message: ChatMessage): Promise<void> {
    for (const callback of this.subscribers) {
      try {
        await callback(message);
      } catch (error) {
        logger.error(`Subscriber error: ${error}`);
      }
    }
  }

  private async handleIdleState(): Promise<void> {
    const idleMessages = [
      "Пони, сидит один и вокруг него различные красоты мира... Ему становится грустно, что никто не обращает на него внимание.",
      "Он начинает думать вслух: 'Почему я такой одинокий?'",
      "Вдруг он вспоминает: 'Может, стоит попробовать что-то новое?'"
    ];

    for (const message of idleMessages) {
      await this.page.evaluate((text) => {
        const textarea = document.querySelector<HTMLTextAreaElement>('textarea[aria-label="Chat message"]');
        const sendButton = document.querySelector<HTMLElement>('button[title="Send message"]');

        if (textarea && sendButton) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          sendButton.click();
        }
      }, message);

      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}
