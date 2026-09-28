import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { createEmptyHostAuthority, hostAuthorityCommandSeq, submitClientIntent } from '../src/core/authority';
import type { CardDefinition } from '../src/core/cards';
import { expectedMiniGameRewardType059 } from '../src/core/minigameRewards';
import { runFullMatchSimulation0611 } from '../src/core/playtestSimulation0611';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';

const BOARD=boardJson as BoardDefinition;
const CARDS=cardsJson as CardDefinition[];
const NEWS=newsJson as NewsDefinition[];
const runtime={board:BOARD,cards:CARDS,news:NEWS};

assert.equal(expectedMiniGameRewardType059('MINIGAME_SLOT_01',4),'majority_minority@MINIGAME_SLOT_01');
assert.equal(expectedMiniGameRewardType059('MINIGAME_SLOT_02',4),'three_doors@MINIGAME_SLOT_02');
assert.equal(expectedMiniGameRewardType059('MINIGAME_SLOT_03',4),'solo_buoy@MINIGAME_SLOT_03');
assert.equal(expectedMiniGameRewardType059('MINIGAME_SLOT_04',4),'cut_top_dice@MINIGAME_SLOT_04');
assert.equal(expectedMiniGameRewardType059('MINIGAME_SLOT_05',4),'final_sprint@MINIGAME_SLOT_05');
for(const id of ['MINIGAME_SLOT_01','MINIGAME_SLOT_02','MINIGAME_SLOT_03','MINIGAME_SLOT_04','MINIGAME_SLOT_05']) assert.equal(expectedMiniGameRewardType059(id,2),`rps@${id}`);

const m44Board:BoardDefinition={id:'audit-m44',name:'M44 authority audit',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'normal',feature:'minigame',contentId:'MINIGAME_SLOT_05'}],edges:[{from:0,to:1,route:'main'}]};
const authority=createEmptyHostAuthority({boardId:m44Board.id,startNodeId:0,playerNames:['P1','P2','P3','P4'],seed:71544,targetLaps:2},{board:m44Board,cards:[],news:[]});
assert(authority.state.players.every((player)=>player.targetLaps===2),'replay must restore targetLaps from source snapshot');
const roll=submitClientIntent(authority,{intentId:'audit-roll',clientId:'audit',actorId:0,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(authority),data:{}}); assert.equal(roll.status,'accepted');
const source=authority.state.eventLog.find((event)=>event.type==='minigame_tile'); assert(source);
assert.equal(source.data.contentId,'MINIGAME_SLOT_05'); assert.match(String(source.data.title),/NƯỚC RÚT CUỐI VÒNG/); assert.match(String(source.data.description),/3 chặng/i); assert.doesNotMatch(String(source.data.description),/Nhiều ra ít bị/i);
const wrong=submitClientIntent(authority,{intentId:'audit-wrong-mini',clientId:'host-system',actorId:authority.state.players[authority.state.turn.currentPlayerIndex]!.id,type:'resolve_minigame',observedCommandSeq:hostAuthorityCommandSeq(authority),data:{sourceEventSeq:source.seq,gameType:'majority_minority@MINIGAME_SLOT_05',rankingPlayerIds:'0,1,2,3'}}); assert.equal(wrong.status,'rejected'); assert.match(wrong.reason??'',/expects final_sprint@MINIGAME_SLOT_05/);
const right=submitClientIntent(authority,{intentId:'audit-right-mini',clientId:'host-system',actorId:authority.state.players[authority.state.turn.currentPlayerIndex]!.id,type:'resolve_minigame',observedCommandSeq:hostAuthorityCommandSeq(authority),data:{sourceEventSeq:source.seq,gameType:'final_sprint@MINIGAME_SLOT_05',rankingPlayerIds:'0,1,2,3'}}); assert.equal(right.status,'accepted'); assert.deepEqual(authority.state.players.map((p)=>p.money),[225,215,205,205]);

const seeds=Array.from({length:8},(_,i)=>715100+i);
const runs=seeds.map((seed)=>runFullMatchSimulation0611(runtime,seed,['CPU 1','CPU 2','CPU 3','CPU 4'],3200,2));
for(const run of runs){
  assert.equal(run.report.finishOrderPlayerIds.length,4,`seed ${run.seed} did not finish 2 laps`);
  assert(run.report.players.every((player)=>player.lapsCompleted===2),`seed ${run.seed} lost targetLaps during replay`);
  assert.equal(run.report.readyPasses,8,`seed ${run.seed} should record 4 players × 2 Ready passes`);
  assert.equal(run.report.boardShuffles,2,`seed ${run.seed} should shuffle once per lap index`);
  assert.deepEqual(run.report.boardShuffleLaps,[1,2]);
  assert(run.report.miniGameRewardTypes.every((type)=>/@MINIGAME_SLOT_0[1-5]$/.test(type)),`seed ${run.seed} has unscoped Mini Game payout`);
  assert(run.submittedCommands<3200,`seed ${run.seed} hit audit safety ceiling`);
}
const content=new Set(runs.flatMap((run)=>run.report.miniGameContentIds));
for(const id of ['MINIGAME_SLOT_01','MINIGAME_SLOT_02','MINIGAME_SLOT_03','MINIGAME_SLOT_04','MINIGAME_SLOT_05']) assert(content.has(id),`2-lap audit batch never exercised ${id}`);
assert(runs.some((run)=>run.report.cardsPlayed>0),'audit must exercise Card play');
assert(runs.some((run)=>run.report.newsTriggered>0),'audit must exercise News');
assert(runs.some((run)=>run.report.jobsSelected>0),'audit must exercise Job');
assert(runs.some((run)=>run.report.lotteryCount>0),'audit must exercise Lottery');
assert(runs.some((run)=>run.report.releaseRolls>0),'audit must exercise Jail/Hospital release');
const repeat=runFullMatchSimulation0611(runtime,seeds[0]!,['CPU 1','CPU 2','CPU 3','CPU 4'],3200,2); assert.deepEqual(repeat.report,runs[0]!.report,'2-lap audit must remain deterministic');
console.log(`[full-match-audit-0715] PASS matches=${runs.length} twoLapShuffle=1,2 miniContent=${[...content].sort().join(',')}`);
