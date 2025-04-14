import { Page } from 'puppeteer-core';
import { ChatMessage } from '../../../types';
import { logger } from '../../../utils/logger';

export abstract class ChatHandler {
    static priority: number = 100;

    constructor(protected page: Page) { }

    abstract shouldHandle(message: ChatMessage): Promise<boolean>;
    abstract handle(message: ChatMessage): Promise<boolean>;

    getPriority(): number {
        return (this.constructor as typeof ChatHandler).priority;
    }
}