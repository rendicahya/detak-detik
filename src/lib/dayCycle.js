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

/** Interpolates the sky background color for a continuous time-of-day value (0-24). */
export function getSkyColor(timeDecimal) {
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
  const color = [0, 1, 2].map((i) => lerp(prev.color[i], next.color[i], fraction));
  return rgbToCss(color);
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
