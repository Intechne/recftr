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
  engage:{siteSlug:"engage",apiSlug:"engage",fallbackVersion:"2.0",fallbackGame:"Tier Takeover"},
  achieve:{siteSlug:"achieve",apiSlug:"achieve",fallbackVersion:"2.0",fallbackGame:"Pinnacle"},
  inspire:{siteSlug:"inspire",apiSlug:"inspire",fallbackVersion:"2.0",fallbackGame:"Pinnacle"},
  adc:{siteSlug:"adc",apiSlug:"adc",fallbackVersion:"1.1",fallbackGame:"Mission 2027: Fast Track"},
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

function engageData(version:string,meta:ReturnType<typeof revisionMeta>,gameName:string,available:boolean):EngageScoringData{
  const scores={...FALLBACK_ENGAGE_SCORES};
  const base=baseUrl();
  return {
    available,
    source:available?"api":"fallback",
    versionLabel:meta.versionLabel||version||"2.0",
    publishedAt:meta.publishedAt,
    releasedDateLabel:meta.releasedDateLabel,
    gameName,
    manualUrl:`${base}/engage/${encodeURIComponent(meta.versionLabel||version||"2.0")}`,
    calculatorUrl:`${base}/engage/calculator`,
    qnaUrl:`${base}/engage/qa`,
    apiDocsUrl:`${base}/api-docs`,
    scores,
    officialExample:FALLBACK_ENGAGE_EXAMPLE,
    ruleSummary:{
      highestValue:"Bir bean bag birden fazla hedef için uygun görünse bile yalnızca en yüksek değerli hedef üzerinden puanlanır.",
      colorMatching:"Kırmızı bean bag kırmızı hedeflerde, mavi bean bag mavi hedeflerde; sarı bean bag ise tüm hedeflerde puanlanabilir.",
      l4:"L4 hedefinde yalnızca sarı bean bag puan kazandırır.",
      parking:"Maç sonunda kendi load zone alanında park eden robot 25 puan kazanır.",
    },
    fetchedAt:new Date().toISOString(),
  };
}

// Verified v2.0 summary shared by Achieve and Inspire (§3.1 and §5.1).
function pinnacleScoring(){
  const cup=1, halfpin=5, center=10, park=21;
  const groups:ProgramScoringGroup[]=[
    {id:"solo",title:"Solo Puanlama",subtitle:"Solo Sürüş ve Solo Kodlama maçlarının temel puan değerleri.",items:[
      item("cup","Cup",points(cup),"Hedef üzerinde geçerli biçimde skorlanan her cup.",0),
      item("halfpin","Renk Eşleşen Halfpin",points(halfpin),"Kırmızı/mavi halfpin: eşleşen veya neutral goal. Sarı için roller rengi koşulu aranır.",1),
      item("center","Center Goal Halfpin",points(center),"Center goal üzerinde skorlanan her görünür halfpin.",2),
    ]},
    {id:"alliance",title:"İttifak ve Oyun Sonu",subtitle:"Alliance maçlarında öne çıkan temel skor değerleri.",items:[
      item("alliance-halfpin","İttifak Halfpin",points(halfpin),"İttifak rengindeki uygun goal üzerinde skorlanan görünür halfpin.",3),
      item("neutral-alliance","Neutral Goal Halfpin","7 puan","İttifak rengi: 7; sarı için roller rengi koşulu aranır (§5.1.3).",2),
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

// Verified ADC v1.1 summary (§3.1, §4.2, §5.1), checked 5 October 2026.
function adcScoring(){
  const takeoff=5, phase1=5, phase2=10, phase3=15, phase4=10;
  const green=10, yellow=20, cube=25, mini=15, spiral=10, tunnel=15;
  const ball=2, goalBonus=5, zone=1, bean=10, flight=10;
  const groups:ProgramScoringGroup[]=[
    {id:"piloting",title:"Solo Pilotaj",subtitle:"60 saniyelik pilotaj görevindeki temel puan değerleri.",items:[
      item("takeoff","Kalkış",points(takeoff),"Görev başlangıcındaki geçerli kalkış.",0),
      item("phase1","Phase 1",points(phase1),"Pilotaj parkurunun 1. aşaması.",1),
      item("phase2","Phase 2",points(phase2),"Pilotaj parkurunun 2. aşaması.",2),
      item("phase3","Phase 3",points(phase3),"Pilotaj parkurunun 3. aşaması.",3),
      item("phase4","Phase 4",points(phase4),"Pilotaj parkurunun 4. aşaması.",4),
      item("landing","İniş","5 / 10 / 15 puan","Landing pad, cube veya bullseye konumuna göre.",6),
    ]},
    {id:"autonomous",title:"Solo Otonom Uçuş · 180 saniye",subtitle:"§4.2 — geçiş başına sınırlar ve geçerlilik koşulları resmî kılavuzda açıklanır.",items:[
      item("green","Yeşil Keyhole",points(green),"Yeşil keyhole gate geçişi.",1),
      item("yellow","Sarı Keyhole",points(yellow),"Sarı keyhole gate geçişi.",3),
      item("cube","Large Cube",points(cube),"Büyük cube içerisinden geçiş.",4),
      item("mini","Mini Keyhole",points(mini),"Her mini keyhole geçişi.",2),
      item("spiral","Spiral Bonus",points(spiral),"Üç mini keyhole ardışık 1 → 2 → 3; araya başka görev girmemeli.",5),
      item("tunnel","Tunnel",points(tunnel),"Tunnel içerisinden geçiş.",6),
    ]},
    {id:"teamwork",title:"Teamwork / Alliance",subtitle:"90 saniyelik ortak skor maçında öne çıkan değerler.",items:[
      item("ball-goal","Goal İçindeki Ball",points(ball),"Goal içinde skorlanan her ball.",0),
      item("goal-bonus","Goal Bonus",`${goalBonus} × en düşük goal`,"En az ball bulunan goal üzerinden hesaplanan denge bonusu.",1),
      item("zone-ball","Scoring Zone Ball",points(zone),"Goal dışında scoring zone içinde kalan her ball.",2),
      item("bean-cleared","Bean Bag Cleared",points(bean),"High switch platformundan temizlenen her bean bag; en fazla iki.",3),
      item("flight-path","Flight Path",points(flight),"Son 30 saniyede geçerli rota; drone başına en fazla bir.",4),
      item("cube-land","Cube Landing","15 / 20 puan","Büyük cube: 15; küçük cube: 20. Cube başına en fazla bir drone.",5),
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
  if(siteSlug==="achieve"||siteSlug==="inspire")return pinnacleScoring();
  if(siteSlug==="adc")return adcScoring();
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
      return {siteSlug,apiSlug:config.apiSlug,supported:true,available:false,source:"fallback",versionLabel:config.fallbackVersion,publishedAt:null,releasedDateLabel:null,gameName:config.fallbackGame,...links,scoringGroups:fallback.groups,examples:fallback.examples,engage:siteSlug==="engage"?engageData(config.fallbackVersion,{versionLabel:"",publishedAt:null,releasedDateLabel:null},config.fallbackGame,false):null,fetchedAt};
    }
    const version=latestVersionFromPrograms(programs,config.apiSlug)||config.fallbackVersion;
    const manualPayload=await getJson(`/api/v1/programs/${config.apiSlug}/manual/${encodeURIComponent(version)}`,`recf-games:${config.apiSlug}:${version}`);
    const manual=unwrap(manualPayload);
    const meta=revisionMeta(manualPayload);
    const versionLabel=meta.versionLabel||version;
    const gameName=extractGameName(manual,config);
    const links=officialLinks(config.apiSlug,versionLabel);
    const reviewed=versionLabel===config.fallbackVersion;
    const scoring=reviewed?fallbackScoring(siteSlug):{groups:[],examples:[]};
    return {
      siteSlug,apiSlug:config.apiSlug,supported:true,available:true,source:"api",versionLabel,publishedAt:meta.publishedAt,releasedDateLabel:meta.releasedDateLabel,gameName,...links,scoringGroups:scoring.groups,examples:scoring.examples,engage:siteSlug==="engage"&&reviewed?engageData(versionLabel,meta,gameName,true):null,fetchedAt,
    };
  }catch{
    const fallback=fallbackScoring(siteSlug);
    const links=officialLinks(config.apiSlug,config.fallbackVersion);
    return {
      siteSlug,apiSlug:config.apiSlug,supported:true,available:false,source:"fallback",versionLabel:config.fallbackVersion,publishedAt:null,releasedDateLabel:null,gameName:config.fallbackGame,...links,scoringGroups:fallback.groups,examples:fallback.examples,engage:siteSlug==="engage"?engageData(config.fallbackVersion,{versionLabel:"",publishedAt:null,releasedDateLabel:null},config.fallbackGame,false):null,fetchedAt,
    };
  }
}

export async function getEngageScoringData(){
  const data=await getProgramOfficialData("engage");
  return data?.engage||null;
}
