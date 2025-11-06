# 🏗️ SFERA TI - Arquitetura Técnica Completa

## 📐 Visão Geral da Arquitetura

### Princípios de Design

1. **Modular**: Cada módulo é independente e pode ser desenvolvido separadamente
2. **Escalável**: Preparado para crescer horizontal e verticalmente
3. **Seguro**: Autenticação, autorização e auditoria em todos os níveis
4. **Manutenível**: Código limpo, documentado e testável
5. **Multi-tenant**: Suporte nativo para múltiplas empresas

### Stack Tecnológico

```
Frontend:  React 18 + TypeScript + Tailwind CSS + Axios
Backend:   Node.js + TypeScript + Express + JWT
Database:  PostgreSQL 15 + Redis
Proxy:     Nginx
Container: Docker + Docker Compose
```

---

## 🗄️ Modelo de Dados Detalhado

### Hierarquia de Dados

```
Empresa (Multi-tenant root)
    ├── Lojas (Filiais)
    │   ├── Usuários
    │   ├── Tickets
    │   ├── Ativos
    │   └── Estoque
    ├── Permissões
    ├── Categorias
    └── Configurações
```

### Relacionamentos Principais

#### 1. Empresa → Lojas (1:N)
```sql
empresas.id ──> lojas.empresa_id
```
- Uma empresa pode ter múltiplas lojas
- Lojas pertencem a uma única empresa

#### 2. Usuário → Empresa/Loja (N:1)
```sql
usuarios.empresa_id ──> empresas.id
usuarios.loja_id ──> lojas.id (opcional)
```
- Usuário pertence a uma empresa
- Pode estar vinculado a uma loja específica ou ter acesso global

#### 3. Tickets → Usuários/Lojas (N:1)
```sql
tickets.empresa_id ──> empresas.id
tickets.loja_id ──> lojas.id
tickets.usuario_criador_id ──> usuarios.id
tickets.usuario_atribuido_id ──> usuarios.id
```

#### 4. Ativos → Lojas (N:1)
```sql
ativos.empresa_id ──> empresas.id
ativos.loja_id ──> lojas.id
ativos.usuario_responsavel_id ──> usuarios.id
```

#### 5. Estoque → Multi-loja (N:N)
```sql
produtos.empresa_id ──> empresas.id
estoque_lojas.produto_id ──> produtos.id
estoque_lojas.loja_id ──> lojas.id
```
- Produtos globais da empresa
- Estoque específico por loja

---

## 🔐 Sistema de Autenticação e Autorização

### Fluxo de Autenticação

```
1. Login
   └─> POST /api/auth/login
       └─> Validar credenciais
           └─> Gerar JWT token
               └─> Retornar token + refresh token

2. Requisições Autenticadas
   └─> Header: Authorization: Bearer {token}
       └─> Middleware: verifyToken
           └─> Decodificar JWT
               └─> Carregar usuário
                   └─> Verificar permissões
                       └─> Executar ação

3. Refresh Token
   └─> POST /api/auth/refresh
       └─> Validar refresh token
           └─> Gerar novo JWT
```

### Estrutura do JWT

```json
{
  "id": 1,
  "uuid": "uuid-do-usuario",
  "email": "usuario@empresa.com",
  "empresa_id": 1,
  "loja_id": 2,
  "tipo_usuario": "admin",
  "permissoes": ["tickets.criar", "tickets.editar"],
  "iat": 1699999999,
  "exp": 1700000000
}
```

### Sistema de Permissões

#### Níveis Hierárquicos

```
super_admin
    └─> Acesso total ao sistema
        └─> Gerenciar todas as empresas

admin (Empresa)
    └─> Acesso total à empresa
        └─> Gerenciar todas as lojas
            └─> Gerenciar todos os usuários

gerente (Loja)
    └─> Acesso total à sua loja
        └─> Visualizar outras lojas
            └─> Gerenciar equipe da loja

tecnico
    └─> Acesso a tickets e ativos
        └─> Pode ser atribuído a tickets
            └─> Registrar manutenções

usuario
    └─> Criar tickets
        └─> Visualizar seus tickets
            └─> Comentar em tickets
```

#### Verificação de Permissões

```typescript
// Middleware de permissão
export const checkPermission = (permission: string) => {
  return (req, res, next) => {
    const user = req.user;
    
    // Super admin bypass
    if (user.tipo_usuario === 'super_admin') {
      return next();
    }
    
    // Verificar permissão específica
    if (user.permissoes.includes(permission)) {
      return next();
    }
    
    return res.status(403).json({ error: 'Sem permissão' });
  };
};

// Uso nas rotas
router.post('/tickets', 
  verifyToken, 
  checkPermission('tickets.criar'),
  createTicket
);
```

---

## 📊 Módulos do Sistema

### 1. Módulo de Tickets

#### Fluxo de Vida de um Ticket

```
1. CRIAÇÃO
   └─> Status: aberto
       └─> Notificar equipe
           └─> Gerar número único

2. ATRIBUIÇÃO
   └─> Status: em_andamento
       └─> Atribuir técnico
           └─> Registrar no histórico
               └─> Notificar técnico

3. RESOLUÇÃO
   └─> Status: resolvido
       └─> Registrar solução
           └─> Calcular tempo
               └─> Notificar criador

4. AVALIAÇÃO
   └─> Cliente avalia (1-5 estrelas)
       └─> Adiciona comentário
           └─> Armazenar feedback

5. FECHAMENTO
   └─> Status: fechado
       └─> Arquivar ticket
           └─> Atualizar métricas
```

#### Estrutura de Dados

```typescript
interface Ticket {
  id: number;
  uuid: string;
  numero_ticket: string;        // TK-2024-0001
  
  // Relacionamentos
  empresa_id: number;
  loja_id: number;
  categoria_id: number;
  usuario_criador_id: number;
  usuario_atribuido_id: number;
  
  // Conteúdo
  titulo: string;
  descricao: string;
  
  // Classificação
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'aberto' | 'em_andamento' | 'aguardando' | 'resolvido' | 'fechado' | 'cancelado';
  
  // Timestamps
  data_abertura: Date;
  data_atribuicao: Date;
  data_resolucao: Date;
  data_fechamento: Date;
  
  // Métricas
  tempo_resposta: number;       // minutos
  tempo_resolucao: number;      // minutos
  
  // Avaliação
  avaliacao: number;            // 1-5
  comentario_avaliacao: string;
  
  // Extras
  tags: string[];
  anexos: Anexo[];
  metadados: object;
}
```

#### SLA e Métricas

```typescript
// Calcular SLA baseado na prioridade
const calculateSLA = (prioridade: string) => {
  const slas = {
    'urgente': 2 * 60,      // 2 horas
    'alta': 4 * 60,         // 4 horas
    'media': 8 * 60,        // 8 horas
    'baixa': 24 * 60        // 24 horas
  };
  return slas[prioridade];
};

// Métricas importantes
interface TicketMetrics {
  tempo_medio_resposta: number;
  tempo_medio_resolucao: number;
  taxa_resolucao: number;
  satisfacao_media: number;
  tickets_abertos: number;
  tickets_atrasados: number;
}
```

### 2. Módulo de Ativos

#### Ciclo de Vida do Ativo

```
1. AQUISIÇÃO
   └─> Cadastro no sistema
       └─> Gerar código patrimônio
           └─> Alocar à loja

2. OPERAÇÃO
   └─> Status: ativo
       └─> Manutenções preventivas
           └─> Registros de uso

3. MANUTENÇÃO
   └─> Status: manutencao
       └─> Registrar problema
           └─> Custo e solução
               └─> Próxima manutenção

4. TRANSFERÊNCIA
   └─> Mover entre lojas
       └─> Atualizar responsável
           └─> Registrar histórico

5. DESCARTE
   └─> Status: descartado
       └─> Motivo de descarte
           └─> Documentação
```

#### Estrutura de Dados

```typescript
interface Ativo {
  id: number;
  uuid: string;
  
  // Relacionamentos
  empresa_id: number;
  loja_id: number;
  categoria_id: number;
  usuario_responsavel_id: number;
  
  // Identificação
  nome: string;
  codigo_patrimonio: string;    // PAT-2024-0001
  numero_serie: string;
  modelo: string;
  fabricante: string;
  
  // Financeiro
  data_aquisicao: Date;
  valor_aquisicao: number;
  fornecedor: string;
  nota_fiscal: string;
  
  // Status
  status: 'ativo' | 'manutencao' | 'inativo' | 'descartado';
  localizacao: string;
  
  // Garantia
  garantia_meses: number;
  data_fim_garantia: Date;
  
  // Detalhes
  especificacoes: object;
  campos_customizados: object;
  anexos: Anexo[];
}

interface Manutencao {
  id: number;
  ativo_id: number;
  tipo: 'preventiva' | 'corretiva' | 'preditiva';
  descricao: string;
  data_manutencao: Date;
  custo: number;
  tecnico_responsavel: string;
  proximo_manutencao: Date;
  anexos: Anexo[];
}
```

### 3. Módulo de Estoque

#### Tipos de Movimentação

```
1. ENTRADA
   └─> Compra
   └─> Devolução de cliente
   └─> Ajuste de inventário
   └─> Transferência recebida

2. SAÍDA
   └─> Venda
   └─> Uso interno
   └─> Devolução para fornecedor
   └─> Transferência enviada

3. TRANSFERÊNCIA
   └─> Entre lojas
   └─> Rastreamento completo
   └─> Confirmação de recebimento

4. AJUSTE
   └─> Correção de inventário
   └─> Produtos danificados
   └─> Perdas
```

#### Estrutura de Dados

```typescript
interface Produto {
  id: number;
  uuid: string;
  
  // Relacionamentos
  empresa_id: number;
  categoria_id: number;
  
  // Identificação
  nome: string;
  codigo_sku: string;           // SKU-2024-0001
  codigo_barras: string;
  descricao: string;
  
  // Controle
  unidade_medida: string;       // UN, KG, L, M
  estoque_minimo: number;
  estoque_maximo: number;
  
  // Financeiro
  preco_custo: number;
  preco_venda: number;
  
  // Fornecedor
  fornecedor: string;
  localizacao: string;
  
  // Status
  ativo: boolean;
  imagem_url: string;
  especificacoes: object;
}

interface EstoqueLoja {
  id: number;
  produto_id: number;
  loja_id: number;
  quantidade: number;
  ultima_atualizacao: Date;
}

interface Movimentacao {
  id: number;
  produto_id: number;
  loja_id: number;
  usuario_id: number;
  
  tipo: 'entrada' | 'saida' | 'transferencia' | 'ajuste' | 'devolucao';
  quantidade: number;
  quantidade_anterior: number;
  quantidade_nova: number;
  
  motivo: string;
  documento: string;          // NF, Pedido, etc
  custo_unitario: number;
  valor_total: number;
  
  loja_destino_id: number;    // Para transferências
  
  created_at: Date;
}
```

#### Alertas de Estoque

```typescript
// Sistema de alertas automáticos
interface EstoqueAlert {
  tipo: 'estoque_baixo' | 'estoque_zerado' | 'estoque_excesso';
  produto_id: number;
  loja_id: number;
  quantidade_atual: number;
  quantidade_minima: number;
  quantidade_maxima: number;
}

// Verificação automática
const checkEstoqueAlerts = async (loja_id: number) => {
  const alerts = await db.query(`
    SELECT 
      p.id,
      p.nome,
      el.quantidade,
      p.estoque_minimo,
      p.estoque_maximo
    FROM estoque_lojas el
    JOIN produtos p ON el.produto_id = p.id
    WHERE el.loja_id = $1
    AND (
      el.quantidade <= p.estoque_minimo
      OR el.quantidade >= p.estoque_maximo
    )
  `, [loja_id]);
  
  return alerts;
};
```

---

## 📈 Dashboard e Métricas

### KPIs Principais

```typescript
interface DashboardMetrics {
  // Tickets
  tickets_abertos: number;
  tickets_atrasados: number;
  tempo_medio_resolucao: number;
  satisfacao_media: number;
  
  // Ativos
  total_ativos: number;
  ativos_manutencao: number;
  valor_total_ativos: number;
  proximas_manutencoes: number;
  
  // Estoque
  produtos_cadastrados: number;
  produtos_estoque_baixo: number;
  valor_total_estoque: number;
  movimentacoes_hoje: number;
  
  // Geral
  usuarios_ativos: number;
  lojas_ativas: number;
  atividade_7dias: number[];
}
```

### Queries Otimizadas

```sql
-- Dashboard de Tickets
SELECT 
  COUNT(*) FILTER (WHERE status = 'aberto') as abertos,
  COUNT(*) FILTER (WHERE status = 'em_andamento') as em_andamento,
  COUNT(*) FILTER (WHERE status = 'resolvido') as resolvidos,
  AVG(tempo_resolucao) as tempo_medio,
  AVG(avaliacao) as satisfacao_media
FROM tickets
WHERE empresa_id = $1
AND created_at >= NOW() - INTERVAL '30 days';

-- Dashboard de Ativos
SELECT 
  COUNT(*) as total,
  SUM(valor_aquisicao) as valor_total,
  COUNT(*) FILTER (WHERE status = 'manutencao') as em_manutencao,
  COUNT(*) FILTER (WHERE data_fim_garantia < NOW()) as sem_garantia
FROM ativos
WHERE empresa_id = $1;

-- Dashboard de Estoque
SELECT 
  COUNT(DISTINCT p.id) as produtos,
  SUM(el.quantidade * p.preco_custo) as valor_estoque,
  COUNT(*) FILTER (WHERE el.quantidade <= p.estoque_minimo) as alertas
FROM produtos p
LEFT JOIN estoque_lojas el ON p.id = el.produto_id
WHERE p.empresa_id = $1;
```

---

## 🔄 Auditoria e Logs

### Sistema de Auditoria

```typescript
interface LogAuditoria {
  id: number;
  empresa_id: number;
  usuario_id: number;
  
  acao: string;              // CREATE, UPDATE, DELETE, LOGIN, etc
  tabela: string;
  registro_id: number;
  
  dados_anteriores: object;
  dados_novos: object;
  
  ip_address: string;
  user_agent: string;
  
  created_at: Date;
}

// Função para registrar auditoria
const logAudit = async (data: {
  empresa_id: number;
  usuario_id: number;
  acao: string;
  tabela: string;
  registro_id: number;
  antes: object;
  depois: object;
  req: Request;
}) => {
  await db.query(`
    INSERT INTO logs_auditoria 
    (empresa_id, usuario_id, acao, tabela, registro_id, 
     dados_anteriores, dados_novos, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [
    data.empresa_id,
    data.usuario_id,
    data.acao,
    data.tabela,
    data.registro_id,
    JSON.stringify(data.antes),
    JSON.stringify(data.depois),
    data.req.ip,
    data.req.get('user-agent')
  ]);
};
```

---

## 🚀 Performance e Otimização

### Índices Importantes

```sql
-- Índices de performance
CREATE INDEX idx_tickets_empresa_status ON tickets(empresa_id, status);
CREATE INDEX idx_tickets_data_criacao ON tickets(created_at);
CREATE INDEX idx_ativos_empresa_status ON ativos(empresa_id, status);
CREATE INDEX idx_estoque_produto_loja ON estoque_lojas(produto_id, loja_id);
CREATE INDEX idx_usuarios_empresa_email ON usuarios(empresa_id, email);
```

### Cache com Redis

```typescript
// Cachear dados frequentes
const cacheKey = `dashboard:${empresa_id}:${loja_id}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await getDashboardData(empresa_id, loja_id);
await redis.set(cacheKey, JSON.stringify(data), 'EX', 300); // 5 min
return data;
```

### Paginação

```typescript
// Sempre paginar listas grandes
const limit = 20;
const offset = (page - 1) * limit;

const { rows } = await db.query(`
  SELECT * FROM tickets
  WHERE empresa_id = $1
  ORDER BY created_at DESC
  LIMIT $2 OFFSET $3
`, [empresa_id, limit, offset]);
```

---

## 🔒 Segurança

### Proteções Implementadas

1. **SQL Injection**: Prepared statements
2. **XSS**: Sanitização de inputs
3. **CSRF**: Tokens CSRF
4. **Rate Limiting**: Express rate limit
5. **Helmet**: Headers de segurança
6. **CORS**: Configuração restritiva
7. **JWT**: Tokens com expiração
8. **Bcrypt**: Hash de senhas

---

## 📱 Responsividade

### Breakpoints

```css
/* Mobile First */
sm: 640px   /* Tablets */
md: 768px   /* Tablets landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

---

**Documento vivo - Atualizado conforme o sistema evolui**