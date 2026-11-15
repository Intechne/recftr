# -*- coding: utf-8 -*-
"""
RECF Türkiye jüri ve hakem belgeleri — A4, Türkçe, yazdırılabilir ve doldurulabilir PDF.

Bu belgeler RECF Türkiye operasyonu içindir; resmî RECF belgelerinin yerine geçmez ve RECF'in
değerlendirme kriterlerini yeniden yazmaz. Kriterler için her zaman resmî RECF rehberine atıf yapılır.

Kullanım:
  python3 -m venv .venv && .venv/bin/pip install reportlab==4.2.5 pillow pypdf==5.1.0 fonttools
  .venv/bin/python scripts/jury-docs/build.py --fonts <Montserrat/RobotoCondensed TTF klasörü>
Çıktı: public/belgeler/*.pdf (hukuki onay bekleyenler: docs/belgeler-taslak/)
"""
import argparse
import os
from datetime import date

from reportlab.lib.colors import HexColor, white
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader, simpleSplit

INK = HexColor("#10192F")
CYAN = HexColor("#29B9E5")
DEEP = HexColor("#1467A8")
PAPER = HexColor("#F3F5F9")
MUTED = HexColor("#4B5366")
W, H = A4
M = 18 * mm
VERSION = "Sürüm 1.0 · Kasım 2026"
JUDGING_URL = "kb.roboticseducation.org — Robotics / Drones Guide to Judging"
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "belgeler")
# Hukuki onay bekleyen metinler sunulmayan klasöre yazılır; onaydan sonra public/belgeler'e taşınır.
DRAFT_OUT = os.path.join(ROOT, "docs", "belgeler-taslak")
LOGO = os.path.join(ROOT, "public", "logos", "recf-turkiye-logo.png")


def register_fonts(folder):
    for name, file in [("Body", "RobotoCondensed-Regular.ttf"), ("BodyBold", "RobotoCondensed-Bold.ttf"),
                       ("Head", "Montserrat-Bold.ttf"), ("HeadBlack", "Montserrat-ExtraBold.ttf")]:
        pdfmetrics.registerFont(TTFont(name, os.path.join(folder, file)))


class Doc:
    def __init__(self, filename, title, subtitle, notice=True, draft_note=None):
        folder = DRAFT_OUT if draft_note else OUT
        os.makedirs(folder, exist_ok=True)
        self.path = os.path.join(folder, filename)
        self.c = canvas.Canvas(self.path, pagesize=A4)
        self.c.setTitle(f"RECF Türkiye — {title}")
        self.c.setAuthor("RECF Türkiye · Intechne Teknoloji A.Ş.")
        self.c.setSubject(subtitle)
        self.c.setCreator("recfturkiye.com")
        self.title, self.subtitle, self.notice, self.draft_note = title, subtitle, notice, draft_note
        self.page = 0
        self.field_seq = 0
        self.new_page(first=True)

    # ── sayfa iskeleti ──
    def new_page(self, first=False):
        if not first:
            self.footer()
            self.c.showPage()
        self.page += 1
        c = self.c
        c.setFillColor(INK)
        c.rect(0, H - 26 * mm, W, 26 * mm, stroke=0, fill=1)
        c.setFillColor(CYAN)
        c.rect(0, H - 27.2 * mm, W, 1.2 * mm, stroke=0, fill=1)
        # Logo beyaz plaka üzerinde (lockup koyu renkli)
        c.setFillColor(white)
        c.roundRect(M, H - 21 * mm, 54 * mm, 16 * mm, 2 * mm, stroke=0, fill=1)
        if os.path.exists(LOGO):
            c.drawImage(ImageReader(LOGO), M + 2 * mm, H - 19.5 * mm, width=50 * mm, height=14 * mm, mask="auto", preserveAspectRatio=True, anchor="c")
        c.setFillColor(CYAN)
        c.setFont("HeadBlack", 8)
        c.drawRightString(W - M, H - 11 * mm, "RECF TÜRKİYE BELGESİ")
        c.setFillColor(white)
        c.setFont("Body", 8)
        c.drawRightString(W - M, H - 16 * mm, VERSION)
        self.y = H - 36 * mm
        if first:
            c.setFillColor(INK)
            c.setFont("HeadBlack", 19)
            for line in simpleSplit(self.title.upper(), "HeadBlack", 19, W - 2 * M):
                c.drawString(M, self.y, line)
                self.y -= 8 * mm
            c.setFont("Body", 10.5)
            c.setFillColor(MUTED)
            c.drawString(M, self.y + 1 * mm, self.subtitle)
            self.y -= 7 * mm
            if self.draft_note:
                self.box(self.draft_note, fill=HexColor("#FFF4D6"), bar=HexColor("#C98A00"))
            if self.notice:
                self.box("Bu belge RECF Türkiye operasyonu için hazırlanmıştır ve resmî RECF belgelerinin yerine geçmez. "
                         "Değerlendirme kriterleri, ödül tanımları ve rubrikler için her zaman RECF’in resmî İngilizce "
                         f"belgeleri esas alınır ({JUDGING_URL}).")

    def footer(self):
        c = self.c
        c.setStrokeColor(HexColor("#D5DAE3"))
        c.line(M, 14 * mm, W - M, 14 * mm)
        c.setFont("Body", 7.5)
        c.setFillColor(MUTED)
        c.drawString(M, 9.5 * mm, f"RECF Türkiye · {self.title} · {VERSION}")
        c.drawRightString(W - M, 9.5 * mm, f"recfturkiye.com · Sayfa {self.page}")

    def ensure(self, needed):
        if self.y - needed < 20 * mm:
            self.new_page()

    # ── içerik blokları ──
    def box(self, text, fill=PAPER, bar=CYAN, size=9):
        lines = simpleSplit(text, "Body", size, W - 2 * M - 8 * mm)
        h = len(lines) * (size + 3) + 7 * mm
        self.ensure(h + 3 * mm)
        c = self.c
        c.setFillColor(fill)
        c.rect(M, self.y - h, W - 2 * M, h, stroke=0, fill=1)
        c.setFillColor(bar)
        c.rect(M, self.y - h, 1.4 * mm, h, stroke=0, fill=1)
        c.setFillColor(INK)
        c.setFont("Body", size)
        ty = self.y - 4.5 * mm - size * 0.6
        for line in lines:
            c.drawString(M + 5 * mm, ty, line)
            ty -= size + 3
        self.y -= h + 5 * mm

    def heading(self, text):
        self.ensure(14 * mm)
        c = self.c
        c.setFillColor(DEEP)
        c.setFont("Head", 10.5)
        c.drawString(M, self.y, text.upper())
        c.setStrokeColor(CYAN)
        c.setLineWidth(1)
        c.line(M, self.y - 2.2 * mm, W - M, self.y - 2.2 * mm)
        self.y -= 8 * mm

    def para(self, text, size=9.5, color=INK, indent=0):
        lines = simpleSplit(text, "Body", size, W - 2 * M - indent)
        for line in lines:
            self.ensure(size + 4)
            self.c.setFillColor(color)
            self.c.setFont("Body", size)
            self.c.drawString(M + indent, self.y, line)
            self.y -= size + 3.2
        self.y -= 2

    def bullets(self, items, size=9.5):
        for item in items:
            lines = simpleSplit(item, "Body", size, W - 2 * M - 6 * mm)
            self.ensure(len(lines) * (size + 3.2) + 2)
            self.c.setFillColor(CYAN)
            self.c.rect(M + 0.6 * mm, self.y + 0.6 * mm, 1.8 * mm, 1.8 * mm, stroke=0, fill=1)
            for i, line in enumerate(lines):
                self.c.setFillColor(INK)
                self.c.setFont("Body", size)
                self.c.drawString(M + 6 * mm, self.y, line)
                self.y -= size + 3.2
            self.y -= 1.5

    def _name(self, label):
        self.field_seq += 1
        base = "".join(ch if ch.isalnum() else "_" for ch in label.encode("ascii", "ignore").decode())[:30] or "alan"
        return f"f{self.field_seq:03d}_{base}"

    def text_field(self, label, x, width, height=7 * mm, multiline=False, tooltip=None):
        c = self.c
        c.setFillColor(MUTED)
        c.setFont("BodyBold", 8)
        c.drawString(x, self.y, label)
        fy = self.y - height - 1.2 * mm
        c.acroForm.textfield(name=self._name(label), tooltip=tooltip or label, x=x, y=fy, width=width, height=height,
                             borderColor=HexColor("#9AA3B5"), fillColor=white, textColor=INK, borderWidth=0.8,
                             fontName="Helvetica", fontSize=9 if not multiline else 8.5, forceBorder=True,
                             fieldFlags="multiline" if multiline else "")
        return fy

    def field_row(self, labels, height=7 * mm, multiline=False):
        self.ensure(height + 9 * mm)
        gap = 4 * mm
        width = (W - 2 * M - gap * (len(labels) - 1)) / len(labels)
        bottom = self.y
        for i, label in enumerate(labels):
            bottom = self.text_field(label, M + i * (width + gap), width, height, multiline)
        self.y = bottom - 4.5 * mm

    def checkbox(self, x, y, label_for):
        self.c.acroForm.checkbox(name=self._name(label_for), tooltip=label_for, x=x, y=y, size=4.2 * mm,
                                 borderColor=INK, fillColor=white, textColor=INK, buttonStyle="check", borderWidth=0.9, forceBorder=True)

    def check_items(self, items, size=9.5):
        for item in items:
            lines = simpleSplit(item, "Body", size, W - 2 * M - 9 * mm)
            self.ensure(len(lines) * (size + 3.2) + 4 * mm)
            self.checkbox(M, self.y - 1.3 * mm, item)
            for line in lines:
                self.c.setFillColor(INK)
                self.c.setFont("Body", size)
                self.c.drawString(M + 7 * mm, self.y, line)
                self.y -= size + 3.2
            self.y -= 3

    def yes_no_rows(self, questions):
        col_q = W - 2 * M - 70 * mm
        for q in questions:
            lines = simpleSplit(q, "Body", 9, col_q - 8 * mm)
            row_h = max(len(lines) * 12 + 6, 11 * mm)
            self.ensure(row_h + 2 * mm)
            c = self.c
            c.setStrokeColor(HexColor("#D5DAE3"))
            c.rect(M, self.y - row_h + 4 * mm, W - 2 * M, row_h, stroke=1, fill=0)
            ty = self.y
            for line in lines:
                c.setFillColor(INK)
                c.setFont("Body", 9)
                c.drawString(M + 2 * mm, ty, line)
                ty -= 12
            cx = M + col_q
            c.setFont("BodyBold", 8)
            self.checkbox(cx, self.y - 1.5 * mm, q + " — Evet")
            c.setFillColor(INK)
            c.drawString(cx + 5.5 * mm, self.y - 0.3 * mm, "EVET")
            self.checkbox(cx + 17 * mm, self.y - 1.5 * mm, q + " — Hayır")
            c.drawString(cx + 22.5 * mm, self.y - 0.3 * mm, "HAYIR")
            c.acroForm.textfield(name=self._name(q + " açıklama"), tooltip=f"{q} — açıklama / takım no", x=cx + 35 * mm, y=self.y - row_h + 5.5 * mm,
                                 width=33 * mm, height=row_h - 3 * mm, borderColor=HexColor("#9AA3B5"), fillColor=white, textColor=INK,
                                 borderWidth=0.6, fontName="Helvetica", fontSize=8, fieldFlags="multiline", forceBorder=True)
            self.y -= row_h

    def table(self, headers, widths, rows, row_h=9 * mm):
        c = self.c
        total = sum(widths)
        scale = (W - 2 * M) / total
        widths = [w * scale for w in widths]
        def head():
            c.setFillColor(INK)
            c.rect(M, self.y - 6 * mm, W - 2 * M, 7.5 * mm, stroke=0, fill=1)
            x = M
            c.setFillColor(white)
            c.setFont("BodyBold", 8)
            for h_, w_ in zip(headers, widths):
                c.drawString(x + 1.5 * mm, self.y - 3.6 * mm, h_)
                x += w_
            self.y -= 7.5 * mm
        self.ensure(row_h * 2 + 8 * mm)
        head()
        for r in range(rows):
            if self.y - row_h < 20 * mm:
                self.new_page()
                head()
            x = M
            for h_, w_ in zip(headers, widths):
                c.acroForm.textfield(name=self._name(f"{h_} {r + 1}"), tooltip=f"{h_} — satır {r + 1}", x=x, y=self.y - row_h, width=w_, height=row_h,
                                     borderColor=HexColor("#9AA3B5"), fillColor=white, textColor=INK, borderWidth=0.6,
                                     fontName="Helvetica", fontSize=8, fieldFlags="multiline", forceBorder=True)
                x += w_
            self.y -= row_h
        self.y -= 5 * mm

    def signature_block(self):
        self.ensure(26 * mm)
        self.heading("Beyan sahibi")
        self.field_row(["Ad Soyad", "Tarih", "İmza"], height=9 * mm)

    def save(self):
        self.footer()
        if self.field_seq:
            # Görüntüleyiciler, kullanıcının yazdığı Türkçe karakterleri kendi fontlarıyla yeniden çizsin.
            from reportlab.pdfbase.acroform import PDFFromString
            self.c.acroForm.extras["NeedAppearances"] = PDFFromString("true")
        self.c.save()
        return self.path


def conflict_form():
    d = Doc("recf-turkiye-cikar-catismasi-beyan-formu.pdf", "Jüri ve Hakem Çıkar Çatışması Beyan Formu",
            "Etkinlik öncesinde her jüri üyesi, hakem ve görevli tarafından doldurulur.")
    d.heading("Görevli bilgileri")
    d.field_row(["Ad Soyad", "Görev (jüri / hakem / danışman)"])
    d.field_row(["Etkinlik adı", "Etkinlik tarihi"])
    d.field_row(["E-posta", "Telefon"])
    d.heading("Bildirilecek ilişkiler")
    d.para("Etkinlikte yarışan takımlardan herhangi biriyle aşağıdaki ilişkilerden biri varsa “Evet”i işaretleyin ve ilgili takım numarasını yazın.", color=MUTED)
    d.yes_no_rows([
        "Bir takımda yer alan öğrenciyle akrabalık (ebeveyn, kardeş, eş, yakın akraba) veya vasilik ilişkiniz var mı?",
        "Bir takımın okulunda / kurumunda çalışıyor, öğrenim görüyor veya yönetim görevinde bulunuyor musunuz?",
        "Bu sezon bir takımın mentoru, antrenörü ya da teknik destekçisi oldunuz mu?",
        "Siz ya da çalıştığınız kurum bir takıma sponsorluk, bağış veya ticari hizmet sağlıyor mu?",
        "Bir takımla yukarıda sayılmayan başka bir maddi veya kişisel çıkar ilişkiniz var mı?",
    ])
    d.y -= 3 * mm
    d.heading("Beyan")
    d.para("Yukarıdaki bilgilerin doğru ve eksiksiz olduğunu; etkinlik sırasında yeni bir çıkar çatışması ortaya çıkarsa bunu "
           "Jüri Danışmanı’na veya Baş Hakem’e derhal bildireceğimi; çıkar çatışması bulunan takımla ilgili değerlendirme, "
           "görüşme ve müzakerelerde yer almayacağımı beyan ederim. Çıkar çatışmasına ilişkin RECF’in resmî rehberlerindeki "
           "kuralların geçerli olduğunu biliyorum.")
    d.signature_block()
    d.box("Doldurulan form Jüri Danışmanı / Baş Hakem tarafından etkinlik öncesinde teslim alınır ve görev dağılımı yapılırken dikkate alınır. "
          "Kişisel verileriniz Jüri ve Hakem Gönüllüsü KVKK Aydınlatma Metni kapsamında işlenir.", size=8.5)
    return d.save()


def confidentiality():
    d = Doc("recf-turkiye-tarafsizlik-ve-gizlilik-taahhutnamesi.pdf", "Tarafsızlık ve Gizlilik Taahhütnamesi",
            "Jüri üyeleri, hakemler ve değerlendirme sürecinde görev alan gönüllüler için.")
    d.heading("Taahhütler")
    d.para("RECF Türkiye etkinliğinde üstlendiğim görev kapsamında:")
    d.check_items([
        "Tüm takımları aynı ölçütlerle, tarafsız ve öğrenci odaklı biçimde değerlendireceğim; değerlendirmede yalnız RECF’in resmî kurallarını, rehberlerini ve rubriklerini esas alacağım.",
        "Jüri görüşmelerini, müzakereleri, puanlamaları ve ödül kararlarını etkinlik öncesinde, sırasında ve sonrasında gizli tutacağım; açıklanmamış sonuçları hiçbir kanalda paylaşmayacağım.",
        "Değerlendirme notlarını, rubrikleri ve takımlardan alınan belgeleri yalnız görev amacıyla kullanacak, görev sonunda Jüri Danışmanı’na teslim edeceğim.",
        "Görevim sırasında öğrendiğim öğrenci ve takım bilgilerini (ad, okul, görüntü, iletişim bilgisi vb.) görev amacı dışında kullanmayacak, kopyalamayacak ve üçüncü kişilerle paylaşmayacağım.",
        "Görev sırasında öğrencilerin fotoğrafını veya videosunu kişisel amaçla çekmeyecek, sosyal medyada paylaşmayacağım.",
        "Takımlara bireysel değerlendirme sonucu veya puan bilgisi vermeyeceğim; bu konudaki RECF politikasına uyacağım.",
        "Tarafsızlığımı etkileyebilecek bir durum oluşursa bunu derhal Jüri Danışmanı’na veya Baş Hakem’e bildireceğim.",
    ])
    d.heading("Kabul")
    d.para("Bu taahhütnameyi okudum, anladım ve görevim boyunca uyacağımı kabul ediyorum. Taahhütlere aykırı davranılması hâlinde "
           "görevden alınabileceğimi biliyorum.")
    d.field_row(["Etkinlik adı", "Görev"])
    d.signature_block()
    return d.save()


def assignment_sheet():
    d = Doc("recf-turkiye-juri-gorev-dagilim-cizelgesi.pdf", "Jüri Görev Dağılım Çizelgesi",
            "Jüri Danışmanı tarafından etkinlik öncesinde doldurulur; jüri odasında asılabilir.")
    d.heading("Etkinlik")
    d.field_row(["Etkinlik adı", "Tarih", "Jüri Danışmanı"])
    d.field_row(["Program (Engage / Achieve / Inspire / ADC / ADC Pro)", "Jüri odası / alan"])
    d.heading("Ekipler ve atamalar")
    d.para("Çıkar çatışması beyanlarını dikkate alarak atama yapın. Görüşme ve değerlendirme süreci için RECF’in resmî Guide to Judging belgesindeki adımları izleyin.", color=MUTED, size=8.5)
    d.table(["Ekip", "Jüri üyeleri", "Atanan takımlar (no)", "Görüşme saatleri", "Alan", "Not"], [14, 44, 34, 28, 16, 28], rows=14, row_h=10 * mm)
    return d.save()


def event_checklist():
    d = Doc("recf-turkiye-etkinlik-gunu-juri-kontrol-listesi.pdf", "Etkinlik Günü Jüri Kontrol Listesi",
            "Jüri Danışmanı ve jüri ekipleri için operasyon listesi.")
    d.field_row(["Etkinlik adı", "Tarih", "Jüri Danışmanı"])
    d.heading("Etkinlik öncesi")
    d.check_items([
        "Programın güncel resmî RECF Guide to Judging belgesi ve rubrikleri RECF kaynaklarından indirildi; sürüm tarihleri kontrol edildi.",
        "Jüri üyelerine resmî rehber ve rubrikler etkinlikten önce gönderildi; kısa bir hazırlık toplantısı yapıldı.",
        "Tüm jüri üyelerinden Çıkar Çatışması Beyan Formu ile Tarafsızlık ve Gizlilik Taahhütnamesi toplandı.",
        "Jüri Görev Dağılım Çizelgesi çıkar çatışmaları dikkate alınarak hazırlandı.",
        "Jüri odası, görüşme alanları, zaman çizelgesi ve gerekli malzemeler hazırlandı.",
        "Takımlara görüşme ve belge süreçleri, resmî rehberde tanımlandığı şekilde duyuruldu.",
    ])
    d.heading("Etkinlik sırasında")
    d.check_items([
        "Jüri üyelerinin girişi yapıldı (RECF’in resmî Judge Volunteer Check-In Sheet belgesi kullanılabilir).",
        "Görüşmeler planlanan saatlerde ve resmî rehberdeki sürece uygun yürütülüyor; gecikmeler kayıt altına alınıyor.",
        "Değerlendirmeler yalnız resmî rubrikler üzerinde yapılıyor; notlar jüri odasında tutuluyor.",
        "Çıkar çatışması bulunan jüri üyesi ilgili takımın değerlendirmesinden ayrıldı.",
        "Müzakere, resmî rehberdeki ödül tanımları ve süreçle yürütüldü; kararlar Jüri Danışmanı tarafından kayda geçirildi.",
    ])
    d.heading("Etkinlik sonrası")
    d.check_items([
        "Ödül sonuçları etkinlik organizasyonuna teslim edildi ve açıklanana kadar gizli tutuldu.",
        "Rubrikler, notlar ve takım belgeleri toplandı; RECF Türkiye’nin veri saklama ve imha kurallarına göre işlendi.",
        "Takımlardan alınan defter ve belgeler sahiplerine iade edildi.",
        "Jüri üyelerine teşekkür edildi; süreçle ilgili geri bildirimler not edildi.",
    ])
    d.heading("Notlar")
    d.field_row(["Jüri Danışmanı notları"], height=30 * mm, multiline=True)
    return d.save()


def kvkk_notice():
    d = Doc("recf-turkiye-gonullu-kvkk-aydinlatma-metni.pdf", "Jüri ve Hakem Gönüllüsü KVKK Aydınlatma Metni",
            "6698 sayılı Kişisel Verilerin Korunması Kanunu’nun 10. maddesi kapsamında.", notice=False,
            draft_note="Bu metin hukuki gözden geçirme sonrasında yürürlüğe girer. Sitedeki genel KVKK Aydınlatma Metni ile birlikte değerlendirilmelidir.")
    d.heading("Veri sorumlusu")
    d.para("Unvan: INTECHNE TEKNOLOJİ ANONİM ŞİRKETİ · Mersis No: 0465161788400001")
    d.para("Adres: Ünalan Mah. Ünalan Cad. No: 1 D: 1 Üsküdar / İSTANBUL · E-posta: off-season@intechne.com.tr")
    d.heading("İşlenen kişisel veriler")
    d.bullets([
        "Kimlik ve iletişim bilgileri: ad soyad, e-posta, telefon, il.",
        "Gönüllülük bilgileri: başvurulan rol (hakem / jüri), ilgi duyulan programlar, uygunluk, deneyim ve kurum bilgisi.",
        "Görev bilgileri: görev aldığınız etkinlikler, görev dağılımı, eğitim katılımı, çıkar çatışması beyanı ve taahhütname.",
        "Etkinlik alanında görsel ve işitsel kayıtlar (yalnız etkinlik duyurusu ve organizasyonu kapsamında, ayrıca bilgilendirme yapılarak).",
    ])
    d.heading("İşleme amaçları")
    d.bullets([
        "Hakem ve Jüri Akademisi ile gönüllü başvurularının değerlendirilmesi ve sizinle iletişime geçilmesi,",
        "Eğitimlerin planlanması, görev dağılımının yapılması ve etkinliklerin yürütülmesi,",
        "Değerlendirme sürecinin tarafsızlığının sağlanması (çıkar çatışması kontrolü),",
        "Hukuki yükümlülüklerin yerine getirilmesi ve olası uyuşmazlıklarda hakların korunması.",
    ])
    d.heading("Hukuki sebepler")
    d.para("Kişisel verileriniz; Kanun’un 5/2-c (sözleşmenin kurulması veya ifası), 5/2-ç (hukuki yükümlülük), 5/2-f (meşru menfaat) "
           "hükümlerine ve gerektiğinde 5/1 uyarınca açık rızanıza dayanılarak işlenir. Başvuru formundaki açık rıza onayı bu kapsamdadır.")
    d.heading("Aktarım")
    d.para("Kişisel verileriniz, yukarıdaki amaçlarla sınırlı olarak; etkinlik organizasyonunda görev alan iş ortaklarına, hizmet aldığımız "
           "barındırma ve e-posta hizmet sağlayıcılarına ve yetkili kamu kurumlarına aktarılabilir. Hizmet sağlayıcıların sunucuları yurt dışında "
           "bulunabileceğinden, yurt dışına aktarım Kanun’un 9. maddesine uygun olarak yapılır.")
    d.heading("Toplama yöntemi ve saklama")
    d.para("Verileriniz recfturkiye.com üzerindeki başvuru formu, etkinlik öncesi doldurulan formlar ve e-posta yoluyla toplanır; "
           "işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen süreler boyunca saklanır, sonrasında silinir, yok edilir veya anonim hâle getirilir.")
    d.heading("Haklarınız")
    d.para("Kanun’un 11. maddesi kapsamındaki haklarınızı (verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme, "
           "itiraz ve zararın giderilmesini talep etme dâhil) off-season@intechne.com.tr adresine yazılı olarak başvurarak kullanabilirsiniz.")
    return d.save()


# Türkçe karakterli form alanları: gömülü Unicode (Type0 / Identity-H) TrueType font + ToUnicode eşlemesi.
# Görüntüleyiciler (Chrome/pdfium, Acrobat, Preview) kullanıcının yazdığı ğ, ı, İ, ş gibi karakterleri bu fontla çizer.
def embed_turkish_field_font(path, ttf_path):
    from fontTools.ttLib import TTFont as FT
    from pypdf import PdfReader, PdfWriter
    from pypdf.generic import (ArrayObject, DecodedStreamObject, DictionaryObject, NameObject, NumberObject,
                               TextStringObject, create_string_object)
    font = FT(ttf_path)
    upm = font["head"].unitsPerEm
    scale = 1000 / upm
    cmap = font.getBestCmap()
    order = font.getGlyphOrder()
    gid = {name: i for i, name in enumerate(order)}
    hmtx = font["hmtx"]
    head, hhea, os2 = font["head"], font["hhea"], font["OS/2"]
    data = open(ttf_path, "rb").read()

    reader = PdfReader(path)
    writer = PdfWriter(clone_from=reader)
    acro = writer._root_object.get("/AcroForm")
    if acro is None:
        return
    acro = acro.get_object()
    stream = DecodedStreamObject()
    stream.set_data(data)
    stream[NameObject("/Length1")] = NumberObject(len(data))
    descriptor = DictionaryObject({
        NameObject("/Type"): NameObject("/FontDescriptor"), NameObject("/FontName"): NameObject("/RobotoCondensed-Regular"),
        NameObject("/Flags"): NumberObject(32), NameObject("/ItalicAngle"): NumberObject(0),
        NameObject("/FontBBox"): ArrayObject([NumberObject(round(v * scale)) for v in (head.xMin, head.yMin, head.xMax, head.yMax)]),
        NameObject("/Ascent"): NumberObject(round(hhea.ascent * scale)), NameObject("/Descent"): NumberObject(round(hhea.descent * scale)),
        NameObject("/CapHeight"): NumberObject(round(getattr(os2, "sCapHeight", 700) * scale)), NameObject("/StemV"): NumberObject(80),
        NameObject("/FontFile2"): writer._add_object(stream),
    })
    widths = ArrayObject()
    for i, name in enumerate(order):
        widths.extend([NumberObject(i), ArrayObject([NumberObject(round(hmtx[name][0] * scale))])])
    cid_font = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/CIDFontType2"),
        NameObject("/BaseFont"): NameObject("/RobotoCondensed-Regular"),
        NameObject("/CIDSystemInfo"): DictionaryObject({NameObject("/Registry"): create_string_object("Adobe"), NameObject("/Ordering"): create_string_object("Identity"), NameObject("/Supplement"): NumberObject(0)}),
        NameObject("/FontDescriptor"): writer._add_object(descriptor), NameObject("/DW"): NumberObject(500),
        NameObject("/W"): widths, NameObject("/CIDToGIDMap"): NameObject("/Identity"),
    })
    pairs = sorted((gid[g], cp) for cp, g in cmap.items() if cp <= 0xFFFF and g in gid)
    lines = ["/CIDInit /ProcSet findresource begin", "12 dict begin", "begincmap",
             "/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def", "/CMapName /Adobe-Identity-UCS def", "/CMapType 2 def",
             "1 begincodespacerange", "<0000> <FFFF>", "endcodespacerange"]
    seen = {}
    for g, cp in pairs:
        seen.setdefault(g, cp)
    items = sorted(seen.items())
    for start in range(0, len(items), 100):
        chunk = items[start:start + 100]
        lines.append(f"{len(chunk)} beginbfchar")
        lines.extend(f"<{g:04X}> <{cp:04X}>" for g, cp in chunk)
        lines.append("endbfchar")
    lines += ["endcmap", "CMapName currentdict /CMap defineresource pop", "end", "end"]
    tounicode = DecodedStreamObject()
    tounicode.set_data("\n".join(lines).encode("ascii"))
    type0 = DictionaryObject({
        NameObject("/Type"): NameObject("/Font"), NameObject("/Subtype"): NameObject("/Type0"),
        NameObject("/BaseFont"): NameObject("/RobotoCondensed-Regular"), NameObject("/Encoding"): NameObject("/Identity-H"),
        NameObject("/DescendantFonts"): ArrayObject([writer._add_object(cid_font)]), NameObject("/ToUnicode"): writer._add_object(tounicode),
    })
    font_ref = writer._add_object(type0)
    dr = acro.get("/DR")
    dr = dr.get_object() if dr is not None else DictionaryObject()
    fonts = dr.get("/Font")
    fonts = fonts.get_object() if fonts is not None else DictionaryObject()
    fonts[NameObject("/RCTR")] = font_ref
    dr[NameObject("/Font")] = fonts
    acro[NameObject("/DR")] = dr
    acro[NameObject("/DA")] = TextStringObject("/RCTR 9 Tf 0.063 0.098 0.184 rg")
    for page in writer.pages:
        for annot in page.get("/Annots", []) or []:
            a = annot.get_object()
            if a.get("/FT") == "/Tx":
                size = 8.5 if int(a.get("/Ff", 0)) & 4096 else 9
                a[NameObject("/DA")] = TextStringObject(f"/RCTR {size} Tf 0.063 0.098 0.184 rg")
                if "/AP" in a:
                    del a["/AP"]  # görüntüleyici, gömülü fontla yeniden çizer
    writer.write(path)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--fonts", required=True)
    args = parser.parse_args()
    register_fonts(args.fonts)
    for build in (conflict_form, confidentiality, assignment_sheet, event_checklist, kvkk_notice):
        path = build()
        embed_turkish_field_font(path, os.path.join(args.fonts, "RobotoCondensed-Regular.ttf"))
        print(path)
