import { useEffect, useMemo, useState } from 'react';
import { trackToolUse } from '../../lib/analytics';
import { getTextStats } from '../../lib/text';
import { registerPageTool } from '../../lib/webmcp';

export default function CharacterCounter() {
  const [text, setText] = useState('');
  const stats = useMemo(() => getTextStats(text), [text]);
  const items = [
    ['入力文字数', stats.withBreaks], ['改行を含む', stats.withBreaks], ['改行を除く', stats.withoutBreaks],
    ['空白を除く', stats.withoutSpaces], ['行数', stats.lines], ['単語数', stats.words],
  ];

  useEffect(() => registerPageTool({
    name: 'count_text', title: '文字数を数える', description: '指定した文章の文字数・行数・単語数を集計します。',
    inputSchema: { type: 'object', properties: { text: { type: 'string' } }, required: ['text'], additionalProperties: false },
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: (input: unknown) => getTextStats((input as { text: string }).text),
  }), []);

  return <div className="counter-layout">
    <div className="field-stack grow">
      <div className="field-label"><label htmlFor="counter-input">文章を入力</label><button className="text-button" onClick={() => setText('')} disabled={!text}>クリア</button></div>
      <textarea id="counter-input" value={text} onChange={(event) => { setText(event.target.value); trackToolUse('character-counter', 'input'); }} placeholder="ここに文章を入力してください…" rows={12} />
    </div>
    <div className="stats-grid">{items.map(([label, value], index) => <div className={index === 0 ? 'primary-stat' : ''} key={label}><span>{label}</span><strong>{value.toLocaleString()}</strong></div>)}</div>
  </div>;
}
