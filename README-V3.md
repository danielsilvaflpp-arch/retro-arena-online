# Retro Arena V3 experimental
Atualize server.js e a pasta public do repositório, mantendo os caminhos. Render deve publicar automaticamente. Não inclui ROMs. Não depende de NETPLAY_URL.
1. Abra o site em dois navegadores/dispositivos. Anfitrião cria sala com senha; convidado entra com código/link e senha.
2. Anfitrião seleciona ROM e BIOS e inicia partida compartilhada (P1). Clique dentro do emulador caso peça para começar. Convidado clica Entrar na partida (P2), sem ROM.
3. O vídeo vem do canvas do anfitrião. O convidado usa setas, Z/X/A/S, 5 (crédito), Enter (start), Q/W, botões de toque ou gamepad padrão. O mapeamento precisa ser confirmado no FBNeo.
4. Áudio opcional: anfitrião clica Compartilhar aba com áudio e seleciona exclusivamente a aba do jogo com áudio habilitado. Não compartilhe outras abas ou a tela inteira. O vídeo continua vindo do canvas.
5. Se conexão falhar em redes distintas, pode ser necessário TURN (TURN_URL, TURN_USER, TURN_PASSWORD no Render). Use credenciais limitadas/temporárias; o cliente precisa recebê-las.
Testes: sintaxe JavaScript verificada; não foi possível executar dois navegadores reais com ROM e WebRTC neste ambiente. Se o vídeo ficar preto ou controles falharem, envie prints/console. Ranking permanece experimental e temporário. Para voltar à V2.2, reverta o commit no GitHub.
