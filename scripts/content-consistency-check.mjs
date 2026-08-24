import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
const checks=[
  ['Public shell reads settings server-side', 'app/(site)/layout.tsx', /getSettings\(PUBLIC_SETTING_KEYS\)/],
  ['Public shell has no client settings fetch', 'components/Chrome.tsx', !/fetch\(["']\/api\/settings/.test(read('components/Chrome.tsx'))],
  ['Content revision bridge mounted', 'app/(site)/layout.tsx', /ContentRefreshBridge/],
  ['Content revision endpoint exists', 'app/api/content-revision/route.ts', /currentContentRevision/],
  ['Settings writes are atomic', 'app/api/settings/route.ts', /setSettingsAtomic/],
  ['Settings GET exposes content revision', 'app/api/settings/route.ts', /X-Content-Revision/],
  ['Stale CMS settings writes are rejected', 'app/api/settings/route.ts', /CONTENT_REVISION_CONFLICT/],
  ['Settings mutation publishes revision', 'app/api/settings/route.ts', /publishContentChange/],
  ['Homepage reads CMS data server-side', 'app/(site)/page.tsx', /listPrograms\(false\)/],
  ['Program listing reads CMS data server-side', 'app/(site)/programlar/page.tsx', /listPrograms\(false\)/],
  ['Program detail logo uses white plate', 'app/(site)/programlar/[slug]/page.tsx', /bg-white[^\n]*object-contain|bg-white[\s\S]{0,350}object-contain/],
  ['Program card image uses contain', 'app/(site)/programlar/page.tsx', /object-contain/],
  ['Global responsive media guard exists', 'app/globals.css', /cms-media-frame/],
  ['Global horizontal overflow guard exists', 'app/globals.css', /overflow-x:\s*clip/],
];
const publicSource = [
  ...fs.readdirSync('app/(site)', {recursive:true}).filter(x=>typeof x==='string'&&x.endsWith('.tsx')).map(x=>`app/(site)/${x}`),
  ...fs.readdirSync('components/public', {recursive:true}).filter(x=>typeof x==='string'&&x.endsWith('.tsx')).map(x=>`components/public/${x}`),
].map(read).join('\n');
const forbiddenPublicCmsFetch = /fetch\(["'`]\/api\/(?:settings|programs|pricing|news|events|documents|teams|media|staff|pages)(?:[\/"'`?])/;
checks.push(['Public CMS data is server-rendered (no client CMS GET fetch)', 'public-site', !forbiddenPublicCmsFetch.test(publicSource)]);

let fail=0;
for(const item of checks){
  const [name,file,expect]=item;
  let ok;
  if(typeof expect==='boolean') ok=expect;
  else ok=expect.test(read(file));
  console.log(`${ok?'PASS':'FAIL'}  ${name}`);
  if(!ok) fail++;
}
if(fail){console.error(`\n${fail} content consistency check(s) failed.`);process.exit(1)}
console.log(`\n${checks.length}/${checks.length} content consistency checks passed.`);
