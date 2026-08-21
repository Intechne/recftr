-- RECF Türkiye V3.0.4 - program_content runtime repair
-- Mevcut program kayıtlarını silmez.

UPDATE program_content
SET chips = '[]'::jsonb
WHERE chips IS NULL OR jsonb_typeof(chips) <> 'array';

UPDATE program_content
SET match_types = '[]'::jsonb
WHERE match_types IS NULL OR jsonb_typeof(match_types) <> 'array';

UPDATE program_content
SET facts = '[]'::jsonb
WHERE facts IS NULL OR jsonb_typeof(facts) <> 'array';

UPDATE program_content
SET cover_url = ''
WHERE cover_url IS NULL;

UPDATE program_content
SET color_hex = '#29B9E5'
WHERE color_hex IS NULL OR btrim(color_hex) = '';

-- Kontrol çıktısı
SELECT slug, code, name,
       jsonb_typeof(chips) AS chips_type,
       jsonb_typeof(match_types) AS match_types_type,
       jsonb_typeof(facts) AS facts_type,
       cover_url
FROM program_content
ORDER BY sort_order, slug;
