import { Page } from 'puppeteer-core';
import { logger } from '../../utils/logger';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { ChatMessage } from '../../types';

export class AnalyticsCollector {
  private data: {
    messages: number;
    commands: number;
    errors: number;
    users: Set<string>;
  } = {
    messages: 0,
    commands: 0,
    errors: 0,
    users: new Set()
  };

  constructor(private page: Page) {}

  trackMessage(message: ChatMessage) {
    this.data.messages++;
    this.data.users.add(message.sender);
    if (message.isCommand) this.data.commands++;
  }

  trackError(error: Error) {
    this.data.errors++;
  }

  generateReport() {
    const report = {
      ...this.data,
      users: Array.from(this.data.users),
      timestamp: new Date().toISOString()
    };

    const reportPath = join(process.cwd(), 'logs/analytics', `report-${Date.now()}.json`);
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    logger.info(`Analytics report generated: ${reportPath}`);
  }
}
