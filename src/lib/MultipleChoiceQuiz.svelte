<script>
  import AnalogClock from './AnalogClock.svelte';
  import { formatDigital, sameTime } from './mcqQuiz.js';

  let {
    question,
    score,
    total,
    minuteSnap,
    onAnswer,
    onExit,
  } = $props();

  let selected = $state(null); // index of the clicked choice, or null

  // A new question means a fresh round of choices - clear the previous
  // pick so old correct/wrong styling doesn't carry over.
  $effect(() => {
    question;
    selected = null;
  });

  function pick(index, choice) {
    if (selected !== null || !question) return;
    selected = index;
    onAnswer(choice);
  }

  let answered = $derived(selected !== null);
  let pickedCorrect = $derived(
    answered && question && sameTime(question.choices[selected], question.target)
  );
</script>

<div class="mcq-page">
  <header class="mcq-header">
    <button class="back-btn" onclick={onExit} aria-label="Kembali ke halaman utama">
      ← Kembali
    </button>
    <span class="mcq-score">⭐ Skor: {score}/{total}</span>
  </header>

  {#if question}
    <div class="mcq-question card">
      {#if question.type === 'analogToDigital'}
        <p class="mcq-prompt">Jam berapa ini?</p>
        <AnalogClock
          hours={question.target.hours}
          minutes={question.target.minutes}
          {minuteSnap}
          interactive={false}
        />
      {:else}
        <p class="mcq-prompt">Pilih jam analog yang sesuai:</p>
        <p class="mcq-digital-target">
          {formatDigital(question.target.hours, question.target.minutes)}
        </p>
      {/if}
    </div>

    <div class="mcq-choices" class:analog-choices={question.type === 'digitalToAnalog'}>
      {#each question.choices as choice, i (i)}
        {@const isCorrectChoice = sameTime(choice, question.target)}
        <button
          class="mcq-choice"
          class:digital-choice={question.type === 'analogToDigital'}
          class:correct={answered && isCorrectChoice}
          class:wrong={selected === i && !isCorrectChoice}
          disabled={answered}
          onclick={() => pick(i, choice)}
        >
          {#if question.type === 'analogToDigital'}
            {formatDigital(choice.hours, choice.minutes)}
          {:else}
            <AnalogClock
              hours={choice.hours}
              minutes={choice.minutes}
              {minuteSnap}
              interactive={false}
              compact
            />
          {/if}
        </button>
      {/each}
    </div>

    {#if answered}
      <p class="mcq-feedback" class:correct={pickedCorrect} class:wrong={!pickedCorrect}>
        {pickedCorrect ? '🎉 Hore, benar sekali!' : 'Yah, kurang tepat. Coba lagi ya!'}
      </p>
    {/if}
  {/if}
</div>

<style>
  .mcq-page {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    max-width: 420px;
    width: 100%;
    margin: 0 auto;
  }

  @media (min-width: 700px) {
    .mcq-page {
      max-width: 600px;
      gap: 1.4rem;
    }
  }

  .mcq-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .back-btn {
    border: none;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    color: var(--color-text);
    font-weight: 700;
    font-family: inherit;
    font-size: 0.95rem;
    padding: 0.55rem 1rem;
    border-radius: 18px;
    cursor: pointer;
    transition: transform 0.1s ease;
  }

  .back-btn:active {
    transform: scale(0.95);
  }

  .mcq-score {
    font-weight: 700;
    color: var(--color-primary-dark);
  }

  .mcq-question {
    width: 100%;
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
    text-align: center;
  }

  .mcq-prompt {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--color-text-muted);
  }

  .mcq-digital-target {
    margin: 0;
    font-size: clamp(2.5rem, 12vw, 4rem);
    font-weight: 800;
    color: var(--color-text);
    letter-spacing: 0.05em;
    font-variant-numeric: tabular-nums;
  }

  .mcq-choices {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.8rem;
  }

  .mcq-choice {
    border: 3px solid transparent;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    border-radius: 20px;
    padding: 0.9rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s ease, border-color 0.2s ease;
  }

  .mcq-choice.digital-choice {
    font-family: inherit;
    font-size: clamp(1.4rem, 6vw, 2rem);
    font-weight: 800;
    color: var(--color-text);
    letter-spacing: 0.05em;
    font-variant-numeric: tabular-nums;
    padding: 1.2rem 0.6rem;
  }

  .mcq-choice:active:not(:disabled) {
    transform: scale(0.96);
  }

  .mcq-choice:disabled {
    cursor: default;
  }

  .mcq-choice.correct {
    border-color: var(--color-success);
  }

  .mcq-choice.wrong {
    border-color: var(--color-error);
  }

  .mcq-feedback {
    margin: 0;
    font-weight: 800;
    font-size: 1.05rem;
    text-align: center;
  }

  .mcq-feedback.correct {
    color: var(--color-success);
  }

  .mcq-feedback.wrong {
    color: var(--color-error);
  }
</style>
