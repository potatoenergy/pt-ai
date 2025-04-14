import { Page } from 'puppeteer-core';
import { ChatHandler } from './base';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { AIClient } from '../../../services/ai/client';
import { ChatHelper } from '../../../utils/helpers';

export class CommandHandler extends ChatHandler {
  static override priority = 800;
  private aiClient: AIClient;
  private generationStartTime: number | null = null;

  constructor(page: Page) {
    super(page);
    this.aiClient = new AIClient(page);
  }

  async shouldHandle(message: ChatMessage): Promise<boolean> {
    return !!this.parseCommand(message.text).command;
  }

  async handle(message: ChatMessage): Promise<boolean> {
    const { command, args } = this.parseCommand(message.text);
    if (!command) return false;

    try {
      switch (command.toLowerCase()) {
        case 'ai':
          await this.handleAICommand(args, message.sender);
          return true;
        case 'echo':
          await this.handleSayCommand(args);
          return true;
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Command error: ${error}`);
      await ChatHelper.sendMessage(this.page, "⚠️ Command processing error");
      return false;
    }
  }

  private parseCommand(text: string) {
    const match = text.match(/^\.(\w+)\s*(.*)/);
    return match ? { command: match[1], args: match[2] } : { command: '', args: '' };
  }

  private async handleAICommand(args: string, sender: string) {
    if (!args) return;
    this.generationStartTime = Date.now();
    const response = await this.aiClient.generateResponse(args, sender);
    if (response) await this.sendChatResponse(response);
    this.generationStartTime = null;
  }

  private async handleSayCommand(args: string) {
    await this.sendChatResponse(args);
  }

  private async sendChatResponse(text: string) {
    await ChatHelper.sendMessage(this.page, text);
  }

  public checkGenerationTimeout() {
    if (this.generationStartTime && Date.now() - this.generationStartTime > 120000) {
      this.aiClient.abortCurrentRequest();
      this.generationStartTime = null;
      logger.warn('AI generation timeout');
    }
  }
}