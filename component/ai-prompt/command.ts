export async function CommandMenu(userMessage: any) {
  if (
    userMessage.toLowerCase().includes("command menu") ||
    userMessage.toLowerCase().includes("perintah apa saja")
  ) {
    const commandMessage = `Berikut adalah command yang dapat dijalankan: .e untuk emote .c untuk bertanya .say untuk mengulangi perkataan`;

    console.log(commandMessage);
    return commandMessage;
  }
}
