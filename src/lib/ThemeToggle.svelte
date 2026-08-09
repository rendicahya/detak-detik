<script>
  import { loadTheme, saveTheme } from './storage.js';

  function systemPrefersDark() {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
    );
  }

  let theme = $state(loadTheme() ?? (systemPrefersDark() ? 'dark' : 'light'));

  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });

  function toggleTheme() {
    theme = theme === 'dark' ? 'light' : 'dark';
    saveTheme(theme);
  }

  function handleKeydown(event) {
    if (event.ctrlKey || event.altKey || event.metaKey) return;
    const target = event.target;
    if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;

    if (event.key.toLowerCase() === 'd') {
      event.preventDefault();
      toggleTheme();
    }
  }

  $effect(() => {
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  });
</script>

<button
  class="theme-toggle"
  onclick={toggleTheme}
  aria-label={theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
  title={(theme === 'dark' ? 'Mode terang' : 'Mode gelap') + ' (D)'}
  aria-keyshortcuts="D"
>
  {#if theme === 'dark'}
    ☀️
  {:else}
    🌙
  {/if}
</button>

<style>
  .theme-toggle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: none;
    background: var(--color-card);
    box-shadow: var(--shadow-soft);
    font-size: 1.4rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .theme-toggle:active {
    transform: scale(0.9);
  }
</style>
