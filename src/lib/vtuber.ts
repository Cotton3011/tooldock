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
