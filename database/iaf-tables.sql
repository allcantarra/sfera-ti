-- =============================================
-- TABELAS PARA MÓDULO IAF
-- =============================================

-- Tabela: Inventário de Computadores (IAF)
CREATE TABLE inventario_computadores (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    -- Identificação
    cod_loja VARCHAR(50) NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE SET NULL,
    local VARCHAR(255),
    computador VARCHAR(255) NOT NULL,
    modelo VARCHAR(255),
    tag VARCHAR(100),
    
    -- Especificações
    memoria VARCHAR(50),
    
    -- Garantia
    termino_garantia DATE,
    dias_para_vencer INTEGER, -- Calculado automaticamente
    status_garantia VARCHAR(20), -- 'vigente', 'vencendo', 'vencida'
    
    -- Tempo de Uso
    tempo_uso_anos INTEGER,
    
    -- Controle
    arquivo_origem VARCHAR(255),
    data_importacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Inventário de Celulares (IAF)
CREATE TABLE inventario_celulares (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    -- Identificação
    cod_loja VARCHAR(50) NOT NULL,
    loja_id INTEGER REFERENCES lojas(id) ON DELETE SET NULL,
    local VARCHAR(255),
    celular VARCHAR(255) NOT NULL,
    modelo VARCHAR(255),
    modelo_detalhado VARCHAR(255),
    
    -- Garantia
    termino_garantia DATE,
    dias_para_vencer INTEGER,
    status_garantia VARCHAR(20),
    
    -- Status
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'em_manutencao')),
    
    -- Controle
    arquivo_origem VARCHAR(255),
    data_importacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: Histórico de Uploads IAF
CREATE TABLE iaf_uploads (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    
    usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    
    tipo VARCHAR(50) NOT NULL, -- 'computadores' ou 'celulares'
    nome_arquivo VARCHAR(255) NOT NULL,
    
    registros_inseridos INTEGER DEFAULT 0,
    registros_atualizados INTEGER DEFAULT 0,
    registros_removidos INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX idx_inv_comp_loja ON inventario_computadores(cod_loja);
CREATE INDEX idx_inv_comp_garantia ON inventario_computadores(termino_garantia);
CREATE INDEX idx_inv_comp_status ON inventario_computadores(status_garantia);
CREATE INDEX idx_inv_comp_dias ON inventario_computadores(dias_para_vencer);

CREATE INDEX idx_inv_cel_loja ON inventario_celulares(cod_loja);
CREATE INDEX idx_inv_cel_garantia ON inventario_celulares(termino_garantia);
CREATE INDEX idx_inv_cel_status_garantia ON inventario_celulares(status_garantia);
CREATE INDEX idx_inv_cel_status ON inventario_celulares(status);

-- =============================================
-- FUNÇÃO: Atualizar Status de Garantia
-- =============================================

CREATE OR REPLACE FUNCTION atualizar_status_garantia()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular dias para vencer
    IF NEW.termino_garantia IS NOT NULL THEN
        NEW.dias_para_vencer := NEW.termino_garantia - CURRENT_DATE;
        
        -- Definir status da garantia
        IF NEW.dias_para_vencer < 0 THEN
            NEW.status_garantia := 'vencida';
        ELSIF NEW.dias_para_vencer <= 120 THEN
            NEW.status_garantia := 'vencendo';
        ELSE
            NEW.status_garantia := 'vigente';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar automaticamente
CREATE TRIGGER trigger_status_garantia_computadores
    BEFORE INSERT OR UPDATE ON inventario_computadores
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_status_garantia();

CREATE TRIGGER trigger_status_garantia_celulares
    BEFORE INSERT OR UPDATE ON inventario_celulares
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_status_garantia();

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_inv_comp_updated_at 
    BEFORE UPDATE ON inventario_computadores 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inv_cel_updated_at 
    BEFORE UPDATE ON inventario_celulares 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VIEWS ÚTEIS
-- =============================================

-- View: Alertas de Garantia (≤ 120 dias)
CREATE OR REPLACE VIEW vw_alertas_garantia AS
SELECT 
    'computador' as tipo_equipamento,
    c.id,
    c.cod_loja,
    l.nome as loja_nome,
    c.local,
    c.computador as equipamento,
    c.modelo,
    c.termino_garantia,
    c.dias_para_vencer,
    c.status_garantia
FROM inventario_computadores c
LEFT JOIN lojas l ON c.loja_id = l.id
WHERE c.dias_para_vencer IS NOT NULL AND c.dias_para_vencer <= 120

UNION ALL

SELECT 
    'celular' as tipo_equipamento,
    cel.id,
    cel.cod_loja,
    l.nome as loja_nome,
    cel.local,
    cel.celular as equipamento,
    cel.modelo,
    cel.termino_garantia,
    cel.dias_para_vencer,
    cel.status_garantia
FROM inventario_celulares cel
LEFT JOIN lojas l ON cel.loja_id = l.id
WHERE cel.dias_para_vencer IS NOT NULL AND cel.dias_para_vencer <= 120

ORDER BY dias_para_vencer ASC;

-- View: Resumo IAF por Loja
CREATE OR REPLACE VIEW vw_iaf_resumo_lojas AS
SELECT 
    l.id as loja_id,
    l.codigo as cod_loja,
    l.nome as loja_nome,
    
    -- Computadores
    COUNT(DISTINCT c.id) as total_computadores,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status_garantia = 'vigente') as comp_vigente,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status_garantia = 'vencendo') as comp_vencendo,
    COUNT(DISTINCT c.id) FILTER (WHERE c.status_garantia = 'vencida') as comp_vencida,
    
    -- Celulares
    COUNT(DISTINCT cel.id) as total_celulares,
    COUNT(DISTINCT cel.id) FILTER (WHERE cel.status_garantia = 'vigente') as cel_vigente,
    COUNT(DISTINCT cel.id) FILTER (WHERE cel.status_garantia = 'vencendo') as cel_vencendo,
    COUNT(DISTINCT cel.id) FILTER (WHERE cel.status_garantia = 'vencida') as cel_vencida,
    
    -- Alertas
    COUNT(DISTINCT c.id) FILTER (WHERE c.dias_para_vencer <= 120) as alertas_comp,
    COUNT(DISTINCT cel.id) FILTER (WHERE cel.dias_para_vencer <= 120) as alertas_cel,
    
    -- Última atualização
    GREATEST(
        MAX(c.updated_at),
        MAX(cel.updated_at)
    ) as ultima_atualizacao
    
FROM lojas l
LEFT JOIN inventario_computadores c ON l.codigo = c.cod_loja
LEFT JOIN inventario_celulares cel ON l.codigo = cel.cod_loja
GROUP BY l.id, l.codigo, l.nome;

-- View: Estatísticas Gerais IAF
CREATE OR REPLACE VIEW vw_iaf_estatisticas_gerais AS
SELECT 
    -- Totais
    (SELECT COUNT(*) FROM inventario_computadores) as total_computadores,
    (SELECT COUNT(*) FROM inventario_celulares) as total_celulares,
    
    -- Garantias Vigentes
    (SELECT COUNT(*) FROM inventario_computadores WHERE status_garantia = 'vigente') as comp_vigente,
    (SELECT COUNT(*) FROM inventario_celulares WHERE status_garantia = 'vigente') as cel_vigente,
    
    -- Garantias Vencendo (≤ 120 dias)
    (SELECT COUNT(*) FROM inventario_computadores WHERE status_garantia = 'vencendo') as comp_vencendo,
    (SELECT COUNT(*) FROM inventario_celulares WHERE status_garantia = 'vencendo') as cel_vencendo,
    
    -- Garantias Vencidas
    (SELECT COUNT(*) FROM inventario_computadores WHERE status_garantia = 'vencida') as comp_vencida,
    (SELECT COUNT(*) FROM inventario_celulares WHERE status_garantia = 'vencida') as cel_vencida,
    
    -- Alertas Totais
    (SELECT COUNT(*) FROM vw_alertas_garantia) as total_alertas,
    
    -- Última Atualização
    GREATEST(
        (SELECT MAX(updated_at) FROM inventario_computadores),
        (SELECT MAX(updated_at) FROM inventario_celulares)
    ) as ultima_atualizacao;

-- =============================================
-- FUNÇÃO: Limpar dados antigos antes de nova importação
-- =============================================

CREATE OR REPLACE FUNCTION limpar_inventario_antes_importacao(
    p_tipo VARCHAR,
    p_arquivo VARCHAR
)
RETURNS TABLE(removidos INTEGER) AS $$
DECLARE
    v_removidos INTEGER;
BEGIN
    IF p_tipo = 'computadores' THEN
        DELETE FROM inventario_computadores 
        WHERE arquivo_origem != p_arquivo OR arquivo_origem IS NULL;
        GET DIAGNOSTICS v_removidos = ROW_COUNT;
    ELSIF p_tipo = 'celulares' THEN
        DELETE FROM inventario_celulares 
        WHERE arquivo_origem != p_arquivo OR arquivo_origem IS NULL;
        GET DIAGNOSTICS v_removidos = ROW_COUNT;
    END IF;
    
    RETURN QUERY SELECT v_removidos;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- JOB DIÁRIO: Atualizar status de garantias
-- =============================================

-- Essa função pode ser chamada por um cron job ou agendador
CREATE OR REPLACE FUNCTION atualizar_todos_status_garantia()
RETURNS void AS $$
BEGIN
    -- Atualizar computadores
    UPDATE inventario_computadores
    SET 
        dias_para_vencer = termino_garantia - CURRENT_DATE,
        status_garantia = CASE
            WHEN termino_garantia - CURRENT_DATE < 0 THEN 'vencida'
            WHEN termino_garantia - CURRENT_DATE <= 120 THEN 'vencendo'
            ELSE 'vigente'
        END
    WHERE termino_garantia IS NOT NULL;
    
    -- Atualizar celulares
    UPDATE inventario_celulares
    SET 
        dias_para_vencer = termino_garantia - CURRENT_DATE,
        status_garantia = CASE
            WHEN termino_garantia - CURRENT_DATE < 0 THEN 'vencida'
            WHEN termino_garantia - CURRENT_DATE <= 120 THEN 'vencendo'
            ELSE 'vigente'
        END
    WHERE termino_garantia IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FIM DAS TABELAS IAF
-- =============================================