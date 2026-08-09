<script>
  let {
    hours = $bindable(10),
    minutes = $bindable(10),
    minuteSnap = 5,
  } = $props();

  let activeHand = $state(null); // 'hour' | 'minute' | null
  let bounceHour = $state(false);
  let bounceMinute = $state(false);

  const CENTER = 150;
  const NUMBERS = Array.from({ length: 12 }, (_, i) => i + 1);

  function polarPoint(angleDeg, radius) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: CENTER + radius * Math.sin(rad),
      y: CENTER - radius * Math.cos(rad),
    };
  }

  let hourAngle = $derived((hours % 12) * 30 + minutes * 0.5);
  let minuteAngle = $derived(minutes * 6);

  let hourTip = $derived(polarPoint(hourAngle, 78));
  let minuteTip = $derived(polarPoint(minuteAngle, 112));

  /**
   * Svelte action: converts pointer drag position into a clock angle
   * (0deg = 12 o'clock, clockwise) and reports it via onAngle. Shared by
   * both the hour and minute hand grab handles.
   */
  function draggable(node, { onAngle, onEnd, onStart }) {
    function toClockAngle(clientX, clientY) {
      const svg = node.ownerSVGElement;
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const angle = (Math.atan2(dx, -dy) * 180) / Math.PI;
      return (angle + 360) % 360;
    }

    function handleMove(event) {
      onAngle(toClockAngle(event.clientX, event.clientY));
    }

    function handleUp(event) {
      node.removeEventListener('pointermove', handleMove);
      node.removeEventListener('pointerup', handleUp);
      node.removeEventListener('pointercancel', handleUp);
      if (node.hasPointerCapture(event.pointerId)) {
        node.releasePointerCapture(event.pointerId);
      }
      onEnd?.();
    }

    function handleDown(event) {
      event.preventDefault();
      node.setPointerCapture(event.pointerId);
      node.addEventListener('pointermove', handleMove);
      node.addEventListener('pointerup', handleUp);
      node.addEventListener('pointercancel', handleUp);
      onStart?.();
      handleMove(event);
    }

    node.addEventListener('pointerdown', handleDown);

    return {
      destroy() {
        node.removeEventListener('pointerdown', handleDown);
      },
    };
  }

  // Captured when an hour-hand drag starts, so the hand's fractional
  // position (offset by the current minutes) doesn't cause the hour to
  // jump the instant it's touched.
  let hourDragOffset = 0;

  function handleHourAngle(angle) {
    const adjusted = ((angle - hourDragOffset) % 360 + 360) % 360;
    const hourIndex = Math.round(adjusted / 30) % 12;
    hours = hourIndex === 0 ? 12 : hourIndex;
  }

  function handleMinuteAngle(angle) {
    const rawMinutes = Math.round(angle / 6) % 60;
    minutes = Math.round(rawMinutes / minuteSnap) * minuteSnap % 60;
  }

  function endHourDrag() {
    activeHand = null;
    bounceHour = true;
    setTimeout(() => (bounceHour = false), 260);
  }

  function endMinuteDrag() {
    activeHand = null;
    bounceMinute = true;
    setTimeout(() => (bounceMinute = false), 260);
  }
</script>

<svg
  class="clock"
  viewBox="0 0 300 300"
  role="img"
  aria-label="Jam analog, jarum jam menunjuk {hours}, jarum menit menunjuk {minutes}"
>
  <circle class="face" cx="150" cy="150" r="140" />

  {#each Array.from({ length: 60 }, (_, i) => i) as tick (tick)}
    {#if tick % 5 !== 0}
      {@const p1 = polarPoint(tick * 6, 132)}
      {@const p2 = polarPoint(tick * 6, 138)}
      <line class="tick-minor" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />
    {/if}
  {/each}

  {#each NUMBERS as n (n)}
    {@const p1 = polarPoint(n * 30, 122)}
    {@const p2 = polarPoint(n * 30, 132)}
    <line class="tick-major" x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} />
    {@const numPos = polarPoint(n * 30, 100)}
    <text
      class="number"
      class:active={activeHand === 'hour' && ((hours % 12) || 12) === n}
      x={numPos.x}
      y={numPos.y}
    >
      {n}
    </text>
  {/each}

  <line
    class="hand hour-hand"
    class:bounce={bounceHour}
    x1="150"
    y1="150"
    x2={hourTip.x}
    y2={hourTip.y}
  />
  <line
    class="hand minute-hand"
    class:bounce={bounceMinute}
    x1="150"
    y1="150"
    x2={minuteTip.x}
    y2={minuteTip.y}
  />

  <circle class="center-dot" cx="150" cy="150" r="9" />

  <circle
    class="handle handle-hour"
    class:active={activeHand === 'hour'}
    cx={hourTip.x}
    cy={hourTip.y}
    r="22"
    use:draggable={{
      onAngle: handleHourAngle,
      onStart: () => {
        activeHand = 'hour';
        hourDragOffset = minutes * 0.5;
      },
      onEnd: endHourDrag,
    }}
  />
  <circle
    class="handle handle-minute"
    class:active={activeHand === 'minute'}
    cx={minuteTip.x}
    cy={minuteTip.y}
    r="20"
    use:draggable={{
      onAngle: handleMinuteAngle,
      onStart: () => (activeHand = 'minute'),
      onEnd: endMinuteDrag,
    }}
  />
</svg>

<style>
  .clock {
    width: 100%;
    max-width: 340px;
    aspect-ratio: 1;
    display: block;
    margin: 0 auto;
    touch-action: none;
    user-select: none;
  }

  .face {
    fill: var(--clock-face);
    stroke: var(--clock-border);
    stroke-width: 8;
  }

  .tick-minor {
    stroke: var(--clock-tick);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .tick-major {
    stroke: var(--clock-tick-major);
    stroke-width: 4;
    stroke-linecap: round;
  }

  .number {
    font-family: var(--font-main);
    font-size: 22px;
    font-weight: 700;
    fill: var(--clock-numbers);
    text-anchor: middle;
    dominant-baseline: middle;
    transition: fill 0.15s ease, font-size 0.15s ease;
  }

  .number.active {
    fill: var(--color-primary);
    font-size: 30px;
  }

  .hand {
    stroke-linecap: round;
    transform-origin: 150px 150px;
  }

  .hour-hand {
    stroke: var(--clock-hour-hand);
    stroke-width: 10;
  }

  .minute-hand {
    stroke: var(--clock-minute-hand);
    stroke-width: 7;
  }

  .hand.bounce {
    animation: hand-bounce 0.26s ease;
  }

  @keyframes hand-bounce {
    0% {
      transform: scale(1);
    }
    40% {
      transform: scale(1.06);
    }
    100% {
      transform: scale(1);
    }
  }

  .center-dot {
    fill: var(--clock-center);
    stroke: var(--clock-face);
    stroke-width: 3;
  }

  .handle {
    fill: transparent;
    cursor: grab;
    touch-action: none;
  }

  .handle.active {
    cursor: grabbing;
    fill: color-mix(in srgb, var(--color-primary) 18%, transparent);
  }
</style>
