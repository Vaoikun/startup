const PROFILE_PREFIX = 'kai:profile:';
const CARS_PREFIX = 'kai:cars:';

function key(prefix, userName) {
    return `${prefix}${(userName || '').trim()}`;
}

function jsonParse(json, fallback) {
    try {
        const v = JSON.parse(json);
        return v ?? fallback;
    } catch {
        return fallback;
    }
}

//Profile set up
export async function getProfile() {
  const res = await fetch('/api/account', {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Could not load account profile.');
  }

  return await res.json();
}

export async function setProfile(profile) {
  const res = await fetch('/api/account', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      displayName: profile.displayName ?? '',
    }),
  });
    const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.msg || 'Could not save profile.' };
  }
  return { ok: true, profile: data };
}

export async function clearProfile() {
  const res = await fetch('/api/account', {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    throw new Error('Could not delete account.');
  }
  return { ok: true };
}


//cars set up
export async function listCars() {
  const res = await fetch('/api/vehicles', {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Could not load vehicles.');
  }
  return await res.json();
}

export function saveCars(userName, cars) {
    localStorage.setItem(key(CARS_PREFIX, userName), JSON.stringify(cars));
}

export async function addCar(car) {
  const res = await fetch('/api/vehicles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(car),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { ok: false, error: data.msg || 'Could not add car.' };
  }
  return { ok: true, car: data };
}

export async function removeCar(carId) {
  const res = await fetch(`/api/vehicles/${carId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!res.ok && res.status !== 204) {
    const data = await res.json().catch(() => ({}));
    return { ok: false, error: data.msg || 'Could not remove car.' };
  }
  return { ok: true };
}

export async function clearCars() {
  // no separate API endpoint needed because deleting the account clears vehicles
  return { ok: true };
}