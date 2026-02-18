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
export function getProfile(userName) {
  return jsonParse(localStorage.getItem(key(PROFILE_PREFIX, userName)), { displayName: '' });
}

export function setProfile(userName, profile) {
  localStorage.setItem(key(PROFILE_PREFIX, userName), JSON.stringify(profile));
}

export function clearProfile(userName) {
  localStorage.removeItem(key(PROFILE_PREFIX, userName));
}

//cars set up
export function listCars(userName) {
  const raw = localStorage.getItem(key(CARS_PREFIX, userName));
  const cars = jsonParse(raw, []);
  return Array.isArray(cars) ? cars : [];
}

export function saveCars(userName, cars) {
  localStorage.setItem(key(CARS_PREFIX, userName), JSON.stringify(cars));
}

export function addCar(userName, car) {
  const cars = listCars(userName);