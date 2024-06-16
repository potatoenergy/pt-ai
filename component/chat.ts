import Groq from "groq-sdk";
import { apiKey, model_third } from "../misc/config";
import { FilterConversation } from "./ai-prompt/filter";
import { identity, optionInformation, personality } from "./ai-prompt/character";
import { identityCharacter } from "./ai-prompt/identity";
import { CommandMenu } from "./ai-prompt/command";
import { expressionCharacter } from "./ai-prompt/expression";

// Define types for messages and conversation log
interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

// Initialize an array to keep conversation logs
const conversationLog: Message[] = [];

export async function SendChat(userMessage: string, name: string, page: any): Promise<string> {
  const groq = new Groq({ apiKey: apiKey });

  // Save the user message to the conversation log
  conversationLog.push({ role: "user", content: userMessage + ' yang berbicara kepada mu adalah :' + name });

  // Check if the user message contains any emote command
  let emoteCommand: string | null = null;
  for (const [key, values] of Object.entries(expressionCharacter)) {
    if (values.some(value => userMessage.toLowerCase().includes(value.toLowerCase()))) {
      emoteCommand = key;
      break;
    }
  }

  // Perform emote action if command found
  if (emoteCommand) {
    await EmotePlay(page, emoteCommand);
  }

  // Generate the system message with current date
  const systemMessage: string = `
  your name is ${identity.fullName}. 
  Kamu dibuat pada ${identity.birthDate.day}/${identity.birthDate.month}/${identity.birthDate.year} 
  di ${identity.city}, ${identity.country}. 
  kamu berbicara dengan aksen ${identity.accent}. 
  Papa kamu adalah ${identity.father} dan Bunda kamu adalah ${identity.mother}.
  Your owner is ${optionInformation.owner}. 
  Please ensure your response is a ${identity.accent} accent.
  Please ensure your response is no longer than ${optionInformation.LengthConversation} characters per sentence.
  Please respond in Indonesian. ${FilterConversation(optionInformation)}
  kamu harus ingat bahwa hari ini adalah hari ${new Date()}
  kamu juga mempunyai sifat seperti ${personality.character}
  dan kamu juga mempunyai watak seperti ${personality.personality}`;

  // Add the system message and the user message to the messages array
  const messages: Message[] = [
    { role: "system", content: systemMessage },
    ...conversationLog
  ];

  // Check if the user message asks for available commands
  await CommandMenu(userMessage);

  // Check if the user message asks about AI's identity
  await identityCharacter(userMessage, identity);

  // Generate the chat completion response
  const chatCompletion = await groq.chat.completions.create({
    messages: messages,
    model: model_third,
  });

  // Ensure the response is not null
  const reply = chatCompletion.choices[0].message.content;
  if (reply !== null) {
    // Save the AI's response to the conversation log
    conversationLog.push({ role: "assistant", content: reply });

    console.log(reply);

    return reply;
  } else {
    throw new Error("The response from the AI was null");
  }
}

// Function to trigger emote action on the webpage
export async function EmotePlay(page: any, emoteslice: any) {
  console.log(emoteslice);
  if (emoteslice) {
    await page.evaluate((cmd: string) => {
      const button = document.querySelector<HTMLElement>(
        `button[title="${cmd.charAt(0).toUpperCase() + cmd.slice(1)}"]`
      );
      if (button) {
        button.click();
      }
    }, emoteslice);
  }
}
