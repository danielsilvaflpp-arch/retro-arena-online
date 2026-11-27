/* Device capability detection and fullscreen orientation, no changes to player roles. */
(()=>{
 const ua=navigator.userAgent||'';
 const mobile=/Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const coarse=matchMedia('(pointer: coarse)');
 const isTouch=()=>mobile||(navigator.maxTouchPoints>0&&coarse.matches);
 function sync(){document.documentElement.dataset.retroInput=isTouch()?'touch':'desktop';}
 sync();coarse.addEventListener?.('change',sync);
 let locked=false,requestId=0;
 async function lock(){if(!isTouch())return;const id=++requestId;try{if(!screen.orientation?.lock)return;await screen.orientation.lock('landscape');if(id!==requestId){screen.orientation.unlock?.();return;}locked=true;}catch{/* Browser may prohibit rotation. */}}
 function unlock(){requestId++;if(locked){try{screen.orientation?.unlock?.();}catch{}locked=false;}}
 let fake=null;
 function hint(stage){let el=stage.querySelector(':scope > .retroRotateHint');if(!el){el=document.createElement('div');el.className='retroRotateHint';el.textContent='Vire o celular de lado para jogar';stage.append(el);} }
 async function toggle(stage){if(document.fullscreenElement===stage){await document.exitFullscreen();return;}if(fake===stage){fake.classList.remove('retroPseudoFull');fake=null;document.documentElement.classList.remove('retroPseudoActive');unlock();return;}hint(stage);try{if(!stage.requestFullscreen)throw Error('fullscreen unavailable');await stage.requestFullscreen();}catch{fake=stage;stage.classList.add('retroPseudoFull');document.documentElement.classList.add('retroPseudoActive');}await lock();}
 document.addEventListener('fullscreenchange',()=>{if(document.fullscreenElement){if(isTouch()){hint(document.fullscreenElement);lock();}}else if(!fake)unlock();});
 window.addEventListener('pagehide',unlock);window.RetroDevice={isTouch,toggle,lock,unlock};
})();
