import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { MINI_GAME_SLOTS_059 } from '../src/core/miniGameSlots059';
import { minigameModeForActivePlayers, resolveFinalSprint } from '../src/core/minigames';
import { isMiniGameRewardType, miniGameRewardForRank, miniGameRewardType059 } from '../src/core/minigameRewards';
const slot=MINI_GAME_SLOTS_059.find(entry=>entry.contentId==='MINIGAME_SLOT_05'); assert(slot); assert.equal(slot.mode3Plus,'final_sprint'); assert.match(slot.description,/3 chặng/i); assert.match(slot.description,/REROLL/i);
assert.equal(minigameModeForActivePlayers([0,1],'final_sprint'),'rps'); assert.equal(minigameModeForActivePlayers([0,1,2,3],'final_sprint'),'final_sprint');
const clean=resolveFinalSprint([0,1,2,3],{0:[6,5,4],1:[5,4,4],2:[3,3,3],3:[1,2,2]},2); assert.equal(clean.complete,true); assert.deepEqual(clean.lockedPlayerIds,[0,1]); assert.deepEqual(clean.lowerPlayerIds,[2,3]); assert.deepEqual(clean.totals,{0:15,1:13,2:9,3:5});
const boundary=resolveFinalSprint([0,1,2,3],{0:[6,6,6],1:[5,4,3],2:[4,4,4],3:[2,2,2]},2); assert.equal(boundary.complete,false); assert.deepEqual(boundary.lockedPlayerIds,[0]); assert.deepEqual(boundary.overtimePlayerIds,[1,2]); assert.equal(boundary.slotsOpen,1);
const allTie=resolveFinalSprint([0,1,2,3],{0:[3,3,3],1:[3,3,3],2:[3,3,3],3:[3,3,3]},2); assert.deepEqual(allTie.overtimePlayerIds,[0,1,2,3]); assert.equal(allTie.slotsOpen,2);
assert.throws(()=>resolveFinalSprint([0,1,2],{0:[6,6],1:[5,5,5],2:[4,4,4]},2),/exactly three D6/);
const payoutType=miniGameRewardType059('final_sprint','MINIGAME_SLOT_05'); assert.equal(isMiniGameRewardType(payoutType),true); assert.deepEqual([1,2,3,4].map(rank=>miniGameRewardForRank(payoutType,rank)),[25,15,5,5]);
const overlay=await readFile('src/ui/MiniGameOverlay.ts','utf8');
assert.match(overlay,/ĐUA 3 CHẶNG/);
assert.match(overlay,/finalSprintReroll/);
assert.match(overlay,/GIỮ 🎲/);
assert.match(overlay,/REROLL/);
const sprintBlock=overlay.slice(
  overlay.indexOf("baseType === 'final_sprint'"),
  overlay.indexOf("baseType === 'cut_top_dice'", overlay.indexOf("baseType === 'final_sprint'")),
);
assert.match(sprintBlock,/rankTiedIdsByDiceLowToHigh/);
assert.doesNotMatch(sprintBlock,/runRpsFinal/);
assert.doesNotMatch(overlay,/Math\.random/);
console.log('[minigame-final-sprint-0714] PASS M44 one-reroll strategy + total-score ranking');
