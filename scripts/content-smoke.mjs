const target=(process.argv[2]||'https://www.recfturkiye.com').replace(/\/$/,'');
let fails=0;
function line(ok,name,detail=''){console.log(`${ok?'PASS':'FAIL'}  ${name}${detail?` — ${detail}`:''}`);if(!ok)fails++}
async function get(path){return fetch(target+path,{cache:'no-store',headers:{'Cache-Control':'no-cache'}})}

console.log(`Content consistency smoke target: ${target}\n`);
try{
  const home=await get('/');
  line(home.ok,'Homepage reachable',`HTTP ${home.status}`);
  const cc=home.headers.get('cache-control')||'';
  const prerender=home.headers.get('x-nextjs-prerender')||'';
  line(!/s-maxage\s*=\s*[1-9]/i.test(cc),'Homepage has no positive shared-cache TTL',cc||'no explicit shared TTL');
  line(prerender!=='1','Homepage is not static prerender cache',prerender?`x-nextjs-prerender=${prerender}`:'dynamic/no prerender header');

  const settings=await get('/api/settings');
  line(settings.ok,'Public settings reachable',`HTTP ${settings.status}`);
  line(/no-store/i.test(settings.headers.get('cache-control')||''),'Public settings are no-store',settings.headers.get('cache-control')||'missing');

  const rev=await get('/api/content-revision');
  const revJson=await rev.json().catch(()=>({}));
  line(rev.ok,'Content revision endpoint reachable',`HTTP ${rev.status}`);
  line(typeof revJson?.revision==='string','Content revision is present',String(revJson?.revision??'missing'));
  line(/no-store/i.test(rev.headers.get('cache-control')||''),'Content revision is no-store',rev.headers.get('cache-control')||'missing');

  const programs=await get('/api/programs');
  const pJson=await programs.json().catch(()=>null);
  line(programs.ok&&Array.isArray(pJson),'Programs API returns an array',`HTTP ${programs.status}`);
  line(/no-store/i.test(programs.headers.get('cache-control')||''),'Programs API is no-store',programs.headers.get('cache-control')||'missing');
}catch(error){line(false,'Content smoke execution',error?.message||String(error))}

if(fails){console.error(`\nContent consistency smoke has ${fails} failure(s).`);process.exit(1)}
console.log('\nContent consistency smoke passed.');
