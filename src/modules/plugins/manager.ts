import { ChatMessage } from '../../types';
import { logger } from '../../utils/logger';
import { ChatHandler } from '../chat/handlers/base';

export class PluginManager {
  private handlers: ChatHandler[] = [];

  async handleMessage(message: ChatMessage): Promise<boolean> {
    const sortedHandlers = [...this.handlers].sort((a, b) =>
      b.getPriority() - a.getPriority()
    );

    for (const handler of sortedHandlers) {
      if (await handler.shouldHandle(message)) {
        logger.debug(`Processing message with ${handler.constructor.name}`);
        const result = await handler.handle(message);
        if (result) return true;
      }
    }
    return false;
  }

  register(...handlers: ChatHandler[]): void {
    this.handlers.push(...handlers);
    logger.info(`Registered ${handlers.length} handlers: ${handlers.map(h => h.constructor.name).join(', ')
      }`);
  }
}