/**
 * Auth session persistence (token + user from backend).
 */

import type { User } from '../context/AppContext';

const STORAGE_KEY = 'fleetflow_auth';

export interface StoredSession {
  token: string;
  user: User;
}

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (!data?.token || !data?.user?.id) return null;
    return data;
  } catch {
    return null;
  }
}

export function setStoredSession(session: StoredSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('auth: failed to persist session', e);
  }
}

export function clearStoredSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
