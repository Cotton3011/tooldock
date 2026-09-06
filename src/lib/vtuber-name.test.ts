import { describe, expect, it } from 'vitest';
import { normalizeVtuberText, shouldHideReportCount, validateVtuberInput } from './vtuber-name';

describe('VTuber名前登録の検証', () => {
  it('日本語名と前後空白を正規化する', () => expect(normalizeVtuberText('  星 空 ルナ　')).toBe('星空ルナ'));
  it('英数字名の大文字小文字を正規化する', () => expect(normalizeVtuberText('VTool 123')).toBe('vtool123'));
  it('正しいプロフィールURLを受け付ける', () => expect(validateVtuberInput({ name:'星空ルナ', reading:'ほしぞらるな', xUrl:'https://x.com/luna' }).valid).toBe(true));
  it('不正URLを拒否する', () => expect(validateVtuberInput({ name:'星空ルナ', reading:'るな', youtubeUrl:'http://example.com/a' }).valid).toBe(false));
  it('XSSと記号だけの入力を拒否する', () => expect(validateVtuberInput({ name:'<script>alert(1)</script>', reading:'***' }).valid).toBe(false));
  it('空入力を拒否する', () => expect(validateVtuberInput({ name:'', reading:'' }).errors.length).toBeGreaterThan(0));
  it('10件到達時だけ非表示条件を満たす', () => { expect(shouldHideReportCount(9)).toBe(false); expect(shouldHideReportCount(10)).toBe(true); });
});
