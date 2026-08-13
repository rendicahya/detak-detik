<script>
  import { getSkyState, getThemeColors } from './dayCycle.js';

  let { hours, minutes } = $props();

  let sky = $derived(getSkyState(hours, minutes));
  let theme = $derived(getThemeColors(hours, minutes));

  $effect(() => {
    // Still used to pick day/night decorations (stars vs birds, sun vs
    // moon) and the OS-level scrollbar/UI hint - the actual color
    // palette below no longer depends on this boolean, it blends
    // continuously with the time of day instead.
    document.documentElement.dataset.sky = sky.isNight ? 'night' : 'day';
    document.documentElement.style.colorScheme = sky.isNight ? 'dark' : 'light';
  });

  $effect(() => {
    const root = document.documentElement.style;
    for (const [name, value] of Object.entries(theme)) {
      root.setProperty(name, value);
    }
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

  const CLOUDS = [
    { x: 15, y: 15, scale: 1 },
    { x: 82, y: 26, scale: 0.8 },
    { x: 55, y: 8, scale: 0.65 },
  ];

  const TREES = [
    { x: 45, y: 96, scale: 1 },
    { x: 320, y: 90, scale: 1.2 },
    { x: 365, y: 100, scale: 0.8 },
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
    {#each CLOUDS as cloud, i (i)}
      <svg
        class="cloud"
        style="left: {cloud.x}%; top: {cloud.y}%; --cloud-scale: {cloud.scale}; animation-delay: {i * 2}s;"
        viewBox="-24 -14 48 28"
      >
        <ellipse cx="0" cy="2" rx="20" ry="11" />
        <ellipse cx="-13" cy="-2" rx="12" ry="9" />
        <ellipse cx="12" cy="-3" rx="13" ry="10" />
      </svg>
    {/each}
  {/if}

  <span class="body" style="left: {sky.bodyX}%; top: {sky.bodyY}%;">
    {sky.isNight ? '🌙' : '☀️'}
  </span>

  <svg class="landscape" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden="true">
    <path
      class="mountain"
      d="M0,120 L0,55 L40,20 L80,50 L130,15 L180,45 L230,25 L280,55 L330,30 L400,50 L400,120 Z"
    />
    <path
      class="hill"
      d="M0,120 L0,85 C50,55 100,95 150,70 C200,50 250,90 300,65 C340,48 370,80 400,70 L400,120 Z"
    />
    {#each TREES as tree, i (i)}
      <g transform="translate({tree.x} {tree.y}) scale({tree.scale})">
        <rect class="trunk" x="-3" y="0" width="6" height="14" rx="2" />
        <circle class="foliage" cx="0" cy="-8" r="13" />
      </g>
    {/each}
  </svg>
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

  .cloud {
    position: absolute;
    width: calc(90px * var(--cloud-scale));
    height: calc(52px * var(--cloud-scale));
    transform: translate(-50%, -50%);
    fill: var(--scenery-cloud);
    opacity: 0.85;
    animation: drift 26s ease-in-out infinite;
  }

  @keyframes drift {
    0%,
    100% {
      margin-left: 0;
    }
    50% {
      margin-left: 18px;
    }
  }

  .landscape {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 22vh;
    min-height: 130px;
  }

  .mountain {
    fill: var(--scenery-mountain);
    transition: fill 1s ease;
  }

  .hill {
    fill: var(--scenery-hill);
    transition: fill 1s ease;
  }

  .trunk {
    fill: var(--scenery-trunk);
  }

  .foliage {
    fill: var(--scenery-tree);
  }
</style>
