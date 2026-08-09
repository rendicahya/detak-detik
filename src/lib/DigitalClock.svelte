<script>
  let { hours, minutes } = $props();

  function pad(n) {
    return String(n).padStart(2, '0');
  }
</script>

<div class="digital">{pad(hours)}<span class="colon">:</span>{pad(minutes)}</div>

<style>
  .digital {
    font-size: clamp(2.5rem, 12vw, 3.5rem);
    font-weight: 800;
    text-align: center;
    color: var(--color-text);
    letter-spacing: 0.05em;
    font-variant-numeric: tabular-nums;
  }

  .colon {
    color: var(--color-secondary-dark);
    animation: blink 2s step-start infinite;
  }

  @keyframes blink {
    50% {
      opacity: 0.35;
    }
  }
</style>
