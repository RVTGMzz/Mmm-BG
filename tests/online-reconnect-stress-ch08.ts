import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { MEMEME_ONLINE_BASE_URL } from '../src/core/onlineTransport0702';

type Json = Record<string, unknown>;
const BASE=(process.env.MEMEME_ONLINE_BASE_URL?.trim()||MEMEME_ONLINE_BASE_URL).replace(/\/+$/,'');
const TIMEOUT=10_000;

async function request(path:string, init:RequestInit={}):Promise<{status:number,body:Json}>{
  const response=await fetch(BASE+path,{
    ...init,
    headers:{'Content-Type':'application/json',...(init.headers??{})},
  });
  const body=await response.json().catch(()=>({})) as Json;
  return {status:response.status,body};
}
async function ok(path:string,init:RequestInit={}):Promise<Json>{
  const result=await request(path,init);
  assert(result.status>=200&&result.status<300,`${init.method??'GET'} ${path} -> ${result.status}: ${JSON.stringify(result.body)}`);
  return result.body;
}
function wsUrl(roomCode:string,role:'host'|'client',clientId:string,seatId:number,token:{hostToken?:string,reconnectToken?:string}):string{
  const url=new URL(BASE);
  url.protocol=url.protocol==='https:'?'wss:':'ws:';
  url.pathname=`/api/rooms/${roomCode}/ws`;
  url.search='';
  url.searchParams.set('role',role);
  url.searchParams.set('clientId',clientId);
  url.searchParams.set('seatId',String(seatId));
  url.searchParams.set('channel','game');
  if(token.hostToken) url.searchParams.set('hostToken',token.hostToken);
  if(token.reconnectToken) url.searchParams.set('reconnectToken',token.reconnectToken);
  return url.toString();
}
type Waiter={predicate:(value:Json)=>boolean;resolve:(value:Json)=>void;reject:(reason:unknown)=>void;timer:ReturnType<typeof setTimeout>};
class Probe{
  readonly socket:WebSocket;
  readonly queue:Json[]=[];
  readonly waiters=new Set<Waiter>();
  private constructor(socket:WebSocket){
    this.socket=socket;
    socket.addEventListener('message',(event)=>{
      let value:Json;
      try{value=JSON.parse(typeof event.data==='string'?event.data:String(event.data)) as Json;}catch{return;}
      for(const waiter of [...this.waiters]){
        if(!waiter.predicate(value)) continue;
        clearTimeout(waiter.timer); this.waiters.delete(waiter); waiter.resolve(value); return;
      }
      this.queue.push(value);
    });
  }
  static async connect(url:string):Promise<Probe>{
    const socket=new WebSocket(url); const probe=new Probe(socket);
    await new Promise<void>((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('open timeout')),TIMEOUT);
      socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
      socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('open failed'));},{once:true});
    });
    return probe;
  }
  send(payload:Json,to?:string):void{this.socket.send(JSON.stringify({to,payload}));}
  async waitFor(predicate:(value:Json)=>boolean,label:string,timeout=TIMEOUT):Promise<Json>{
    const index=this.queue.findIndex(predicate);
    if(index>=0) return this.queue.splice(index,1)[0]!;
    return new Promise<Json>((resolve,reject)=>{
      const waiter:Waiter={predicate,resolve,reject,timer:setTimeout(()=>{this.waiters.delete(waiter);reject(new Error('timeout '+label));},timeout)};
      this.waiters.add(waiter);
    });
  }
  waitClose(label:string,timeout=TIMEOUT):Promise<{code:number;reason:string}>{
    if(this.socket.readyState===WebSocket.CLOSED) return Promise.resolve({code:1000,reason:'already closed'});
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('timeout '+label)),timeout);
      this.socket.addEventListener('close',(event)=>{clearTimeout(timer);resolve({code:event.code,reason:event.reason});},{once:true});
    });
  }
  close():void{try{this.socket.close(1000,'CH08 done');}catch{}}
}

const workerSource=readFileSync('cloudflare/mememe-online/src/index.ts','utf8');
assert.match(workerSource,/newestReplacedJoinedAt070421/);
assert.match(workerSource,/socket\.close\(4001, "Replaced by reconnect\."\)/);
assert.match(workerSource,/logicalSockets070421/);
assert.match(workerSource,/currentSender070421/);
assert.match(workerSource,/reconnect_token_invalid/);
assert.match(workerSource,/duplicate_device_active/);

let room='';
let hostToken='';
let reconnectToken='';
let clientId='';
let seat=-1;
const device='ch08-'+randomUUID();
const sockets:Probe[]=[];
try{
  const created=await ok('/api/rooms',{method:'POST',body:JSON.stringify({
    hostName:'CH08 Host',deviceId:'host-'+device,settings:{cameraAllowed:false,voiceAllowed:false,cpuFill:true},
  })});
  room=String(created.roomCode??''); hostToken=String(created.hostToken??'');
  assert.match(room,/^[A-Z0-9]{4,8}$/); assert(hostToken.length>20);

  clientId='ch08-p2-'+randomUUID().replaceAll('-','').slice(0,10);
  const joined=await ok(`/api/rooms/${room}/join`,{method:'POST',body:JSON.stringify({
    clientId,displayName:'CH08 P2',reconnectToken:'',deviceId:device,
  })});
  seat=Number(joined.seatId); reconnectToken=String(joined.reconnectToken??'');
  assert.equal(seat,1); assert(reconnectToken.length>20);

  // Wrong token must never reclaim the existing identity.
  const badToken=await request(`/api/rooms/${room}/join`,{method:'POST',body:JSON.stringify({
    clientId,displayName:'Thief',reconnectToken:'wrong-'+randomUUID(),deviceId:device,
  })});
  assert.equal(badToken.status,403); assert.equal(badToken.body.error,'reconnect_token_invalid');

  // A different fresh device cannot steal an active identity even with the correct token.
  const otherDevice=await request(`/api/rooms/${room}/join`,{method:'POST',body:JSON.stringify({
    clientId,displayName:'CH08 P2 other device',reconnectToken,deviceId:'other-'+device,
  })});
  assert.equal(otherDevice.status,409); assert.equal(otherDevice.body.error,'duplicate_device_active');

  await ok(`/api/rooms/${room}/ready`,{method:'POST',body:JSON.stringify({clientId:'host',hostToken,ready:true})});
  await ok(`/api/rooms/${room}/ready`,{method:'POST',body:JSON.stringify({clientId,reconnectToken,ready:true})});
  const started=await ok(`/api/rooms/${room}/start`,{method:'POST',body:JSON.stringify({hostToken})});
  assert.equal(started.started,true);

  // New identities cannot enter after Start.
  const late=await request(`/api/rooms/${room}/join`,{method:'POST',body:JSON.stringify({
    clientId:'late-'+randomUUID(),displayName:'Late',reconnectToken:'',deviceId:'late-'+device,
  })});
  assert.equal(late.status,409); assert.equal(late.body.error,'match_already_started');

  const host=await Probe.connect(wsUrl(room,'host','host',0,{hostToken})); sockets.push(host);
  await host.waitFor(m=>m.kind==='relay_ready','host relay_ready');

  let current=await Probe.connect(wsUrl(room,'client',clientId,seat,{reconnectToken})); sockets.push(current);
  await current.waitFor(m=>m.kind==='relay_ready','initial client relay_ready');

  for(let cycle=1;cycle<=5;cycle+=1){
    // HTTP reclaim must remain idempotent and preserve seat/token.
    const reclaim=await ok(`/api/rooms/${room}/join`,{method:'POST',body:JSON.stringify({
      clientId,displayName:'CH08 P2',reconnectToken,deviceId:device,
    })});
    assert.equal(Number(reclaim.seatId),seat,`cycle ${cycle}: seat changed`);
    assert.equal(String(reclaim.reconnectToken),reconnectToken,`cycle ${cycle}: token changed`);

    const old=current;
    current=await Probe.connect(wsUrl(room,'client',clientId,seat,{reconnectToken})); sockets.push(current);
    await current.waitFor(m=>m.kind==='relay_ready',`cycle ${cycle} relay_ready`);

    // Cloudflare hibernation may delay the physical close event of the superseded
    // socket. The actual authority invariant is stronger: an obsolete logical
    // endpoint must never relay another gameplay message after its replacement.
    const obsolete='ch08-obsolete-'+cycle+'-'+randomUUID();
    if(old.socket.readyState===WebSocket.OPEN){
      try{old.send({kind:'ch08_obsolete_socket',cycle,nonce:obsolete},'host');}catch{}
    }
    await new Promise((resolve)=>setTimeout(resolve,700));
    assert.equal(
      host.queue.some(m=>m.from===clientId&&(m.payload as Json|undefined)?.nonce===obsolete),
      false,
      `cycle ${cycle}: obsolete socket leaked a relay after replacement`,
    );

    const c2h='ch08-c2h-'+cycle+'-'+randomUUID();
    current.send({kind:'ch08_client_to_host',cycle,nonce:c2h},'host');
    await host.waitFor(m=>m.from===clientId&&(m.payload as Json|undefined)?.nonce===c2h,`cycle ${cycle} client->host`);

    const h2c='ch08-h2c-'+cycle+'-'+randomUUID();
    host.send({kind:'ch08_host_to_client',cycle,nonce:h2c},clientId);
    await current.waitFor(m=>m.from==='host'&&(m.payload as Json|undefined)?.nonce===h2c,`cycle ${cycle} host->client`);
  }

  const status=await ok(`/api/rooms/${room}/status`);
  const lobby=(status.lobby??status) as Json;
  const players=Array.isArray(lobby.players)?lobby.players as Json[]:[];
  assert.equal(players.filter(p=>String(p.clientId)===clientId).length,1,'reconnect stress created duplicate P2 lobby records');
  const p2=players.find(p=>String(p.clientId)===clientId);
  assert(p2); assert.equal(Number(p2.seatId),seat);

  console.log(`[online-reconnect-stress-ch08] PASS room=${room} cycles=5 seat=P${seat+1} invalid-token + duplicate-device + post-start-lock + obsolete-socket suppression + bidirectional relay + no ghost seat`);
}finally{
  for(const socket of sockets) socket.close();
  if(room&&hostToken){
    await fetch(BASE+`/api/rooms/${room}/close`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hostToken,reason:'host_left'})}).catch(()=>undefined);
  }
}
