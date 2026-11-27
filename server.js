const express=require('express'), http=require('http'), crypto=require('crypto');
const app=express(), server=http.createServer(app), io=new (require('socket.io').Server)(server,{maxHttpBufferSize:16384});
const rooms=new Map(), scores=new Map();
app.use(express.static('public')); app.get('/health',(_,r)=>r.send('ok'));
app.get('/config',(_,r)=>r.json({netplay:process.env.NETPLAY_URL||'',ice:[{urls:'stun:stun.l.google.com:19302'},...(process.env.TURN_URL?[{urls:process.env.TURN_URL,username:process.env.TURN_USER,credential:process.env.TURN_PASSWORD}]:[])]}));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const clean=(x,n)=>typeof x==='string'?x.trim().slice(0,n):'';
const board=()=>[...scores].map(([name,games])=>({name,games})).sort((a,b)=>b.games-a.games).slice(0,20);
function state(r){io.to(r.id).emit('room',{id:r.id,players:[...r.players.values()],game:r.game});}
function leave(s){const r=rooms.get(s.data.room); if(!r)return; r.players.delete(s.id);s.leave(r.id);s.data.room=null;if(!r.players.size)rooms.delete(r.id);else state(r);}
io.on('connection',s=>{s.emit('ranking',board());let last=0;
 s.on('enter',(d,ack)=>{if(typeof ack!=='function'||!d||Date.now()-last<700)return;last=Date.now();const name=clean(d.name,24),pw=clean(d.password,80);if(!name||!pw)return ack({error:'Informe nome e senha.'});let r;if(d.create){if(rooms.size>=100)return ack({error:'Servidor cheio.'});const id=crypto.randomBytes(6).toString('hex');r={id,password:hash(pw+id),players:new Map(),game:null};rooms.set(id,r);}else{r=rooms.get(clean(d.id,24));if(!r||r.password!==hash(pw+r.id))return ack({error:'Sala ou senha inválida.'});if(r.players.size>=2&&!r.players.has(s.id))return ack({error:'Sala cheia.'});}leave(s);s.data.room=r.id;s.data.name=name;r.players.set(s.id,name);s.join(r.id);ack({id:r.id});state(r);});
 s.on('chat',m=>{const r=rooms.get(s.data.room),msg=clean(m,300);if(!r||!msg||Date.now()-(s.data.chatTime||0)<500)return;s.data.chatTime=Date.now();io.to(r.id).emit('chat',{name:s.data.name,msg});});
 s.on('game',d=>{const r=rooms.get(s.data.room);if(!r||r.players.keys().next().value!==s.id||!d||!(/^[a-f0-9]{64}$/.test(d.hash)))return;r.game={hash:d.hash,name:clean(d.name,100)};state(r);});
 s.on('played',()=>{const r=rooms.get(s.data.room);if(!r||!r.game||r.players.size!==2||s.data.lastGame===r.id+':'+r.game.hash)return;s.data.lastGame=r.id+':'+r.game.hash;scores.set(s.data.name,(scores.get(s.data.name)||0)+1);io.emit('ranking',board());});
 s.on('leave',()=>leave(s));s.on('disconnect',()=>leave(s));});
server.listen(process.env.PORT||3000,'0.0.0.0');
