const KEY = 'health-calculator-v2';

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      form:      state.form,
      settings:  state.settings,
      savedAt:   new Date().toISOString(),
    }));
    return true;
  } catch {
    return false;
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearState() {
  localStorage.removeItem(KEY);
}
