export const COMMITTEE_AREAS = [
  {id:"etkinlik",label:"Etkinlik planlama ve operasyon",description:"Hazırlık takvimi, görev akışı, mekân ve etkinlik günü koordinasyonu."},
  {id:"egitim",label:"Eğitim ve mentör desteği",description:"Takım ihtiyaçlarını dinleme, eğitim hazırlığı ve mentörlerle iletişim."},
  {id:"teknik",label:"Teknik hazırlık ve saha",description:"Saha ihtiyaçları, ekipman hazırlığı ve teknik ekiplerle koordinasyon."},
  {id:"iletisim",label:"İletişim ve medya",description:"Duyuru, içerik, etkinlik görünürlüğü ve topluluk iletişimi."},
  {id:"paydas",label:"Okul ve paydaş ilişkileri",description:"Okullar, kurumlar ve yerel paydaşlarla iş birliğinin hazırlanması."},
  {id:"gonullu",label:"Gönüllü koordinasyonu",description:"Gönüllü ihtiyaçları, görev paylaşımı ve ekip içi iletişim."},
] as const;
export const COMMITTEE_AVAILABILITIES = ["Düzenli haftalık katkı","Etkinlik dönemlerinde katkı","Uzaktan ve proje bazlı katkı"] as const;
export const COMMITTEE_STATUSES = ["YENİ","İNCELENİYOR","İLETİŞİME GEÇİLDİ","ARŞİVLENDİ"] as const;
export type CommitteeStatus = typeof COMMITTEE_STATUSES[number];
export type CommitteeApplicationInput = {
  submissionKey:string; fingerprint:string; name:string; email:string; phone:string;
  city:string; district:string; organization:string; occupation:string; areas:string[];
  availability:string; experience:string; motivation:string;
};
export type CommitteeApplication = Omit<CommitteeApplicationInput,"submissionKey"|"fingerprint"> & {
  id:number; status:CommitteeStatus; review_notes:string; version:number;
  created_at:string; updated_at:string;
};
export const committeeAreaLabel = (id:string) => COMMITTEE_AREAS.find(area=>area.id===id)?.label || id;
