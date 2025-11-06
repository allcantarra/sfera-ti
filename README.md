🏢 SFERA TI - Sistema de Controle de Franquias
🎯 Sobre o Sistema
Sistema completo para gestão de TI em rede de franquias SFERA. Substitui planilhas Excel por um sistema web profissional com controle de:

🏪 Lojas/Franquias - Cadastro completo com CNPJ, IE, gerente
💻 Computadores - Inventory completo com fotos e especificações
🖨️ Impressoras - Controle de impressoras e multifuncionais
📱 Celulares - Gestão de linhas e aparelhos
🌐 Links de Internet - Controle de todos os links
🔌 Equipamentos de Rede - Switches, roteadores, racks
📸 Fotos - Racks, cabeamento, infraestrutura
🎫 Tickets - Sistema de chamados técnicos
👥 Usuários - Controle de acesso
📦 O Que Está Incluído
Backend (Node.js)
✅ API REST completa
✅ Autenticação JWT
✅ Upload de fotos
✅ PostgreSQL database
✅ Todas as rotas funcionando
Frontend (React)
✅ Interface moderna e responsiva
✅ Dashboard com estatísticas
✅ CRUD completo de todas as entidades
✅ Upload de imagens
✅ Filtros por loja
Database (PostgreSQL)
✅ 15+ tabelas estruturadas
✅ Views otimizadas
✅ Triggers automáticos
✅ Índices de performance
Infraestrutura (Docker)
✅ Docker Compose configurado
✅ Nginx como proxy
✅ Volumes para persistência
✅ Health checks
🚀 Como Instalar
Pré-requisitos
Docker Desktop instalado e rodando
4GB de RAM disponível
Windows 10/11 ou Linux
Passo 1: Criar Estrutura de Pastas
powershell
# No PowerShell (Windows)
mkdir sfera-ti
cd sfera-ti
mkdir nginx, database, backend, frontend
mkdir frontend\public, frontend\src
Passo 2: Criar os Arquivos
Copie cada arquivo fornecido para sua respectiva pasta:

sfera-ti/
├── docker-compose.yml
├── nginx/
│   └── nginx.conf
├── database/
│   └── init.sql
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   └── server.js
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── public/
    │   └── index.html
    └── src/
        ├── index.js
        ├── App.js
        ├── App.css
        └── Components.js
Passo 3: Iniciar o Docker Desktop
Abra o Docker Desktop
Aguarde até ficar com o ícone verde (rodando)
Passo 4: Subir o Sistema
powershell
# Na pasta raiz (sfera-ti)
docker-compose up --build
Tempo estimado primeira vez: 5-10 minutos

Passo 5: Acessar o Sistema
Aguarde as mensagens:

✓ Backend iniciado na porta 3000
✓ Frontend iniciado na porta 3001
✓ Nginx iniciado na porta 80
Então acesse:

🌐 Sistema Completo: http://localhost
🎨 Frontend Direto: http://localhost:3001
🔧 API Backend: http://localhost:3000/api
💚 Health Check: http://localhost:3000/api/health
🔐 Login Padrão
Email: admin@sfera.com.br
Senha: admin123
⚠️ IMPORTANTE: Altere a senha após primeiro acesso!

📚 Como Usar o Sistema
1. Primeiro Acesso
Faça login com as credenciais padrão
Acesse "Lojas" no menu lateral
Cadastre suas lojas da rede SFERA
2. Cadastrar Uma Loja
Dados Principais:

Nome da loja (ex: SFERA - Shopping Center)
Código único (ex: SF001, SF002)
CNPJ e Inscrição Estadual
Endereço completo
Dados do Gerente:

Nome do gerente responsável
Telefone e e-mail
Dica: Use códigos sequenciais (SF001, SF002) para facilitar

3. Adicionar Equipamentos
Após cadastrar as lojas, adicione os equipamentos:

💻 Computadores
Hostname (nome do PC)
Patrimônio
Tipo: Desktop / Notebook / All-in-one
Marca e modelo
Especificações (RAM, HD, Processador)
Quem usa o computador
Foto (opcional mas recomendado)
🖨️ Impressoras
Nome/identificação
Tipo: Laser / Jato de Tinta / Multifuncional
Marca e modelo
Endereço IP
Setor onde está
Foto
📱 Celulares
Número da linha
Aparelho (marca/modelo)
Operadora
Tipo de plano
Quem usa
Valor mensal
🌐 Links de Internet
Nome do link
Operadora
Tipo: Fibra / Rádio / ADSL
Velocidades (download/upload)
Valor mensal
Marcar se é o link principal
🔌 Equipamentos de Rede
Nome/identificação
Tipo: Switch / Roteador / Firewall / Access Point / Rack / Nobreak
Marca e modelo
IP
Total de portas / portas usadas
Posição no rack
Foto
4. Dashboard
O dashboard mostra automaticamente:

Total de lojas ativas
Total de equipamentos por tipo
Tickets abertos
Cards clicáveis de cada loja com resumo
Clique em uma loja para ver:

Todos os equipamentos daquela loja
Status de cada equipamento
Fotos cadastradas
5. Criar Tickets
Para registrar um chamado:

Menu lateral → Tickets
Clique em "Novo Ticket"
Selecione a loja
Título e descrição do problema
Categoria (Hardware, Software, Rede, etc)
Prioridade (Baixa, Média, Alta, Urgente)
O sistema gera automaticamente:

Número do ticket (TK-2024-0001)
Data de abertura
Status inicial "Aberto"
Você pode:

Mudar o status conforme andamento
Adicionar comentários
Atribuir a técnicos
Marcar como resolvido
6. Gerenciar Usuários
Crie usuários para sua equipe:

Tipos de Usuário:

Admin: Acesso total
Gerente: Gestão da loja
Técnico: Tickets e equipamentos
Usuário: Criar tickets
💡 Dicas de Uso
Organize seus Códigos
Lojas:      SF001, SF002, SF003...
Computadores: PAT-001, PAT-002...
Tire Fotos dos Equipamentos
É muito útil ter fotos de:

Rack frontal e traseiro
Computadores
Impressoras
Patch panels
Switches
Use Observações
Campo "Observações" é útil para:

Problemas recorrentes
Configurações especiais
Histórico de manutenções
Mantenha Atualizado
Atualize status quando equipamento for para manutenção
Registre trocas de hardware
Documente mudanças de IP
🔧 Comandos Úteis
Ver Logs
powershell
# Ver todos os logs
docker-compose logs -f

# Ver apenas backend
docker-compose logs -f backend

# Ver apenas frontend
docker-compose logs -f frontend

# Ver apenas database
docker-compose logs -f db
Reiniciar Serviços
powershell
# Reiniciar tudo
docker-compose restart

# Reiniciar apenas backend
docker-compose restart backend
Parar o Sistema
powershell
# Parar mas manter dados
docker-compose down

# Parar e limpar tudo (CUIDADO!)
docker-compose down -v
Reconstruir
powershell
# Rebuild completo
docker-compose up --build

# Rebuild apenas backend
docker-compose up --build backend
Ver Status
powershell
# Ver containers rodando
docker-compose ps

# Ver uso de recursos
docker stats
🐛 Solução de Problemas
Sistema não sobe
powershell
# 1. Verificar se Docker está rodando
docker ps

# 2. Limpar tudo e começar de novo
docker-compose down -v
docker system prune -a
docker-compose up --build
Erro de Porta Ocupada
powershell
# Ver o que está usando a porta
netstat -ano | findstr :80
netstat -ano | findstr :3000

# Matar processo (substitua PID)
taskkill /PID [número] /F
Banco de Dados não conecta
powershell
# Ver se o postgres está rodando
docker ps | findstr postgres

# Ver logs do banco
docker-compose logs db

# Resetar banco
docker-compose down -v
docker-compose up --build db
Fotos não aparecem
Certifique-se que:

A pasta uploads existe no backend
O volume está mapeado no docker-compose
As permissões estão corretas
powershell
# Recriar volumes
docker-compose down -v
docker-compose up --build
📊 Estrutura do Banco
Principais Tabelas
Tabela	Descrição	Registros Típicos
lojas	Franquias SFERA	10-50 lojas
computadores	PCs da rede	5-20 por loja
impressoras	Impressoras	2-5 por loja
celulares	Linhas	3-10 por loja
links_internet	Internet	1-3 por loja
equipamentos_rede	Rede	5-15 por loja
tickets	Chamados	Crescente
usuarios	Usuários do sistema	5-20
🎯 Roadmap Futuro
Funcionalidades planejadas:

 Chat em tempo real entre loja e TI
 Notificações por e-mail
 Relatórios em PDF
 Gráficos e dashboards avançados
 App mobile
 Integração WhatsApp
 Backup automático
 QR Code nos equipamentos
 Controle de estoque de peças
 Agenda de manutenções preventivas
📱 Acesso Remoto
Via Rede Local
Descubra o IP do servidor: ipconfig
Acesse de outro PC: http://[IP-DO-SERVIDOR]
Via Internet (Futuro)
Para acessar de fora:

Configure port forwarding no roteador
Use um domínio (ex: sfera-ti.com.br)
Configure SSL com Let's Encrypt
Use Cloudflare para proteção
🔒 Segurança
Recomendações
✅ Altere senha padrão do admin
✅ Use senhas fortes
✅ Faça backup regular do banco
✅ Mantenha Docker atualizado
✅ Use HTTPS em produção
✅ Limite acesso por IP se possível
Backup do Banco
powershell
# Backup
docker exec triloga_db pg_dump -U triloga_admin triloga_empresarial > backup.sql

# Restore
docker exec -i triloga_db psql -U triloga_admin triloga_empresarial < backup.sql
📞 Suporte
Para problemas técnicos:

Verifique os logs: docker-compose logs
Consulte este README
Verifique se todas as portas estão livres
Teste o health check: http://localhost:3000/api/health
📄 Licença
Sistema proprietário desenvolvido para SFERA TI.

Desenvolvido com ❤️ para modernizar a gestão de TI da rede SFERA

Versão 1.0 - Novembro 2024

