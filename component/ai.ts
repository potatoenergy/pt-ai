import { SendChat } from "./chat";

let stopSending = false;

export default async function AiHandler(page: any, command: any, argument: any, name: any) {
    if (command === "cstop") {
        stopSending = true;
        return;
    }

    const answerAi: string | null = await SendChat(argument, name, page);

    // Check if answerAi is not null
    if (answerAi && command === "c" && argument) {
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

        // Function to send a single message part
        const sendMessagePart = async (text: string) => {
            await page.evaluate((text: string) => {
                const textarea = document.querySelector<HTMLTextAreaElement>(
                    'textarea[aria-label="Chat message"]'
                );
                if (textarea) {
                    textarea.value = text;
                    const inputEvent = new Event("input", { bubbles: true });
                    textarea.dispatchEvent(inputEvent);
                }
            }, text);

            await page.evaluate(() => {
                const sendButton = document.querySelector<HTMLElement>(
                    'ui-button[title="Send message (hold Shift to send without closing input)"] button'
                );
                if (sendButton) {
                    sendButton.click();
                }
            });

            // Optional: Wait for a short delay to ensure messages are sent in order
            await new Promise((resolve) => setTimeout(resolve, 500));
        };

        // Function to split a message into chunks of maximum 72 characters without breaking words
        const splitMessage = (message: string, maxLength: number): string[] => {
            const words = message.split(' ');
            const chunks: string[] = [];
            let currentChunk = '';

            for (const word of words) {
                if ((currentChunk + ' ' + word).trim().length > maxLength) {
                    chunks.push(currentChunk.trim());
                    currentChunk = word;
                } else {
                    currentChunk += ' ' + word;
                }
            }
            if (currentChunk) {
                chunks.push(currentChunk.trim());
            }

            return chunks;
        };

        // Split the answerAi into chunks of 82 characters
        const messageParts = splitMessage(answerAi, 72);
        for (const messagePart of messageParts) {
            if (stopSending) {
                stopSending = false; // Reset the stop flag for future calls
                break;
            }
            await sendMessagePart(messagePart);

            // Delay 4 seconds before sending the next part
            await new Promise((resolve) => setTimeout(resolve, 4000));
        }
    }
}
