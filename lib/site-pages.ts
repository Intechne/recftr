import { RECF_EVENTS_URL, RECF_SOURCES, RECF_TEAM_FEE, WORLD_CHAMPIONSHIP, hasPlaceholder } from "@/lib/site-config";

/*
 * CMS'ten düzenlenebilen site sayfaları.
 * İçerik `pages` tablosunda (slug, title, body, published) tutulur. CMS'te kayıt yoksa aşağıdaki
 * varsayılan içerik kullanılır; CMS → Sayfalar → "Site sayfaları" bölümünden varsayılan metin
 * düzenlemeye açılıp kaydedilebilir.
 *
 * Gövde biçimi (satır bazlı, sade):
 *   ## Bölüm başlığı
 *   Paragraf. [Bağlantı metni](/adres) satır içi bağlantı olabilir.
 *   - Madde
 *   ? Soru            (bir sonraki boş satıra kadar gelen satırlar cevaptır)
 *   > Vurgulu not
 *   [[Buton metni](/adres)]
 * Belirteçler: {{fee}} {{season}} {{fee_source}} {{wc_name}} {{wc_date}} {{wc_city}} {{wc_source}}
 *   {{pathway_source}} {{recfevents_url}} {{program_ages}}
 */

export type PageBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "faq"; q: string; a: string }
  | { type: "note"; text: string }
  | { type: "button"; label: string; href: string };
export type PageSection = { heading: string; blocks: PageBlock[] };
export type ParsedPage = { intro: PageBlock[]; sections: PageSection[] };

export type SitePageDefinition = {
  slug: string;
  path: string;
  kicker: string;
  title: string;
  description: string;
  defaultPublished: boolean;
  lang: "tr" | "en";
  body: string;
};

export function parsePageBody(body: string): ParsedPage {
  const intro: PageBlock[] = [];
  const sections: PageSection[] = [];
  let target = intro;
  let paragraph: string[] = [];
  let list: string[] = [];
  let faq: { q: string; a: string[] } | null = null;
  const flush = () => {
    if (paragraph.length) { target.push({ type: "paragraph", text: paragraph.join(" ") }); paragraph = []; }
    if (list.length) { target.push({ type: "list", items: list }); list = []; }
    if (faq) { target.push({ type: "faq", q: faq.q, a: faq.a.join(" ").trim() }); faq = null; }
  };
  for (const rawLine of String(body || "").replace(/\r\n?/g, "\n").split("\n")) {
    const line = rawLine.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith("## ")) { flush(); const section = { heading: line.slice(3).trim(), blocks: [] as PageBlock[] }; sections.push(section); target = section.blocks; continue; }
    if (line.startsWith("? ")) { flush(); faq = { q: line.slice(2).trim(), a: [] }; continue; }
    if (faq) { faq.a.push(line); continue; }
    const button = line.match(/^\[\[([^\]]+)\]\(([^)\s]+)\)\]$/);
    if (button) { flush(); target.push({ type: "button", label: button[1].trim(), href: button[2].trim() }); continue; }
    if (line.startsWith("> ")) { flush(); target.push({ type: "note", text: line.slice(2).trim() }); continue; }
    if (/^[-•] /.test(line)) { if (paragraph.length) { target.push({ type: "paragraph", text: paragraph.join(" ") }); paragraph = []; } list.push(line.slice(2).trim()); continue; }
    if (list.length) { target.push({ type: "list", items: list }); list = []; }
    paragraph.push(line);
  }
  flush();
  return { intro, sections };
}

/** Sayfadaki tüm soru-cevaplar (FAQPage structured data için). */
export function pageFaqs(parsed: ParsedPage) {
  return [...parsed.intro, ...parsed.sections.flatMap(section => section.blocks)].filter((block): block is Extract<PageBlock, { type: "faq" }> => block.type === "faq");
}

/** Satır içi bağlantıları düz metne çevirir (structured data / meta için). */
export function plainText(text: string) {
  return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1").replace(/\s+/g, " ").trim();
}

export type TokenContext = { lang?: "tr" | "en"; programAges?: string };
export function applyTokens(text: string, context: TokenContext = {}) {
  const en = context.lang === "en";
  const tokens: Record<string, string> = {
    fee: RECF_TEAM_FEE.label,
    season: RECF_TEAM_FEE.season,
    fee_source: RECF_TEAM_FEE.source,
    wc_name: WORLD_CHAMPIONSHIP.name,
    wc_date: en ? WORLD_CHAMPIONSHIP.labelEn : WORLD_CHAMPIONSHIP.label,
    wc_city: en ? WORLD_CHAMPIONSHIP.cityEn : WORLD_CHAMPIONSHIP.city,
    wc_source: WORLD_CHAMPIONSHIP.source,
    pathway_source: RECF_SOURCES.pathway,
    recfevents_url: RECF_EVENTS_URL,
    program_ages: context.programAges || "",
  };
  // Bilinmeyen belirteçler ve teyit yer tutucuları hiçbir zaman ziyaretçiye gösterilmez.
  return text.replace(/\{\{\s*([a-z_]+)\s*\}\}/g, (_, key: string) => tokens[key] ?? "");
}

/** Yayına uygun mu? Yer tutucu içeren gövde public sitede gösterilmez. */
export function publishable(title: string, body: string) {
  return !hasPlaceholder(title) && !hasPlaceholder(body);
}

const OKULLAR = `Okulunuzda robotik ve drone takımları kurmak, öğretmenlerinizi hazırlamak ve öğrencilerinize sezon boyunca gerçek yarışma deneyimi yaşatmak için RECF Türkiye ekibiyle birlikte plan yapın.

## Kampüs içi lig
Okulunuzdaki takımlar sezon boyunca kendi kampüsünüzde, RECF oyun kurallarıyla düzenli maçlar oynasın. Kampüs içi lig yeni takımlara sahne deneyimi kazandırır, hazırlığı resmî etkinliklere taşır.
- Programlarınıza uygun lig formatı ve takvim planı
- Saha kurulumu, maç akışı ve hakemlik için ekip yönlendirmesi
- Takımlarınızın RECF etkinliklerine geçiş planı

## Öğretmen ve antrenör eğitimi
Bir takımın tavanını antrenörü belirler. Öğretmenleriniz ve antrenörleriniz için oyun kuralları, mühendislik defteri, takım yönetimi ve etkinlik günü hazırlığını kapsayan eğitim seçeneklerini randevuda birlikte belirleyelim.
- Oyun kılavuzu ve puanlama okuryazarlığı
- Mühendislik defteri koçluğu ve takım yönetimi
- Etkinlik günü hazırlığı ve güvenlik
[[Mentor rehberini incele](/rehber/mentor)]

## Kurumsal paketler
Birden fazla takımla katılmak isteyen okullar ve kurumlar için kayıt, eğitim ve etkinlik desteğini bir arada sunan kurumsal paket seçenekleri hazırlıyoruz. Paket içeriği okulunuzun takım sayısına ve programlarına göre planlanır; ayrıntıları randevuda paylaşırız.
> RECF resmî takım kayıt ücreti {{season}} sezonu için takım başına {{fee}} ve RECFEvents.org üzerinden ödenir. Takım Bursu ve kurumsal paket seçenekleri için bize ulaşın.

## Sezon takvimi
Sezonun kilometre taşları ana sayfadaki Sezon Rotası'nda ve Etkinlik Takvimi'nde yayınlanır; teyit edilen her tarih bu sayfalara eklenir. Sezonun zirvesi {{wc_name}}: {{wc_date}} · {{wc_city}}.
[[Etkinlik takvimini gör](/etkinlikler)]

## Programlar
Okulunuzun kademesine uygun programı seçin: RECF Engage, RECF Achieve, RECF Inspire, Aerial Drone Competition (ADC) ve ADC Pro.
[[Programları incele](/programlar)]`;

const VELILER = `Robotik ve drone takımları çocuğunuza tasarlamayı, kodlamayı ve bir ekiple birlikte sahaya çıkmayı öğretir. Bu sayfada güvenlik, onam süreçleri ve maliyet hakkında bilmeniz gerekenleri bir araya getirdik.

## Öğrenciniz ne kazanır?
- Takım çalışması, iletişim ve liderlik deneyimi
- Tasarım, kodlama ve mühendislik becerileri
- Problem çözme ve stratejik düşünme
- Gerçek bir yarışma sahnesinde sunum ve sportmenlik

## Güvenlik
Her takım 18 yaş üstü bir yetişkin mentor eşliğinde çalışır. RECFEvents.org hesapları yalnız 18 yaş ve üzeri yetişkinler (antrenör, mentor, veli ve etkinlik partnerleri) içindir; öğrencilerin hesap açması gerekmez, takımı antrenörü kaydeder.

## KVKK ve katılım onamı
Öğrencilere ait kişisel veriler KVKK kapsamında işlenir ve bu sitede yayınlanmaz. 18 yaş altı öğrenciler için veli veya yasal temsilci onamı alınır. Ayrıntılar için hukuki metinleri inceleyebilirsiniz.
- [KVKK Aydınlatma Metni](/kvkk)
- [Katılım Onamı](/katilim-onami)
- [Açık Rıza Metni](/acik-riza)
- [Tüm hukuki belgeler](/hukuki-belgeler)

## Maliyet
RECF resmî takım kayıt ücreti {{season}} sezonu için takım başına {{fee}} ve RECFEvents.org üzerinden ödenir. Takımın programına uygun robot veya drone donanımı gerekir; etkinliklerin kendi katılım koşulları ve ücretleri olabilir. Bu kalemler programa ve etkinliğe göre değişir.
> Takım Bursu ve kurumsal paket seçenekleri için bize ulaşın.

## Sık sorulan sorular
? Çocuğum hangi programa katılabilir?
Programlar yaş ve kademeye göre ayrılır: {{program_ages}}. Kesin uygunluk koşulları programın resmî kılavuzunda yer alır.

? Çocuğum bir takıma nasıl katılır?
Okulunuzdaki bir öğretmen ya da 18 yaş üstü bir mentor takımı kurar ve RECFEvents.org'da kaydeder. Okulunuzda takım yoksa bize ulaşın; size en uygun başlangıcı birlikte planlayalım.

? Okul dışında takım kurulabilir mi?
Evet. Kulüp, dernek ve bağımsız topluluklar da takım kurabilir; her takımın 18 yaş üstü bir mentoru olmalıdır.

? Çocuğumun bilgileri sitede yayınlanır mı?
Hayır. Öğrencilere ait kişisel veriler sitede yayınlanmaz. Takımlar listesinde yalnız yayın onamı veren takımların adı, okulu ve ili yer alır.

[[Tüm sık sorulan sorular](/sss)]`;

const IS_BIRLIKLERI = `Şirketler, vakıflar ve kurumlar; RECF Türkiye ile öğrencilerin robotik ve drone takımlarına doğrudan destek olabilir. Desteğinizi okul, bölge ve program bazında birlikte planlayalım.

## Takım Bursu modeli
Takım Bursu, bir kurumun bir veya daha fazla öğrenci takımının sezon giderlerini üstlenmesidir. Burs; resmî takım kayıt ücretini ({{fee}}), donanım ve etkinlik katılımı gibi kalemleri kapsayacak şekilde planlanabilir.
- Desteklenecek takım sayısını, programı ve bölgeyi birlikte belirleriz
- Takımı okul veya topluluk iş birliğiyle eşleştiririz
- Takımın sezon yolculuğunu birlikte duyururuz

## Sponsorluk seviyeleri
Sponsorluk takım, etkinlik veya sezon ölçeğinde planlanabilir. Her seviyenin kapsamını ve görünürlük seçeneklerini görüşmede kurumunuzun hedeflerine göre birlikte netleştiririz.
- Takım Destekçisi: bir veya daha fazla takımın Takım Bursu
- Etkinlik Partneri: belirli bir etkinliğin saha, ödül veya deneyim alanları
- Sezon Partneri: sezon boyunca program ve etkinlik desteği

## Bağımsız değerlendirme
Saha ve değerlendirme ekipleri bağımsız çalışır; sponsor temsilcileri hakem ve jüri görevlerinde yer almaz.`;

const SSS = `Ücret, malzeme, takım kurma, yaş grupları, etkinlikler ve World Championship yolu hakkında en çok sorulan sorular.

## Ücret ve kayıt
? Takım kayıt ücreti ne kadar?
{{season}} sezonu için RECF resmî takım kayıt ücreti takım başına {{fee}} ve kayıt RECFEvents.org üzerinden yapılır. Kaynak: [RECF Sık Sorulan Sorular]({{fee_source}}). Takım Bursu ve kurumsal paket seçenekleri için bize ulaşın.

? Bu sitedeki ön başvuru resmî kayıt yerine geçer mi?
Hayır. Ön başvuru takımınızı RECF Türkiye ekibiyle tanıştırır ve destek sürecini başlatır. Resmî sezon kaydı ve takım numarası RECFEvents.org üzerinden tamamlanır. [Takım kaydı rehberi](/rehber/takim-kaydi)

? Etkinliklerin ayrıca katılım ücreti var mı?
Etkinliklerin kayıt koşulları ve varsa katılım ücretleri her etkinliğin kendi sayfasında duyurulur.

## Malzeme
? Hangi malzemeleri kullanmalıyız?
Her programın resmî oyun kılavuzu kullanılabilecek donanımı ve teknik sınırları tanımlar. Donanım satın almadan önce programınızın güncel kılavuzunu [Dokümanlar](/dokumanlar) sayfasından inceleyin.

? Hiç donanımımız yok, nereden başlamalıyız?
Bize ulaşın; programınıza uygun başlangıç planını birlikte çıkaralım. Okullar için [randevu formu](/okullar#randevu) üzerinden görüşme talep edebilirsiniz.

## Takım kurma
? Kimler takım kurabilir?
Programın yaş ve kademe koşullarını sağlayan öğrenciler, 18 yaş üstü bir mentor eşliğinde takım kurabilir.

? Okul takımı olmak zorunlu mu?
Hayır. Okul takımlarının yanı sıra kulüp, dernek ve bağımsız topluluklar da takım kurabilir.

? Takımda kaç öğrenci olmalı?
Takım büyüklüğü programa göre değişir; ayrıntılar programın resmî oyun kılavuzunda yer alır.

## Yaş grupları
? Hangi program hangi yaş grubu için?
{{program_ages}}. Kesin uygunluk koşulları için programın resmî kılavuzunu inceleyin.

## Etkinlikler
? Etkinliklere nasıl katılırız?
Etkinlik takvimini takip edin; her etkinliğin kayıt bağlantısı ve katılım koşulları etkinlik sayfasında yayınlanır. RECF etkinliklerine kayıt RECFEvents.org üzerinden yapılır.

? Başka organizasyonların yarışmalarına da katılabilir miyiz?
RECF Türkiye, RECF'in Türkiye'deki resmi programıdır. Diğer organizasyonların etkinliklerine katılım koşulları ilgili organizasyonlar tarafından belirlenir; bu konuda doğrudan ilgili kurumla iletişime geçmenizi öneririz.

## World Championship yolu
? RECF STEM World Championship nedir?
RECF sezonunun zirve etkinliğidir. 2027 tarihi ve yeri: {{wc_date}} · {{wc_city}}. Kaynak: [RECF Sık Sorulan Sorular]({{wc_source}})

? World Championship'e nasıl gidilir?
RECF etkinliklerine katılım, RECF STEM World Championship'e giden yoldur. RECF, düzenlediği, tanıttığı veya yönettiği yarışmaların takımları 2027 RECF STEM World Championship'e taşıyacağını duyurmuştur. Kaynak: [RECF duyurusu]({{pathway_source}})`;

const LANSMAN = `Okullar, antrenörler ve veliler için RECF Türkiye programlarını, sezon rotasını ve takım kurma sürecini tanıttığımız lansman buluşması.

## Program
- RECF Türkiye ve {{season}} sezonu
- Programlar: RECF Engage, RECF Achieve, RECF Inspire, ADC ve ADC Pro
- Takım kurma ve RECFEvents.org kaydı
- Soru-cevap

## Kimler katılmalı?
Okul yöneticileri, öğretmenler, antrenörler, veliler ve takım kurmak isteyen kurumlar.`;

const EN_HOME = `RECF Türkiye brings RECF robotics and drone programs to schools, coaches and families across Türkiye. Build a team, choose your program and join the season.

## Programs
RECF Engage, RECF Achieve, RECF Inspire, Aerial Drone Competition (ADC) and ADC Pro. Each program has its own age groups and season game.
[[Explore programs (Turkish)](/programlar)]

## How to join
- Choose a program that fits your students' age group
- Form a team with an adult mentor (18+)
- Register the team officially on RECFEvents.org — the {{season}} team registration fee is {{fee}}
- Follow the RECF Türkiye event calendar

## The road to St. Louis
The season culminates at the {{wc_name}}: {{wc_date}} · {{wc_city}}. Participating in RECF events is the pathway to the World Championship. Source: [RECF FAQ]({{wc_source}})
[[Read the FAQ](/en/faq)]`;

const EN_ABOUT = `RECF Türkiye is the RECF program in Türkiye. It is operated by Intechne Teknoloji A.Ş. under a written agreement with the Robotics Education & Competition Foundation; the Türkiye partnership agreement was signed in October 2026.

## What we do
- Run RECF robotics and drone programs in Türkiye
- Support schools, coaches and families in building teams
- Organize events on the season pathway

## Contact
Write to us for team support, school partnerships and sponsorship questions. Our team responds in Turkish and English.`;

const EN_FAQ = `Answers to the most common questions about fees, equipment, building a team, age groups, events and the World Championship pathway.

## Fees and registration
? How much is the team registration fee?
For the {{season}} season the official RECF team registration fee is {{fee}} per team, paid on RECFEvents.org. Source: [RECF FAQ]({{fee_source}})

? Does the RECF Türkiye pre-application replace official registration?
No. The pre-application introduces your team to the RECF Türkiye team. Official season registration and team numbers are completed on RECFEvents.org.

## Equipment
? Which equipment should we use?
Each program's official game manual defines the allowed hardware and technical limits. Check the current manual before buying equipment.

## Building a team
? Who can build a team?
Students who meet a program's age and grade requirements can build a team with an adult mentor (18+). Schools, clubs and independent communities are all welcome.

## Age groups
? Which program fits which age group?
{{program_ages}}. See each program's official manual for exact eligibility.

## Events
? How do we join events?
Follow the event calendar. Each event page lists its registration link and conditions. Registration for RECF events is completed on RECFEvents.org.

? Can we also take part in other organizations' competitions?
RECF Türkiye is RECF's official program in Türkiye. Participation conditions for other organizations' events are set by those organizations; we recommend contacting the relevant organization directly.

## World Championship pathway
? What is the RECF STEM World Championship?
It is the culminating event of the RECF season: {{wc_date}} · {{wc_city}}. Source: [RECF FAQ]({{wc_source}})

? How do teams reach the World Championship?
Participating in RECF events is the pathway to the RECF STEM World Championship. RECF has announced that competitions it organizes, promotes or manages qualify teams for the 2027 RECF STEM World Championship. Source: [RECF announcement]({{pathway_source}})`;

export const SITE_PAGES: SitePageDefinition[] = [
  { slug: "okullar", path: "/okullar", kicker: "OKULLAR İÇİN", title: "OKULUNUZ SAHAYA ÇIKSIN.", description: "Okul yöneticileri için RECF Türkiye: kampüs içi lig, öğretmen ve antrenör eğitimi, kurumsal paketler, sezon takvimi ve randevu talebi.", defaultPublished: true, lang: "tr", body: OKULLAR },
  { slug: "veliler", path: "/veliler", kicker: "VELİLER İÇİN", title: "ÇOCUĞUNUZ SAHADA. SİZ YANINDASINIZ.", description: "Veliler için RECF Türkiye: öğrencinin kazanımları, güvenlik, KVKK ve katılım onamı, maliyet ve sık sorulan sorular.", defaultPublished: true, lang: "tr", body: VELILER },
  { slug: "is-birlikleri", path: "/is-birlikleri", kicker: "SPONSORLAR VE İŞ BİRLİKLERİ", title: "GELECEĞİN MÜHENDİSLERİNE SAHA AÇIN.", description: "RECF Türkiye Takım Bursu modeli, sponsorluk seviyeleri ve kurumsal iş birliği iletişim formu.", defaultPublished: true, lang: "tr", body: IS_BIRLIKLERI },
  { slug: "sss", path: "/sss", kicker: "SIK SORULAN SORULAR", title: "MERAK ETTİKLERİN.", description: "RECF Türkiye sık sorulan sorular: kayıt ücreti, malzeme, takım kurma, yaş grupları, etkinlikler ve RECF STEM World Championship yolu.", defaultPublished: true, lang: "tr", body: SSS },
  { slug: "lansman", path: "/lansman", kicker: "LANSMAN", title: "RECF TÜRKİYE LANSMANI", description: "RECF Türkiye lansman etkinliği: program, tarih, mekân ve katılım formu.", defaultPublished: false, lang: "tr", body: LANSMAN },
  { slug: "en-home", path: "/en", kicker: "RECF TÜRKİYE", title: "DESIGN IT. BUILD IT. PROVE IT ON THE FIELD.", description: "RECF Türkiye — RECF robotics and drone programs in Türkiye: Engage, Achieve, Inspire, Aerial Drone Competition and ADC Pro.", defaultPublished: true, lang: "en", body: EN_HOME },
  { slug: "en-about", path: "/en/about", kicker: "ABOUT", title: "ABOUT RECF TÜRKİYE", description: "RECF Türkiye is operated by Intechne Teknoloji A.Ş. under a written agreement with the Robotics Education & Competition Foundation.", defaultPublished: true, lang: "en", body: EN_ABOUT },
  { slug: "en-faq", path: "/en/faq", kicker: "FAQ", title: "FREQUENTLY ASKED QUESTIONS", description: "RECF Türkiye FAQ: registration fee, equipment, building a team, age groups, events and the RECF STEM World Championship pathway.", defaultPublished: true, lang: "en", body: EN_FAQ },
];

export const sitePage = (slug: string) => SITE_PAGES.find(page => page.slug === slug);
