import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MEMEME_ONLINE_BASE_URL } from '../src/core/onlineTransport0702';

type Json = Record<string, unknown>;
const BASE=(process.env.MEMEME_ONLINE_BASE_URL?.trim() || MEMEME_ONLINE_BASE_URL).replace(/\/+$/,'');
const TIMEOUT_MS=10_000;

async function jsonRequest<T extends Json>(path:string, init:RequestInit={}):Promise<T>{
  const response=await fetch(BASE+path,{
    ...init,
    headers:{'Content-Type':'application/json',...(init.headers??{})},
  });
  const body=await response.json().catch(()=>({})) as T & {error?:string};
  assert.equal(response.ok,true,(init.method??'GET')+' '+path+' failed ('+response.status+'): '+(body.error??JSON.stringify(body)));
  return body;
}

function wsUrl(roomCode:string, role:'host'|'client', clientId:string, seatId:number, channel:'game'|'media', token:{hostToken?:string;reconnectToken?:string}):string{
  const url=new URL(BASE);
  url.protocol=url.protocol==='https:'?'wss:':'ws:';
  url.pathname='/api/rooms/'+roomCode+'/ws';
  url.search='';
  url.searchParams.set('role',role);
  url.searchParams.set('clientId',clientId);
  url.searchParams.set('seatId',String(seatId));
  url.searchParams.set('channel',channel);
  if(token.hostToken) url.searchParams.set('hostToken',token.hostToken);
  if(token.reconnectToken) url.searchParams.set('reconnectToken',token.reconnectToken);
  return url.toString();
}

type Waiter={predicate:(value:Json)=>boolean;resolve:(value:Json)=>void;reject:(reason:unknown)=>void;timer:ReturnType<typeof setTimeout>};

class SocketProbe {
  readonly socket:WebSocket;
  private readonly queue:Json[]=[];
  private readonly waiters=new Set<Waiter>();
  private closedInfo?:{code:number;reason:string};
  private readonly closeWaiters=new Set<(value:{code:number;reason:string})=>void>();

  private constructor(socket:WebSocket){
    this.socket=socket;
    socket.addEventListener('message',(event)=>{
      let value:Json|undefined;
      try{
        const raw=typeof event.data==='string'?event.data:event.data instanceof ArrayBuffer?new TextDecoder().decode(event.data):String(event.data);
        value=JSON.parse(raw) as Json;
      }catch{return;}
      for(const waiter of [...this.waiters]){
        if(!waiter.predicate(value)) continue;
        clearTimeout(waiter.timer); this.waiters.delete(waiter); waiter.resolve(value); return;
      }
      this.queue.push(value);
    });
    socket.addEventListener('close',(event:any)=>{
      this.closedInfo={code:Number(event.code??0),reason:String(event.reason??'')};
      for(const resolve of this.closeWaiters) resolve(this.closedInfo);
      this.closeWaiters.clear();
    });
  }

  static async connect(url:string):Promise<SocketProbe>{
    assert.equal(typeof WebSocket,'function','Node runtime must expose WebSocket.');
    const socket=new WebSocket(url);
    const probe=new SocketProbe(socket);
    await new Promise<void>((resolve,reject)=>{
      const timer=setTimeout(()=>reject(new Error('WebSocket open timeout: '+url)),TIMEOUT_MS);
      socket.addEventListener('open',()=>{clearTimeout(timer);resolve();},{once:true});
      socket.addEventListener('error',()=>{clearTimeout(timer);reject(new Error('WebSocket open failed: '+url));},{once:true});
    });
    return probe;
  }

  send(payload:Json,to?:string):void{this.socket.send(JSON.stringify({to,payload}));}

  async waitFor(predicate:(value:Json)=>boolean,label:string):Promise<Json>{
    const index=this.queue.findIndex(predicate);
    if(index>=0){const [value]=this.queue.splice(index,1);return value!;}
    return await new Promise<Json>((resolve,reject)=>{
      const waiter:Waiter={predicate,resolve,reject,timer:setTimeout(()=>{this.waiters.delete(waiter);reject(new Error('Timed out waiting for '+label));},TIMEOUT_MS)};
      this.waiters.add(waiter);
    });
  }

  async waitClosed(label:string):Promise<{code:number;reason:string}>{
    if(this.closedInfo) return this.closedInfo;
    return await new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.closeWaiters.delete(done);reject(new Error('Timed out waiting for close: '+label));},TIMEOUT_MS);
      const done=(value:{code:number;reason:string})=>{clearTimeout(timer);this.closeWaiters.delete(done);resolve(value);};
      this.closeWaiters.add(done);
    });
  }

  close():void{
    for(const waiter of this.waiters){clearTimeout(waiter.timer);waiter.reject(new Error('Socket closed.'));}
    this.waiters.clear();
    try{this.socket.close(1000,'QA done');}catch{}
  }
}

function presenceHasSingleSeat(message:Json,clientId:string,seatId:number):boolean{
  if(message.kind!=='presence') return false;
  const seats=Array.isArray(message.seats)?message.seats as Json[]:[];
  const logical=seats.filter((seat)=>seat.clientId===clientId && Number(seat.seatId)===seatId);
  return logical.length===1;
}

let roomCode='',hostToken='',clientId='',reconnectToken=''; let clientSeat=-1;
const sockets:SocketProbe[]=[];
const deviceId='stress-device-'+randomUUID();

try{
  const health=await jsonRequest<Json>('/health');
  assert.equal(health.ok,true);

  const created=await jsonRequest<Json>('/api/rooms',{method:'POST',body:JSON.stringify({
    hostName:'Stress Host',deviceId:'host-'+deviceId,settings:{cameraAllowed:true,voiceAllowed:true,cpuFill:true},
  })});
  roomCode=String(created.roomCode??''); hostToken=String(created.hostToken??'');
  assert.match(roomCode,/^[A-Z0-9]{4,8}$/); assert.ok(hostToken.length>20);

  clientId='stress-p2-'+randomUUID().replaceAll('-','').slice(0,12);
  const joined=await jsonRequest<Json>('/api/rooms/'+roomCode+'/join',{method:'POST',body:JSON.stringify({
    clientId,displayName:'Stress P2',reconnectToken:'',deviceId,
  })});
  clientSeat=Number(joined.seatId); reconnectToken=String(joined.reconnectToken??'');
  assert.equal(clientSeat,1); assert.ok(reconnectToken.length>20);

  await jsonRequest<Json>('/api/rooms/'+roomCode+'/ready',{method:'POST',body:JSON.stringify({clientId:'host',hostToken,ready:true})});
  await jsonRequest<Json>('/api/rooms/'+roomCode+'/ready',{method:'POST',body:JSON.stringify({clientId,reconnectToken,ready:true})});
  const started=await jsonRequest<Json>('/api/rooms/'+roomCode+'/start',{method:'POST',body:JSON.stringify({hostToken})});
  assert.equal(started.started,true);

  let hostGame=await SocketProbe.connect(wsUrl(roomCode,'host','host',0,'game',{hostToken}));
  let clientGame=await SocketProbe.connect(wsUrl(roomCode,'client',clientId,clientSeat,'game',{reconnectToken}));
  const hostMedia=await SocketProbe.connect(wsUrl(roomCode,'host','host',0,'media',{hostToken}));
  const clientMedia=await SocketProbe.connect(wsUrl(roomCode,'client',clientId,clientSeat,'media',{reconnectToken}));
  sockets.push(hostGame,clientGame,hostMedia,clientMedia);
  await hostGame.waitFor((m)=>m.kind==='relay_ready','host game ready');
  await clientGame.waitFor((m)=>m.kind==='relay_ready','client game ready');
  await hostMedia.waitFor((m)=>m.kind==='relay_ready','host media ready');
  await clientMedia.waitFor((m)=>m.kind==='relay_ready','client media ready');

  for(let cycle=1;cycle<=5;cycle+=1){
    const replaced=clientGame;
    const replacement=await SocketProbe.connect(wsUrl(roomCode,'client',clientId,clientSeat,'game',{reconnectToken}));
    sockets.push(replacement);
    await replacement.waitFor((m)=>m.kind==='relay_ready','client replacement ready #'+cycle);
    const closed=await replaced.waitClosed('client replaced #'+cycle);
    assert.equal(closed.code,4001,'old client socket must be replaced immediately');
    assert.match(closed.reason,/Replaced by reconnect/i);

    await replacement.waitFor((m)=>presenceHasSingleSeat(m,clientId,clientSeat),'deduped client presence #'+cycle);

    const h2c='stress-h2c-'+cycle+'-'+randomUUID();
    hostGame.send({kind:'stress_host_to_client',cycle,nonce:h2c},clientId);
    await replacement.waitFor((m)=>m.from==='host' && (m.payload as Json|undefined)?.nonce===h2c,'host -> replacement #'+cycle);

    const c2h='stress-c2h-'+cycle+'-'+randomUUID();
    replacement.send({kind:'stress_client_to_host',cycle,nonce:c2h},'host');
    await hostGame.waitFor((m)=>m.from===clientId && (m.payload as Json|undefined)?.nonce===c2h,'replacement -> host #'+cycle);
    clientGame=replacement;
  }

  const oldHost=hostGame;
  const newHost=await SocketProbe.connect(wsUrl(roomCode,'host','host',0,'game',{hostToken}));
  sockets.push(newHost);
  await newHost.waitFor((m)=>m.kind==='relay_ready','replacement host ready');
  const hostClosed=await oldHost.waitClosed('host replaced');
  assert.equal(hostClosed.code,4001);
  assert.match(hostClosed.reason,/Replaced by reconnect/i);
  hostGame=newHost;

  const afterHost='after-host-'+randomUUID();
  clientGame.send({kind:'stress_after_host_replace',nonce:afterHost},'host');
  await hostGame.waitFor((m)=>m.from===clientId && (m.payload as Json|undefined)?.nonce===afterHost,'client -> replacement host');

  const mediaNonce='media-survives-'+randomUUID();
  clientMedia.send({kind:'stress_media_after_game_reconnects',nonce:mediaNonce},'host');
  await hostMedia.waitFor((m)=>m.from===clientId && (m.payload as Json|undefined)?.nonce===mediaNonce,'media channel survives game replacements');

  const reclaimed=await jsonRequest<Json>('/api/rooms/'+roomCode+'/join',{method:'POST',body:JSON.stringify({
    clientId,displayName:'Stress P2',reconnectToken,deviceId,
  })});
  assert.equal(Number(reclaimed.seatId),clientSeat);
  assert.equal(String(reclaimed.reconnectToken),reconnectToken);

  console.log('[online-reconnect-stress-070421] PASS clientReplace=5 hostReplace=1 mediaIsolation=1 seat=P'+(clientSeat+1));
}finally{
  for(const socket of sockets) socket.close();
  if(roomCode&&hostToken){
    await fetch(BASE+'/api/rooms/'+roomCode+'/close',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({hostToken,reason:'host_left'})}).catch(()=>undefined);
  }
}
