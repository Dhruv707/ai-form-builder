const STORAGE_KEY = "submittedForms";

export function loadForms() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveForms(forms) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(forms));
}
