"use client";

import {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";

type CartCtx = {
  /** Number of copies of the product in the cart (single-product store). */
  qty: number;
  /** Kept for API compatibility — the store is hydration-safe via SSR snapshot. */
  ready: boolean;
  add: () => void;
  setQty: (n: number) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "cart_qty";
// Soft UI cap, set from the live content by CartProvider. The server pricing
// route clamps authoritatively, so this is only for the quantity stepper.
let MAX = 99;

const clamp = (n: number) => Math.max(0, Math.min(MAX, Math.floor(n) || 0));

// --- External store backed by localStorage --------------------------------
// Using useSyncExternalStore keeps reads SSR-safe (server snapshot is 0, so no
// hydration mismatch) and avoids setState-in-effect.
let memoryQty = 0; // fallback when localStorage is unavailable
const listeners = new Set<() => void>();

function readQty(): number {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? clamp(parseInt(raw, 10)) : 0;
  } catch {
    return memoryQty;
  }
}

function writeQty(n: number) {
  const v = clamp(n);
  memoryQty = v;
  try {
    localStorage.setItem(KEY, String(v));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function CartProvider({
  maxQty = 99,
  children,
}: {
  maxQty?: number;
  children: React.ReactNode;
}) {
  MAX = maxQty;
  const qty = useSyncExternalStore(subscribe, readQty, () => 0);

  const add = useCallback(() => writeQty(readQty() + 1), []);
  const setQty = useCallback((n: number) => writeQty(n), []);
  const clear = useCallback(() => writeQty(0), []);

  return (
    <Ctx.Provider value={{ qty, ready: true, add, setQty, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used within CartProvider");
  return c;
}
