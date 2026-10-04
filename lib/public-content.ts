// Public presentation guards for content identified in the October 2026 review.
// CMS records stay editable; a replacement file or corrected schedule clears its guard.
export const WITHDRAWN_DOCUMENT_PATH = "documents/azerbaycan-robotik-ve-drone-ligi-ardl-2026-2027-1787346227599-brqi33.pdf";

export function documentAvailability(document: { url?: string; file_path?: string }) {
  const url = String(document.url || "").trim();
  if (document.file_path === WITHDRAWN_DOCUMENT_PATH || url.split(/[?#]/)[0].endsWith(`/${WITHDRAWN_DOCUMENT_PATH}`)) {
    return { available: false, message: "Doğru belge hazırlanıyor." };
  }
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return { available: true, message: "" };
  try {
    const target = new URL(url);
    if (!['https:', 'http:'].includes(target.protocol) || target.username || target.password) throw new Error();
    return { available: true, message: "" };
  } catch {
    return { available: false, message: "Dosya henüz yayımlanmadı." };
  }
}

export type EventDates = { event_start?: string | Date | null; event_end?: string | Date | null };
const timestamp = (value: string | Date | null | undefined) => {
  const n = value ? new Date(value).getTime() : NaN;
  return Number.isFinite(n) ? n : null;
};

export function eventPhase(event: EventDates, now = Date.now()) {
  const start = timestamp(event.event_start), end = timestamp(event.event_end);
  if (end !== null && end <= now) return 'past';
  if (start !== null && start <= now) {
    // Without an end time keep the event visible through its start day in Türkiye.
    if (end === null) {
      const day = (n: number) => new Date(n).toLocaleDateString('en-CA', { timeZone: 'Europe/Istanbul' });
      return day(start) < day(now) ? 'past' : 'current';
    }
    return 'current';
  }
  return start !== null ? 'upcoming' : 'undated';
}

export function publicEvent<T extends EventDates & { slug?: string; body?: string; date_label?: string; status?: string; registration_enabled?: boolean }>(event: T, now = Date.now()): T {
  let item = { ...event };
  // This published record says March in its timestamps and April in its body.
  // Do not choose a date on the organiser's behalf while these values conflict.
  if (item.slug === 'recf-turkiye-ulusal-sampiyonasi' && !item.date_label?.trim()
      && timestamp(item.event_start) === Date.parse('2027-03-13T08:00:00Z') && /(?:17\s*[–-]\s*18|17|18) Nisan 2027/.test(item.body || '')) {
    item = { ...item, event_start: null, event_end: null, registration_enabled: false,
      date_label: 'Tarih doğrulaması bekleniyor', status: 'TARİH BEKLENİYOR',
      body: item.body?.replace(/(?:17\s*[–-]\s*18|17|18) Nisan 2027/g, 'Tarih bekleniyor') };
  }
  const phase = eventPhase(item, now);
  if (phase === 'past') return { ...item, status: 'GEÇMİŞ ETKİNLİK', registration_enabled: false };
  if (phase === 'current') return { ...item, status: 'DEVAM EDİYOR' };
  if (!item.date_label?.trim() && timestamp(item.event_start) !== null) {
    const format = (date: string | Date) => new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Istanbul' });
    item.date_label = format(item.event_start!);
    if (item.event_end && format(item.event_end) !== item.date_label) item.date_label += ` – ${format(item.event_end)}`;
  }
  if (item.status === 'KAYIT AÇIK') item.status = 'KAYIT BİLGİSİ BEKLENİYOR';
  return item;
}

export function correctAchieveContent<T extends { slug?: string; facts?: any[]; match_types?: any[]; source?: string }>(program: T): T {
  if (program.slug !== 'achieve') return program;
  return { ...program,
    facts: program.facts?.map(f => /^otonom$/i.test(f.label || '') && /^30\s*(saniye|sn)/i.test(f.value || '') ? { ...f, value: '15 saniye' } : f),
    match_types: program.match_types?.map(m => ({ ...m, desc: String(m.desc || '').replace(/0:30(?=\s+otonom)/gi, '0:15') })),
    source: program.source === 'https://games.recf.org/achieve/1.2' ? 'https://games.recf.org/achieve/2.0' : program.source,
  };
}

export function initialRegistrationProgram(requested: string | undefined, programs: { slug: string }[]) {
  if (programs.some(p => p.slug === requested)) return requested!;
  return programs.find(p => p.slug === 'achieve')?.slug || programs[0]?.slug || '';
}
