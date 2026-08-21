// ─────────────────────────────────────────────────────────────
// Veri erişim katmanı — ÇİFT ADAPTÖR
//   • DATABASE_URL tanımlıysa  → Postgres (Supabase, üretim/Vercel)
//   • tanımlı değilse          → SQLite  (yerel geliştirme)
// Tüm fonksiyonlar async; çağıran taraf adaptörden bağımsızdır.
// ─────────────────────────────────────────────────────────────
import path from "path";

const PG_URL = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
console.log(
  "[DATABASE]",
  PG_URL ? "SUPABASE POSTGRES" : "LOCAL SQLITE"
);
/* ══ Postgres (Supabase) ══ */
let _sql: any = null;
async function pg() {
  if (_sql) return _sql;
  const postgres = (await import("postgres")).default;
  // prepare:false → Supabase transaction pooler (pgbouncer) uyumu
  _sql = postgres(PG_URL!, { ssl: "require", prepare: false, max: 1 });
  return _sql;
}

/* ══ SQLite (yerel) ══ */
let _db: any = null;
function sqlite() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("DATABASE_URL or POSTGRES_URL is required in production; SQLite fallback is disabled on Vercel.");
  }
  if (_db) return _db;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const Database = require("better-sqlite3");
  _db = new Database(process.env.RECF_DB_PATH ?? path.join(process.cwd(), "recf.db"));
  _db.pragma("journal_mode = WAL");
  migrateSqlite(_db);
  return _db;
}
function migrateSqlite(d: any) {
  d.exec(`
  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    num TEXT NOT NULL, team TEXT NOT NULL, org TEXT NOT NULL,
    city TEXT NOT NULL, type TEXT NOT NULL, program TEXT NOT NULL,
    mentor TEXT NOT NULL, email TEXT NOT NULL, phone TEXT NOT NULL,
    kit INTEGER NOT NULL DEFAULT 0, total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'ÖDEME DOĞRULANDI',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    num TEXT NOT NULL UNIQUE, name TEXT NOT NULL, school TEXT NOT NULL,
    city TEXT NOT NULL, program TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_num TEXT NOT NULL, name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT '—', cat TEXT NOT NULL DEFAULT '—',
    consent TEXT NOT NULL DEFAULT '—', status TEXT NOT NULL DEFAULT 'DAVET GÖNDERİLDİ'
  );
  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE, tag TEXT NOT NULL, title TEXT NOT NULL,
    excerpt TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
    published INTEGER NOT NULL DEFAULT 0,
    date TEXT NOT NULL DEFAULT (datetime('now'))
  );`);
  const empty = (t: string) => (d.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as any).c === 0;
  if (empty("applications")) {
    const ins = d.prepare(`INSERT INTO applications (num,team,org,city,type,program,mentor,email,phone,kit,total,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`);
    ins.run("905B","Voltran Robotics 2","Pendik Fen Lisesi","İstanbul","Okul Takımı","achieve","A. Yılmaz","mentor@voltran.org","0500 000 00 00",1,6400,"ÖDEME DOĞRULANDI");
    ins.run("TR-DR21","Gökyüzü Akademisi","Ankara BİLSEM","Ankara","Okul Takımı","adc","B. Kaya","bilsem@ornek.org","0500 000 00 01",0,3100,"ÖDEME BEKLENİYOR");
    ins.run("512C","Robo Kaşifler","Karşıyaka Ortaokulu","İzmir","Okul Takımı","engage","C. Demir","kasifler@ornek.org","0500 000 00 02",1,5400,"ÖDEME DOĞRULANDI");
    ins.run("PRO-31","Otonom Kartallar","YTÜ","İstanbul","Kulüp / Dernek","adc-pro","D. Arslan","kartallar@ornek.org","0500 000 00 03",0,5100,"BELGE EKSİK (öğrenci belgesi)");
    ins.run("1453K","Fatih Robotics","Fatih Anadolu Lisesi","İstanbul","Okul Takımı","achieve","E. Koç","fatih@ornek.org","0500 000 00 04",0,3600,"ÖDEME DOĞRULANDI");
  }
  if (empty("members")) {
    const ins = d.prepare(`INSERT INTO members (team_num,name,role,cat,consent,status) VALUES ('905A',?,?,?,?,?)`);
    ins.run("Ahmet Yılmaz","MENTOR","—","—","AKTİF");
    ins.run("Elif Kaya","KAPTAN · SÜRÜCÜ","U19","✓ Onaylı","AKTİF");
    ins.run("Mert Demir","SÜRÜCÜ 2","U19","✓ Onaylı","AKTİF");
    ins.run("Zeynep Arslan","YAZILIM","U15","✓ Onaylı","AKTİF");
    ins.run("Can Öztürk","MEKANİK","U15","⚠ Eksik","AKTİF");
    ins.run("Selin Koç","DEFTER & MEDYA","U19","⚠ Eksik","AKTİF");
    ins.run("deniz@ornek.com","—","—","—","DAVET GÖNDERİLDİ");
    ins.run("baris@ornek.com","—","—","—","DAVET GÖNDERİLDİ");
  }
}

/* ══ Ortak API ══ */
export type NewApplication = { num: string; team: string; org: string; city: string; type: string; program: string; mentor: string; email: string; phone: string; kit: boolean; total: number };

export async function createApplication(a: NewApplication): Promise<{ id: number }> {
  if (PG_URL) {
    const sql = await pg();
    const [row] = await sql`INSERT INTO applications (num,team,org,city,type,program,mentor,email,phone,kit,total)
      VALUES (${a.num},${a.team},${a.org},${a.city},${a.type},${a.program},${a.mentor},${a.email},${a.phone},${a.kit},${a.total}) RETURNING id`;
    return { id: row.id };
  }
  const r = sqlite().prepare(`INSERT INTO applications (num,team,org,city,type,program,mentor,email,phone,kit,total) VALUES (@num,@team,@org,@city,@type,@program,@mentor,@email,@phone,@kit,@total)`)
    .run({ ...a, kit: a.kit ? 1 : 0 });
  return { id: Number(r.lastInsertRowid) };
}

export async function listApplications(): Promise<any[]> {
  if (PG_URL) {
    const sql = await pg();
    return await sql`SELECT * FROM applications ORDER BY created_at DESC`;
  }
  return sqlite().prepare(`SELECT * FROM applications ORDER BY created_at DESC`).all();
}

export async function resolveApplication(id: number, action: "approve" | "reject"): Promise<any | null> {
  if (PG_URL) {
    const sql = await pg();
    const [app] = await sql`SELECT * FROM applications WHERE id=${id}`;
    if (!app) return null;
    if (action === "approve") {
      await sql`INSERT INTO teams (num,name,school,city,program) VALUES (${app.num},${app.team},${app.org},${app.city},${app.program}) ON CONFLICT (num) DO NOTHING`;
    }
    await sql`DELETE FROM applications WHERE id=${id}`;
    return app;
  }
  const d = sqlite();
  const app = d.prepare(`SELECT * FROM applications WHERE id=?`).get(id);
  if (!app) return null;
  const tx = d.transaction(() => {
    if (action === "approve") {
      d.prepare(`INSERT OR IGNORE INTO teams (num,name,school,city,program) VALUES (?,?,?,?,?)`)
        .run(app.num, app.team, app.org, app.city, app.program);
    }
    d.prepare(`DELETE FROM applications WHERE id=?`).run(id);
  });
  tx();
  return app;
}

export async function listTeams(): Promise<any[]> {
  if (PG_URL) {
    const sql = await pg();
    return await sql`SELECT * FROM teams ORDER BY created_at DESC`;
  }
  return sqlite().prepare(`SELECT * FROM teams ORDER BY created_at DESC`).all();
}

export async function listMembers(teamNum: string): Promise<any[]> {
  if (PG_URL) {
    const sql = await pg();
    return await sql`SELECT * FROM members WHERE team_num=${teamNum} ORDER BY id`;
  }
  return sqlite().prepare(`SELECT * FROM members WHERE team_num=? ORDER BY id`).all(teamNum);
}

export async function inviteMember(teamNum: string, email: string): Promise<{ id: number }> {
  if (PG_URL) {
    const sql = await pg();
    const [row] = await sql`INSERT INTO members (team_num,name) VALUES (${teamNum},${email}) RETURNING id`;
    return { id: row.id };
  }
  const r = sqlite().prepare(`INSERT INTO members (team_num,name) VALUES (?,?)`).run(teamNum, email);
  return { id: Number(r.lastInsertRowid) };
}

export async function publishNews(n: { slug: string; tag: string; title: string; excerpt: string; body: string; published: boolean }): Promise<{ slug: string }> {
  if (PG_URL) {
    const sql = await pg();
    await sql`INSERT INTO news (slug,tag,title,excerpt,body,published) VALUES (${n.slug},${n.tag},${n.title},${n.excerpt},${n.body},${n.published})
      ON CONFLICT (slug) DO UPDATE SET tag=EXCLUDED.tag, title=EXCLUDED.title, excerpt=EXCLUDED.excerpt, body=EXCLUDED.body, published=EXCLUDED.published`;
    return { slug: n.slug };
  }
  sqlite().prepare(`INSERT INTO news (slug,tag,title,excerpt,body,published) VALUES (@slug,@tag,@title,@excerpt,@body,@published)
    ON CONFLICT(slug) DO UPDATE SET tag=@tag,title=@title,excerpt=@excerpt,body=@body,published=@published`)
    .run({ ...n, published: n.published ? 1 : 0 });
  return { slug: n.slug };
}

export async function listPublishedNews(): Promise<any[]> {
  if (PG_URL) {
    const sql = await pg();
    return await sql`SELECT * FROM news WHERE published=true ORDER BY date DESC`;
  }
  return sqlite().prepare(`SELECT * FROM news WHERE published=1 ORDER BY date DESC`).all();
}

export async function getNews(slug: string): Promise<any | null> {
  if (PG_URL) {
    const sql = await pg();
    const [row] = await sql`SELECT * FROM news WHERE slug=${slug} AND published=true`;
    return row ?? null;
  }
  return sqlite().prepare(`SELECT * FROM news WHERE slug=? AND published=1`).get(slug) ?? null;
}

/* ═══════════════ v2: CMS içerik tabloları ═══════════════ */
let _extraOk = false;
function ensureExtraSqlite(d: any) {
  if (_extraOk) return; _extraOk = true;
  d.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
    code TEXT NOT NULL, title TEXT NOT NULL, city TEXT NOT NULL, venue TEXT NOT NULL DEFAULT '',
    date_label TEXT NOT NULL, capacity INTEGER NOT NULL DEFAULT 64, registered INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'KAYIT AÇIK', excerpt TEXT NOT NULL DEFAULT '', published INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, cat TEXT NOT NULL,
    size_label TEXT NOT NULL DEFAULT '', url TEXT NOT NULL DEFAULT '#',
    downloads INTEGER NOT NULL DEFAULT 0, updated_label TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS pages (
    slug TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
    updated TEXT NOT NULL DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS settings ( key TEXT PRIMARY KEY, value TEXT NOT NULL );
  CREATE TABLE IF NOT EXISTS team_docs (
    id INTEGER PRIMARY KEY AUTOINCREMENT, team_num TEXT NOT NULL, name TEXT NOT NULL,
    descr TEXT NOT NULL DEFAULT '', required INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'EKSİK', date_label TEXT NOT NULL DEFAULT ''
  );
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT, team_num TEXT NOT NULL, ref TEXT NOT NULL,
    item TEXT NOT NULL, date_label TEXT NOT NULL DEFAULT '', amount_label TEXT NOT NULL, status TEXT NOT NULL
  );`);
  const empty = (t: string) => (d.prepare(`SELECT COUNT(*) c FROM ${t}`).get() as any).c === 0;
  if (empty("events")) {
    const i = d.prepare(`INSERT INTO events (slug,code,title,city,venue,date_label,capacity,registered,status,excerpt,published) VALUES (?,?,?,?,?,?,?,?,?,?,1)`);
    i.run("istanbul-bolge","ACH","İstanbul Bölge Turnuvası","İstanbul","Teknopark İstanbul","14 Ekim 2026",64,54,"SON KONTENJANLAR","Sezonun açılış bölge turnuvası — Pinnacle sahada.");
    i.run("adc-ankara","ADC","ADC Ankara Uçuş Günü","Ankara","ODTÜ Spor Salonu","28 Ekim 2026",32,18,"KAYIT AÇIK","Fast Track görev uçuşları ve pilot brifingi.");
    i.run("bursa-drone","ADC","Bursa Drone Ligi","Bursa","BTÜ Kampüsü","9 Kasım 2026",32,9,"KAYIT AÇIK","Drone futbolu lig etabı.");
    i.run("izmir-lig","ENG","İzmir ENG Lig Günü","İzmir","Fuar İzmir","16 Kasım 2026",48,21,"KAYIT AÇIK","Tier Takeover lig maçları.");
    i.run("ege-scrimmage","INS","Ege Scrimmage","İzmir","EÜ Spor Salonu","30 Kasım 2026",24,6,"KAYIT AÇIK","Üniversite takımları hazırlık maçları.");
    i.run("kis-kupasi","ACH","Kış Kupası","İstanbul","Açıklanacak","Aralık 2026",64,0,"YAKINDA","Kapalı salon klasiği — ön kayıt 1 Ekim'de.");
    i.run("turkiye-sampiyonasi","TÜMÜ","Türkiye Şampiyonası","Ankara","Açıklanacak","Nisan 2027",128,0,"YAKINDA","Sezonun finali — dünya şampiyonası kotaları.");
  }
  if (empty("documents")) {
    const i = d.prepare(`INSERT INTO documents (name,cat,size_label,url,downloads,updated_label) VALUES (?,?,?,?,?,?)`);
    i.run("ACH Pinnacle — Oyun Kılavuzu v1.2 (TR)","Oyun Kılavuzları","4.2 MB","#",1240,"14 Ağu 2026");
    i.run("ENG Tier Takeover — Kural Kitabı v1.0","Oyun Kılavuzları","3.1 MB","#",890,"10 Ağu 2026");
    i.run("ADC Fast Track — Görev Rehberi (TR)","Oyun Kılavuzları","2.7 MB","#",512,"08 Ağu 2026");
    i.run("Robot Denetim Formu 2026-27","Formlar","180 KB","#",2100,"01 Ağu 2026");
    i.run("Veli İzin Belgesi Şablonu","Formlar","120 KB","#",3400,"01 Ağu 2026");
    i.run("Mühendislik Defteri Rubriği","Jüri Belgeleri","640 KB","#",760,"05 Ağu 2026");
    i.run("Marka Kullanım Kılavuzu","Marka","8.9 MB","#",210,"12 Ağu 2026");
  }
  if (empty("pages")) {
    const i = d.prepare(`INSERT INTO pages (slug,title,body) VALUES (?,?,?)`);
    i.run("kvkk","KVKK Aydınlatma Metni","RECF Türkiye (Intechne Teknoloji A.Ş.) olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında; takım kayıtları, etkinlik başvuruları ve iletişim süreçlerinde paylaştığınız kişisel veriler yalnızca yarışma operasyonu, güvenlik ve yasal yükümlülükler için işlenir.\n\nİşlenen veriler: ad-soyad, e-posta, telefon, okul/kurum bilgisi ve 18 yaş altı katılımcılar için veli onay kayıtları.\n\nVerileriniz açık rızanız olmadan üçüncü taraflarla paylaşılmaz; sponsorlara aktarılmaz. Saklama süresi sezon bitimini takip eden 2 yıldır.\n\nKVKK 11. madde kapsamındaki haklarınız (bilgi talebi, düzeltme, silme) için kvkk@recfturkiye.org adresine başvurabilirsiniz.");
    i.run("gizlilik","Gizlilik Politikası","Bu web sitesi, deneyiminizi iyileştirmek için yalnızca zorunlu oturum çerezleri kullanır; reklam veya izleme çerezi barındırmaz.\n\nTakım Portalı ve CMS oturumları httpOnly güvenli çerezlerle yönetilir. Şifreler hiçbir zaman düz metin olarak saklanmaz.\n\nEtkinliklerde çekilen fotoğraf ve videolar, kayıt sırasında alınan görsel kullanım onayı kapsamında yayınlanır; onay vermeyen katılımcılar yayın akışında bulanıklaştırılır.\n\nSorularınız için: gizlilik@recfturkiye.org");
  }
  if (empty("settings")) {
    const i = d.prepare(`INSERT INTO settings (key,value) VALUES (?,?)`);
    i.run("ticker", JSON.stringify(["2026–27 sezon kayıtları açıldı","İstanbul Bölge: son kontenjanlar","Coach Academy Eylül dönemi başvuruları sürüyor","Founding 100 programı aktif"]));
    i.run("contact_team","takim@recfturkiye.org");
    i.run("contact_info","info@recfturkiye.org");
    i.run("maintenance","0");
  }
  if (empty("team_docs")) {
    const i = d.prepare(`INSERT INTO team_docs (team_num,name,descr,required,status,date_label) VALUES ('905A',?,?,?,?,?)`);
    i.run("Robot Denetim Formu","İstanbul Bölge öncesi zorunlu — imzalı PDF",1,"ONAYLI","12 Ağu 2026");
    i.run("Veli İzin Belgeleri","18 yaş altı tüm üyeler için",1,"İNCELEMEDE","18 Ağu 2026");
    i.run("Mühendislik Defteri (PDF)","Jüri ön değerlendirmesi",1,"EKSİK","");
    i.run("Okul Resmî Yazısı","Kurum onaylı katılım yazısı",1,"ONAYLI","02 Ağu 2026");
    i.run("Takım Logosu","Yayın grafikleri için SVG/PNG",0,"EKSİK","");
  }
  if (empty("payments")) {
    const i = d.prepare(`INSERT INTO payments (team_num,ref,item,date_label,amount_label,status) VALUES ('905A',?,?,?,?,?)`);
    i.run("FT-2026-0912","ACH Sezon Lisansı","28 Tem 2026","₺4.500","ÖDENDİ");
    i.run("FT-2026-0913","Pinnacle Saha Kiti","28 Tem 2026","₺2.800","ÖDENDİ");
    i.run("İND-ERKEN26","Erken Kayıt İndirimi","28 Tem 2026","−₺900","UYGULANDI");
    i.run("FT-2026-1044","İstanbul Bölge katılımı","16 Ağu 2026","₺750","ÖDENDİ");
  }
}
function sq() { const d = sqlite(); ensureExtraSqlite(d); return d; }

/* Events */
export async function listEvents(onlyPublished = true): Promise<any[]> {
  if (PG_URL) { const s = await pg(); return onlyPublished ? await s`SELECT * FROM events WHERE published=true ORDER BY id` : await s`SELECT * FROM events ORDER BY id`; }
  return sq().prepare(`SELECT * FROM events ${onlyPublished ? "WHERE published=1" : ""} ORDER BY id`).all();
}
export async function getEvent(slug: string): Promise<any | null> {
  if (PG_URL) { const s = await pg(); const [r] = await s`SELECT * FROM events WHERE slug=${slug} AND published=true`; return r ?? null; }
  return sq().prepare(`SELECT * FROM events WHERE slug=? AND published=1`).get(slug) ?? null;
}
export async function upsertEvent(e: any): Promise<void> {
  if (PG_URL) { const s = await pg();
    await s`INSERT INTO events (slug,code,title,city,venue,date_label,capacity,registered,status,excerpt,published)
      VALUES (${e.slug},${e.code},${e.title},${e.city},${e.venue ?? ""},${e.date_label},${e.capacity ?? 64},${e.registered ?? 0},${e.status ?? "KAYIT AÇIK"},${e.excerpt ?? ""},${!!e.published})
      ON CONFLICT (slug) DO UPDATE SET code=EXCLUDED.code,title=EXCLUDED.title,city=EXCLUDED.city,venue=EXCLUDED.venue,date_label=EXCLUDED.date_label,capacity=EXCLUDED.capacity,registered=EXCLUDED.registered,status=EXCLUDED.status,excerpt=EXCLUDED.excerpt,published=EXCLUDED.published`;
    return; }
  sq().prepare(`INSERT INTO events (slug,code,title,city,venue,date_label,capacity,registered,status,excerpt,published)
    VALUES (@slug,@code,@title,@city,@venue,@date_label,@capacity,@registered,@status,@excerpt,@published)
    ON CONFLICT(slug) DO UPDATE SET code=@code,title=@title,city=@city,venue=@venue,date_label=@date_label,capacity=@capacity,registered=@registered,status=@status,excerpt=@excerpt,published=@published`)
    .run({ venue: "", capacity: 64, registered: 0, status: "KAYIT AÇIK", excerpt: "", ...e, published: e.published ? 1 : 0 });
}
export async function deleteEvent(slug: string): Promise<void> {
  if (PG_URL) { const s = await pg(); await s`DELETE FROM events WHERE slug=${slug}`; return; }
  sq().prepare(`DELETE FROM events WHERE slug=?`).run(slug);
}

/* Documents */
export async function listDocuments(): Promise<any[]> {
  if (PG_URL) { const s = await pg(); return await s`SELECT * FROM documents ORDER BY cat, id`; }
  return sq().prepare(`SELECT * FROM documents ORDER BY cat, id`).all();
}
export async function addDocument(d: any): Promise<void> {
  if (PG_URL) { const s = await pg(); await s`INSERT INTO documents (name,cat,size_label,url,updated_label) VALUES (${d.name},${d.cat},${d.size_label ?? ""},${d.url ?? "#"},${d.updated_label ?? ""})`; return; }
  sq().prepare(`INSERT INTO documents (name,cat,size_label,url,updated_label) VALUES (@name,@cat,@size_label,@url,@updated_label)`)
    .run({ size_label: "", url: "#", updated_label: "", ...d });
}
export async function deleteDocument(id: number): Promise<void> {
  if (PG_URL) { const s = await pg(); await s`DELETE FROM documents WHERE id=${id}`; return; }
  sq().prepare(`DELETE FROM documents WHERE id=?`).run(id);
}

/* Pages */
export async function getPage(slug: string): Promise<any | null> {
  if (PG_URL) { const s = await pg(); const [r] = await s`SELECT * FROM pages WHERE slug=${slug}`; return r ?? null; }
  return sq().prepare(`SELECT * FROM pages WHERE slug=?`).get(slug) ?? null;
}
export async function listPages(): Promise<any[]> {
  if (PG_URL) { const s = await pg(); return await s`SELECT slug,title,updated FROM pages ORDER BY slug`; }
  return sq().prepare(`SELECT slug,title,updated FROM pages ORDER BY slug`).all();
}
export async function savePage(slug: string, title: string, body: string): Promise<void> {
  if (PG_URL) { const s = await pg(); await s`INSERT INTO pages (slug,title,body,updated) VALUES (${slug},${title},${body},now()) ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, body=EXCLUDED.body, updated=now()`; return; }
  sq().prepare(`INSERT INTO pages (slug,title,body,updated) VALUES (?,?,?,datetime('now')) ON CONFLICT(slug) DO UPDATE SET title=excluded.title, body=excluded.body, updated=datetime('now')`).run(slug, title, body);
}

/* Settings */
export async function getSettings(keys?: string[]): Promise<Record<string, string>> {
  let rows: any[];
  if (PG_URL) { const s = await pg(); rows = keys ? await s`SELECT * FROM settings WHERE key IN ${s(keys)}` : await s`SELECT * FROM settings`; }
  else rows = keys
    ? sq().prepare(`SELECT * FROM settings WHERE key IN (${keys.map(() => "?").join(",")})`).all(...keys)
    : sq().prepare(`SELECT * FROM settings`).all();
  return Object.fromEntries(rows.map((r: any) => [r.key, r.value]));
}
export async function setSetting(key: string, value: string): Promise<void> {
  if (PG_URL) { const s = await pg(); await s`INSERT INTO settings (key,value) VALUES (${key},${value}) ON CONFLICT (key) DO UPDATE SET value=EXCLUDED.value`; return; }
  sq().prepare(`INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value`).run(key, value);
}

/* Team docs & payments (portal) */
export async function listTeamDocs(teamNum: string): Promise<any[]> {
  if (PG_URL) { const s = await pg(); return await s`SELECT * FROM team_docs WHERE team_num=${teamNum} ORDER BY id`; }
  return sq().prepare(`SELECT * FROM team_docs WHERE team_num=? ORDER BY id`).all(teamNum);
}
export async function setTeamDocStatus(id: number, teamNum: string, status: string, dateLabel: string): Promise<void> {
  if (PG_URL) { const s = await pg(); await s`UPDATE team_docs SET status=${status}, date_label=${dateLabel} WHERE id=${id} AND team_num=${teamNum}`; return; }
  sq().prepare(`UPDATE team_docs SET status=?, date_label=? WHERE id=? AND team_num=?`).run(status, dateLabel, id, teamNum);
}
export async function listPayments(teamNum: string): Promise<any[]> {
  if (PG_URL) { const s = await pg(); return await s`SELECT * FROM payments WHERE team_num=${teamNum} ORDER BY id`; }
  return sq().prepare(`SELECT * FROM payments WHERE team_num=? ORDER BY id`).all(teamNum);
}

/* Stats (CMS panosu) */
export async function getStats(): Promise<{ teams: number; pending: number; events: number; news: number }> {
  if (PG_URL) { const s = await pg();
    const [[a],[b],[c],[d]] = await Promise.all([
      s`SELECT COUNT(*)::int c FROM teams`, s`SELECT COUNT(*)::int c FROM applications`,
      s`SELECT COUNT(*)::int c FROM events WHERE published=true`, s`SELECT COUNT(*)::int c FROM news WHERE published=true`]);
    return { teams: a.c, pending: b.c, events: c.c, news: d.c }; }
  const d = sq(); const q = (t: string, w = "") => (d.prepare(`SELECT COUNT(*) c FROM ${t} ${w}`).get() as any).c;
  return { teams: q("teams"), pending: q("applications"), events: q("events", "WHERE published=1"), news: q("news", "WHERE published=1") };
}
