export async function SaySelf(page: any, command: any, argument: any) {
    if (command === "say" && argument) {
        await page.evaluate(() => {
          const toggleButton = document.querySelector<HTMLElement>(
            'ui-button[title="Toggle chat"] button'
          );
          if (toggleButton) {
            toggleButton.click();
          }
        });

        // Wait for the chat to toggle open (adjust the delay if needed)
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Type the message in the textarea
        await page.evaluate((text: string) => {
          const textarea = document.querySelector<HTMLTextAreaElement>(
            'textarea[aria-label="Chat message"]'
          );
          if (textarea) {
            textarea.value = text;
            const inputEvent = new Event("input", { bubbles: true });
            textarea.dispatchEvent(inputEvent);
          }
        }, argument);

        // Click the "Send message" button
        await page.evaluate(() => {
          const sendButton = document.querySelector<HTMLElement>(
            'ui-button[title="Send message (hold Shift to send without closing input)"] button'
          );
          if (sendButton) {
            sendButton.click();
          }
        });
      }
}