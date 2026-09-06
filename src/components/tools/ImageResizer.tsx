import { useEffect, useRef, useState } from 'react';
import { trackDownload, trackToolUse } from '../../lib/analytics';

type Format = 'image/png' | 'image/jpeg' | 'image/webp';

export default function ImageResizer() {
  const [source, setSource] = useState<HTMLImageElement | null>(null);
  const [name, setName] = useState('image');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [locked, setLocked] = useState(true);
  const [format, setFormat] = useState<Format>('image/webp');
  const [quality, setQuality] = useState(85);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const ratio = useRef(1);

  const loadFile = (file?: File) => {
    if (!file?.type.startsWith('image/')) { setError('画像ファイルを選択してください。'); return; }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => { setSource(image); setWidth(image.naturalWidth); setHeight(image.naturalHeight); ratio.current = image.naturalWidth / image.naturalHeight; setName(file.name.replace(/\.[^.]+$/, '')); setError(''); URL.revokeObjectURL(url); };
    image.onerror = () => { setError('画像を読み込めませんでした。'); URL.revokeObjectURL(url); };
    image.src = url;
  };
  useEffect(() => {
    if (!source || width < 1 || height < 1) return;
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
    const context = canvas.getContext('2d'); if (!context) return;
    if (format === 'image/jpeg') { context.fillStyle = '#fff'; context.fillRect(0, 0, width, height); }
    context.drawImage(source, 0, 0, width, height);
    setPreview(canvas.toDataURL(format, quality / 100));
  }, [source, width, height, format, quality]);
  const download = () => { if (!preview) return; const link = document.createElement('a'); const ext = format.split('/')[1]; link.href = preview; link.download = `${name}-${width}x${height}.${ext}`; link.click(); trackDownload('image-resizer', ext); };
  return <div className="image-layout">
    <label className="dropzone" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }}>
      <input type="file" accept="image/*" onChange={(e) => loadFile(e.target.files?.[0])} />
      <span className="upload-icon">↑</span><strong>画像をドロップ</strong><small>またはクリックしてファイルを選択</small>
    </label>
    {error && <p className="message error" role="alert">{error}</p>}
    {source && <div className="image-workspace">
      <div className="resize-controls"><p className="source-size">元画像: {source.naturalWidth} × {source.naturalHeight}px</p><div className="dimension-row"><label>横幅<input type="number" min="1" value={width} onChange={(e) => { const next = Math.max(1, Number(e.target.value)); setWidth(next); if (locked) setHeight(Math.round(next / ratio.current)); }} /></label><span>×</span><label>高さ<input type="number" min="1" value={height} onChange={(e) => { const next = Math.max(1, Number(e.target.value)); setHeight(next); if (locked) setWidth(Math.round(next * ratio.current)); }} /></label></div>
      <label className="check-field"><input type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} /> アスペクト比を固定</label>
      <label>出力形式<select value={format} onChange={(e) => setFormat(e.target.value as Format)}><option value="image/png">PNG</option><option value="image/jpeg">JPEG</option><option value="image/webp">WebP</option></select></label>
      {format !== 'image/png' && <label>品質: {quality}%<input type="range" min="10" max="100" value={quality} onChange={(e) => setQuality(Number(e.target.value))} /></label>}
      <button className="button primary full" onClick={() => { download(); trackToolUse('image-resizer', 'resize'); }}>ダウンロード</button></div>
      <div className="preview-panel"><span>プレビュー</span><img src={preview} alt={`リサイズ後の${name}`} /></div>
    </div>}
  </div>;
}
