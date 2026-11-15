// Talep formları (okul/destek randevusu, iş birliği, lansman) ve e-posta bülteni için çevrimdışı kontroller.
// Gerçek route handler'ları, gerçek doğrulama ve bildirim kodu; veritabanı ve e-posta sağlayıcısı sahte.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const uri=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const compile=(file,imports={})=>{
 let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 for(const [name,url] of Object.entries(imports))code=code.replaceAll(JSON.stringify(name),JSON.stringify(url));
 return uri(code);
};
const next=pathToFileURL(require.resolve('next/server')).href;
const contacts=compile('lib/public-contact.ts'),leads=compile('lib/leads.ts'),newsletterText=compile('lib/newsletter.ts');
const base=compile('lib/submission-notifications.ts',{'@/lib/public-contact':contacts});
const notifications=compile('lib/lead-notifications.ts',{'@/lib/public-contact':contacts,'@/lib/submission-notifications':base,'@/lib/leads':leads});

// 1) Bildirimler: ekip bildirimi kişisel veri içermez; preview ortamında e-posta yok.
const {leadMessages,notifyLeadRequest}=await import(notifications);
const messages=leadMessages('okul_randevu',7);
assert.ok(messages.receipt.text.includes('OK-0007'));
assert.ok(messages.notice.text.includes('/admin/talepler#talep-7'));
assert.ok(!messages.notice.text.includes('@'),'team notice must not contain an email address');
assert.ok(!messages.receipt.html.includes('/admin/'));
assert.ok(leadMessages('destek_randevu',3).receipt.text.includes('/rehber/takim-kaydi'));
assert.throws(()=>leadMessages('okul_randevu',0));
const config={RECF_NOTIFICATIONS_ENABLED:'1',RESEND_API_KEY:'fake-test-key',RECF_NOTIFICATION_FROM:'notify@example.org',RECF_NOTIFICATION_TO:'team@example.net',VERCEL_ENV:'production'};
const sent=[];const sender=async(url,options)=>{sent.push({url,body:JSON.parse(options.body),key:options.headers['Idempotency-Key']});return {ok:true,status:200,json:async()=>({id:'test-id'})};};
assert.equal(await notifyLeadRequest('okul_randevu',7,'person@example.net',{...config,VERCEL_ENV:'preview'},sender),'disabled');assert.equal(sent.length,0);
assert.equal(await notifyLeadRequest('okul_randevu',7,'person@example.net',config,sender),'accepted');
assert.deepEqual(sent.map(x=>x.body.to),[['person@example.net'],['team@example.net']]);
assert.deepEqual(sent.map(x=>x.key),['recf-lead-receipt-okul_randevu-7','recf-lead-notice-okul_randevu-7']);

// 2) Route handler'lar: sahte DB.
const fixture={tables:true,rows:new Map(),subs:[],persist:0,limitCalls:0,blockAt:0};
globalThis.__recfLeadFixture=fixture;
const db=uri(`
const f=()=>globalThis.__recfLeadFixture;
export async function tableExists(){return f().tables;}
export async function consumeRateLimit(){const x=f();x.limitCalls++;return {ok:x.limitCalls!==x.blockAt,retryAfter:30};}
export async function audit(){}
export async function findUserByEmail(){return null;}
export async function isSessionRevoked(){return false;}
export async function createLeadRequest(data){const x=f();x.persist++;const old=x.rows.get(data.submissionKey);if(old)return old.fingerprint===data.fingerprint?{id:old.id}:null;const row={...data,id:x.rows.size+1};x.rows.set(data.submissionKey,row);return {id:row.id};}
export async function listLeadRequests(){return {items:[],nextCursor:null};}
export async function updateLeadRequest(){return null;}
export async function subscribeNewsletter(email,consentText,source){f().subs.push({email,consentText,source});}
export async function listNewsletterSubscriptions(){return [];}
export async function setNewsletterStatus(){return null;}
`);
const security=compile('lib/security.ts',{'next/server':next,'@/lib/db':db});
const session=compile('lib/session.ts');
const auth=compile('lib/auth.ts',{'@/lib/db':db,'@/lib/session':session,'@/lib/security':security});
const locations=uri(`export const provinces=()=>['İstanbul','Ankara'];`);
const errors=uri(`export const apiError=()=>new Response(null,{status:500});`);
const imports={'next/server':next,'@/lib/db':db,'@/lib/auth':auth,'@/lib/security':security,'@/lib/leads':leads,'@/lib/locations':locations,'@/lib/api-server':errors,'@/lib/lead-notifications':notifications,'@/lib/public-contact':contacts,'@/lib/newsletter':newsletterText};
const leadApi=await import(compile('app/api/leads/route.ts',imports));
const newsletterApi=await import(compile('app/api/newsletter/route.ts',imports));
const request=(body)=>({json:async()=>body,cookies:{get:()=>undefined},headers:new Headers(),nextUrl:new URL('http://localhost/api/leads')});
const saved=Object.fromEntries([...Object.keys(config),'SESSION_SECRET'].map(key=>[key,process.env[key]]));
const oldFetch=globalThis.fetch;
const school={kind:'okul_randevu',name:'Test Yönetici',email:'Test@Example.net',organization:'Test Okulu',role:'Okul müdürü',city:'İstanbul',topics:['Kampüs içi lig'],message:'Test talebi, gerçek kayıt değil',kvkk:true,submissionKey:'11111111-1111-4111-8111-111111111111'};
try{
 Object.assign(process.env,config,{SESSION_SECRET:'lead-local-fixture-session-secret-0032'});
 globalThis.fetch=async()=>({ok:true,status:200,json:async()=>({id:'test-email-id'})});
 for(const change of [{kvkk:false},{email:'not-an-email'},{email:'a,b@example.net'},{kind:'unknown'},{organization:''},{role:'Uydurma rol'},{role:''},{city:'Atlantis'},{topics:['Uydurma konu']},{topics:'Kampüs içi lig'},{name:''},{submissionKey:'invalid'}]){
  const before=fixture.persist;const response=await leadApi.POST(request({...school,...change}));
  assert.equal(response.status,400,`expected 400 for ${JSON.stringify(change)}`);assert.equal(fixture.persist,before);
 }
 for(const [kind,body] of [['destek_randevu',{message:''}],['destek_randevu',{message:'Yardım',preferred_time:''}],['isbirligi',{organization:'Kurum',message:'Mesaj',interest:''}],['lansman_katilim',{organization:'Okul',role:'Veli',build_team:''}]]){
  const response=await leadApi.POST(request({kind,name:'Test',email:'test@example.net',kvkk:true,...body}));assert.equal(response.status,400,kind);
 }
 const bot=await leadApi.POST(request({...school,website:'spam'}));assert.equal(bot.status,201);assert.equal(fixture.rows.size,0);
 fixture.tables=false;const migrating=await leadApi.POST(request(school));assert.equal(migrating.status,503);assert.equal(fixture.rows.size,0);fixture.tables=true;
 const ok=await leadApi.POST(request({...school,status:'TAMAMLANDI',review_notes:'injected'}));assert.equal(ok.status,201);
 const data=await ok.json();assert.deepEqual(data,{ok:true,id:1,confirmationEmail:'accepted'});
 const row=[...fixture.rows.values()][0];assert.equal(row.email,'test@example.net');assert.equal(row.kind,'okul_randevu');assert.deepEqual(row.details,{topics:['Kampüs içi lig']});assert.ok(!('status' in row));assert.ok(!('review_notes' in row));
 const repeat=await leadApi.POST(request(school));assert.equal((await repeat.json()).id,1);assert.equal(fixture.rows.size,1);
 const changed=await leadApi.POST(request({...school,message:'Değişmiş içerik'}));assert.equal(changed.status,409);
 const support=await leadApi.POST(request({kind:'destek_randevu',name:'Mentor',email:'mentor@example.net',message:'RECFEvents ödeme adımı',preferred_time:'Fark etmez',kvkk:true,submissionKey:'22222222-2222-4222-8222-222222222222'}));assert.equal(support.status,201);
 globalThis.fetch=async()=>({ok:false,status:422});
 const failedMail=await leadApi.POST(request({kind:'lansman_katilim',name:'Katılımcı',email:'katilim@example.net',organization:'Okul',role:'Veli',build_team:'Evet',kvkk:true,submissionKey:'33333333-3333-4333-8333-333333333333'}));
 assert.equal(failedMail.status,201);assert.equal((await failedMail.json()).confirmationEmail,'failed');assert.equal(fixture.rows.size,3);
 fixture.limitCalls=0;fixture.blockAt=1;const limited=await leadApi.POST(request(school));assert.equal(limited.status,429);fixture.blockAt=0;
 assert.equal((await leadApi.GET(request({}))).status,403);

 // Bülten: açık rıza zorunlu, rıza metni kaydedilir, varlık bilgisi sızdırılmaz.
 for(const body of [{email:'x@example.net'},{email:'x@example.net',consent:'true'},{email:'bad',consent:true},{email:'a;b@example.net',consent:true}]){const response=await newsletterApi.POST(request(body));assert.equal(response.status,400);}
 assert.equal(fixture.subs.length,0);
 assert.equal((await newsletterApi.POST(request({email:'bot@example.net',consent:true,website:'spam'}))).status,201);assert.equal(fixture.subs.length,0);
 fixture.tables=false;assert.equal((await newsletterApi.POST(request({email:'x@example.net',consent:true}))).status,503);fixture.tables=true;
 const sub=await newsletterApi.POST(request({email:'Okur@Example.net',consent:true,source:'footer'}));assert.equal(sub.status,201);assert.deepEqual(await sub.json(),{ok:true});
 assert.equal(fixture.subs[0].email,'okur@example.net');assert.match(fixture.subs[0].consentText,/açık rıza/);assert.equal(fixture.subs[0].source,'footer');
 const again=await newsletterApi.POST(request({email:'okur@example.net',consent:true,source:'evil'}));assert.deepEqual(await again.json(),{ok:true});assert.equal(fixture.subs[1].source,'footer');
 assert.equal((await newsletterApi.GET(request({}))).status,403);
 assert.equal((await newsletterApi.PATCH(request({id:1,status:'AYRILDI'}))).status,403);
 console.log('PASS lead forms (4 kinds) and newsletter: required fields, KVKK/explicit consent, option whitelists, honeypot, pre-migration 503, idempotent submissions, collision 409, record kept on mail failure, rate limit, admin-only reads, PII-free team notice and preview mail block. No live records or emails used.');
}finally{
 globalThis.fetch=oldFetch;delete globalThis.__recfLeadFixture;
 for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
}
