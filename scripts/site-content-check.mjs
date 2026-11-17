// Public içerik kuralları: yer tutucu yok, doğrulanmış bilgiler tek kaynaktan, rakip adı yok,
// SSS nötr cevabı birebir, sezon rotası yalnız yayınlanmış adımları gösterir.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
const uri=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const compile=(file,imports={})=>{
 let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const [name,url] of Object.entries(imports))code=code.replaceAll(JSON.stringify(name),JSON.stringify(url));
 return uri(code);
};
const config=compile('lib/site-config.ts');
const {SITE_PAGES,parsePageBody,pageFaqs,applyTokens,publishable,plainText}=await import(compile('lib/site-pages.ts',{'@/lib/site-config':config}));
const {hasPlaceholder,WORLD_CHAMPIONSHIP,RECF_FEES,worldChampionship,feeGroupFor,feeLabel,PROGRAM_ELIGIBILITY,DATA_CONTROLLER,CANONICAL_ORIGIN,programGameLabel}=await import(config);
const {publicRoute,VERIFIED_ROUTE,SUGGESTED_ROUTE,verifiedRoute}=await import(compile('lib/season-route.ts',{'@/lib/site-config':config}));
const contacts=compile('lib/public-contact.ts');
const publicContent=compile('lib/public-content.ts');
const {eventLd,faqLd,SITE_URL}=await import(compile('lib/seo.ts',{'@/lib/public-contact':contacts,'@/lib/site-config':config,'@/lib/public-content':publicContent}));
const {publicEvent,istanbulIso}=await import(publicContent);
const {applyControllerFacts,webText}=await import(compile('lib/legal-documents.ts',{'@/lib/site-config':config,'@/lib/provided-legal-documents.json':uri('export default []')}));
const {provisionalTeamNumber,isProvisionalTeamNumber,publicTeamNumber}=await import(compile('lib/team-number.ts'));

// Yer tutucu dedektörü
for(const bad of ['[TEYİT]','Tarih: [12 Aralık — TEYİT]','TEYİT edilecek','[TBD]','lorem ipsum'])assert.ok(hasPlaceholder(bad),bad);
for(const good of ['Tarih teyit bekleniyor','teyit edilmiş','RECF Türkiye'])assert.ok(!hasPlaceholder(good),good);

// Site sayfaları: yer tutucu yok, belirteçler çözülüyor, bölümler ayrışıyor
const expected=['okullar','veliler','is-birlikleri','sss','lansman','en-home','en-about','en-faq'];
assert.deepEqual(SITE_PAGES.map(p=>p.slug).sort(),[...expected].sort());
for(const page of SITE_PAGES){
 assert.ok(publishable(page.title,page.body),`${page.slug} has a placeholder`);
 const body=applyTokens(page.body,{lang:page.lang,programAges:'RECF Engage: 15 yaşa kadar'});
 assert.ok(!/\{\{/.test(body),`${page.slug} has an unresolved token`);
 assert.ok(!hasPlaceholder(body),`${page.slug} renders a placeholder`);
 assert.ok(parsePageBody(body).sections.length>=1,`${page.slug} has no sections`);
}
assert.equal(SITE_PAGES.find(p=>p.slug==='lansman').defaultPublished,false,'launch page must stay unpublished by default');
assert.ok(!/\b(12|aralık|ytü|yıldız teknik)\b/i.test(SITE_PAGES.find(p=>p.slug==='lansman').body),'unconfirmed launch date/venue must not be in source');

// SSS: zorunlu nötr cevap birebir, FAQPage verisi üretiliyor, doğrulanmış kaynak linkleri var
const sss=applyTokens(SITE_PAGES.find(p=>p.slug==='sss').body,{programAges:'RECF Engage: 15 yaşa kadar'});
const faqs=pageFaqs(parsePageBody(sss));
const neutral=faqs.find(f=>f.q==='Başka organizasyonların yarışmalarına da katılabilir miyiz?');
assert.ok(neutral,'neutral FAQ question missing');
assert.equal(neutral.a,"RECF Türkiye, RECF'in Türkiye'deki resmi programıdır. Diğer organizasyonların etkinliklerine katılım koşulları ilgili organizasyonlar tarafından belirlenir; bu konuda doğrudan ilgili kurumla iletişime geçmenizi öneririz.");
assert.ok(faqs.length>=12);
for(const source of ['https://recf.org/faq/','https://kb.roboticseducation.org/hc/en-us/articles/41245156637975','https://recf.org/faq/what-is-the-team-registration-fee-for-the-2026-2027-recf-robotics-competition-season/','https://kb.roboticseducation.org/hc/en-us/articles/41294850729623','https://recf.org/the-future-of-stem-competition-starts-here-introducing-recf-robotics/'])assert.ok(sss.includes(source),source);
assert.ok(sss.includes(RECF_FEES.robotics.label)&&sss.includes(RECF_FEES.adc.label)&&sss.includes(RECF_FEES.adcPro.label)&&sss.includes(WORLD_CHAMPIONSHIP.label));
// Ücret programa göre: robotik 175 (recf.org/faq), ADC 200 (RECF KB); ADC Pro teyit gelene kadar RECFEvents.org'daki ücret
assert.equal(RECF_FEES.robotics.amount,175);assert.equal(RECF_FEES.adc.amount,200);assert.equal(RECF_FEES.adcPro.label,"RECFEvents.org'da gösterilen ücret");
assert.equal(feeGroupFor('engage'),'robotics');assert.equal(feeGroupFor('inspire'),'robotics');assert.equal(feeGroupFor('adc'),'adc');assert.equal(feeGroupFor('adc-pro'),'adcPro');assert.equal(feeGroupFor('x'),null);
assert.equal(feeLabel('adc'),'200 USD');assert.equal(feeLabel('adc-pro','en'),'the fee shown on RECFEvents.org');
// World Championship: recf.org/faq'taki kesin tarih, tek kaynaktan; kontenjan sorusu SSS'de
assert.equal(WORLD_CHAMPIONSHIP.label,'25 Nisan – 7 Mayıs 2027');assert.equal(WORLD_CHAMPIONSHIP.source,'https://recf.org/faq/');
assert.ok(faqs.some(f=>f.q==='World Championship kontenjanları nasıl belirlenir?'&&f.a.includes('Ocak 2027')));
assert.ok(faqs.some(f=>f.q==='Takımda kaç öğrenci olmalı?'&&f.a.includes('3 veya daha fazla öğrenci')));
assert.ok(faqs.some(f=>f.q==='Founding 100 nedir?'));
// ADC Pro uygunluğu resmî ifadeyle; "13 yaş" hiçbir sayfada yok
assert.ok(PROGRAM_ELIGIBILITY['adc-pro'].tr.includes('9. sınıf'));
for(const page of SITE_PAGES)assert.ok(!/13 yaş|13\+|Nisan – Mayıs 2027/.test(applyTokens(page.body,{lang:page.lang})),`${page.slug} has outdated eligibility/date`);
// Inspire ayrıştırıcı etiket
assert.equal(programGameLabel('inspire','Pinnacle'),'Pinnacle · Üniversite');assert.equal(programGameLabel('achieve','Pinnacle'),'Pinnacle');
// Kanonik alan adı ve veri sorumlusu tek kaynak
assert.equal(SITE_URL,CANONICAL_ORIGIN);assert.equal(CANONICAL_ORIGIN,'https://www.recfturkiye.com');
const legal=applyControllerFacts('Adresi : Ünalan Mah. Üsküdar\nTelefon : …\nElektronik Posta Adresi : off-season@intechne.com.tr\nBaşvuru off-season@intechne.com.tr adresinden\nAydınlatma Metni Tarihi : …\nVeli Ad Soyad : … Katılımcı Öğrenci Ad Soyad : …\nİmza İmza');
assert.ok(!/Ünalan|Üsküdar|off-season@/.test(legal));assert.ok(legal.includes(DATA_CONTROLLER.address)&&legal.includes(DATA_CONTROLLER.phone));
assert.ok(!webText(legal).includes('…'),'web legal view must not show form-field ellipses');
// Takım numarası isteğe bağlı: geçici iç anahtar herkese açık gösterilmez
const tmp=provisionalTeamNumber();assert.ok(isProvisionalTeamNumber(tmp)&&/^[A-Z0-9]{2,10}$/.test(tmp));assert.equal(publicTeamNumber(tmp),'');assert.equal(publicTeamNumber('123A'),'123A');
assert.equal(worldChampionship({wc_date_label:'X Tarih'}).label,'X Tarih');assert.equal(worldChampionship({wc_date_label:'[TEYİT]'}).label,WORLD_CHAMPIONSHIP.label);
assert.equal(verifiedRoute(worldChampionship({wc_date_label:'Y'}))[1].date_label,'Y');
const wcSss=applyTokens(SITE_PAGES.find(p=>p.slug==='sss').body,{wc:worldChampionship({wc_date_label:'CMS TARİHİ'})});assert.ok(wcSss.includes('CMS TARİHİ'));
const ld=faqLd(faqs.map(f=>({q:plainText(f.q),a:plainText(f.a)})));
assert.equal(ld['@type'],'FAQPage');assert.ok(ld.mainEntity.every(q=>q['@type']==='Question'&&!/\]\(/.test(q.acceptedAnswer.text)));

// Sezon rotası
const legacy=JSON.stringify([{month:'EYLÜL',label:'Takım Kayıtları',done:false},{month:'MART',label:'Türkiye Şampiyonası',done:false}]);
assert.deepEqual(publicRoute(legacy).map(s=>s.label),VERIFIED_ROUTE.map(s=>s.label),'legacy month-only steps must not be shown');
assert.deepEqual(publicRoute(JSON.stringify(SUGGESTED_ROUTE)).map(s=>s.label),VERIFIED_ROUTE.map(s=>s.label),'unconfirmed suggestions stay drafts');
const custom=JSON.stringify([{month:'ŞİMDİ',label:'Kayıt',published:true},{month:'MART 2027',label:'Final',published:true,date:'2027-03-06'},{month:'X',label:'Taslak',published:false}]);
assert.deepEqual(publicRoute(custom).map(s=>s.label),['Kayıt','Final']);
assert.equal(publicRoute(custom,Date.parse('2027-04-01')).find(s=>s.label==='Final').done,true);
assert.equal(publicRoute('not json').length,VERIFIED_ROUTE.length);
const tbc=JSON.stringify([{month:'ŞİMDİ',label:'Kayıt',published:true},{month:'NİSAN',label:'Final',published:true,status:'confirmed'},{month:'MAYIS',label:'Teyitsiz',published:true,status:'tbc'}]);
assert.deepEqual(publicRoute(tbc).map(s=>s.label),['Kayıt','Final'],'unconfirmed (tbc) milestones stay hidden');

// Event structured data: tarihi teyitsiz etkinlik için üretilmez
assert.equal(eventLd({slug:'x',title:'X',date_tbc:true,event_start:'2027-01-01T10:00:00Z'}),null);
assert.equal(eventLd({slug:'x',title:'X'}),null);
const event=eventLd({slug:'x',title:'X',city:'İstanbul',event_start:'2027-01-01T10:00:00Z',registration_url:'https://www.recfevents.org/Events/Details/1'});
assert.equal(event['@type'],'Event');assert.equal(event.startDate,'2027-01-01T13:00:00+03:00');
assert.equal(istanbulIso('2026-09-18T12:00:00Z'),'2026-09-18T15:00:00+03:00');
// Sayfadaki tarih ve yapılandırılmış veri aynı kaynaktan: CMS'teki serbest tarih metni zaman damgasını geçersiz kılamaz
const shown=publicEvent({slug:'x',date_label:'17 Eylül 2026',event_start:'2027-02-01T09:00:00Z',event_end:'2027-02-01T15:00:00Z',status:'KAYIT AÇIK'},Date.parse('2026-12-01'));
assert.equal(shown.date_label,'1 Şubat 2027');
const past=eventLd({slug:'p',title:'P',event_start:'2020-01-01T10:00:00Z',registration_url:'https://www.recfevents.org/x'});assert.equal(past.offers,undefined);

// Kaynak taraması: public kodda yer tutucu ve başka yarışma organizasyonu/şirket adı yok
const roots=['app/(site)','components','lib'];
const files=roots.flatMap(function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const full=path.join(dir,entry.name);return entry.isDirectory()?walk(full):/\.(tsx?|mjs)$/.test(entry.name)&&!/ 2\./.test(entry.name)?[full]:[];});});
const allowPlaceholder=new Set(['lib/site-config.ts']);
for(const file of files){
 const text=fs.readFileSync(file,'utf8');
 if(!allowPlaceholder.has(file))assert.ok(!/\[\s*TEY[İI]T|\bTEY[İI]T\]/.test(text),`placeholder in ${file}`);
}
const publicFiles=files.filter(f=>f.startsWith('app/(site)')||f.startsWith('components/public')||['lib/site-pages.ts','lib/season-route.ts','components/Chrome.tsx'].includes(f));
for(const file of publicFiles){const text=fs.readFileSync(file,'utf8');assert.ok(!/\b(VEX|LEGO|TETRIX|FIRST Robotics|FLL|WRO)\b/.test(text),`competitor/brand name in ${file}`);}
console.log(`PASS site content: ${SITE_PAGES.length} CMS pages placeholder-free with resolved tokens, launch page unpublished without unconfirmed date, neutral FAQ answer verbatim + FAQPage, verified sources linked, season route hides legacy/unconfirmed steps, Event JSON-LD only for dated events, ${files.length} source files scanned for placeholders and ${publicFiles.length} public files for other organizations' names.`);
