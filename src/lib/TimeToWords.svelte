<script>
  import { timeToWords } from './timeToWords.js';

  let { hours, minutes, style = 'casual' } = $props();

  let text = $derived(timeToWords(hours, minutes, style));
</script>

<p class="time-words">{text}</p>

<style>
  .time-words {
    font-size: clamp(1.3rem, 5vw, 2.3rem);
    line-height: 1.3;
    font-weight: 700;
    text-align: center;
    color: var(--color-primary-dark);
    margin: 0;
    min-height: calc(1.3em * 2);
    display: flex;
    align-items: center;
    justify-content: center;
    /* Sits on the sky background, which ranges from bright day to dark
       night, so it needs its own opaque backing to stay readable at
       every hour instead of just floating text. */
    background: var(--color-card);
    border-radius: 20px;
    padding: 0.4rem 1.5rem;
    box-shadow: var(--shadow-soft);
    transform: translateX(10px);
  }
</style>
