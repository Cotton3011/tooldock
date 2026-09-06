import { describe, expect, it, vi } from 'vitest';
import { secureRandomIndex } from './random';

describe('secureRandomIndex', () => {
  it('候補範囲内の添字を返す', () => {
    vi.stubGlobal('crypto', { getRandomValues: (array: Uint32Array) => { array[0] = 7; return array; } });
    expect(secureRandomIndex(3)).toBe(1);
    vi.unstubAllGlobals();
  });

  it('空の候補を拒否する', () => {
    expect(() => secureRandomIndex(0)).toThrow('候補が必要です。');
  });
});
