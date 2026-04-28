import { STORAGE_KEYS, DEFAULT_SETTINGS } from './constants.js'

const isBrowser = typeof window !== 'undefined' && !!window.localStorage

export function loadJSON(key, fallback) {
  if (!isBrowser) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function saveJSON(key, value) {
  if (!isBrowser) return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* ignora cota cheia */
  }
}

export function removeKey(key) {
  if (!isBrowser) return
  window.localStorage.removeItem(key)
}

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...(loadJSON(STORAGE_KEYS.SETTINGS, {}) || {}) }
}

export function setSettings(next) {
  saveJSON(STORAGE_KEYS.SETTINGS, next)
}

export function uid(prefix = 'id') {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now().toString(36)}_${rand}`
}

export function nowISO() {
  return new Date().toISOString()
}
