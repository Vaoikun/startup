// LocalStorage based appointment schedule tied to an account

const KEY_PREFIX = 'kai:appts:';

function keyForUser(userName) {
  const u = (userName || '').trim();
  return `${KEY_PREFIX}${u || 'guest'}`;
}

function jsonParse(json, fallback) {
  try {
    const v = JSON.parse(json);
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

export function saveAppointment(userName, appts) {
    localStorage.setItem(keyForUser(userName), JSON.stringify(appts))
}