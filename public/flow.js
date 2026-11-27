(()=>{
let mode='',step='mode',selected=null,target=null,invite=false,machines=[];
const show=(id,v)=>$(id).hidden=!v;
let saved=[];try{saved=JSON.parse(localStorage.getItem('retro.savedHosts.v1')||'[]');if(!Array.isArray(saved))saved=[];}catch{}
function store(){try{localStorage.setItem('retro.savedHosts.v1',JSON.stringify(saved));}catch{}}
function render(){
 const guest=room&&room.host!==socket.id;
 const title={mode:'Como deseja jogar?',servers:'Escolha o servidor',games:'Escolha seu jogo',play:guest?'Partida compartilhada':mode==='solo'?'Modo solo':'Modo duo'};
 say('stepLabel',step==='mode'?'ETAPA 01 / 03':step==='servers'?'ETAPA 02 / 03':step==='games'?'ETAPA 03 / 03':'PARTIDA');say('stepTitle',title[step]);
 show('modeStep',step==='mode');show('serverStep',step==='servers');show('backStep',step==='servers'||step==='games'||(step==='play'&&!invite));show('playLayout',step==='games'||step==='play');show('gameArticle',!invite||!!room);show('catalogArea',step==='games'&&!guest);show('manual',false);show('launchArea',step==='play');show('roomArticle',false);show('socialArea',false);show('localServer',mode==='solo');
 $('gameTitle').textContent=step==='games'?'Catálogo':selected?.name||'Partida compartilhada';$('solo').hidden=mode!=='solo';$('multi').hidden=mode!=='duo';
 say('selectionSummary',(mode==='solo'?'SOLO':mode==='tournament'?'TORNEIO':'DUO')+' · Selecione uma máquina');
 if(step==='servers')drawHosts();
}
function chooseHost(h){if(h.open?.mode===mode){location.href='/cloud-play.html?'+new URLSearchParams({[mode==='tournament'?'tournament':'session']:h.open.id,direct:h.open.direct?'1':'0',host:h.id});return;}target=h;step='games';render();}
function card(h,label,container,remove){const row=document.createElement('div');row.className='host-row';const b=document.createElement('button');b.type='button';const join=h?.open?.mode===mode;b.textContent=label+' — '+(!h?'Desconectado':join?'Entrar na partida ('+h.open.count+'/'+h.open.max+')':h.busy?'Ocupado':'Disponível');b.disabled=!h||(h.busy&&!join);b.onclick=()=>chooseHost(h);row.append(b);if(remove){const x=document.createElement('button');x.type='button';x.textContent='Remover';x.onclick=remove;row.append(x);}container.append(row);}
function drawHosts(){const box=$('cloudServers'),fav=$('savedServers');box.replaceChildren();fav.replaceChildren();for(const h of machines)card(h,h.name,box);if(!machines.length)box.textContent=socket.connected?'Nenhuma máquina conectada. Ative o Host no PC.':'Conectando ao serviço de descoberta…';for(const s of saved){const h=machines.find(h=>h.machineId===s.id);card(h,s.name,fav,()=>{saved=saved.filter(x=>x.id!==s.id);store();drawHosts();});}if(!saved.length)fav.textContent='Nenhum servidor salvo.';}
socket.on('cloud:list',h=>{machines=Array.isArray(h)?h:[];drawHosts();});socket.on('connect',()=>socket.emit('cloud:list'));socket.on('disconnect',()=>{machines=[];drawHosts();});$('refreshHosts').onclick=()=>socket.emit('cloud:list');
$('addHost').onclick=()=>show('addHostForm',$('addHostForm').hidden);
$('addHostForm').onsubmit=e=>{e.preventDefault();const pin=$('addHostCode').value.trim();const alias=$('addHostName').value.trim();say('addHostStatus','Procurando máquina…');socket.timeout(5000).emit('cloud:find',{pin},(err,r)=>{if(err||r?.error||!r?.host)return say('addHostStatus',r?.error||'Não foi possível localizar a máquina.');const h=r.host;const name=alias||h.name;saved=saved.filter(x=>x.id!==h.machineId);saved.push({id:h.machineId,name});store();$('addHostCode').value='';$('addHostName').value='';say('addHostStatus','Servidor salvo.');show('addHostForm',false);drawHosts();});};
function start(m){mode=m;step='servers';selected=null;target=null;render();socket.emit('cloud:list');}
const nickInput=$('playerNick');try{nickInput.value=localStorage.getItem('retro.nick')||'';}catch{}nickInput.oninput=()=>{try{localStorage.setItem('retro.nick',nickInput.value.trim());}catch{}};$('pickTournament').onclick=()=>{if(!nickInput.value.trim()){nickInput.focus();return;}start('tournament');};$('pickSolo').onclick=()=>start('solo');$('pickDuo').onclick=()=>start('duo');
$('localServer').onclick=()=>{if(mode!=='solo')return;target=null;step='games';render();};
window.selectCatalogGame=async g=>{selected=g;if(target){const h=machines.find(x=>x.id===target.id);if(!h||h.busy){step='servers';render();return;}location.href='/cloud-play.html?'+new URLSearchParams({host:h.id,game:g.id,mode});return;}step='play';render();await window.loadCatalogGame(g);if(mode==='solo'&&file&&digest)$('solo').click();};
$('backStep').onclick=()=>{if(room){$('leave').click();return;}if(step==='play')step='games';else if(step==='games')step='servers';else step='mode';render();};

$('leave').addEventListener('click',()=>{invite=false;step='mode';mode='';selected=null;target=null;history.replaceState(null,'',location.pathname);render();});
if(new URLSearchParams(location.search).has('room'))history.replaceState(null,'',location.pathname);render();
})();
