<script>
  import AnalogClock from './lib/AnalogClock.svelte';
  import DigitalClock from './lib/DigitalClock.svelte';
  import TimeToWords from './lib/TimeToWords.svelte';
  import SkyBackground from './lib/SkyBackground.svelte';
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
    loadHourFormat,
    saveHourFormat,
  } from './lib/storage.js';

  const initialPosition = loadClockPosition();

  let hours = $state(initialPosition.hours);
  let minutes = $state(initialPosition.minutes);
  let languageStyle = $state(loadLanguageStyle());
  let soundOn = $state(loadSoundOn());
  let minuteSnap = $state(loadMinuteSnap());
  let hourFormat = $state(loadHourFormat());

  // `hours` is always the real 0-23 hour; the word-reading and speech
  // logic only understand the 12-position analog dial value.
  let wordHour = $derived(hours % 12 === 0 ? 12 : hours % 12);

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
    speak(timeToWords(wordHour, minutes, languageStyle), indonesianVoice);
  }

  let speechTimer;
  $effect(() => {
    const h = wordHour;
    const m = minutes;
    const style = languageStyle;
    saveClockPosition(hours, m);

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

  function setHourFormat(format) {
    hourFormat = format;
    saveHourFormat(format);
  }

  function toggleHourFormat() {
    setHourFormat(hourFormat === '12' ? '24' : '12');
  }

  function setToCurrentTime() {
    const now = new Date();
    let m = now.getMinutes();
    if (minuteSnap === 5) m = Math.round(m / 5) * 5 % 60;
    hours = now.getHours();
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
      case 'j':
        event.preventDefault();
        toggleHourFormat();
        break;
    }
  }

  $effect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<SkyBackground {hours} {minutes} />

<div class="page">
  <header class="topbar">
    <div class="title-group">
      <h1>Detak Detik</h1>
      <p class="tagline">Yuk belajar membaca jam!</p>
    </div>
  </header>

  <main class="content">
    <AnalogClock bind:hours bind:minutes {minuteSnap} />

    <DigitalClock bind:hours bind:minutes {hourFormat} {minuteSnap} />

    <TimeToWords hours={wordHour} {minutes} style={languageStyle} />

    <div class="controls">
      <button
        class="now-btn"
        onclick={setToCurrentTime}
        title="Atur ke waktu sekarang (S)"
        aria-keyshortcuts="S"
      >
        🕐 Waktu sekarang
      </button>

      <div class="style-switch card" role="group" aria-label="Format jam">
        <button
          class:active={hourFormat === '12'}
          onclick={() => setHourFormat('12')}
          title="12 Jam (J)"
          aria-keyshortcuts="J"
        >
          12 Jam
        </button>
        <button
          class:active={hourFormat === '24'}
          onclick={() => setHourFormat('24')}
          title="24 Jam (J)"
          aria-keyshortcuts="J"
        >
          24 Jam
        </button>
      </div>

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

      <p class="hint shortcuts-hint">
        Shortcut: F santai/formal · J 12/24 jam · 1/5 mode menit · S waktu sekarang {#if speechSupported}· R putar ulang · M mute{/if}
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
    gap: 0.75rem;
  }

  .title-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .topbar h1 {
    font-size: 1.6rem;
    color: var(--color-primary);
  }

  .tagline {
    position: relative;
    margin: 0;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    font-weight: 700;
    /* Always dark: the accent bubble stays yellow in both day and night
       palettes, so this shouldn't follow the day/night text swap. */
    color: #3a2e2e;
    background: var(--color-accent);
    border-radius: 14px;
    box-shadow: var(--shadow-soft);
  }

  .tagline::before {
    content: '';
    position: absolute;
    left: -7px;
    top: 50%;
    transform: translateY(-50%);
    border-width: 6px 8px 6px 0;
    border-style: solid;
    border-color: transparent var(--color-accent) transparent transparent;
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

  @media (pointer: coarse) {
    .shortcuts-hint {
      display: none;
    }
  }
</style>
