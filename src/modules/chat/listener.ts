import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../types';
import { logger } from '../../utils/logger';

type MessageCallback = (message: ChatMessage) => Promise<void>;

export class ChatListener {
  private subscribers: MessageCallback[] = [];
  private lastMessageTime = Date.now();
  private isListening = false;

  constructor(private page: Page) { }

  public subscribe(callback: MessageCallback): void {
    this.subscribers.push(callback);
  }

  public async startListening(): Promise<void> {
    this.isListening = true;
    let lastMessageCount = 0;

    while (this.isListening) {
      try {
        if (this.page.isClosed()) {
          logger.warn('The page is closed. Stopping listening.');
          break;
        }

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

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        if (this.isListening) {
          logger.error(`Listening error: ${error}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }

  public stopListening(): void {
    this.isListening = false;
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
}