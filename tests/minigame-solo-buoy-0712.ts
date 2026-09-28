import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MINI_GAME_SLOTS_059 } from '../src/core/miniGameSlots059';
import {
  minigameModeForActivePlayers,
  resolveSoloBuoyRound,
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

assert.equal(minigameModeForActivePlayers([0,1], 'solo_buoy'), 'rps');
assert.equal(minigameModeForActivePlayers([0,1,2], 'solo_buoy'), 'solo_buoy');

const slot3 = MINI_GAME_SLOTS_059.find((slot) => slot.contentId === 'MINIGAME_SLOT_03');
assert(slot3);
assert.equal(slot3.boardLabel, 'M26');
assert.equal(slot3.mode3Plus, 'solo_buoy');
assert.match(slot3.description, /đúng một người/);

const twoUnique = resolveSoloBuoyRound(
  [0,1,2,3],
  {0:'1',1:'1',2:'2',3:'3'},
);
assert.equal(twoUnique.tied, false);
assert.deepEqual(twoUnique.survivorPlayerIds, [2,3]);
assert.deepEqual(twoUnique.eliminatedPlayerIds, [0,1]);
assert.deepEqual(twoUnique.counts, {'1':2,'2':1,'3':1});

const oneUnique = resolveSoloBuoyRound(
  [0,1,2,3],
  {0:'1',1:'1',2:'1',3:'2'},
);
assert.equal(oneUnique.tied, false);
assert.deepEqual(oneUnique.survivorPlayerIds, [3]);
assert.deepEqual(oneUnique.eliminatedPlayerIds, [0,1,2]);

const nobodyUnique = resolveSoloBuoyRound(
  [0,1,2,3],
  {0:'1',1:'1',2:'2',3:'2'},
);
assert.equal(nobodyUnique.tied, true);
assert.deepEqual(nobodyUnique.survivorPlayerIds, [0,1,2,3]);
assert.deepEqual(nobodyUnique.eliminatedPlayerIds, []);

const everybodyUnique = resolveSoloBuoyRound(
  [0,1,2],
  {0:'1',1:'2',2:'3'},
);
assert.equal(everybodyUnique.tied, true);
assert.deepEqual(everybodyUnique.survivorPlayerIds, [0,1,2]);

const payoutType=miniGameRewardType059('solo_buoy','MINIGAME_SLOT_03');
assert.equal(payoutType,'solo_buoy@MINIGAME_SLOT_03');
assert.equal(isMiniGameRewardType(payoutType),true);
assert.deepEqual(
  [1,2,3,4].map(rank=>miniGameRewardForRank(payoutType,rank)),
  [20,15,10,5],
);

const board: BoardDefinition = {
  id:'solo-buoy-0712',
  name:'Solo Buoy authority fixture',
  startNodeId:0,
  nodes:[
    {id:0,x:0,y:0,type:'normal'},
    {id:1,x:10,y:0,type:'normal',feature:'minigame',contentId:'MINIGAME_SLOT_03'},
  ],
  edges:[{from:0,to:1,route:'main'}],
};
const authority=createEmptyHostAuthority(
  {boardId:board.id,startNodeId:0,playerNames:['P1','P2','P3','P4'],seed:7121},
  {board,cards:[],news:[]},
);
const roll=submitClientIntent(authority,{
  intentId:'solo-buoy-roll',clientId:'test',actorId:0,type:'roll',
  observedCommandSeq:hostAuthorityCommandSeq(authority),data:{},
});
assert.equal(roll.status,'accepted');
const sourceEvent=authority.state.eventLog.find(e=>e.type==='minigame_tile');
assert(sourceEvent);
const payout=submitClientIntent(authority,{
  intentId:'solo-buoy-payout',clientId:'host-system',
  actorId:authority.state.players[authority.state.turn.currentPlayerIndex]!.id,
  type:'resolve_minigame',observedCommandSeq:hostAuthorityCommandSeq(authority),
  data:{sourceEventSeq:sourceEvent.seq,gameType:payoutType,rankingPlayerIds:'0,1,2,3'},
});
assert.equal(payout.status,'accepted');
assert.deepEqual(authority.state.players.map(p=>p.money),[220,215,210,205]);

const overlay=await readFile('src/ui/MiniGameOverlay.ts','utf8');
assert.match(overlay,/resolveSoloBuoyRound/);
assert.match(overlay,/PHAO 1/);
assert.match(overlay,/PHAO 2/);
assert.match(overlay,/PHAO 3/);
assert.match(overlay,/chỉ phao có đúng 1 người mới nổi/);
assert.doesNotMatch(overlay,/Math\.random/);

console.log('[minigame-solo-buoy-0712] PASS M26 PHAO ĐƠN unique-choice elimination + retained HOST payout authority');
