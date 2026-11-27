# Retro Arena V4 — catálogo
Atualização completa sobre V3.2. Faça backup do repositório e envie todos os arquivos deste ZIP, incluindo public, catalog.js, server.js e package.json. Não envie ROMs para GitHub.

1. Crie um projeto no Supabase (https://supabase.com/dashboard).
2. Em Storage, crie um bucket PRIVADO chamado `retro-arena`. Não adicione políticas públicas. Não é necessário criar tabelas SQL: catalog.json é mantido no bucket.
3. Em Project Settings/API Keys copie o Project URL e a chave legacy service_role (não anon). Nunca publique essa chave nem envie em chat.
4. No Render > serviço retro-arena-online > Environment, adicione SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY e ADMIN_PASSWORD (senha exclusiva aleatória, pelo menos 16 caracteres). Salve e publique. npm install / npm start.
5. Abra /admin.html, entre com sua senha e publique apenas arquivos com autorização de distribuição pública. A ROM é entregue ao navegador de qualquer visitante, logo não é uma proteção DRM. O bucket privado impede escrita direta, mas o catálogo publicado é público por projeto.
6. Abra a página inicial, selecione um jogo e clique Jogar sozinho ou crie uma sala e inicie a partida compartilhada. O convidado entra com senha e não precisa de ROM.

Limites: 50 MB por arquivo, 55 MB por envio, capa 2 MB; plano grátis possui limites de armazenamento e tráfego. Upload simples pode falhar em redes lentas. Catálogo persistente no bucket; salas e ranking continuam em memória. Instância única; não use múltiplas réplicas para editar o catálogo simultaneamente. Apenas a BIOS Neo Geo ZIP foi integrada; outros consoles são experimentais e podem precisar de adaptações, sobretudo PS1/N64. Não há contas de usuários nesta versão. WebRTC continua experimental e pode precisar de TURN. Sem ROMs ou BIOS inclusas. Não foi testado contra um projeto Supabase real. Remoções podem deixar objetos órfãos se a rede falhar; limpe pelo painel Storage. Não compartilhe as credenciais.
