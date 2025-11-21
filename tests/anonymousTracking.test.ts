import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getAnonymousViewCount,
  incrementAnonymousViewCount,
  resetAnonymousViewCount,
  hasReachedViewLimit,
  getRemainingViews,
} from '../src/lib/anonymousTracking';

// Simple in-memory localStorage mock for tests
class LocalStorageMock {
  store: Record<string, string> = {};
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] ?? null; }
  setItem(key: string, value: string) { this.store[key] = value; }
  removeItem(key: string) { delete this.store[key]; }
}

describe('anonymousTracking utilities', () => {
  beforeEach(() => {
    // @ts-ignore - set a global localStorage and window for node environment
    global.window = global as any;
    global.localStorage = new LocalStorageMock();
  });

  afterEach(() => {
    // cleanup
    // @ts-ignore
    delete global.localStorage;
    // @ts-ignore
    delete global.window;
  });

  it('defaults to 0 and increments properly', () => {
    expect(getAnonymousViewCount()).toBe(0);
    expect(incrementAnonymousViewCount()).toBe(1);
    expect(getAnonymousViewCount()).toBe(1);
    expect(incrementAnonymousViewCount()).toBe(2);
    expect(getRemainingViews()).toBe(8);
  });

  it('resets and prevents more than limit', () => {
    resetAnonymousViewCount();
    expect(getAnonymousViewCount()).toBe(0);
    for (let i = 0; i < 10; i++) incrementAnonymousViewCount();
    expect(hasReachedViewLimit()).toBe(true);
    expect(getRemainingViews()).toBe(0);
  });
});
