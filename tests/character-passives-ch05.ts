import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createEmptyHostAuthority, hostAuthorityCommandSeq, submitClientIntent } from '../src/core/authority';
import type { CardDefinition } from '../src/core/cards';
import { computeMatchChecksum } from '../src/core/checksum';
import {
  CHARACTER_PASSIVE_BALANCE_CH05,
  applyDirectCardTargetPassiveCh05,
  applyMiniGameStartPassivesCh05,
  applyMoneyLossPassivesCh05,
  applyTurnStartPassiveCh05,
} from '../src/core/characterPassivesCh05';
import { cloneMatchState, createInitialMatchState, deserializeMatchState, serializeMatchState } from '../src/core/matchState';
import { createRngState, nextRandom } from '../src/core/rng';
import type { BoardDefinition } from '../src/core/types';
import { buildPresentationModel } from '../src/ui/presentationModel';

const names=['P1','P2','P3','P4'];
const roster=['starter-crybaby','starter-grumpy','starter-anxious','starter-hyper'];
const state=createInitialMatchState({boardId:'ch05',startNodeId:0,playerNames:names,seed:50501,targetLaps:2,characterIds:roster});
assert.deepEqual(state.players.map((p)=>p.characterId),roster);
assert.deepEqual(deserializeMatchState(serializeMatchState(state)).players.map((p)=>p.characterId),roster);
assert.deepEqual(cloneMatchState(state).players.map((p)=>p.characterId),roster);
const noChar=createInitialMatchState({boardId:'ch05',startNodeId:0,playerNames:names,seed:50501,targetLaps:2});
assert.notEqual(computeMatchChecksum(state),computeMatchChecksum(noChar),'Character ID must participate in gameplay checksum');

assert.deepEqual({
  crybaby: CHARACTER_PASSIVE_BALANCE_CH05.crybabyChance,
  grumpy: CHARACTER_PASSIVE_BALANCE_CH05.grumpyChance,
  anxious: CHARACTER_PASSIVE_BALANCE_CH05.anxiousChance,
  hyper: CHARACTER_PASSIVE_BALANCE_CH05.hyperChance,
  baby: CHARACTER_PASSIVE_BALANCE_CH05.secretBabyChance,
},{crybaby:0.40,grumpy:0.50,anxious:0.20,hyper:0.45,baby:0.60});

const alwaysHit=()=>0;
const alwaysMiss=()=>0.999999;

// KHÓC NHÈ: every qualifying loss rolls independently. Same lap may trigger twice.
const cry=state.players[0]!; cry.money=170;
applyMoneyLossPassivesCh05(state,[{player:cry,loss:30}],'news',alwaysHit);
assert.equal(cry.money,180);
cry.money=150; applyMoneyLossPassivesCh05(state,[{player:cry,loss:30}],'card',alwaysHit); assert.equal(cry.money,160);
cry.money=130; applyMoneyLossPassivesCh05(state,[{player:cry,loss:30}],'card',alwaysMiss); assert.equal(cry.money,130);
const cryEvents=state.eventLog.filter((e)=>e.data.passiveId==='passive.starter.crybaby.comfort-aftershock');
assert.equal(cryEvents.length,2);
assert.equal(cryEvents[0]!.data.chancePercent,40);

// CAU CÓ: each direct Card targeting rolls 50% independently.
const caster=state.players[0]!; const grumpy=state.players[1]!; caster.money=100; grumpy.money=100;
applyDirectCardTargetPassiveCh05(state,caster,grumpy,'Test Card',alwaysHit); assert.deepEqual([caster.money,grumpy.money],[95,105]);
applyDirectCardTargetPassiveCh05(state,caster,grumpy,'Test Card 2',alwaysHit); assert.deepEqual([caster.money,grumpy.money],[90,110]);
applyDirectCardTargetPassiveCh05(state,caster,grumpy,'Test Card 3',alwaysMiss); assert.deepEqual([caster.money,grumpy.money],[90,110]);

// LO LẮNG: 20% check each free turn, then authoritative RNG draws the Card.
const testCard:CardDefinition={id:'CH05_CARD',title:'Kế hoạch B',rarity:'N',dropWeight:1,impact:'🗂️',description:'Test',targetMode:'self',effect:{type:'catch_up_bonus',poorAmount:1,baseAmount:1},faceSlots:[]};
const anxious=state.players[2]!; anxious.handCardIds=[];
let sequence=[0.1,0.0,0.9]; const seqRandom=()=>sequence.shift() ?? 0.9;
applyTurnStartPassiveCh05(state,anxious,[testCard],seqRandom); assert.deepEqual(anxious.handCardIds,['CH05_CARD']);
applyTurnStartPassiveCh05(state,anxious,[testCard],seqRandom); assert.deepEqual(anxious.handCardIds,['CH05_CARD'],'missed 20% roll must not add a Card');

// TĂNG ĐỘNG: every eligible Mini Game start rolls 45% independently.
const hyper=state.players[3]!; hyper.money=200;
applyMiniGameStartPassivesCh05(state,[0,3],alwaysHit); assert.equal(hyper.money,205);
applyMiniGameStartPassivesCh05(state,[3],alwaysHit); assert.equal(hyper.money,210);
applyMiniGameStartPassivesCh05(state,[3],alwaysMiss); assert.equal(hyper.money,210);

// Secret Baby: stronger 60% protection, and can proc more than once in a lap.
const secret=createInitialMatchState({boardId:'secret',startNodeId:0,playerNames:['Bé'],seed:50502,targetLaps:2,characterIds:['secret-baby']});
const bebe=secret.players[0]!; bebe.money=160;
applyMoneyLossPassivesCh05(secret,[{player:bebe,loss:40}],'news',alwaysHit); assert.equal(bebe.money,175);
bebe.money=140; applyMoneyLossPassivesCh05(secret,[{player:bebe,loss:35}],'card',alwaysHit); assert.equal(bebe.money,155);
bebe.money=120; applyMoneyLossPassivesCh05(secret,[{player:bebe,loss:35}],'card',alwaysMiss); assert.equal(bebe.money,120);

function seedWhereDraw(drawIndex:number,chance:number):number{
  for(let seed=1;seed<200000;seed+=1){
    const rng=createRngState(seed);
    let value=1;
    for(let i=0;i<=drawIndex;i+=1) value=nextRandom(rng);
    if(value<chance) return seed;
  }
  throw new Error('No deterministic CH-05 seed found.');
}

// Integration: D6 is draw #0; KHÓC NHÈ chance is draw #1 on the -20B$ landing.
const lossBoard:BoardDefinition={id:'ch05-loss',name:'CH05 loss',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'money',value:-20}],edges:[{from:0,to:1,route:'main'}]};
const lossSeed=seedWhereDraw(1,CHARACTER_PASSIVE_BALANCE_CH05.crybabyChance);
const lossAuth=createEmptyHostAuthority({boardId:lossBoard.id,startNodeId:0,playerNames:['Cry'],seed:lossSeed,characterIds:['starter-crybaby']},{board:lossBoard,cards:[],news:[]});
const lossRoll=submitClientIntent(lossAuth,{intentId:'ch05-loss-roll',clientId:'ch05',actorId:0,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(lossAuth),data:{}}); assert.equal(lossRoll.status,'accepted'); assert.equal(lossAuth.state.players[0]!.money,190); assert(lossAuth.state.eventLog.some((e)=>e.data.passiveId==='passive.starter.crybaby.comfort-aftershock'));

// Integration: LO LẮNG chance is HOST/replay RNG draw #0, Card draw #1, movement D6 #2.
const normalBoard:BoardDefinition={id:'ch05-normal',name:'CH05 normal',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'normal'}],edges:[{from:0,to:1,route:'main'}]};
const anxiousSeed=seedWhereDraw(0,CHARACTER_PASSIVE_BALANCE_CH05.anxiousChance);
const anxiousAuth=createEmptyHostAuthority({boardId:normalBoard.id,startNodeId:0,playerNames:['Anxious'],seed:anxiousSeed,characterIds:['starter-anxious']},{board:normalBoard,cards:[testCard],news:[]});
const anxiousRoll=submitClientIntent(anxiousAuth,{intentId:'ch05-anx-roll',clientId:'ch05',actorId:0,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(anxiousAuth),data:{}}); assert.equal(anxiousRoll.status,'accepted'); assert.deepEqual(anxiousAuth.state.players[0]!.handCardIds,['CH05_CARD']);

// Integration: D6 draw #0; TĂNG ĐỘNG Mini Game chance is draw #1.
const miniBoard:BoardDefinition={id:'ch05-mini',name:'CH05 mini',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'normal',feature:'minigame',contentId:'MINIGAME_SLOT_01'}],edges:[{from:0,to:1,route:'main'}]};
const hyperSeed=seedWhereDraw(1,CHARACTER_PASSIVE_BALANCE_CH05.hyperChance);
const miniAuth=createEmptyHostAuthority({boardId:miniBoard.id,startNodeId:0,playerNames:names,seed:hyperSeed,characterIds:['starter-hyper',undefined,undefined,undefined]},{board:miniBoard,cards:[],news:[]});
const miniRoll=submitClientIntent(miniAuth,{intentId:'ch05-mini-roll',clientId:'ch05',actorId:0,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(miniAuth),data:{}}); assert.equal(miniRoll.status,'accepted'); assert.equal(miniAuth.state.players[0]!.money,205); assert(miniAuth.state.eventLog.some((e)=>e.data.passiveId==='passive.starter.hyper.keep-moving'));

const passiveEvent=state.eventLog.find((e)=>e.type==='character_passive'); assert(passiveEvent); const model=buildPresentationModel(passiveEvent,state.players); assert(model); assert.equal(model.kind,'tile_land'); assert.equal(model.tileType,'character_passive'); assert.match(model.eyebrow,/NỘI TẠI/); assert.doesNotMatch(model.description,/Tỷ lệ|roll|%/i); assert.equal(model.summary,''); assert.match(String(passiveEvent.data.summary ?? ''),/Tỷ lệ 40%/);

const moduleSource=readFileSync('src/core/characterPassivesCh05.ts','utf8'); const replaySource=readFileSync('src/core/replay.ts','utf8');
assert.doesNotMatch(moduleSource,/Math\.random\s*\(/);
assert.doesNotMatch(moduleSource,/characterPassiveLastLap|once.per.lap|Mỗi vòng tối đa 1 lần/i);
assert.match(replaySource,/applyTurnStartPassiveCh05\(ctx\.state, player, ctx\.cards, ctx\.random\)/);
assert.match(replaySource,/applyMiniGameStartPassivesCh05\(ctx\.state, eligible\.map/);
console.log('[character-passives-ch05] PASS percentage-based HOST RNG passives + repeated same-lap procs + deterministic replay integration');
