import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../types';
import { logger } from '../../utils/logger';

export type Plugin = {
  name: string;
  priority: number;
  handler: (message: ChatMessage) => Promise<boolean>;
};

export class PluginManager {
  private plugins: Plugin[] = [];

  constructor(private page: Page) { }

  register(plugin: Plugin) {
    this.plugins.push(plugin);
    this.plugins.sort((a, b) => b.priority - a.priority);
    logger.info(`Registered plugin: ${plugin.name}`);
  }

  async handleMessage(message: ChatMessage): Promise<boolean> {
    for (const plugin of this.plugins) {
      if (await plugin.handler(message)) {
        logger.debug(`Handled by plugin: ${plugin.name}`);
        return true;
      }
    }
    return false;
  }
}
