// =============================================
// ROTAS IAF - Inventário e Alertas de Frota
// =============================================

const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();

// Essas variáveis serão passadas quando o módulo for importado
let pool;
let authenticate;

// Função para inicializar o módulo com as dependências
function initialize(dbPool, authMiddleware) {
    pool = dbPool;
    authenticate = authMiddleware;
}

// Configurar multer para upload de Excel
const storage = multer.memoryStorage();
const uploadExcel = multer({ 
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Apenas arquivos Excel são permitidos!'), false);
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// =============================================
// UPLOAD E PROCESSAMENTO DE EXCEL
// =============================================

router.post('/upload-computadores', (req, res, next) => {
    authenticate(req, res, () => {
        uploadExcel.single('arquivo')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }
            
            try {
                console.log('📊 Processando arquivo de computadores:', req.file.originalname);
                
                const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);
                
                console.log(`📋 ${data.length} linhas encontradas`);
                
                if (data.length === 0) {
                    return res.status(400).json({ error: 'Arquivo vazio ou sem dados' });
                }
                
                const client = await pool.connect();
                
                try {
                    await client.query('BEGIN');
                    
                    let inseridos = 0;
                    let atualizados = 0;
                    let erros = 0;
                    
                    for (const row of data) {
                        try {
                            const codLoja = row['Cód. Loja'] || row['Cod Loja'] || row['Loja'];
                            const local = row['Local'];
                            const computador = row['Computador'];
                            const modelo = row['Modelo'];
                            const tag = row['Tag'];
                            const memoria = row['Memória'] || row['Memoria'];
                            const terminoGarantia = parseExcelDate(row['Término Garantia']);
                            const tempoUsoAnos = parseInt(row['Tempo de Uso (Ano)']) || null;
                            
                            if (!codLoja || !computador) {
                                console.log('⚠️ Linha ignorada - faltam dados obrigatórios:', row);
                                erros++;
                                continue;
                            }
                            
                            const lojaResult = await client.query(
                                'SELECT id FROM lojas WHERE codigo = $1',
                                [codLoja]
                            );
                            const lojaId = lojaResult.rows.length > 0 ? lojaResult.rows[0].id : null;
                            
                            const existente = await client.query(
                                'SELECT id FROM inventario_computadores WHERE cod_loja = $1 AND computador = $2',
                                [codLoja, computador]
                            );
                            
                            if (existente.rows.length > 0) {
                                await client.query(
                                    `UPDATE inventario_computadores 
                                     SET loja_id = $1, local = $2, modelo = $3, tag = $4, memoria = $5,
                                         termino_garantia = $6, tempo_uso_anos = $7, arquivo_origem = $8,
                                         updated_at = CURRENT_TIMESTAMP
                                     WHERE id = $9`,
                                    [lojaId, local, modelo, tag, memoria, terminoGarantia, tempoUsoAnos, 
                                     req.file.originalname, existente.rows[0].id]
                                );
                                atualizados++;
                            } else {
                                await client.query(
                                    `INSERT INTO inventario_computadores 
                                     (cod_loja, loja_id, local, computador, modelo, tag, memoria, 
                                      termino_garantia, tempo_uso_anos, arquivo_origem)
                                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                                    [codLoja, lojaId, local, computador, modelo, tag, memoria, 
                                     terminoGarantia, tempoUsoAnos, req.file.originalname]
                                );
                                inseridos++;
                            }
                        } catch (err) {
                            console.error('❌ Erro ao processar linha:', err, row);
                            erros++;
                        }
                    }
                    
                    const removidosResult = await client.query(
                        'DELETE FROM inventario_computadores WHERE arquivo_origem != $1 OR arquivo_origem IS NULL RETURNING id',
                        [req.file.originalname]
                    );
                    const removidos = removidosResult.rowCount;
                    
                    await client.query(
                        `INSERT INTO iaf_uploads (usuario_id, tipo, nome_arquivo, registros_inseridos, 
                                                 registros_atualizados, registros_removidos)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [req.user.id, 'computadores', req.file.originalname, inseridos, atualizados, removidos]
                    );
                    
                    await client.query('COMMIT');
                    
                    console.log('✅ Processamento concluído:', { inseridos, atualizados, removidos, erros });
                    
                    res.json({
                        success: true,
                        message: 'Arquivo processado com sucesso',
                        estatisticas: {
                            total_linhas: data.length,
                            inseridos,
                            atualizados,
                            removidos,
                            erros
                        }
                    });
                    
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                } finally {
                    client.release();
                }
                
            } catch (err) {
                console.error('❌ Erro ao processar arquivo:', err);
                res.status(500).json({ 
                    error: 'Erro ao processar arquivo',
                    details: err.message 
                });
            }
        });
    });
});

router.post('/upload-celulares', (req, res, next) => {
    authenticate(req, res, () => {
        uploadExcel.single('arquivo')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }
            
            if (!req.file) {
                return res.status(400).json({ error: 'Nenhum arquivo enviado' });
            }
            
            try {
                console.log('📱 Processando arquivo de celulares:', req.file.originalname);
                
                const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const data = XLSX.utils.sheet_to_json(sheet);
                
                console.log(`📋 ${data.length} linhas encontradas`);
                
                if (data.length === 0) {
                    return res.status(400).json({ error: 'Arquivo vazio ou sem dados' });
                }
                
                const client = await pool.connect();
                
                try {
                    await client.query('BEGIN');
                    
                    let inseridos = 0;
                    let atualizados = 0;
                    let erros = 0;
                    
                    for (const row of data) {
                        try {
                            const codLoja = row['Cód. Loja'] || row['Cod Loja'] || row['Loja'];
                            const local = row['Local'];
                            const celular = row['Celular'];
                            const modelo = row['Modelo'];
                            const modeloDetalhado = row['Modelo Detalhado'];
                             console.log('📱 Dados da linha:', {celular,
                               terminoGarantiaRAW: row['Término Garantia'],
                               terminoGarantiaTYPE: typeof row['Término Garantia']
                             });

                            const terminoGarantia = parseExcelDate(row['Término Garantia']);
                            const status = row['Status']?.toLowerCase() || 'ativo';
                            
                            if (!codLoja || !celular) {
                                console.log('⚠️ Linha ignorada - faltam dados obrigatórios:', row);
                                erros++;
                                continue;
                            }
                            
                            const lojaResult = await client.query(
                                'SELECT id FROM lojas WHERE codigo = $1',
                                [codLoja]
                            );
                            const lojaId = lojaResult.rows.length > 0 ? lojaResult.rows[0].id : null;
                            
                            const existente = await client.query(
                                'SELECT id FROM inventario_celulares WHERE cod_loja = $1 AND celular = $2',
                                [codLoja, celular]
                            );
                            
                            if (existente.rows.length > 0) {
                                await client.query(
                                    `UPDATE inventario_celulares 
                                     SET loja_id = $1, local = $2, modelo = $3, modelo_detalhado = $4,
                                         termino_garantia = $5, status = $6, arquivo_origem = $7,
                                         updated_at = CURRENT_TIMESTAMP
                                     WHERE id = $8`,
                                    [lojaId, local, modelo, modeloDetalhado, terminoGarantia, status,
                                     req.file.originalname, existente.rows[0].id]
                                );
                                atualizados++;
                            } else {
                                await client.query(
                                    `INSERT INTO inventario_celulares 
                                     (cod_loja, loja_id, local, celular, modelo, modelo_detalhado, 
                                      termino_garantia, status, arquivo_origem)
                                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                                    [codLoja, lojaId, local, celular, modelo, modeloDetalhado, 
                                     terminoGarantia, status, req.file.originalname]
                                );
                                inseridos++;
                            }
                        } catch (err) {
                            console.error('❌ Erro ao processar linha:', err, row);
                            erros++;
                        }
                    }
                    
                    const removidosResult = await client.query(
                        'DELETE FROM inventario_celulares WHERE arquivo_origem != $1 OR arquivo_origem IS NULL RETURNING id',
                        [req.file.originalname]
                    );
                    const removidos = removidosResult.rowCount;
                    
                    await client.query(
                        `INSERT INTO iaf_uploads (usuario_id, tipo, nome_arquivo, registros_inseridos, 
                                                 registros_atualizados, registros_removidos)
                         VALUES ($1, $2, $3, $4, $5, $6)`,
                        [req.user.id, 'celulares', req.file.originalname, inseridos, atualizados, removidos]
                    );
                    
                    await client.query('COMMIT');
                    
                    console.log('✅ Processamento concluído:', { inseridos, atualizados, removidos, erros });
                    
                    res.json({
                        success: true,
                        message: 'Arquivo processado com sucesso',
                        estatisticas: {
                            total_linhas: data.length,
                            inseridos,
                            atualizados,
                            removidos,
                            erros
                        }
                    });
                    
                } catch (err) {
                    await client.query('ROLLBACK');
                    throw err;
                } finally {
                    client.release();
                }
                
            } catch (err) {
                console.error('❌ Erro ao processar arquivo:', err);
                res.status(500).json({ 
                    error: 'Erro ao processar arquivo',
                    details: err.message 
                });
            }
        });
    });
});

// =============================================
// CONSULTAS - DASHBOARD IAF
// =============================================

router.get('/estatisticas-gerais', (req, res) => {
    authenticate(req, res, async () => {
        try {
            const result = await pool.query('SELECT * FROM vw_iaf_estatisticas_gerais');
            res.json(result.rows[0]);
        } catch (err) {
            console.error('Erro ao buscar estatísticas gerais:', err);
            res.status(500).json({ error: 'Erro ao buscar estatísticas' });
        }
    });
});

router.get('/resumo-lojas', (req, res) => {
    authenticate(req, res, async () => {
        try {
            const result = await pool.query('SELECT * FROM vw_iaf_resumo_lojas ORDER BY loja_nome');
            res.json(result.rows);
        } catch (err) {
            console.error('Erro ao buscar resumo por lojas:', err);
            res.status(500).json({ error: 'Erro ao buscar resumo' });
        }
    });
});

router.get('/alertas', (req, res) => {
    authenticate(req, res, async () => {
        const { loja_id } = req.query;
        
        try {
            let query = 'SELECT * FROM vw_alertas_garantia';
            let params = [];
            
            if (loja_id) {
                query += ' WHERE cod_loja = (SELECT codigo FROM lojas WHERE id = $1)';
                params.push(loja_id);
            }
            
            query += ' ORDER BY dias_para_vencer ASC';
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (err) {
            console.error('Erro ao buscar alertas:', err);
            res.status(500).json({ error: 'Erro ao buscar alertas' });
        }
    });
});

router.get('/computadores', (req, res) => {
    authenticate(req, res, async () => {
        const { loja_id, status_garantia } = req.query;
        
        try {
            let query = `
                SELECT c.*, l.nome as loja_nome 
                FROM inventario_computadores c
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
            
            if (status_garantia) {
                query += ` AND c.status_garantia = $${paramIndex}`;
                params.push(status_garantia);
                paramIndex++;
            }
            
            query += ' ORDER BY c.dias_para_vencer ASC NULLS LAST, c.cod_loja, c.computador';
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (err) {
            console.error('Erro ao buscar computadores:', err);
            res.status(500).json({ error: 'Erro ao buscar computadores' });
        }
    });
});

router.get('/celulares', (req, res) => {
    authenticate(req, res, async () => {
        const { loja_id, status_garantia, status } = req.query;
        
        try {
            let query = `
                SELECT c.*, l.nome as loja_nome 
                FROM inventario_celulares c
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
            
            if (status_garantia) {
                query += ` AND c.status_garantia = $${paramIndex}`;
                params.push(status_garantia);
                paramIndex++;
            }
            
            if (status) {
                query += ` AND c.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }
            
            query += ' ORDER BY c.dias_para_vencer ASC NULLS LAST, c.cod_loja, c.celular';
            
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (err) {
            console.error('Erro ao buscar celulares:', err);
            res.status(500).json({ error: 'Erro ao buscar celulares' });
        }
    });
});

router.get('/grafico-garantias-mes', (req, res) => {
    authenticate(req, res, async () => {
        try {
            const result = await pool.query(`
                SELECT 
                    TO_CHAR(termino_garantia, 'YYYY-MM') as mes,
                    COUNT(*) as total
                FROM (
                    SELECT termino_garantia FROM inventario_computadores WHERE termino_garantia IS NOT NULL
                    UNION ALL
                    SELECT termino_garantia FROM inventario_celulares WHERE termino_garantia IS NOT NULL
                ) t
                WHERE termino_garantia BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '12 months'
                GROUP BY mes
                ORDER BY mes
            `);
            res.json(result.rows);
        } catch (err) {
            console.error('Erro ao buscar dados do gráfico:', err);
            res.status(500).json({ error: 'Erro ao buscar dados' });
        }
    });
});

router.get('/historico-uploads', (req, res) => {
    authenticate(req, res, async () => {
        try {
            const result = await pool.query(`
                SELECT u.*, us.nome as usuario_nome
                FROM iaf_uploads u
                LEFT JOIN usuarios us ON u.usuario_id = us.id
                ORDER BY u.created_at DESC
                LIMIT 50
            `);
            res.json(result.rows);
        } catch (err) {
            console.error('Erro ao buscar histórico:', err);
            res.status(500).json({ error: 'Erro ao buscar histórico' });
        }
    });
});

// =============================================
// HELPER: Converter data do Excel
// =============================================

function parseExcelDate(excelDate) {
    if (!excelDate) return null;
    
    if (typeof excelDate === 'string') {
        const parts = excelDate.split('/');
        if (parts.length === 3) {
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
    }
    
    if (typeof excelDate === 'number') {
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
    }
    
    return null;
}

module.exports = { router, initialize };