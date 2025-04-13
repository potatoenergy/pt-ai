import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { AIClient } from '../../../services/ai/client';
import { ChatHelper } from '../../../utils/helpers';

export class CommandHandler {
  private aiClient: AIClient;

  constructor(private page: Page) {
    this.aiClient = new AIClient(page);
  }

  async handle(message: ChatMessage): Promise<boolean> {
    const { command, args } = this.parseCommand(message.text);
    if (!command) return false;

    logger.debug(`Processing ${command}: "${args}"`);

    try {
      switch (command.toLowerCase()) {
        case 'c':
          await this.handleAICommand(args, message.sender);
          return true;
        case 'say':
          await this.handleSayCommand(args);
          return true;
        case 'cstop':
          this.handleStopCommand();
          return true;
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Command handling error: ${error}`);
      await ChatHelper.sendMessage(this.page, "Произошла ошибка при обработке команды.");
      return false;
    }
  }

  private parseCommand(text: string): { command: string; args: string } {
    const match = text.match(/^\.(\w+)\s*(.*)/);
    return match
      ? { command: match[1], args: match[2] }
      : { command: '', args: '' };
  }

  private async handleAICommand(args: string, sender: string) {
    if (!args) return;

    const response = await this.aiClient.generateResponse(args, sender);
    if (response) {
      await this.sendChatResponse(response);
    }
  }

  private async handleSayCommand(args: string) {
    await this.sendChatResponse(args);
  }

  private handleStopCommand() {
    this.aiClient.abortCurrentRequest();
  }

  private async sendChatResponse(text: string) {
    await ChatHelper.sendMessage(this.page, text);
  }
}