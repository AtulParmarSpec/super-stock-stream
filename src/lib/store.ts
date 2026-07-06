// Simple client-side pub/sub store so mock arrays stay reactive across the app.
import { useSyncExternalStore } from "react";

const listeners = new Set<() => void>();
let version = 0;

export function bump() {
  version++;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot() {
  return version;
}

export function useStore(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`;
}
