<script>
  import { getSkyState } from './dayCycle.js';

  let { hours, minutes } = $props();

  let sky = $derived(getSkyState(hours, minutes));

  $effect(() => {
    document.documentElement.dataset.sky = sky.isNight ? 'night' : 'day';
  });

  const STARS = [
    { x: 8, y: 10, size: 0.9 },
    { x: 20, y: 22, size: 0.6 },
    { x: 33, y: 8, size: 0.7 },
    { x: 47, y: 26, size: 0.5 },
    { x: 60, y: 12, size: 0.8 },
    { x: 74, y: 24, size: 0.6 },
    { x: 87, y: 9, size: 0.9 },
    { x: 93, y: 30, size: 0.55 },
    { x: 15, y: 40, size: 0.5 },
    { x: 68, y: 42, size: 0.6 },
  ];

  const BIRDS = [
    { x: 25, y: 18 },
    { x: 38, y: 11 },
    { x: 78, y: 20 },
  ];
</script>

<div
  class="sky-bg"
  class:night={sky.isNight}
  style="background-color: {sky.bgColor};"
  aria-hidden="true"
>
  {#if sky.isNight}
    {#each STARS as star, i (i)}
      <span
        class="star"
        style="left: {star.x}%; top: {star.y}%; font-size: {star.size}rem; animation-delay: {(i % 5) * 0.4}s;"
      >
        ⭐
      </span>
    {/each}
  {:else}
    {#each BIRDS as bird, i (i)}
      <span
        class="bird"
        style="left: {bird.x}%; top: {bird.y}%; animation-delay: {i * 0.5}s;"
      >
        🐦
      </span>
    {/each}
  {/if}

  <span class="body" style="left: {sky.bodyX}%; top: {sky.bodyY}%;">
    {sky.isNight ? '🌙' : '☀️'}
  </span>
</div>

<style>
  .sky-bg {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    transition: background-color 1s ease;
  }

  .body {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: clamp(2.5rem, 8vw, 3.5rem);
    line-height: 1;
    transition: left 0.6s ease, top 0.6s ease;
    filter: drop-shadow(0 4px 10px rgba(0, 0, 0, 0.2));
  }

  .star {
    position: absolute;
    transform: translate(-50%, -50%);
    line-height: 1;
    animation: twinkle 2.4s ease-in-out infinite;
  }

  @keyframes twinkle {
    0%,
    100% {
      opacity: 0.25;
    }
    50% {
      opacity: 1;
    }
  }

  .bird {
    position: absolute;
    transform: translate(-50%, -50%);
    font-size: 1.3rem;
    line-height: 1;
    animation: bob 3s ease-in-out infinite;
  }

  @keyframes bob {
    0%,
    100% {
      transform: translate(-50%, -50%) translateY(0);
    }
    50% {
      transform: translate(-50%, -50%) translateY(-6px);
    }
  }
</style>
