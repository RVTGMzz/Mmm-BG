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
const checksumBeforeUse=computeMatchChecksum(state); state.players[0]!.characterPassiveLastLap=0; assert.notEqual(computeMatchChecksum(state),checksumBeforeUse,'passive cooldown must participate in gameplay checksum'); delete state.players[0]!.characterPassiveLastLap;

// KHÓC NHÈ: >=20B$ loss refunds 10B$, once per lap.
const cry=state.players[0]!; cry.money=170;
applyMoneyLossPassivesCh05(state,[{player:cry,loss:30}],'news');
assert.equal(cry.money,180); assert.equal(cry.characterPassiveLastLap,0);
const cryEvents=()=>state.eventLog.filter((e)=>e.data.passiveId==='passive.starter.crybaby.comfort-aftershock');
assert.equal(cryEvents().length,1);
cry.money=150; applyMoneyLossPassivesCh05(state,[{player:cry,loss:30}],'card'); assert.equal(cry.money,150); assert.equal(cryEvents().length,1);
cry.lapsCompleted=1; cry.money=130; applyMoneyLossPassivesCh05(state,[{player:cry,loss:20}],'money_tile'); assert.equal(cry.money,140); assert.equal(cryEvents().length,2);

// CAU CÓ: direct Card target pulls 5B$ back from caster, once per lap.
const caster=state.players[0]!; const grumpy=state.players[1]!; caster.money=100; grumpy.money=100; delete grumpy.characterPassiveLastLap; grumpy.lapsCompleted=0;
applyDirectCardTargetPassiveCh05(state,caster,grumpy,'Test Card'); assert.deepEqual([caster.money,grumpy.money],[95,105]);
applyDirectCardTargetPassiveCh05(state,caster,grumpy,'Test Card 2'); assert.deepEqual([caster.money,grumpy.money],[95,105]);
assert.equal(state.eventLog.filter((e)=>e.data.passiveId==='passive.starter.grumpy.push-back').length,1);

// LO LẮNG: first free turn in each lap prepares one Card; full hand/used lap does not duplicate.
const testCard:CardDefinition={id:'CH05_CARD',title:'Kế hoạch B',rarity:'N',dropWeight:1,impact:'🗂️',description:'Test',targetMode:'self',effect:{type:'catch_up_bonus',poorAmount:1,baseAmount:1},faceSlots:[]};
const anxious=state.players[2]!; anxious.handCardIds=[]; anxious.lapsCompleted=0; delete anxious.characterPassiveLastLap;
applyTurnStartPassiveCh05(state,anxious,[testCard],()=>0); assert.deepEqual(anxious.handCardIds,['CH05_CARD']); assert.equal(anxious.characterPassiveLastLap,0);
applyTurnStartPassiveCh05(state,anxious,[testCard],()=>0); assert.deepEqual(anxious.handCardIds,['CH05_CARD']);

// TĂNG ĐỘNG: first eligible Mini Game participation in the lap gives +5B$.
const hyper=state.players[3]!; hyper.money=200; hyper.lapsCompleted=0; delete hyper.characterPassiveLastLap;
applyMiniGameStartPassivesCh05(state,[0,3]); assert.equal(hyper.money,205); applyMiniGameStartPassivesCh05(state,[3]); assert.equal(hyper.money,205);
assert.equal(CHARACTER_PASSIVE_BALANCE_CH05.hyperMiniGameBonus,5);

// Secret Baby: stronger 15B$ protection, still once per lap and never auto-win.
const secret=createInitialMatchState({boardId:'secret',startNodeId:0,playerNames:['Bé'],seed:50502,targetLaps:2,characterIds:['secret-baby']});
const bebe=secret.players[0]!; bebe.money=160; applyMoneyLossPassivesCh05(secret,[{player:bebe,loss:40}],'news'); assert.equal(bebe.money,175); assert.equal(CHARACTER_PASSIVE_BALANCE_CH05.secretBabyRefund,15);
bebe.money=140; applyMoneyLossPassivesCh05(secret,[{player:bebe,loss:35}],'card'); assert.equal(bebe.money,140);

// Integration: authoritative roll onto a -20B$ tile triggers KHÓC NHÈ in replay, not UI.
const lossBoard:BoardDefinition={id:'ch05-loss',name:'CH05 loss',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'money',value:-20}],edges:[{from:0,to:1,route:'main'}]};
const lossAuth=createEmptyHostAuthority({boardId:lossBoard.id,startNodeId:0,playerNames:['Cry'],seed:50503,characterIds:['starter-crybaby']},{board:lossBoard,cards:[],news:[]});
const lossRoll=submitClientIntent(lossAuth,{intentId:'ch05-loss-roll',clientId:'ch05',actorId:0,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(lossAuth),data:{}}); assert.equal(lossRoll.status,'accepted'); assert.equal(lossAuth.state.players[0]!.money,190); assert.equal(lossAuth.state.eventLog.filter((e)=>e.type==='character_passive').length,1);

// Integration: LO LẮNG draw is HOST/replay RNG and persisted before the movement die resolves.
const normalBoard:BoardDefinition={id:'ch05-normal',name:'CH05 normal',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'normal'}],edges:[{from:0,to:1,route:'main'}]};
const anxiousAuth=createEmptyHostAuthority({boardId:normalBoard.id,startNodeId:0,playerNames:['Anxious'],seed:50504,characterIds:['starter-anxious']},{board:normalBoard,cards:[testCard],news:[]});
const anxiousRoll=submitClientIntent(anxiousAuth,{intentId:'ch05-anx-roll',clientId:'ch05',actorId:0,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(anxiousAuth),data:{}}); assert.equal(anxiousRoll.status,'accepted'); assert.deepEqual(anxiousAuth.state.players[0]!.handCardIds,['CH05_CARD']);

// Integration: TĂNG ĐỘNG bonus happens when authoritative Mini Game source event is created.
const miniBoard:BoardDefinition={id:'ch05-mini',name:'CH05 mini',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'normal',feature:'minigame',contentId:'MINIGAME_SLOT_01'}],edges:[{from:0,to:1,route:'main'}]};
const miniAuth=createEmptyHostAuthority({boardId:miniBoard.id,startNodeId:0,playerNames:names,seed:50505,characterIds:['starter-hyper',undefined,undefined,undefined]},{board:miniBoard,cards:[],news:[]});
const miniRoll=submitClientIntent(miniAuth,{intentId:'ch05-mini-roll',clientId:'ch05',actorId:0,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(miniAuth),data:{}}); assert.equal(miniRoll.status,'accepted'); assert.equal(miniAuth.state.players[0]!.money,205); assert(miniAuth.state.eventLog.some((e)=>e.data.passiveId==='passive.starter.hyper.keep-moving'));

const passiveEvent=state.eventLog.find((e)=>e.type==='character_passive'); assert(passiveEvent); const model=buildPresentationModel(passiveEvent,state.players); assert(model); assert.equal(model.kind,'tile_land'); assert.equal(model.tileType,'character_passive'); assert.match(model.eyebrow,/NỘI TẠI/);

const moduleSource=readFileSync('src/core/characterPassivesCh05.ts','utf8'); const replaySource=readFileSync('src/core/replay.ts','utf8'); const demoSource=readFileSync('src/scenes/DemoBoardScene.ts','utf8');
assert.doesNotMatch(moduleSource,/Math\.random\s*\(/); assert.match(replaySource,/applyTurnStartPassiveCh05/); assert.match(replaySource,/applyMoneyLossPassivesCh05/); assert.match(replaySource,/applyMiniGameStartPassivesCh05/); assert.match(demoSource,/characterIds: gameSession\.players\.map/);
console.log('[character-passives-ch05] PASS authoritative Character IDs + five signature passives + once-per-lap cooldown + replay presentation');
