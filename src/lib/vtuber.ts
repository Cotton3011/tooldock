export function formatHashtags(input: string, separator: '\n' | ' ' = '\n'): string {
  const tags = input.split(/[\s,、]+/).map((tag) => tag.replace(/^#+/, '').replace(/\s+/g, '')).filter(Boolean);
  return [...new Set(tags)].map((tag) => `#${tag}`).join(separator);
}

export function calculateEndTime(date: string, time: string, hours: number, minutes: number): Date | null {
  if (!date || !time || hours < 0 || minutes < 0 || minutes > 59 || hours > 168) return null;
  const start = new Date(`${date}T${time}:00`);
  if (Number.isNaN(start.getTime())) return null;
  return new Date(start.getTime() + (hours * 60 + minutes) * 60_000);
}

export function progressValues(current: number, goal: number) {
  if (!Number.isFinite(current) || !Number.isFinite(goal) || goal <= 0 || current < 0) return null;
  return { percentage: current / goal * 100, remaining: Math.max(0, goal - current) };
}

export function randomItem<T>(items: T[]): T {
  if (!items.length) throw new Error('候補がありません。');
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return items[values[0] % items.length];
}

export function formatChapters(input: string): string {
  return input.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const match = line.match(/^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})\s*[-–—]?\s*(.+)$/);
    if (!match) return null;
    const [, hours, minutes, seconds, title] = match;
    return `${hours ? `${Number(hours)}:` : ''}${String(Number(minutes)).padStart(hours ? 2 : 1, '0')}:${seconds} ${title.trim()}`;
  }).filter((line): line is string => Boolean(line)).join('\n');
}

export function assignRoles(names: string[], roles: string[]): string[] {
  if (!names.length || !roles.length) return [];
  const shuffled = [...roles].sort(() => Math.random() - .5);
  return names.map((name, index) => `${name}：${shuffled[index % shuffled.length]}`);
}
