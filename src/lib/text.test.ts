import { describe, expect, it } from 'vitest';
import { getTextStats } from './text';

describe('getTextStats', () => {
  it('空入力を0として集計する', () => {
    expect(getTextStats('')).toEqual({ withBreaks: 0, withoutBreaks: 0, withoutSpaces: 0, lines: 0, words: 0 });
  });

  it('改行・空白・行・単語を集計する', () => {
    expect(getTextStats('hello world\n日本語')).toEqual({ withBreaks: 15, withoutBreaks: 14, withoutSpaces: 13, lines: 2, words: 3 });
  });

  it('大きな入力を処理する', () => {
    expect(getTextStats('あ'.repeat(100_000)).withBreaks).toBe(100_000);
  });
});
