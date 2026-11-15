-- RECF Türkiye — RECF teyidi ve dokümanlar (fix/recf-teyit-ve-dokumanlar)
-- Yalnız ekleme / kısıt genişletme yapar; hiçbir satır silinmez, mevcut veri değişmez.
BEGIN;

-- 1) Dokümanlar: "Resmî RECF Belgeleri" / "RECF Türkiye Belgeleri" ayrımı ve belge künyesi.
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'recf_turkiye';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS program TEXT NOT NULL DEFAULT '';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS version_label TEXT NOT NULL DEFAULT '';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'TR';
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='documents_source_check') THEN
    ALTER TABLE public.documents ADD CONSTRAINT documents_source_check CHECK (source IN ('recf','recf_turkiye'));
  END IF;
END $$;

-- 2) Hakem ve Jüri Akademisi başvuruları mevcut talepler tablosunu kullanır: izin verilen türlere eklenir.
ALTER TABLE public.lead_requests DROP CONSTRAINT IF EXISTS lead_requests_kind_check;
ALTER TABLE public.lead_requests ADD CONSTRAINT lead_requests_kind_check
  CHECK (kind IN ('okul_randevu','destek_randevu','isbirligi','lansman_katilim','akademi_basvuru'));

COMMIT;
