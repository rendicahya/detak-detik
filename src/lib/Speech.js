/** Whether the browser supports SpeechSynthesis at all. */
export function isSpeechSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Resolves once the voice list is ready and returns it. Some browsers load
 * voices asynchronously, so `getVoices()` can return an empty array on the
 * very first call.
 */
function getVoicesAsync() {
  return new Promise((resolve) => {
    const existing = window.speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }

    const handleVoicesChanged = () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged
      );
      resolve(window.speechSynthesis.getVoices());
    };

    window.speechSynthesis.addEventListener(
      'voiceschanged',
      handleVoicesChanged
    );

    // Fallback in case the event never fires.
    setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500);
  });
}

/** Finds an Indonesian (id-ID) voice, if the browser/OS provides one. */
export async function findIndonesianVoice() {
  if (!isSpeechSupported()) return null;
  const voices = await getVoicesAsync();
  return (
    voices.find((voice) => voice.lang?.toLowerCase() === 'id-id') ||
    voices.find((voice) => voice.lang?.toLowerCase().startsWith('id')) ||
    null
  );
}

/** Speaks the given text using the Indonesian voice, if available. */
export function speak(text, voice) {
  if (!isSpeechSupported()) return;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}
