import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../types';
import { logger } from '../../utils/logger';
import { CONFIG } from '../../config';

type MessageCallback = (message: ChatMessage) => Promise<void>;

export class ChatListener {
  private subscribers: MessageCallback[] = [];
  private lastMessageCount = 0;
  private isListening = false;

  constructor(private page: Page) { }

  public subscribe(callback: MessageCallback): void {
    this.subscribers.push(callback);
  }

  public async startListening(): Promise<void> {
    this.isListening = true;

    while (this.isListening) {
      try {
        if (this.page.isClosed()) {
          logger.warn('Page closed, stopping listener');
          break;
        }

        const messages = await this.getFilteredMessages();

        if (messages.length > this.lastMessageCount) {
          const newMessages = messages.slice(this.lastMessageCount);
          for (const message of newMessages) {
            await this.notifySubscribers(message);
          }
          this.lastMessageCount = messages.length;
        }

        await new Promise(resolve =>
          setTimeout(resolve, CONFIG.RESPONSE_DELAY)
        );
      } catch (error) {
        if (this.isListening) {
          logger.error(`Chat error: ${error}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }
    }
  }

  private async getFilteredMessages(): Promise<ChatMessage[]> {
    const rawMessages = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('.chat-line'))
        .map(el => ({
          sender: el.querySelector('.chat-line-name-content')?.textContent?.trim() || 'Unknown',
          text: el.querySelector('.chat-line-message')?.textContent?.trim() || '',
          timestamp: new Date(),
          isCommand: false
        }));
    });

    return rawMessages.filter(msg =>
      !CONFIG.IGNORE_USERS.includes(msg.sender.toLowerCase()) &&
      msg.sender !== CONFIG.PERSONALITY_NAME
    );
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

  public stopListening(): void {
    this.isListening = false;
  }
}