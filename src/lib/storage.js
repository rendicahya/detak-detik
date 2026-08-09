const KEYS = {
  hours: 'detak-detik:hours',
  minutes: 'detak-detik:minutes',
  languageStyle: 'detak-detik:languageStyle',
  soundOn: 'detak-detik:soundOn',
  minuteSnap: 'detak-detik:minuteSnap',
  hourFormat: 'detak-detik:hourFormat',
};

function isStorageAvailable() {
  try {
    return typeof window !== 'undefined' && !!window.localStorage;
  } catch {
    return false;
  }
}

function readNumber(key, fallback) {
  if (!isStorageAvailable()) return fallback;
  const raw = window.localStorage.getItem(key);
  const parsed = raw === null ? NaN : Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function writeValue(key, value) {
  if (!isStorageAvailable()) return;
  window.localStorage.setItem(key, String(value));
}

export function loadClockPosition() {
  return {
    hours: readNumber(KEYS.hours, 10),
    minutes: readNumber(KEYS.minutes, 10),
  };
}

export function saveClockPosition(hours, minutes) {
  writeValue(KEYS.hours, hours);
  writeValue(KEYS.minutes, minutes);
}

export function loadLanguageStyle() {
  if (!isStorageAvailable()) return 'casual';
  const value = window.localStorage.getItem(KEYS.languageStyle);
  return value === 'formal' || value === 'casual' ? value : 'casual';
}

export function saveLanguageStyle(style) {
  writeValue(KEYS.languageStyle, style);
}

export function loadSoundOn() {
  if (!isStorageAvailable()) return true;
  const value = window.localStorage.getItem(KEYS.soundOn);
  return value === null ? true : value === 'true';
}

export function saveSoundOn(soundOn) {
  writeValue(KEYS.soundOn, soundOn);
}

export function loadMinuteSnap() {
  const value = readNumber(KEYS.minuteSnap, 5);
  return value === 1 ? 1 : 5;
}

export function saveMinuteSnap(minuteSnap) {
  writeValue(KEYS.minuteSnap, minuteSnap);
}

export function loadHourFormat() {
  if (!isStorageAvailable()) return '12';
  const value = window.localStorage.getItem(KEYS.hourFormat);
  return value === '24' ? '24' : '12';
}

export function saveHourFormat(hourFormat) {
  writeValue(KEYS.hourFormat, hourFormat);
}
