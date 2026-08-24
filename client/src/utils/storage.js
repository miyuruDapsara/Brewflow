import { STORAGE_KEYS } from './constants';

export function getToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

export function clearToken() {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEYS.TOKEN);
}
