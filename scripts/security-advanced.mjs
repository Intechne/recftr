#!/usr/bin/env node

/**
 * RECF Türkiye V3.1.1 — Advanced, non-destructive production security verification.
 *
 * Default mode performs read-only RBAC/IDOR checks and invalid upload-sign requests.
 * Optional --revocation temporarily disables a designated TEST account and restores it.
 * Do NOT use a real staff account for --revocation.
 */

const args = process.argv.slice(2);
const base = (args.find(x => /^https?:\/\//i.test(x)) || 'https://www.recfturkiye.com').replace(/\/$/, '');
const revocation = args.includes('--revocation');
const origin = new URL(base).origin;

const results = [];
function line(state, name, detail='') {
  const s = String(state).padEnd(5);
  console.log(`${s} ${name}${detail ? ` — ${detail}` : ''}`);
  results.push({state, name, detail});
}
function pass(name, detail=''){ line('PASS', name, detail); }
function fail(name, detail=''){ line('FAIL', name, detail); }
function skip(name, detail=''){ line('SKIP', name, detail); }
function info(name, detail=''){ line('INFO', name, detail); }

function env(prefix) {
  const email = process.env[`SEC_TEST_${prefix}_EMAIL`] || '';
  const pass = process.env[`SEC_TEST_${prefix}_PASS`] || '';
  const otp = process.env[`SEC_TEST_${prefix}_OTP`] || '';
  return {email, pass, otp, configured: !!email && !!pass};
}

function getCookies(res) {
  const arr = typeof res.headers.getSetCookie === 'function' ? res.headers.getSetCookie() : [];
  const raw = arr.length ? arr : (res.headers.get('set-cookie') ? [res.headers.get('set-cookie')] : []);
  return raw.filter(Boolean).map(x => String(x).split(';')[0]).join('; ');
}

async function req(path, {method='GET', cookie='', body, headers={}}={}) {
  const h = new Headers(headers);
  h.set('Accept', 'application/json');
  if (cookie) h.set('Cookie', cookie);
  if (body !== undefined) h.set('Content-Type', 'application/json');
  if (['POST','PUT','PATCH','DELETE'].includes(method)) {
    h.set('Origin', origin);
    h.set('Sec-Fetch-Site', 'same-origin');
  }
  const res = await fetch(`${base}${path}`, {
    method,
    headers: h,
    body: body === undefined ? undefined : JSON.stringify(body),
    redirect: 'manual',
  });
  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch {}
  return {res, status: res.status, text, json, cookie: getCookies(res)};
}

async function login(label, cfg, scope) {
  if (!cfg.configured) { skip(`${label} login`, `SEC_TEST_${label.toUpperCase()}_EMAIL/PASS yok`); return null; }
  const r = await req('/api/auth', {method:'POST', body:{email:cfg.email, pass:cfg.pass, scope, otp:cfg.otp}});
  if (r.status === 429) { fail(`${label} login`, 'HTTP 429; önceki rate-limit testinin penceresinin bitmesini bekleyin'); return null; }
  if (r.status !== 200 || !r.cookie) { fail(`${label} login`, `HTTP ${r.status} ${r.json?.error || ''}`.trim()); return null; }
  pass(`${label} login`, `role=${r.json?.role || '?'}${r.json?.teamNum ? ` team=${r.json.teamNum}` : ''}`);
  return {cookie:r.cookie, session:r.json, cfg};
}

async function expectStatus(name, path, expected, auth, opts={}) {
  const r = await req(path, {...opts, cookie:auth?.cookie || opts.cookie || ''});
  const ok = Array.isArray(expected) ? expected.includes(r.status) : r.status === expected;
  (ok ? pass : fail)(name, `HTTP ${r.status}`);
  return r;
}

function noKeys(obj, keys) {
  return obj && typeof obj === 'object' && keys.every(k => !(k in obj));
}
function onlyTeam(rows, teamNum) {
  return Array.isArray(rows) && rows.every(r => !r?.team_num || String(r.team_num) === String(teamNum));
}

console.log(`RECF Türkiye advanced security target: ${base}\n`);

// Anonymous authorization boundary checks.
await expectStatus('Anonymous session rejected', '/api/session', 401, null);
await expectStatus('Anonymous applications rejected', '/api/applications', 403, null);
await expectStatus('Anonymous private team-docs rejected', '/api/team-docs?all=1', 401, null);
await expectStatus('Anonymous users rejected', '/api/users', 403, null);
await expectStatus('Anonymous audit rejected', '/api/audit', 401, null);
await expectStatus('Anonymous CMS stats rejected', '/api/stats', 401, null);
await expectStatus('Anonymous full team list rejected', '/api/teams?all=1', 401, null);
const publicSettings = await expectStatus('Anonymous settings exposes public view only', '/api/settings', 200, null);
const financial = ['registration_fee_engage','registration_fee_achieve','registration_fee_inspire','registration_fee_adc','registration_fee_adc-pro','field_kit_fee','registration_discount','registration_enabled'];
if (publicSettings.status === 200) {
  (noKeys(publicSettings.json, financial) ? pass : fail)('Anonymous settings has no financial fields');
}

const adminCfg = env('ADMIN');
const editorCfg = env('EDITOR');
const approvalsCfg = env('APPROVALS');
const technicalCfg = env('TECHNICAL');
const mentorCfg = env('MENTOR');
const revokeCfg = env('REVOCATION');

const admin = await login('ADMIN', adminCfg, 'cms');
const editor = await login('EDITOR', editorCfg, 'cms');
const approvals = await login('APPROVALS', approvalsCfg, 'cms');
const technical = await login('TECHNICAL', technicalCfg, 'cms');
const mentor = await login('MENTOR', mentorCfg, 'portal');

let approvalsDocs = null;
if (editor) {
  await expectStatus('Editor can read draft news', '/api/news?all=1', 200, editor);
  await expectStatus('Editor blocked from private team docs', '/api/team-docs?all=1', [401,403], editor);
  await expectStatus('Editor blocked from applications', '/api/applications', 403, editor);
  await expectStatus('Editor blocked from user administration', '/api/users', 403, editor);
  await expectStatus('Editor blocked from audit log', '/api/audit', 401, editor);
  const s = await expectStatus('Editor can read content settings', '/api/settings', 200, editor);
  if (s.status === 200) (noKeys(s.json, financial) ? pass : fail)('Editor settings excludes financial fields');
}

if (approvals) {
  await expectStatus('Approvals can read applications', '/api/applications', 200, approvals);
  approvalsDocs = await expectStatus('Approvals can read private team docs', '/api/team-docs?all=1', 200, approvals);
  await expectStatus('Approvals can read payments', '/api/payments', 200, approvals);
  await expectStatus('Approvals blocked from user administration', '/api/users', 403, approvals);
  await expectStatus('Approvals blocked from draft news', '/api/news?all=1', [401,403], approvals);
}

if (technical) {
  await expectStatus('Technical can read private team docs', '/api/team-docs?all=1', 200, technical);
  await expectStatus('Technical can read document requirements', '/api/document-requirements', 200, technical);
  await expectStatus('Technical blocked from applications', '/api/applications', 403, technical);
  await expectStatus('Technical blocked from user administration', '/api/users', 403, technical);
  await expectStatus('Technical blocked from draft news', '/api/news?all=1', [401,403], technical);
}

if (mentor) {
  const team = await expectStatus('Mentor can read own team', '/api/team', 200, mentor);
  const own = String(mentor.session?.teamNum || team.json?.num || '');
  if (!own) fail('Mentor team binding', 'teamNum bulunamadı');
  else pass('Mentor team binding', own);

  const docs = await expectStatus('Mentor team-doc query accepted', '/api/team-docs?all=1&teamNum=SECURITY_OTHER_TEAM', 200, mentor);
  if (docs.status === 200) (onlyTeam(docs.json, own) ? pass : fail)('Mentor cannot switch team via teamNum on team-docs');

  const payments = await expectStatus('Mentor payments query accepted', '/api/payments?teamNum=SECURITY_OTHER_TEAM', 200, mentor);
  if (payments.status === 200) (onlyTeam(payments.json, own) ? pass : fail)('Mentor cannot switch team via teamNum on payments');

  const regs = await expectStatus('Mentor registrations query accepted', '/api/event-registrations?teamNum=SECURITY_OTHER_TEAM', 200, mentor);
  if (regs.status === 200) (onlyTeam(regs.json, own) ? pass : fail)('Mentor cannot switch team via teamNum on registrations');

  await expectStatus('Mentor blocked from applications', '/api/applications', 403, mentor);
  await expectStatus('Mentor blocked from users', '/api/users', 403, mentor);

  await expectStatus('SVG upload-sign rejected', '/api/uploads/sign', 400, mentor, {method:'POST', body:{purpose:'team-doc',fileName:'security-test.svg',mimeType:'image/svg+xml',size:128}});
  await expectStatus('MIME/extension mismatch rejected', '/api/uploads/sign', 400, mentor, {method:'POST', body:{purpose:'team-logo',fileName:'security-test.png',mimeType:'text/html',size:128}});
  await expectStatus('Oversized upload-sign rejected', '/api/uploads/sign', 400, mentor, {method:'POST', body:{purpose:'team-logo',fileName:'security-test.png',mimeType:'image/png',size:6*1024*1024}});

  if (approvalsDocs?.status === 200 && Array.isArray(approvalsDocs.json)) {
    const other = approvalsDocs.json.find(d => String(d?.team_num || '') && String(d.team_num) !== own && Number.isFinite(Number(d.id)));
    if (other) {
      const idor = await req(`/api/team-docs?download=${encodeURIComponent(other.id)}`, {cookie:mentor.cookie});
      ([403,404].includes(idor.status) ? pass : fail)('Cross-team private document IDOR blocked', `HTTP ${idor.status}, foreignTeam=${other.team_num}`);
    } else skip('Cross-team private document IDOR blocked', 'başka takıma ait test belgesi bulunamadı');
  } else skip('Cross-team private document IDOR blocked', 'APPROVALS test hesabı yok');
}

if (admin) {
  await expectStatus('Admin can read users', '/api/users', 200, admin);
  await expectStatus('Admin can read audit', '/api/audit', 200, admin);
  await expectStatus('Admin can read all teams', '/api/teams?all=1', 200, admin);
  const settings = await expectStatus('Admin can read all settings', '/api/settings', 200, admin);
  if (settings.status === 200) {
    const hasAtLeastOneFinancial = financial.some(k => Object.prototype.hasOwnProperty.call(settings.json || {}, k));
    (hasAtLeastOneFinancial ? pass : fail)('Admin settings includes financial configuration');
  }
  const d = await expectStatus('Admin diagnostics accessible', '/api/system/diagnostics', 200, admin);
  if (d.status === 200 && d.json) {
    const checks = [
      ['Diagnostics overall health', d.json.ok === true, `ok=${d.json.ok}`],
      ['SESSION_SECRET configured', d.json.env?.sessionSecret === true, `sessionSecret=${d.json.env?.sessionSecret}`],
      ['RATE_LIMIT_SALT configured', d.json.env?.rateLimitSalt === true, `rateLimitSalt=${d.json.env?.rateLimitSalt}`],
      ['Rate-limit table present', d.json.security?.rateLimitTable === true, `rateLimitTable=${d.json.security?.rateLimitTable}`],
            ['Storage diagnostics healthy', d.json.storage?.ok === true, `storageOk=${d.json.storage?.ok}`],
    ];
    for (const [name, ok, detail] of checks) (ok ? pass : fail)(name, detail);
    if (d.json.security?.leastPrivilegeDb === true) pass('Least-privilege DB active', `dbUser=${d.json.db?.database?.db_user || '?'}`);
    else info('Least-privilege DB hardening', `deferred/accepted residual risk; dbUser=${d.json.db?.database?.db_user || '?'}`);
    if (d.json.env?.adminEmail || d.json.env?.adminPassword) {
      (d.json.env?.adminTotp === true ? pass : fail)('Bootstrap admin MFA configured', `adminTotp=${d.json.env?.adminTotp}`);
    } else info('Bootstrap admin MFA', 'bootstrap account env ile etkin değil');
  }
}

if (revocation) {
  if (!admin) skip('Session revocation active test', 'ADMIN hesabı yok');
  else if (!revokeCfg.configured) skip('Session revocation active test', 'SEC_TEST_REVOCATION_EMAIL/PASS yok');
  else {
    const rev = await login('REVOCATION', revokeCfg, 'cms');
    if (rev) {
      const users = await req('/api/users', {cookie:admin.cookie});
      const u = Array.isArray(users.json) ? users.json.find(x => String(x.email).toLowerCase() === revokeCfg.email.toLowerCase()) : null;
      if (!u) fail('Session revocation active test', 'temporary revocation user admin listesinde bulunamadı');
      else if (String(u.email).toLowerCase() === String(adminCfg.email).toLowerCase()) fail('Session revocation active test', 'admin hesabı revocation test user olarak kullanılamaz');
      else {
        const baseUser = {
          id:u.id,email:u.email,name:u.name,role:u.role,team_num:u.team_num || '',active:false,
          public_profile:!!u.public_profile,public_title:u.public_title || '',public_bio:u.public_bio || '',public_photo_url:u.public_photo_url || '',sort_order:Number(u.sort_order)||0,
        };
        const off = await req('/api/users', {method:'PUT',cookie:admin.cookie,body:baseUser});
        if (off.status !== 200) fail('Temporary test user disabled', `HTTP ${off.status}`);
        else {
          pass('Temporary test user disabled');
          const stale = await req('/api/news?all=1', {cookie:rev.cookie});
          ([401,403].includes(stale.status) ? pass : fail)('Old session revoked after user disable', `HTTP ${stale.status}`);
          const on = await req('/api/users', {method:'PUT',cookie:admin.cookie,body:{...baseUser,active:true}});
          (on.status === 200 ? pass : fail)('Temporary test user restored', `HTTP ${on.status}`);
          const stillStale = await req('/api/news?all=1', {cookie:rev.cookie});
          ([401,403].includes(stillStale.status) ? pass : fail)('Old session remains revoked after restore', `HTTP ${stillStale.status}`);
        }
      }
    }
  }
} else {
  skip('Session revocation active test', 'isteğe bağlı: --revocation ve yalnız GEÇİCİ test hesabı ile çalıştırın');
}

const failed = results.filter(x => x.state === 'FAIL');
console.log(`\nSummary: ${results.filter(x=>x.state==='PASS').length} PASS, ${failed.length} FAIL, ${results.filter(x=>x.state==='SKIP').length} SKIP`);
if (failed.length) process.exitCode = 1;
