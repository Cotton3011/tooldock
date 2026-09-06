export interface VtuberInput { name: string; reading: string; xUrl?: string; youtubeUrl?: string; twitchUrl?: string; }
export interface ValidationResult { valid: boolean; errors: string[]; normalizedName: string; normalizedReading: string; urls: { xUrl: string | null; youtubeUrl: string | null; twitchUrl: string | null }; }

export function normalizeVtuberText(value: string): string {
  return value.normalize('NFKC').trim().replace(/[\s\u3000]+/g, '').toLocaleLowerCase('ja-JP');
}

function unsafeText(value: string): boolean {
  return /[<>]|javascript\s*:|<\/?script|[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/iu.test(value);
}

function validProfileUrl(value: string | undefined, hosts: RegExp): string | null | false {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === 'https:' && hosts.test(url.hostname) ? url.toString() : false;
  } catch { return false; }
}

export function validateVtuberInput(input: VtuberInput): ValidationResult {
  const name = input.name?.trim() ?? '';
  const reading = input.reading?.trim() ?? '';
  const errors: string[] = [];
  const normalizedName = normalizeVtuberText(name);
  const normalizedReading = normalizeVtuberText(reading);
  if (!name) errors.push('VTuber名を入力してください。');
  if (!reading) errors.push('読み仮名を入力してください。');
  if (Array.from(name).length < 2 || Array.from(name).length > 80) errors.push('VTuber名は2〜80文字で入力してください。');
  if (Array.from(reading).length > 100) errors.push('読み仮名は100文字以内で入力してください。');
  if (unsafeText(name) || unsafeText(reading)) errors.push('使用できない文字列が含まれています。');
  if (name && !/[\p{L}\p{N}]/u.test(name)) errors.push('記号だけの名前は登録できません。');
  if (/(.)\1{7,}/u.test(normalizedName) || /https?:\/\/|www\./iu.test(name)) errors.push('スパムと判断される形式は登録できません。');
  const xUrl = validProfileUrl(input.xUrl, /^(www\.)?(x\.com|twitter\.com)$/i);
  const youtubeUrl = validProfileUrl(input.youtubeUrl, /^(www\.)?(youtube\.com|youtu\.be)$/i);
  const twitchUrl = validProfileUrl(input.twitchUrl, /^(www\.)?twitch\.tv$/i);
  if (xUrl === false) errors.push('X URLを正しいHTTPS URLで入力してください。');
  if (youtubeUrl === false) errors.push('YouTube URLを正しいHTTPS URLで入力してください。');
  if (twitchUrl === false) errors.push('Twitch URLを正しいHTTPS URLで入力してください。');
  return { valid: errors.length === 0, errors, normalizedName, normalizedReading, urls: { xUrl: xUrl || null, youtubeUrl: youtubeUrl || null, twitchUrl: twitchUrl || null } };
}

export function shouldHideReportCount(count: number): boolean { return count >= 10; }
