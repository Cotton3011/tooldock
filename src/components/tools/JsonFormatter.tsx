import { useState } from 'react';
import { trackCopy, trackToolUse } from '../../lib/analytics';

export default function JsonFormatter() {
  const [value, setValue] = useState('');
  const [indent, setIndent] = useState(2);
  const [error, setError] = useState('');
  const transform = (compact: boolean) => {
    try {
      const parsed = JSON.parse(value);
      setValue(JSON.stringify(parsed, null, compact ? 0 : indent));
      setError('');
      trackToolUse('json-formatter', compact ? 'minify' : 'format');
    } catch (caught) {
      setError(caught instanceof Error ? `JSONエラー: ${caught.message}` : 'JSONの形式が正しくありません。');
    }
  };
  const copy = async () => { if (!value) return; await navigator.clipboard.writeText(value); trackCopy('json-formatter'); };
  return <div className="field-stack">
    <div className="toolbar wrap">
      <div className="button-row"><button className="button primary" onClick={() => transform(false)}>整形</button><button className="button" onClick={() => transform(true)}>圧縮</button><button className="button" onClick={copy} disabled={!value}>コピー</button><button className="button subtle" onClick={() => { setValue(''); setError(''); }}>クリア</button></div>
      <label className="inline-field">インデント幅<select value={indent} onChange={(e) => setIndent(Number(e.target.value))}><option value="2">2</option><option value="4">4</option></select></label>
    </div>
    <textarea className="code-input" value={value} onChange={(event) => { setValue(event.target.value); setError(''); }} placeholder={'{"message":"ここにJSONを入力"}'} rows={17} spellCheck={false} />
    <p className={`message ${error ? 'error' : ''}`} role="alert">{error || 'JSONはブラウザ内だけで処理されます。'}</p>
  </div>;
}
