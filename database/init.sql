-- =============================================
-- SFERA TI - Sistema de Controle de Franquias
-- Banco de Dados PostgreSQL - VERSÃO ATUALIZADA
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELA: LOJAS (Franquias SFERA) - ATUALIZADA COM TIPO DE FRANQUIA
-- =============================================
CREATE TABLE lojas (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    
    -- NOVO: Tipo de Franquia
    tipo_franquia VARCHAR(50) CHECK (tipo_franquia IN ('Escritório', 'Levis', 'Hering', 'Boticário VD', 'Boticário Loja', 'Boticário Híbrida')),
    
    -- Dados Legais
    cnpj VARCHAR(18) UNIQUE,
    inscricao_estadual VARCHAR(50),
    razao_social VARCHAR(255),
    
    -- Endereço
    endereco TEXT,
    cidade VARCHAR(100),
    estado VARCHAR(2),
    cep VARCHAR(9),
    
    -- Contato
    telefone VARCHAR(20),
    email VARCHAR(255),
    
    -- Responsável
    gerente_nome VARCHAR(255),
    gerente_telefone VARCHAR(20),
    gerente_email VARCHAR(255),
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    data_inauguracao DATE,
    
    -- Observações
    observacoes TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: USUÁRIOS DO SISTEMA
-- =============================================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    
    telefone VARCHAR(20),
    cargo VARCHAR(100),
    
    -- Tipo de acesso
    tipo VARCHAR(50) DEFAULT 'usuario' CHECK (tipo IN ('admin', 'gerente', 'tecnico', 'usuario')),
    
    -- Foto de perfil
    avatar_url TEXT,
    
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Relacionamento usuário-loja (um usuário pode ter acesso a várias lojas)
CREATE TABLE usuario_lojas (
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    PRIMARY KEY (usuario_id, loja_id)
);

-- =============================================
-- TABELA: COMPUTADORES
-- =============================================
CREATE TABLE computadores (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    -- Identificação
    hostname VARCHAR(100),
    patrimonio VARCHAR(100),
    numero_serie VARCHAR(100),
    
    -- Hardware
    tipo VARCHAR(50) CHECK (tipo IN ('desktop', 'notebook', 'all-in-one')),
    marca VARCHAR(100),
    modelo VARCHAR(100),
    
    -- Especificações
    processador VARCHAR(100),
    memoria_ram VARCHAR(50),
    armazenamento VARCHAR(100),
    
    -- Sistema Operacional
    sistema_operacional VARCHAR(100),
    versao_so VARCHAR(50),
    
    -- Usuário que usa
    usuario_nome VARCHAR(255),
    setor VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'inativo', 'descartado')),
    data_aquisicao DATE,
    
    -- Fotos
    foto_url TEXT,
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: IMPRESSORAS - ATUALIZADA COM PROPRIEDADE
-- =============================================
CREATE TABLE impressoras (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    patrimonio VARCHAR(100),
    numero_serie VARCHAR(100),
    
    -- Hardware
    marca VARCHAR(100),
    modelo VARCHAR(100),
    tipo VARCHAR(50) CHECK (tipo IN ('laser', 'jato_tinta', 'matricial', 'multifuncional')),
    
    -- NOVO: Propriedade
    propriedade VARCHAR(20) DEFAULT 'propria' CHECK (propriedade IN ('propria', 'alugada')),
    
    -- Conexão
    ip_address VARCHAR(15),
    tipo_conexao VARCHAR(50) CHECK (tipo_conexao IN ('rede', 'usb', 'wireless')),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'inativo', 'descartado')),
    data_aquisicao DATE,
    
    -- Localização
    setor VARCHAR(100),
    
    -- Fotos
    foto_url TEXT,
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: CELULARES/CHIPS
-- =============================================
CREATE TABLE celulares (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    -- Identificação
    numero_linha VARCHAR(20) NOT NULL,
    patrimonio VARCHAR(100),
    imei VARCHAR(50),
    
    -- Aparelho
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    
    -- Plano
    operadora VARCHAR(100),
    tipo_plano VARCHAR(100),
    valor_mensal DECIMAL(10,2),
    
    -- Usuário
    usuario_nome VARCHAR(255),
    cargo_usuario VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado')),
    data_ativacao DATE,
    
    -- Fotos
    foto_url TEXT,
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: LINKS DE INTERNET - ATUALIZADA COM NOVOS CAMPOS
-- =============================================
CREATE TABLE links_internet (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    cp VARCHAR(50), -- NOVO: Centro de Processamento
    
    -- Titular - NOVOS CAMPOS
    titular VARCHAR(255),
    cnpj_titular VARCHAR(18),
    
    -- Fornecedor
    operadora VARCHAR(100) NOT NULL,
    tipo_conexao VARCHAR(50) CHECK (tipo_conexao IN ('fibra', 'radio', 'adsl', 'cabo', 'satelite')),
    
    -- Velocidades
    velocidade_download VARCHAR(50),
    velocidade_upload VARCHAR(50),
    
    -- Contrato
    numero_contrato VARCHAR(100),
    valor_mensal DECIMAL(10,2),
    valor_anual DECIMAL(10,2), -- NOVO
    dia_vencimento INTEGER,
    data_vencimento VARCHAR(10), -- NOVO: formato DD/MM
    data_instalacao DATE,
    
    -- Contato
    linha_fixa VARCHAR(20), -- NOVO
    
    -- IP
    ip_fixo VARCHAR(15),
    ip_range VARCHAR(50),
    
    -- Acesso - NOVOS CAMPOS
    link_acesso TEXT,
    login_acesso VARCHAR(255),
    senha_acesso VARCHAR(255),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'cancelado')),
    
    -- Principal ou Backup
    principal BOOLEAN DEFAULT false,
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: EQUIPAMENTOS DE REDE
-- =============================================
CREATE TABLE equipamentos_rede (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) CHECK (tipo IN ('switch', 'roteador', 'firewall', 'access_point', 'modem', 'rack', 'nobreak')),
    
    -- Hardware
    marca VARCHAR(100),
    modelo VARCHAR(100),
    numero_serie VARCHAR(100),
    patrimonio VARCHAR(100),
    
    -- Especificações
    portas_total INTEGER,
    portas_usadas INTEGER,
    
    -- Rede
    ip_address VARCHAR(15),
    mac_address VARCHAR(17),
    
    -- Localização no Rack
    posicao_rack VARCHAR(50),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'inativo', 'descartado')),
    data_aquisicao DATE,
    
    -- Fotos
    foto_url TEXT,
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- NOVA TABELA: FORNECEDORES
-- =============================================
CREATE TABLE fornecedores (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    -- Identificação
    nome VARCHAR(255) NOT NULL,
    razao_social VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    
    -- Classificação
    segmento VARCHAR(100) NOT NULL,
    
    -- Contato
    telefone_comercial VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    
    -- Endereço
    endereco TEXT,
    
    -- Online
    portal_web TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- NOVA TABELA: CFTV (DVR/NVR)
-- =============================================
CREATE TABLE cftv_dispositivos (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    -- Identificação
    cp VARCHAR(50), -- Centro de Processamento
    
    -- Dispositivos
    quantidade_dispositivos INTEGER DEFAULT 1,
    
    -- Canais
    total_canais INTEGER NOT NULL,
    canais_em_uso INTEGER NOT NULL,
    
    -- Hardware
    tecnologia VARCHAR(10) CHECK (tecnologia IN ('DVR', 'NVR')) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    numero_serie VARCHAR(100),
    
    -- Rede
    ip_address VARCHAR(15),
    ddns VARCHAR(255),
    porta_acesso INTEGER DEFAULT 8000,
    
    -- Acesso
    usuario_acesso VARCHAR(100),
    senha_acesso VARCHAR(100),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'manutencao', 'inativo')),
    data_instalacao DATE,
    
    -- Fotos
    foto_url TEXT,
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: FOTOS DO RACK E INFRAESTRUTURA
-- =============================================
CREATE TABLE fotos_infraestrutura (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50) CHECK (tipo IN ('rack_frontal', 'rack_traseiro', 'cabeamento', 'quadro_eletrico', 'sala_ti', 'outros')),
    
    foto_url TEXT NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: SOFTWARES E LICENÇAS
-- =============================================
CREATE TABLE softwares (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    nome VARCHAR(255) NOT NULL,
    fabricante VARCHAR(100),
    versao VARCHAR(50),
    
    -- Licença
    tipo_licenca VARCHAR(50) CHECK (tipo_licenca IN ('perpetua', 'assinatura', 'gratuita')),
    chave_licenca TEXT,
    numero_serie TEXT,
    
    -- Quantidades
    quantidade_licencas INTEGER,
    licencas_em_uso INTEGER,
    
    -- Financeiro
    valor_mensal DECIMAL(10,2),
    data_vencimento DATE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'expirado', 'cancelado')),
    
    observacoes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: CHAMADOS/TICKETS DE SUPORTE - ATUALIZADA
-- =============================================
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    numero VARCHAR(50) UNIQUE NOT NULL,
    
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    usuario_criador_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    usuario_responsavel_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    
    categoria VARCHAR(50) CHECK (categoria IN ('hardware', 'software', 'rede', 'impressora', 'celular', 'cftv', 'outros')),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    status VARCHAR(50) DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'aguardando', 'resolvido', 'fechado')),
    
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_resolucao TIMESTAMP,
    
    solucao TEXT,
    tempo_resolucao INTEGER, -- em minutos
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: COMENTÁRIOS NOS TICKETS
-- =============================================
CREATE TABLE ticket_comentarios (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER REFERENCES tickets(id) ON DELETE CASCADE,
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    
    comentario TEXT NOT NULL,
    interno BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: HISTÓRICO DE MANUTENÇÕES
-- =============================================
CREATE TABLE manutencoes (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    
    -- Relacionamento polimórfico (pode ser computador, impressora, etc)
    equipamento_tipo VARCHAR(50) NOT NULL,
    equipamento_id INTEGER NOT NULL,
    
    tipo VARCHAR(50) CHECK (tipo IN ('preventiva', 'corretiva', 'instalacao', 'atualizacao')),
    
    data_manutencao DATE NOT NULL,
    tecnico_responsavel VARCHAR(255),
    
    descricao TEXT NOT NULL,
    solucao TEXT,
    
    custo DECIMAL(10,2),
    
    proxima_manutencao DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TABELA: DASHBOARD - MÉTRICAS
-- =============================================
CREATE TABLE metricas_dashboard (
    id SERIAL PRIMARY KEY,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE CASCADE,
    data_referencia DATE NOT NULL,
    
    -- Computadores
    total_computadores INTEGER DEFAULT 0,
    computadores_ativos INTEGER DEFAULT 0,
    computadores_manutencao INTEGER DEFAULT 0,
    
    -- Impressoras
    total_impressoras INTEGER DEFAULT 0,
    impressoras_ativas INTEGER DEFAULT 0,
    
    -- Celulares
    total_celulares INTEGER DEFAULT 0,
    celulares_ativos INTEGER DEFAULT 0,
    
    -- Links
    total_links INTEGER DEFAULT 0,
    links_ativos INTEGER DEFAULT 0,
    
    -- Tickets
    tickets_abertos INTEGER DEFAULT 0,
    tickets_resolvidos_mes INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(loja_id, data_referencia)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_lojas_tipo_franquia ON lojas(tipo_franquia);
CREATE INDEX idx_computadores_loja ON computadores(loja_id);
CREATE INDEX idx_impressoras_loja ON impressoras(loja_id);
CREATE INDEX idx_impressoras_propriedade ON impressoras(propriedade);
CREATE INDEX idx_celulares_loja ON celulares(loja_id);
CREATE INDEX idx_links_loja ON links_internet(loja_id);
CREATE INDEX idx_equipamentos_loja ON equipamentos_rede(loja_id);
CREATE INDEX idx_fornecedores_segmento ON fornecedores(segmento);
CREATE INDEX idx_fornecedores_status ON fornecedores(status);
CREATE INDEX idx_cftv_loja ON cftv_dispositivos(loja_id);
CREATE INDEX idx_cftv_tecnologia ON cftv_dispositivos(tecnologia);
CREATE INDEX idx_tickets_loja ON tickets(loja_id);
CREATE INDEX idx_tickets_status ON tickets(status);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_lojas_updated_at BEFORE UPDATE ON lojas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_computadores_updated_at BEFORE UPDATE ON computadores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_impressoras_updated_at BEFORE UPDATE ON impressoras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_celulares_updated_at BEFORE UPDATE ON celulares FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON links_internet FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_equipamentos_updated_at BEFORE UPDATE ON equipamentos_rede FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_fornecedores_updated_at BEFORE UPDATE ON fornecedores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cftv_updated_at BEFORE UPDATE ON cftv_dispositivos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS ÚTEIS - ATUALIZADAS
-- =============================================

-- View: Resumo de cada loja
CREATE OR REPLACE VIEW vw_resumo_lojas AS
SELECT 
    l.id,
    l.nome,
    l.codigo,
    l.tipo_franquia,
    l.cidade,
    l.gerente_nome,
    
    -- Contadores
    COUNT(DISTINCT c.id) as total_computadores,
    COUNT(DISTINCT i.id) as total_impressoras,
    COUNT(DISTINCT cel.id) as total_celulares,
    COUNT(DISTINCT li.id) as total_links,
    COUNT(DISTINCT cf.id) as total_cftv,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status IN ('aberto', 'em_andamento')) as tickets_abertos,
    
    l.ativo
FROM lojas l
LEFT JOIN computadores c ON l.id = c.loja_id AND c.status = 'ativo'
LEFT JOIN impressoras i ON l.id = i.loja_id AND i.status = 'ativo'
LEFT JOIN celulares cel ON l.id = cel.loja_id AND cel.status = 'ativo'
LEFT JOIN links_internet li ON l.id = li.loja_id AND li.status = 'ativo'
LEFT JOIN cftv_dispositivos cf ON l.id = cf.loja_id AND cf.status = 'ativo'
LEFT JOIN tickets t ON l.id = t.loja_id
GROUP BY l.id;

-- View: Inventário completo por loja
CREATE OR REPLACE VIEW vw_inventario_loja AS
SELECT 
    l.id as loja_id,
    l.nome as loja_nome,
    'computador' as tipo_equipamento,
    c.id as equipamento_id,
    c.hostname as nome,
    c.marca,
    c.modelo,
    c.status,
    c.foto_url
FROM lojas l
LEFT JOIN computadores c ON l.id = c.loja_id
WHERE c.id IS NOT NULL

UNION ALL

SELECT 
    l.id,
    l.nome,
    'impressora',
    i.id,
    i.nome,
    i.marca,
    i.modelo,
    i.status,
    i.foto_url
FROM lojas l
LEFT JOIN impressoras i ON l.id = i.loja_id
WHERE i.id IS NOT NULL

UNION ALL

SELECT 
    l.id,
    l.nome,
    'celular',
    cel.id,
    cel.numero_linha,
    cel.marca,
    cel.modelo,
    cel.status,
    cel.foto_url
FROM lojas l
LEFT JOIN celulares cel ON l.id = cel.loja_id
WHERE cel.id IS NOT NULL;

-- =============================================
-- DADOS INICIAIS
-- =============================================

-- Usuário Admin
INSERT INTO usuarios (nome, email, senha, tipo) 
VALUES ('Administrador SFERA', 'admin@sfera.com.br', '$2b$10$8Hs3qV9z3X6T9.K9mNt0KO0RVqE5FYqO8K6kNxLX5VYqN8KqX5K6K', 'admin');
-- Senha: admin123

-- Loja Exemplo
INSERT INTO lojas (nome, codigo, tipo_franquia, cnpj, cidade, estado, gerente_nome, telefone) 
VALUES ('SFERA - Loja Matriz', 'SF001', 'Escritório', '00.000.000/0001-00', 'São Paulo', 'SP', 'João Silva', '(11) 98765-4321');

-- =============================================
-- FUNÇÃO: Gerar número de ticket automático
-- =============================================
CREATE OR REPLACE FUNCTION gerar_numero_ticket()
RETURNS TRIGGER AS $$
DECLARE
    ano VARCHAR(4);
    contador INTEGER;
    novo_numero VARCHAR(50);
BEGIN
    ano := EXTRACT(YEAR FROM CURRENT_DATE)::VARCHAR;
    
    SELECT COUNT(*) + 1 INTO contador
    FROM tickets
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    novo_numero := 'TK-' || ano || '-' || LPAD(contador::VARCHAR, 4, '0');
    NEW.numero := novo_numero;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_gerar_numero_ticket
    BEFORE INSERT ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION gerar_numero_ticket();

-- =============================================
-- FIM DO SCHEMA
-- =============================================