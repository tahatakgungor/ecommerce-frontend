export async function register() {
  // Some Node runtimes expose a partial localStorage when started with
  // --localstorage-file but without a valid path. Normalize it to a safe API.
  const ls = globalThis.localStorage;
  if (!ls || typeof ls.getItem === "function") return;

  const memory = new Map();
  globalThis.localStorage = {
    getItem(key) {
      return memory.has(key) ? memory.get(key) : null;
    },
    setItem(key, value) {
      memory.set(String(key), String(value));
    },
    removeItem(key) {
      memory.delete(String(key));
    },
    clear() {
      memory.clear();
    },
    key(index) {
      return Array.from(memory.keys())[index] ?? null;
    },
    get length() {
      return memory.size;
    },
  };
}
