const target=(process.argv[2]||'https://www.recfturkiye.com').replace(/\/$/,'');
const paths=['/','/programlar','/etkinlikler','/duyurular','/takimlar','/galeri','/hakkimizda'];
let fails=0;
function line(ok,name,detail=''){console.log(`${ok?'PASS':'FAIL'}  ${name}${detail?` — ${detail}`:''}`);if(!ok)fails++}

async function timed(path){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),12000);
  const started=Date.now();
  try{
    const r=await fetch(target+path,{redirect:'follow',cache:'no-store',signal:controller.signal,headers:{'Cache-Control':'no-cache'}});
    return {status:r.status,ms:Date.now()-started,ok:r.ok};
  } finally { clearTimeout(timer); }
}

console.log(`Stability smoke target: ${target}\n`);
for(const round of [1,2]){
  console.log(`Round ${round}`);
  for(const path of paths){
    try{
      const r=await timed(path);
      line(r.ok&&r.status!==504,`${path} reachable`,`HTTP ${r.status}, ${r.ms}ms`);
      line(r.ms<12000,`${path} below 12s hard timeout`,`${r.ms}ms`);
    }catch(e){line(false,`${path} request`,e?.name==='AbortError'?'timed out after 12s':(e?.message||String(e)))}
  }
  console.log('');
}
if(fails){console.error(`Stability smoke has ${fails} failure(s).`);process.exit(1)}
console.log('Stability smoke passed.');
