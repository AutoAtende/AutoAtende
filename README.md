#AutoAtende - Max
📝 O backend usa baileys para receber e enviar mensagens do WhatsApp, criar tickets a partir deles e armazenar tudo em um banco de dados PostgreSQL.

📝 Frontend é um aplicativo de bate-papo multiusuário com recursos completos, inicializado com react-create-app e Material UI, que se comunica com o backend usando API REST e Websockets. Permite interagir com contatos, tickets, enviar e receber mensagens do WhatsApp.

🚨⚠️ Não é garantido garantir que você não será bloqueado usando este método, embora tenha funcionado para várias pessoas. O WhatsApp não permite bots ou clientes não oficiais em sua plataforma, portanto, isso não deve ser considerado totalmente seguro. (Não somos responsáveis por qualquer tipo de punição ou bloqueio.)

💻 Como funciona?
A cada nova mensagem recebida em um WhatsApp associado, um novo Ticket é criado. Então, esse ticket pode ser acessado em uma fila na página Tickets , onde você pode atribuir o ticket a você mesmo, _aceitando-o, respondendo a mensagem do ticket e, eventualmente, resolvendo-o.

🚀 As mensagens subsequentes do mesmo contato serão relacionadas ao primeiro ticket aberto/pendente encontrado.

🚀 Se um contato enviar uma nova mensagem em menos de 10s (pode ser alterado nas configurações) de intervalo e não houver nenhum ticket desse contato com status pendente/aberto , o ticket fechado mais recente será reaberto, em vez de criar um novo.

🚀 Recursos
Tenha vários usuários conversando no mesmo número do WhatsApp ✅
Conecte-se a várias contas do WhatsApp e receba todas as mensagens em um só lugar ✅
Crie e converse com novos contatos sem tocar no celular ✅
Enviar e receber mensagem ✅
Enviar mídia (imagens/áudio/documentos) ✅
Receber mídia (imagens/áudio/vídeo/documentos) ✅
🥷 Extras:
Ignore mensagens de grupos ✅🆕
Altere tempo para criação de um novo ticket ✅🆕
Ignore chamadas de áudio/vídeo ✅🆕
Associe uma conexão padrão ao usuário ✅🆕
Transferência de tickets para outra conexão ✅🆕
Mais em Grupo AutoAtende 🥷 🥷 | autoatende.com | AutoAtende Todos os direitos reservados a seus respectivos criadores. ❤️ - GP AutoAtende 🥷
