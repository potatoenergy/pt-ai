export async function identityCharacter(userMessage: any, identity: any) {
  if (
    userMessage.toLowerCase().includes("siapa kamu") ||
    userMessage.toLowerCase().includes("identitas kamu") ||
    userMessage.toLowerCase().includes("identitas Aria") ||
    userMessage.toLowerCase().includes("identitas Faye")
  ) {
    const identityMessage = `Nama saya adalah ${identity.fullName}, lahir pada ${identity.birthDate.day}/${identity.birthDate.month}/${identity.birthDate.year} di ${identity.city}, ${identity.country}. Saya berbicara dengan aksen ${identity.accent}. Ayah saya adalah ${identity.father} dan ibu saya adalah ${identity.mother}.`;

    console.log(identityMessage);
    return identityMessage;
  }
}
