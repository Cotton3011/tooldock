import { useEffect, useState } from 'react';
import { trackCopy, trackToolUse } from '../../lib/analytics';
import { createUuid } from '../../lib/random';
import { registerPageTool } from '../../lib/webmcp';

const clamp = (value: number) => Math.min(100, Math.max(1, Number.isFinite(value) ? Math.floor(value) : 1));

export default function UuidGenerator() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const generate = () => { setUuids(Array.from({ length: clamp(count) }, createUuid)); trackToolUse('uuid-generator', 'generate'); };
  const copy = async (text: string) => { await navigator.clipboard.writeText(text); trackCopy('uuid-generator'); };
  useEffect(generate, []);
  useEffect(() => registerPageTool({
    name: 'generate_uuids', title: 'UUIDを生成', description: 'UUID v4を1〜100件生成して画面に表示します。',
    inputSchema: { type: 'object', properties: { count: { type: 'integer', minimum: 1, maximum: 100 } }, required: ['count'], additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute: (input: unknown) => { const next = Array.from({ length: clamp((input as { count: number }).count) }, createUuid); setUuids(next); return { uuids: next }; },
  }), []);
  return <div className="field-stack">
    <div className="toolbar wrap"><label className="inline-field">生成個数<input type="number" min="1" max="100" value={count} onChange={(event) => setCount(clamp(Number(event.target.value)))} /></label><div className="button-row"><button className="button primary" onClick={generate}>{uuids.length ? '再生成' : '一括生成'}</button><button className="button" onClick={() => copy(uuids.join('\n'))} disabled={!uuids.length}>全件コピー</button></div></div>
    <div className="uuid-list" aria-live="polite">{uuids.map((uuid, index) => <div key={uuid}><span>{String(index + 1).padStart(2, '0')}</span><code>{uuid}</code><button onClick={() => copy(uuid)} aria-label={`${index + 1}件目をコピー`}>コピー</button></div>)}</div>
  </div>;
}
