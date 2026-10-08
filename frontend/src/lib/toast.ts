export type ToastKind = "success" | "error" | "info";

export interface ToastItem {
  id: number;
  kind: ToastKind;
  message: string;
}

const LIFETIME_MS = 5000;

let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit(next: ToastItem[]) {
  items = next;
  listeners.forEach((notify) => notify());
}

export function dismissToast(id: number) {
  emit(items.filter((t) => t.id !== id));
}

function push(kind: ToastKind, message: string) {
  const id = nextId++;
  emit([...items, { id, kind, message }]);
  setTimeout(() => dismissToast(id), LIFETIME_MS);
}

export const toast = {
  success: (message: string) => push("success", message),
  error: (message: string) => push("error", message),
  info: (message: string) => push("info", message),
};

export const subscribeToasts = (notify: () => void) => {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
  };
};

export const getToasts = () => items;
