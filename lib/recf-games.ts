const DEFAULT_BASE="https://games.recf.org";
const DEFAULT_REVALIDATE=900;

export type SiteProgramSlug="engage"|"achieve"|"inspire"|"adc"|"adc-pro";
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

export type ProgramScoreItem={
  key:string;
  label:string;
  points:string;
  description:string;
  color:string;
  tint:string;
};

export type ProgramScoringGroup={
  id:string;
  title:string;
  subtitle:string;
  items:ProgramScoreItem[];
};

export type ProgramScoringExample={
  title:string;
  ruleLabel:string;
  rows:Array<{label:string;detail:string;points:string}>;
  total:string;
  note?:string;
};

export type OfficialProgramData={
  siteSlug:SiteProgramSlug;
  apiSlug:string;
  supported:boolean;
  available:boolean;
  source:"api"|"fallback";
  versionLabel:string;
  publishedAt:string|null;
  releasedDateLabel:string|null;
  gameName:string;
  manualUrl:string;
  calculatorUrl:string;
  qnaUrl:string;
  scoringGroups:ProgramScoringGroup[];
  examples:ProgramScoringExample[];
  engage:EngageScoringData|null;
  fetchedAt:string;
};

type JsonRecord=Record<string,unknown>;

type ProgramConfig={
  siteSlug:SiteProgramSlug;
  apiSlug:string;
  fallbackVersion:string;
  fallbackGame:string;
};

const PROGRAMS:Record<SiteProgramSlug,ProgramConfig>={
  engage:{siteSlug:"engage",apiSlug:"engage",fallbackVersion:"1.1",fallbackGame:"Tier Takeover"},
  achieve:{siteSlug:"achieve",apiSlug:"achieve",fallbackVersion:"2.0",fallbackGame:"Pinnacle"},
  inspire:{siteSlug:"inspire",apiSlug:"inspire",fallbackVersion:"1.2",fallbackGame:"Pinnacle"},
  adc:{siteSlug:"adc",apiSlug:"adc",fallbackVersion:"1.0",fallbackGame:"Mission 2027: Fast Track"},
  "adc-pro":{siteSlug:"adc-pro",apiSlug:"pro",fallbackVersion:"2.0",fallbackGame:"Off Grid"},
};

const FALLBACK_ENGAGE_SCORES:EngageScores={floor:1,l1:5,l2:10,l3:25,l4:50,park:25};
const FALLBACK_ENGAGE_EXAMPLE:OfficialScoringExample={
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

function points(n:number){return `${n} puan`;}
function accent(index:number){
  return [
    {color:"#2563EB",tint:"#EAF1FF"},
    {color:"#22C55E",tint:"#E4F8EA"},
    {color:"#8657EF",tint:"#EEE9FF"},
    {color:"#F59E0B",tint:"#FFF4DC"},
    {color:"#EF4444",tint:"#FDE8E8"},
    {color:"#EC4899",tint:"#FDE7F2"},
    {color:"#29B9E5",tint:"#E5F8FD"},
  ][index%7];
}
function item(key:string,label:string,pointLabel:string,description:string,index:number):ProgramScoreItem{
  return {key,label,points:pointLabel,description,...accent(index)};
}

async function getJson(path:string,tag:string){
  const url=`${baseUrl()}${path}`;
  const res=await fetch(url,{
    headers:{Accept:"application/json","User-Agent":"RECF-Turkiye-Web/3.1.7"},
    next:{revalidate:revalidateSeconds(),tags:[tag]},
    signal:AbortSignal.timeout(8000),
  });
  if(!res.ok)throw new Error(`RECF Games API ${res.status} (${path})`);
  return res.json() as Promise<unknown>;
}

function programsArray(payload:unknown){
  const data=unwrap(payload);
  return Array.isArray(data)?data:[];
}

function latestVersionFromPrograms(payload:unknown,slug:string){
  const row=programsArray(payload).find(entry=>isRecord(entry)&&str(entry.slug)===slug);
  return isRecord(row)?str(row.currentVersionLabel):"";
}

function hasProgram(payload:unknown,slug:string){
  return programsArray(payload).some(entry=>isRecord(entry)&&str(entry.slug)===slug);
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

function extractGameName(manual:unknown,config:ProgramConfig){
  const node=findNode(manual,n=>{
    const num=str(n.displayNumber||n.label).trim();
    const title=str(n.title);
    return num==="1.2"||/2026\s*[-–]\s*2027.*game/i.test(title)||/mission\s*2027/i.test(title);
  });
  const title=str(node?.title);
  const afterColon=title.match(/:\s*(.+)$/)?.[1]?.trim();
  if(config.siteSlug==="adc"&&afterColon)return `Mission 2027: ${afterColon}`;
  return afterColon||title||config.fallbackGame;
}

function extractEngageScores(manual:unknown):EngageScores{
  const scoring=findNode(manual,node=>{
    const num=str(node.displayNumber||node.label).trim();
    const title=str(node.title).toLowerCase();
    return num==="3.1"||title==="scoring"||title.includes("solo match scoring");
  });
  const text=normalizeText(scoring||manual);
  return {
    floor:numberNear(text,/Floor\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_ENGAGE_SCORES.floor),
    l1:numberNear(text,/L1\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_ENGAGE_SCORES.l1),
    l2:numberNear(text,/L2\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_ENGAGE_SCORES.l2),
    l3:numberNear(text,/L3\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_ENGAGE_SCORES.l3),
    l4:numberNear(text,/L4\s*goal.{0,180}?(\d+)\s*point/i,FALLBACK_ENGAGE_SCORES.l4),
    park:numberNear(text,/Parked\s+(?:robot|Robot).{0,180}?(\d+)\s*point/i,FALLBACK_ENGAGE_SCORES.park),
  };
}

function engageExample(manual:unknown,scores:EngageScores):OfficialScoringExample{
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
  return {ruleLabel:"3.1.7",rows,total:rows.reduce((sum,row)=>sum+row.points,0),note:"Mavi bean bag'ler kırmızı hedefte puan sayılmaz.",source:detected?"api":"fallback"};
}

function engageData(manual:unknown,version:string,meta:ReturnType<typeof revisionMeta>,gameName:string,available:boolean):EngageScoringData{
  const scores=available?extractEngageScores(manual):FALLBACK_ENGAGE_SCORES;
  const base=baseUrl();
  return {
    available,
    source:available?"api":"fallback",
    versionLabel:meta.versionLabel||version||"1.1",
    publishedAt:meta.publishedAt,
    releasedDateLabel:meta.releasedDateLabel,
    gameName,
    manualUrl:`${base}/engage/${encodeURIComponent(meta.versionLabel||version||"1.1")}`,
    calculatorUrl:`${base}/engage/calculator`,
    qnaUrl:`${base}/engage/qa`,
    apiDocsUrl:`${base}/api-docs`,
    scores,
    officialExample:available?engageExample(manual,scores):FALLBACK_ENGAGE_EXAMPLE,
    ruleSummary:{
      highestValue:"Bir bean bag birden fazla hedef için uygun görünse bile yalnızca en yüksek değerli hedef üzerinden puanlanır.",
      colorMatching:"Kırmızı bean bag kırmızı hedeflerde, mavi bean bag mavi hedeflerde; sarı bean bag ise tüm hedeflerde puanlanabilir.",
      l4:"L4 hedefinde yalnızca sarı bean bag puan kazandırır.",
      parking:"Maç sonunda kendi load zone alanında park eden robot 25 puan kazanır.",
    },
    fetchedAt:new Date().toISOString(),
  };
}

function pinnacleScoring(manual:unknown,achieveV2=false){
  const text=normalizeText(manual);
  const cup=numberNear(text,/Scored\s+cup.{0,100}?(\d+)\s*point\s+per/i,1);
  const halfpin=numberNear(text,/red\s+or\s+blue\s+halfpin.{0,180}?(\d+)\s*points?\s+per/i,5);
  const center=numberNear(text,/center\s+goal.{0,180}?(\d+)\s*points?\s+per/i,10);
  const park=numberNear(text,/Parked\s+robot.{0,180}?(\d+)\s*points?/i,21);
  const groups:ProgramScoringGroup[]=[
    {id:"solo",title:"Solo Puanlama",subtitle:"Solo Sürüş ve Solo Kodlama maçlarının temel puan değerleri.",items:[
      item("cup","Cup",points(cup),"Hedef üzerinde geçerli biçimde skorlanan her cup.",0),
      item("halfpin","Renk Eşleşen Halfpin",points(halfpin),"Eşleşen renkli veya neutral goal üzerindeki görünür halfpin.",1),
      item("center","Center Goal Halfpin",points(center),"Center goal üzerinde skorlanan her görünür halfpin.",2),
    ]},
    {id:"alliance",title:"İttifak ve Oyun Sonu",subtitle:"Alliance maçlarında öne çıkan temel skor değerleri.",items:[
      item("alliance-halfpin","İttifak Halfpin",points(halfpin),"İttifak rengindeki uygun goal üzerinde skorlanan görünür halfpin.",3),
      ...(achieveV2?[item("neutral-alliance","Neutral Goal Halfpin","7 puan","İttifak rengi: 7; sarı için roller rengi koşulu aranır (§5.1.3).",2)]:[]),
      item("center-alliance","Center Goal",points(center),"İttifak rengi halfpin: 10; sarı halfpin ve cup için üstünlük koşulu aranır.",4),
      item("park","Parked Robot",points(park),"Maç sonunda ittifak loader'ına temas eden uygun robot.",6),
    ]},
  ];
  const examples:ProgramScoringExample[]=[
    {title:"Mavi Goal · Roller Mavi",ruleLabel:"3.1.8",rows:[
      {label:"6 Cup",detail:`6 × ${cup}`,points:String(6*cup)},
      {label:"3 Mavi Halfpin",detail:`3 × ${halfpin}`,points:String(3*halfpin)},
      {label:"3 Sarı Halfpin",detail:`3 × ${halfpin}`,points:String(3*halfpin)},
    ],total:String(6*cup+6*halfpin),note:"Roller mavi olduğunda sarı halfpin'ler de bu goal için puan kazanır."},
    {title:"Center Goal",ruleLabel:"3.1.8",rows:[
      {label:"5 Cup",detail:`5 × ${cup}`,points:String(5*cup)},
      {label:"6 Halfpin",detail:`6 × ${center}`,points:String(6*center)},
    ],total:String(5*cup+6*center),note:"Center goal için roller rengi aranmaz."},
  ];
  return {groups,examples};
}


// Reviewed against https://games.recf.org/pro/2.0, sections 3.1, 4.2 and 5.1.
// Curated v2.0 summary: do not infer scores from arbitrary nearby numbers in a manual.
function offGridScoring(){
  const groups:ProgramScoringGroup[]=[
    {id:"piloting",title:"Solo Pilotaj · 60 saniye",subtitle:"Kılavuz §3.1 — geçerlilik koşulları ve görev sınırları resmî kılavuzda açıklanır.",items:[
      item("panel","Panel Geçişi","5 / 10 puan","Büyük delik: 5; küçük delik: 10.",0),
      item("color","Renk Eşleştirme","10 puan","Geçerli renk eşleştirmesi yapılan her pad.",1),
      item("canister","Canister Bölgesi","5 / 10 / 15 puan","Bölge 1, 2 veya 3; yalnız bir bölge sayılır.",2),
      item("park","Park Eden Araç","5 puan","Geçerli park eden araç başına; en fazla iki araç.",3),
      item("dock","Drone Docking","10 puan","Geçerli biçimde robota dock eden drone.",4),
    ]},
    {id:"autonomous",title:"Solo Otonom · 60 saniye",subtitle:"Kılavuz §4.2 — kodla yürütülen görevler; durdurma süresi puanı verilmez.",items:[
      item("panel","Panel Geçişi","10 / 20 puan","Büyük delik: 10; küçük delik: 20.",0),
      item("color","Renk Eşleştirme","20 puan","Geçerli renk eşleştirmesi yapılan her pad.",1),
      item("canister","Canister Bölgesi","10 / 20 / 30 puan","Bölge 1, 2 veya 3; yalnız bir bölge sayılır.",2),
      item("park","Park Eden Araç","10 puan","Geçerli park eden araç başına; en fazla iki araç.",3),
      item("dock","Drone Docking","20 puan","Geçerli biçimde robota dock eden drone.",4),
    ]},
    {id:"alliance",title:"İttifak / Teamwork · 120 saniye",subtitle:"Kılavuz §5.1 — iki takımlı kırmızı ve mavi ittifaklar.",items:[
      item("pump","Pump","10 puan","Geçerli skorlanan pump.",0),
      item("drop","Drop Zone","15 puan","Drop zone başına en fazla bir power cell.",1),
      item("supply","Supply Station","5 puan","İstasyonda skorlanan her power cell.",2),
      item("fuel","Fuel","1 / 2 puan","Rakip saha tarafında: cooling pool içinde 1, dışında 2.",3),
      item("dock","Drone Docking","5 puan","Geçerli docking.",4),
      item("park","Park Eden Araç","1 puan","Geçerli park eden araç başına.",5),
    ]},
  ];
  return {groups,examples:[] as ProgramScoringExample[]};
}

function adcScoring(manual:unknown){
  const text=normalizeText(manual);
  const takeoff=numberNear(text,/Take\s*off.{0,80}?(\d+)\s*points?/i,5);
  const phase1=numberNear(text,/Phase\s*1.{0,80}?(\d+)\s*points?/i,5);
  const phase2=numberNear(text,/Phase\s*2.{0,80}?(\d+)\s*points?/i,10);
  const phase3=numberNear(text,/Phase\s*3.{0,80}?(\d+)\s*points?/i,15);
  const phase4=numberNear(text,/Phase\s*4.{0,80}?(\d+)\s*points?/i,10);
  const green=numberNear(text,/green\s+keyhole\s+gate.{0,80}?(\d+)\s*points?/i,10);
  const yellow=numberNear(text,/yellow\s+keyhole\s+gate.{0,80}?(\d+)\s*points?/i,20);
  const cube=numberNear(text,/large\s+cube.{0,80}?(\d+)\s*points?/i,25);
  const mini=numberNear(text,/mini\s+keyhole\s*#1.{0,80}?(\d+)\s*points?/i,15);
  const spiral=numberNear(text,/Spiral\s+bonus.{0,80}?(\d+)\s*points?/i,10);
  const tunnel=numberNear(text,/tunnel.{0,80}?(\d+)\s*points?/i,15);
  const ball=numberNear(text,/Each\s+ball\s+in\s+a\s+goal.{0,80}?(\d+)\s*points?/i,2);
  const goalBonus=numberNear(text,/Goal\s+bonus.{0,100}?(\d+)\s*x/i,5);
  const zone=numberNear(text,/Each\s+ball\s+in\s+a\s+scoring\s+zone.{0,80}?(\d+)\s*point/i,1);
  const bean=numberNear(text,/Each\s+bean\s+bag\s+cleared.{0,80}?(\d+)\s*points?/i,10);
  const flight=numberNear(text,/Completed\s+flight\s+path.{0,80}?(\d+)\s*points?/i,10);
  const groups:ProgramScoringGroup[]=[
    {id:"piloting",title:"Solo Pilotaj",subtitle:"60 saniyelik pilotaj görevindeki temel puan değerleri.",items:[
      item("takeoff","Kalkış",points(takeoff),"Görev başlangıcındaki geçerli kalkış.",0),
      item("phase1","Phase 1",points(phase1),"Pilotaj parkurunun 1. aşaması.",1),
      item("phase2","Phase 2",points(phase2),"Pilotaj parkurunun 2. aşaması.",2),
      item("phase3","Phase 3",points(phase3),"Pilotaj parkurunun 3. aşaması.",3),
      item("phase4","Phase 4",points(phase4),"Pilotaj parkurunun 4. aşaması.",4),
      item("landing","İniş","5 / 10 / 15 puan","Landing pad, cube veya bullseye konumuna göre.",6),
    ]},
    {id:"autonomous",title:"Solo Otonom Uçuş",subtitle:"Kodlama görevindeki yüksek değerli geçişler ve bonuslar.",items:[
      item("green","Yeşil Keyhole",points(green),"Yeşil keyhole gate geçişi.",1),
      item("yellow","Sarı Keyhole",points(yellow),"Sarı keyhole gate geçişi.",3),
      item("cube","Large Cube",points(cube),"Büyük cube içerisinden geçiş.",4),
      item("mini","Mini Keyhole",points(mini),"Her mini keyhole geçişi.",2),
      item("spiral","Spiral Bonus",points(spiral),"Üç mini keyhole'u doğru sırada tamamlama bonusu.",5),
      item("tunnel","Tunnel",points(tunnel),"Tunnel içerisinden geçiş.",6),
    ]},
    {id:"teamwork",title:"Teamwork / Alliance",subtitle:"90 saniyelik ortak skor maçında öne çıkan değerler.",items:[
      item("ball-goal","Goal İçindeki Ball",points(ball),"Goal içinde skorlanan her ball.",0),
      item("goal-bonus","Goal Bonus",`${goalBonus} × en düşük goal`,"En az ball bulunan goal üzerinden hesaplanan denge bonusu.",1),
      item("zone-ball","Scoring Zone Ball",points(zone),"Goal dışında scoring zone içinde kalan her ball.",2),
      item("bean-cleared","Bean Bag Cleared",points(bean),"High switch platformundan temizlenen her bean bag.",3),
      item("flight-path","Flight Path",points(flight),"Final bölümünde tamamlanan geçerli flight path.",4),
      item("cube-land","Cube Landing","15 / 20 puan","Large cube veya small cube üzerine geçerli iniş.",5),
    ]},
  ];
  const examples:ProgramScoringExample[]=[
    {title:"Goal Bonus Örneği",ruleLabel:"5.1.2",rows:[
      {label:"En düşük goal",detail:"4 ball",points:"4"},
      {label:"Bonus katsayısı",detail:`4 × ${goalBonus}`,points:String(4*goalBonus)},
    ],total:`${4*goalBonus} bonus`,note:"Goal bonusu, en az ball bulunan goal üzerinden hesaplanır."},
  ];
  return {groups,examples};
}

function fallbackScoring(siteSlug:SiteProgramSlug){
  if(siteSlug==="engage")return {groups:[],examples:[]};
  if(siteSlug==="achieve"||siteSlug==="inspire")return pinnacleScoring(null,siteSlug==="achieve");
  if(siteSlug==="adc")return adcScoring(null);
  if(siteSlug==="adc-pro")return offGridScoring();
  return {groups:[],examples:[]};
}

function scoringFor(siteSlug:SiteProgramSlug,manual:unknown){
  if(siteSlug==="achieve"||siteSlug==="inspire")return pinnacleScoring(manual,siteSlug==="achieve");
  if(siteSlug==="adc")return adcScoring(manual);
  if(siteSlug==="adc-pro")return offGridScoring();
  return {groups:[],examples:[]};
}

function officialLinks(apiSlug:string,version:string){
  const base=baseUrl();
  return {
    manualUrl:version?`${base}/${apiSlug}/${encodeURIComponent(version)}`:"",
    calculatorUrl:`${base}/${apiSlug}/calculator`,
    qnaUrl:`${base}/${apiSlug}/qa`,
  };
}

export async function getProgramOfficialData(inputSlug:string):Promise<OfficialProgramData|null>{
  const siteSlug=(Object.prototype.hasOwnProperty.call(PROGRAMS,inputSlug)?inputSlug:"") as SiteProgramSlug;
  if(!siteSlug)return null;
  const config=PROGRAMS[siteSlug];
  const fetchedAt=new Date().toISOString();
  try{
    const programs=await getJson("/api/v1/programs","recf-games:programs");
    if(!hasProgram(programs,config.apiSlug)){
      const fallback=fallbackScoring(siteSlug);
      const links=officialLinks(config.apiSlug,config.fallbackVersion);
      return {siteSlug,apiSlug:config.apiSlug,supported:true,available:false,source:"fallback",versionLabel:config.fallbackVersion,publishedAt:null,releasedDateLabel:null,gameName:config.fallbackGame,...links,scoringGroups:fallback.groups,examples:fallback.examples,engage:siteSlug==="engage"?engageData(null,config.fallbackVersion,{versionLabel:"",publishedAt:null,releasedDateLabel:null},config.fallbackGame,false):null,fetchedAt};
    }
    const version=latestVersionFromPrograms(programs,config.apiSlug)||config.fallbackVersion;
    const manualPayload=await getJson(`/api/v1/programs/${config.apiSlug}/manual/${encodeURIComponent(version)}`,`recf-games:${config.apiSlug}:${version}`);
    const manual=unwrap(manualPayload);
    const meta=revisionMeta(manualPayload);
    const versionLabel=meta.versionLabel||version;
    const gameName=extractGameName(manual,config);
    const links=officialLinks(config.apiSlug,versionLabel);
    const scoring=(siteSlug==="adc-pro"||siteSlug==="achieve")&&versionLabel!=="2.0"?{groups:[],examples:[]}:scoringFor(siteSlug,manual);
    return {
      siteSlug,apiSlug:config.apiSlug,supported:true,available:true,source:"api",versionLabel,publishedAt:meta.publishedAt,releasedDateLabel:meta.releasedDateLabel,gameName,...links,scoringGroups:scoring.groups,examples:scoring.examples,engage:siteSlug==="engage"?engageData(manual,versionLabel,meta,gameName,true):null,fetchedAt,
    };
  }catch{
    const fallback=fallbackScoring(siteSlug);
    const links=officialLinks(config.apiSlug,config.fallbackVersion);
    return {
      siteSlug,apiSlug:config.apiSlug,supported:true,available:false,source:"fallback",versionLabel:config.fallbackVersion,publishedAt:null,releasedDateLabel:null,gameName:config.fallbackGame,...links,scoringGroups:fallback.groups,examples:fallback.examples,engage:siteSlug==="engage"?engageData(null,config.fallbackVersion,{versionLabel:"",publishedAt:null,releasedDateLabel:null},config.fallbackGame,false):null,fetchedAt,
    };
  }
}

export async function getEngageScoringData(){
  const data=await getProgramOfficialData("engage");
  return data?.engage||engageData(null,"1.1",{versionLabel:"",publishedAt:null,releasedDateLabel:null},"Tier Takeover",false);
}
