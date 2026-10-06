import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const uri=source=>`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
const moduleUrl=(path,imports={})=>{
 let code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
 for(const [specifier,target] of Object.entries(imports))code=code.replaceAll(JSON.stringify(specifier),JSON.stringify(target));
 return uri(code);
};
const contactInfoUrl=moduleUrl('lib/public-contact.ts');
const notificationUrl=moduleUrl('lib/submission-notifications.ts',{'@/lib/public-contact':contactInfoUrl});
const {notificationConfiguration,submissionNotification,notifySubmission,applicationReceipt,notifyApplicationReceipt}=await import(notificationUrl);
const config={RECF_NOTIFICATIONS_ENABLED:'1',RESEND_API_KEY:'test-key',RECF_NOTIFICATION_FROM:'notify@example.org',RECF_NOTIFICATION_TO:'admin@example.net'};
let requests=0;
assert.equal(notificationConfiguration({}).ready,false);
assert.equal(notificationConfiguration({...config,VERCEL_ENV:'preview'}).ready,false);
assert.equal(notificationConfiguration({...config,RECF_NOTIFICATION_TO:'injected\n@example.net'}).ready,false);
assert.equal(notificationConfiguration({...config,RECF_NOTIFICATION_FROM:'notify@example.org\r\nBcc:other@example.net'}).ready,false);
assert.equal(notificationConfiguration(config).sender,'RECF Türkiye · Takım Destek <notify@example.org>');
assert.equal(await notifySubmission('contact',1,{...config,RECF_NOTIFICATIONS_ENABLED:'0'},async()=>{requests++;}), 'disabled');
assert.equal(requests,0);
assert.throws(()=>submissionNotification('contact',0));
assert.throws(()=>submissionNotification('contact',NaN));
const payload=submissionNotification('application',123);
assert.ok(payload.text.includes('/admin/onaylar#basvuru-123'));
assert.equal(payload.idempotencyKey,'recf-application-123');
assert.equal(await notifySubmission('application',123,config,async(url,options)=>{
 assert.equal(url,'https://api.resend.com/emails');assert.equal(options.headers['Idempotency-Key'],payload.idempotencyKey);
 const body=JSON.parse(options.body);assert.deepEqual(body.to,['admin@example.net']);assert.equal(body.from,'RECF Türkiye · Takım Destek <notify@example.org>');assert.equal(body.text,payload.text);
 return {ok:true,status:200,json:async()=>({id:'provider-test-id'})};
}), 'accepted');
assert.equal(await notifySubmission('contact',12,config,async()=>({ok:false,status:503})), 'failed');
assert.equal(await notifySubmission('contact',12,config,async()=>{throw new Error('simulated network failure')}), 'failed');
assert.equal(await notifySubmission('contact',12,config,async()=>({ok:true,status:200,json:async()=>({})})), 'failed');
const receipt=applicationReceipt(123);
assert.equal(receipt.idempotencyKey,'recf-application-receipt-123');
assert.ok(receipt.text.includes('#0123'));
assert.ok(receipt.text.includes('destek@recfturkiye.com'));
assert.ok(!receipt.html.includes('/admin/'));
assert.ok(!receipt.text.includes('₺'));
assert.throws(()=>applicationReceipt(0));
let receiptRequests=0;
const receiptSend=async(url,options)=>{
 receiptRequests++;
 assert.equal(url,'https://api.resend.com/emails');
 assert.equal(options.headers['Idempotency-Key'],receipt.idempotencyKey);
 const body=JSON.parse(options.body);
 assert.equal(body.from,'RECF Türkiye · Takım Destek <notify@example.org>');
 assert.deepEqual(body.to,['mentor@example.net']);
 assert.equal(body.reply_to,'destek@recfturkiye.com');
 assert.equal(body.text,receipt.text);assert.equal(body.html,receipt.html);
 return {ok:true,status:200,json:async()=>({id:'receipt-test-id'})};
};
assert.equal(await notifyApplicationReceipt(123,'mentor@example.net',{...config,VERCEL_ENV:'preview'},receiptSend),'disabled');
assert.equal(await notifyApplicationReceipt(123,'mentor@example.net\r\nBcc: other@example.net',config,receiptSend),'failed');
assert.equal(receiptRequests,0);
assert.equal(await notifyApplicationReceipt(123,'mentor@example.net',config,receiptSend),'accepted');
assert.equal(receiptRequests,1);
let retryRequests=0;let retryBody;
assert.equal(await notifyApplicationReceipt(123,'mentor@example.net',config,async(url,options)=>{
 retryRequests++;if(retryRequests===1){retryBody=options.body;return {ok:false,status:429};}
 assert.equal(options.body,retryBody);assert.equal(options.headers['Idempotency-Key'],receipt.idempotencyKey);
 return {ok:true,status:200,json:async()=>({id:'receipt-test-id'})};
}),'accepted');
assert.equal(retryRequests,2);
assert.equal(await notifyApplicationReceipt(123,'mentor@example.net',config,async()=>({ok:false,status:422})),'failed');

// Execute the actual handlers with isolated database/auth/rate-limit boundaries.
// No live records, users, SMTP or network are used.
const fixture={order:[],contact:null,application:null};globalThis.__recfSubmissionFixture=fixture;
const db=uri(`export async function createContact(record){globalThis.__recfSubmissionFixture.order.push('persist-contact');globalThis.__recfSubmissionFixture.contact=record;return {id:201};} export async function createApplication(record){globalThis.__recfSubmissionFixture.order.push('persist-application');globalThis.__recfSubmissionFixture.application=record;return {id:202,updated:false};} export async function getSettings(){throw new Error('Registration must not depend on pricing');} export async function listApplications(){return [];}export async function listContacts(){return [];}export async function updateContact(){}`);
const auth=uri('export async function approvalsSession(){return null;}export async function contactSession(){return null;}');
const security=uri(String.raw`export const cleanText=(value,max)=>String(value||'').trim().slice(0,max);export const clientIp=()=> 'test';export const enforceRateLimit=async()=>({ok:true});export const rateLimitResponse=()=>{};export const validEmail=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);`);
const locations=uri(`export const isValidProvinceDistrict=(city,district)=>city==='İstanbul'&&district==='Kadıköy';`);
const errors=uri(`export const apiError=()=>new Response('test failure',{status:500});`);
const imports={'next/server':pathToFileURL(require.resolve('next/server')).href,'@/lib/auth':auth,'@/lib/db':db,'@/lib/security':security,'@/lib/locations':locations,'@/lib/api-server':errors,'@/lib/submission-notifications':notificationUrl};
const contact=await import(moduleUrl('app/api/contact/route.ts',imports));
const application=await import(moduleUrl('app/api/applications/route.ts',imports));
const oldFetch=globalThis.fetch;const saved=Object.fromEntries(Object.keys(config).map(key=>[key,process.env[key]]));
try{
 Object.assign(process.env,config);
 globalThis.fetch=async()=>{fixture.order.push('email-attempt');return {ok:false,status:503};};
 const request=body=>({json:async()=>body});
 const invalid=await contact.POST(request({name:'Test',email:'invalid',message:'Test'}));assert.equal(invalid.status,400);assert.equal(fixture.contact,null);
 const bot=await contact.POST(request({website:'bot'}));assert.equal(bot.status,201);assert.equal(fixture.contact,null);assert.deepEqual(fixture.order,[]);
 const result=await contact.POST(request({name:'Test Contact',email:'test@example.net',message:'Test message'}));
 assert.equal(result.status,201);assert.deepEqual(await result.json(),{id:201,ok:true});assert.deepEqual(fixture.order,['persist-contact','email-attempt']);
 fixture.order=[];
 const invalidApplication=await application.POST(request({}));assert.equal(invalidApplication.status,400);assert.equal(fixture.application,null);
 const validApplication={num:'TEST2026',team:'Test team',org:'Test org',city:'İstanbul',district:'Kadıköy',type:'Okul Takımı',program:'achieve',mentor:'Test Mentor',email:'test@example.net',phone:'0000000000',kvkk:true};
 const result2=await application.POST(request({...validApplication,kit:true,total:123456}));
 assert.equal(result2.status,201);const failedReceipt=await result2.json();assert.equal(failedReceipt.id,202);assert.equal(failedReceipt.confirmationEmail,'failed');
 assert.equal('total' in fixture.application,false);assert.equal('kit' in fixture.application,false);
 assert.deepEqual(fixture.order,['persist-application','email-attempt','email-attempt','email-attempt']);
 fixture.order=[];const recipients=[];
 globalThis.fetch=async(url,options)=>{fixture.order.push('email-attempt');recipients.push(JSON.parse(options.body).to);return {ok:true,status:200,json:async()=>({id:'test-provider-id'})};};
 const result3=await application.POST(request(validApplication));
 assert.equal(result3.status,201);assert.equal((await result3.json()).confirmationEmail,'accepted');
 assert.deepEqual(recipients,[['admin@example.net'],['test@example.net']]);
 assert.deepEqual(fixture.order,['persist-application','email-attempt','email-attempt']);
 fixture.order=[];await application.POST(request({...validApplication,website:'bot'}));assert.deepEqual(fixture.order,[]);
 const attempts=fixture.order.length;
 await application.GET(request({}));await contact.GET(request({}));assert.equal(fixture.order.length,attempts);
}finally{
 globalThis.fetch=oldFetch;delete globalThis.__recfSubmissionFixture;
 for(const [key,value] of Object.entries(saved)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
}
console.log('PASS notification privacy, applicant receipt HTML/text/reply-to/idempotency/retry, preview mail blocking and submission handlers: no pricing dependency, injected total/kit ignored, persistence precedes both emails, provider failure retains successful application, invalid/bot submissions do not persist. Live database delivery is not covered.');
