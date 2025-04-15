import { ChatMessage } from '../../types';
import { logger } from '../../utils/logger';
import { ChatHandler } from '../chat/handlers/base';

export class PluginManager {
  private handlers: ChatHandler[] = [];
  public lastHandler: string | null = null;

  async handleMessage(message: ChatMessage): Promise<boolean> {
    const sortedHandlers = [...this.handlers].sort((a, b) =>
      b.getPriority() - a.getPriority()
    );

    for (const handler of sortedHandlers) {
      if (await handler.shouldHandle(message)) {
        this.lastHandler = handler.constructor.name;
        const result = await handler.handle(message);
        if (result) return true;
      }
    }
    return false;
  }

  register(...handlers: ChatHandler[]): void {
    this.handlers.push(...handlers);
    logger.info(`Handlers registered: ${handlers.length}`);
  }
}