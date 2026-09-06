import type { D1Database } from '@cloudflare/workers-types';
import { normalizeVtuberText, shouldHideReportCount, validateVtuberInput, type VtuberInput } from '../src/lib/vtuber-name';

interface Env { DB: D1Database; ASSETS: { fetch(request: Request): Promise<Response> }; TURNSTILE_SECRET_KEY: string; ABUSE_HASH_SALT: string; }
interface VtuberRow { id:number; name:string; reading:string; x_url:string|null; youtube_url:string|null; twitch_url:string|null; registration_number:number; created_at:string; report_count:number; hidden:number; }
const reportReasons = new Set(['impersonation','nonexistent','wrong_name','wrong_reading','wrong_social','duplicate','inappropriate','other']);

function json(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: { 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' } });
}

async function body(request: Request): Promise<Record<string, unknown> | null> {
  try { const value = await request.json(); return value && typeof value === 'object' ? value as Record<string, unknown> : null; } catch { return null; }
}

async function actorHashes(request: Request, env: Env, browserId: string): Promise<{ ipHash:string; browserHash:string }> {
  const ip = request.headers.get('CF-Connecting-IP') || 'local';
  const day = new Date().toISOString().slice(0, 10);
  const digest = async (value:string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${env.ABUSE_HASH_SALT}:${day}:${value}`))), byte => byte.toString(16).padStart(2,'0')).join('');
  return { ipHash:await digest(`ip:${ip}`), browserHash:await digest(`browser:${browserId.slice(0,80)}`) };
}

async function verifyTurnstile(token: string, request: Request, env: Env): Promise<boolean> {
  if (!token || token.length > 2048 || !env.TURNSTILE_SECRET_KEY) return false;
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ secret:env.TURNSTILE_SECRET_KEY, response:token, remoteip:request.headers.get('CF-Connecting-IP') || undefined, idempotency_key:crypto.randomUUID() }) });
    const result = await response.json() as { success?: boolean };
    return result.success === true;
  } catch { return false; }
}

function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('Origin');
  return !origin || origin === new URL(request.url).origin;
}

async function search(request: Request, env: Env): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const query = normalizeVtuberText(params.get('q') || '');
  const name = normalizeVtuberText(params.get('name') || '');
  const reading = normalizeVtuberText(params.get('reading') || '');
  if ((!query && !name && !reading) || query.length > 100 || name.length > 100 || reading.length > 100) return json({ error:'検索する名前または読み方を入力してください。' }, 400);
  const statement = query
    ? env.DB.prepare('SELECT id,name,reading,x_url,youtube_url,twitch_url,registration_number,created_at,report_count,hidden FROM vtubers WHERE normalized_name = ? OR normalized_reading = ? ORDER BY hidden ASC, id ASC LIMIT 20').bind(query, query)
    : name && reading
      ? env.DB.prepare('SELECT id,name,reading,x_url,youtube_url,twitch_url,registration_number,created_at,report_count,hidden FROM vtubers WHERE normalized_name = ? AND normalized_reading = ? ORDER BY hidden ASC, id ASC LIMIT 20').bind(name, reading)
      : env.DB.prepare(`SELECT id,name,reading,x_url,youtube_url,twitch_url,registration_number,created_at,report_count,hidden FROM vtubers WHERE ${name ? 'normalized_name' : 'normalized_reading'} = ? ORDER BY hidden ASC, id ASC LIMIT 20`).bind(name || reading);
  const result = await statement.all<VtuberRow>();
  if (!result.results.length) return json({ status:'not_found', query:name || reading || query });
  const visible = result.results.filter(item => !item.hidden);
  if (!visible.length) return json({ status:'hidden', message:'この登録は複数の通報により一時的に非表示になっています。' });
  return json({ status:'found', results:visible.map(({hidden,report_count,...item})=>item) });
}

async function register(request: Request, env: Env): Promise<Response> {
  if (!sameOrigin(request)) return json({ error:'リクエストを確認できません。' }, 403);
  const data = await body(request); if (!data) return json({ error:'入力内容を確認してください。' }, 400);
  if (!await verifyTurnstile(String(data.turnstileToken || ''), request, env)) return json({ error:'ボット確認に失敗しました。もう一度お試しください。' }, 403);
  const input:VtuberInput = { name:String(data.name||''), reading:String(data.reading||''), xUrl:String(data.xUrl||''), youtubeUrl:String(data.youtubeUrl||''), twitchUrl:String(data.twitchUrl||'') };
  const checked = validateVtuberInput(input); if (!checked.valid) return json({ error:checked.errors[0], errors:checked.errors }, 400);
  const browserId = String(data.browserId || ''); if (browserId.length < 8) return json({ error:'ブラウザ識別情報を確認できません。' }, 400);
  const { ipHash } = await actorHashes(request, env, browserId);
  await env.DB.prepare("DELETE FROM abuse_events WHERE expires_at < datetime('now')").run();
  const attempts = await env.DB.prepare("SELECT COUNT(*) count FROM abuse_events WHERE action='register' AND actor_hash=? AND created_at > datetime('now','-1 hour')").bind(ipHash).first<{count:number}>();
  if ((attempts?.count || 0) >= 3) return json({ error:'短時間の登録回数が上限に達しました。時間をおいてください。' }, 429);
  const duplicate = await env.DB.prepare('SELECT id FROM vtubers WHERE normalized_name=? OR x_url=? OR youtube_url=? LIMIT 1').bind(checked.normalizedName, checked.urls.xUrl, checked.urls.youtubeUrl).first();
  if (duplicate) return json({ error:'同じ名前またはSNS URLがすでに登録されています。' }, 409);
  const readingCount = await env.DB.prepare('SELECT COUNT(*) count FROM vtubers WHERE normalized_reading=?').bind(checked.normalizedReading).first<{count:number}>();
  if ((readingCount?.count || 0) >= 5) return json({ error:'同じ読み方の登録が多いため、自動登録できません。' }, 409);
  try {
    const inserted = await env.DB.prepare('INSERT INTO vtubers(name,normalized_name,reading,normalized_reading,x_url,youtube_url,twitch_url) VALUES(?,?,?,?,?,?,?)').bind(input.name.trim(), checked.normalizedName, input.reading.trim(), checked.normalizedReading, checked.urls.xUrl, checked.urls.youtubeUrl, checked.urls.twitchUrl).run();
    const id = Number(inserted.meta.last_row_id); const registrationNumber = 100000 + id;
    await env.DB.batch([
      env.DB.prepare('UPDATE vtubers SET registration_number=? WHERE id=?').bind(registrationNumber,id),
      env.DB.prepare("INSERT INTO abuse_events(action,actor_hash,expires_at) VALUES('register',?,datetime('now','+1 day'))").bind(ipHash),
    ]);
    return json({ status:'registered', id, registrationNumber }, 201);
  } catch { return json({ error:'同じ名前またはSNS URLがすでに登録されています。' }, 409); }
}

async function report(request: Request, env: Env, id: number): Promise<Response> {
  if (!sameOrigin(request)) return json({ error:'リクエストを確認できません。' }, 403);
  const data = await body(request); if (!data || !reportReasons.has(String(data.reason))) return json({ error:'通報理由を選択してください。' }, 400);
  if (!await verifyTurnstile(String(data.turnstileToken || ''), request, env)) return json({ error:'ボット確認に失敗しました。もう一度お試しください。' }, 403);
  const detail = String(data.detail || '').trim(); if (detail.length > 500 || /[<>]|javascript\s*:/iu.test(detail)) return json({ error:'補足内容を確認してください。' }, 400);
  const browserId=String(data.browserId||''); if(browserId.length<8)return json({error:'ブラウザ識別情報を確認できません。'},400);
  const {ipHash,browserHash}=await actorHashes(request,env,browserId);
  await env.DB.prepare("DELETE FROM reports WHERE expires_at < datetime('now')").run();
  const recent=await env.DB.prepare("SELECT COUNT(*) count FROM reports WHERE reporter_hash=? AND created_at > datetime('now','-1 hour')").bind(ipHash).first<{count:number}>();
  if((recent?.count||0)>=5)return json({error:'短時間の通報回数が上限に達しました。'},429);
  const inserted=await env.DB.prepare("INSERT OR IGNORE INTO reports(vtuber_id,reason,detail,reporter_hash,browser_hash,expires_at) VALUES(?,?,?,?,?,datetime('now','+1 day'))").bind(id,String(data.reason),detail||null,ipHash,browserHash).run();
  if (!inserted.meta.changes) return json({ error:'この登録はすでに通報済みです。' }, 409);
  const countRow=await env.DB.prepare('SELECT COUNT(*) count FROM reports WHERE vtuber_id=?').bind(id).first<{count:number}>(); const count=countRow?.count||0;
  await env.DB.prepare('UPDATE vtubers SET report_count=?, hidden=?, hidden_at=CASE WHEN ?=1 THEN CURRENT_TIMESTAMP ELSE hidden_at END WHERE id=?').bind(count,shouldHideReportCount(count)?1:0,shouldHideReportCount(count)?1:0,id).run();
  return json({ status:'reported', hidden:shouldHideReportCount(count) });
}

export default { async fetch(request:Request,env:Env):Promise<Response>{
  const url=new URL(request.url);
  try {
    if(request.method==='GET'&&url.pathname==='/api/vtubers/search')return search(request,env);
    if(request.method==='POST'&&url.pathname==='/api/vtubers')return register(request,env);
    const match=url.pathname.match(/^\/api\/vtubers\/(\d+)\/reports$/); if(request.method==='POST'&&match)return report(request,env,Number(match[1]));
    if(url.pathname.startsWith('/api/'))return json({error:'APIが見つかりません。'},404);
    return env.ASSETS.fetch(request);
  } catch(error){console.error('VTuber API error',error);return json({error:'処理に失敗しました。時間をおいて再度お試しください。'},500);}
}};
