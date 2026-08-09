<script>
  import AnalogClock from './lib/AnalogClock.svelte';
  import DigitalClock from './lib/DigitalClock.svelte';
  import TimeToWords from './lib/TimeToWords.svelte';
  import ThemeToggle from './lib/ThemeToggle.svelte';
  import { timeToWords } from './lib/timeToWords.js';
  import {
    isSpeechSupported,
    findIndonesianVoice,
    speak,
  } from './lib/Speech.js';
  import {
    loadClockPosition,
    saveClockPosition,
    loadLanguageStyle,
    saveLanguageStyle,
    loadSoundOn,
    saveSoundOn,
    loadMinuteSnap,
    saveMinuteSnap,
  } from './lib/storage.js';

  const initialPosition = loadClockPosition();

  let hours = $state(initialPosition.hours);
  let minutes = $state(initialPosition.minutes);
  let languageStyle = $state(loadLanguageStyle());
  let soundOn = $state(loadSoundOn());
  let minuteSnap = $state(loadMinuteSnap());

  let speechSupported = isSpeechSupported();
  let indonesianVoice = $state(null);
  let voiceCheckDone = $state(false);

  if (speechSupported) {
    findIndonesianVoice().then((voice) => {
      indonesianVoice = voice;
      voiceCheckDone = true;
    });
  }

  let canSpeak = $derived(speechSupported && voiceCheckDone && !!indonesianVoice);

  function speakNow() {
    if (!canSpeak || !soundOn) return;
    speak(timeToWords(hours, minutes, languageStyle), indonesianVoice);
  }

  let speechTimer;
  $effect(() => {
    const h = hours;
    const m = minutes;
    const style = languageStyle;
    saveClockPosition(h, m);

    clearTimeout(speechTimer);
    speechTimer = setTimeout(() => {
      if (soundOn) speak(timeToWords(h, m, style), indonesianVoice);
    }, 500);

    return () => clearTimeout(speechTimer);
  });

  function setLanguageStyle(style) {
    languageStyle = style;
    saveLanguageStyle(style);
  }

  function toggleLanguageStyle() {
    setLanguageStyle(languageStyle === 'casual' ? 'formal' : 'casual');
  }

  function toggleSound() {
    soundOn = !soundOn;
    saveSoundOn(soundOn);
  }

  function setMinuteSnap(snap) {
    minuteSnap = snap;
    saveMinuteSnap(snap);
    if (snap === 5) {
      minutes = Math.round(minutes / 5) * 5 % 60;
    }
  }

  function setToCurrentTime() {
    const now = new Date();
    let h = now.getHours() % 12;
    if (h === 0) h = 12;
    let m = now.getMinutes();
    if (minuteSnap === 5) m = Math.round(m / 5) * 5 % 60;
    hours = h;
    minutes = m;
  }

  function handleKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const target = event.target;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

    switch (event.key.toLowerCase()) {
      case 'f':
        event.preventDefault();
        toggleLanguageStyle();
        break;
      case 'r':
        if (speechSupported) {
          event.preventDefault();
          speakNow();
        }
        break;
      case 'm':
        if (speechSupported) {
          event.preventDefault();
          toggleSound();
        }
        break;
      case 's':
        event.preventDefault();
        setToCurrentTime();
        break;
      case '1':
        event.preventDefault();
        setMinuteSnap(1);
        break;
      case '5':
        event.preventDefault();
        setMinuteSnap(5);
        break;
    }
  }

  $effect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<div class="page">
  <header class="topbar">
    <h1>Detak Detik</h1>
    <ThemeToggle />
  </header>

  <main class="content">
    <AnalogClock bind:hours bind:minutes {minuteSnap} />

    <DigitalClock {hours} {minutes} />

    <TimeToWords {hours} {minutes} style={languageStyle} />

    <div class="controls">
      <div class="style-switch card" role="group" aria-label="Mode geser menit">
        <button
          class:active={minuteSnap === 5}
          onclick={() => setMinuteSnap(5)}
          title="Per 5 Menit (5)"
          aria-keyshortcuts="5"
        >
          Per 5 Menit
        </button>
        <button
          class:active={minuteSnap === 1}
          onclick={() => setMinuteSnap(1)}
          title="Per 1 Menit (1)"
          aria-keyshortcuts="1"
        >
          Per 1 Menit
        </button>
      </div>

      <button
        class="now-btn"
        onclick={setToCurrentTime}
        title="Atur ke waktu sekarang (S)"
        aria-keyshortcuts="S"
      >
        🕐 Waktu sekarang
      </button>

      <div class="style-switch card" role="group" aria-label="Gaya bahasa">
        <button
          class:active={languageStyle === 'casual'}
          onclick={() => setLanguageStyle('casual')}
          title="Santai (F)"
          aria-keyshortcuts="F"
        >
          Santai
        </button>
        <button
          class:active={languageStyle === 'formal'}
          onclick={() => setLanguageStyle('formal')}
          title="Formal (F)"
          aria-keyshortcuts="F"
        >
          Formal
        </button>
      </div>

      {#if speechSupported}
        <div class="sound-controls">
          <button
            class="icon-btn"
            onclick={toggleSound}
            aria-label={soundOn ? 'Matikan suara' : 'Nyalakan suara'}
            title={(soundOn ? 'Matikan suara' : 'Nyalakan suara') + ' (M)'}
            aria-keyshortcuts="M"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button
            class="icon-btn"
            onclick={speakNow}
            disabled={!canSpeak || !soundOn}
            aria-label="Putar ulang suara"
            title="Putar ulang suara (R)"
            aria-keyshortcuts="R"
          >
            🔁
          </button>
        </div>
        {#if voiceCheckDone && !indonesianVoice}
          <p class="hint">
            Suara Bahasa Indonesia tidak tersedia di perangkat ini.
          </p>
        {/if}
      {/if}

      <p class="hint">
        Pintasan: F santai/formal · D tema · 1/5 mode menit · S waktu sekarang {#if speechSupported}· R putar ulang · M mute{/if}
      </p>
    </div>
  </main>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 1rem;
    gap: 0.75rem;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .topbar h1 {
    font-size: 1.6rem;
    color: var(--color-primary);
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    max-width: 420px;
    width: 100%;
    margin: 0 auto;
  }

  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
  }

  .style-switch {
    display: flex;
    padding: 0.3rem;
    gap: 0.3rem;
  }

  .style-switch button {
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    font-weight: 700;
    padding: 0.5rem 1.1rem;
    border-radius: 16px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.15s ease, color 0.15s ease, transform 0.1s ease;
  }

  .style-switch button.active {
    background: var(--color-primary);
    color: #ffffff;
  }

  .style-switch button:active {
    transform: scale(0.95);
  }

  .now-btn {
    border: none;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    color: var(--color-text);
    font-weight: 700;
    font-family: inherit;
    font-size: 1rem;
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .now-btn:active {
    transform: scale(0.95);
  }

  .sound-controls {
    display: flex;
    gap: 0.6rem;
  }

  .icon-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: none;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    font-size: 1.4rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s ease;
  }

  .icon-btn:active {
    transform: scale(0.9);
  }

  .icon-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .hint {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    text-align: center;
    margin: 0;
  }
</style>
