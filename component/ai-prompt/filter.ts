export async function FilterConversation(optionInformation: any) {
      // Determine conversation style
  const conversationStyle =
  optionInformation.conversation === "normal"
    ? "Gunakan gaya bahasa santai dan tidak baku, seperti manusia normal."
    : "Gunakan bahasa baku.";

    return conversationStyle;
}