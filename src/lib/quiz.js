/**
 * Picks a random analog clock position (hours 1-12, minutes on the given
 * snap grid) to use as a quiz target, avoiding an immediate repeat of
 * the previous target.
 */
export function generateQuizTarget(minuteSnap, avoid) {
  const steps = 60 / minuteSnap;
  let hours;
  let minutes;

  do {
    hours = Math.floor(Math.random() * 12) + 1;
    minutes = Math.floor(Math.random() * steps) * minuteSnap;
  } while (avoid && hours === avoid.hours && minutes === avoid.minutes);

  return { hours, minutes };
}

/** Whether the clock (hours 1-12, minutes 0-59) matches the quiz target. */
export function isQuizAnswerCorrect(target, hours, minutes) {
  return !!target && target.hours === hours && target.minutes === minutes;
}
