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
