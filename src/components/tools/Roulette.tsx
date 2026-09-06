import { useMemo, useState } from 'react';
import { secureRandomIndex } from '../../lib/random';
import { trackToolUse } from '../../lib/analytics';

const colors = ['#2563eb', '#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#0ea5e9', '#f97316'];

export default function Roulette() {
  const [items, setItems] = useState(['ランチ', 'カフェ', '公園']);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState('');
  const [rotation, setRotation] = useState(0);
  const gradient = useMemo(() => `conic-gradient(${items.map((_, index) => `${colors[index % colors.length]} ${index / items.length * 100}% ${(index + 1) / items.length * 100}%`).join(',')})`, [items]);
  const add = () => { const value = draft.trim(); if (!value) return; setItems([...items, value]); setDraft(''); };
  const spin = () => { if (!items.length) return; const index = secureRandomIndex(items.length); setRotation((current) => current + 1440 + (360 - ((index + .5) * 360 / items.length))); setTimeout(() => setResult(items[index]), 1150); trackToolUse('roulette', 'spin'); };
  return <div className="roulette-layout">
    <div className="item-editor"><div className="field-label"><label htmlFor="roulette-item">ルーレットの項目</label><span>{items.length}項目</span></div><div className="add-row"><input id="roulette-item" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} placeholder="項目を入力" maxLength={40} /><button className="button primary" onClick={add}>追加</button></div><p className="hint">同じ項目も追加できます。</p><div className="chip-list">{items.map((item, index) => <div key={`${item}-${index}`}><span>{item}</span><button onClick={() => { setItems(items.filter((_, i) => i !== index)); setResult(''); }} aria-label={`${item}を削除`}>×</button></div>)}</div></div>
    <div className="wheel-area"><div className="wheel-pointer" aria-hidden="true"></div><div className="wheel" style={{ background: gradient, transform: `rotate(${rotation}deg)` }}><span>SPIN</span></div><button className="button primary spin-button" disabled={!items.length} onClick={spin}>{result ? 'もう一度回す' : 'スタート'}</button><div className="roulette-result" aria-live="polite"><span>当選結果</span><strong>{result || '—'}</strong></div></div>
  </div>;
}
