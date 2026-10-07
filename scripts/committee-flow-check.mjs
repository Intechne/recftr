import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const uri=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const compile=(file,imports={})=>{
 let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const [name,url] of Object.entries(imports))code=code.replaceAll(JSON.stringify(name),JSON.stringify(url));
 return uri(code);
};
const next=pathToFileURL(require.resolve('next/server')).href;
const contacts=compile('lib/public-contact.ts'),model=compile('lib/planning-committee.ts');
const baseNotifications=compile('lib/submission-notifications.ts',{'@/lib/public-contact':contacts});
const notifications=compile('lib/committee-notifications.ts',{'@/lib/public-contact':contacts,'@/lib/submission-notifications':baseNotifications});
const {committeeNotificationMessages,notifyCommitteeApplication}=await import(notifications);
const config={RECF_NOTIFICATIONS_ENABLED:'1',RESEND_API_KEY:'fake-test-key',RECF_NOTIFICATION_FROM:'notify@example.org',RECF_NOTIFICATION_TO:'admin@example.net',VERCEL_ENV:'production'};
const messages=committeeNotificationMessages(7);
assert.ok(messages.receipt.text.includes('PK-0007'));assert.ok(messages.notice.text.includes('/admin/planlama-komitesi#basvuru-7'));
assert.ok(!messages.receipt.html.includes('/admin/'));assert.throws(()=>committeeNotificationMessages(0));
const captured=[];
const sender=async(url,options)=>{assert.equal(url,'https://api.resend.com/emails');captured.push({body:JSON.parse(options.body),key:options.headers['Idempotency-Key']});return {ok:true,status:200,json:async()=>({id:'test-email-id'})};};
assert.equal(await notifyCommitteeApplication(7,'test@example.net',{...config,VERCEL_ENV:'preview'},sender),'disabled');assert.equal(captured.length,0);
assert.equal(await notifyCommitteeApplication(7,'test@example.net',config,sender),'accepted');
assert.deepEqual(captured.map(item=>item.body.to),[['test@example.net'],['etkinlik@recfturkiye.com']]);
assert.deepEqual(captured.map(item=>item.key),['recf-committee-receipt-7','recf-committee-notice-7']);
for(const {body} of captured){assert.equal(body.from,'RECF Türkiye · Planlama Komitesi <notify@example.org>');assert.equal(body.reply_to,'etkinlik@recfturkiye.com');}

// Real handlers, signed session validation and security utilities; isolated DB/provider.
const fixture={user:null,rows:new Map(),persistCalls:0,listCalls:0,reviewCalls:0,limitCalls:0,blockAt:0,order:[],version:1};
globalThis.__recfCommitteeFixture=fixture;
const db=uri(`
export async function findUserByEmail(email){const f=globalThis.__recfCommitteeFixture;return f.user?.email===email?f.user:null;}
export async function isSessionRevoked(){return false;}
export async function audit(){}
export async function consumeRateLimit(){const f=globalThis.__recfCommitteeFixture;f.limitCalls++;return {ok:f.limitCalls!==f.blockAt,retryAfter:30};}
export async function createCommitteeApplication(data){const f=globalThis.__recfCommitteeFixture;f.persistCalls++;f.order.push('persist');const old=f.rows.get(data.submissionKey);if(old)return old.fingerprint===data.fingerprint?{id:old.id}:null;const row={...data,id:f.rows.size+1};f.rows.set(data.submissionKey,row);return {id:row.id};}
export async function listCommitteeApplications(input){const f=globalThis.__recfCommitteeFixture;f.listCalls++;f.lastQuery=input;return {items:[],nextCursor:null};}
export async function updateCommitteeApplication(id,status,notes,version){const f=globalThis.__recfCommitteeFixture;f.reviewCalls++;if(version!==f.version)return null;f.version++;return {id,status,review_notes:notes,version:f.version};}
`);
const security=compile('lib/security.ts',{'next/server':next,'@/lib/db':db});
const session=compile('lib/session.ts');
const auth=compile('lib/auth.ts',{'@/lib/db':db,'@/lib/session':session,'@/lib/security':security});
const locations=uri(`export const isValidProvinceDistrict=(city,district)=>city==='İstanbul'&&district==='Kadıköy';`);
const errors=uri(`export const apiError=()=>new Response(null,{status:500});`);
const imports={'next/server':next,'@/lib/db':db,'@/lib/auth':auth,'@/lib/security':security,'@/lib/planning-committee':model,'@/lib/locations':locations,'@/lib/api-server':errors,'@/lib/committee-notifications':notifications};
const api=await import(compile('app/api/planning-committee/route.ts',imports));
const review=await import(compile('app/api/planning-committee/[id]/route.ts',imports));
const {createSessionToken}=await import(session);
const saved=Object.fromEntries([...Object.keys(config),'SESSION_SECRET','ADMIN_EMAIL'].map(key=>[key,process.env[key]]));
const oldFetch=globalThis.fetch;
const valid={name:'Test Volunteer',email:'test@example.net',city:'İstanbul',district:'Kadıköy',organization:'Test organization',occupation:'Test role',areas:['egitim','etkinlik'],availability:'Etkinlik dönemlerinde katkı',motivation:'Test application, not a real candidate',adult:true,kvkk:true,submissionKey:'11111111-1111-4111-8111-111111111111'};
const request=(body,token='',query='')=>({json:async()=>body,cookies:{get:()=>token?{value:token}:undefined},headers:new Headers(),nextUrl:new URL(`http://localhost/api/planning-committee${query}`)});
try{
 Object.assign(process.env,config,{SESSION_SECRET:'committee-local-fixture-session-secret-32',ADMIN_EMAIL:'bootstrap@example.invalid'});
 globalThis.fetch=async(url,options)=>{fixture.order.push('email');return {ok:true,status:200,json:async()=>({id:'test-email-id'})};};
 for(const change of [{adult:false},{kvkk:false},{email:'foo,bar@example.net'},{areas:[]},{areas:['egitim',123]},{areas:['unknown']},{areas:['egitim','etkinlik','iletisim','gonullu']},{availability:'unknown'},{city:'İstanbul',district:'Unknown'},{motivation:''},{submissionKey:'invalid'}]){
  const before=fixture.persistCalls;const response=await api.POST(request({...valid,...change}));assert.equal(response.status,400);assert.equal(fixture.persistCalls,before);
 }
 const bot=await api.POST(request({...valid,website:'bot'}));assert.equal(bot.status,201);assert.equal(fixture.rows.size,0);assert.deepEqual(fixture.order,[]);
 const result=await api.POST(request({...valid,status:'ARŞİVLENDİ',review_notes:'injected'}));
 assert.equal(result.status,201);const data=await result.json();assert.deepEqual(data,{ok:true,id:1,confirmationEmail:'accepted'});assert.deepEqual(fixture.order,['persist','email','email']);
 const row=fixture.rows.get(valid.submissionKey);assert.ok(!('status' in row));assert.ok(!('review_notes' in row));assert.equal(row.phone,'');
 fixture.order=[];const repeat=await api.POST(request(valid));assert.equal((await repeat.json()).id,1);assert.equal(fixture.rows.size,1);
 fixture.order=[];const conflict=await api.POST(request({...valid,motivation:'Changed with the same submission key'}));assert.equal(conflict.status,409);assert.deepEqual(fixture.order,['persist']);
 globalThis.fetch=async()=>{fixture.order.push('email-failed');return {ok:false,status:422};};
 const failedEmail=await api.POST(request({...valid,submissionKey:'22222222-2222-4222-8222-222222222222'}));assert.equal(failedEmail.status,201);assert.equal((await failedEmail.json()).confirmationEmail,'failed');assert.equal(fixture.rows.size,2);
 fixture.limitCalls=0;fixture.blockAt=1;const limited=await api.POST(request(valid));assert.equal(limited.status,429);assert.equal(limited.headers.get('retry-after'),'30');fixture.blockAt=0;
 assert.equal((await api.GET(request({}))).status,403);assert.equal(fixture.listCalls,0);
 for(const role of ['admin','approvals','editor','technical','mentor']){
  const user={role,email:`${role}@example.invalid`,active:true,session_version:1,must_change_password:false,team_num:role==='mentor'?'TEST':null,name:'Test'};fixture.user=user;
  const token=await createSessionToken({role,email:user.email,sv:1,teamNum:user.team_num,mustChangePassword:false});
  const permitted=['admin','approvals'].includes(role);
  assert.equal((await api.GET(request({},token))).status,permitted?200:403);
  if(!permitted){const calls=fixture.reviewCalls;assert.equal((await review.PATCH(request({status:'ARŞİVLENDİ',version:1},token),{params:Promise.resolve({id:'1'})})).status,403);assert.equal(fixture.reviewCalls,calls);}
  if(permitted){
   assert.equal((await api.GET(request({},token,'?cursor=bad'))).status,400);
   assert.equal((await api.GET(request({},token,'?status=bad'))).status,400);
   fixture.version=1;
   const first=await review.PATCH(request({status:'İNCELENİYOR',notes:'Review note',version:1},token),{params:Promise.resolve({id:'1'})});assert.equal(first.status,200);assert.equal((await first.json()).version,2);
   const stale=await review.PATCH(request({status:'ARŞİVLENDİ',version:1},token),{params:Promise.resolve({id:'1'})});assert.equal(stale.status,409);assert.equal(fixture.version,2);
   user.must_change_password=true;assert.equal((await api.GET(request({},token))).status,403);
  }
 }
 console.log('PASS committee input/privacy checks, separate recipient emails, preview block, idempotent submissions, collision protection, record retention on mail failure, rate limit, real signed-session RBAC for all five roles, temporary-password block and stale review rejection. No live records or emails used.');
}finally{
 globalThis.fetch=oldFetch;delete globalThis.__recfCommitteeFixture;
 for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
}
