export const bannedWord = {
    banned: ["loh!", "Loh!", "ya!", "Ya!", "cum", "sex", "pedo", "pedophile", "nigga", "negro"]
}

const bannedWordsString = bannedWord.banned.join(', ');
export const messageBanned = `Daftar kata yang dilarang: ${bannedWordsString}`;