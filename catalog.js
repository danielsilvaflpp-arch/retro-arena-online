const crypto=require('crypto');
const {Readable}=require('stream');
const multer=require('multer');
const {createClient}=require('@supabase/supabase-js');
const cores={fbneo:'Neo Geo / Arcade',snes:'Super Nintendo',segaMD:'Mega Drive',nes:'NES',gb:'Game Boy',gba:'Game Boy Advance',n64:'Nintendo 64',psx:'PlayStation 1'};
module.exports=function(app){
 const url=process.env.SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,pw=process.env.ADMIN_PASSWORD;
 const storage=url&&key?createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}}).storage.from('retro-arena'):null;
 const digest=s=>crypto.createHash('sha256').update(s).digest();
 let attempts={count:0,until:0},busy=false;
 const fail=(r,code,msg)=>r.status(code).json({error:msg});
 function admin(q,r,next){if(!pw||pw.length<16||!storage)return fail(r,503,'Configure Supabase e ADMIN_PASSWORD (mínimo 16 caracteres).');const token=q.get('authorization')||'';if(!crypto.timingSafeEqual(digest(token),digest('Bearer '+pw))){if(Date.now()>attempts.until)attempts={count:0,until:Date.now()+60000};if(++attempts.count>20)return fail(r,429,'Muitas tentativas. Tente novamente em um minuto.');return fail(r,401,'Senha incorreta.');}next();}
 async function list(){if(!storage)return [];const {data,error}=await storage.list('',{search:'catalog.json'});if(error)throw error;if(!data.some(x=>x.name==='catalog.json'))return [];const d=await storage.download('catalog.json');if(d.error)throw d.error;return JSON.parse(await d.data.text());}
 async function save(rows){const {error}=await storage.upload('catalog.json',Buffer.from(JSON.stringify(rows)),{contentType:'application/json',upsert:true,cacheControl:'0'});if(error)throw error;}
 const route=fn=>(q,r)=>Promise.resolve(fn(q,r)).catch(e=>{console.error('catalog:',e.message);if(!r.headersSent)fail(r,502,'Falha no armazenamento. Confira as configurações e tente novamente.');});
 app.get('/api/catalog',route(async(q,r)=>{r.set('Cache-Control','no-store');r.json((await list()).map(({assets,...g})=>({...g,cover:!!assets.cover,bios:!!assets.bios})));}));
 app.get('/api/admin/check',admin,(q,r)=>r.json({ok:true}));
 const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:50000000,files:3,fields:6,fieldSize:1000}}).fields([{name:'rom',maxCount:1},{name:'bios',maxCount:1},{name:'cover',maxCount:1}]);
 app.post('/api/admin/games',admin,(q,r,next)=>{if(busy)return fail(r,409,'Outra alteração está em andamento.');busy=true;let done=false;const release=()=>{if(!done){done=true;busy=false;}};r.once('finish',release);r.once('close',release);upload(q,r,e=>e?fail(r,400,'Upload inválido ou arquivo acima de 50 MB.'):next());},route(async(q,r)=>{
  const {name,core,category,authorized}=q.body;const rom=q.files?.rom?.[0],bios=q.files?.bios?.[0],cover=q.files?.cover?.[0];
  if(!name?.trim()||name.length>100||!Object.hasOwn(cores,core)||!rom||authorized!=='yes')return fail(r,400,'Preencha nome, emulador, ROM e autorização.');
  const ext=f=>f.originalname.split('.').pop().toLowerCase();const safe=f=>/^[a-zA-Z0-9_.-]{1,120}$/.test(f.originalname);
  if(!safe(rom)||!['zip','sfc','smc','md','gen','bin','nes','gb','gbc','gba','n64','z64','v64','chd','pbp','iso'].includes(ext(rom))||(core==='fbneo'&&ext(rom)!=='zip')||(bios&&(!safe(bios)||ext(bios)!=='zip'))||(cover&&!['png','jpg','jpeg','webp'].includes(ext(cover))))return fail(r,400,'Formato ou nome de arquivo inválido.');
  if(cover&&cover.size>2000000)return fail(r,400,'Capa acima de 2 MB.');if([rom,bios,cover].filter(Boolean).reduce((n,f)=>n+f.size,0)>55000000)return fail(r,400,'Total máximo por envio: 55 MB.');
  const rows=await list(),id=crypto.randomUUID(),assets={},created=[];try{for(const [kind,f] of Object.entries({rom,bios,cover})){if(!f)continue;const path=id+'/'+kind+'-'+(kind==='cover'?'cover.'+ext(f):f.originalname);const type=kind==='cover'?({png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp'}[ext(f)]):'application/octet-stream';const {error}=await storage.upload(path,f.buffer,{contentType:type,upsert:false});if(error)throw error;created.push(path);assets[kind]={path,name:f.originalname,type};}rows.push({id,name:name.trim(),core,platform:cores[core],category:String(category||'Outros').slice(0,40),romName:rom.originalname,biosName:bios?.originalname||'',assets});await save(rows);r.json({ok:true,id});}catch(e){if(created.length)await storage.remove(created);throw e;}
 }));
 app.delete('/api/admin/games/:id',admin,route(async(q,r)=>{if(busy)return fail(r,409,'Outra alteração está em andamento.');busy=true;try{const rows=await list(),g=rows.find(x=>x.id===q.params.id);if(!g)return fail(r,404,'Jogo não encontrado.');await save(rows.filter(x=>x!==g));const {error}=await storage.remove(Object.values(g.assets).map(x=>x.path));r.json({ok:true,warning:error?'Jogo removido do catálogo; limpe os arquivos restantes no Storage.':undefined});}finally{busy=false;}}));
 app.get('/api/games/:id/:kind',route(async(q,r)=>{const g=(await list()).find(x=>x.id===q.params.id),kind=q.params.kind;if(!g||!['rom','bios','cover'].includes(kind)||!g.assets[kind])return fail(r,404,'Arquivo não encontrado.');const a=g.assets[kind],{data,error}=await storage.createSignedUrl(a.path,60);if(error)throw error;const upstream=await fetch(data.signedUrl);if(!upstream.ok||!upstream.body)throw Error('asset download');r.set({'Content-Type':a.type,'X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});if(kind!=='cover')r.set('Content-Disposition','attachment');Readable.fromWeb(upstream.body).pipe(r); }));
};
