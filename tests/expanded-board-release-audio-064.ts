import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SFX_GAIN_064 } from '../src/audio/sfxController';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import { createEmptyHostAuthority, hostAuthorityCommandSeq, submitClientIntent, type HostAuthority } from '../src/core/authority';
import { specialCorridorPath064, specialReleasePath057 } from '../src/core/specialLocations057';
import type { BoardDefinition, BoardNode } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const scene064 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene064.ts', import.meta.url), 'utf8');
const scene065 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene065.ts', import.meta.url), 'utf8');
const scene069 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene069.ts', import.meta.url), 'utf8');
const camera0632 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene0632.ts', import.meta.url), 'utf8');
assert(mainSource.includes('CareerMinigameBoardScene069 as ActiveBoardScene'));
assert(scene069.includes('extends CareerMinigameBoardScene0682')); assert(!scene069.includes('Math.random')); assert(!scene069.includes('submitIntent('));
assert(scene065.includes('extends CareerMinigameBoardScene064'));
assert(scene064.includes('extends CareerMinigameBoardScene0634'));
assert(scene064.includes('TILE_SCALE_064 = 1.5')); assert(scene064.includes('OVERVIEW_ZOOM_064 = 0.46')); assert(scene064.includes('movementStepDisposition'));
assert(camera0632.includes('resolveCameraActor0632')); assert(camera0632.includes('centerOn(token.x, token.y)'));

const xs=BOARD.nodes.map((node)=>node.x), ys=BOARD.nodes.map((node)=>node.y);
assert(Math.max(...xs)-Math.min(...xs)>=2300); assert(Math.max(...ys)-Math.min(...ys)>=1000);
function radius064(node:BoardNode):number { const contentId=node.contentId??''; if(contentId==='SPECIAL_JAIL_HOLD'||contentId==='SPECIAL_HOSPITAL_HOLD')return 36*1.5; if(node.type==='ready'||contentId==='SPECIAL_JAIL_GATE'||contentId==='SPECIAL_HOSPITAL_GATE'||contentId==='SPECIAL_LOTTERY')return 33*1.5; if(node.feature)return 31*1.5; return 27*1.5; }
let minimumGap=Number.POSITIVE_INFINITY, minimumPair='';
for(let i=0;i<BOARD.nodes.length;i+=1){const a=BOARD.nodes[i]!;for(let j=i+1;j<BOARD.nodes.length;j+=1){const b=BOARD.nodes[j]!;const gap=Math.hypot(a.x-b.x,a.y-b.y)-radius064(a)-radius064(b);if(gap<minimumGap){minimumGap=gap;minimumPair=`${a.id}/${b.id}`;}}}
assert(minimumGap>=12,`closest ${minimumPair} gap=${minimumGap.toFixed(1)}px`);
for(const id of [101,102,103,111,112,113]){const node=BOARD.nodes.find((entry)=>entry.id===id);assert(node);assert.equal(node.type,'money');assert.equal(node.value,-20);}
assert.deepEqual(specialReleasePath057('jail'),[]); assert.deepEqual(specialReleasePath057('hospital'),[]); assert.deepEqual(specialCorridorPath064('jail'),[101,102,103,12]); assert.deepEqual(specialCorridorPath064('hospital'),[111,112,113,34]);

const releaseFixture:BoardDefinition={id:'release-064-fixture',name:'0.1.64 release-in-place fixture',startNodeId:0,nodes:[{id:0,x:0,y:0,type:'normal'},{id:1,x:10,y:0,type:'normal',contentId:'SPECIAL_JAIL_GATE'},{id:100,x:20,y:0,type:'normal',contentId:'SPECIAL_JAIL_HOLD'},{id:101,x:30,y:0,type:'money',contentId:'JAIL_EXIT_1',value:-20},{id:102,x:40,y:0,type:'money',contentId:'JAIL_EXIT_2',value:-20},{id:103,x:50,y:0,type:'money',contentId:'JAIL_EXIT_3',value:-20},{id:12,x:60,y:0,type:'normal'}],edges:[{from:0,to:1,route:'main'},{from:100,to:101,route:'branch'},{from:101,to:102,route:'branch'},{from:102,to:103,route:'branch'},{from:103,to:12,route:'branch'}]};
let serial=0;function roll(authority:HostAuthority){const actor=authority.state.players[authority.state.turn.currentPlayerIndex]!;serial+=1;return submitClientIntent(authority,{intentId:`release-064-${serial}`,clientId:'release-064-test',actorId:actor.id,type:'roll',observedCommandSeq:hostAuthorityCommandSeq(authority),data:{}});}
const authority=createEmptyHostAuthority({boardId:releaseFixture.id,startNodeId:0,playerNames:['Ron'],seed:2},{board:releaseFixture,cards:[],news:[]});
assert.equal(roll(authority).status,'accepted'); assert.equal(authority.state.players[0]!.nodeId,100); assert.equal(authority.state.players[0]!.specialHold,'jail'); assert.equal(authority.state.players[0]!.money,200);
assert.equal(roll(authority).status,'accepted'); assert.equal(authority.state.players[0]!.nodeId,100); assert.equal(authority.state.players[0]!.specialHold,undefined); assert.equal(authority.state.players[0]!.money,200); assert.equal(authority.state.turn.phase,'PRE_ROLL_ACTION'); assert.equal(authority.state.turn.lastRoll,null);
assert.equal(roll(authority).status,'accepted'); assert.equal(authority.state.players[0]!.nodeId,101); assert.equal(authority.state.players[0]!.money,180); assert(authority.state.eventLog.some((event)=>event.type==='money_tile'&&event.data.nodeId===101&&event.data.amount===-20));
assert.equal(SFX_GAIN_064.card_draw,0.8); assert.equal(SFX_GAIN_064.card_play,0.8); assert.equal(SFX_GAIN_064.step,1.3);
console.log(`[expanded-board-release-audio-064] PASS retained beneath 0.1.69 width=${Math.round(Math.max(...xs)-Math.min(...xs))} minGap=${minimumGap.toFixed(1)}px`);
