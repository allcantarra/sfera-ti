const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsers PRIMEIRO (SEM CORS - o Nginx cuida disso)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Criar pasta de uploads se não existir
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
    console.log('📁 Pasta uploads criada!');
}

// Middleware de log de requisições
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`, req.body ? JSON.stringify(req.body).substring(0, 100) : '');
    next();
});

// Configuração do multer para upload de fotos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Configuração do banco de dados
const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'triloga_empresarial',
    user: process.env.DB_USER || 'triloga_admin',
    password: process.env.DB_PASSWORD || 'Tr1l0g@2024!Secure',
});

// Testar conexão do banco
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erro ao conectar no banco:', err.stack);
    } else {
        console.log('✅ Conectado ao PostgreSQL!');
        release();
    }
});

// Middleware de autenticação
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'triloga_jwt_secret');
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// =============================================
// ROTAS DE AUTENTICAÇÃO
// =============================================

app.post('/api/auth/login', async (req, res) => {
    console.log('🔐 Tentativa de login:', req.body.email);
    
    const { email, senha } = req.body;
    
    if (!email || !senha) {
        console.log('❌ Email ou senha não fornecidos');
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            console.log('❌ Usuário não encontrado:', email);
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        const user = result.rows[0];
        console.log('👤 Usuário encontrado:', user.nome);
        
        const senhaValida = await bcrypt.compare(senha, user.senha);
        
        if (!senhaValida) {
            console.log('❌ Senha inválida para:', email);
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }
        
        // Atualizar último acesso
        await pool.query('UPDATE usuarios SET ultimo_acesso = NOW() WHERE id = $1', [user.id]);
        
        const token = jwt.sign(
            { id: user.id, email: user.email, tipo: user.tipo },
            process.env.JWT_SECRET || 'triloga_jwt_secret',
            { expiresIn: '24h' }
        );
        
        console.log('✅ Login bem-sucedido:', user.email);
        
        res.json({
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                tipo: user.tipo,
                avatar_url: user.avatar_url
            }
        });
    } catch (err) {
        console.error('❌ Erro no login:', err);
        res.status(500).json({ error: 'Erro no servidor', details: err.message });
    }
});

app.get('/api/auth/me', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nome, email, tipo, cargo, telefone, avatar_url, ativo FROM usuarios WHERE id = $1',
            [req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
});

// =============================================
// ROTAS DE DASHBOARD - ATUALIZADA
// =============================================

app.get('/api/dashboard/geral', authenticate, async (req, res) => {
    try {
        const stats = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM lojas WHERE ativo = true) as total_lojas,
                (SELECT COUNT(*) FROM computadores WHERE status = 'ativo') as total_computadores,
                (SELECT COUNT(*) FROM impressoras WHERE status = 'ativo') as total_impressoras,
                (SELECT COUNT(*) FROM celulares WHERE status = 'ativo') as total_celulares,
                (SELECT COUNT(*) FROM links_internet WHERE status = 'ativo') as total_links,
                (SELECT COUNT(*) FROM cftv_dispositivos WHERE status = 'ativo') as total_cftv,
                (SELECT COUNT(*) FROM fornecedores WHERE status = 'ativo') as total_fornecedores,
                (SELECT COUNT(*) FROM tickets WHERE status IN ('aberto', 'em_andamento')) as tickets_abertos
        `);
        
        const lojas = await pool.query('SELECT * FROM vw_resumo_lojas ORDER BY nome');
        
        res.json({
            stats: stats.rows[0],
            lojas: lojas.rows
        });
    } catch (err) {
        console.error('Erro no dashboard:', err);
        res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
    }
});

app.get('/api/dashboard/loja/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    
    try {
        const loja = await pool.query('SELECT * FROM lojas WHERE id = $1', [id]);
        
        const computadores = await pool.query(
            'SELECT * FROM computadores WHERE loja_id = $1 ORDER BY hostname',
            [id]
        );
        
        const impressoras = await pool.query(
            'SELECT * FROM impressoras WHERE loja_id = $1 ORDER BY nome',
            [id]
        );
        
        const celulares = await pool.query(
            'SELECT * FROM celulares WHERE loja_id = $1 ORDER BY numero_linha',
            [id]
        );
        
        const links = await pool.query(
            'SELECT * FROM links_internet WHERE loja_id = $1 ORDER BY principal DESC',
            [id]
        );
        
        const equipamentosRede = await pool.query(
            'SELECT * FROM equipamentos_rede WHERE loja_id = $1 ORDER BY tipo',
            [id]
        );

        const cftv = await pool.query(
            'SELECT * FROM cftv_dispositivos WHERE loja_id = $1 ORDER BY created_at',
            [id]
        );
        
        const tickets = await pool.query(
            'SELECT * FROM tickets WHERE loja_id = $1 ORDER BY data_abertura DESC LIMIT 10',
            [id]
        );
        
        res.json({
            loja: loja.rows[0],
            computadores: computadores.rows,
            impressoras: impressoras.rows,
            celulares: celulares.rows,
            links: links.rows,
            equipamentos_rede: equipamentosRede.rows,
            cftv: cftv.rows,
            tickets: tickets.rows
        });
    } catch (err) {
        console.error('Erro ao buscar dados da loja:', err);
        res.status(500).json({ error: 'Erro ao buscar dados da loja' });
    }
});

// =============================================
// ROTAS DE LOJAS - ATUALIZADA COM FILTRO DE FRANQUIA
// =============================================

app.get('/api/lojas', authenticate, async (req, res) => {
    const { tipo_franquia } = req.query;
    
    try {
        let query = 'SELECT * FROM lojas';
        let params = [];
        
        if (tipo_franquia && tipo_franquia !== 'all') {
            query += ' WHERE tipo_franquia = $1';
            params.push(tipo_franquia);
        }
        
        query += ' ORDER BY nome';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar lojas' });
    }
});

app.get('/api/lojas/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM lojas WHERE id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar loja' });
    }
});

app.post('/api/lojas', authenticate, async (req, res) => {
    const { nome, codigo, tipo_franquia, cnpj, inscricao_estadual, razao_social, endereco, cidade, estado, cep, 
            telefone, email, gerente_nome, gerente_telefone, gerente_email, data_inauguracao, observacoes } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO lojas (nome, codigo, tipo_franquia, cnpj, inscricao_estadual, razao_social, endereco, cidade, estado, cep,
                               telefone, email, gerente_nome, gerente_telefone, gerente_email, data_inauguracao, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
            [nome, codigo, tipo_franquia, cnpj, inscricao_estadual, razao_social, endereco, cidade, estado, cep,
             telefone, email, gerente_nome, gerente_telefone, gerente_email, data_inauguracao, observacoes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar loja:', err);
        res.status(500).json({ error: 'Erro ao criar loja' });
    }
});

app.put('/api/lojas/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { nome, codigo, tipo_franquia, cnpj, inscricao_estadual, razao_social, endereco, cidade, estado, cep,
            telefone, email, gerente_nome, gerente_telefone, gerente_email, data_inauguracao, observacoes, ativo } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE lojas SET nome = $1, codigo = $2, tipo_franquia = $3, cnpj = $4, inscricao_estadual = $5, razao_social = $6,
                            endereco = $7, cidade = $8, estado = $9, cep = $10, telefone = $11, email = $12,
                            gerente_nome = $13, gerente_telefone = $14, gerente_email = $15, 
                            data_inauguracao = $16, observacoes = $17, ativo = $18
             WHERE id = $19 RETURNING *`,
            [nome, codigo, tipo_franquia, cnpj, inscricao_estadual, razao_social, endereco, cidade, estado, cep,
             telefone, email, gerente_nome, gerente_telefone, gerente_email, data_inauguracao, observacoes, ativo, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar loja:', err);
        res.status(500).json({ error: 'Erro ao atualizar loja' });
    }
});

app.delete('/api/lojas/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM lojas WHERE id = $1', [req.params.id]);
        res.json({ message: 'Loja deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar loja' });
    }
});

// =============================================
// ROTAS DE USUÁRIOS
// =============================================

app.get('/api/usuarios', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, nome, email, tipo, cargo, telefone, avatar_url, ativo, created_at FROM usuarios ORDER BY nome'
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
});

app.post('/api/usuarios', authenticate, async (req, res) => {
    const { nome, email, senha, tipo, cargo, telefone } = req.body;
    
    try {
        const hashedSenha = await bcrypt.hash(senha, 10);
        
        const result = await pool.query(
            'INSERT INTO usuarios (nome, email, senha, tipo, cargo, telefone) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, nome, email, tipo, cargo, telefone',
            [nome, email, hashedSenha, tipo, cargo, telefone]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar usuário:', err);
        res.status(500).json({ error: 'Erro ao criar usuário' });
    }
});

app.put('/api/usuarios/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { nome, email, tipo, cargo, telefone, ativo } = req.body;
    
    try {
        const result = await pool.query(
            'UPDATE usuarios SET nome = $1, email = $2, tipo = $3, cargo = $4, telefone = $5, ativo = $6 WHERE id = $7 RETURNING id, nome, email, tipo, cargo, telefone, ativo',
            [nome, email, tipo, cargo, telefone, ativo, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
});

app.delete('/api/usuarios/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM usuarios WHERE id = $1', [req.params.id]);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
});

// =============================================
// ROTAS DE COMPUTADORES
// =============================================

app.get('/api/computadores', authenticate, async (req, res) => {
    const { loja_id } = req.query;
    try {
        const query = loja_id 
            ? 'SELECT * FROM computadores WHERE loja_id = $1 ORDER BY hostname'
            : 'SELECT * FROM computadores ORDER BY loja_id, hostname';
        const result = loja_id 
            ? await pool.query(query, [loja_id])
            : await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar computadores' });
    }
});

app.post('/api/computadores', authenticate, upload.single('foto'), async (req, res) => {
    const { loja_id, hostname, patrimonio, numero_serie, tipo, marca, modelo, processador,
            memoria_ram, armazenamento, sistema_operacional, versao_so, usuario_nome, setor, 
            status, data_aquisicao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const result = await pool.query(
            `INSERT INTO computadores (loja_id, hostname, patrimonio, numero_serie, tipo, marca, modelo, 
                                      processador, memoria_ram, armazenamento, sistema_operacional, versao_so,
                                      usuario_nome, setor, status, data_aquisicao, foto_url, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [loja_id, hostname, patrimonio, numero_serie, tipo, marca, modelo, processador, memoria_ram,
             armazenamento, sistema_operacional, versao_so, usuario_nome, setor, status, data_aquisicao, foto_url, observacoes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar computador:', err);
        res.status(500).json({ error: 'Erro ao criar computador' });
    }
});

app.put('/api/computadores/:id', authenticate, upload.single('foto'), async (req, res) => {
    const { id } = req.params;
    const { loja_id, hostname, patrimonio, numero_serie, tipo, marca, modelo, processador,
            memoria_ram, armazenamento, sistema_operacional, versao_so, usuario_nome, setor,
            status, data_aquisicao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : req.body.foto_url;
    
    try {
        const result = await pool.query(
            `UPDATE computadores SET loja_id = $1, hostname = $2, patrimonio = $3, numero_serie = $4, 
                                    tipo = $5, marca = $6, modelo = $7, processador = $8, memoria_ram = $9,
                                    armazenamento = $10, sistema_operacional = $11, versao_so = $12,
                                    usuario_nome = $13, setor = $14, status = $15, data_aquisicao = $16,
                                    foto_url = $17, observacoes = $18
             WHERE id = $19 RETURNING *`,
            [loja_id, hostname, patrimonio, numero_serie, tipo, marca, modelo, processador, memoria_ram,
             armazenamento, sistema_operacional, versao_so, usuario_nome, setor, status, data_aquisicao, foto_url, observacoes, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar computador:', err);
        res.status(500).json({ error: 'Erro ao atualizar computador' });
    }
});

app.delete('/api/computadores/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM computadores WHERE id = $1', [req.params.id]);
        res.json({ message: 'Computador deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar computador' });
    }
});

// =============================================
// ROTAS DE IMPRESSORAS - ATUALIZADA COM PROPRIEDADE
// =============================================

app.get('/api/impressoras', authenticate, async (req, res) => {
    const { loja_id } = req.query;
    try {
        const query = loja_id 
            ? 'SELECT * FROM impressoras WHERE loja_id = $1 ORDER BY nome'
            : 'SELECT * FROM impressoras ORDER BY loja_id, nome';
        const result = loja_id 
            ? await pool.query(query, [loja_id])
            : await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar impressoras' });
    }
});

app.post('/api/impressoras', authenticate, upload.single('foto'), async (req, res) => {
    const { loja_id, nome, patrimonio, numero_serie, marca, modelo, tipo, propriedade, ip_address,
            tipo_conexao, setor, status, data_aquisicao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const result = await pool.query(
            `INSERT INTO impressoras (loja_id, nome, patrimonio, numero_serie, marca, modelo, tipo, propriedade,
                                     ip_address, tipo_conexao, setor, status, data_aquisicao, foto_url, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
            [loja_id, nome, patrimonio, numero_serie, marca, modelo, tipo, propriedade || 'propria',
             ip_address, tipo_conexao, setor, status, data_aquisicao, foto_url, observacoes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar impressora:', err);
        res.status(500).json({ error: 'Erro ao criar impressora' });
    }
});

app.put('/api/impressoras/:id', authenticate, upload.single('foto'), async (req, res) => {
    const { id } = req.params;
    const { loja_id, nome, patrimonio, numero_serie, marca, modelo, tipo, propriedade, ip_address,
            tipo_conexao, setor, status, data_aquisicao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : req.body.foto_url;
    
    try {
        const result = await pool.query(
            `UPDATE impressoras SET loja_id = $1, nome = $2, patrimonio = $3, numero_serie = $4,
                                   marca = $5, modelo = $6, tipo = $7, propriedade = $8, ip_address = $9, tipo_conexao = $10,
                                   setor = $11, status = $12, data_aquisicao = $13, foto_url = $14, observacoes = $15
             WHERE id = $16 RETURNING *`,
            [loja_id, nome, patrimonio, numero_serie, marca, modelo, tipo, propriedade, ip_address, tipo_conexao,
             setor, status, data_aquisicao, foto_url, observacoes, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar impressora:', err);
        res.status(500).json({ error: 'Erro ao atualizar impressora' });
    }
});

app.delete('/api/impressoras/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM impressoras WHERE id = $1', [req.params.id]);
        res.json({ message: 'Impressora deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar impressora' });
    }
});

// =============================================
// ROTAS DE CELULARES
// =============================================

app.get('/api/celulares', authenticate, async (req, res) => {
    const { loja_id } = req.query;
    try {
        const query = loja_id 
            ? 'SELECT * FROM celulares WHERE loja_id = $1 ORDER BY numero_linha'
            : 'SELECT * FROM celulares ORDER BY loja_id, numero_linha';
        const result = loja_id 
            ? await pool.query(query, [loja_id])
            : await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar celulares' });
    }
});

app.post('/api/celulares', authenticate, upload.single('foto'), async (req, res) => {
    const { loja_id, numero_linha, patrimonio, imei, marca, modelo, numero_serie, operadora,
            tipo_plano, valor_mensal, usuario_nome, cargo_usuario, status, data_ativacao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const result = await pool.query(
            `INSERT INTO celulares (loja_id, numero_linha, patrimonio, imei, marca, modelo, numero_serie,
                                   operadora, tipo_plano, valor_mensal, usuario_nome, cargo_usuario,
                                   status, data_ativacao, foto_url, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [loja_id, numero_linha, patrimonio, imei, marca, modelo, numero_serie, operadora,
             tipo_plano, valor_mensal, usuario_nome, cargo_usuario, status, data_ativacao, foto_url, observacoes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar celular:', err);
        res.status(500).json({ error: 'Erro ao criar celular' });
    }
});

app.put('/api/celulares/:id', authenticate, upload.single('foto'), async (req, res) => {
    const { id } = req.params;
    const { loja_id, numero_linha, patrimonio, imei, marca, modelo, numero_serie, operadora,
            tipo_plano, valor_mensal, usuario_nome, cargo_usuario, status, data_ativacao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : req.body.foto_url;
    
    try {
        const result = await pool.query(
            `UPDATE celulares SET loja_id = $1, numero_linha = $2, patrimonio = $3, imei = $4,
                                 marca = $5, modelo = $6, numero_serie = $7, operadora = $8, tipo_plano = $9,
                                 valor_mensal = $10, usuario_nome = $11, cargo_usuario = $12, status = $13,
                                 data_ativacao = $14, foto_url = $15, observacoes = $16
             WHERE id = $17 RETURNING *`,
            [loja_id, numero_linha, patrimonio, imei, marca, modelo, numero_serie, operadora, tipo_plano,
             valor_mensal, usuario_nome, cargo_usuario, status, data_ativacao, foto_url, observacoes, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar celular:', err);
        res.status(500).json({ error: 'Erro ao atualizar celular' });
    }
});

app.delete('/api/celulares/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM celulares WHERE id = $1', [req.params.id]);
        res.json({ message: 'Celular deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar celular' });
    }
});

// =============================================
// ROTAS DE LINKS DE INTERNET - ATUALIZADA COM NOVOS CAMPOS
// =============================================

app.get('/api/links', authenticate, async (req, res) => {
    const { loja_id } = req.query;
    try {
        const query = loja_id 
            ? 'SELECT * FROM links_internet WHERE loja_id = $1 ORDER BY principal DESC, nome'
            : 'SELECT * FROM links_internet ORDER BY loja_id, principal DESC, nome';
        const result = loja_id 
            ? await pool.query(query, [loja_id])
            : await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar links' });
    }
});

app.post('/api/links', authenticate, async (req, res) => {
    console.log('📝 Recebendo dados para criar link:', req.body);
    
    const { 
        loja_id, nome, cp, titular, cnpj_titular, operadora, tipo_conexao, 
        velocidade_download, velocidade_upload, numero_contrato, valor_mensal, valor_anual,
        dia_vencimento, data_vencimento, data_instalacao, linha_fixa,
        ip_fixo, ip_range, link_acesso, login_acesso, senha_acesso,
        status, principal, observacoes 
    } = req.body;
    
    if (!loja_id || !nome || !operadora) {
        return res.status(400).json({ 
            error: 'Campos obrigatórios faltando',
            required: ['loja_id', 'nome', 'operadora']
        });
    }
    
    try {
        const result = await pool.query(
            `INSERT INTO links_internet 
             (loja_id, nome, cp, titular, cnpj_titular, operadora, tipo_conexao, velocidade_download,
              velocidade_upload, numero_contrato, valor_mensal, valor_anual, dia_vencimento, data_vencimento,
              data_instalacao, linha_fixa, ip_fixo, ip_range, link_acesso, login_acesso, senha_acesso,
              status, principal, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24) 
             RETURNING *`,
            [loja_id, nome, cp, titular, cnpj_titular, operadora, tipo_conexao || 'fibra', velocidade_download,
             velocidade_upload, numero_contrato, valor_mensal, valor_anual, dia_vencimento, data_vencimento,
             data_instalacao, linha_fixa, ip_fixo, ip_range, link_acesso, login_acesso, senha_acesso,
             status || 'ativo', principal || false, observacoes]
        );
        
        console.log('✅ Link criado com sucesso:', result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Erro ao criar link:', err);
        res.status(500).json({ 
            error: 'Erro ao criar link',
            message: err.message,
            details: err.detail
        });
    }
});

app.put('/api/links/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { 
        loja_id, nome, cp, titular, cnpj_titular, operadora, tipo_conexao,
        velocidade_download, velocidade_upload, numero_contrato, valor_mensal, valor_anual,
        dia_vencimento, data_vencimento, data_instalacao, linha_fixa,
        ip_fixo, ip_range, link_acesso, login_acesso, senha_acesso,
        status, principal, observacoes 
    } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE links_internet 
             SET loja_id = $1, nome = $2, cp = $3, titular = $4, cnpj_titular = $5, operadora = $6, 
                 tipo_conexao = $7, velocidade_download = $8, velocidade_upload = $9, numero_contrato = $10,
                 valor_mensal = $11, valor_anual = $12, dia_vencimento = $13, data_vencimento = $14,
                 data_instalacao = $15, linha_fixa = $16, ip_fixo = $17, ip_range = $18,
                 link_acesso = $19, login_acesso = $20, senha_acesso = $21, status = $22, 
                 principal = $23, observacoes = $24
             WHERE id = $25 RETURNING *`,
            [loja_id, nome, cp, titular, cnpj_titular, operadora, tipo_conexao, velocidade_download,
             velocidade_upload, numero_contrato, valor_mensal, valor_anual, dia_vencimento, data_vencimento,
             data_instalacao, linha_fixa, ip_fixo, ip_range, link_acesso, login_acesso, senha_acesso,
             status, principal, observacoes, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar link:', err);
        res.status(500).json({ error: 'Erro ao atualizar link' });
    }
});

app.delete('/api/links/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM links_internet WHERE id = $1', [req.params.id]);
        res.json({ message: 'Link deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar link' });
    }
});

// =============================================
// ROTAS DE EQUIPAMENTOS DE REDE
// =============================================

app.get('/api/equipamentos-rede', authenticate, async (req, res) => {
    const { loja_id } = req.query;
    try {
        const query = loja_id 
            ? 'SELECT * FROM equipamentos_rede WHERE loja_id = $1 ORDER BY tipo, nome'
            : 'SELECT * FROM equipamentos_rede ORDER BY loja_id, tipo, nome';
        const result = loja_id 
            ? await pool.query(query, [loja_id])
            : await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar equipamentos de rede' });
    }
});

app.post('/api/equipamentos-rede', authenticate, upload.single('foto'), async (req, res) => {
    const { loja_id, nome, tipo, marca, modelo, numero_serie, patrimonio, portas_total,
            portas_usadas, ip_address, mac_address, posicao_rack, status, data_aquisicao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    try {
        const result = await pool.query(
            `INSERT INTO equipamentos_rede (loja_id, nome, tipo, marca, modelo, numero_serie, patrimonio,
                                           portas_total, portas_usadas, ip_address, mac_address, posicao_rack,
                                           status, data_aquisicao, foto_url, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING *`,
            [loja_id, nome, tipo, marca, modelo, numero_serie, patrimonio, portas_total, portas_usadas,
             ip_address, mac_address, posicao_rack, status, data_aquisicao, foto_url, observacoes]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar equipamento de rede:', err);
        res.status(500).json({ error: 'Erro ao criar equipamento de rede' });
    }
});

app.put('/api/equipamentos-rede/:id', authenticate, upload.single('foto'), async (req, res) => {
    const { id } = req.params;
    const { loja_id, nome, tipo, marca, modelo, numero_serie, patrimonio, portas_total,
            portas_usadas, ip_address, mac_address, posicao_rack, status, data_aquisicao, observacoes } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : req.body.foto_url;
    
    try {
        const result = await pool.query(
            `UPDATE equipamentos_rede SET loja_id = $1, nome = $2, tipo = $3, marca = $4, modelo = $5,
                                         numero_serie = $6, patrimonio = $7, portas_total = $8, portas_usadas = $9,
                                         ip_address = $10, mac_address = $11, posicao_rack = $12, status = $13,
                                         data_aquisicao = $14, foto_url = $15, observacoes = $16
             WHERE id = $17 RETURNING *`,
            [loja_id, nome, tipo, marca, modelo, numero_serie, patrimonio, portas_total, portas_usadas,
             ip_address, mac_address, posicao_rack, status, data_aquisicao, foto_url, observacoes, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar equipamento de rede:', err);
        res.status(500).json({ error: 'Erro ao atualizar equipamento de rede' });
    }
});

app.delete('/api/equipamentos-rede/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM equipamentos_rede WHERE id = $1', [req.params.id]);
        res.json({ message: 'Equipamento de rede deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar equipamento de rede' });
    }
});

// =============================================
// NOVAS ROTAS: FORNECEDORES
// =============================================

app.get('/api/fornecedores', authenticate, async (req, res) => {
    const { segmento, status } = req.query;
    
    try {
        let query = 'SELECT * FROM fornecedores WHERE 1=1';
        let params = [];
        let paramIndex = 1;
        
        if (segmento) {
            query += ` AND segmento = $${paramIndex}`;
            params.push(segmento);
            paramIndex++;
        }
        
        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }
        
        query += ' ORDER BY nome';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
        res.status(500).json({ error: 'Erro ao buscar fornecedores' });
    }
});

app.get('/api/fornecedores/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM fornecedores WHERE id = $1', [req.params.id]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar fornecedor' });
    }
});

app.post('/api/fornecedores', authenticate, async (req, res) => {
    const { nome, razao_social, cnpj, segmento, telefone_comercial, email, endereco, portal_web, status, observacoes } = req.body;
    
    console.log('📝 Criando fornecedor:', nome);
    
    try {
        const result = await pool.query(
            `INSERT INTO fornecedores (nome, razao_social, cnpj, segmento, telefone_comercial, email, endereco, portal_web, status, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [nome, razao_social, cnpj, segmento, telefone_comercial, email, endereco, portal_web, status || 'ativo', observacoes]
        );
        
        console.log('✅ Fornecedor criado:', result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Erro ao criar fornecedor:', err);
        res.status(500).json({ error: 'Erro ao criar fornecedor', details: err.message });
    }
});

app.put('/api/fornecedores/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { nome, razao_social, cnpj, segmento, telefone_comercial, email, endereco, portal_web, status, observacoes } = req.body;
    
    console.log('📝 Atualizando fornecedor:', id);
    
    try {
        const result = await pool.query(
            `UPDATE fornecedores 
             SET nome = $1, razao_social = $2, cnpj = $3, segmento = $4, telefone_comercial = $5, 
                 email = $6, endereco = $7, portal_web = $8, status = $9, observacoes = $10
             WHERE id = $11 RETURNING *`,
            [nome, razao_social, cnpj, segmento, telefone_comercial, email, endereco, portal_web, status, observacoes, id]
        );
        
        console.log('✅ Fornecedor atualizado:', id);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Erro ao atualizar fornecedor:', err);
        res.status(500).json({ error: 'Erro ao atualizar fornecedor', details: err.message });
    }
});

app.delete('/api/fornecedores/:id', authenticate, async (req, res) => {
    console.log('🗑️ Deletando fornecedor:', req.params.id);
    
    try {
        await pool.query('DELETE FROM fornecedores WHERE id = $1', [req.params.id]);
        console.log('✅ Fornecedor deletado');
        res.json({ message: 'Fornecedor deletado com sucesso' });
    } catch (err) {
        console.error('❌ Erro ao deletar fornecedor:', err);
        res.status(500).json({ error: 'Erro ao deletar fornecedor' });
    }
});

// =============================================
// NOVAS ROTAS: CFTV
// =============================================

app.get('/api/cftv', authenticate, async (req, res) => {
    const { loja_id, tecnologia } = req.query;
    
    try {
        let query = `
            SELECT c.*, l.nome as loja_nome 
            FROM cftv_dispositivos c 
            LEFT JOIN lojas l ON c.loja_id = l.id 
            WHERE 1=1
        `;
        let params = [];
        let paramIndex = 1;
        
        if (loja_id) {
            query += ` AND c.loja_id = $${paramIndex}`;
            params.push(loja_id);
            paramIndex++;
        }
        
        if (tecnologia) {
            query += ` AND c.tecnologia = $${paramIndex}`;
            params.push(tecnologia);
            paramIndex++;
        }
        
        query += ' ORDER BY l.nome, c.created_at DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar CFTV:', err);
        res.status(500).json({ error: 'Erro ao buscar dispositivos CFTV' });
    }
});

app.get('/api/cftv/:id', authenticate, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT c.*, l.nome as loja_nome 
             FROM cftv_dispositivos c 
             LEFT JOIN lojas l ON c.loja_id = l.id 
             WHERE c.id = $1`,
            [req.params.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar dispositivo CFTV' });
    }
});

app.post('/api/cftv', authenticate, upload.single('foto'), async (req, res) => {
    const { 
        loja_id, cp, quantidade_dispositivos, total_canais, canais_em_uso, 
        tecnologia, marca, modelo, numero_serie, ip_address, ddns, porta_acesso,
        usuario_acesso, senha_acesso, status, data_instalacao, observacoes 
    } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : null;
    
    console.log('📝 Criando dispositivo CFTV:', { loja_id, tecnologia, marca, modelo });
    
    try {
        const result = await pool.query(
            `INSERT INTO cftv_dispositivos 
             (loja_id, cp, quantidade_dispositivos, total_canais, canais_em_uso, tecnologia, marca, modelo, 
              numero_serie, ip_address, ddns, porta_acesso, usuario_acesso, senha_acesso, 
              status, data_instalacao, foto_url, observacoes)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18) RETURNING *`,
            [loja_id, cp, quantidade_dispositivos || 1, total_canais, canais_em_uso, tecnologia, marca, modelo,
             numero_serie, ip_address, ddns, porta_acesso || 8000, usuario_acesso, senha_acesso,
             status || 'ativo', data_instalacao, foto_url, observacoes]
        );
        
        console.log('✅ Dispositivo CFTV criado:', result.rows[0].id);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('❌ Erro ao criar dispositivo CFTV:', err);
        res.status(500).json({ error: 'Erro ao criar dispositivo CFTV', details: err.message });
    }
});

app.put('/api/cftv/:id', authenticate, upload.single('foto'), async (req, res) => {
    const { id } = req.params;
    const { 
        loja_id, cp, quantidade_dispositivos, total_canais, canais_em_uso, 
        tecnologia, marca, modelo, numero_serie, ip_address, ddns, porta_acesso,
        usuario_acesso, senha_acesso, status, data_instalacao, observacoes 
    } = req.body;
    
    const foto_url = req.file ? `/uploads/${req.file.filename}` : req.body.foto_url;
    
    console.log('📝 Atualizando dispositivo CFTV:', id);
    
    try {
        const result = await pool.query(
            `UPDATE cftv_dispositivos 
             SET loja_id = $1, cp = $2, quantidade_dispositivos = $3, total_canais = $4, canais_em_uso = $5,
                 tecnologia = $6, marca = $7, modelo = $8, numero_serie = $9, ip_address = $10, ddns = $11,
                 porta_acesso = $12, usuario_acesso = $13, senha_acesso = $14, status = $15,
                 data_instalacao = $16, foto_url = $17, observacoes = $18
             WHERE id = $19 RETURNING *`,
            [loja_id, cp, quantidade_dispositivos, total_canais, canais_em_uso, tecnologia, marca, modelo,
             numero_serie, ip_address, ddns, porta_acesso, usuario_acesso, senha_acesso, status,
             data_instalacao, foto_url, observacoes, id]
        );
        
        console.log('✅ Dispositivo CFTV atualizado:', id);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('❌ Erro ao atualizar dispositivo CFTV:', err);
        res.status(500).json({ error: 'Erro ao atualizar dispositivo CFTV', details: err.message });
    }
});

app.delete('/api/cftv/:id', authenticate, async (req, res) => {
    console.log('🗑️ Deletando dispositivo CFTV:', req.params.id);
    
    try {
        await pool.query('DELETE FROM cftv_dispositivos WHERE id = $1', [req.params.id]);
        console.log('✅ Dispositivo CFTV deletado');
        res.json({ message: 'Dispositivo CFTV deletado com sucesso' });
    } catch (err) {
        console
        console.error('❌ Erro ao deletar dispositivo CFTV:', err);
        res.status(500).json({ error: 'Erro ao deletar dispositivo CFTV' });
    }
});

// =============================================
// ROTAS DE FOTOS DA INFRAESTRUTURA
// =============================================

app.get('/api/fotos-infraestrutura', authenticate, async (req, res) => {
    const { loja_id } = req.query;
    try {
        const query = loja_id 
            ? 'SELECT * FROM fotos_infraestrutura WHERE loja_id = $1 ORDER BY created_at DESC'
            : 'SELECT * FROM fotos_infraestrutura ORDER BY loja_id, created_at DESC';
        const result = loja_id 
            ? await pool.query(query, [loja_id])
            : await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar fotos' });
    }
});

app.post('/api/fotos-infraestrutura', authenticate, upload.single('foto'), async (req, res) => {
    const { loja_id, titulo, descricao, tipo } = req.body;
    
    if (!req.file) {
        return res.status(400).json({ error: 'Foto é obrigatória' });
    }
    
    const foto_url = `/uploads/${req.file.filename}`;
    
    try {
        const result = await pool.query(
            'INSERT INTO fotos_infraestrutura (loja_id, titulo, descricao, tipo, foto_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [loja_id, titulo, descricao, tipo, foto_url]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao adicionar foto:', err);
        res.status(500).json({ error: 'Erro ao adicionar foto' });
    }
});

app.delete('/api/fotos-infraestrutura/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM fotos_infraestrutura WHERE id = $1', [req.params.id]);
        res.json({ message: 'Foto deletada com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar foto' });
    }
});

// =============================================
// ROTAS DE TICKETS
// =============================================

app.get('/api/tickets', authenticate, async (req, res) => {
    const { loja_id, status } = req.query;
    try {
        let query = 'SELECT t.*, l.nome as loja_nome, u.nome as criador_nome FROM tickets t LEFT JOIN lojas l ON t.loja_id = l.id LEFT JOIN usuarios u ON t.usuario_criador_id = u.id';
        const params = [];
        const conditions = [];
        
        if (loja_id) {
            params.push(loja_id);
            conditions.push(`t.loja_id = $${params.length}`);
        }
        
        if (status) {
            params.push(status);
            conditions.push(`t.status = $${params.length}`);
        }
        
        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }
        
        query += ' ORDER BY t.data_abertura DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao buscar tickets:', err);
        res.status(500).json({ error: 'Erro ao buscar tickets' });
    }
});

app.post('/api/tickets', authenticate, async (req, res) => {
    const { loja_id, titulo, descricao, categoria, prioridade } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO tickets (loja_id, usuario_criador_id, titulo, descricao, categoria, prioridade) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [loja_id, req.user.id, titulo, descricao, categoria, prioridade || 'media']
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar ticket:', err);
        res.status(500).json({ error: 'Erro ao criar ticket' });
    }
});

app.put('/api/tickets/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const { status, prioridade, usuario_responsavel_id, solucao } = req.body;
    
    try {
        let query = 'UPDATE tickets SET ';
        const updates = [];
        const params = [];
        let paramIndex = 1;
        
        if (status !== undefined) {
            params.push(status);
            updates.push(`status = $${paramIndex++}`);
            
            if (status === 'resolvido' || status === 'fechado') {
                updates.push(`data_resolucao = NOW()`);
            }
        }
        
        if (prioridade !== undefined) {
            params.push(prioridade);
            updates.push(`prioridade = $${paramIndex++}`);
        }
        
        if (usuario_responsavel_id !== undefined) {
            params.push(usuario_responsavel_id);
            updates.push(`usuario_responsavel_id = $${paramIndex++}`);
        }
        
        if (solucao !== undefined) {
            params.push(solucao);
            updates.push(`solucao = $${paramIndex++}`);
        }
        
        params.push(id);
        query += updates.join(', ') + ` WHERE id = $${paramIndex} RETURNING *`;
        
        const result = await pool.query(query, params);
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar ticket:', err);
        res.status(500).json({ error: 'Erro ao atualizar ticket' });
    }
});

app.delete('/api/tickets/:id', authenticate, async (req, res) => {
    try {
        await pool.query('DELETE FROM tickets WHERE id = $1', [req.params.id]);
        res.json({ message: 'Ticket deletado com sucesso' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao deletar ticket' });
    }
});

// Comentários em tickets
app.post('/api/tickets/:id/comentarios', authenticate, async (req, res) => {
    const { id } = req.params;
    const { comentario, interno } = req.body;
    
    try {
        const result = await pool.query(
            'INSERT INTO ticket_comentarios (ticket_id, usuario_id, comentario, interno) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, req.user.id, comentario, interno || false]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao adicionar comentário:', err);
        res.status(500).json({ error: 'Erro ao adicionar comentário' });
    }
});

app.get('/api/tickets/:id/comentarios', authenticate, async (req, res) => {
    const { id } = req.params;
    
    try {
        const result = await pool.query(
            'SELECT c.*, u.nome as usuario_nome FROM ticket_comentarios c LEFT JOIN usuarios u ON c.usuario_id = u.id WHERE c.ticket_id = $1 ORDER BY c.created_at',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar comentários' });
    }
});

// =============================================
// ROTA DE HEALTH CHECK
// =============================================

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'SFERA TI Backend rodando com todas as melhorias!',
        timestamp: new Date().toISOString(),
        version: '2.0.0'
    });
});

// =============================================
// INICIAR SERVIDOR
// =============================================

app.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 SFERA TI - Backend Iniciado!');
    console.log('📦 Versão 2.0 com todas as melhorias');
    console.log(`📡 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    console.log('========================================');
    console.log('✅ Novas funcionalidades:');
    console.log('   • Filtro de franquias nas lojas');
    console.log('   • Campo propriedade nas impressoras');
    console.log('   • Campos extras nos links de internet');
    console.log('   • Módulo completo de Fornecedores');
    console.log('   • Módulo completo de CFTV (DVR/NVR)');
    console.log('   • Dashboard atualizado');
    console.log('========================================');
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
    console.error('❌ Erro não tratado:', err);
});