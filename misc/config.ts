import puppeteer from "puppeteer-core";
import * as dotenv from "dotenv";

dotenv.config();

export const user_name = process.env.USER_NAME as string;
export const password = process.env.PASSWORD as string;
export const apiKey = process.env.API_KEY as string;
export const session = process.env.SESSION as string;
export const agent = process.env.USER_AGENT as string;
export const cf_clearance = process.env.CF_CLEARANCE as string;
export const model_main = process.env.LLM_main as string;
export const model_second = process.env.LLM_second as string;
export const model_third = process.env.LLM_third as string;
export const model_fourth = process.env.LLM_fourth as string;

export const setting = {
  executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: false,
  defaultViewport: null,
  args: ["--start-maximized", "--force-device-scale-factor=0.5"],
};

export class Page {
  async getBrowser() {
    return await puppeteer.launch(setting);
  }

  async getPage() {
    const browser = await this.getBrowser();
    return await browser.newPage();
  }
}
