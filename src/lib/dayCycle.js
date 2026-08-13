// Sky background color across a full day, from midnight to midnight.
const COLOR_STOPS = [
  { h: 0, color: [16, 19, 43] }, // tengah malam
  { h: 5, color: [43, 47, 96] }, // dini hari
  { h: 5.5, color: [154, 99, 122] }, // menjelang fajar
  { h: 6, color: [255, 179, 122] }, // fajar
  { h: 8, color: [191, 227, 255] }, // pagi cerah
  { h: 12, color: [126, 200, 242] }, // siang
  { h: 16, color: [143, 211, 255] }, // sore awal
  { h: 18, color: [255, 157, 108] }, // senja
  { h: 18.5, color: [154, 99, 122] }, // menjelang malam
  { h: 19, color: [106, 79, 134] }, // dusk
  { h: 20, color: [43, 47, 96] }, // malam awal
  { h: 24, color: [16, 19, 43] }, // kembali tengah malam
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function rgbToCss([r, g, b]) {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

function skyColorRgb(timeDecimal) {
  const t = ((timeDecimal % 24) + 24) % 24;
  let prev = COLOR_STOPS[0];
  let next = COLOR_STOPS[COLOR_STOPS.length - 1];
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (t >= COLOR_STOPS[i].h && t <= COLOR_STOPS[i + 1].h) {
      prev = COLOR_STOPS[i];
      next = COLOR_STOPS[i + 1];
      break;
    }
  }
  const span = next.h - prev.h;
  const fraction = span === 0 ? 0 : (t - prev.h) / span;
  return [0, 1, 2].map((i) => lerp(prev.color[i], next.color[i], fraction));
}

/** Interpolates the sky background color for a continuous time-of-day value (0-24). */
export function getSkyColor(timeDecimal) {
  return rgbToCss(skyColorRgb(timeDecimal));
}

/**
 * Computes where the sun/moon sits for the given fraction (0-1) through
 * its half of the day (daytime 6am-6pm, or nighttime 6pm-6am). Stays
 * within the upper strip of the screen ("atas") the whole time, sweeping
 * left-to-right, so it's never hidden behind the clock or the cards
 * below it.
 */
function arcPosition(fraction) {
  const x = 10 + 80 * fraction;
  const y = 8 + 14 * (1 - Math.sin(Math.PI * fraction));
  return { x, y };
}

/**
 * Determines the sun/moon state for a continuous time-of-day value
 * (hours 0-23, minutes 0-59) - always based on the real clock time, so it
 * works the same whether the digital display is in 12-hour or 24-hour
 * format.
 */
export function getSkyState(hours, minutes) {
  const t = hours + minutes / 60;
  const isNight = t < 6 || t >= 18;

  let position;
  let fraction;
  if (!isNight) {
    fraction = (t - 6) / 12;
    position = t < 11 ? 'pagi' : t <= 13 ? 'siang' : 'sore';
  } else {
    const nightHour = t < 6 ? t + 24 : t;
    fraction = (nightHour - 18) / 12;
    position = null;
  }

  const { x, y } = arcPosition(fraction);

  return {
    isNight,
    position,
    bgColor: getSkyColor(t),
    bodyX: x,
    bodyY: y,
  };
}

// ---------------------------------------------------------------------
// Themed colors (clock, cards, scenery) blended continuously across the
// day instead of flipping between a fixed light/dark palette at 6am/6pm.

function smoothstep(t) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpColor(a, b, t) {
  return [0, 1, 2].map((i) => lerp(a[i], b[i], t));
}

function relativeLuminance([r, g, b]) {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

function rgbaCss([r, g, b], alpha = 1) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
}

/**
 * How "night-like" a moment is, from 0 (bright day) to 1 (dark night),
 * easing gradually through dawn (5-8) and dusk (16-19) instead of
 * flipping instantly at 6am/6pm.
 */
function nightAmount(t) {
  let raw;
  if (t <= 5) raw = 1;
  else if (t <= 8) raw = 1 - (t - 5) / 3;
  else if (t <= 16) raw = 0;
  else if (t <= 19) raw = (t - 16) / 3;
  else raw = 1;
  return smoothstep(raw);
}

// Day/night endpoints for colors that don't need to stay in contrast
// with another themed color, so they can fade on the plain night curve.
const AMBIENT_COLORS = {
  '--color-primary': ['#ff8a5b', '#ff9d73'],
  '--color-primary-dark': ['#e96b39', '#ff8a5b'],
  '--color-secondary': ['#4ecdc4', '#5fe0d6'],
  '--color-secondary-dark': ['#33a89f', '#4ecdc4'],
  '--color-accent': ['#ffd23f', '#ffe27a'],
  '--color-accent-dark': ['#e6b800', '#ffd23f'],
  '--color-success': ['#6bcb77', '#8ee89c'],
  '--color-error': ['#ff6b6b', '#ff8a8a'],
  '--color-text-muted': ['#7a6a63', '#b8abd6'],
  '--clock-border': ['#ff8a5b', '#ff9d73'],
  '--clock-tick': ['#d8c9be', '#4a4066'],
  '--clock-tick-major': ['#a89283', '#6f6293'],
  '--scenery-mountain': ['#b7cbe0', '#2c3357'],
  '--scenery-hill': ['#a3c99a', '#2a3f30'],
  '--scenery-tree': ['#7fac78', '#223a2a'],
  '--scenery-trunk': ['#8a6a4a', '#3a2c20'],
  '--scenery-cloud': ['#ffffff', '#4a4870'],
};

const CARD_LIGHT = hexToRgb('#ffffff');
const CARD_DARK = hexToRgb('#2a2340');
const FACE_LIGHT = hexToRgb('#ffffff');
const FACE_DARK = hexToRgb('#322a4a');
const INK_LIGHT = hexToRgb('#3a2e2e');
const INK_DARK = hexToRgb('#f4ecff');
const HAND_LIGHT = hexToRgb('#ff6b6b');
const HAND_DARK = hexToRgb('#ff9d73');

// Any two colors that both continuously sweep across the day (a surface
// going light->dark, its ink going dark->light) are mathematically
// guaranteed to cross at some moment - that's when contrast bottoms out.
// The fix isn't to avoid the crossing (impossible while staying
// gradual), it's to make the crossfade happen over a narrow band of the
// surface's *own* luminance rather than smearing across the whole
// transition, so the low-contrast moment is brief instead of a long,
// muddy middle stretch.
const INK_CROSSFADE_HALF_WIDTH = 0.04;

/**
 * Picks ink color from the *resolved* luminance of the surface it sits
 * on (not from the time of day directly): fully the light-surface ink
 * while the surface is still reasonably bright, fully the dark-surface
 * ink once it's reasonably dark, crossfading only through a narrow
 * luminance band right at the midpoint.
 */
function inkFor(surfaceRgb, lightInk, darkInk) {
  const L = relativeLuminance(surfaceRgb);
  const raw = (0.5 + INK_CROSSFADE_HALF_WIDTH - L) / (2 * INK_CROSSFADE_HALF_WIDTH);
  return lerpColor(lightInk, darkInk, smoothstep(raw));
}

/**
 * Resolves every themed CSS custom property for the given time, blended
 * continuously across the day so nothing snaps at 6am/6pm.
 */
export function getThemeColors(hours, minutes) {
  const t = ((hours + minutes / 60) % 24 + 24) % 24;
  const night = nightAmount(t);

  const vars = {};
  for (const [name, [light, dark]] of Object.entries(AMBIENT_COLORS)) {
    vars[name] = rgbaCss(lerpColor(hexToRgb(light), hexToRgb(dark), night));
  }

  const cardColor = lerpColor(CARD_LIGHT, CARD_DARK, night);
  vars['--color-card'] = rgbaCss(cardColor);
  vars['--color-text'] = rgbaCss(inkFor(cardColor, INK_LIGHT, INK_DARK));

  // The "Detak Detik" heading sits directly on the sky (no card behind
  // it), so its ink is chosen against the sky's *actual* color rather
  // than the simplified day/night pair above - the sky passes through
  // warm dawn/dusk hues that a plain night-amount blend wouldn't catch.
  vars['--color-heading'] = rgbaCss(inkFor(skyColorRgb(t), INK_LIGHT, INK_DARK));

  const faceColor = lerpColor(FACE_LIGHT, FACE_DARK, night);
  vars['--clock-face'] = rgbaCss(faceColor);
  const numberInk = inkFor(faceColor, INK_LIGHT, INK_DARK);
  vars['--clock-numbers'] = rgbaCss(numberInk);
  vars['--clock-hour-hand'] = rgbaCss(numberInk);
  const handInk = inkFor(faceColor, HAND_LIGHT, HAND_DARK);
  vars['--clock-minute-hand'] = rgbaCss(handInk);
  vars['--clock-center'] = rgbaCss(handInk);

  vars['--shadow-color'] = rgbaCss(
    lerpColor(hexToRgb('#3a2e2e'), [0, 0, 0], night),
    lerp(0.15, 0.4, night)
  );

  return vars;
}
