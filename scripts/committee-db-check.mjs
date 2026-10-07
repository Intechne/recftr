import assert from 'node:assert/strict';
import fs from 'node:fs';
import postgres from 'postgres';
import ts from 'typescript';
const uri=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
// Construct real Postgres.js JSON parameters without making a connection.
const driver=postgres('postgres://fixture:fixture@127.0.0.1:1/fixture');
let inserted=false,collision=false,capturedJson;
const sql=(strings,...values)=>{
 const query=strings.join('?');
 if(query.includes('INSERT INTO planning_committee_applications')){
  capturedJson=values.find(value=>value&&typeof value==='object'&&'type' in value&&'value' in value);
  assert.ok(capturedJson,'JSON must use a typed driver parameter, not a pre-encoded string');
  assert.equal(capturedJson.type,3802);
  assert.deepEqual(capturedJson.value,['etkinlik','egitim']);
  assert.ok(Array.isArray(JSON.parse(JSON.stringify(capturedJson.value))));
  return Promise.resolve(inserted?[]:[{id:'7'}]);
 }
 if(query.includes('SELECT id FROM planning_committee_applications'))return Promise.resolve(collision?[]:[{id:'7'}]);
 throw new Error('Unexpected query');
};
sql.json=driver.json;sql.begin=async callback=>callback(sql);
globalThis.__recfCommitteeSql=sql;
const fakePg=uri('export default ()=>globalThis.__recfCommitteeSql;');
const content=uri('export const correctAchieveContent=x=>x;export const eventPhase=()=>"upcoming";export const publicEvent=x=>x;');
let code=ts.transpileModule(fs.readFileSync('lib/db.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
code=code.replaceAll('"postgres"',JSON.stringify(fakePg)).replaceAll('"@/lib/public-content"',JSON.stringify(content));
const previous=process.env.DATABASE_URL;process.env.DATABASE_URL='postgres://fixture:fixture@127.0.0.1:1/fixture';
try{
 const {createCommitteeApplication}=await import(uri(code));
 const record={submissionKey:'11111111-1111-4111-8111-111111111111',fingerprint:'a'.repeat(64),name:'Test',email:'test@example.invalid',phone:'',city:'İstanbul',district:'Kadıköy',organization:'',occupation:'',areas:['etkinlik','egitim'],availability:'Etkinlik dönemlerinde katkı',experience:'',motivation:'Test'};
 assert.deepEqual(await createCommitteeApplication(record),{id:7});
 inserted=true;assert.deepEqual(await createCommitteeApplication(record),{id:7});
 collision=true;assert.equal(await createCommitteeApplication(record),null);
 console.log('PASS actual committee insert function with real Postgres.js JSONB parameter: areas remain an array, IDs normalize, idempotent retries reuse ID and collisions do not overwrite. No database connection used.');
}finally{await driver.end();delete globalThis.__recfCommitteeSql;if(previous===undefined)delete process.env.DATABASE_URL;else process.env.DATABASE_URL=previous;}
