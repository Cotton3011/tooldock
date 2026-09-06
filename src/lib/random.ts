export function secureRandomIndex(length: number): number {
  if (!Number.isInteger(length) || length <= 0) throw new Error('候補が必要です。');
  const max = Math.floor(0x100000000 / length) * length;
  const values = new Uint32Array(1);
  do crypto.getRandomValues(values); while (values[0] >= max);
  return values[0] % length;
}

export function createUuid(): string {
  return crypto.randomUUID();
}
