import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import type { CardDefinition } from '../src/core/cards';
import {
  CHARACTER_PASSIVE_BALANCE_CH05,
  applyDirectCardTargetPassiveCh05,
  applyMiniGameStartPassivesCh05,
  applyMoneyLossPassivesCh05,
  applyTurnStartPassiveCh05,
} from '../src/core/characterPassivesCh05';
import { createInitialMatchState } from '../src/core/matchState';
import type { NewsDefinition } from '../src/core/news';
import { runFullMatchSimulation0611 } from '../src/core/playtestSimulation0611';
import { createRngState, nextRandom } from '../src/core/rng';
import type { BoardDefinition } from '../src/core/types';

const BOARD=boardJson as BoardDefinition;
const CARDS=cardsJson as CardDefinition[];
const NEWS=newsJson as NewsDefinition[];
const runtime={board:BOARD,cards:CARDS,news:NEWS};

function ratioHits(run:(random:()=>number)=>boolean, seed:number, attempts=5000):number {
  const rng=createRngState(seed);
  let hits=0;
  const random=()=>nextRandom(rng);
  for(let i=0;i<attempts;i+=1) if(run(random)) hits+=1;
  return hits/attempts;
}
function close(actual:number, expected:number, tolerance=0.03):void {
  assert(Math.abs(actual-expected)<=tolerance,`observed ${actual.toFixed(4)} outside ${expected.toFixed(2)} ± ${tolerance}`);
}
const testCard:CardDefinition={id:'CH06_CARD',title:'Kế hoạch test',rarity:'N',dropWeight:1,impact:'🧪',description:'Test',targetMode:'self',effect:{type:'catch_up_bonus',poorAmount:1,baseAmount:1},faceSlots:[]};

const cryRatio=ratioHits((random)=>{
  const s=createInitialMatchState({boardId:'rate-cry',startNodeId:0,playerNames:['Cry'],seed:1,characterIds:['starter-crybaby']});
  const p=s.players[0]!; p.money=100;
  applyMoneyLossPassivesCh05(s,[{player:p,loss:20}],'news',random);
  return s.eventLog.some((e)=>e.type==='character_passive');
},601);
close(cryRatio,CHARACTER_PASSIVE_BALANCE_CH05.crybabyChance);

const grumpyState=createInitialMatchState({boardId:'rate-grumpy',startNodeId:0,playerNames:['Caster','Grumpy'],seed:1,characterIds:[undefined,'starter-grumpy']});
const grumpyRatio=ratioHits((random)=>{
  const caster=grumpyState.players[0]!, target=grumpyState.players[1]!;
  caster.money=100; target.money=100;
  const before=grumpyState.eventLog.length;
  applyDirectCardTargetPassiveCh05(grumpyState,caster,target,'Test',random);
  return grumpyState.eventLog.length>before;
},602);
close(grumpyRatio,CHARACTER_PASSIVE_BALANCE_CH05.grumpyChance);

const anxiousState=createInitialMatchState({boardId:'rate-anx',startNodeId:0,playerNames:['Anx'],seed:1,characterIds:['starter-anxious']});
const anxiousRatio=ratioHits((random)=>{
  const p=anxiousState.players[0]!; p.handCardIds=[];
  const before=anxiousState.eventLog.length;
  applyTurnStartPassiveCh05(anxiousState,p,[testCard],random);
  return anxiousState.eventLog.length>before;
},603);
close(anxiousRatio,CHARACTER_PASSIVE_BALANCE_CH05.anxiousChance);

const hyperState=createInitialMatchState({boardId:'rate-hyper',startNodeId:0,playerNames:['Hyper'],seed:1,characterIds:['starter-hyper']});
const hyperRatio=ratioHits((random)=>{
  const before=hyperState.eventLog.length;
  applyMiniGameStartPassivesCh05(hyperState,[0],random);
  return hyperState.eventLog.length>before;
},604);
close(hyperRatio,CHARACTER_PASSIVE_BALANCE_CH05.hyperChance);

const babyState=createInitialMatchState({boardId:'rate-baby',startNodeId:0,playerNames:['Baby'],seed:1,characterIds:['secret-baby']});
const babyRatio=ratioHits((random)=>{
  const p=babyState.players[0]!; p.money=100;
  const before=babyState.eventLog.length;
  applyMoneyLossPassivesCh05(babyState,[{player:p,loss:20}],'card',random);
  return babyState.eventLog.length>before;
},605);
close(babyRatio,CHARACTER_PASSIVE_BALANCE_CH05.secretBabyChance);

const starterRoster=['starter-crybaby','starter-grumpy','starter-anxious','starter-hyper'];
const starterRuns=Array.from({length:32},(_,i)=>runFullMatchSimulation0611(runtime,606000+i,['Cry','Grumpy','Anxious','Hyper'],3200,2,starterRoster));
const babyRoster=['secret-baby','starter-grumpy','starter-anxious','starter-hyper'];
const babyRuns=Array.from({length:24},(_,i)=>runFullMatchSimulation0611(runtime,607000+i,['Baby','Grumpy','Anxious','Hyper'],3200,2,babyRoster));
const allRuns=[...starterRuns,...babyRuns];

const totals=new Map<string,{events:number; amount:number}>();
for(const run of allRuns){
  assert.equal(run.report.finishOrderPlayerIds.length,4,`seed ${run.seed} did not finish`);
  assert(run.report.characterPassiveEvents>=0);
  assert(run.report.characterPassiveAmountTotal>=0);
  for(const [id,value] of Object.entries(run.report.characterPassiveById)){
    const current=totals.get(id)??{events:0,amount:0};
    current.events+=value.events; current.amount+=value.amountTotal; totals.set(id,current);
  }
}
const ids=[
  'passive.starter.crybaby.comfort-aftershock',
  'passive.starter.grumpy.push-back',
  'passive.starter.anxious.plan-ahead',
  'passive.starter.hyper.keep-moving',
  'passive.secret.baby.cosmic-darling',
];
for(const id of ids) assert((totals.get(id)?.events??0)>0,`balance batch never triggered ${id}`);

const starterPassiveAmount=starterRuns.reduce((sum,run)=>sum+run.report.characterPassiveAmountTotal,0);
const starterAverage=starterPassiveAmount/starterRuns.length;
assert(starterAverage<120,`starter passive direct amount too large per two-lap match: ${starterAverage}`);
const babyDirect=totals.get('passive.secret.baby.cosmic-darling')!;
assert(babyDirect.amount/babyRuns.length<80,`Secret Baby direct refund too large per two-lap match: ${babyDirect.amount/babyRuns.length}`);

const rates={crybaby:cryRatio,grumpy:grumpyRatio,anxious:anxiousRatio,hyper:hyperRatio,baby:babyRatio};
const summary=[...totals.entries()].sort().map(([id,v])=>`${id}: events=${v.events} amount=${v.amount}`).join(' | ');
console.log('[character-balance-ch06] PASS rates='+JSON.stringify(rates)+' starterAvgDirect='+starterAverage.toFixed(2)+'B$ | '+summary);
