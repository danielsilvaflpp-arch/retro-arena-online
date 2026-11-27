# Retro Arena Online
Envie o conteúdo desta pasta a um repositório GitHub. No Render, New > Web Service, conecte o repositório, escolha Free, build `npm install`, start `npm start`. Abra a URL fornecida. Não precisa instalar nada localmente.

## Netplay
Hospede separadamente o servidor oficial https://github.com/EmulatorJS/EmulatorJS-Netplay conforme seu README. Configure a variável NETPLAY_URL no serviço Retro Arena com a URL HTTPS desse servidor. Opcionalmente configure TURN_URL, TURN_USER e TURN_PASSWORD para redes que não permitem conexão direta. Essas credenciais são entregues aos clientes: use credenciais limitadas, não segredos administrativos. A integração usa o menu Netplay do EmulatorJS; a sala privada do lobby não protege automaticamente a sessão de jogo. Os dois jogadores precisam da mesma ROM autorizada, conferida por SHA-256. Não há ROMs incluídas nem upload ao servidor.

## Limites
Ranking de participações autodeclaradas, sem autenticação nem persistência. Salas, chat e ranking em memória; reinício apaga dados. A instalação PWA depende do navegador e HTTPS, não oferece jogo offline. Emulador via CDN stable; controles nativos do EmulatorJS. Testar em dois aparelhos/redes antes de divulgar. Não é serviço de produção.
