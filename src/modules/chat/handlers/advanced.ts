import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';
import { PlayerSelector } from '../../player/selector';
import { AIClient } from '../../../services/ai/client';
import { CONFIG } from '../../../config';

export class AdvancedChatHandler {
  private aiClient: AIClient;
  private playerSelector: PlayerSelector;
  private lastResponseTime = 0;
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
    const now = Date.now();
    const shouldRespond = (now - this.lastResponseTime) > interval
      && (now - this.lastResponseTime) < (interval * 2);

    if (shouldRespond && !this.currentTarget) {
      try {
        const response = await this.generateIdleResponse();
        if (!response || response.length < 2) {
          logger.warn('Empty idle response');
          return false;
        }

        await this.sendResponse(response);
        this.lastResponseTime = now;
        logger.info(`Sent timed response: ${response}`);
        return true;
      } catch (error) {
        logger.error('Timed response failed:', error);
      }
    }
    return false;
  }

  private async generateResponse(text: string, sender: string): Promise<string> {
    const context = this.currentTarget
      ? `Current target: ${this.currentTarget}\n`
      : 'Autonomous mode\n';

    const prompt = [
      `${CONFIG.BOT.PERSONALITY.NAME} (${CONFIG.BOT.PERSONALITY.TRAITS.join(', ')})`,
      `Language: ${CONFIG.BOT.LANGUAGE}`,
      `Style: ${CONFIG.BOT.PERSONALITY.SPEECH_STYLE}`,
      `Core directives:`,
      `- Roleplay as in-game character`,
      `- Use ${CONFIG.BOT.LANGUAGE} language`,
      `- Respond to environment interactions`,
      `- Keep responses 1-2 sentences (max 149 chars)`,
      `- Use gaming slang and emojis`,
      `Context: ${context}`,
      `Message: "${text}"`,
      `Generate in-character response:`
    ].join('\n');

    const response = await this.aiClient.generateResponse(prompt, sender);
    if (!response) throw new Error('Failed to generate response');
    return response;
  }

  private async generateIdleResponse(): Promise<string> {
    const environmentPrompts = {
      en: [
        "Noticing some cool outfits around! 🎨",
        "Hear any good jokes lately? 😄",
        "The weather here is perfect for grazing! 🌱"
      ],
      ru: [
        "Кто-нибудь видел мой потерянный гриб? 🍄",
        "Интересно, что там за холмом... 🌄",
        "Погода сегодня отличная для прогулок! ☀️"
      ]
    };

    const defaultPrompts = [
      CONFIG.BOT.PROMPTS.IDLE,
      `It's ${new Date().toLocaleTimeString()}... Any plans?`,
      'See anything interesting around?'
    ];

    const lang = CONFIG.BOT.LANGUAGE as keyof typeof environmentPrompts;
    if (environmentPrompts.hasOwnProperty(lang)) {
      const prompts = environmentPrompts[lang];
      return prompts[Math.floor(Math.random() * prompts.length)];
    }
    return defaultPrompts[Math.floor(Math.random() * defaultPrompts.length)];
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