export const isLocalStorageAvailable = () => {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined" &&
      typeof window.localStorage.getItem === "function"
    );
  } catch (e) {
    return false;
  }
};

const getBrowserStorage = () => {
  if (!isLocalStorageAvailable()) return null;
  return window.localStorage;
};

export const setLocalStorage = (name, items) => {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.setItem(name, JSON.stringify(items));
};

export const getLocalStorage = (name) => {
  const storage = getBrowserStorage();
  if (!storage) return [];
  const data = storage.getItem(name);
  if (data) {
    return JSON.parse(data);
  } else {
    storage.setItem(name, JSON.stringify([]));
    return [];
  }
};

export const safeGetItem = (key) => {
  const storage = getBrowserStorage();
  if (!storage) return null;
  return storage.getItem(key);
};

export const safeSetItem = (key, value) => {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.setItem(key, value);
};

export const safeRemoveItem = (key) => {
  const storage = getBrowserStorage();
  if (!storage) return;
  storage.removeItem(key);
};
