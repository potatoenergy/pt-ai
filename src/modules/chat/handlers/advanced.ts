import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { PlayerSelector } from '../../player/selector';
import { AIClient } from '../../../services/ai/client';
import { CONFIG } from '../../../config';

export class AdvancedChatHandler {
  private aiClient: AIClient;
  private playerSelector: PlayerSelector;
  private lastResponseTime = Date.now();
  private currentTarget: string | null = null;

  constructor(private page: Page) {
    this.aiClient = new AIClient(page);
    this.playerSelector = new PlayerSelector(page);
  }

  async handleAdvancedBehavior(message: ChatMessage): Promise<boolean> {
    try {
      this.currentTarget = await this.playerSelector.getSelectedPlayerName();

      if (await this.handleSelectedPlayer(message)) return true;
      if (await this.handleTimedResponse()) return true;

      return false;
    } catch (error) {
      logger.error('Advanced handler error:', error);
      return false;
    }
  }

  private async handleSelectedPlayer(message: ChatMessage): Promise<boolean> {
    if (!this.currentTarget) return false;

    const isTargetMessage = this.normalizeName(message.sender) === this.normalizeName(this.currentTarget);
    const isTargetVisible = await this.playerSelector.isAnyPlayerSelected();

    if (isTargetVisible && isTargetMessage) {
      const response = await this.generateResponse(
        `${CONFIG.BOT.PERSONALITY.NAME} реагирует на ${this.currentTarget}:\n${message.text}`,
        message.sender
      );

      await this.sendResponse(response);
      logger.info(`Responded to selected player: ${this.currentTarget}`);
      return true;
    }
    return false;
  }

  private async handleTimedResponse(): Promise<boolean> {
    const interval = CONFIG.BOT.RESPONSE_INTERVAL;
    const shouldRespond = Date.now() - this.lastResponseTime > interval;

    if (shouldRespond && !this.currentTarget) {
      const response = await this.generateIdleResponse();
      await this.sendResponse(response);
      this.lastResponseTime = Date.now();
      logger.info('Sent timed response');
      return true;
    }
    return false;
  }

  private async generateResponse(text: string, sender: string): Promise<string> {
    const context = this.currentTarget
      ? `Текущая цель: ${this.currentTarget}\n`
      : 'Автономный режим\n';

      const prompt = [
        `${CONFIG.BOT.PERSONALITY.NAME} (${CONFIG.BOT.PERSONALITY.TRAITS.join(', ')})`,
        `Стиль: ${CONFIG.BOT.PERSONALITY.SPEECH_STYLE}`,
        `Жесткие ограничения:`,
        `- Только 1-2 коротких предложения`,
        `- Максимум 149 символов`,
        `- Только разговорный стиль`,
        `- Никаких Markdown`,
        `- Используй эмодзи для выразительности`,
        `Контекст: ${context}`,
        `Сообщение: "${text}"`,
        `Ответь как персонаж игры:`
      ].join('\n');

    const response = await this.aiClient.generateResponse(prompt, sender);
    if (!response) throw new Error('Failed to generate response');
    return response;
  }

  private async generateIdleResponse(): Promise<string> {
    const prompts = [
      CONFIG.BOT.PROMPTS.IDLE,
      `Сейчас ${new Date().toLocaleTimeString()}... Что будем делать?`,
      'Заметил что-то интересное вокруг?',
      'Может обменяемся предметами?'
    ];

    return prompts[Math.floor(Math.random() * prompts.length)];
  }

  private async sendResponse(text: string): Promise<void> {
    await this.page.evaluate((text) => {
      const chat = document.querySelector('chat-box');
      if (chat) {
        const textarea = chat.querySelector('textarea[aria-label="Chat message"]') as HTMLTextAreaElement;
        const sendButton = chat.querySelector('button[title="Send message"]') as HTMLElement;

        if (textarea && sendButton) {
          textarea.value = text;
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          sendButton.click();
        }
      }
    }, text);
  }

  private normalizeName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]/gi, '')
      .trim();
  }
}