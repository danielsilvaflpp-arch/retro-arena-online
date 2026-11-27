(()=>{
 const tabs=[['hostServer','Servidor'],['hostTournament','Torneio'],['hostPlayers','Jogadores'],['hostFinance','Financeiro'],['hostReferee','Árbitro'],['hostSettings','Configurações']];
 const nav=document.getElementById('hostTabs');
 function activate(id,focus=false){for(const [key] of tabs){const active=id===key;document.getElementById(key).hidden=!active;const b=document.getElementById(key+'Tab');b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1;if(active&&focus)b.focus();}}
 for(const [id,label] of tabs){const b=document.createElement('button');b.type='button';b.id=id+'Tab';b.textContent=label;b.setAttribute('role','tab');b.setAttribute('aria-controls',id);b.onclick=()=>activate(id);b.onkeydown=e=>{const i=tabs.findIndex(t=>t[0]===id);let next;if(e.key==='ArrowRight')next=(i+1)%tabs.length;else if(e.key==='ArrowLeft')next=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;e.preventDefault();activate(tabs[next][0],true);};nav.append(b);const panel=document.getElementById(id);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',b.id);}
 activate('hostServer');
 // Change tabs only after successful registration, not on every server update.
 const create=document.getElementById('masterCreate');new MutationObserver(()=>{if(!create.hidden)activate('hostTournament');}).observe(create,{attributes:true,attributeFilter:['hidden']});
})();
