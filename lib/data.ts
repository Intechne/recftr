// ─────────────────────────────────────────────────────────────
// RECF Türkiye — merkezi içerik verisi
// Program bilgileri resmi kaynaklardan derlenmiştir:
// games.recf.org/engage/1.1 · games.recf.org/achieve/1.2 ·
// games.recf.org/inspire/1.2 · recf.org/teams/…
// ─────────────────────────────────────────────────────────────

export type ProgramSlug = "engage" | "achieve" | "inspire" | "adc" | "adc-pro";

export interface Program {
  slug: ProgramSlug;
  code: string;
  name: string;
  game: string;
  age: string;
  ageDetail: string;
  color: string;       // tailwind bg class
  text: string;        // plaka üzerindeki yazı rengi
  hex: string;         // gölge/vurgu için hex
  short: string;
  long: string;
  chips: string[];
  matchTypes: { icon: string; title: string; desc: string }[];
  facts: { label: string; value: string }[];
  source: string;
}

export const programs: Program[] = [
  {
    slug: "engage", code: "ENG", name: "RECF Engage", game: "Tier Takeover",
    age: "U12 & U15", ageDetail: "15 yaşa kadar · U12 (İlkokul) ve U15 (Ortaokul) kategorileri",
    color: "bg-cyan-brand", text: "text-ink", hex: "#29B9E5",
    short: "Robotiğe ilk vida. Bean bag'ler katmanlı hedeflere taşınır; ittifak maçında iki takım ortak skor için birlikte oynar.",
    long: "2026–27 sezon oyunu \"Tier Takeover\": 6'×8' sahada robotlar bean bag'leri toplayıp eşleşen katmanlı hedeflere yerleştirir. Bean bag yükseldikçe puan artar; en üst katman yalnızca sarı bean bag'lere açıktır. Robotlar VEX IQ® veya LEGO® SPIKE/Mindstorms ile kurulur ve maça 11\"×20\"×15\" boyut sınırında başlar.",
    chips: ["15 YAŞA KADAR · U12 & U15", "2+ ÖĞRENCİ", "VEX IQ® / LEGO®", "ROBOT: 11\"×20\"×15\"", "SAHA: 6'×8'"],
    matchTypes: [
      { icon: "🎮", title: "Solo Sürüş", desc: "60 sn. Takım tek başına yarışır; 0:35–0:25 arasında kumanda ikinci sürücüye devredilir." },
      { icon: "💻", title: "Solo Kodlama", desc: "60 sn. Robot yalnızca öğrencilerin yazdığı kodla, tamamen otonom görev yapar." },
      { icon: "🤝", title: "İttifak Maçı", desc: "İki takım AYNI sahada birlikte oynar ve ORTAK skor için iş birliği yapar — rakip yoktur." },
      { icon: "🎤", title: "Jüri Değerlendirmesi", desc: "Mühendislik defteri ve jüri mülakatı. Tasarım süreci ödüllerde puanlanır." },
    ],
    facts: [
      { label: "Zemin", value: "1 puan" }, { label: "Katman 1", value: "5 puan" },
      { label: "Katman 2", value: "10 puan" }, { label: "Katman 3", value: "25 puan" },
      { label: "Katman 4 (sadece sarı)", value: "50 puan" }, { label: "Park", value: "25 puan" },
    ],
    source: "games.recf.org/engage/1.1",
  },
  {
    slug: "achieve", code: "ACH", name: "RECF Achieve", game: "Pinnacle",
    age: "U15 & U19", ageDetail: "19 yaşa kadar · U15 (Ortaokul) ve U19 (Lise) kategorileri",
    color: "bg-cyan-deep", text: "text-white", hex: "#1E8CD9",
    short: "Pin ve kupalar hedeflere istiflenir; kırmızı-mavi ittifaklar 2v2 formatta karşı karşıya gelir.",
    long: "2026–27 sezon oyunu \"Pinnacle\": 12'×12' sahada robotlar pin ve kupaları hedeflere istifler, ruloları çevirir. VEX V5® elektronik ile Robits®/TETRIX® MAX yapı sistemleri kullanılır. Robotlar 18\"×18\"×18\" başlangıç boyutunda, maç içinde 24\"×24\" genişleme sınırında ve toplam 99W motor gücündedir. İttifak maçları 120 saniyedir ve 15 saniyelik otonom bölümle başlar.",
    chips: ["19 YAŞA KADAR · U15 & U19", "1+ ÖĞRENCİ", "VEX V5® + ROBITS®/TETRIX® MAX", "120 SN · 0:15 OTONOM", "SAHA: 12'×12'"],
    matchTypes: [
      { icon: "🎮", title: "Solo Sürüş", desc: "60 sn. Takım sahada tek başına maksimum skoru hedefler." },
      { icon: "💻", title: "Solo Kodlama", desc: "60 sn. Tamamen otonom; yalnızca öğrenci kodu." },
      { icon: "⚔️", title: "İttifak Maçı 2v2", desc: "Kırmızı ittifak (2 takım) mavi ittifaka (2 takım) karşı. 0:15 otonom + 1:45 sürücü kontrolü." },
      { icon: "🎤", title: "Jüri Değerlendirmesi", desc: "Mühendislik defteri ve mülakat; jüri ödüllerini belirler." },
    ],
    facts: [
      { label: "Başlangıç boyutu", value: "18\"×18\"×18\"" }, { label: "Genişleme", value: "24\"×24\"" },
      { label: "Motor gücü", value: "Toplam 99W" }, { label: "Sıralama", value: "Otonom RP + oyun sonu RP + galibiyet" },
      { label: "Eleme", value: "İttifak seçimi → braket" }, { label: "Finaller", value: "En fazla 3 maç" },
    ],
    source: "games.recf.org/achieve/1.2",
  },
  {
    slug: "inspire", code: "INS", name: "RECF Inspire", game: "Pinnacle (Üniversite)",
    age: "ÜNİVERSİTE", ageDetail: "Lise sonrası — yükseköğrenim öğrencileri",
    color: "bg-ink", text: "text-white", hex: "#10192F",
    short: "Üniversite ligi: her takım maça İKİ robot çıkarır ve birlikte çalışan bir robot çifti tasarlar.",
    long: "Inspire, Pinnacle oyununu üniversite seviyesine taşır — bir farkla: her takım maça iki robot çıkarır ve görev paylaşımı yapan bir robot çifti tasarlama fırsatına sahiptir. Açık yapı sistemi geçerlidir: sınırsız motor, özel imalat parça, 3D baskı ve işleme serbesttir. İttifak maçları 30 saniyelik otonom bölümle başlar — yazılım yatırımı ödüllendirilir.",
    chips: ["ÜNİVERSİTE · LİSE SONRASI", "TAKIM BAŞINA 2 ROBOT", "AÇIK YAPI SİSTEMİ", "120 SN · 0:30 OTONOM", "SAHA: 12'×12'"],
    matchTypes: [
      { icon: "🎮", title: "Solo Sürüş", desc: "60 sn. İki robot aynı anda sahada — koordinasyon kendini gösterir." },
      { icon: "💻", title: "Solo Kodlama", desc: "60 sn. Çift robotlu tam otonom rutinler." },
      { icon: "⚔️", title: "İttifak Maçı 2v2", desc: "120 sn; 0:30 otonom + sürücü kontrolü. Her ittifakta 4 robot sahada." },
      { icon: "🎤", title: "Jüri Değerlendirmesi", desc: "Mühendislik defteri, sistem tasarımı ve mülakat." },
    ],
    facts: [
      { label: "Robot sayısı", value: "Takım başına 2" }, { label: "Yapı", value: "Açık sistem — sınırsız motor" },
      { label: "Otonom", value: "30 saniye" }, { label: "İmalat", value: "Özel parça / 3D baskı serbest" },
      { label: "Hedef kitle", value: "Mühendislik fakülteleri, teknoloji kulüpleri" }, { label: "Saha", value: "Achieve ile aynı: 12'×12'" },
    ],
    source: "games.recf.org/inspire/1.2",
  },
  {
    slug: "adc", code: "ADC", name: "Aerial Drone Competition", game: "Mission 2027: Fast Track",
    age: "ORTAOKUL / LİSE", ageDetail: "Ortaokul ve lise öğrencileri",
    color: "bg-adc", text: "text-ink", hex: "#8DC63F",
    short: "Dört görev: Teamwork (ortak uçuş), Otonom Uçuş, Pilotaj parkuru ve jüri İletişim görüşmesi.",
    long: "2026–27 sezon oyunu \"Mission 2027: Fast Track\". Takımlar dört görevde puan toplar: Teamwork görevinde iki takım aynı sahada birlikte uçarak ortak skoru maksimize eder; Otonom Uçuş görevinde drone yalnızca kodla uçar; Pilotaj görevinde engel parkuru hassas manuel uçuşla geçilir; İletişim görevinde jüri, takımın drone bilgisi, programlama yaklaşımı ve uçuş defterini değerlendirir. İlk yerel eleme etkinlikleri Ekim 2026'da.",
    chips: ["ORTAOKUL / LİSE", "4 GÖREV", "TEAMWORK: ORTAK SKOR", "OTONOM + MANUEL UÇUŞ", "İLK ETKİNLİK: EKİM 2026"],
    matchTypes: [
      { icon: "🤝", title: "Teamwork Görevi", desc: "İki takım aynı sahada birlikte uçar; skor ortaktır." },
      { icon: "🤖", title: "Otonom Uçuş", desc: "Drone tamamen öğrenci koduyla görev yapar." },
      { icon: "🕹", title: "Pilotaj", desc: "Engel parkuru — hassas manuel uçuş, tek takım." },
      { icon: "🎤", title: "İletişim", desc: "Jüri görüşmesi: drone bilgisi, kod ve uçuş defteri." },
    ],
    facts: [
      { label: "Görev sayısı", value: "4" }, { label: "Teamwork", value: "Ortak skor — iş birliği" },
      { label: "Sezon başlangıcı", value: "Ekim 2026 (yerel elemeler)" }, { label: "Kurallar", value: "Ağustos 2026'da yayınlandı" },
      { label: "Defter", value: "Uçuş defteri jüride puanlanır" }, { label: "Süreç", value: "Yerel → bölge → dünya şampiyonası" },
    ],
    source: "recf.org/teams/competition/aerial-drone-competition",
  },
  {
    slug: "adc-pro", code: "PRO", name: "ADC Pro", game: "Off Grid",
    age: "LİSE 13+ & ÜNİ", ageDetail: "13 yaş üstü lise öğrencileri ve üniversite",
    color: "bg-adcpro", text: "text-white", hex: "#93268F",
    short: "Çoklu drone + kara aracıyla 2v2 ittifak mücadelesi. Güz ve bahar olmak üzere iki sezon.",
    long: "2026–27 sezon oyunu \"Off Grid\": ikişer takımlı iki ittifak, bölünmüş sahada drone filosu ve kara aracıyla rakip ittifakı geçmeye çalışır. Araç seti MINDS-i yarışma drone'u, CoDrone EDU ve MINDS-i kara robotundan oluşur. Otonom Uçuş ve Pilotaj görevleri CoDrone EDU ile, Teamwork görevi tüm araçlarla oynanır. Program güz ve bahar olmak üzere iki ayrı sezon sunar; önerilen takım boyutu 3–6 kişidir.",
    chips: ["LİSE 13+ & ÜNİVERSİTE", "3–6 KİŞİ ÖNERİLİR", "DRONE + KARA ARACI", "2v2 İTTİFAK", "GÜZ & BAHAR SEZONU"],
    matchTypes: [
      { icon: "⚔️", title: "Teamwork 2v2", desc: "İki ittifak, bölünmüş saha; drone + kara aracı birlikte görevde." },
      { icon: "🤖", title: "Otonom Uçuş", desc: "CoDrone EDU ve kara aracı ile kodlu görevler." },
      { icon: "🕹", title: "Pilotaj", desc: "CoDrone EDU ile engel parkuru." },
      { icon: "🎤", title: "İletişim", desc: "Jüri görüşmesi + mühendislik defteri." },
    ],
    facts: [
      { label: "Araçlar", value: "MINDS-i drone + kara robotu, CoDrone EDU" }, { label: "Format", value: "2v2 ittifak, bölünmüş saha" },
      { label: "Sezonlar", value: "Güz (Ağu–Ara) ve Bahar (Oca–May)" }, { label: "Takım boyutu", value: "3–6 önerilir" },
      { label: "Kayıt", value: "≈ $200 / takım" }, { label: "Oyun açıklanışı", value: "Şubat 2026" },
    ],
    source: "recf.org/teams/adc-pro",
  },
];

export interface EventItem {
  slug: string; code: string; name: string; program: ProgramSlug;
  date: string; dateISO: string; time: string; venue: string; city: string;
  capacity: string; capNow: number; capMax: number;
  status: "open" | "full" | "soon"; about: string[];
  missions?: { icon: string; title: string; desc: string }[];
  schedule: { time: string; item: string; strong?: boolean }[];
  forTeams: string[]; forVisitors: string[]; forPress: string[];
  transit: string[]; registeredTeams?: { num: string; name: string; school: string; city: string; status: "onaylı" | "ödeme" }[];
}

export const events: EventItem[] = [
  {
    slug: "istanbul-bolge-turnuvasi", code: "ACH-İST-01", name: "İstanbul Bölge Turnuvası",
    program: "achieve", date: "14 Ekim 2026", dateISO: "2026-10-14", time: "08:00–18:00",
    venue: "Teknopark İstanbul", city: "İstanbul", capacity: "54/64", capNow: 54, capMax: 64, status: "open",
    about: [
      "Achieve liginin İstanbul bölgesi sezon açılış turnuvası. 64 takım kontenjanlı etkinlikte takımlar \"Pinnacle\" oyununun ilk resmi bölge puanlarını toplayacak.",
      "Gün; solo sürüş ve solo kodlama seansları, 8 turluk ittifak eleme maçları, ittifak seçimi ve eleme braketiyle ilerler. Jüri görüşmeleri gün boyunca pit alanında yapılır.",
      "Seyirci girişi ücretsizdir. Ana arena tribünden izlenebilir; pit alanı turları saat başı düzenlenir.",
    ],
    schedule: [
      { time: "08:00", item: "Kapı açılışı & takım girişi" },
      { time: "08:30", item: "Robot denetimleri (pit alanı)" },
      { time: "09:30", item: "Açılış seremonisi" },
      { time: "10:00", item: "Eleme maçları — Tur 1–4" },
      { time: "12:30", item: "Öğle arası & solo seansları" },
      { time: "13:30", item: "Eleme maçları — Tur 5–8" },
      { time: "15:30", item: "İttifak seçimi" },
      { time: "16:00", item: "Çeyrek & yarı finaller" },
      { time: "17:15", item: "Finaller + ödül töreni", strong: true },
    ],
    forTeams: ["07:30'da pit alanı açılır — kit kontrol listesi zorunlu", "Robot denetimi 08:30'a kadar tamamlanmalı", "Mühendislik defteri jüri masasına sabah teslim edilir", "Takım başında 18+ mentor bulunmalı"],
    forVisitors: ["Giriş ücretsiz, kayıt gerekmez", "Tribün kapasitesi 600 kişi", "Yemek alanı ve dinlenme köşesi mevcut", "Saha alanına yalnızca takımlar girebilir"],
    forPress: ["Akreditasyon: medya@recfturkiye.org", "Basın alanı ana arena yanında", "Görsel arşiv etkinlik sonrası paylaşılır", "Röportaj talepleri sahada koordine edilir"],
    transit: ["📍 Sanayi Mah. Teknopark Bulvarı No:1, Pendik / İstanbul", "🚇 Marmaray: Pendik → servis 10 dk · Otopark ücretsiz", "♿ Erişilebilir giriş ve tribün"],
    registeredTeams: [
      { num: "905A", name: "Voltran Robotics", school: "Pendik Fen Lisesi", city: "İstanbul", status: "onaylı" },
      { num: "1204B", name: "Çelik Kartallar", school: "Kadıköy Anadolu Lisesi", city: "İstanbul", status: "onaylı" },
      { num: "331C", name: "RoboAslanlar", school: "Bahçeşehir Koleji Ataşehir", city: "İstanbul", status: "onaylı" },
      { num: "88D", name: "Teknokentliler", school: "Gebze Teknik Koleji", city: "Kocaeli", status: "onaylı" },
      { num: "2915X", name: "Marmara Makers", school: "Darüşşafaka Eğitim Kurumları", city: "İstanbul", status: "onaylı" },
      { num: "44K", name: "Devre Dışı", school: "Beşiktaş Atatürk Anadolu", city: "İstanbul", status: "ödeme" },
      { num: "1907T", name: "Sarı Kanarya Robotik", school: "Fenerbahçe Koleji", city: "İstanbul", status: "onaylı" },
      { num: "606E", name: "Anka Takımı", school: "Üsküdar Amerikan Lisesi", city: "İstanbul", status: "onaylı" },
      { num: "771B", name: "Bit Bükücüler", school: "Doğa Koleji Çekmeköy", city: "İstanbul", status: "onaylı" },
      { num: "209C", name: "Gears of İzmit", school: "İzmit Bilim Sanat Merkezi", city: "Kocaeli", status: "ödeme" },
    ],
  },
  {
    slug: "adc-ankara-sezon-acilisi", code: "ADC-ANK-01", name: "ADC Ankara Sezon Açılışı",
    program: "adc", date: "9 Kasım 2026", dateISO: "2026-11-09", time: "08:00–18:00",
    venue: "ODTÜ Kültür ve Kongre Merkezi", city: "Ankara", capacity: "32/32", capNow: 32, capMax: 32, status: "full",
    about: [
      "Türkiye'nin 2026–27 ADC sezonunu açan etkinlik. 32 takım, \"Mission 2027: Fast Track\" oyununun dört görevinde ilk resmi puanlarını toplayacak.",
      "Teamwork görevinde iki takım aynı sahada birlikte uçarak ortak skoru maksimize edecek; Otonom Uçuş ve Pilotaj görevlerinde takımlar tek başına yarışacak; jüri İletişim görüşmeleri gün boyunca pit alanında yapılacak.",
      "Etkinlik ODTÜ Havacılık Topluluğu iş birliğiyle düzenleniyor. Drone güvenlik ağıyla çevrili ana arena tribünden izlenebilir.",
    ],
    missions: [
      { icon: "🤝", title: "Teamwork", desc: "İki takım, ortak skor" },
      { icon: "🤖", title: "Otonom Uçuş", desc: "Yalnızca kod" },
      { icon: "🕹", title: "Pilotaj", desc: "Engel parkuru" },
      { icon: "🎤", title: "İletişim", desc: "Jüri görüşmesi + defter" },
    ],
    schedule: [
      { time: "08:00", item: "Kapı açılışı & takım girişi" },
      { time: "08:30", item: "Drone denetimleri" },
      { time: "09:30", item: "Açılış & güvenlik brifingi" },
      { time: "10:00", item: "Teamwork uçuşları — Blok 1" },
      { time: "12:00", item: "Öğle arası" },
      { time: "13:00", item: "Otonom uçuş & pilotaj seansları" },
      { time: "15:30", item: "Teamwork uçuşları — Blok 2" },
      { time: "17:00", item: "Ödül töreni", strong: true },
    ],
    forTeams: ["07:30 pit alanı açılır — kit kontrol listesi zorunlu", "Drone denetimi 08:30'a kadar tamamlanmalı", "Yedek pervane ve batarya önerilir", "Takım başında mentor bulunmalı"],
    forVisitors: ["Giriş ücretsiz, kayıt gerekmez", "Tribün kapasitesi 400 kişi", "Yemek alanı ve dinlenme köşesi mevcut", "Uçuş alanına yalnızca takımlar girebilir"],
    forPress: ["Akreditasyon: medya@recfturkiye.org", "Basın alanı ana arena yanında", "Görsel arşiv etkinlik sonrası paylaşılır", "Röportaj talepleri sahada koordine edilir"],
    transit: ["📍 ODTÜ Kültür ve Kongre Merkezi, Çankaya / Ankara", "🚇 Metro: ODTÜ (100. Yıl) → ring servisi", "♿ Erişilebilir giriş ve tribün"],
  },
  {
    slug: "bursa-il-etkinligi", code: "ENG-BUR-01", name: "Bursa İl Etkinliği",
    program: "engage", date: "26 Ekim 2026", dateISO: "2026-10-26", time: "09:00–17:00",
    venue: "BTSO Kongre Merkezi", city: "Bursa", capacity: "31/48", capNow: 31, capMax: 48, status: "open",
    about: [
      "Engage liginin Bursa il etkinliği. U12 ve U15 kategorilerinde 48 takım kontenjanı ile 'Tier Takeover' sahaları kurulacak.",
      "Solo sürüş, solo kodlama ve iş birlikli ittifak maçları gün boyu dönüşümlü oynanır; jüri görüşmeleri pit alanında yapılır.",
    ],
    schedule: [
      { time: "09:00", item: "Takım girişi & denetimler" },
      { time: "10:00", item: "Solo seansları — Blok 1" },
      { time: "12:00", item: "Öğle arası" },
      { time: "13:00", item: "İttifak maçları (ortak skor)" },
      { time: "16:00", item: "Ödül töreni", strong: true },
    ],
    forTeams: ["Denetim 09:45'e kadar tamamlanmalı", "Yedek batarya önerilir", "Defter jüri masasına teslim edilir"],
    forVisitors: ["Giriş ücretsiz", "Aile oturma alanı mevcut"],
    forPress: ["Akreditasyon: medya@recfturkiye.org"],
    transit: ["📍 BTSO Kongre Merkezi, Osmangazi / Bursa", "🚌 Şehir içi hatlar: 38, K1"],
  },
  {
    slug: "izmir-festivali", code: "ENG-İZM-01", name: "İzmir Festivali",
    program: "engage", date: "21 Kasım 2026", dateISO: "2026-11-21", time: "09:00–17:00",
    venue: "Fuar İzmir", city: "İzmir", capacity: "20/48", capNow: 20, capMax: 48, status: "open",
    about: ["Engage liginin Ege buluşması. Festival formatında: maçların yanında atölyeler ve tanıtım sahaları."],
    schedule: [
      { time: "09:00", item: "Takım girişi" },
      { time: "10:00", item: "Maç blokları" },
      { time: "15:30", item: "Ödül töreni", strong: true },
    ],
    forTeams: ["Denetim sabah tamamlanır"], forVisitors: ["Giriş ücretsiz — atölyeler açık"], forPress: ["medya@recfturkiye.org"],
    transit: ["📍 Fuar İzmir, Gaziemir", "🚇 İZBAN: ESBAŞ"],
  },
  {
    slug: "ege-bolge-sampiyonasi", code: "INS-EGE-01", name: "Ege Bölge Şampiyonası",
    program: "inspire", date: "12 Aralık 2026", dateISO: "2026-12-12", time: "09:00–19:00",
    venue: "İzmir Fuar Alanı", city: "İzmir", capacity: "—", capNow: 0, capMax: 24, status: "soon",
    about: ["Inspire üniversite liginin Ege bölge şampiyonası. Kayıtlar yakında açılacak."],
    schedule: [{ time: "—", item: "Program yakında açıklanacak" }],
    forTeams: [], forVisitors: [], forPress: [], transit: ["📍 İzmir Fuar Alanı, Konak"],
  },
  {
    slug: "kis-kupasi", code: "PRO-İST-01", name: "Kış Kupası",
    program: "adc-pro", date: "23 Ocak 2027", dateISO: "2027-01-23", time: "09:00–19:00",
    venue: "İTÜ Ayazağa", city: "İstanbul", capacity: "—", capNow: 0, capMax: 16, status: "soon",
    about: ["ADC Pro güz sezonu kapanışı: \"Off Grid\" 2v2 ittifak maçları. Kayıtlar yakında."],
    schedule: [{ time: "—", item: "Program yakında açıklanacak" }],
    forTeams: [], forVisitors: [], forPress: [], transit: ["📍 İTÜ Ayazağa Kampüsü, Sarıyer"],
  },
  {
    slug: "turkiye-sampiyonasi", code: "TR-FINAL", name: "Türkiye Şampiyonası",
    program: "achieve", date: "7 Şubat 2027", dateISO: "2027-02-07", time: "08:00–20:00",
    venue: "İstanbul", city: "İstanbul", capacity: "—", capNow: 0, capMax: 128, status: "soon",
    about: ["Tüm programların sezon finali. Bölge sonuçlarına göre davetle katılım; dünya şampiyonası kontenjanları burada belirlenir."],
    schedule: [{ time: "—", item: "Program yakında açıklanacak" }],
    forTeams: [], forVisitors: [], forPress: [], transit: ["📍 İstanbul — salon duyurulacak"],
  },
];

export interface NewsItem {
  slug: string; tag: "DUYURU" | "ETKİNLİK" | "BAŞARI" | "BASINDA BİZ";
  title: string; date: string; excerpt: string; featured?: boolean;
  body?: { type: "lead" | "p" | "h" | "quote"; text: string }[];
}

export const news: NewsItem[] = [
  {
    slug: "2026-27-sezonu-acildi", tag: "DUYURU", featured: true,
    title: "2026–27 Sezonu Açıldı: Dört Yeni Oyun, Beş Program, Tek Yolculuk",
    date: "12 Ağustos 2026",
    excerpt: "Tier Takeover, Pinnacle, Fast Track ve Off Grid tanıtıldı. Kayıtlar recfevents.org üzerinden açık; erken kayıt indirimi 30 Eylül'e kadar geçerli.",
    body: [
      { type: "lead", text: "RECF Türkiye, 2026–27 sezonunu beş programın dört yeni oyunuyla açtı. Engage takımları \"Tier Takeover\" ile katmanlı hedeflere uzanırken, Achieve ve Inspire sahalarında \"Pinnacle\" oynanacak; gökyüzünde ise \"Mission 2027: Fast Track\" ve ADC Pro'nun \"Off Grid\" macerası bizi bekliyor." },
      { type: "h", text: "Kayıtlar nasıl yapılır?" },
      { type: "p", text: "Takım kayıtları recfevents.org üzerinden alınıyor. Takım numaranızı aldıktan sonra RECF Türkiye etkinlik takvimindeki tüm il ve bölge etkinliklerine başvurabilirsiniz. Erken kayıt indirimi 30 Eylül'e kadar geçerli." },
      { type: "quote", text: "\"Bu sezon hedefimiz 45 ilde 500'den fazla takımı sahaya çıkarmak. Her öğrencinin bir plakası olsun istiyoruz.\" — RECF Türkiye Program Direktörü" },
      { type: "p", text: "Sezon boyunca il etkinlikleri Ekim'de, bölge turnuvaları Aralık'ta başlayacak; Türkiye Şampiyonası Şubat'ta İstanbul'da düzenlenecek. Şampiyona sonuçlarına göre takımlar RECF STEM Dünya Şampiyonası'na davet edilecek." },
      { type: "h", text: "Yeni sezon dokümanları yayında" },
      { type: "p", text: "Tüm oyun kılavuzlarının Türkçe çevirileri, saha çizimleri ve mühendislik defteri şablonları Dokümanlar sayfasında. Koçlar için güncellenen mentor rehberi de yayında." },
    ],
  },
  { slug: "istanbul-bolge-doluyor", tag: "ETKİNLİK", title: "İstanbul Bölge Turnuvası kayıtları %85 doluluğa ulaştı", date: "8 Ağustos 2026", excerpt: "64 kontenjanlı turnuvada 54 takım yerini aldı. Kalan kontenjan için başvurular devam ediyor." },
  { slug: "dunya-sampiyonasi-ilk-10", tag: "BAŞARI", title: "Türk takımı RECF STEM Dünya Şampiyonası'nda ilk 10'da", date: "28 Temmuz 2026", excerpt: "Geçen sezonun Türkiye şampiyonu, dünya sahnesinde ülkemizi gururla temsil etti." },
  { slug: "mentor-egitimi-eylul", tag: "DUYURU", title: "Mentor eğitim programı Eylül'de başlıyor — başvurular açık", date: "22 Temmuz 2026", excerpt: "Ücretsiz online eğitim; öğretmen, veli ve gönüllüler için. Katılımcılara sertifika verilecek." },
  { slug: "adc-ankara-basinda", tag: "BASINDA BİZ", title: "ADC Ankara açılışı ulusal basında geniş yer buldu", date: "15 Temmuz 2026", excerpt: "Sezon açılış duyurumuz üç ulusal kanal ve on iki haber sitesinde yer aldı." },
  { slug: "dokumanlar-yenilendi", tag: "DUYURU", title: "Dokümanlar yenilendi: tüm oyun kılavuzları Türkçe'de", date: "10 Temmuz 2026", excerpt: "Tier Takeover, Pinnacle ve Fast Track kılavuzlarının Türkçe çevirileri yayında." },
  { slug: "bursa-hakem-cagrisi", tag: "ETKİNLİK", title: "Bursa İl Etkinliği için gönüllü hakem çağrısı", date: "2 Temmuz 2026", excerpt: "26 Ekim'deki etkinlik için hakem eğitimi verilecek gönüllüler arıyoruz." },
];

export const tickerItems = [
  "2026–27 sezon kayıtları açıldı — erken kayıt indirimi 30 Eylül'e kadar",
  "Yeni sezon oyunları tanıtıldı: Tier Takeover, Pinnacle, Fast Track, Off Grid",
  "İstanbul Bölge Turnuvası kontenjanı doluyor (54/64)",
  "Mentor eğitim programı Eylül'de — başvurular açık",
];

export interface DocItem { type: string; name: string; ver: string; size: string; lang: string; color: string; }
export interface DocCategory { icon: string; title: string; desc: string; count: string; hex: string; docs: DocItem[]; }

export const docCategories: DocCategory[] = [
  {
    icon: "📘", title: "Sezon Dokümanları", desc: "Oyun kılavuzları, kural kitapları, sezon takvimi", count: "14 dosya", hex: "#29B9E5",
    docs: [
      { type: "PDF", name: "Pinnacle Oyun Kılavuzu (Achieve)", ver: "v1.2 · Güncelleme: 02 Ağu 2026", size: "4.2 MB", lang: "TR / EN", color: "#1E8CD9" },
      { type: "PDF", name: "Tier Takeover Görev Kitapçığı (Engage)", ver: "v1.1 · Güncelleme: 20 Tem 2026", size: "2.4 MB", lang: "TR", color: "#29B9E5" },
      { type: "PDF", name: "Fast Track Uçuş Görevleri Kılavuzu (ADC)", ver: "v1.3 · Güncelleme: 28 Tem 2026", size: "3.1 MB", lang: "TR", color: "#8DC63F" },
      { type: "PDF", name: "Genel Kural Kitabı 2026–27", ver: "v1.0 · Güncelleme: 15 Tem 2026", size: "1.8 MB", lang: "TR / EN", color: "#29B9E5" },
      { type: "XLSX", name: "Resmi Sezon Takvimi", ver: "v3 · Güncelleme: 10 Ağu 2026", size: "0.2 MB", lang: "TR", color: "#10192F" },
      { type: "PDF", name: "Off Grid Otonomi Şartnamesi (ADC Pro)", ver: "v0.9 TASLAK · 05 Ağu 2026", size: "5.6 MB", lang: "EN", color: "#93268F" },
    ],
  },
  {
    icon: "🔧", title: "Teknik Dokümantasyon", desc: "Robot kuralları, saha çizimleri, denetim listeleri", count: "22 dosya", hex: "#1E8CD9",
    docs: [
      { type: "PDF", name: "Achieve Robot Kuralları — 18\" / 24\" / 99W", ver: "v1.2", size: "1.1 MB", lang: "TR / EN", color: "#1E8CD9" },
      { type: "DWG", name: "Pinnacle Saha Çizimleri (12'×12')", ver: "v1.0", size: "12 MB", lang: "—", color: "#1E8CD9" },
      { type: "DWG", name: "Tier Takeover Saha Çizimleri (6'×8')", ver: "v1.0", size: "9 MB", lang: "—", color: "#29B9E5" },
      { type: "PDF", name: "Denetim Kontrol Listesi (tüm ligler)", ver: "v2.0", size: "0.6 MB", lang: "TR", color: "#10192F" },
    ],
  },
  {
    icon: "🧑‍🏫", title: "Koç & Mentor Merkezi", desc: "Müfredat, ders planları, defter şablonları", count: "18 dosya", hex: "#8DC63F",
    docs: [
      { type: "PDF", name: "Mentor El Kitabı 2026–27", ver: "v2.1", size: "3.4 MB", lang: "TR", color: "#8DC63F" },
      { type: "DOCX", name: "Mühendislik Defteri Şablonu", ver: "v1.4", size: "0.8 MB", lang: "TR", color: "#8DC63F" },
      { type: "PDF", name: "12 Haftalık Başlangıç Müfredatı", ver: "v1.0", size: "2.2 MB", lang: "TR", color: "#8DC63F" },
    ],
  },
  {
    icon: "🎨", title: "Marka & Medya Kiti", desc: "Logolar, şablonlar, basın görselleri", count: "9 dosya", hex: "#93268F",
    docs: [
      { type: "ZIP", name: "RECF Türkiye Logo Paketi", ver: "v1.0", size: "18 MB", lang: "—", color: "#93268F" },
      { type: "PDF", name: "Marka Kullanım Kılavuzu", ver: "v1.0", size: "2.1 MB", lang: "TR", color: "#93268F" },
    ],
  },
];

export const teams = [
  { num: "905A", name: "Voltran Robotics", school: "Pendik Fen Lisesi · İstanbul", code: "ACH", hex: "#1E8CD9" },
  { num: "TR-DR07", name: "SkyHawks", school: "ODTÜ GV Lisesi · Ankara", code: "ADC", hex: "#8DC63F" },
  { num: "1907T", name: "Sarı Kanarya", school: "Fenerbahçe Koleji · İstanbul", code: "ACH", hex: "#1E8CD9" },
  { num: "PRO-12", name: "AeroMind", school: "İTÜ · İstanbul", code: "PRO", hex: "#93268F" },
  { num: "112A", name: "Mini Vidalar", school: "Bahçelievler İlkokulu · Bursa", code: "ENG", hex: "#29B9E5" },
  { num: "2915X", name: "Marmara Makers", school: "Darüşşafaka · İstanbul", code: "INS", hex: "#10192F" },
  { num: "331C", name: "RoboAslanlar", school: "Bahçeşehir Ataşehir · İstanbul", code: "ACH", hex: "#1E8CD9" },
  { num: "209C", name: "Gears of İzmit", school: "İzmit BİLSEM · Kocaeli", code: "ENG", hex: "#29B9E5" },
];

export const teamMembers = [
  { name: "Ömer Akbulut", role: "Kurucu & Genel Direktör", focus: "Program stratejisi, RECF ilişkileri", tone: "from-[#4a628f] to-ink" },
  { name: "Canan Yılmaz", role: "Operasyon Direktörü", focus: "Etkinlik operasyonu, idari süreçler", tone: "from-[#8f6a4a] to-ink" },
  { name: "Yusuf Kaya", role: "Yazılım Geliştirici", focus: "ARENO platformu, kayıt sistemleri", tone: "from-[#4a8f6a] to-ink" },
  { name: "Seha Demir", role: "Yazılım Geliştirici", focus: "Web & mobil uygulamalar", tone: "from-[#6f568f] to-ink" },
  { name: "İpek Arslan", role: "Okul Ortaklıkları", focus: "Kurumsal programlar, il koordinasyonu", tone: "from-[#8f5656] to-ink" },
  { name: "Açık Pozisyon", role: "Baş Hakem", focus: "Hakem eğitimi, kural yönetimi", tone: "from-[#56718f] to-ink" },
  { name: "Açık Pozisyon", role: "Eğitim Koordinatörü", focus: "Mentor programı, müfredat", tone: "from-[#8f7d4a] to-ink" },
  { name: "Açık Pozisyon", role: "İletişim & Medya", focus: "Duyurular, sosyal medya, basın", tone: "from-[#56568f] to-ink" },
];

export const stats = [
  { num: 500, suffix: "+", label: "KAYITLI TAKIM" },
  { num: 45, suffix: "", label: "İL" },
  { num: 30, suffix: "+", label: "ETKİNLİK / SEZON" },
  { num: 12000, suffix: "+", label: "ÖĞRENCİ" },
  { num: 5, suffix: "", label: "RESMİ PROGRAM" },
];

export const registrationFaqs = [
  { q: "Kayıt ücreti ne kadar?", a: "Sezon lisansı program başına belirlenir; güncel ücretler kayıt sayfasında listelenir. Erken kayıt döneminde indirim uygulanır. Maddi destek için hibe seçeneklerini sorabilirsiniz." },
  { q: "Okulumuz yok, bağımsız takım kurabilir miyiz?", a: "Evet. Kulüp, dernek, mahalle topluluğu veya arkadaş grubu — 18 yaş üstü bir mentor ile kaydolabilirsiniz." },
  { q: "Bir mentor kaç takım yönetebilir?", a: "Bir mentor birden fazla takımı yönetebilir; ancak etkinlik günü her takımın başında bir yetişkin bulunmalıdır." },
  { q: "Takım numarası nasıl belirleniyor?", a: "recfevents.org kayıtta tercih ettiğiniz numarayı girersiniz; müsaitse plakanız olur. Numaranız sezonlar boyunca sizinle kalır." },
];

export const programBySlug = (s: string) => programs.find((p) => p.slug === s);
export const eventBySlug = (s: string) => events.find((e) => e.slug === s);
export const newsBySlug = (s: string) => news.find((n) => n.slug === s);
