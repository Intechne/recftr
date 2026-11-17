-- RECF Türkiye — denetim 2026-11 (P0-S §4): savunma derinliği. Veri silmez, şema değiştirmez.
--
-- Mevcut durum (17 Kasım 2026): public şemadaki 23 tablonun tamamında RLS açık; politikalar yalnız recf_app
-- rolü için tanımlı. Bu nedenle anon/authenticated rolleri PostgREST üzerinden hiçbir satırı okuyamaz veya
-- yazamaz. Ancak Supabase'in varsayılan tablo yetkileri (SELECT/INSERT/UPDATE/DELETE/TRUNCATE…) 19 tabloda
-- hâlâ duruyor; TRUNCATE gibi yetkiler RLS'e tabi değildir. Uygulama bu rolleri kullanmaz (sunucu: recf_app;
-- Storage: sunucu tarafı gizli anahtar + imzalı yükleme URL'leri), bu yüzden yetkiler kaldırılır.
BEGIN;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
-- Bundan sonra oluşturulacak tablolar için de varsayılan yetki verilmez (migration'ları çalıştıran rol için).
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- Security Advisor: "Function Search Path Mutable" — tetikleyici fonksiyonun arama yolu sabitlenir.
ALTER FUNCTION public.recf_sync_event_registered() SET search_path = public, pg_temp;

COMMIT;

-- Doğrulama (salt okunur):
-- SELECT count(*) FROM information_schema.role_table_grants WHERE grantee IN ('anon','authenticated') AND table_schema='public';  -- 0 beklenir
-- SELECT proconfig FROM pg_proc WHERE proname='recf_sync_event_registered';  -- {search_path=public, pg_temp}
