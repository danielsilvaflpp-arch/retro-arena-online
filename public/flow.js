(()=>{
let mode='',step=1,selected=null,invite=new URLSearchParams(location.search).has('room');
const show=(id,v)=>$(id).hidden=!v;
function render(){
 const guest=room&&room.host!==socket.id;
 say('stepLabel',step<=3?'ETAPA 0'+step+' / 03':'PARTIDA');
 say('stepTitle',step===1?'Como deseja jogar?':step===2?'Escolha seu jogo':step===3?'Escolha o servidor':guest?'Partida compartilhada':mode==='solo'?'Modo solo':'Modo duo');
 show('modeStep',step===1);show('serverStep',step===3);show('backStep',step===2||step===3);show('playLayout',step===2||step===4);show('gameArticle',!invite||!!room);show('catalogArea',step===2&&!guest);show('manual',false);show('launchArea',step===4);show('roomArticle',step===4&&mode==='duo');show('socialArea',step===4&&mode==='duo');
 $('gameTitle').textContent=step===2?'Catálogo':selected?.name||'Partida compartilhada';
 $('solo').hidden=mode!=='solo';$('multi').hidden=mode!=='duo';
 if(step===3)say('selectionSummary',(mode==='solo'?'SOLO':'DUO')+' · '+selected.name);
}
let machines=[];function drawHosts(){const box=$('cloudServers');box.replaceChildren();for(const h of machines){const b=document.createElement('button');b.textContent=h.name+(h.busy?' — Ocupado':' — Disponível');b.disabled=h.busy;b.onclick=()=>{if(selected)location.href='/cloud-play.html?'+new URLSearchParams({host:h.id,game:selected.id,mode});};box.append(b);}if(!machines.length)box.textContent='Nenhuma máquina anfitriã conectada.';}socket.on('cloud:list',h=>{machines=h;drawHosts();});socket.on('connect',()=>socket.emit('cloud:list'));socket.emit('cloud:list');drawHosts();
function start(m){mode=m;step=2;selected=null;render();}
$('pickSolo').onclick=()=>start('solo');$('pickDuo').onclick=()=>start('duo');
window.selectCatalogGame=g=>{selected=g;step=3;render();};
$('backStep').onclick=()=>{step--;render();};
$('localServer').onclick=async()=>{step=4;render();await window.loadCatalogGame(selected);if(mode==='solo'&&file&&digest)$('solo').click();};
socket.on('room',()=>{if(room&&room.host!==socket.id){mode='duo';step=4;render();}});
$('leave').addEventListener('click',()=>{invite=false;step=1;mode='';selected=null;history.replaceState(null,'',location.pathname);render();});
if(invite){mode='duo';step=4;}
render();
})();
