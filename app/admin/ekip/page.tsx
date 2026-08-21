"use client";
import { useState } from "react";

const initialTeam = [
  { name: "Ömer A.", email: "admin@recfturkiye.org", role: "YÖNETİCİ", scope: "Tam yetki — tüm modüller", active: "şimdi" },
  { name: "Canan Y.", email: "canan@recfturkiye.org", role: "EDİTÖR", scope: "Haberler, dokümanlar, medya", active: "2 sa önce" },
  { name: "İpek D.", email: "ipek@recfturkiye.org", role: "ONAY YETKİLİSİ", scope: "Takım onayları, ödemeler", active: "dün" },
  { name: "Yusuf K.", email: "yusuf@recfturkiye.org", role: "TEKNİK", scope: "Site ayarları, entegrasyonlar", active: "3 gün önce" },
  { name: "Seha T.", email: "seha@recfturkiye.org", role: "EDİTÖR", scope: "Haberler, medya", active: "1 hf önce" },
];
const roleColor: Record<string, string> = {
  "YÖNETİCİ": "bg-ink text-cyan-brand",
  "EDİTÖR": "bg-cyan-brand text-ink",
  "ONAY YETKİLİSİ": "bg-amber-400 text-ink",
  "TEKNİK": "bg-purple-700 text-white",
};

export default function EkipAdmin() {
  const [team, setTeam] = useState(initialTeam);
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-[24px] font-bold text-ink">EKİP & YETKİLER</h1>
      <p className="text-[13.5px] text-ink/55">CMS erişimi olan kullanıcılar ve rol bazlı yetki kapsamları.</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="e-posta ile davet et…"
          className="w-72 rounded-md border-[1.5px] border-ink/20 bg-white px-3.5 py-2.5 text-[13.5px] outline-none focus:border-cyan-deep" />
        <select className="rounded-md border-[1.5px] border-ink/20 bg-white px-3 py-2.5 font-display text-[12.5px] font-bold text-ink">
          <option>EDİTÖR</option><option>ONAY YETKİLİSİ</option><option>TEKNİK</option>
        </select>
        <button onClick={() => { if (email.includes("@")) { setMsg(`Davet gönderildi: ${email}`); setEmail(""); } }}
          className="plate-hover rounded-md bg-ink px-4 py-2.5 font-display text-[12.5px] font-bold text-white shadow-plateSm shadow-cyan-brand">DAVET GÖNDER</button>
      </div>
      {msg && <p className="mt-3 rounded-lg border-2 border-emerald-600 bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-700">✓ {msg}</p>}

      <div className="mt-5 overflow-x-auto rounded-xl border-2 border-ink bg-white">
        <table className="w-full min-w-[680px] text-left text-[13px]">
          <thead className="bg-ink font-display text-[11px] tracking-[1px] text-white">
            <tr>{["KULLANICI", "ROL", "YETKİ KAPSAMI", "SON AKTİF", ""].map(h => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-ink/10">
            {team.map((u, i) => (
              <tr key={u.email} className="hover:bg-paper">
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-ink">{u.name}</p>
                  <p className="text-[12px] text-ink/50">{u.email}</p>
                </td>
                <td className="px-4 py-3.5"><span className={`rounded-md px-2.5 py-1 font-display text-[10.5px] font-bold ${roleColor[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3.5 text-ink/65">{u.scope}</td>
                <td className="px-4 py-3.5 text-ink/50">{u.active}</td>
                <td className="px-4 py-3.5">
                  {u.role !== "YÖNETİCİ" && (
                    <button onClick={() => { setTeam(t => t.filter((_, j) => j !== i)); setMsg(`${u.name} erişimi kaldırıldı.`); }}
                      className="font-display text-[11.5px] font-bold text-red-600">KALDIR</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-xl border-[1.5px] border-ink/15 bg-white p-5 text-[13px] leading-relaxed text-ink/65">
        <p className="font-display text-[12px] font-bold tracking-[1px] text-ink">YETKİ İLKELERİ</p>
        <p className="mt-2">◆ Takım onayı ve ödeme işlemleri çift kontrol ister: Onay Yetkilisi işler, Yönetici haftalık denetler. ◆ Jüri/hakem atamalarına sponsor rolü erişemez (Fair Judging politikası). ◆ Tüm silme işlemleri 30 gün geri alınabilir kayıtla loglanır.</p>
      </div>
    </div>
  );
}
