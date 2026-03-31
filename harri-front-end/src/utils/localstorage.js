const isBrowser = typeof window !== "undefined";

export const setLocalStorage = (name, items) => {
  if (!isBrowser) return;
  localStorage.setItem(name, JSON.stringify(items));
};

export const getLocalStorage = (name) => {
  if (!isBrowser) return [];
  const data = localStorage.getItem(name);
  if (data) {
    return JSON.parse(data);
  } else {
    localStorage.setItem(name, JSON.stringify([]));
    return [];
  }
};
