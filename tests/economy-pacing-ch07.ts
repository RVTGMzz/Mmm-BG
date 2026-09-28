import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import { runFullMatchSimulation0611, summarizeSimulationBatch0611 } from '../src/core/playtestSimulation0611';
import type { BoardDefinition } from '../src/core/types';

const BOARD=boardJson as BoardDefinition;
const CARDS=cardsJson as CardDefinition[];
const NEWS=newsJson as NewsDefinition[];
const runtime={board:BOARD,cards:CARDS,news:NEWS};
const names=['Cry','Grumpy','Anxious','Hyper'];
const roster=['starter-crybaby','starter-grumpy','starter-anxious','starter-hyper'];
const MATCHES=20;
const START_TOTAL=800;

function runsFor(laps:number, seedBase:number){
  return Array.from({length:MATCHES},(_,i)=>
    runFullMatchSimulation0611(runtime,seedBase+i,names,5200,laps,roster)
  );
}
function avg(values:number[]):number{
  return values.reduce((a,b)=>a+b,0)/Math.max(1,values.length);
}
function round(value:number):number{return Math.round(value*100)/100;}

const one=runsFor(1,707100);
const two=runsFor(2,707200);
const three=runsFor(3,707300);
const batches=[one,two,three];
const summaries=batches.map((runs)=>summarizeSimulationBatch0611(runs));

for(let index=0;index<batches.length;index+=1){
  const laps=index+1;
  const runs=batches[index]!;
  for(const run of runs){
    assert.equal(run.report.finishOrderPlayerIds.length,4,`seed ${run.seed}: incomplete finish order`);
    assert(run.report.players.every((p)=>p.lapsCompleted===laps),`seed ${run.seed}: wrong lap completion`);
    assert.equal(run.report.readyPasses,4*laps,`seed ${run.seed}: wrong Ready pass count`);
    assert.equal(run.report.boardShuffles,laps,`seed ${run.seed}: wrong shuffle count`);
    assert.deepEqual(run.report.boardShuffleLaps,Array.from({length:laps},(_,i)=>i+1));
    assert(run.submittedCommands<5200,`seed ${run.seed}: command runaway`);
  }
}

const avgTurns=summaries.map((s)=>s.turns.average);
const avgCommands=summaries.map((s)=>s.commands.average);
assert(avgTurns[1]!>avgTurns[0]! && avgTurns[2]!>avgTurns[1]!,'more laps must require more turns');
assert(avgCommands[1]!>avgCommands[0]! && avgCommands[2]!>avgCommands[1]!,'more laps must require more commands');
assert(avgTurns[2]!<avgTurns[0]!*4.2,`3-lap turn growth runaway: ${avgTurns.join(',')}`);
assert(avgCommands[2]!<avgCommands[0]!*4.4,`3-lap command growth runaway: ${avgCommands.join(',')}`);

const rows=batches.map((runs,index)=>{
  const laps=index+1;
  const summary=summaries[index]!;
  const moneyInflation=summary.finalMoneyTotal.average-START_TOTAL;
  return {
    laps,
    turns:summary.turns.average,
    turnsPerLap:round(summary.turns.average/laps),
    commands:summary.commands.average,
    commandsPerLap:round(summary.commands.average/laps),
    finalMoneyTotal:summary.finalMoneyTotal.average,
    inflationPerLap:round(moneyInflation/laps),
    spread:summary.finalMoneySpread.average,
    spreadPerLap:round(summary.finalMoneySpread.average/laps),
    passiveEventsPerLap:round(avg(runs.map((r)=>r.report.characterPassiveEvents))/laps),
    passiveAmountPerLap:round(avg(runs.map((r)=>r.report.characterPassiveAmountTotal))/laps),
    cardsPerLap:round(summary.cardsPlayed.average/laps),
    miniPerLap:round(summary.miniGamesTriggered.average/laps),
    lotteryPerLap:round(summary.lotteryCount.average/laps),
  };
});

assert(rows.every((row)=>row.finalMoneyTotal<4000),`economy runaway: ${JSON.stringify(rows)}`);
assert(rows[2]!.inflationPerLap<rows[0]!.inflationPerLap*2.2+80,`3-lap inflation/lap runaway: ${JSON.stringify(rows)}`);
assert(rows[2]!.spreadPerLap<rows[0]!.spreadPerLap*2.5+60,`3-lap spread/lap runaway: ${JSON.stringify(rows)}`);
assert(rows.every((row)=>row.passiveAmountPerLap<90),`passive economy/lap runaway: ${JSON.stringify(rows)}`);

const repeat=runFullMatchSimulation0611(runtime,707300,names,5200,3,roster);
assert.deepEqual(repeat.report,three[0]!.report,'3-lap Character match must remain deterministic');

console.log('[economy-pacing-ch07] PASS '+JSON.stringify(rows));
