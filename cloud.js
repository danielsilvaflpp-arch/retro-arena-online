const crypto=require('crypto');
module.exports=function(io){
 const hosts=new Map(), sessions=new Map();
 const token=()=>crypto.randomBytes(16).toString('hex');
 const secret=process.env.HOST_PASSWORD||'';
 const equal=(a,b)=>crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(),crypto.createHash('sha256').update(String(b)).digest());
 const list=()=>[...hosts.values()].map(h=>({id:h.id,name:h.name,busy:!!h.session}));
 const publish=()=>io.emit('cloud:list',list());
 function end(id,reason){const x=sessions.get(id);if(!x)return;sessions.delete(id);const h=hosts.get(x.host);if(h)h.session=null;for(const sid of [x.host,...x.players])if(sid)io.to(sid).emit('cloud:end',{id,reason});publish();}
 io.on('connection',s=>{
 let last=0,authLast=0;
 s.on('cloud:list',()=>s.emit('cloud:list',list()));
 s.on('cloud:register',(d,ack)=>{if(typeof ack!=='function')return;if(Date.now()-authLast<1500)return ack({error:'Aguarde antes de tentar novamente.'});authLast=Date.now();if(secret.length<16||!equal(d?.password||'',secret))return ack({error:'Configure HOST_PASSWORD (16+ caracteres) ou verifique a senha.'});if([...sessions.values()].some(x=>x.players.includes(s.id)))return ack({error:'Saia da partida primeiro.'});if(hosts.has(s.id))return ack({error:'Máquina já registrada.'});if(hosts.size>=20)return ack({error:'Limite de máquinas.'});const h={id:s.id,name:String(d?.name||'Retro Arena PC').slice(0,50),pin:crypto.randomBytes(8).toString('hex'),session:null};hosts.set(s.id,h);ack({pin:h.pin});publish();});
 s.on('cloud:request',(d,ack)=>{if(typeof ack!=='function')return;if(Date.now()-last<1500)return ack({error:'Aguarde.'});last=Date.now();const h=hosts.get(d?.host);if(!h||h.session||!equal(d?.pin||'',h.pin))return ack({error:'Máquina ocupada, desconectada ou código incorreto.'});if(hosts.has(s.id)||[...sessions.values()].some(x=>x.players.includes(s.id)))return ack({error:'Já existe uma partida neste dispositivo.'});if(!/^[a-f0-9-]{36}$/i.test(d?.game||'')||!['solo','duo'].includes(d?.mode))return ack({error:'Seleção inválida.'});const x={id:token(),host:h.id,game:d.game,mode:d.mode,players:[s.id],invite:token()};sessions.set(x.id,x);h.session=x.id;ack({id:x.id,player:1,invite:x.mode==='duo'?x.invite:null,host:x.host});io.to(h.id).emit('cloud:start',{id:x.id,game:x.game,mode:x.mode,peer:s.id,player:1});publish();});
 s.on('cloud:join',(d,ack)=>{if(typeof ack!=='function')return;if(Date.now()-last<1500)return ack({error:'Aguarde.'});last=Date.now();const x=sessions.get(d?.id);if(!x||x.mode!=='duo'||x.players.length!==1||!equal(d?.invite||'',x.invite)||hosts.has(s.id)||[...sessions.values()].some(y=>y.players.includes(s.id)))return ack({error:'Convite inválido ou sala cheia.'});x.players.push(s.id);ack({id:x.id,player:2,host:x.host});io.to(x.host).emit('cloud:peer',{id:x.id,peer:s.id,player:2});});
 s.on('cloud:rtc',d=>{const x=sessions.get(d?.id);if(!x||!['offer','answer','ice','ready'].includes(d.type))return;if(!((s.id===x.host&&x.players.includes(d.to))||(x.players.includes(s.id)&&d.to===x.host)))return;io.to(d.to).emit('cloud:rtc',{id:x.id,from:s.id,type:d.type,data:d.data});});
 s.on('cloud:stop',()=>{for(const x of sessions.values())if(x.host===s.id||x.players.includes(s.id))end(x.id,'Partida encerrada.');});
 s.on('disconnect',()=>{hosts.delete(s.id);for(const x of sessions.values())if(x.host===s.id||x.players.includes(s.id))end(x.id,'Dispositivo desconectado.');publish();});
 });
};
