const base=(process.argv.find(x=>x.startsWith('http'))||process.env.SECURITY_BASE_URL||'https://www.recfturkiye.com').replace(/\/$/,'');
const active=process.argv.includes('--rate-limit');
let failed=0;
function pass(name,ok,detail=''){console.log(`${ok?'PASS':'FAIL'}  ${name}${detail?` — ${detail}`:''}`);if(!ok)failed++;}

async function safeJson(r){try{return await r.json()}catch{return null}}

async function main(){
  console.log(`Security smoke target: ${base}\n`);

  const home=await fetch(base,{redirect:'manual',cache:'no-store'});
  const h=home.headers;
  pass('Homepage reachable',home.status===200,`HTTP ${home.status}`);
  for(const key of ['content-security-policy','x-content-type-options','x-frame-options','referrer-policy','permissions-policy','strict-transport-security']) {
    pass(`Header ${key}`,!!h.get(key),h.get(key)||'missing');
  }
  pass('X-Content-Type-Options is nosniff',(h.get('x-content-type-options')||'').toLowerCase()==='nosniff',h.get('x-content-type-options')||'missing');
  pass('X-Frame-Options denies framing',(h.get('x-frame-options')||'').toUpperCase()==='DENY',h.get('x-frame-options')||'missing');
  pass('CSP frame-ancestors none',(h.get('content-security-policy')||'').includes("frame-ancestors 'none'"));

  const teams=await fetch(`${base}/api/teams`,{headers:{Origin:'https://evil-example.com'},cache:'no-store'});
  const data=await safeJson(teams);
  const rows=Array.isArray(data)?data:[];
  const forbidden=['mentor_email','mentor_name','phone'];
  const leaked=rows.some(x=>x&&typeof x==='object'&&forbidden.some(k=>k in x));
  const allowed=new Set(['num','name','school','city','district','program','status','slogan','logo_url']);
  const unexpected=[...new Set(rows.flatMap(x=>x&&typeof x==='object'?Object.keys(x).filter(k=>!allowed.has(k)):[]))];
  pass('Public teams has no mentor PII',teams.ok&&!leaked,`HTTP ${teams.status}, rows=${rows.length}`);
  pass('Public teams field whitelist',teams.ok&&unexpected.length===0,unexpected.length?`unexpected: ${unexpected.join(', ')}`:'only approved public fields');
  pass('API responses are no-store',(teams.headers.get('cache-control')||'').toLowerCase().includes('no-store'),teams.headers.get('cache-control')||'missing');

  const diag=await fetch(`${base}/api/system/diagnostics`,{redirect:'manual',cache:'no-store'});
  pass('Diagnostics rejects anonymous',diag.status===401,`HTTP ${diag.status}`);

  const admin=await fetch(`${base}/admin`,{redirect:'manual',cache:'no-store'});
  pass('Admin redirects anonymous',admin.status>=300&&admin.status<400,`HTTP ${admin.status}, location=${admin.headers.get('location')||'none'}`);

  const cross=await fetch(`${base}/api/auth`,{
    method:'POST',redirect:'manual',
    headers:{'Content-Type':'application/json','Origin':'https://evil-example.com','Sec-Fetch-Site':'cross-site'},
    body:JSON.stringify({email:'security-cross-site@example.invalid',pass:'invalid',scope:'cms'})
  });
  pass('Cross-site mutation guard rejects request',cross.status===403,`HTTP ${cross.status}`);

  if(active){
    let got429=false; let last=0;
    for(let i=0;i<10;i++){
      const r=await fetch(`${base}/api/auth`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:'security-smoke-invalid@example.invalid',pass:'not-a-real-password',scope:'cms'})});
      last=r.status;
      if(r.status===429){got429=true;break;}
    }
    pass('Login account rate limit activates',got429,`last HTTP ${last}; 10 safe invalid attempts max`);
  }else console.log('SKIP  Login rate-limit active test (run with --rate-limit after deploy)');

  console.log(`\n${failed?`Security smoke test has ${failed} failure(s).`:'Security smoke test completed: PASS.'}`);
  process.exitCode=failed?1:0;
}
main().catch(e=>{console.error('Smoke test execution error:',e);process.exit(2)});
