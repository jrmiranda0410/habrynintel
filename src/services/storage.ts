export function readStorage<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(`habryn:${key}`)
    return value ? (JSON.parse(value) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(`habryn:${key}`, JSON.stringify(value))
}
