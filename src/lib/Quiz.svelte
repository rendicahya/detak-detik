<script>
  import { timeToWords } from './timeToWords.js';

  let {
    active,
    target,
    score,
    feedback,
    languageStyle,
    onStart,
    onCheck,
    onExit,
  } = $props();

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  let targetWords = $derived(
    target ? timeToWords(target.hours, target.minutes, languageStyle) : ''
  );
  let targetDigital = $derived(
    target ? `${pad(target.hours)}:${pad(target.minutes)}` : ''
  );
</script>

{#if !active}
  <button
    class="quiz-start-btn"
    onclick={onStart}
    title="Mulai Kuis (Q)"
    aria-keyshortcuts="Q"
  >
    🎯 Mulai Kuis
  </button>
{:else}
  <div
    class="quiz-card card"
    class:correct={feedback === 'correct'}
    class:wrong={feedback === 'wrong'}
  >
    <div class="quiz-header">
      <span class="quiz-score">⭐ Skor: {score}</span>
      <button
        class="quiz-exit"
        onclick={onExit}
        aria-label="Keluar dari kuis"
        title="Keluar dari kuis (Q)"
      >
        ✕
      </button>
    </div>

    <p class="quiz-prompt">Atur jarum jam ke:</p>
    <p class="quiz-target-words">{targetWords}</p>
    <p class="quiz-target-digital">{targetDigital}</p>

    <button
      class="quiz-check-btn"
      onclick={onCheck}
      title="Cek jawaban (Enter)"
      aria-keyshortcuts="Enter"
    >
      ✅ Cek Jawaban
    </button>

    {#if feedback === 'correct'}
      <p class="quiz-feedback correct">🎉 Hore, benar sekali!</p>
    {:else if feedback === 'wrong'}
      <p class="quiz-feedback wrong">Hampir! Coba lagi ya 🙂</p>
    {/if}
  </div>
{/if}

<style>
  .quiz-start-btn {
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

  .quiz-start-btn:active {
    transform: scale(0.95);
  }

  .quiz-card {
    width: 100%;
    padding: 1rem 1.2rem;
    text-align: center;
    border: 3px solid transparent;
    transition: border-color 0.2s ease;
  }

  .quiz-card.correct {
    border-color: var(--color-success);
    animation: quiz-pulse 0.4s ease;
  }

  .quiz-card.wrong {
    border-color: var(--color-accent-dark);
    animation: quiz-shake 0.4s ease;
  }

  @keyframes quiz-pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.04);
    }
    100% {
      transform: scale(1);
    }
  }

  @keyframes quiz-shake {
    0%,
    100% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-6px);
    }
    40% {
      transform: translateX(6px);
    }
    60% {
      transform: translateX(-4px);
    }
    80% {
      transform: translateX(4px);
    }
  }

  .quiz-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.4rem;
  }

  .quiz-score {
    font-weight: 700;
    color: var(--color-primary-dark);
  }

  .quiz-exit {
    border: none;
    background: transparent;
    color: var(--color-text-muted);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    padding: 0.3rem;
  }

  .quiz-prompt {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-text-muted);
    font-weight: 700;
  }

  .quiz-target-words {
    margin: 0.2rem 0 0;
    font-size: 1.3rem;
    font-weight: 800;
    color: var(--color-primary-dark);
  }

  .quiz-target-digital {
    margin: 0.1rem 0 0.6rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  .quiz-check-btn {
    border: none;
    background: var(--color-success);
    color: #1c3b1f;
    font-weight: 800;
    font-family: inherit;
    font-size: 1rem;
    padding: 0.6rem 1.4rem;
    border-radius: 18px;
    cursor: pointer;
    box-shadow: var(--shadow-soft);
    transition: transform 0.1s ease;
  }

  .quiz-check-btn:active {
    transform: scale(0.95);
  }

  .quiz-feedback {
    margin: 0.6rem 0 0;
    font-weight: 800;
    font-size: 1rem;
  }

  .quiz-feedback.correct {
    color: var(--color-success);
  }

  .quiz-feedback.wrong {
    color: var(--color-accent-dark);
  }
</style>
