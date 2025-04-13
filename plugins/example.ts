import { Plugin } from '../src/modules/plugins/manager';
import { ChatMessage } from '../src/types';

export class ExamplePlugin implements Plugin {
  name = 'Greeting Plugin';
  priority = 100;

  async handler(message: ChatMessage): Promise<boolean> {
    if (message.text.toLowerCase().includes('hello')) {
      await this.handleGreeting(message);
      return true;
    }
    return false;
  }

  private async handleGreeting(message: ChatMessage) {
    // Greeting handling logic
  }
}
