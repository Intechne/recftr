import fs from 'node:fs';

const read=(p)=>fs.readFileSync(p,'utf8');
const publicFiles=fs.readdirSync('app/(site)',{recursive:true})
  .filter(x=>typeof x==='string'&&x.endsWith('.tsx'))
  .map(x=>`app/(site)/${x}`);
const publicSource=publicFiles.map(read).join('\n');

const checks=[
  ['Public shell uses cached settings', 'app/(site)/layout.tsx', /getCachedPublicSettings/],
  ['Root metadata uses cached settings', 'app/layout.tsx', /getCachedPublicSettings/],
  ['Public pages do not import DB directly', 'public-site', !/@\/lib\/db/.test(publicSource)],
  ['Public read layer uses Next data cache', 'lib/public-cache.ts', /unstable_cache/],
  ['Public cache has shared invalidation tag', 'lib/public-cache.ts', /public-content/],
  ['CMS mutations invalidate public cache tag', 'lib/content-consistency.ts', /revalidateTag\(["']public-content["']\)/],
  ['Homepage uses one cached snapshot reader', 'app/(site)/page.tsx', /getCachedHomeSnapshot/],
  ['Homepage snapshot is one SQL statement', 'lib/db.ts', /getPublicHomeSnapshot[\s\S]*SELECT[\s\S]*AS programs[\s\S]*AS stats/],
  ['Homepage no longer starts DB Promise.all fan-out', 'app/(site)/page.tsx', !/Promise\.all\([\s\S]{0,500}(?:listPrograms|getPublicHomeStats|getSettings)/.test(read('app/(site)/page.tsx'))],
  ['Content refresh bridge does not poll database', 'components/ContentRefreshBridge.tsx', !/content-revision|setInterval/.test(read('components/ContentRefreshBridge.tsx'))],
  ['Admin mutation bridge mounted', 'app/admin/layout.tsx', /ContentMutationBridge/],
  ['Portal mutation bridge mounted', 'app/portal/layout.tsx', /ContentMutationBridge/],
  ['Settings writes are atomic', 'app/api/settings/route.ts', /setSettingsAtomic/],
  ['Stale CMS settings writes are rejected', 'app/api/settings/route.ts', /CONTENT_REVISION_CONFLICT/],
  ['Program detail logo uses white contain plate', 'app/(site)/programlar/[slug]/page.tsx', /bg-white[\s\S]{0,350}object-contain/],
  ['Program card image uses contain', 'app/(site)/programlar/page.tsx', /object-contain/],
  ['Global responsive media guard exists', 'app/globals.css', /cms-media-frame/],
  ['Global horizontal overflow guard exists', 'app/globals.css', /overflow-x:\s*clip/],
  ['Database connect fails fast instead of hanging to Vercel timeout', 'lib/db.ts', /connect_timeout:\s*5/],
  ['All public program pages use shared RECF game data resolver', 'app/(site)/programlar/[slug]/page.tsx', /getProgramOfficialData/],
  ['RECF resolver maps all five site programs', 'lib/recf-games.ts', /engage:[\s\S]*achieve:[\s\S]*inspire:[\s\S]*adc:[\s\S]*["']adc-pro["']:/],
  ['Public program UI hides API health/status language', 'public-program-ui', !/(RECF API|API CANLI|API SENKRONU|DOĞRULANMIŞ YEDEK|API.DEN DOĞRULANDI)/i.test(read('components/public/EngageScoringSection.tsx')+'\n'+read('components/public/ProgramScoringSection.tsx')+'\n'+read('app/(site)/programlar/[slug]/page.tsx'))],
  ['Non-Engage programs render visual scoring section', 'app/(site)/programlar/[slug]/page.tsx', /ProgramScoringSection/],
];

let fail=0;
for(const [name,file,expect] of checks){
  let ok;
  if(typeof expect==='boolean') ok=expect;
  else ok=expect.test(read(file));
  console.log(`${ok?'PASS':'FAIL'}  ${name}`);
  if(!ok) fail++;
}
if(fail){console.error(`\n${fail} content consistency/stability check(s) failed.`);process.exit(1)}
console.log(`\n${checks.length}/${checks.length} content consistency/stability checks passed.`);
