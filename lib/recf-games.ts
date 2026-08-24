const DEFAULT_BASE="https://games.recf.org";
const DEFAULT_REVALIDATE=900;

export type EngageScoreKey="floor"|"l1"|"l2"|"l3"|"l4"|"park";
export type EngageScores=Record<EngageScoreKey,number>;

export type OfficialScoringExample={
  ruleLabel:string;
  rows:Array<{label:string;detail:string;points:number}>;
  total:number;
  note:string;
  source:"api"|"fallback";
};

export type EngageScoringData={
  available:boolean;
  source:"api"|"fallback";
  versionLabel:string;
  publishedAt:string|null;
  releasedDateLabel:string|null;
  gameName:string;
  manualUrl:string;
  calculatorUrl:string;
  qnaUrl:string;
  apiDocsUrl:string;
  scores:EngageScores;
  officialExample:OfficialScoringExample|null;
  ruleSummary:{
    highestValue:string;
    colorMatching:string;
    l4:string;
    parking:string;
  };
  fetchedAt:string;
};

type JsonRecord=Record<string,unknown>;

const FALLBACK_SCORES:EngageScores={floor:1,l1:5,l2:10,l3:25,l4:50,park:25};
const FALLBACK_EXAMPLE:OfficialScoringExample={
  ruleLabel:"3.1.7",
  rows:[
    {label:"Red L1",detail:"2 kırmızı bean bag",points:10},
    {label:"Red L2",detail:"2 kırmızı bean bag",points:20},
    {label:"Red L3",detail:"1 kırmızı + 1 sarı bean bag",points:50},
  ],
  total:80,
  note:"Mavi bean bag'ler kırmızı hedefte puan sayılmaz.",
  source:"fallback",
};

function baseUrl(){
  return String(process.env.RECF_GAMES_API_BASE||DEFAULT_BASE).replace(/\/$/,"");
}

function revalidateSeconds(){
  const n=Number(process.env.RECF_GAMES_REVALIDATE_SECONDS||DEFAULT_REVALIDATE);
  return Number.isFinite(n)&&n>=60?Math.floor(n):DEFAULT_REVALIDATE;
}

function isRecord(v:unknown):v is JsonRecord{return !!v&&typeof v==="object"&&!Array.isArray(v);}
function unwrap(v:unknown){return isRecord(v)&&"data" in v?v.data:v;}
function str(v:unknown){return typeof v==="string"?v:"";}

function collectStrings(value:unknown,out:string[]=[]):string[]{
  if(typeof value==="string")out.push(value);
  else if(Array.isArray(value))for(const item of value)collectStrings(item,out);
  else if(isRecord(value))for(const item of Object.values(value))collectStrings(item,out);
  return out;
}

function normalizeText(value:unknown){
  return collectStrings(value).join(" ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim();
}

function findNode(value:unknown,predicate:(node:JsonRecord)=>boolean):JsonRecord|null{
  if(Array.isArray(value)){
    for(const item of value){const found=findNode(item,predicate);if(found)return found;}
    return null;
  }
  if(!isRecord(value))return null;
  if(predicate(value))return value;
  for(const item of Object.values(value)){const found=findNode(item,predicate);if(found)return found;}
  return null;
}

function numberNear(text:string,pattern:RegExp,fallback:number){
  const m=text.match(pattern);
  if(!m)return fallback;
  const n=Number(m[1]);
  return Number.isFinite(n)?n:fallback;
}

function extractScores(manual:unknown):EngageScores{
  const scoring=findNode(manual,node=>{
    const num=str(node.displayNumber||node.label).trim();
    const title=str(node.title).toLowerCase();
    return num==="3.1"||title==="scoring"||title.includes("solo match scoring");
  });
  const text=normalizeText(scoring||manual);
  return {
    floor:numberNear(text,/Floor\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_SCORES.floor),
    l1:numberNear(text,/L1\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_SCORES.l1),
    l2:numberNear(text,/L2\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_SCORES.l2),
    l3:numberNear(text,/L3\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_SCORES.l3),
    l4:numberNear(text,/L4\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_SCORES.l4),
    park:numberNear(text,/Parked\s+(?:robot|Robot).{0,180}?(\d+)\s*point/i,FALLBACK_SCORES.park),
  };
}

function extractGameName(manual:unknown){
  const game=findNode(manual,node=>{
    const num=str(node.displayNumber||node.label).trim();
    const title=str(node.title);
    return num==="1.2"||/2026\s*[-–]\s*2027.*game/i.test(title);
  });
  const title=str(game?.title);
  const m=title.match(/Game\s*:\s*(.+)$/i);
  return (m?.[1]||title||"Tier Takeover").trim();
}

function extractOfficialExample(manual:unknown,scores:EngageScores,gameName:string):OfficialScoringExample|null{
  if(!/tier takeover/i.test(gameName))return null;
  const example=findNode(manual,node=>{
    const label=str(node.displayNumber||node.label).trim();
    const title=str(node.title).toLowerCase();
    return label==="3.1.7"||title.includes("scoring example");
  });
  const text=normalizeText(example);
  const detected=/two\s+red/i.test(text)&&/L1/i.test(text)&&/L2/i.test(text)&&/one\s+red\s+and\s+one\s+yellow/i.test(text)&&/L3/i.test(text);
  const rows=[
    {label:"Red L1",detail:"2 kırmızı bean bag",points:2*scores.l1},
    {label:"Red L2",detail:"2 kırmızı bean bag",points:2*scores.l2},
    {label:"Red L3",detail:"1 kırmızı + 1 sarı bean bag",points:2*scores.l3},
  ];
  return {
    ruleLabel:"3.1.7",
    rows,
    total:rows.reduce((sum,row)=>sum+row.points,0),
    note:"Mavi bean bag'ler kırmızı hedefte puan sayılmaz.",
    source:detected?"api":"fallback",
  };
}

async function getJson(path:string,tag:string){
  const url=`${baseUrl()}${path}`;
  const res=await fetch(url,{
    headers:{Accept:"application/json","User-Agent":"RECF-Turkiye-Web/3.1.6"},
    next:{revalidate:revalidateSeconds(),tags:[tag]},
    signal:AbortSignal.timeout(8000),
  });
  if(!res.ok)throw new Error(`RECF Games API ${res.status} (${path})`);
  return res.json() as Promise<unknown>;
}

function latestVersionFromPrograms(payload:unknown,slug:string){
  const data=unwrap(payload);
  if(!Array.isArray(data))return "";
  const row=data.find(item=>isRecord(item)&&str(item.slug)===slug);
  return isRecord(row)?str(row.currentVersionLabel):"";
}

function revisionMeta(manual:unknown){
  const data=unwrap(manual);
  const revision=isRecord(data)&&isRecord(data.revision)?data.revision:null;
  return {
    versionLabel:str(revision?.versionLabel),
    publishedAt:str(revision?.publishedAt)||null,
    releasedDateLabel:str(revision?.releasedDateLabel)||null,
  };
}

export async function getEngageScoringData():Promise<EngageScoringData>{
  const fetchedAt=new Date().toISOString();
  const base=baseUrl();
  try{
    const programs=await getJson("/api/v1/programs","recf-games:programs");
    const version=latestVersionFromPrograms(programs,"engage")||"1.1";
    const manualPayload=await getJson(`/api/v1/programs/engage/manual/${encodeURIComponent(version)}`,`recf-games:engage:${version}`);
    const manual=unwrap(manualPayload);
    const meta=revisionMeta(manualPayload);
    const scores=extractScores(manual);
    const gameName=extractGameName(manual);
    return {
      available:true,
      source:"api",
      versionLabel:meta.versionLabel||version,
      publishedAt:meta.publishedAt,
      releasedDateLabel:meta.releasedDateLabel,
      gameName,
      manualUrl:`${base}/engage/${encodeURIComponent(meta.versionLabel||version)}`,
      calculatorUrl:`${base}/engage/calculator`,
      qnaUrl:`${base}/engage/qa`,
      apiDocsUrl:`${base}/api-docs`,
      scores,
      officialExample:extractOfficialExample(manual,scores,gameName),
      ruleSummary:{
        highestValue:"Bir bean bag birden fazla hedef için uygun görünse bile yalnızca en yüksek değerli hedef üzerinden puanlanır.",
        colorMatching:"Kırmızı bean bag kırmızı hedeflerde, mavi bean bag mavi hedeflerde; sarı bean bag ise tüm hedeflerde puanlanabilir.",
        l4:"L4 hedefinde yalnızca sarı bean bag puan kazandırır.",
        parking:"Maç sonunda kendi load zone alanında park eden robot 25 puan kazanır.",
      },
      fetchedAt,
    };
  }catch{
    return {
      available:false,
      source:"fallback",
      versionLabel:"1.1",
      publishedAt:null,
      releasedDateLabel:"July 10, 2026",
      gameName:"Tier Takeover",
      manualUrl:`${base}/engage/1.1`,
      calculatorUrl:`${base}/engage/calculator`,
      qnaUrl:`${base}/engage/qa`,
      apiDocsUrl:`${base}/api-docs`,
      scores:FALLBACK_SCORES,
      officialExample:FALLBACK_EXAMPLE,
      ruleSummary:{
        highestValue:"Bir bean bag birden fazla hedef için uygun görünse bile yalnızca en yüksek değerli hedef üzerinden puanlanır.",
        colorMatching:"Kırmızı bean bag kırmızı hedeflerde, mavi bean bag mavi hedeflerde; sarı bean bag ise tüm hedeflerde puanlanabilir.",
        l4:"L4 hedefinde yalnızca sarı bean bag puan kazandırır.",
        parking:"Maç sonunda kendi load zone alanında park eden robot 25 puan kazanır.",
      },
      fetchedAt,
    };
  }
}
