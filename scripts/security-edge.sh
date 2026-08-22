#!/usr/bin/env bash
set -u
BASE="${1:-https://www.recfturkiye.com}"
BASE="${BASE%/}"
HOST="${BASE#https://}"
HOST="${HOST#http://}"
HOST="${HOST%%/*}"
APEX="${HOST#www.}"
FAIL=0

ok(){ printf 'PASS  %s\n' "$1"; }
warn(){ printf 'WARN  %s\n' "$1"; }
fail(){ printf 'FAIL  %s\n' "$1"; FAIL=$((FAIL+1)); }
section(){ printf '\n===== %s =====\n' "$1"; }

section "HTTPS + SECURITY HEADERS"
HEADERS="$(curl -sS -D - -o /dev/null "$BASE/" 2>&1 || true)"
printf '%s\n' "$HEADERS"
for h in content-security-policy strict-transport-security x-content-type-options x-frame-options referrer-policy permissions-policy; do
  if printf '%s\n' "$HEADERS" | grep -qi "^${h}:"; then ok "Header $h"; else fail "Header $h missing"; fi
done

section "HTTP -> HTTPS"
HTTP_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "http://$HOST/" || true)"
HTTP_LOC="$(curl -sI "http://$HOST/" | awk 'BEGIN{IGNORECASE=1}/^location:/{gsub("\r","");print $2;exit}')"
if [[ "$HTTP_STATUS" =~ ^30[178]$ ]] && [[ "$HTTP_LOC" == https://* ]]; then ok "HTTP redirects to HTTPS ($HTTP_STATUS -> $HTTP_LOC)"; else fail "HTTP redirect unexpected ($HTTP_STATUS -> ${HTTP_LOC:-none})"; fi

section "APEX -> CANONICAL"
if [[ "$HOST" == www.* ]]; then
  APEX_STATUS="$(curl -s -o /dev/null -w '%{http_code}' "https://$APEX/" || true)"
  APEX_LOC="$(curl -sI "https://$APEX/" | awk 'BEGIN{IGNORECASE=1}/^location:/{gsub("\r","");print $2;exit}')"
  if [[ "$APEX_STATUS" =~ ^30[178]$ ]] && [[ "$APEX_LOC" == "$BASE/" ]]; then ok "Apex redirects to canonical ($APEX_STATUS)"; else warn "Apex canonical redirect differs ($APEX_STATUS -> ${APEX_LOC:-none})"; fi
fi

section "TLS CERTIFICATE"
if command -v openssl >/dev/null 2>&1; then
  CERT="$(echo | openssl s_client -connect "$HOST:443" -servername "$HOST" 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null || true)"
  printf '%s\n' "$CERT"
  if [[ -n "$CERT" ]]; then ok "Certificate parsed"; else fail "Certificate could not be parsed"; fi
  for proto in tls1_2 tls1_3; do
    if echo | openssl s_client -connect "$HOST:443" -servername "$HOST" "-$proto" 2>/dev/null | grep -q 'Verify return code: 0'; then ok "${proto/_/.} handshake"; else fail "${proto/_/.} handshake"; fi
  done
else warn "openssl not installed; TLS handshake checks skipped"; fi

section "NMAP CIPHERS"
if command -v nmap >/dev/null 2>&1; then
  OUT="$(nmap -p 443 --script ssl-enum-ciphers "$HOST" 2>&1 || true)"
  printf '%s\n' "$OUT"
  if printf '%s' "$OUT" | grep -q 'least strength: A'; then ok "Nmap minimum cipher strength A"; else warn "Nmap did not report minimum strength A; inspect output"; fi
else warn "nmap not installed; cipher enumeration skipped"; fi

section "WAF FINGERPRINT (NON-BLOCKING)"
if command -v wafw00f >/dev/null 2>&1; then
  WAF="$(wafw00f "$BASE" 2>&1 || true)"
  printf '%s\n' "$WAF"
  if printf '%s' "$WAF" | grep -qiE 'unexpected_eof|SSLEOF|appears to be down'; then warn "WAFW00F inconclusive due TLS/Python EOF; curl/openssl result is authoritative for availability"; else ok "WAFW00F completed; inspect fingerprint above"; fi
else warn "wafw00f not installed; WAF fingerprint skipped"; fi

printf '\n===== RESULT =====\n'
if (( FAIL > 0 )); then printf 'FAIL  %d required edge checks failed.\n' "$FAIL"; exit 1; else printf 'PASS  Required edge checks completed.\n'; fi
