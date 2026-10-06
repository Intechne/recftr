import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';

// Exercise real session validation and password handler with isolated database
// boundaries. Never read credentials or modify accounts in a live database.
const require=createRequire(import.meta.url);
const uri=code=>`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
const moduleUrl=(path,imports={})=>{
  let code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
  for(const [specifier,target] of Object.entries(imports))code=code.replaceAll(JSON.stringify(specifier),JSON.stringify(target));
  return uri(code);
};
const savedAdmin=process.env.ADMIN_EMAIL;
process.env.ADMIN_EMAIL='bootstrap@example.invalid';
const fixture={user:null,revoked:false,changes:0,audits:0};
globalThis.__recfPasswordFixture=fixture;
const db=uri(`
export async function findUserByEmail(email){const f=globalThis.__recfPasswordFixture;return f.user?.email===email?f.user:null;}
export async function isSessionRevoked(){return globalThis.__recfPasswordFixture.revoked;}
export async function changeOwnPassword(email,current,next){const f=globalThis.__recfPasswordFixture;if(f.user?.email!==email||current!=='temporary-test-password')return false;f.user.must_change_password=false;f.user.session_version++;f.changes++;return true;}
export async function audit(){globalThis.__recfPasswordFixture.audits++;}
`);
const sessionUrl=moduleUrl('lib/session.ts');
const security=uri('export const bootstrapSessionVersion=()=>99;');
const authUrl=moduleUrl('lib/auth.ts',{'@/lib/db':db,'@/lib/session':sessionUrl,'@/lib/security':security});
const {createSessionToken,SESSION_COOKIE}=await import(sessionUrl);
const {sessionFromRequest,cmsSession}=await import(authUrl);
const {POST}=await import(moduleUrl('app/api/account/password/route.ts',{
  'next/server':pathToFileURL(require.resolve('next/server')).href,
  '@/lib/auth':authUrl,'@/lib/session':sessionUrl,'@/lib/db':db,
  '@/lib/api-server':uri('export const apiError=()=>new Response(null,{status:500});'),
}));
const request=(token,body)=>({cookies:{get:()=>token?{value:token}:undefined},json:async()=>body});
try {
  assert.equal((await POST(request(null,{}))).status,401);
  for(const role of ['admin','editor','approvals','technical','mentor']){
    fixture.user={email:`${role}@example.invalid`,name:'Test',role,active:true,team_num:role==='mentor'?'TEST2026':null,session_version:1,must_change_password:true};
    const token=await createSessionToken({email:fixture.user.email,role,sv:1,teamNum:fixture.user.team_num,mustChangePassword:true});
    assert.equal((await sessionFromRequest(request(token))).mustChangePassword,true);
    assert.equal(await cmsSession(request(token)),null);
    fixture.revoked=true;
    assert.equal((await POST(request(token,{current:'temporary-test-password',next:'new-test-password-2026'}))).status,401);
    fixture.revoked=false;
    for(const body of [{current:'temporary-test-password',next:'short'},{current:'temporary-test-password',next:'x'.repeat(257)},{current:'temporary-test-password',next:'temporary-test-password'},{current:'incorrect-test-password',next:'new-test-password-2026'}]){
      const before=fixture.changes;
      assert.equal((await POST(request(token,body))).status,400);
      assert.equal(fixture.changes,before);
    }
    const response=await POST(request(token,{current:'temporary-test-password',next:'new-test-password-2026'}));
    assert.equal(response.status,200);
    assert.deepEqual(await response.json(),{ok:true,relogin:true});
    assert.ok(response.headers.get('set-cookie').includes(`${SESSION_COOKIE}=`));
    assert.ok(response.headers.get('set-cookie').includes('Max-Age=0'));
    assert.equal(fixture.user.must_change_password,false);
    assert.equal(await sessionFromRequest(request(token)),null);
    const renewed=await createSessionToken({email:fixture.user.email,role,sv:2,teamNum:fixture.user.team_num,mustChangePassword:false});
    assert.equal((await sessionFromRequest(request(renewed))).mustChangePassword,false);
    if(role!=='mentor')assert.equal((await cmsSession(request(renewed))).role,role);
  }
  const bootstrap=await createSessionToken({email:process.env.ADMIN_EMAIL,role:'admin',sv:99});
  assert.equal((await POST(request(bootstrap,{current:'test',next:'new-test-password-2026'}))).status,403);
  assert.equal(fixture.changes,5);assert.equal(fixture.audits,5);
  console.log('PASS: temporary password flow for all 5 roles, invalid/revoked sessions, password validation, cookie clearing, old-session rejection, renewed CMS access and bootstrap restriction. Live account password changes are not performed.');
} finally {
  delete globalThis.__recfPasswordFixture;
  if(savedAdmin===undefined)delete process.env.ADMIN_EMAIL;else process.env.ADMIN_EMAIL=savedAdmin;
}
