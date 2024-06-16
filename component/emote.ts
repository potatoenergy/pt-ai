export async function EmotePlay(page: any, emoteslice: any) {
    console.log(emoteslice)
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