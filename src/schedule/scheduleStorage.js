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

export function saveAppointments(userName, appts) {
    localStorage.setItem(keyForUser(userName), JSON.stringify(appts))
}

export function listAppointments(userName) {
    const raw = localStorage.getItem(keyForUser(userName));
    const appts = jsonParse(raw, []);
    // Ensure consistent shape
    return Array.isArray(appts) ? appts : [];
}

export function addAppointment(userName, appt) {
    const appts = listAppointments(userName);

    // Prevent duplicates
    const dup = appts.some(
        (a) => a.date === appt.date && a.time === appt.time
    );
    if (dup) {
        return { ok: false, error: 'That time slot is already booked for this account.' };
    }
    appts.push(appt);
    saveAppointments(userName, appts);
    return { ok: true };
}

export function removeAppointment(userName, apptId) {
    const appts = listAppointments(userName);
    const next = appts.filter((a) => a.id !== apptId);
    saveAppointments(userName, next);
    return next.length !== appts.length;
}

export function clearAppointments(userName) {
    localStorage.removeItem(keyForUser(userName));
}