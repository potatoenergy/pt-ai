# PTBot_V2

AI ChatBot for Pony Town with Natural Interactions

## Compliance Statement

⚠️ **Rules Compliance**

- Use only **one account** you own
- No automation of core gameplay mechanics
- 3-second minimum delay between actions
- Messages limited to 150 characters
- Automatic session rotation every 2 hours

## Environment Variables

`.env` example:
```dotenv
LANGUAGE=ru
OPENAI_API_KEY=your-key
PERSONALITY_NAME=PixelHoof
PERSONALITY_TRAITS=friendly, observant, playful
RESPONSE_INTERVAL=180000
USER_AGENT="Mozilla/5.0 ..."
```

| Variable | Description |
|----------|-------------|
| `PERSONALITY_TRAITS` | Comma-separated: `curious`, `playful`, `witty` |
| `RESPONSE_INTERVAL` | Delay between auto-messages (ms) |
| `LANGUAGE` | `ru`/`en` - affects emotes and responses |

## Basic Interactions

**1. Commands:**
```bash
.help - Show help
.ai <текст> - Generate AI response
.echo <текст> - Repeat message
```

**2. Auto-Emotes:**
```text
User: "Это грустно..." 
Bot: /sad + "Может прогуляемся? 🌈"

User: "Согласен!"
Bot: /nod + "Точно! Давай проверим 🕵️♂️"

User: "Ха-ха смешно!"
Bot: /laugh + "Поймал настроение! 😆"
```

**3. Context Responses:**
```text
User: "Что думаешь о новой локации?"
Bot: "Выглядит эпично! Много мест для пряток 🍂"

User: "Как погода?"
Bot: "Облачно, но наши гривы не промокнут! ☁️"
```

## Plugin Example

```typescript
// plugins/greetings.ts
export class GreetingsPlugin implements Plugin {
  name = 'Greetings';
  priority = 100;

  async handler(message: ChatMessage) {
    const triggers = ['привет', 'hi', 'hola'];
    if (triggers.some(t => message.text.toLowerCase().includes(t))) {
      await this.sendWelcome(message);
      return true;
    }
    return false;
  }

  private async sendWelcome(message: ChatMessage) {
    // Implementation
  }
}
```

## Technical Details

- **Response Flow:**
  1. Message sanitization
  2. Emotion detection → Auto-emote
  3. AI context analysis
  4. Response generation
  5. Rate limiting check

- **Safety Systems:**
  - Banned word filter
  - Flood protection
  - Session expiration

## License

MIT License