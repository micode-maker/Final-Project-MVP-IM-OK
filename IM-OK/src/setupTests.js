import '@testing-library/jest-dom'

function createMemoryStorage() {
  const store = new Map()

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null
    },
    setItem(key, value) {
      store.set(String(key), String(value))
    },
    removeItem(key) {
      store.delete(String(key))
    },
    clear() {
      store.clear()
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null
    },
    get length() {
      return store.size
    },
  }
}

function ensureStorage(name) {
  const currentStorage = window[name]

  if (
    currentStorage &&
    typeof currentStorage.getItem === 'function' &&
    typeof currentStorage.setItem === 'function' &&
    typeof currentStorage.removeItem === 'function' &&
    typeof currentStorage.clear === 'function'
  ) {
    return
  }

  const fallbackStorage = createMemoryStorage()
  Object.defineProperty(window, name, {
    value: fallbackStorage,
    configurable: true,
  })
}

ensureStorage('localStorage')
ensureStorage('sessionStorage')
