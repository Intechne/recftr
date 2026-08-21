import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const PG_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
let _sql: any;
async function db() {
  if (!PG_URL) throw new Error("DATABASE_URL is required. RECF V3 is Supabase/Postgres only.");
  if (_sql) return _sql;
  const postgres = (await import("postgres")).default;
  _sql = postgres(PG_URL, { ssl: "require", prepare: false, max: 3, idle_timeout: 20 });
  return _sql;
}

export function slugify(input: string) {
  return input.toLowerCase().replace(/[ç]/g,"c").replace(/[ğ]/g,"g").replace(/[ı]/g,"i").replace(/[ö]/g,"o").replace(/[ş]/g,"s").replace(/[ü]/g,"u")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 64);
}
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}
export function verifyPassword(password: string, stored: string) {
  try {
    const [algo, salt, hash] = stored.split("$");
    if (algo !== "scrypt" || !salt || !hash) return false;
    const a = Buffer.from(hash, "hex");
    const b = scryptSync(password, salt, a.length);
    return a.length === b.length && timingSafeEqual(a, b);
  } catch { return false; }
}
export function tempPassword() {
  return `RECF-${randomBytes(5).toString("base64url").replace(/[-_]/g,"A")}!`;
}

export type NewApplication = { num:string; team:string; org:string; city:string; type:string; program:string; mentor:string; email:string; phone:string; kit:boolean; total:number };
export async function createApplication(a: NewApplication) {
  const sql = await db();
  return sql.begin(async(tx:any)=>{const [used]=await tx`SELECT 1 FROM teams WHERE num=${a.num} UNION ALL SELECT 1 FROM applications WHERE num=${a.num} AND status IN ('BAŞVURU ALINDI','ONAYLANDI') LIMIT 1`; if(used)throw new Error('TEAM_NUM_USED'); const [row] = await tx`INSERT INTO applications (num,team,org,city,type,program,mentor,email,phone,kit,total,status) VALUES (${a.num},${a.team},${a.org},${a.city},${a.type},${a.program},${a.mentor},${a.email},${a.phone},${a.kit},${a.total},'BAŞVURU ALINDI') RETURNING id`; return {id:Number(row.id)};});
}
export async function listApplications() { const sql=await db(); return sql`SELECT * FROM applications ORDER BY created_at DESC`; }
export async function resolveApplication(id:number, action:"approve"|"reject") {
  const sql=await db();
  return sql.begin(async (tx:any) => {
    const [app] = await tx`SELECT * FROM applications WHERE id=${id} FOR UPDATE`;
    if (!app) return null;
    if (action === "reject") { await tx`UPDATE applications SET status='REDDEDİLDİ', reviewed_at=now() WHERE id=${id}`; return { app, action }; }
    await tx`INSERT INTO teams (num,name,school,city,program,status,visible,mentor_name,mentor_email,phone)
      VALUES (${app.num},${app.team},${app.org},${app.city},${app.program},'AKTİF',true,${app.mentor},${app.email},${app.phone})
      ON CONFLICT (num) DO UPDATE SET name=EXCLUDED.name,school=EXCLUDED.school,city=EXCLUDED.city,program=EXCLUDED.program,
      mentor_name=EXCLUDED.mentor_name,mentor_email=EXCLUDED.mentor_email,phone=EXCLUDED.phone,updated_at=now()`;
    const [existing] = await tx`SELECT id FROM cms_users WHERE lower(email)=lower(${app.email})`;
    let password:string|undefined;
    if (!existing) {
      password = tempPassword();
      await tx`INSERT INTO cms_users (email,name,role,password_hash,team_num,active)
        VALUES (${app.email.toLowerCase()},${app.mentor},'mentor',${hashPassword(password)},${app.num},true)`;
    } else {
      await tx`UPDATE cms_users SET team_num=${app.num}, active=true, updated_at=now() WHERE id=${existing.id} AND role='mentor'`;
    }
    const [mentorMember] = await tx`SELECT id FROM members WHERE team_num=${app.num} AND lower(coalesce(email,''))=lower(${app.email}) LIMIT 1`;
    if (!mentorMember) await tx`INSERT INTO members (team_num,name,email,role,cat,consent,status) VALUES (${app.num},${app.mentor},${app.email},'MENTOR','—','—','AKTİF')`;
    await tx`UPDATE applications SET status='ONAYLANDI', reviewed_at=now() WHERE id=${id}`;
    return { app, action, temporaryPassword: password };
  });
}

export async function listTeams(all=true) {
  const sql=await db();
  return all ? sql`SELECT * FROM teams ORDER BY created_at DESC` : sql`SELECT * FROM teams WHERE visible=true AND status='AKTİF' ORDER BY num`;
}
export async function getTeam(num:string) { const sql=await db(); const [r]=await sql`SELECT * FROM teams WHERE num=${num}`; return r??null; }
export async function updateTeam(num:string,b:any) {
  const sql=await db();
  const [r]=await sql`INSERT INTO teams(num,name,school,city,program,status,visible,mentor_name,mentor_email,phone,slogan,logo_url) VALUES(${num},${b.name},${b.school},${b.city},${b.program},${b.status??'AKTİF'},${b.visible!==false},${b.mentor_name??''},${b.mentor_email??''},${b.phone??''},${b.slogan??''},${b.logo_url??''}) ON CONFLICT(num) DO UPDATE SET name=EXCLUDED.name,school=EXCLUDED.school,city=EXCLUDED.city,program=EXCLUDED.program,status=EXCLUDED.status,visible=EXCLUDED.visible,mentor_name=EXCLUDED.mentor_name,mentor_email=EXCLUDED.mentor_email,phone=EXCLUDED.phone,slogan=EXCLUDED.slogan,logo_url=EXCLUDED.logo_url,updated_at=now() RETURNING *`;
  return r??null;
}
export async function deleteTeam(num:string) { const sql=await db(); await sql.begin(async(tx:any)=>{await tx`DELETE FROM event_registrations WHERE team_num=${num}`;await tx`DELETE FROM members WHERE team_num=${num}`;await tx`DELETE FROM team_docs WHERE team_num=${num}`;await tx`DELETE FROM payments WHERE team_num=${num}`;await tx`UPDATE cms_users SET active=false,team_num=NULL,updated_at=now() WHERE team_num=${num} AND role='mentor'`;await tx`DELETE FROM teams WHERE num=${num}`;}); }

export async function listMembers(teamNum:string){ const sql=await db(); return sql`SELECT * FROM members WHERE team_num=${teamNum} ORDER BY id`; }
export async function createMember(teamNum:string,b:any){ const sql=await db(); const [r]=await sql`INSERT INTO members(team_num,name,email,role,cat,consent,status) VALUES(${teamNum},${b.name},${b.email??''},${b.role??'ÜYE'},${b.cat??'—'},${b.consent??'—'},${b.status??'AKTİF'}) RETURNING *`; return r; }
export async function updateMember(teamNum:string,id:number,b:any){ const sql=await db(); const [r]=await sql`UPDATE members SET name=${b.name},email=${b.email??''},role=${b.role??'ÜYE'},cat=${b.cat??'—'},consent=${b.consent??'—'},status=${b.status??'AKTİF'} WHERE id=${id} AND team_num=${teamNum} RETURNING *`; return r??null; }
export async function deleteMember(teamNum:string,id:number){ const sql=await db(); await sql`DELETE FROM members WHERE id=${id} AND team_num=${teamNum}`; }

export async function listNews(all=false){ const sql=await db(); return all ? sql`SELECT * FROM news ORDER BY date DESC` : sql`SELECT * FROM news WHERE published=true ORDER BY featured DESC,date DESC`; }
export async function getNews(slug:string, includeDraft=false){ const sql=await db(); const [r]=includeDraft ? await sql`SELECT * FROM news WHERE slug=${slug}` : await sql`SELECT * FROM news WHERE slug=${slug} AND published=true`; return r??null; }
export async function upsertNews(n:any){ const sql=await db(); const [r]=await sql`INSERT INTO news(slug,tag,title,excerpt,body,published,cover_url,featured,author,date)
  VALUES(${n.slug},${n.tag??'DUYURU'},${n.title},${n.excerpt??''},${n.body??''},${!!n.published},${n.cover_url??''},${!!n.featured},${n.author??'RECF Türkiye'},${n.date??new Date().toISOString()})
  ON CONFLICT(slug) DO UPDATE SET tag=EXCLUDED.tag,title=EXCLUDED.title,excerpt=EXCLUDED.excerpt,body=EXCLUDED.body,published=EXCLUDED.published,
  cover_url=EXCLUDED.cover_url,featured=EXCLUDED.featured,author=EXCLUDED.author,date=EXCLUDED.date,updated_at=now() RETURNING *`; return r; }
export async function deleteNews(slug:string){ const sql=await db(); await sql`DELETE FROM news WHERE slug=${slug}`; }

function jsonArray(value:any){
  if(Array.isArray(value)) return value;
  if(typeof value==='string'){
    try{const parsed=JSON.parse(value);return Array.isArray(parsed)?parsed:[];}catch{return [];}
  }
  return [];
}
function safeText(value:any){return typeof value==='string'?value:(value==null?'':String(value));}
function normalizeProgramRow(row:any){
  if(!row||typeof row!=='object') return null;
  return {
    ...row,
    slug:safeText(row.slug),code:safeText(row.code),name:safeText(row.name),game:safeText(row.game),
    age:safeText(row.age),age_detail:safeText(row.age_detail),color_hex:safeText(row.color_hex)||'#29B9E5',
    short:safeText(row.short),long:safeText(row.long),source:safeText(row.source),cover_url:safeText(row.cover_url),
    chips:jsonArray(row.chips).map(safeText).filter(Boolean),
    match_types:jsonArray(row.match_types).filter(x=>x&&typeof x==='object'),
    facts:jsonArray(row.facts).filter(x=>x&&typeof x==='object'),
    active:row.active!==false,sort_order:Number(row.sort_order)||0,
  };
}
export async function listPrograms(all=false){ const sql=await db(); const rows=all ? await sql`SELECT * FROM program_content ORDER BY sort_order,slug` : await sql`SELECT * FROM program_content WHERE active=true ORDER BY sort_order,slug`; return rows.map(normalizeProgramRow).filter(Boolean); }
export async function getProgram(slug:string,includeInactive=false){ const sql=await db(); const [r]=includeInactive ? await sql`SELECT * FROM program_content WHERE slug=${slug}` : await sql`SELECT * FROM program_content WHERE slug=${slug} AND active=true`; return normalizeProgramRow(r); }
export async function saveProgram(b:any){ const sql=await db(); const slug=slugify(b.slug||b.name||''); const chips=JSON.stringify(Array.isArray(b.chips)?b.chips:[]); const match=JSON.stringify(Array.isArray(b.match_types)?b.match_types:[]); const facts=JSON.stringify(Array.isArray(b.facts)?b.facts:[]); const [r]=await sql`INSERT INTO program_content(slug,code,name,game,age,age_detail,color_hex,short,long,chips,match_types,facts,source,cover_url,active,sort_order) VALUES(${slug},${b.code},${b.name},${b.game??''},${b.age??''},${b.age_detail??''},${b.color_hex??'#29B9E5'},${b.short??''},${b.long??''},${chips}::jsonb,${match}::jsonb,${facts}::jsonb,${b.source??''},${b.cover_url??''},${b.active!==false},${Number(b.sort_order)||0}) ON CONFLICT(slug) DO UPDATE SET code=EXCLUDED.code,name=EXCLUDED.name,game=EXCLUDED.game,age=EXCLUDED.age,age_detail=EXCLUDED.age_detail,color_hex=EXCLUDED.color_hex,short=EXCLUDED.short,long=EXCLUDED.long,chips=EXCLUDED.chips,match_types=EXCLUDED.match_types,facts=EXCLUDED.facts,source=EXCLUDED.source,cover_url=EXCLUDED.cover_url,active=EXCLUDED.active,sort_order=EXCLUDED.sort_order,updated_at=now() RETURNING *`; return r; }
export async function deleteProgram(slug:string){ const sql=await db(); await sql`UPDATE program_content SET active=false,updated_at=now() WHERE slug=${slug}`; }

export async function listEvents(all=false){ const sql=await db(); return all ? sql`SELECT * FROM events ORDER BY COALESCE(event_start,created_at),id` : sql`SELECT * FROM events WHERE published=true ORDER BY COALESCE(event_start,created_at),id`; }
export async function getEvent(slug:string,includeDraft=false){ const sql=await db(); const [r]=includeDraft ? await sql`SELECT * FROM events WHERE slug=${slug}` : await sql`SELECT * FROM events WHERE slug=${slug} AND published=true`; return r??null; }
export async function upsertEvent(e:any){ const sql=await db(); const [r]=await sql`INSERT INTO events(slug,code,title,city,venue,date_label,event_start,event_end,capacity,status,excerpt,body,published,featured,cover_url,registration_enabled)
  VALUES(${e.slug},${e.code},${e.title},${e.city},${e.venue??''},${e.date_label??''},${e.event_start||null},${e.event_end||null},${Number(e.capacity)||64},${e.status??'KAYIT AÇIK'},${e.excerpt??''},${e.body??''},${!!e.published},${!!e.featured},${e.cover_url??''},${e.registration_enabled!==false})
  ON CONFLICT(slug) DO UPDATE SET code=EXCLUDED.code,title=EXCLUDED.title,city=EXCLUDED.city,venue=EXCLUDED.venue,date_label=EXCLUDED.date_label,event_start=EXCLUDED.event_start,event_end=EXCLUDED.event_end,capacity=EXCLUDED.capacity,status=EXCLUDED.status,excerpt=EXCLUDED.excerpt,body=EXCLUDED.body,published=EXCLUDED.published,featured=EXCLUDED.featured,cover_url=EXCLUDED.cover_url,registration_enabled=EXCLUDED.registration_enabled,updated_at=now() RETURNING *`; return r; }
export async function deleteEvent(slug:string){ const sql=await db(); await sql`DELETE FROM events WHERE slug=${slug}`; }
export async function listEventRegistrations(eventId?:number,teamNum?:string){ const sql=await db(); if(eventId) return sql`SELECT r.*,t.name team_name,t.school,e.title event_title,e.slug event_slug FROM event_registrations r JOIN teams t ON t.num=r.team_num JOIN events e ON e.id=r.event_id WHERE r.event_id=${eventId} ORDER BY r.created_at`; if(teamNum) return sql`SELECT r.*,e.title event_title,e.slug event_slug,e.date_label,e.city,e.venue,e.status event_status FROM event_registrations r JOIN events e ON e.id=r.event_id WHERE r.team_num=${teamNum} ORDER BY COALESCE(e.event_start,e.created_at)`; return sql`SELECT r.*,t.name team_name,e.title event_title FROM event_registrations r JOIN teams t ON t.num=r.team_num JOIN events e ON e.id=r.event_id ORDER BY r.created_at DESC`; }
export async function registerEvent(teamNum:string,eventId:number){ const sql=await db(); return sql.begin(async(tx:any)=>{ const [e]=await tx`SELECT * FROM events WHERE id=${eventId} AND published=true FOR UPDATE`; if(!e) throw new Error('Etkinlik bulunamadı.'); if(!e.registration_enabled) throw new Error('Etkinlik kaydı kapalı.'); const [team]=await tx`SELECT program,status FROM teams WHERE num=${teamNum}`; if(!team||team.status!=='AKTİF')throw new Error('Takım aktif değil.'); const expected:any={engage:'ENG',achieve:'ACH',inspire:'INS',adc:'ADC','adc-pro':'PRO'}; const code=String(e.code||'').toUpperCase(); if(code!=='TÜMÜ'&&expected[team.program]&&!code.startsWith(expected[team.program]))throw new Error('Bu etkinlik takım programınız için değil.'); const [c]=await tx`SELECT COUNT(*)::int c FROM event_registrations WHERE event_id=${eventId} AND status IN ('BEKLİYOR','ONAYLI')`; if(c.c>=e.capacity) throw new Error('Etkinlik kontenjanı dolu.'); const [r]=await tx`INSERT INTO event_registrations(event_id,team_num,status) VALUES(${eventId},${teamNum},'BEKLİYOR') ON CONFLICT(event_id,team_num) DO UPDATE SET status='BEKLİYOR',updated_at=now() RETURNING *`; return r; }); }
export async function cancelEventRegistration(teamNum:string,eventId:number){ const sql=await db(); await sql`DELETE FROM event_registrations WHERE team_num=${teamNum} AND event_id=${eventId}`; }
export async function updateEventRegistration(id:number,b:any){ const sql=await db(); const [r]=await sql`UPDATE event_registrations SET status=${b.status},pit=${b.pit??''},notes=${b.notes??''},updated_at=now() WHERE id=${id} RETURNING *`; return r??null; }

export async function listDocuments(all=false){ const sql=await db(); return all ? sql`SELECT * FROM documents ORDER BY cat,name` : sql`SELECT * FROM documents WHERE published=true ORDER BY cat,name`; }
export async function getDocument(id:number){ const sql=await db(); const [r]=await sql`SELECT * FROM documents WHERE id=${id}`; return r??null; }
export async function addDocument(d:any){ const sql=await db(); const [r]=await sql`INSERT INTO documents(name,cat,size_label,url,file_path,mime_type,published,updated_label) VALUES(${d.name},${d.cat},${d.size_label??''},${d.url??''},${d.file_path??''},${d.mime_type??''},${d.published!==false},${d.updated_label??''}) RETURNING *`; return r; }
export async function updateDocument(id:number,d:any){ const sql=await db(); const [r]=await sql`UPDATE documents SET name=${d.name},cat=${d.cat},size_label=${d.size_label??''},url=${d.url??''},file_path=${d.file_path??''},mime_type=${d.mime_type??''},published=${d.published!==false},updated_label=${d.updated_label??''},updated_at=now() WHERE id=${id} RETURNING *`; return r??null; }
export async function deleteDocument(id:number){ const sql=await db(); const [r]=await sql`DELETE FROM documents WHERE id=${id} RETURNING *`; return r??null; }
export async function incrementDocumentDownload(id:number){ const sql=await db(); await sql`UPDATE documents SET downloads=downloads+1 WHERE id=${id}`; }

export async function listPages(all=false){ const sql=await db(); return all ? sql`SELECT * FROM pages ORDER BY title` : sql`SELECT * FROM pages WHERE published=true ORDER BY title`; }
export async function getPage(slug:string,includeDraft=false){ const sql=await db(); const [r]=includeDraft ? await sql`SELECT * FROM pages WHERE slug=${slug}` : await sql`SELECT * FROM pages WHERE slug=${slug} AND published=true`; return r??null; }
export async function savePage(slug:string,title:string,body:string,published=true){ const sql=await db(); const [r]=await sql`INSERT INTO pages(slug,title,body,published) VALUES(${slug},${title},${body},${published}) ON CONFLICT(slug) DO UPDATE SET title=EXCLUDED.title,body=EXCLUDED.body,published=EXCLUDED.published,updated=now() RETURNING *`; return r; }
export async function deletePage(slug:string){ const sql=await db(); await sql`DELETE FROM pages WHERE slug=${slug}`; }

export async function getSettings(keys?:string[]){ const sql=await db(); const rows = keys?.length ? await sql`SELECT key,value FROM settings WHERE key IN ${sql(keys)}` : await sql`SELECT key,value FROM settings`; return Object.fromEntries(rows.map((r:any)=>[r.key,r.value])); }
export async function setSetting(key:string,value:string){ const sql=await db(); await sql`INSERT INTO settings(key,value) VALUES(${key},${value}) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`; }

export async function listDocumentRequirements(all=false){ const sql=await db(); return all ? sql`SELECT * FROM document_requirements ORDER BY sort_order,id` : sql`SELECT * FROM document_requirements WHERE active=true ORDER BY sort_order,id`; }
export async function saveDocumentRequirement(b:any){ const sql=await db(); if(b.id){const [r]=await sql`UPDATE document_requirements SET name=${b.name},descr=${b.descr??''},program=${b.program??'ALL'},required=${b.required!==false},active=${b.active!==false},sort_order=${Number(b.sort_order)||0},updated_at=now() WHERE id=${Number(b.id)} RETURNING *`;return r;} const [r]=await sql`INSERT INTO document_requirements(name,descr,program,required,active,sort_order) VALUES(${b.name},${b.descr??''},${b.program??'ALL'},${b.required!==false},${b.active!==false},${Number(b.sort_order)||0}) RETURNING *`;return r; }
export async function deleteDocumentRequirement(id:number){ const sql=await db(); await sql`DELETE FROM document_requirements WHERE id=${id}`; }
export async function syncTeamDocRequirements(teamNum:string){ const sql=await db(); const [team]=await sql`SELECT program FROM teams WHERE num=${teamNum}`; if(!team)return; await sql`INSERT INTO team_docs(team_num,name,descr,required,status,requirement_id) SELECT ${teamNum},r.name,r.descr,r.required,'EKSİK',r.id FROM document_requirements r WHERE r.active=true AND (r.program='ALL' OR lower(r.program)=lower(${team.program})) ON CONFLICT(team_num,requirement_id) WHERE requirement_id IS NOT NULL DO UPDATE SET name=EXCLUDED.name,descr=EXCLUDED.descr,required=EXCLUDED.required`; }
export async function listTeamDocs(teamNum?:string){ const sql=await db(); if(teamNum)await syncTeamDocRequirements(teamNum); return teamNum ? sql`SELECT * FROM team_docs WHERE team_num=${teamNum} ORDER BY required DESC,id` : sql`SELECT * FROM team_docs ORDER BY uploaded_at DESC NULLS LAST,id DESC`; }
export async function getTeamDoc(id:number,teamNum:string){ const sql=await db(); const [r]=await sql`SELECT * FROM team_docs WHERE id=${id} AND team_num=${teamNum}`; return r??null; }
export async function createTeamDoc(teamNum:string,b:any){ const sql=await db(); const [r]=await sql`INSERT INTO team_docs(team_num,name,descr,required,status,file_path,mime_type,date_label) VALUES(${teamNum},${b.name},${b.descr??''},${b.required!==false},${b.status??'EKSİK'},${b.file_path??''},${b.mime_type??''},${b.date_label??''}) RETURNING *`; return r; }
export async function updateTeamDoc(id:number,teamNum:string,b:any){ const sql=await db(); const [r]=await sql`UPDATE team_docs SET name=COALESCE(${b.name??null},name),descr=COALESCE(${b.descr??null},descr),required=COALESCE(${typeof b.required==='boolean'?b.required:null},required),status=COALESCE(${b.status??null},status),file_path=COALESCE(${b.file_path??null},file_path),mime_type=COALESCE(${b.mime_type??null},mime_type),date_label=COALESCE(${b.date_label??null},date_label),review_note=COALESCE(${b.review_note??null},review_note),uploaded_at=CASE WHEN ${b.file_path??null} IS NOT NULL THEN now() ELSE uploaded_at END,updated_at=now() WHERE id=${id} AND team_num=${teamNum} RETURNING *`; return r??null; }
export async function deleteTeamDoc(id:number,teamNum:string){ const sql=await db(); const [r]=await sql`DELETE FROM team_docs WHERE id=${id} AND team_num=${teamNum} RETURNING *`; return r??null; }

export async function listPayments(teamNum?:string){ const sql=await db(); return teamNum ? sql`SELECT * FROM payments WHERE team_num=${teamNum} ORDER BY id DESC` : sql`SELECT * FROM payments ORDER BY id DESC`; }
export async function savePayment(b:any){ const sql=await db(); if(b.id){const [r]=await sql`UPDATE payments SET team_num=${b.team_num},ref=${b.ref},item=${b.item},date_label=${b.date_label??''},amount_label=${b.amount_label},status=${b.status} WHERE id=${Number(b.id)} RETURNING *`;return r;} const [r]=await sql`INSERT INTO payments(team_num,ref,item,date_label,amount_label,status) VALUES(${b.team_num},${b.ref},${b.item},${b.date_label??''},${b.amount_label},${b.status}) RETURNING *`; return r; }
export async function deletePayment(id:number){ const sql=await db(); await sql`DELETE FROM payments WHERE id=${id}`; }

export async function listMedia(all=false){ const sql=await db(); return all ? sql`SELECT * FROM media ORDER BY created_at DESC` : sql`SELECT * FROM media WHERE published=true ORDER BY created_at DESC`; }
export async function addMedia(b:any){ const sql=await db(); const [r]=await sql`INSERT INTO media(title,type,event_slug,path,url,mime_type,size_bytes,alt_text,caption,published) VALUES(${b.title},${b.type},${b.event_slug??''},${b.path},${b.url},${b.mime_type??''},${Number(b.size_bytes)||0},${b.alt_text??''},${b.caption??''},${b.published!==false}) RETURNING *`; return r; }
export async function updateMedia(id:number,b:any){ const sql=await db(); const [r]=await sql`UPDATE media SET title=${b.title},type=${b.type},event_slug=${b.event_slug??''},alt_text=${b.alt_text??''},caption=${b.caption??''},published=${b.published!==false},updated_at=now() WHERE id=${id} RETURNING *`; return r??null; }
export async function deleteMedia(id:number){ const sql=await db(); const [r]=await sql`DELETE FROM media WHERE id=${id} RETURNING *`; return r??null; }

export async function listUsers(){ const sql=await db(); return sql`SELECT id,email,name,role,team_num,active,public_profile,public_title,public_bio,public_photo_url,sort_order,created_at,updated_at FROM cms_users ORDER BY role,email`; }
export async function listPublicStaff(){ const sql=await db(); return sql`SELECT id,name,public_title,public_bio,public_photo_url,sort_order FROM cms_users WHERE active=true AND public_profile=true ORDER BY sort_order,name`; }
export async function findUserByEmail(email:string){ const sql=await db(); const [r]=await sql`SELECT * FROM cms_users WHERE lower(email)=lower(${email}) LIMIT 1`; return r??null; }
export async function saveUser(b:any){ const sql=await db(); const passHash=b.password?hashPassword(b.password):null; const pp=b.public_profile===true; const pt=b.public_title??''; const pb=b.public_bio??''; const photo=b.public_photo_url??''; const order=Number(b.sort_order)||0; if(b.id){const [r]=await sql`UPDATE cms_users SET email=${b.email.toLowerCase()},name=${b.name},role=${b.role},team_num=${b.team_num||null},active=${b.active!==false},public_profile=${pp},public_title=${pt},public_bio=${pb},public_photo_url=${photo},sort_order=${order},password_hash=COALESCE(${passHash},password_hash),updated_at=now() WHERE id=${Number(b.id)} RETURNING id,email,name,role,team_num,active,public_profile,public_title,public_bio,public_photo_url,sort_order`; return r;} const [r]=await sql`INSERT INTO cms_users(email,name,role,team_num,active,password_hash,public_profile,public_title,public_bio,public_photo_url,sort_order) VALUES(${b.email.toLowerCase()},${b.name},${b.role},${b.team_num||null},${b.active!==false},${passHash??hashPassword(tempPassword())},${pp},${pt},${pb},${photo},${order}) RETURNING id,email,name,role,team_num,active,public_profile,public_title,public_bio,public_photo_url,sort_order`;return r; }
export async function deleteUser(id:number){ const sql=await db(); await sql`DELETE FROM cms_users WHERE id=${id}`; }
export async function changeOwnPassword(email:string,current:string,next:string){ const u=await findUserByEmail(email); if(!u||!verifyPassword(current,u.password_hash)) return false; const sql=await db(); await sql`UPDATE cms_users SET password_hash=${hashPassword(next)},updated_at=now() WHERE id=${u.id}`; return true; }

export async function createContact(b:any){ const sql=await db(); const [r]=await sql`INSERT INTO contacts(name,email,phone,subject,message,status) VALUES(${b.name},${b.email},${b.phone??''},${b.subject??''},${b.message},'YENİ') RETURNING id`; return r; }
export async function listContacts(){ const sql=await db(); return sql`SELECT * FROM contacts ORDER BY created_at DESC`; }
export async function updateContact(id:number,status:string){ const sql=await db(); await sql`UPDATE contacts SET status=${status},updated_at=now() WHERE id=${id}`; }

export async function audit(actor:string,action:string,entity:string,entityId:string,details:any={}){ try{const sql=await db(); await sql`INSERT INTO audit_logs(actor,action,entity,entity_id,details) VALUES(${actor},${action},${entity},${entityId},${JSON.stringify(details)}::jsonb)`;}catch{} }
export async function listAudit(limit=100){ const sql=await db(); return sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ${limit}`; }
export async function getStats(){ const sql=await db(); const [[t],[a],[e],[n],[m],[u],[c]]=await Promise.all([sql`SELECT COUNT(*)::int c FROM teams WHERE status='AKTİF'`,sql`SELECT COUNT(*)::int c FROM applications WHERE status='BAŞVURU ALINDI'`,sql`SELECT COUNT(*)::int c FROM events WHERE published=true`,sql`SELECT COUNT(*)::int c FROM news WHERE published=true`,sql`SELECT COUNT(*)::int c FROM media`,sql`SELECT COUNT(*)::int c FROM cms_users WHERE active=true`,sql`SELECT COUNT(*)::int c FROM contacts WHERE status='YENİ'`]); return {teams:t.c,pending:a.c,events:e.c,news:n.c,media:m.c,users:u.c,contacts:c.c}; }

export async function dbDiagnostics(){
  const hasUrl=!!(process.env.DATABASE_URL||process.env.POSTGRES_URL);
  if(!hasUrl)return {ok:false,env:{databaseUrl:false},database:null,tables:[],missingTables:["DATABASE_URL"],error:"DATABASE_URL / POSTGRES_URL eksik."};
  try{
    const sql=await db();
    const [who]=await sql`SELECT current_database() database,current_user db_user,now() time`;
    const expected=["applications","teams","members","news","program_content","events","documents","pages","settings","team_docs","document_requirements","payments","cms_users","event_registrations","media","contacts","audit_logs"];
    const rows=await sql`SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name IN ${sql(expected)}`;
    const tables=rows.map((r:any)=>r.table_name);
    const missingTables=expected.filter(x=>!tables.includes(x));
    return {ok:missingTables.length===0,env:{databaseUrl:true},database:who,tables,missingTables,error:missingTables.length?`Eksik tablolar: ${missingTables.join(", ")}`:null};
  }catch(e:any){return {ok:false,env:{databaseUrl:true},database:null,tables:[],missingTables:[],error:e?.message||"Veritabanı bağlantısı kurulamadı."};}
}
