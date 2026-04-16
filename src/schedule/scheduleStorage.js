// // LocalStorage based appointment schedule tied to an account

// const KEY_PREFIX = 'kai:appts:';

// function keyForUser(userName) {
//   const u = (userName || '').trim();
//   return `${KEY_PREFIX}${u || 'guest'}`;
// }

// function jsonParse(json, fallback) {
//   try {
//     const v = JSON.parse(json);
//     return v ?? fallback;
//   } catch {
//     return fallback;
//   }
// }

//Appointment set up
// export function saveAppointments(userName, appts) {
//     localStorage.setItem(keyForUser(userName), JSON.stringify(appts))
// }

export async function listAppointments() {
  const res = await fetch('/api/appointments', {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Could not load appointments.');
  }
  return await res.json();
}

export async function addAppointment(appt) {
  const res = await fetch('/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      date: appt.date,
      time: appt.time,
      service: appt.service,
      vehicleId: appt.vehicleId || '',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.msg || 'Could not schedule appointment.' };
  }
  return { ok: true, appointment: data };
}

export async function removeAppointment(apptId) {
  const res = await fetch(`/api/appointments/${apptId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.msg || 'Could not cancel appointment.' };
  }
  return { ok: true };
}

export async function clearAppointments() {
  const appts = await listAppointments();
  await Promise.all(
    appts.map((a) =>
      fetch(`/api/appointments/${a._id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
    )
  );
  return { ok: true };
}