import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MINI_GAME_SLOTS_059 } from '../src/core/miniGameSlots059';
import {
  minigameModeForActivePlayers,
  resolveCutTopDiceRound,
} from '../src/core/minigames';
import {
  isMiniGameRewardType,
  miniGameRewardForRank,
  miniGameRewardType059,
} from '../src/core/minigameRewards';
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
} from '../src/core/authority';
import type { BoardDefinition } from '../src/core/types';

const slot4=MINI_GAME_SLOTS_059.find(slot=>slot.contentId==='MINIGAME_SLOT_04');
assert(slot4);
assert.equal(slot4.boardLabel,'M35');
assert.equal(slot4.mode3Plus,'cut_top_dice');
assert.match(slot4.description,/hai điểm cao nhất/i);
assert.equal(minigameModeForActivePlayers([0,1], 'cut_top_dice'),'rps');
assert.equal(minigameModeForActivePlayers([0,1,2,3], 'cut_top_dice'),'cut_top_dice');

const clean=resolveCutTopDiceRound(
  [0,1,2,3],
  {0:6,1:5,2:4,3:2},
  2,
);
assert.equal(clean.complete,true);
assert.deepEqual(clean.lockedPlayerIds,[0,1]);
assert.deepEqual(clean.rerollPlayerIds,[]);
assert.deepEqual(clean.eliminatedPlayerIds,[3,2]);
assert.equal(clean.slotsOpen,0);

const boundaryTie=resolveCutTopDiceRound(
  [0,1,2,3],
  {0:6,1:5,2:5,3:2},
  2,
);
assert.equal(boundaryTie.complete,false);
assert.deepEqual(boundaryTie.lockedPlayerIds,[0]);
assert.deepEqual(boundaryTie.rerollPlayerIds,[1,2]);
assert.deepEqual(boundaryTie.eliminatedPlayerIds,[3]);
assert.equal(boundaryTie.slotsOpen,1);

const tripleTie=resolveCutTopDiceRound(
  [0,1,2,3],
  {0:5,1:5,2:5,3:2},
  2,
);
assert.deepEqual(tripleTie.lockedPlayerIds,[]);
assert.deepEqual(tripleTie.rerollPlayerIds,[0,1,2]);
assert.deepEqual(tripleTie.eliminatedPlayerIds,[3]);
assert.equal(tripleTie.slotsOpen,2);

const allTie=resolveCutTopDiceRound(
  [0,1,2,3],
  {0:4,1:4,2:4,3:4},
  2,
);
assert.deepEqual(allTie.rerollPlayerIds,[0,1,2,3]);
assert.deepEqual(allTie.eliminatedPlayerIds,[]);
assert.equal(allTie.slotsOpen,2);

assert.throws(
  ()=>resolveCutTopDiceRound([0,1,2],{0:6,1:0,2:3},2),
  /D6 1\.\.6/,
);
assert.throws(
  ()=>resolveCutTopDiceRound([0,1,2],{0:6,1:5,2:3},0),
  /targetCount/,
);

const payoutType=miniGameRewardType059('cut_top_dice','MINIGAME_SLOT_04');
assert.equal(payoutType,'cut_top_dice@MINIGAME_SLOT_04');
assert.equal(isMiniGameRewardType(payoutType),true);
assert.deepEqual([1,2,3,4].map(rank=>miniGameRewardForRank(payoutType,rank)),[30,20,0,0]);

const board: BoardDefinition = {
  id:'cut-top-dice-0713',
  name:'Cut Top Dice authority fixture',
  startNodeId:0,
  nodes:[
    {id:0,x:0,y:0,type:'normal'},
    {id:1,x:10,y:0,type:'normal',feature:'minigame',contentId:'MINIGAME_SLOT_04'},
  ],
  edges:[{from:0,to:1,route:'main'}],
};
const authority=createEmptyHostAuthority(
  {boardId:board.id,startNodeId:0,playerNames:['P1','P2','P3','P4'],seed:7131},
  {board,cards:[],news:[]},
);
const roll=submitClientIntent(authority,{
  intentId:'cut-top-roll',clientId:'test',actorId:0,type:'roll',
  observedCommandSeq:hostAuthorityCommandSeq(authority),data:{},
});
assert.equal(roll.status,'accepted');
const sourceEvent=authority.state.eventLog.find(e=>e.type==='minigame_tile');
assert(sourceEvent);
const payout=submitClientIntent(authority,{
  intentId:'cut-top-payout',clientId:'host-system',
  actorId:authority.state.players[authority.state.turn.currentPlayerIndex]!.id,
  type:'resolve_minigame',observedCommandSeq:hostAuthorityCommandSeq(authority),
  data:{sourceEventSeq:sourceEvent.seq,gameType:payoutType,rankingPlayerIds:'0,1,2,3'},
});
assert.equal(payout.status,'accepted');
assert.deepEqual(authority.state.players.map(p=>p.money),[230,220,200,200]);

const overlay=await readFile('src/ui/MiniGameOverlay.ts','utf8');
assert.match(overlay,/resolveCutTopDiceRound/);
assert.match(overlay,/CẮT TOP XÚC XẮC/);
assert.match(overlay,/2 điểm cao nhất đi tiếp/);
assert.match(overlay,/đổ lại để tranh/i);
assert.doesNotMatch(overlay,/Math\.random/);

console.log('[minigame-cut-top-dice-0713] PASS M35 cutoff reroll + Top-2 payout + retained HOST authority');
