const UNITS = [
  'nol',
  'satu',
  'dua',
  'tiga',
  'empat',
  'lima',
  'enam',
  'tujuh',
  'delapan',
  'sembilan',
];

/** Converts an integer 0-59 into Indonesian words. */
export function numberToWords(n) {
  if (n === 0) return 'nol';
  if (n < 10) return UNITS[n];
  if (n === 10) return 'sepuluh';
  if (n === 11) return 'sebelas';
  if (n < 20) return `${UNITS[n - 10]} belas`;

  const tens = Math.floor(n / 10);
  const rest = n % 10;
  return `${UNITS[tens]} puluh${rest ? ` ${UNITS[rest]}` : ''}`;
}

/**
 * Converts an analog clock position (hours 1-12, minutes 0-59) into an
 * Indonesian sentence describing the time, in "formal" or "casual" style.
 */
export function timeToWords(hours, minutes, style = 'casual') {
  const hour = ((hours - 1) % 12) + 1;
  const nextHour = (hour % 12) + 1;
  const hourWord = numberToWords(hour);
  const nextHourWord = numberToWords(nextHour);

  let result;

  if (style === 'casual') {
    if (minutes === 0) result = `jam ${hourWord}`;
    else if (minutes === 15) result = `jam ${hourWord} seperempat`;
    else if (minutes === 30) result = `jam setengah ${nextHourWord}`;
    else if (minutes === 45) result = `jam ${nextHourWord} kurang seperempat`;
    else if (minutes < 45) result = `jam ${hourWord} lebih ${numberToWords(minutes)}`;
    else result = `jam ${nextHourWord} kurang ${numberToWords(60 - minutes)}`;
  } else {
    // formal
    result =
      minutes === 0
        ? `pukul ${hourWord}`
        : `pukul ${hourWord} lebih ${numberToWords(minutes)} menit`;
  }

  return result.charAt(0).toUpperCase() + result.slice(1);
}
