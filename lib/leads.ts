export const LEAD_KINDS = ["okul_randevu", "destek_randevu", "isbirligi", "lansman_katilim", "akademi_basvuru"] as const;
export type LeadKindId = typeof LEAD_KINDS[number];
export const LEAD_STATUSES = ["YENİ", "İNCELENİYOR", "İLETİŞİME GEÇİLDİ", "TAMAMLANDI", "ARŞİVLENDİ"] as const;
export type LeadStatus = typeof LEAD_STATUSES[number];

type Choice = { field: string; label: string; options: readonly string[]; multiple?: boolean; required?: boolean };
export type LeadConfig = {
  kind: LeadKindId;
  label: string;
  reference: string;
  page: string;
  organization: { label: string; required: boolean } | null;
  role: { label: string; options: readonly string[]; required: boolean } | null;
  city: boolean;
  message: { label: string; required: boolean; placeholder?: string };
  choices: Choice[];
  /** Zorunlu onay kutuları (ör. 18 yaş üstü, açık rıza). Değer true olarak details içinde saklanır. */
  consents?: { field: string; label: string; link?: { href: string; text: string } }[];
};

export const LEAD_CONFIG: Record<LeadKindId, LeadConfig> = {
  okul_randevu: {
    kind: "okul_randevu", label: "Okul randevu talebi", reference: "OK", page: "/okullar",
    organization: { label: "Okul / kurum adı", required: true },
    role: { label: "Göreviniz", options: ["Okul müdürü", "Müdür yardımcısı", "Öğretmen", "Kurum yöneticisi", "Diğer"], required: true },
    city: true,
    message: { label: "Eklemek istedikleriniz", required: false, placeholder: "Takım sayısı, programlar veya uygun görüşme zamanları" },
    choices: [{ field: "topics", label: "İlgilendiğiniz konular", options: ["Kampüs içi lig", "Öğretmen ve antrenör eğitimi", "Kurumsal paket", "Sezon takvimi"], multiple: true }],
  },
  destek_randevu: {
    kind: "destek_randevu", label: "Destek randevusu", reference: "DS", page: "/kayit/tesekkurler",
    organization: { label: "Takım veya okul adı", required: false },
    role: null,
    city: false,
    message: { label: "Hangi konuda desteğe ihtiyacın var?", required: true, placeholder: "Örn. RECFEvents.org hesabı, takım kaydı, ödeme adımı" },
    choices: [{ field: "preferred_time", label: "Tercih ettiğin görüşme zamanı", options: ["Hafta içi sabah", "Hafta içi öğleden sonra", "Hafta içi akşam", "Fark etmez"], required: true }],
  },
  isbirligi: {
    kind: "isbirligi", label: "İş birliği talebi", reference: "IB", page: "/is-birlikleri",
    organization: { label: "Kurum adı", required: true },
    role: { label: "Göreviniz", options: ["Kurum yöneticisi", "Pazarlama / iletişim", "Kurumsal sosyal sorumluluk", "İnsan kaynakları", "Diğer"], required: false },
    city: false,
    message: { label: "Mesajınız", required: true },
    choices: [{ field: "interest", label: "İlgi alanınız", options: ["Takım Bursu", "Etkinlik partnerliği", "Sezon partnerliği", "Kurumsal paket", "Diğer"], required: true }],
  },
  lansman_katilim: {
    kind: "lansman_katilim", label: "Lansman katılım formu", reference: "LN", page: "/lansman",
    organization: { label: "Okul / kurum", required: true },
    role: { label: "Rolünüz", options: ["Okul yöneticisi", "Öğretmen / antrenör", "Veli", "Kurum temsilcisi", "Diğer"], required: true },
    city: false,
    message: { label: "Sorunuz veya notunuz", required: false },
    choices: [{ field: "build_team", label: "Takım kurmak istiyor musunuz?", options: ["Evet", "Kararsızım", "Hayır", "Zaten takımımız var"], required: true }],
  },
  akademi_basvuru: {
    kind: "akademi_basvuru", label: "Hakem ve Jüri Akademisi başvurusu", reference: "AK", page: "/gonullu",
    organization: { label: "Kurum / okul", required: false },
    role: { label: "Başvurduğunuz rol", options: ["Hakem", "Jüri", "Hakem ve jüri"], required: true },
    city: true,
    message: { label: "Deneyiminiz", required: false, placeholder: "Robotik/drone etkinlikleri, eğitim, mentorluk veya değerlendirme deneyimleriniz" },
    choices: [
      { field: "programs", label: "İlgilendiğiniz programlar", options: ["RECF Engage", "RECF Achieve", "RECF Inspire", "Aerial Drone Competition", "ADC Pro"], multiple: true, required: true },
      { field: "availability", label: "Uygunluğunuz", options: ["Hafta sonu etkinlikleri", "Hafta içi ve hafta sonu", "Yalnız çevrim içi eğitim"], required: true },
    ],
    consents: [
      { field: "adult", label: "18 yaşından büyüğüm." },
      { field: "explicit_consent", label: "Hakem ve Jüri Akademisi başvurumun değerlendirilmesi ve benimle iletişime geçilmesi amacıyla kişisel verilerimin işlenmesine açık rıza veriyorum." },
    ],
  },
};

export const leadReference = (kind: LeadKindId, id: number) => `${LEAD_CONFIG[kind].reference}-${String(id).padStart(4, "0")}`;
export const isLeadKind = (value: unknown): value is LeadKindId => typeof value === "string" && (LEAD_KINDS as readonly string[]).includes(value);
