let currentTypingSession = null;

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log('content.js: Message received:', request.action); // Log message received

    if (request.action === "emulateTyping") {
        console.log("content.js: Action received: emulateTyping");
        currentTypingSession = Math.random().toString(); // Create a new unique typing session identifier
        navigator.clipboard
            .readText()
            .then((clipText) => {
                console.log("content.js: Clipboard text read:", clipText); // Log clipboard text
                emulateTyping(clipText, currentTypingSession, request.delayedStart);
            });
    } else if (request.action === "stopTyping") {
        currentTypingSession = null; // Invalidate the current typing session
    }
});

// Listen for any keydown event at the window level
window.addEventListener("keydown", function () {
    currentTypingSession = null; // Invalidate the current typing session
    console.log('content.js: Keydown event detected'); // Log keydown event
});

function emulateTyping(text, session, delayedStart) {
    const activeElement = document.activeElement;
    if (!activeElement) return;

    const words = text.split(' ');
    let i = 0;

    function typeNextWord() {
        if (i < words.length && session === currentTypingSession) {
            const word = (i === 0 ? '' : ' ') + words[i];

            if (activeElement.isContentEditable) {
                document.execCommand('insertText', false, word);
            } else {
                activeElement.value += word;
                activeElement.dispatchEvent(new Event('input', { bubbles: true }));
            }

            i++;
            const delay = Math.random() * 400 + 200; // 200–600ms per word
            setTimeout(typeNextWord, delay);
        }
    }

    activeElement.focus();

    if (delayedStart) {
        setTimeout(typeNextWord, 0);
    } else {
        typeNextWord();
    }
}
