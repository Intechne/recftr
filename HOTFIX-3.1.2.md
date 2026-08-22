# V3.1.2 Session Revocation Hotfix

## Düzeltilen production hatası

Canlı `--revocation` testinde geçici kullanıcıyı pasife alan `PUT /api/users` isteği PostgreSQL `42P18` ile 500 dönüyordu:

`could not determine data type of parameter $14`

Kök neden `saveUser()` sorgusundaki şu desendi: null olabilen MFA parametresi bağımsız olarak `IS NOT NULL` içinde bind ediliyordu. PostgreSQL bu parametrenin tipini bağlamdan çıkaramıyordu.

## Fix

- MFA üretildi mi kararı artık JavaScript tarafında boolean olarak hesaplanıyor.
- `password_hash`, `must_change_password`, MFA boolean/value parametreleri SQL içinde açıkça `text`/`boolean` cast ediliyor.
- `session_version=session_version+1` davranışı korunuyor; revocation semantics değişmedi.
- Advanced verifier paket içine `scripts/security-advanced.mjs` olarak eklendi.
- `postgres` pooler kullanımı advanced testte exploit FAIL yerine defense-in-depth INFO olarak sınıflandırılıyor.
- Diagnostics sürümü `3.1.2`; package version `3.1.2`.

Supabase migration gerekmez. Environment değişikliği gerekmez.
