<script>
  let {
    hours = $bindable(10),
    minutes = $bindable(10),
    minuteSnap = 5,
    // When false, renders as a plain picture of the time - no drag
    // handles, no hand/number highlight state - for use as a quiz
    // question or answer choice rather than the live, editable clock.
    interactive = true,
    // Shrinks the clock for use as a small answer-choice thumbnail.
    compact = false,
  } = $props();

  let activeHand = $state(null); // 'hour' | 'minute' | null
  let bounceHour = $state(false);
  let bounceMinute = $state(false);

  const CENTER = 210;
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

  // Hour drag tracks *cumulative* rotation rather than snapping to the
  // nearest absolute position. A 12-position dial can't show AM/PM on its
  // own, so simply mapping "landed on the 12 mark" to a fixed half (AM or
  // PM) breaks at the wrap: dragging forward from 23:xx onto "12" is
  // continuing into the next day (00:00), not jumping back to noon.
  // Following the actual rotation direction/amount resolves that
  // correctly, the same way the minute hand's carry-over works.
  let hourDragStartHours = 0;
  let hourDeltaHours = 0;
  let lastHourAngle = 0;

  function handleHourAngle(angle) {
    let delta = angle - lastHourAngle;
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;
    lastHourAngle = angle;
    hourDeltaHours += delta / 30;

    hours = ((hourDragStartHours + Math.round(hourDeltaHours)) % 24 + 24) % 24;
  }

  // Minute drag tracks the *cumulative* rotation (not just the current
  // angle), so looping the hand all the way around past 12 correctly
  // carries an hour, same as the digital clock's +/- buttons.
  let minuteDragStartHours = 0;
  let minuteContinuous = 0;
  let lastMinuteAngle = 0;

  function handleMinuteAngle(angle) {
    let delta = angle - lastMinuteAngle;
    if (delta > 180) delta -= 360;
    else if (delta < -180) delta += 360;
    lastMinuteAngle = angle;
    minuteContinuous += delta / 6;

    const snapped = Math.round(minuteContinuous / minuteSnap) * minuteSnap;
    const hourDelta = Math.floor(snapped / 60);
    minutes = snapped - hourDelta * 60;
    hours = ((minuteDragStartHours + hourDelta) % 24 + 24) % 24;
  }

  function endHourDrag() {
    activeHand = null;
    bounceHour = true;
    setTimeout(() => (bounceHour = false), 260);
  }

  function endMinuteDrag() {
    activeHand = null;
    bounceMinute = true;
    if (hours !== minuteDragStartHours) bounceHour = true;
    setTimeout(() => {
      bounceMinute = false;
      bounceHour = false;
    }, 260);
  }
</script>

<svg
  class="clock"
  class:compact
  viewBox="0 0 420 420"
  role="img"
  aria-label="Jam analog, jarum jam menunjuk {(hours % 12) || 12}, jarum menit menunjuk {minutes}"
>
  <circle class="face" cx="210" cy="210" r="140" />

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
    {@const minuteValue = (n % 12) * 5}
    {@const minutePos = polarPoint(n * 30, 160)}
    <text
      class="minute-label"
      class:active={activeHand === 'minute' && minutes === minuteValue}
      x={minutePos.x}
      y={minutePos.y}
    >
      {minuteValue === 0 ? 60 : minuteValue}
    </text>
  {/each}

  <line
    class="hand hour-hand"
    class:bounce={bounceHour}
    x1="210"
    y1="210"
    x2={hourTip.x}
    y2={hourTip.y}
  />
  <line
    class="hand minute-hand"
    class:bounce={bounceMinute}
    x1="210"
    y1="210"
    x2={minuteTip.x}
    y2={minuteTip.y}
  />

  <circle class="center-dot" cx="210" cy="210" r="12" />

  {#if interactive}
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
          hourDragStartHours = hours;
          hourDeltaHours = 0;
          lastHourAngle = (hours % 12) * 30 + minutes * 0.5;
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
        onStart: () => {
          activeHand = 'minute';
          minuteDragStartHours = hours;
          minuteContinuous = minutes;
          lastMinuteAngle = minutes * 6;
        },
        onEnd: endMinuteDrag,
      }}
    />
  {/if}
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

  @media (min-width: 700px) {
    .clock {
      max-width: 480px;
    }
  }

  .clock.compact {
    max-width: 140px;
  }

  @media (min-width: 700px) {
    .clock.compact {
      max-width: 160px;
    }
  }

  .face {
    fill: var(--clock-face);
    stroke: var(--clock-border);
    stroke-width: 8;
    transition: fill 0.4s ease, stroke 0.4s ease;
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

  .minute-label {
    font-family: var(--font-main);
    font-size: 15px;
    font-weight: 700;
    fill: var(--color-text-muted);
    text-anchor: middle;
    dominant-baseline: middle;
    transition: fill 0.15s ease, font-size 0.15s ease;
  }

  .minute-label.active {
    fill: var(--clock-minute-hand);
    font-size: 19px;
  }

  .hand {
    stroke-linecap: round;
    transform-origin: 210px 210px;
    transition: stroke 0.4s ease;
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
    fill: var(--clock-hour-hand);
    stroke: var(--clock-face);
    stroke-width: 3;
    transition: fill 0.4s ease, stroke 0.4s ease;
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
