import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const load = async path => {
  const { outputText } = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};
const { documentAvailability, WITHDRAWN_DOCUMENT_PATH, eventPhase, publicEvent, correctAchieveContent, initialRegistrationProgram } = await load('lib/public-content.ts');
const now = Date.parse('2026-10-04T19:00:00Z');
assert.equal(documentAvailability({url:'#'}).available, false);
assert.equal(documentAvailability({url:'javascript:alert(1)'}).available, false);
assert.equal(documentAvailability({url:`https://example.org/${WITHDRAWN_DOCUMENT_PATH}`} ).available, false);
assert.equal(documentAvailability({url:'https://example.org/correct-form.pdf'}).available, true);
assert.equal(documentAvailability({url:'/documents/form.pdf'}).available, true);
assert.equal(documentAvailability({url:'//example.org/form.pdf'}).available, false);
assert.equal(eventPhase({event_start:'2026-10-01T09:00:00Z'}, now), 'past');
assert.equal(eventPhase({event_start:'2026-10-04T06:00:00Z'}, now), 'current');
assert.equal(eventPhase({event_start:'2026-10-04T06:00:00Z',event_end:'2026-10-04T12:00:00Z'}, now), 'past');
assert.equal(eventPhase({event_start:'2026-10-05T09:00:00Z'}, now), 'upcoming');
assert.equal(eventPhase({event_start:'invalid'}, now), 'undated');
const past = publicEvent({event_start:'2026-08-25T10:00:00Z',status:'KAYIT AÇIK',registration_enabled:true}, now);
assert.equal(past.registration_enabled, false);
assert.equal(past.status, 'GEÇMİŞ ETKİNLİK');
const conflicting = {slug:'recf-turkiye-ulusal-sampiyonasi',event_start:'2027-03-13T08:00:00.000Z',date_label:'',body:'17–18 Nisan 2027 tarihinde',registration_enabled:true};
const held = publicEvent(conflicting, now);
assert.equal(held.event_start, null);
assert.equal(held.registration_enabled, false);
assert.equal(publicEvent({...conflicting,event_start:new Date(conflicting.event_start)},now).event_start,null);
assert.equal(publicEvent({...conflicting,body:'BİRİNCİ GÜN — 17 Nisan 2027\nİKİNCİ GÜN — 18 Nisan 2027'},now).event_start,null);
assert.ok(!held.body.includes('17–18 Nisan'));
assert.equal(conflicting.event_start, '2027-03-13T08:00:00.000Z');
assert.equal(publicEvent({...conflicting,date_label:'13–14 Mart 2027'}, now).event_start, conflicting.event_start);
const achieve = {slug:'achieve',facts:[{label:'Otonom',value:'30 saniye'}],match_types:[{title:'İttifak',desc:'120 sn; 0:30 otonom + sürücü'}]};
assert.equal(correctAchieveContent(achieve).facts[0].value, '15 saniye');
assert.ok(correctAchieveContent(achieve).match_types[0].desc.includes('0:15'));
assert.equal(correctAchieveContent({...achieve,slug:'inspire'}).facts[0].value, '30 saniye');
const programs = ['engage','achieve','inspire','adc','adc-pro'].map(slug=>({slug}));
for (const {slug} of programs) assert.equal(initialRegistrationProgram(slug,programs),slug);
assert.equal(initialRegistrationProgram('unknown',programs),'achieve');
assert.equal(initialRegistrationProgram(undefined,[]),'');

const originalFetch = globalThis.fetch;
try {
  const {getProgramOfficialData} = await load('lib/recf-games.ts');
  globalThis.fetch = async () => { throw new Error('Simulated upstream outage'); };
  const fallback = await getProgramOfficialData('adc-pro');
  assert.equal(fallback.manualUrl,'https://games.recf.org/pro/2.0');
  assert.equal(fallback.qnaUrl,'https://games.recf.org/pro/qa');
  assert.equal(fallback.calculatorUrl,'https://games.recf.org/pro/calculator');
  assert.equal(fallback.versionLabel,'2.0');
  assert.equal(fallback.scoringGroups[2].items.find(x=>x.key==='drop').points,'15 puan');
  assert.equal(fallback.examples.length,0);
  const achieveFallback=await getProgramOfficialData('achieve');
  assert.equal(achieveFallback.scoringGroups[1].items.find(x=>x.key==='neutral-alliance').points,'7 puan');
  let calls=[];
  globalThis.fetch = async url => {
    calls.push(url);
    return {ok:true,json:async()=>url.endsWith('/programs')?{data:[{slug:'pro',currentVersionLabel:'3.0'}]}:{data:{revision:{versionLabel:'3.0'},sections:[]}}};
  };
  const changed = await getProgramOfficialData('adc-pro');
  assert.equal(changed.scoringGroups.length,0,'A newer manual must not silently display v2.0 scores');
  assert.ok(calls.some(url=>url.includes('/programs/pro/manual/3.0')));
} finally { globalThis.fetch=originalFetch; }
console.log('PASS public content: document guards, event boundaries, schedule conflicts, program selection, rule corrections and official-source failure/version changes.');
