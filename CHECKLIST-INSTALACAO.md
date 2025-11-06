# ✅ Checklist de Instalação - SFERA TI

## 📋 Antes de Começar

- [ ] Docker Desktop instalado
- [ ] Docker Desktop rodando (ícone verde)
- [ ] 4GB de RAM livre
- [ ] 10GB de espaço em disco
- [ ] Portas 80, 3000, 3001, 5432 livres

---

## 📂 Estrutura de Arquivos

### Criar as pastas:

```
sfera-ti/
├── nginx/
├── database/
├── backend/
└── frontend/
    ├── public/
    └── src/
```

### Arquivos necessários:

#### Raiz do projeto
- [ ] `docker-compose.yml`
- [ ] `README-COMPLETO.md`
- [ ] `CHECKLIST-INSTALACAO.md` (este arquivo)
- [ ] `setup.bat`

#### Pasta `nginx/`
- [ ] `nginx.conf`

#### Pasta `database/`
- [ ] `init.sql`

#### Pasta `backend/`
- [ ] `Dockerfile`
- [ ] `package.json`
- [ ] `server.js`

#### Pasta `frontend/`
- [ ] `Dockerfile`
- [ ] `nginx.conf`
- [ ] `package.json`

#### Pasta `frontend/public/`
- [ ] `index.html`

#### Pasta `frontend/src/`
- [ ] `index.js`
- [ ] `App.js`
- [ ] `App.css`
- [ ] `Components.js`

---

## 🚀 Instalação

### Método 1: Automático (Recomendado)

- [ ] Abrir PowerShell na pasta `sfera-ti`
- [ ] Executar: `.\setup.bat`
- [ ] Aguardar instalação (5-10 min)
- [ ] Verificar se abriu o navegador
- [ ] Fazer login com: admin@sfera.com.br / admin123

### Método 2: Manual

- [ ] Abrir PowerShell na pasta `sfera-ti`
- [ ] Executar: `docker-compose up --build`
- [ ] Aguardar mensagens de sucesso
- [ ] Acessar: http://localhost
- [ ] Fazer login com: admin@sfera.com.br / admin123

---

## 🔍 Verificação Pós-Instalação

### 1. Verificar Containers

```powershell
docker-compose ps
```

Deve mostrar 4 containers rodando:
- [ ] `triloga_db` (PostgreSQL)
- [ ] `triloga_redis` (Redis)
- [ ] `triloga_backend` (Node.js)
- [ ] `triloga_frontend` (React)
- [ ] `triloga_nginx` (Nginx)

### 2. Testar Acessos

- [ ] http://localhost - Sistema completo
- [ ] http://localhost:3001 - Frontend direto
- [ ] http://localhost:3000/api/health - API health

### 3. Testar Login

- [ ] Acessar http://localhost
- [ ] Fazer login
- [ ] Ver dashboard

---

## 📝 Primeiros Passos no Sistema

### 1. Alterar Senha do Admin

- [ ] Fazer login
- [ ] Ir em Usuários
- [ ] Editar admin
- [ ] Trocar senha

### 2. Cadastrar Primeira Loja

- [ ] Menu → Lojas
- [ ] Clicar "Nova Loja"
- [ ] Preencher dados:
  - [ ] Nome
  - [ ] Código (ex: SF001)
  - [ ] CNPJ
  - [ ] Cidade/Estado
  - [ ] Gerente
  - [ ] Telefone
- [ ] Salvar

### 3. Adicionar Equipamentos

#### Computadores
- [ ] Menu → Computadores
- [ ] Clicar "Adicionar"
- [ ] Selecionar loja
- [ ] Preencher dados
- [ ] Upload foto (opcional)
- [ ] Salvar

#### Impressoras
- [ ] Menu → Impressoras
- [ ] Seguir mesmo processo

#### Celulares
- [ ] Menu → Celulares
- [ ] Cadastrar linhas

#### Links de Internet
- [ ] Menu → Internet
- [ ] Cadastrar links
- [ ] Marcar principal

### 4. Criar Primeiro Ticket

- [ ] Menu → Tickets
- [ ] Clicar "Novo Ticket"
- [ ] Selecionar loja
- [ ] Descrever problema
- [ ] Definir prioridade
- [ ] Salvar

### 5. Adicionar Usuários da Equipe

- [ ] Menu → Usuários
- [ ] Clicar "Novo Usuário"
- [ ] Preencher dados
- [ ] Definir tipo (Admin/Gerente/Técnico)
- [ ] Salvar

---

## 🎯 Objetivos Concluídos

Marque conforme for usando:

### Semana 1
- [ ] Sistema instalado e rodando
- [ ] Todas as lojas cadastradas
- [ ] Senhas alteradas
- [ ] Equipe com acesso

### Semana 2
- [ ] Computadores cadastrados
- [ ] Impressoras cadastradas
- [ ] Celulares cadastrados
- [ ] Links cadastrados

### Semana 3
- [ ] Fotos dos equipamentos
- [ ] Fotos dos racks
- [ ] Equipamentos de rede
- [ ] Primeiros tickets

### Semana 4
- [ ] Dados todos migrados do Excel
- [ ] Equipe treinada
- [ ] Processo de tickets rodando
- [ ] Sistema em uso diário

---

## 🐛 Troubleshooting

### Se algo der errado:

#### Sistema não abre no navegador
- [ ] Verificar se Docker está rodando
- [ ] Verificar se containers subiram: `docker-compose ps`
- [ ] Ver logs: `docker-compose logs`

#### Erro de porta ocupada
- [ ] Verificar portas: `netstat -ano | findstr :80`
- [ ] Matar processo conflitante
- [ ] Tentar novamente

#### Banco de dados não conecta
- [ ] Ver logs do banco: `docker-compose logs db`
- [ ] Reiniciar: `docker-compose restart db`
- [ ] Se persistir, limpar: `docker-compose down -v` e subir novamente

#### Fotos não aparecem
- [ ] Verificar pasta uploads existe
- [ ] Ver logs do backend: `docker-compose logs backend`
- [ ] Reiniciar backend: `docker-compose restart backend`

#### Esqueci a senha
- [ ] Acessar banco de dados
- [ ] Rodar query para resetar senha
- [ ] Ver documentação de recuperação

---

## 💾 Backup e Manutenção

### Backup Semanal
- [ ] Fazer backup do banco de dados
- [ ] Fazer backup da pasta uploads
- [ ] Guardar em local seguro

### Manutenção Mensal
- [ ] Verificar espaço em disco
- [ ] Limpar logs antigos
- [ ] Atualizar Docker se necessário
- [ ] Verificar performance

---

## 📊 Métricas de Sucesso

Após 1 mês de uso, você deve ter:

- [ ] 100% das lojas cadastradas
- [ ] 80%+ dos equipamentos cadastrados
- [ ] 100% dos links cadastrados
- [ ] Fotos dos principais equipamentos
- [ ] Tickets sendo criados e resolvidos
- [ ] Equipe usando o sistema diariamente
- [ ] Excel descontinuado

---

## 🎓 Treinamento da Equipe

### Gerentes de Loja
- [ ] Como acessar o sistema
- [ ] Como visualizar equipamentos da loja
- [ ] Como criar tickets
- [ ] Como ver status de tickets

### Técnicos
- [ ] Como acessar tickets
- [ ] Como atualizar status
- [ ] Como adicionar comentários
- [ ] Como cadastrar equipamentos
- [ ] Como tirar e fazer upload de fotos

### Administrador de TI
- [ ] Cadastro de lojas
- [ ] Gestão de usuários
- [ ] Cadastro de equipamentos
- [ ] Gestão de tickets
- [ ] Backup e manutenção

---

## 📞 Contatos Importantes

### Suporte Técnico Docker
- https://docs.docker.com/

### Suporte PostgreSQL
- https://www.postgresql.org/docs/

### Suporte Node.js
- https://nodejs.org/docs/

---

## ✨ Próximos Passos

Após ter o sistema rodando 100%:

- [ ] Planejar integrações futuras
- [ ] Definir relatórios necessários
- [ ] Planejar backup automático
- [ ] Considerar deploy em servidor dedicado
- [ ] Avaliar necessidade de app mobile

---

**Data de Instalação**: ___/___/______

**Instalado por**: _____________________

**Status Final**: [ ] ✅ Sucesso  [ ] ⚠️ Com problemas  [ ] ❌ Falhou

**Observações**:
_________________________________________________
_________________________________________________
_________________________________________________

---

## 📅 Timeline Recomendada

### Dia 1
- ✅ Instalação do sistema
- ✅ Configuração inicial
- ✅ Primeiro acesso

### Dias 2-5
- Cadastro de todas as lojas
- Cadastro de usuários
- Treinamento básico da equipe

### Semana 2
- Migração de dados do Excel
- Cadastro de equipamentos
- Primeiras fotos

### Semana 3
- Refinamento dos dados
- Mais fotos e documentação
- Criação de tickets de teste

### Semana 4
- Sistema em uso pleno
- Excel descontinuado
- Equipe autônoma

---

**Lembre-se**: Este é um sistema vivo que vai evoluir com o uso. Não precisa estar perfeito no dia 1!

**Boa sorte! 🚀**