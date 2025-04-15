# PTBot_V2

AI ChatBot for Pony Town with Natural Interactions

## Compliance Statement

⚠️ **Ethical Usage Requirements**
- Use only **one personally owned account**
- 3-second minimum action cooldown
- 150 character message limit
- Automatic session refresh every 2 hours
- No automation of core gameplay mechanics

## Environment Variables

`.env` configuration example:
```dotenv
OPENAI_API_KEY=sk-abc123
PERSONALITY_NAME=PixelHoof
IGNORE_USERS=Moderator,BotUser
RESPONSE_DELAY=2000
```

| Variable | Purpose | Default |
|----------|---------|---------|
| `RESPONSE_DELAY` | Delay between chat checks (ms) | 1500 |
| `IGNORE_USERS` | Comma-separated ignored users | - |
| `MAX_EMOTES_PER_MIN` | Emote rate limit | 5 |
| `DEBUG_MODE` | Enable debug logging | false |

## Key Features

**1. Commands:**
```bash
.help - Show help menu
.ai <text> - Generate AI response
.echo <text> - Repeat message
```

**2. Contextual Interactions**
```text
User: "This location looks scary"
Bot: /shiver "Maybe we should stick together? 👻"

User: "Agreed!"
Bot: /nod "Let's do it! 🚀"

User: "LOL that's funny"
Bot: /laugh "Glad you liked it! 😂"
```

**3. Smart Filtering**
- Ignores messages from specified users
- Avoids self-replies
- Sanitizes special characters

## Plugin Development

```typescript
// plugins/greetings.ts
export class GreetingsPlugin implements Plugin {
  name = 'Greetings';
  priority = 100;

  async handler(message: ChatMessage) {
    const triggers = ['hello', 'hi', 'hey'];
    if (triggers.some(t => message.text.toLowerCase().includes(t))) {
      await this.sendWelcome(message.sender);
      return true;
    }
    return false;
  }

  private async sendWelcome(user: string) {
    // Implementation logic
  }
}
```

## Technical Architecture

**Processing Pipeline:**
1. Message sanitization & validation
2. User filter check
3. Emotion detection → Auto-emote
4. AI context analysis
5. Response generation
6. Rate limiting enforcement

**Safety Systems:**
- Banned pattern detection
- Flood control
- Session expiration
- Input length validation

## License

MIT License