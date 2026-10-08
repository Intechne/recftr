import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url),uri=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const compile=(file,imports={})=>{let code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;for(const [key,value] of Object.entries(imports))code=code.replaceAll(JSON.stringify(key),JSON.stringify(value));return uri(code);};
const fixture={user:null,status:'BAŞVURU ALINDI',mailStatus:'pending',claims:0,sends:0,finishes:0,resolve:0,audits:0,order:[]};globalThis.__recfApprovalFixture=fixture;
const db=uri(`
export const findUserByEmail=async()=>globalThis.__recfApprovalFixture.user;
export const isSessionRevoked=async()=>false;
export const consumeRateLimit=async()=>({ok:true});
export const audit=async()=>{globalThis.__recfApprovalFixture.audits++;};
export const resolveApplication=async(id,action)=>{const f=globalThis.__recfApprovalFixture;f.resolve++;f.order.push('commit');if(id===404)return null;if(id===409)throw Error('TEAM_NUM_USED');f.status=action==='approve'?'ONAYLANDI':'REDDEDİLDİ';return {app:{num:'TEST26'},alreadyResolved:false,temporaryPassword:'TEST-SECRET-NEVER-EMAIL'};};
export const claimApplicationApprovalEmail=async id=>{const f=globalThis.__recfApprovalFixture;f.claims++;if(f.status!=='ONAYLANDI')return {app:null,status:'unavailable'};if(['accepted','sending'].includes(f.mailStatus))return {app:null,status:f.mailStatus};f.mailStatus='sending';f.order.push('claim');return {app:{id,num:'TEST26',team:'Test <script> & team',program:'engage',email:'test@example.net'},claim:'test-claim'};};
export const finishApplicationApprovalEmail=async(id,claim,status,providerId)=>{const f=globalThis.__recfApprovalFixture;assertClaim(claim);f.finishes++;f.mailStatus=status;f.providerId=providerId;f.order.push('finish');return true;};
function assertClaim(claim){if(claim!=='test-claim')throw Error('Invalid claim');}
`);
const next=pathToFileURL(require.resolve('next/server')).href;
const contacts=compile('lib/public-contact.ts'),base=compile('lib/submission-notifications.ts',{'@/lib/public-contact':contacts});
const notifications=compile('lib/application-approval-notifications.ts',{'@/lib/db':db,'@/lib/public-contact':contacts,'@/lib/submission-notifications':base});
const {applicationApprovalMessage,sendApplicationApproval,notifyApprovedApplication}=await import(notifications);
const config={RECF_NOTIFICATIONS_ENABLED:'1',RESEND_API_KEY:'fixture-key',RECF_NOTIFICATION_FROM:'notify@example.org',RECF_NOTIFICATION_TO:'admin@example.net',VERCEL_ENV:'production'};
const app={id:7,num:'TEST26',team:'Test <script> & team',program:'engage',email:'test@example.net'};
const message=applicationApprovalMessage(app);assert.ok(message.html.includes('Test &lt;script&gt; &amp; team'));assert.ok(!message.html.includes('<script>'));assert.ok(message.text.includes('Takımınız onaylandı'));assert.ok(message.text.includes('portalı henüz açılmadı'));assert.ok(message.text.includes('/dokumanlar'));assert.ok(message.text.includes('/etkinlikler'));assert.ok(!message.html.includes('/admin/'));assert.ok(!message.text.includes('şifre'));assert.throws(()=>applicationApprovalMessage({...app,id:0}));
let captured=[];
const send=async(url,options)=>{captured.push(options);const body=JSON.parse(options.body);assert.deepEqual(body.to,['test@example.net']);assert.equal(body.from,'RECF Türkiye · Takım Destek <notify@example.org>');assert.equal(body.reply_to,'destek@recfturkiye.com');assert.ok(!options.body.includes('TEST-SECRET-NEVER-EMAIL'));return {ok:true,status:200,json:async()=>({id:'email-test-id'})};};
assert.deepEqual(await sendApplicationApproval(app,{...config,VERCEL_ENV:'preview'},send),{status:'disabled'});assert.equal(captured.length,0);
assert.deepEqual(await sendApplicationApproval({...app,email:'foo@example.net\nBcc:bar@example.net'},config,send),{status:'failed'});assert.equal(captured.length,0);
assert.deepEqual(await sendApplicationApproval(app,config,send),{status:'accepted',providerId:'email-test-id'});
captured=[];let retry=0;assert.equal((await sendApplicationApproval(app,config,async(url,options)=>{captured.push(options);return ++retry===1?{ok:false,status:429}:send(url,options);})).status,'accepted');assert.equal(retry,2);assert.equal(captured[0].body,captured[1].body);assert.equal(captured[0].headers['Idempotency-Key'],'recf-application-approved-7');
const security=compile('lib/security.ts',{'next/server':next,'@/lib/db':db}),session=compile('lib/session.ts'),auth=compile('lib/auth.ts',{'@/lib/db':db,'@/lib/session':session,'@/lib/security':security});
const api=await import(compile('app/api/applications/[id]/route.ts',{'next/server':next,'@/lib/auth':auth,'@/lib/db':db,'@/lib/api-server':uri('export const apiError=()=>new Response(null,{status:500});'),'@/lib/content-consistency':uri('export const publishContentChange=async()=>{};'),'@/lib/application-approval-notifications':notifications}));
const {createSessionToken}=await import(session);
const oldFetch=globalThis.fetch,saved=Object.fromEntries([...Object.keys(config),'SESSION_SECRET','ADMIN_EMAIL'].map(key=>[key,process.env[key]]));
const request=(action,token='')=>({json:async()=>({action,email:'attacker@example.net'}),cookies:{get:()=>token?{value:token}:undefined},headers:new Headers()});
const call=(action,token='',id='7')=>api.PATCH(request(action,token),{params:Promise.resolve({id})});
try{
 Object.assign(process.env,config,{SESSION_SECRET:'approval-fixture-secret-with-32-characters',ADMIN_EMAIL:'bootstrap@example.invalid'});
 globalThis.fetch=async(url,options)=>{fixture.sends++;fixture.order.push('email');return send(url,options);};
 assert.equal((await call('approve')).status,403);assert.equal(fixture.resolve,0);
 for(const role of ['admin','approvals','editor','technical','mentor']){
  fixture.user={email:`${role}@example.invalid`,name:'Test',role,active:true,session_version:1,must_change_password:false,team_num:role==='mentor'?'TEST26':null};
  const token=await createSessionToken({email:fixture.user.email,role,sv:1,teamNum:fixture.user.team_num,mustChangePassword:false});
  if(!['admin','approvals'].includes(role)){const before=fixture.sends;assert.equal((await call('approval-email',token)).status,403);assert.equal(fixture.sends,before);continue;}
  assert.equal((await call('other',token)).status,400);assert.equal((await call('approve',token,'-1')).status,400);assert.equal((await call('approve',token,'404')).status,404);assert.equal((await call('approve',token,'409')).status,409);
  fixture.mailStatus='pending';fixture.order=[];
  const approved=await call('approve',token);assert.equal(approved.status,200);assert.equal((await approved.json()).approvalEmail,'accepted');assert.deepEqual(fixture.order,['commit','claim','email','finish']);assert.equal(fixture.providerId,'email-test-id');
  const before=fixture.sends;assert.equal((await (await call('approval-email',token)).json()).approvalEmail,'accepted');assert.equal(fixture.sends,before);
  fixture.mailStatus='sending';assert.equal(await notifyApprovedApplication(7),'sending');assert.equal(fixture.sends,before);
  fixture.mailStatus='pending';globalThis.fetch=async()=>({ok:false,status:422});
  assert.equal((await (await call('approve',token)).json()).approvalEmail,'failed');assert.equal(fixture.status,'ONAYLANDI');assert.equal(fixture.mailStatus,'failed');
  globalThis.fetch=async(url,options)=>{fixture.sends++;fixture.order.push('email');return send(url,options);};assert.equal((await (await call('approval-email',token)).json()).approvalEmail,'accepted');
  fixture.mailStatus='pending';const sends=fixture.sends;await call('reject',token);assert.equal(fixture.sends,sends);assert.equal((await call('approval-email',token)).status,409);
  fixture.user.must_change_password=true;assert.equal((await call('approve',token)).status,403);
 }
 fs.writeFileSync('../team-approval-email-preview-2026-10-08.html',message.html);
 console.log('PASS real approval API/session RBAC for all five roles, temporary-password block, approval-before-email, server recipient, failure retention/manual retry, no credentials in email, HTML escaping, preview block and bounded provider retry with identical body/key. No live records or emails used.');
}finally{globalThis.fetch=oldFetch;delete globalThis.__recfApprovalFixture;for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}}
