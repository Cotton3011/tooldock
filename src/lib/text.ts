export interface TextStats {
  withBreaks: number;
  withoutBreaks: number;
  withoutSpaces: number;
  lines: number;
  words: number;
}

const countGraphemes = (value: string) => {
  if ('Segmenter' in Intl) {
    return Array.from(new Intl.Segmenter('ja', { granularity: 'grapheme' }).segment(value)).length;
  }
  return Array.from(value).length;
};

export function getTextStats(value: string): TextStats {
  return {
    withBreaks: countGraphemes(value),
    withoutBreaks: countGraphemes(value.replace(/\r?\n/g, '')),
    withoutSpaces: countGraphemes(value.replace(/\s/g, '')),
    lines: value.length === 0 ? 0 : value.split(/\r?\n/).length,
    words: value.trim() === '' ? 0 : value.trim().split(/\s+/).length,
  };
}
