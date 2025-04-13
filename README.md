# PTBot_V2

A Simple ChatBot for Pony Town

**Supported tags**
-----------------

* `latest` - the most recent production-ready image.

**Documentation**
----------------

### Environment Variables

Create a `.env` file based on the provided `.env.example`:

```dotenv
LANGUAGE=en
OPENAI_API_KEY=your-api-key-here
OPENAI_MODEL=your-model-here
OPENAI_BASE_URL=https://your-openai-base-url.com
PERSONALITY_NAME=PixelHoof
PERSONALITY_TRAITS=['curious', 'playful', 'expressive']
PERSONALITY_SPEECH_STYLE=Use gaming slang and character-appropriate emotes 🦄
PROMPTS_GREETING=Hey folks! Ready for some fun? 😎
PROMPTS_IDLE=Looking around... Anyone up for a dance battle? 💃
RESPONSE_INTERVAL=180000 # 3 минуты
USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chromium/134.0.0.0 Safari/537.36"
CHROMIUM_PATH=/path/to/chromium
SESSION=your-session-cookie
CF_CLEARANCE=your-clearance-cookie
```

- **OPENAI_API_KEY**: Your OpenAI API key.
- **OPENAI_MODEL**: The model to use for generating responses.
- **OPENAI_BASE_URL**: The base URL for the OpenAI API.
- **LANGUAGE**: Supported: en, ru, es, fr, etc.
- **PERSONALITY_NAME**: The name of the bot's personality.
- **PERSONALITY_TRAITS**: Traits of the bot's personality (comma-separated).
- **PERSONALITY_SPEECH_STYLE**: Style of speech for the bot.
- **PROMPTS_GREETING**: Greeting message.
- **PROMPTS_IDLE**: Idle message.
- **RESPONSE_INTERVAL**: Interval for timed responses (in milliseconds).
- **USER_AGENT**: User agent string for the browser.
- **CHROMIUM_PATH**: Path to the Chromium executable.
- **SESSION**: Session cookie for authentication.
- **CF_CLEARANCE**: Cloudflare clearance cookie.

### Creating a Simple Plugin

To create a simple plugin, add a new file in the `/plugins` directory. Here's an example:

```typescript
// plugins/example.ts
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
```

### Directory Structure

```plaintext
📦 /app
|__📁logs // Logs directory
|__📁plugins // Plugins directory
|__📁src // Source code
|  |__📁modules // Modules
|  |__📁services // Services
|  |__📁utils // Utilities
|__📃Dockerfile // Docker configuration
|__📃README.md // Documentation
|__📃.env.example // Environment variables example
```

### Technical Details

- **Response Interval**: Adjust the `RESPONSE_INTERVAL` in the `.env` file to control the bot's response timing.
- **Chromium Path**: Ensure the `CHROMIUM_PATH` is correctly set to the Chromium executable on your system.

### Acknowledgments

This project is based on the original work by [qiraxyz](https://github.com/qiraxyz/pt-ai).

## Compliance Statement

⚠️ **Important Notice Regarding Game Rules Compliance**

This project is intended to be used in strict accordance with Pony Town's official game rules. 
By using this software, you acknowledge and agree to the following:

### Account Usage
🔒 **Single Account Policy**  
- You must not use this software to manage multiple accounts simultaneously  
- The bot should only interact with **one authorized account** you personally own  
- Any form of account sharing or automation farming is strictly prohibited  

### Game Modifications
🚫 **Scripting & Automation Restrictions**  
- This bot **does not** provide any unfair competitive advantages  
- All interactions maintain natural human-like timing and limitations  
- Absolutely no game client modifications are implemented  

### Performance Considerations
🛡️ **Server Protection Measures**  
- Built-in rate limiting prevents server overload  
- Randomized delays mimic natural player behavior  
- Strict character interaction limits preserve game performance  

### Accessibility Focus
♿ **Intended Use Cases**  
This tool may be used for:  
- Assistive technologies for players with disabilities  
- Quality-of-life enhancements that don't violate game balance  
- Non-disruptive social interaction support  

❗ **Violation Warning**  
Misuse of this software that impacts other players' experience or server stability 
may result in:  
- Account suspension by game moderators  
- Blacklisting of associated IP addresses  
- Permanent ban from game services  

**Developers Disclaimer**  
This project is not affiliated with Pony Town or its developers. Use at your own risk. 
We strongly encourage:  
- Regular manual gameplay  
- Respect for all community members  
- Immediate discontinuation of use if requested by game staff  

### License

This project is licensed under the MIT License.