import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import { createEmptyHostAuthority, hostAuthorityCommandSeq, submitClientIntent, type ClientIntent } from '../src/core/authority';
import { getOutgoingEdges, pickParityEdge } from '../src/core/board';
import type { CardDefinition } from '../src/core/cards';
import type { NewsDefinition } from '../src/core/news';
import type { BoardDefinition } from '../src/core/types';
import { CANONICAL_PRESENTATION_0561 } from '../src/ui/canonicalPresentation0561';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];
const junctions = BOARD.nodes.filter((node) => getOutgoingEdges(BOARD, node.id).length > 1);
assert.equal(junctions.length, 3, 'Draft D must retain exactly three luck junctions.');
for (const junction of junctions) {
  const outgoing = getOutgoingEdges(BOARD, junction.id);
  for (const roll of [1,3,5]) assert(getOutgoingEdges(BOARD, junction.id).find((edge) => edge.to === pickParityEdge(outgoing, roll)?.to)?.label?.includes('TRÁI'));
  for (const roll of [2,4,6]) assert(getOutgoingEdges(BOARD, junction.id).find((edge) => edge.to === pickParityEdge(outgoing, roll)?.to)?.label?.includes('PHẢI'));
}
const parityFixture: BoardDefinition = {
  id:'parity-junction-062', name:'0.1.62 immediate parity junction fixture', startNodeId:0,
  nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:-20,y:20,type:'normal'},{id:2,x:20,y:20,type:'normal'},{id:3,x:0,y:40,type:'normal'},{id:4,x:0,y:60,type:'normal'}],
  edges:[{from:0,to:1,route:'branch',label:'← TRÁI · TEST'},{from:0,to:2,route:'main',label:'PHẢI → · TEST'},{from:1,to:3,route:'merge'},{from:2,to:3,route:'merge'},{from:3,to:4,route:'main'},{from:4,to:0,route:'main'}],
};
const fixtureRuntime = { board: parityFixture, cards: CARDS, news: NEWS };
const fixtureEdges = getOutgoingEdges(parityFixture, 0);
const observed = new Map<string,{seed:number;to:number;hostSeq:number}>();
for (let seed=620000; seed<621024 && observed.size<2; seed+=1) {
  const authority=createEmptyHostAuthority({boardId:parityFixture.id,startNodeId:0,playerNames:['P1','P2'],seed},fixtureRuntime);
  const actor=authority.state.players[authority.state.turn.currentPlayerIndex]!;
  const intent:ClientIntent={intentId:`branch-062-${seed}`,clientId:'branch-062-test',actorId:actor.id,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(authority),data:{}};
  const result=submitClientIntent(authority,intent); assert.equal(result.status,'accepted'); assert.notEqual(authority.state.turn.phase,'BRANCH_CHOICE');
  const auto=authority.source.commandLog.find((command)=>command.type==='choose_branch'&&command.data.automatic===true); assert(auto);
  const parity=String(auto.data.parity); assert(parity==='odd'||parity==='even'); assert(hostAuthorityCommandSeq(authority)>=2); assert.equal(result.hostCommandSeq,hostAuthorityCommandSeq(authority));
  observed.set(parity,{seed,to:Number(auto.data.to),hostSeq:hostAuthorityCommandSeq(authority)});
}
assert(observed.has('odd')); assert(observed.has('even'));
assert(fixtureEdges.find((edge)=>edge.to===observed.get('odd')!.to)?.label?.includes('TRÁI'));
assert(fixtureEdges.find((edge)=>edge.to===observed.get('even')!.to)?.label?.includes('PHẢI'));

const mainSource=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const scene062Source=readFileSync(new URL('../src/scenes/CareerMinigameBoardScene062.ts',import.meta.url),'utf8');
const scene063Source=readFileSync(new URL('../src/scenes/CareerMinigameBoardScene063.ts',import.meta.url),'utf8');
const scene069Source=readFileSync(new URL('../src/scenes/CareerMinigameBoardScene069.ts',import.meta.url),'utf8');
const scene0701Source=readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0701.ts',import.meta.url),'utf8');
const authoritySource=readFileSync(new URL('../src/core/authority.ts',import.meta.url),'utf8');
assert(mainSource.includes('CareerMinigameBoardScene0701 as ActiveBoardScene'));
assert(scene0701Source.includes('extends CareerMinigameBoardScene069'));
assert(!scene0701Source.includes('Math.random'));
assert(scene069Source.includes('extends CareerMinigameBoardScene0682')); assert(!scene069Source.includes('Math.random')); assert(!scene069Source.includes('submitIntent('));
assert(scene063Source.includes('extends CareerMinigameBoardScene062')); assert(scene062Source.includes('extends CareerMinigameBoardScene061'));
assert(scene062Source.includes('this.add.circle')); assert(scene062Source.includes('body.destroy()')); assert(scene062Source.includes('return 23')); assert(scene062Source.includes('LẺ ← TRÁI • CHẴN → PHẢI')); assert(!scene062Source.includes('showBranchPicker'));
assert(CANONICAL_PRESENTATION_0561.normalFollowZoom>=2.1); assert.equal(CANONICAL_PRESENTATION_0561.overviewZoom,0.88);
assert(authoritySource.includes('autoResolveParityBranches062')); assert(!authoritySource.includes('Math.random'));
console.log(`[random-branch-round-tiles-062] PASS retained under 0.1.70.1 oddSeed=${observed.get('odd')!.seed} evenSeed=${observed.get('even')!.seed}`);