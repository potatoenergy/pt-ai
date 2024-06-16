import puppeteer from "puppeteer-core";
import { agent, setting } from "./misc/config";
import { bypassCloudflare } from "./component/bypasser";
import { AuthBot } from "./component/auth";
import { AutoPlay } from "./component/server-autoplay";
import { checkMessageAndClickButton } from "./component/handler";

async function AppInit() {
  const browser = await puppeteer.launch(setting);
  const page = await browser.newPage();
  await page.setUserAgent(agent);

  await page.goto("https://pony.town");

  await bypassCloudflare(page);

  await page.waitForSelector("p.lead", { visible: true });

  // Declare authentication and auto play game
  await AuthBot(page);
  await AutoPlay(page);

  // await page.evaluate(() => {
  //   document.body.style.transform = 'scale(0.5)';
  //   document.body.style.transformOrigin = '0 0';
  //   document.body.style.width = '200%'
  //   document.body.style.height = '200%';
  // });

  // Function to log chat messages with sender names
  async function logChatMessages() {
    let lastMessageCount = 0;

    setInterval(async () => {
      const messages = await page.evaluate(() => {
        const messageElements = Array.from(
          document.querySelectorAll(".chat-line-message")
        );
        const nameElements = Array.from(
          document.querySelectorAll(".chat-line-name-content")
        );

        return messageElements.map((element, index) => {
          const messageText = (element as HTMLElement).innerText;
          const nameText = (nameElements[index] as HTMLElement).innerText;
          return { name: nameText, message: messageText };
        });
      });

      if (messages.length > lastMessageCount) {
        messages.slice(lastMessageCount).forEach(({ name, message }) => {
          console.log(`${name}: ${message}`);
        });
        lastMessageCount = messages.length;
      }
    }, 3000); // check every 3 seconds
  }

  // Start logging chat messages
  logChatMessages();

  await checkMessageAndClickButton(page);
  //   // Keep the browser open to monitor chat messages
  //   await new Promise((resolve) => setTimeout(resolve, 60000));
}

AppInit();
