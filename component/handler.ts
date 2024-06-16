import AiHandler from "./ai";
import { EmotePlay } from "./emote";
import { SaySelf } from "./say";

export async function checkMessageAndClickButton(page: any): Promise<void> {
  let lastProcessedMessage = "";

  while (true) {
    const message: string = await page.evaluate(() => {
      const messageElements = Array.from(
        document.querySelectorAll<HTMLElement>(".chat-line-message")
      );
      return messageElements.length > 0
        ? messageElements[messageElements.length - 1].innerText
        : "";
    });
    const nickname: string = await page.evaluate(() => {
      const nameElements = Array.from(
        document.querySelectorAll<HTMLElement>(".chat-line-name-content")
      );
      return nameElements.length > 0
        ? nameElements[nameElements.length - 1].innerText
        : "";
    });

    if (message && message !== lastProcessedMessage) {
      const command = message.startsWith(".")
        ? message.slice(1).split(" ")[0]
        : null;
      const emoteslice = message.startsWith(".e") ? message.slice(3) : null;
      const argument = message.startsWith(".")
        ? message.slice(1).split(" ").slice(1).join(" ")
        : null;

      if (command) {
        await SaySelf(page, command, argument);
        await EmotePlay(page, emoteslice);
        await AiHandler(page, command, argument, nickname);

        lastProcessedMessage = message;
      }
    }

    // Delay before checking for new messages again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
