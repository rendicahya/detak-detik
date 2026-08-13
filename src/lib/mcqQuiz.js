export function sameTime(a, b) {
  return a.hours === b.hours && a.minutes === b.minutes;
}

export function formatDigital(hours, minutes) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}`;
}

function randomTarget(minuteSnap) {
  const steps = 60 / minuteSnap;
  return {
    hours: Math.floor(Math.random() * 12) + 1,
    minutes: Math.floor(Math.random() * steps) * minuteSnap,
  };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Builds 3 wrong answer choices around the target: a minute-snap off
 * either direction, and the neighboring hour - these are the mistakes
 * kids actually make reading a clock (misreading which tick the minute
 * hand is on, or which number the hour hand is closest to), so they're
 * more useful distractors than fully random times. Any duplicates (or
 * slots left over when minuteSnap is coarse, e.g. 30) are filled with
 * random unique times.
 */
function buildDistractors(minuteSnap, target) {
  const pool = [
    { hours: target.hours, minutes: (target.minutes + minuteSnap) % 60 },
    { hours: target.hours, minutes: (target.minutes - minuteSnap + 60) % 60 },
    { hours: (target.hours % 12) + 1, minutes: target.minutes },
    { hours: ((target.hours + 10) % 12) + 1, minutes: target.minutes },
  ];

  const seen = new Set([`${target.hours}:${target.minutes}`]);
  const distractors = [];

  for (const candidate of shuffle(pool)) {
    const key = `${candidate.hours}:${candidate.minutes}`;
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(candidate);
    if (distractors.length === 3) break;
  }

  while (distractors.length < 3) {
    const candidate = randomTarget(minuteSnap);
    const key = `${candidate.hours}:${candidate.minutes}`;
    if (seen.has(key)) continue;
    seen.add(key);
    distractors.push(candidate);
  }

  return distractors;
}

/**
 * Generates one multiple-choice question: randomly either "read the
 * analog clock, pick the matching digital time" or "read the digital
 * time, pick the matching analog clock".
 */
export function generateMcqQuestion(minuteSnap) {
  const type = Math.random() < 0.5 ? 'analogToDigital' : 'digitalToAnalog';
  const target = randomTarget(minuteSnap);
  const choices = shuffle([target, ...buildDistractors(minuteSnap, target)]);
  return { type, target, choices };
}
