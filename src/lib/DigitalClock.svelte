<script>
  let {
    hours = $bindable(),
    minutes = $bindable(),
    hourFormat = '12',
    minuteSnap = 5,
  } = $props();

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  // `hours` is always the real 0-23 hour; only the display format differs.
  let displayHours = $derived(
    hourFormat === '24' ? hours : hours % 12 === 0 ? 12 : hours % 12
  );

  function incHour() {
    hours = (hours + 1) % 24;
  }

  function decHour() {
    hours = (hours + 23) % 24;
  }

  function incMinute() {
    const next = (minutes + minuteSnap) % 60;
    if (next < minutes) hours = (hours + 1) % 24;
    minutes = next;
  }

  function decMinute() {
    const next = (minutes - minuteSnap + 60) % 60;
    if (next > minutes) hours = (hours + 23) % 24;
    minutes = next;
  }
</script>

<div class="digital">
  <div class="digit-group">
    <button class="spin-btn" onclick={incHour} aria-label="Tambah jam">▲</button>
    <span class="digits">{pad(displayHours)}</span>
    <button class="spin-btn" onclick={decHour} aria-label="Kurangi jam">▼</button>
  </div>
  <span class="colon">:</span>
  <div class="digit-group">
    <button class="spin-btn" onclick={incMinute} aria-label="Tambah menit">▲</button>
    <span class="digits">{pad(minutes)}</span>
    <button class="spin-btn" onclick={decMinute} aria-label="Kurangi menit">▼</button>
  </div>
</div>

<style>
  .digital {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.3rem;
  }

  .digit-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
  }

  .digits {
    font-size: clamp(2.5rem, 12vw, 3.5rem);
    font-weight: 800;
    text-align: center;
    color: var(--color-text);
    letter-spacing: 0.05em;
    font-variant-numeric: tabular-nums;
    line-height: 1;
  }

  .colon {
    font-size: clamp(2.5rem, 12vw, 3.5rem);
    font-weight: 800;
    color: var(--color-secondary-dark);
    animation: blink 2s step-start infinite;
    align-self: center;
  }

  @keyframes blink {
    50% {
      opacity: 0.35;
    }
  }

  .spin-btn {
    position: relative;
    z-index: 1;
    width: 48px;
    height: 38px;
    border: none;
    border-radius: 14px;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    color: var(--color-primary);
    font-size: 1.1rem;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s ease;
  }

  .spin-btn:active {
    transform: scale(0.85);
  }
</style>
