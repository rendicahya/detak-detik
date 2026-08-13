<script>
  import AnalogClock from './lib/AnalogClock.svelte';
  import DigitalClock from './lib/DigitalClock.svelte';
  import TimeToWords from './lib/TimeToWords.svelte';
  import SkyBackground from './lib/SkyBackground.svelte';
  import Quiz from './lib/Quiz.svelte';
  import MultipleChoiceQuiz from './lib/MultipleChoiceQuiz.svelte';
  import { timeToWords } from './lib/timeToWords.js';
  import { generateQuizTarget, isQuizAnswerCorrect } from './lib/quiz.js';
  import { generateMcqQuestion, sameTime } from './lib/mcqQuiz.js';
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

  let quizActive = $state(false);
  let quizTarget = $state(null);
  let quizScore = $state(0);
  let quizFeedback = $state(null); // 'correct' | 'wrong' | null
  let quizFeedbackTimer;

  function speakQuiz(text) {
    if (canSpeak && soundOn) speak(text, indonesianVoice);
  }

  function nextQuizTarget() {
    quizTarget = generateQuizTarget(minuteSnap, quizTarget);
    quizFeedback = null;
    speakQuiz(
      `Coba atur ke ${timeToWords(quizTarget.hours, quizTarget.minutes, languageStyle)}`
    );
  }

  function startQuiz() {
    quizActive = true;
    quizScore = 0;
    nextQuizTarget();
  }

  function checkQuizAnswer() {
    if (!quizActive || !quizTarget) return;
    clearTimeout(quizFeedbackTimer);

    if (isQuizAnswerCorrect(quizTarget, wordHour, minutes)) {
      quizFeedback = 'correct';
      quizScore += 1;
      speakQuiz('Hore, benar sekali!');
      quizFeedbackTimer = setTimeout(nextQuizTarget, 1600);
    } else {
      quizFeedback = 'wrong';
      speakQuiz('Coba lagi ya!');
      quizFeedbackTimer = setTimeout(() => (quizFeedback = null), 1200);
    }
  }

  function exitQuiz() {
    quizActive = false;
    quizTarget = null;
    quizFeedback = null;
    clearTimeout(quizFeedbackTimer);
  }

  function toggleQuiz() {
    if (quizActive) exitQuiz();
    else startQuiz();
  }

  // Multiple-choice quiz: a separate page from the main clock, so it
  // gets its own top-level view state instead of living inside .content.
  let mcqPage = $state(false);
  let mcqQuestion = $state(null);
  let mcqScore = $state(0);
  let mcqTotal = $state(0);
  let mcqAdvanceTimer;

  function nextMcqQuestion() {
    mcqQuestion = generateMcqQuestion(minuteSnap);
  }

  function openMcqQuiz() {
    mcqPage = true;
    mcqScore = 0;
    mcqTotal = 0;
    nextMcqQuestion();
  }

  function closeMcqQuiz() {
    mcqPage = false;
    clearTimeout(mcqAdvanceTimer);
  }

  function answerMcq(choice) {
    if (!mcqQuestion) return;
    clearTimeout(mcqAdvanceTimer);

    mcqTotal += 1;
    if (sameTime(choice, mcqQuestion.target)) {
      mcqScore += 1;
      speakQuiz('Hore, benar sekali!');
    } else {
      speakQuiz('Yah, kurang tepat. Coba lagi ya!');
    }
    mcqAdvanceTimer = setTimeout(nextMcqQuestion, 1600);
  }

  function handleKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const target = event.target;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

    if (mcqPage) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMcqQuiz();
      }
      return;
    }

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
      case 'q':
        event.preventDefault();
        toggleQuiz();
        break;
      case 'enter':
        if (quizActive) {
          event.preventDefault();
          checkQuizAnswer();
        }
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
    <h1>Detak Detik</h1>
  </header>

  {#if mcqPage}
    <MultipleChoiceQuiz
      question={mcqQuestion}
      score={mcqScore}
      total={mcqTotal}
      {minuteSnap}
      onAnswer={answerMcq}
      onExit={closeMcqQuiz}
    />
  {:else}
    <main class="content">
      <AnalogClock bind:hours bind:minutes {minuteSnap} />

      <DigitalClock bind:hours bind:minutes {hourFormat} {minuteSnap} />

      <TimeToWords hours={wordHour} {minutes} style={languageStyle} />

      <Quiz
        active={quizActive}
        target={quizTarget}
        score={quizScore}
        feedback={quizFeedback}
        {languageStyle}
        onStart={startQuiz}
        onCheck={checkQuizAnswer}
        onExit={exitQuiz}
      />

      <button class="mcq-nav-btn" onclick={openMcqQuiz} title="Kuis Pilihan Ganda">
        🧩 Kuis Pilihan Ganda
      </button>

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
          Shortcut: F santai/formal · J 12/24 jam · 1/5 mode menit · S waktu sekarang · Q kuis{#if quizActive} · Enter cek jawaban{/if} {#if speechSupported}· R putar ulang · M mute{/if}
        </p>
      </div>
    </main>
  {/if}
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding: 1rem;
    gap: 0.75rem;
  }

  /* The mountain/tree scenery is pinned to the bottom of the viewport
     behind everything, but on phones the stacked control cards are tall
     enough to scroll past the full viewport height and cover it edge to
     edge. Reserve empty space the size of that scenery strip at the end
     of the page so it has a spot to actually show through. */
  @media (max-width: 700px) {
    .page {
      padding-bottom: max(22vh, 140px);
    }
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .topbar h1 {
    font-size: 1.6rem;
    color: var(--color-heading);
    text-shadow: 0 2px 8px var(--shadow-color);
    transition: color 0.4s ease;
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

  @media (min-width: 700px) {
    .content {
      max-width: 600px;
      gap: 1.4rem;
    }
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

  .mcq-nav-btn {
    border: none;
    background: var(--color-secondary);
    color: #ffffff;
    font-weight: 700;
    font-family: inherit;
    font-size: 1rem;
    padding: 0.7rem 1.4rem;
    border-radius: 20px;
    cursor: pointer;
    box-shadow: var(--shadow-soft);
    transition: transform 0.1s ease;
  }

  .mcq-nav-btn:active {
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
