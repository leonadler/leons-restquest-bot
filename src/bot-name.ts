const allEmoji = '😀😁😂😃😄😅😆😉😊😋😎😍😘😗😙😚👣👀👁️👁️‍🗨👅👄💋💘❤️💓💔💕💖💗💙💚💛💜💝💞💟❣️❤️‍💋‍👨👨‍❤️‍💋‍👨👩‍❤️‍💋‍👩💑👩‍❤️‍👨👨‍❤️‍👨👩‍❤️‍👩👪👨‍👩‍👦👨‍👩‍👧👨‍👩‍👧‍👦👨‍👩‍👦‍👦👨‍👩‍👧‍👧👨‍👨‍👦👨‍👨‍👧👨‍👨‍👧‍👦👨‍👨‍👦‍👦👨‍👨‍👧‍👧👩‍👩‍👦👩‍👩‍👧👩‍👩‍👧‍👦👩‍👩‍👦‍👦👩‍👩‍👧‍👧🏻🏼🏽🏾🏿💪💪🏻💪🏼💪';

export function randomBotName() {
    return 'doombot ' +  allEmoji.charAt(Math.floor(Math.random() * allEmoji.length));
}
