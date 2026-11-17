# -*- coding: utf-8 -*-
"""
Hukuki belgelerin (KVKK Aydınlatma, Açık Rıza, Katılım Onamı) indirilebilir, doldurulabilir A4 PDF'leri.

Metin lib/provided-legal-documents.json'dan aynen alınır; yalnız olgusal alanlar (veri sorumlusu adresi,
e-posta, telefon, tarih, sürüm) lib/site-config.ts → DATA_CONTROLLER / LEGAL_VERSION'dan doldurulur.
Ad-soyad, tarih, imza ve tercih alanları PDF'te doldurulabilir form alanıdır; web sayfasında gösterilmez.

Kullanım:
  .venv/bin/python scripts/legal-docs/build.py --fonts <Montserrat/RobotoCondensed TTF klasörü>
Çıktı: public/legal/{kvkk,acik-riza,katilim-onami}.pdf
"""
import argparse
import hashlib
import importlib.util
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
spec = importlib.util.spec_from_file_location("jury", os.path.join(ROOT, "scripts", "jury-docs", "build.py"))
jury = importlib.util.module_from_spec(spec)
spec.loader.exec_module(jury)

from reportlab.lib.colors import HexColor  # noqa: E402
from reportlab.lib.units import mm  # noqa: E402
from reportlab.lib.utils import simpleSplit  # noqa: E402


def site_config():
    src = open(os.path.join(ROOT, "lib", "site-config.ts"), encoding="utf-8").read()
    def block(name):
        body = re.search(name + r"\s*=\s*\{(.*?)\}\s*as const;", src, re.S).group(1)
        return dict(re.findall(r'(\w+):\s*"([^"]*)"', body))
    return block("DATA_CONTROLLER"), block("LEGAL_VERSION")


DC, LV = site_config()

HEADINGS = {"Veri Sorumlusu", "İşlenen Kişisel Veriler", "Kişisel Verilerin İşlenme Amaçları", "Hukuki Sebepler", "Aktarım",
            "Toplama Yöntemi", "İlgili Kişi Hakları", "Başvuru Usulü", "Organizatör", "Katılımcı",
            "Etkinliğin Niteliği ve Risklerin Bilindiği", "Bulaşıcı Hastalıklar ve Sağlık Durumuna İlişkin Kabul",
            "Kural ve Talimatlara Uyma Yükümlülüğü", "Davranış ve Etik Kurallar", "Kaza, Yaralanma ve Sorumluluk Sınırı",
            "Robot, Ekipman ve Kişisel Eşyalar", "Acil Durum ve İlk Müdahale", "Beyan"}
FIELD = re.compile(r"^(Veli Ad Soyad|Açık Rıza Tarihi|Tarih|Etkinlik / Yarışma Adı|Etkinlik Tarihi|Etkinlik Yeri|"
                   r"Adı Soyadı / TC\. Kimlik No|Okulu / Kurumu / Takımı|Veli Adı Soyadı / TC\. Kimlik No|İletişim)\s*:")


def apply_facts(text):
    text = text.replace("off-season@intechne.com.tr", DC["email"])
    for label, value in [("Adresi", DC["address"]), ("Telefon", DC["phone"]), ("Elektronik Posta Adresi", DC["email"]),
                         ("Aydınlatma Metni Tarihi", LV["effectiveLabel"])]:
        text = re.sub(rf"^{re.escape(label)}\s*:.*$", f"{label} : {value}", text, flags=re.M)
    return text


def render_block(d, block, slug):
    lines = [l.rstrip() for l in block.strip().split("\n") if l.strip()]
    if not lines:
        return
    if lines[0] in HEADINGS:
        d.heading(lines[0])
        lines = lines[1:]
    i = 0
    paragraph, bullets = [], []

    def flush():
        nonlocal paragraph, bullets
        if paragraph:
            d.para(" ".join(paragraph))
            paragraph = []
        if bullets:
            d.bullets(bullets)
            bullets = []

    while i < len(lines):
        line = lines[i].strip()
        if line in HEADINGS:
            flush()
            d.heading(line)
        elif line.startswith("Veli Ad Soyad"):
            flush()
            d.ensure(40 * mm)
            d.field_row(["Veli Ad Soyad", "Katılımcı Öğrenci Ad Soyad"])
            d.field_row(["Veli İmza", "Katılımcı Öğrenci İmza"], height=14 * mm)
        elif line == "İmza İmza":
            pass
        elif FIELD.match(line):
            flush()
            d.field_row([line.split(":")[0].strip()])
        elif re.match(r"^[A-ZÇĞİÖŞÜa-zçğıöşü /.]+ :", line) and len(line) < 120 and not line.startswith("•"):
            flush()
            d.para(line)
        elif line.startswith("•"):
            if paragraph:
                d.para(" ".join(paragraph)); paragraph = []
            bullets.append(line[1:].strip())
        elif bullets and not paragraph:
            bullets[-1] += " " + line
        else:
            paragraph.append(line)
        i += 1
    flush()


def consent_table(d, items):
    c = d.c
    col_q = jury.W - 2 * jury.M - 50 * mm
    d.ensure(12 * mm)
    c.setFillColor(jury.INK)
    c.rect(jury.M, d.y - 6 * mm, jury.W - 2 * jury.M, 7.5 * mm, stroke=0, fill=1)
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("BodyBold", 8)
    c.drawString(jury.M + 2 * mm, d.y - 3.6 * mm, "AÇIK RIZA KONUSU")
    c.drawString(jury.M + col_q, d.y - 3.6 * mm, "VERİYORUM")
    c.drawString(jury.M + col_q + 25 * mm, d.y - 3.6 * mm, "VERMİYORUM")
    d.y -= 11 * mm
    for item in items:
        lines = simpleSplit(item, "Body", 9.5, col_q - 6 * mm)
        row_h = len(lines) * 12.5 + 5 * mm
        d.ensure(row_h + 2 * mm)
        c.setStrokeColor(HexColor("#D5DAE3"))
        c.rect(jury.M, d.y - row_h + 4 * mm, jury.W - 2 * jury.M, row_h, stroke=1, fill=0)
        ty = d.y
        for line in lines:
            c.setFillColor(jury.INK)
            c.setFont("Body", 9.5)
            c.drawString(jury.M + 2 * mm, ty, line)
            ty -= 12.5
        d.checkbox(jury.M + col_q + 4 * mm, d.y - 1.5 * mm, item[:60] + " — Veriyorum")
        d.checkbox(jury.M + col_q + 29 * mm, d.y - 1.5 * mm, item[:60] + " — Vermiyorum")
        d.y -= row_h + 1 * mm
    d.y -= 3 * mm


def build(doc, fonts):
    jury.VERSION = f"Sürüm {LV['version']} · Yürürlük {LV['effectiveLabel']}"
    jury.OUT = os.path.join(ROOT, "public", "legal")
    d = jury.Doc(os.path.basename(doc["pdf"]), doc["title"], f"{DC['title']} · Veri sorumlusu", notice=False)
    for page in doc["pages"]:
        text = apply_facts(page)
        if doc["slug"] == "acik-riza":
            blocks = [b for b in re.split(r"\n\s*\n", text) if b.strip()]
            items = [re.sub(r"\s+", " ", b.replace("☐", "")).strip() for b in blocks if "☐" in b]
            rest = [b for b in blocks if "☐" not in b and not b.strip().startswith("Açık Rıza Konusu")]
            render_block(d, rest[0], doc["slug"])
            consent_table(d, items)
            for b in rest[1:]:
                render_block(d, b, doc["slug"])
            continue
        for block in re.split(r"\n\s*\n", text):
            render_block(d, block, doc["slug"])
    d.para(f"Sürüm {LV['version']} · Yürürlük tarihi: {LV['effectiveLabel']} · Veri sorumlusu iletişim: {DC['email']} · {DC['phone']}", size=8, color=jury.MUTED)
    path = d.save()
    jury.embed_turkish_field_font(path, os.path.join(fonts, "RobotoCondensed-Regular.ttf"))
    return path


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--fonts", required=True)
    args = parser.parse_args()
    jury.register_fonts(args.fonts)
    source = os.path.join(ROOT, "lib", "provided-legal-documents.json")
    docs = json.load(open(source, encoding="utf-8"))
    for doc in docs:
        path = build(doc, args.fonts)
        from pypdf import PdfReader
        doc["pageCount"] = len(PdfReader(path).pages)
        doc["sha256"] = hashlib.sha256(open(path, "rb").read()).hexdigest()
        print(path, doc["pageCount"], doc["sha256"][:12])
    json.dump(docs, open(source, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    open(source, "a", encoding="utf-8").write("\n")
