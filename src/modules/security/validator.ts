import { CONFIG } from '../../config';
import { ChatMessage } from '../../types';

export class SecurityValidator {
  private BANNED_PATTERNS = [
    /discord\.gg\/\w+/i,
    /http(s)?:\/\//i,
    /[^\p{L}\p{M}\p{N}\p{P}\p{S}\p{Z}]/gu
  ];

  validateMessage(message: ChatMessage): boolean {
    return !this.BANNED_PATTERNS.some(pattern =>
      pattern.test(message.text)
    );
  }

  sanitizeInput(text: string): string {
    return text.substring(0, CONFIG.MAX_MESSAGE_LENGTH);
  }
}