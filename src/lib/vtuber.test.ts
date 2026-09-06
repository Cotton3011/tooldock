import { describe, expect, it } from 'vitest';
import { calculateEndTime, formatHashtags, progressValues } from './vtuber';

describe('VTuberツール共通ロジック', () => {
  it('ハッシュタグを整形し重複を除く', () => {
    expect(formatHashtags('配信 #VTuber 配信, 初見歓迎', ' ')).toBe('#配信 #VTuber #初見歓迎');
  });

  it('空のハッシュタグ入力を処理する', () => {
    expect(formatHashtags('   ')).toBe('');
  });

  it('日付をまたぐ終了時刻を計算する', () => {
    expect(calculateEndTime('2026-09-07', '23:30', 2, 0)?.toISOString()).toBe('2026-09-07T16:30:00.000Z');
  });

  it('不正な配信時間を拒否する', () => {
    expect(calculateEndTime('2026-09-07', '20:00', 1, 60)).toBeNull();
  });

  it('目標の達成率と残りを計算する', () => {
    expect(progressValues(350, 1000)).toEqual({ percentage: 35, remaining: 650 });
    expect(progressValues(1, 0)).toBeNull();
  });
});
