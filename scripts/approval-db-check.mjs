import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const uri=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const fixture={status:'ONAYLANDI',mailStatus:'pending',queries:[],claim:null,sent:false};
const sql=async(strings,...values)=>{
 const query=strings.join('?');fixture.queries.push(query);
 if(query.includes('SELECT * FROM applications'))return [{id:'7',num:'TEST26',status:fixture.status}];
 if(query.includes("SET approval_email_status='sending'")){
  assert.ok(query.includes("a.status='ONAYLANDI'"));assert.ok(query.includes('approval_email_sent_at IS NULL'));assert.ok(query.includes("interval '5 minutes'"));assert.ok(query.includes('lower(t.mentor_email)=lower(a.email)'));assert.ok(query.includes("t.status='AKTİF'"));
  if(fixture.sent||fixture.mailStatus==='sending')return [];
  fixture.claim=values[0];fixture.mailStatus='sending';return [{id:'7',num:'TEST26',team:'Test team',program:'engage',email:'test@example.net'}];
 }
 if(query.includes('SELECT approval_email_status'))return [{approval_email_status:fixture.mailStatus,status:fixture.status}];
 if(query.includes('approval_email_provider_id')){
  assert.ok(query.includes('approval_email_claim=?::uuid'));assert.ok(query.includes("approval_email_status='sending'"));
  const [status,,providerId,,claim]=values;if(claim!==fixture.claim)return [];
  fixture.mailStatus=status;fixture.sent=status==='accepted';fixture.providerId=providerId;return [{id:'7'}];
 }
 throw new Error('Unexpected query: '+query);
};sql.begin=callback=>callback(sql);globalThis.__recfApprovalSql=sql;
let code=ts.transpileModule(fs.readFileSync('lib/db.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
code=code.replaceAll('"postgres"',JSON.stringify(uri('export default ()=>globalThis.__recfApprovalSql;'))).replaceAll('"@/lib/public-content"',JSON.stringify(uri('export const correctAchieveContent=x=>x;export const eventPhase=()=>"upcoming";export const publicEvent=x=>x;')));
const previous=process.env.DATABASE_URL;process.env.DATABASE_URL='postgres://fixture:fixture@127.0.0.1:1/fixture';
try{
 const {resolveApplication,claimApplicationApprovalEmail,finishApplicationApprovalEmail}=await import(uri(code));
 const out=await resolveApplication(7,'approve');assert.equal(out.alreadyResolved,true);assert.ok(!fixture.queries.some(query=>query.includes('INSERT')));
 await assert.rejects(()=>resolveApplication(7,'reject'),/APPLICATION_ALREADY_RESOLVED/);
 fixture.status='REDDEDİLDİ';await assert.rejects(()=>resolveApplication(7,'approve'),/APPLICATION_ALREADY_RESOLVED/);fixture.status='ONAYLANDI';
 const [first,second]=await Promise.all([claimApplicationApprovalEmail(7),claimApplicationApprovalEmail(7)]);assert.equal(first.app.id,7);assert.equal(second.app,null);assert.equal(second.status,'sending');
 assert.equal(await finishApplicationApprovalEmail(7,'wrong-claim','accepted','wrong-email-id'),false);
 assert.equal(await finishApplicationApprovalEmail(7,first.claim,'accepted','email-test-id'),true);assert.equal(fixture.providerId,'email-test-id');assert.equal((await claimApplicationApprovalEmail(7)).status,'accepted');
 console.log('PASS actual database helpers: approved retries do not recreate team/account, resolved transitions reject, one concurrent claim, server-owned matching team, lease recovery predicate, token-guarded finish and persistent accepted deduplication. No database connection used.');
}finally{delete globalThis.__recfApprovalSql;if(previous===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=previous;}
