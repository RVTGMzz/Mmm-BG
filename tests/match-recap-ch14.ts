import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { appendMatchEvent, createInitialMatchState, serializeMatchState } from '../src/core/matchState';
import { buildMatchRecapCh14 } from '../src/core/matchRecapCh14';

const match=createInitialMatchState({
  boardId:'city', startNodeId:0, playerNames:['An','Bình','Chi','Duy'], seed:140014,
  characterIds:['starter-crybaby','starter-grumpy','starter-anxious','starter-hyper'],
});
match.players[0]!.money=380; match.players[0]!.jobId='JOB_DOCTOR'; match.players[0]!.jobLevel=2; match.players[0]!.jobStatus='employed';
match.players[1]!.money=240;
match.players[2]!.money=155;
match.players[3]!.money=205;

appendMatchEvent(match,'job_selected',{jobId:'JOB_DOCTOR',jobTitle:'Bác sĩ',jobIcon:'🩺'},0);
appendMatchEvent(match,'minigame_tile',{contentId:'MINIGAME_SLOT_02',title:'MINI GAME • KÈO ALL-IN',affectedPlayerIds:'0,1,2,3'},0);
appendMatchEvent(match,'minigame_reward',{sourceEventSeq:2,rank:1,amount:35},0);
appendMatchEvent(match,'minigame_reward',{sourceEventSeq:2,rank:2,amount:10},1);
appendMatchEvent(match,'card_play',{title:'Ví Ai Nấy Lo',targetId:2,affectedPlayerIds:'2'},1);
appendMatchEvent(match,'news',{title:'Phí Thành Phố',affectedPlayerIds:'0,1,2,3'},2);
appendMatchEvent(match,'special_hold',{location:'hospital',affectedPlayerIds:'2'},2);
appendMatchEvent(match,'lottery',{amount:80,affectedPlayerIds:'3'},3);
appendMatchEvent(match,'character_passive',{title:'ĐƯỢC DỖ',amount:10,affectedPlayerIds:'0'},0);
appendMatchEvent(match,'ready_pass',{salaryAmount:110,resultMoney:380,finishLocked:true},0);

const before=serializeMatchState(match);
const recap=buildMatchRecapCh14(match);
assert.equal(serializeMatchState(match),before,'CH-14 recap must be a pure read of authoritative MatchState');
assert.equal(recap.players.length,4);
const p1=recap.players[0]!;
assert.equal(p1.jobLabel,'🩺 Bác sĩ');
assert.equal(p1.characterLabel,'KHÓC NHÈ');
assert.equal(p1.miniGameWins,1);
assert.equal(p1.passiveActivations,1);
assert.equal(p1.salaryAmount,110);
assert.equal(p1.award,'💰 ĐẠI GIA');
const p3=recap.players[2]!;
assert.equal(p3.cardsTargeted,1);
assert.equal(p3.newsAffected,1);
assert.equal(p3.hospitalEntries,1);
assert.match(p3.award,/BỆNH VIỆN/u);
assert.ok(recap.moments.length >= 5 && recap.moments.length <= 8);
assert.ok(recap.moments.some((entry)=>entry.text.includes('KÈO ALL-IN')));
assert.ok(recap.moments.some((entry)=>entry.text.includes('Xổ số')));

const scene=await readFile('src/scenes/CareerMinigameBoardScene07044.ts','utf8');
const overlay=await readFile('src/ui/matchRecapOverlayCh14.ts','utf8');
const controller=await readFile('src/ui/steamDeckController070424.ts','utf8');
assert.match(scene,/installMatchRecapCh14/);
assert.match(scene,/XEM TỔNG KẾT/);
assert.match(scene,/showMatchRecapCh14/);
assert.match(overlay,/match-recap-ch14/);
assert.match(overlay,/VÁN NÀY ĐÃ XẢY RA GÌ/u);
assert.match(controller,/match-recap-ch14/);
assert.doesNotMatch(overlay,/Math\.random/);
assert.doesNotMatch(scene,/Math\.random/);
assert.doesNotMatch(overlay,/\.money\s*[+\-*/]?=/);
console.log('[match-recap-ch14] PASS authoritative read-only recap + awards + moments + result trigger');
