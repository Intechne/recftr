import { CANONICAL_ORIGIN, DATA_CONTROLLER, PROGRAM_ELIGIBILITY, RECF_SOURCES, REPRESENTATION_LINE, SEASON, WORLD_CHAMPIONSHIP, FEE_SUMMARY } from "@/lib/site-config";

// llms.txt — veri sorumlusu, program ve sezon bilgileri sitenin geri kalanıyla aynı tek kaynaktan üretilir.
export const dynamic = "force-static";

const PROGRAMS: Array<[string, string, string]> = [
  ["engage", "RECF Engage — Tier Takeover", "/programlar/engage"],
  ["achieve", "RECF Achieve — Pinnacle", "/programlar/achieve"],
  ["inspire", "RECF Inspire — Pinnacle · Üniversite", "/programlar/inspire"],
  ["adc", "Aerial Drone Competition — Mission 2027: Fast Track", "/programlar/adc"],
  ["adc-pro", "ADC Pro — Off Grid", "/programlar/adc-pro"],
];

export function GET() {
  const u = (path: string) => `${CANONICAL_ORIGIN}${path}`;
  const body = `# RECF Türkiye

> RECF Türkiye, Robotics Education & Competition Foundation (RECF) programlarının Türkiye'deki resmî platformudur; ${DATA_CONTROLLER.shortName} tarafından yürütülür (${REPRESENTATION_LINE}).

## Programlar (${SEASON} sezonu)
${PROGRAMS.map(([slug, name, path]) => `- [${name}](${u(path)}): ${PROGRAM_ELIGIBILITY[slug].tr}${PROGRAM_ELIGIBILITY[slug].teamTr ? `; takım: ${PROGRAM_ELIGIBILITY[slug].teamTr}` : ""}.`).join("\n")}
- Uygunluk kaynağı: ${RECF_SOURCES.chooseCompetition}

## Sezon
- Resmî takım kaydı ve ödeme: RECFEvents.org — ${FEE_SUMMARY}.
- ${WORLD_CHAMPIONSHIP.name}: ${WORLD_CHAMPIONSHIP.label} · ${WORLD_CHAMPIONSHIP.city} (kaynak: ${WORLD_CHAMPIONSHIP.source}).
- Türkiye etkinlik tarihleri yalnız teyit edildikçe etkinlik takviminde yayımlanır: ${u("/etkinlikler")}

## Temel sayfalar
- [Takım başvurusu](${u("/kayit")}) · [Takım kaydı rehberi](${u("/rehber/takim-kaydi")}) · [SSS](${u("/sss")})
- [Dokümanlar ve resmî RECF belgeleri](${u("/dokumanlar")}) — oyun kılavuzları: https://games.recf.org
- [Hakkımızda](${u("/hakkimizda")}) · [English](${u("/en")})

## Politikalar
- [KVKK](${u("/kvkk")}) · [Açık Rıza](${u("/acik-riza")}) · [Katılım Onamı](${u("/katilim-onami")}) · [Gizlilik](${u("/gizlilik")}) · [Kullanım Koşulları](${u("/kullanim-kosullari")}) · [Çerez Politikası](${u("/cerez-politikasi")})

## İletişim (veri sorumlusu)
- ${DATA_CONTROLLER.title}
- Adres: ${DATA_CONTROLLER.address}
- E-posta: ${DATA_CONTROLLER.email} · Telefon: ${DATA_CONTROLLER.phone}
- Alan adı: ${CANONICAL_ORIGIN.replace("https://", "")}
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
