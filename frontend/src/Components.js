import React, { useState, useEffect } from 'react';
import axios from 'axios';

// API_URL sempre relativo - sem porta
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

// =============================================
// COMPONENTE: Detalhes da Loja
// =============================================
export function LojaDetalhes({ lojaId }) {
  const [loja, setLoja] = useState(null);
  const [dados, setDados] = useState(null);

  useEffect(() => {
    loadDados();
  }, [lojaId]);

  const loadDados = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/loja/${lojaId}`);
      setLoja(response.data.loja);
      setDados(response.data);
    } catch (err) {
      console.error('Erro ao carregar dados da loja:', err);
    }
  };

  if (!loja) return <div>Carregando...</div>;

  return (
    <div className="loja-detalhes">
      <div className="loja-header-detalhes">
        <h2>{loja.nome}</h2>
        <div className="loja-info-grid">
          <div><strong>Código:</strong> {loja.codigo}</div>
          <div><strong>Franquia:</strong> {loja.tipo_franquia}</div>
          <div><strong>CNPJ:</strong> {loja.cnpj}</div>
          <div><strong>IE:</strong> {loja.inscricao_estadual}</div>
          <div><strong>Cidade:</strong> {loja.cidade}/{loja.estado}</div>
          <div><strong>Gerente:</strong> {loja.gerente_nome}</div>
          <div><strong>Telefone:</strong> {loja.telefone}</div>
        </div>
      </div>

      <div className="equipamentos-sections">
        <section>
          <h3>💻 Computadores ({dados.computadores.length})</h3>
          <div className="equipamentos-list">
            {dados.computadores.map(comp => (
              <div key={comp.id} className="equipamento-card">
                {comp.foto_url && <img src={comp.foto_url} alt={comp.hostname} />}
                <h4>{comp.hostname}</h4>
                <p><strong>Modelo:</strong> {comp.marca} {comp.modelo}</p>
                <p><strong>Usuário:</strong> {comp.usuario_nome}</p>
                <span className={`status-badge ${comp.status}`}>{comp.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>🖨️ Impressoras ({dados.impressoras.length})</h3>
          <div className="equipamentos-list">
            {dados.impressoras.map(imp => (
              <div key={imp.id} className="equipamento-card">
                {imp.foto_url && <img src={imp.foto_url} alt={imp.nome} />}
                <h4>{imp.nome}</h4>
                <p><strong>Modelo:</strong> {imp.marca} {imp.modelo}</p>
                <p><strong>IP:</strong> {imp.ip_address}</p>
                <p><strong>Propriedade:</strong> {imp.propriedade === 'propria' ? 'Própria' : 'Alugada'}</p>
                <span className={`status-badge ${imp.status}`}>{imp.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>📱 Celulares ({dados.celulares.length})</h3>
          <div className="equipamentos-list">
            {dados.celulares.map(cel => (
              <div key={cel.id} className="equipamento-card">
                <h4>{cel.numero_linha}</h4>
                <p><strong>Aparelho:</strong> {cel.marca} {cel.modelo}</p>
                <p><strong>Usuário:</strong> {cel.usuario_nome}</p>
                <p><strong>Operadora:</strong> {cel.operadora}</p>
                <span className={`status-badge ${cel.status}`}>{cel.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>🌐 Links de Internet ({dados.links.length})</h3>
          <div className="equipamentos-list">
            {dados.links.map(link => (
              <div key={link.id} className="equipamento-card">
                <h4>{link.nome} {link.principal && '⭐'}</h4>
                <p><strong>Operadora:</strong> {link.operadora}</p>
                <p><strong>Velocidade:</strong> {link.velocidade_download}/{link.velocidade_upload}</p>
                <p><strong>Tipo:</strong> {link.tipo_conexao}</p>
                {link.titular && <p><strong>Titular:</strong> {link.titular}</p>}
                <span className={`status-badge ${link.status}`}>{link.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3>📹 CFTV ({dados.cftv?.length || 0})</h3>
          <div className="equipamentos-list">
            {dados.cftv?.map(cftv => (
              <div key={cftv.id} className="equipamento-card">
                {cftv.foto_url && <img src={cftv.foto_url} alt={cftv.marca} />}
                <h4>{cftv.tecnologia} - {cftv.marca} {cftv.modelo}</h4>
                <p><strong>Canais:</strong> {cftv.canais_em_uso}/{cftv.total_canais}</p>
                <p><strong>IP:</strong> {cftv.ip_address}</p>
                <span className={`status-badge ${cftv.status}`}>{cftv.status}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE: Usuários
// =============================================
export function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '', email: '', senha: '', tipo: 'usuario', cargo: '', telefone: ''
  });

  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      const response = await axios.get(`${API_URL}/usuarios`);
      setUsuarios(response.data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/usuarios`, formData);
      loadUsuarios();
      setShowForm(false);
      setFormData({ nome: '', email: '', senha: '', tipo: 'usuario', cargo: '', telefone: '' });
    } catch (err) {
      alert('Erro ao criar usuário');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gerenciar Usuários</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          ➕ Novo Usuário
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3>Novo Usuário</h3>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Nome Completo"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder="E-mail"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                required
              />
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              >
                <option value="usuario">Usuário</option>
                <option value="tecnico">Técnico</option>
                <option value="gerente">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
              <input
                type="text"
                placeholder="Cargo"
                value={formData.cargo}
                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              />
              <div className="form-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Cargo</th>
              <th>Tipo</th>
              <th>Telefone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(user => (
              <tr key={user.id}>
                <td>{user.nome}</td>
                <td>{user.email}</td>
                <td>{user.cargo}</td>
                <td><span className="badge">{user.tipo}</span></td>
                <td>{user.telefone}</td>
                <td>
                  <span className={`badge ${user.ativo ? 'active' : 'inactive'}`}>
                    {user.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE GENÉRICO: Lista de Equipamentos
// =============================================
function EquipamentosList({ 
  title, 
  icon, 
  endpoint, 
  fields, 
  renderCard 
}) {
  const [items, setItems] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedLoja, setSelectedLoja] = useState('');

  useEffect(() => {
    loadData();
    loadLojas();
  }, []);

  const loadData = async () => {
    try {
      const response = await axios.get(`${API_URL}/${endpoint}`);
      setItems(response.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  };

  const loadLojas = async () => {
    try {
      const response = await axios.get(`${API_URL}/lojas`);
      setLojas(response.data);
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.foto instanceof File) {
        const form = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            form.append(key, formData[key]);
          }
        });

        await axios.post(`${API_URL}/${endpoint}`, form, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const dataToSend = {};
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            dataToSend[key] = formData[key];
          }
        });

        await axios.post(`${API_URL}/${endpoint}`, dataToSend);
      }
      
      loadData();
      setShowForm(false);
      setFormData({});
      alert('Salvo com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao salvar:', err.response?.data || err.message);
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    }
  };

  const filteredItems = selectedLoja 
    ? items.filter(item => item.loja_id == selectedLoja)
    : items;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>{icon} {title}</h2>
        <div className="header-controls">
          <select 
            value={selectedLoja} 
            onChange={(e) => setSelectedLoja(e.target.value)}
            className="loja-filter"
          >
            <option value="">Todas as Lojas</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>{loja.nome}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            ➕ Adicionar
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar {title}</h3>
            <form onSubmit={handleSubmit}>
              <select
                value={formData.loja_id || ''}
                onChange={(e) => setFormData({...formData, loja_id: e.target.value})}
                required
              >
                <option value="">Selecione a Loja</option>
                {lojas.map(loja => (
                  <option key={loja.id} value={loja.id}>{loja.nome}</option>
                ))}
              </select>

              {fields.map(field => (
                <div key={field.name}>
                  {field.type === 'file' ? (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({...formData, foto: e.target.files[0]})}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      required={field.required}
                    >
                      <option value="">Selecione {field.label}</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      placeholder={field.label}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      rows="3"
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      placeholder={field.label}
                      value={formData[field.name] || ''}
                      onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              <div className="form-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="equipamentos-grid">
        {filteredItems.map(item => renderCard(item))}
      </div>
    </div>
  );
}

// =============================================
// COMPONENTES ESPECÍFICOS
// =============================================

export function Computadores() {
  return (
    <EquipamentosList
      title="Computadores"
      icon="💻"
      endpoint="computadores"
      fields={[
        { name: 'hostname', label: 'Hostname', required: true },
        { name: 'patrimonio', label: 'Número do Patrimônio' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: ['desktop', 'notebook', 'all-in-one'], required: true },
        { name: 'marca', label: 'Marca' },
        { name: 'modelo', label: 'Modelo' },
        { name: 'processador', label: 'Processador' },
        { name: 'memoria_ram', label: 'Memória RAM' },
        { name: 'armazenamento', label: 'Armazenamento' },
        { name: 'sistema_operacional', label: 'Sistema Operacional' },
        { name: 'usuario_nome', label: 'Usuário que usa' },
        { name: 'setor', label: 'Setor' },
        { name: 'foto', label: 'Foto', type: 'file' },
        { name: 'observacoes', label: 'Observações', type: 'textarea' }
      ]}
      renderCard={(comp) => (
        <div key={comp.id} className="equipamento-card">
          {comp.foto_url && <img src={comp.foto_url} alt={comp.hostname} />}
          <h4>{comp.hostname}</h4>
          <p><strong>Patrimônio:</strong> {comp.patrimonio}</p>
          <p><strong>Modelo:</strong> {comp.marca} {comp.modelo}</p>
          <p><strong>Usuário:</strong> {comp.usuario_nome}</p>
          <p><strong>RAM:</strong> {comp.memoria_ram}</p>
          <span className={`status-badge ${comp.status}`}>{comp.status}</span>
        </div>
      )}
    />
  );
}

export function Impressoras() {
  return (
    <EquipamentosList
      title="Impressoras"
      icon="🖨️"
      endpoint="impressoras"
      fields={[
        { name: 'nome', label: 'Nome/Identificação', required: true },
        { name: 'patrimonio', label: 'Número do Patrimônio' },
        { name: 'tipo', label: 'Tipo', type: 'select', options: ['laser', 'jato_tinta', 'matricial', 'multifuncional'], required: true },
        { name: 'propriedade', label: 'Propriedade', type: 'select', options: ['propria', 'alugada'], required: true },
        { name: 'marca', label: 'Marca' },
        { name: 'modelo', label: 'Modelo' },
        { name: 'ip_address', label: 'Endereço IP' },
        { name: 'tipo_conexao', label: 'Conexão', type: 'select', options: ['rede', 'usb', 'wireless'] },
        { name: 'setor', label: 'Setor' },
        { name: 'foto', label: 'Foto', type: 'file' },
        { name: 'observacoes', label: 'Observações', type: 'textarea' }
      ]}
      renderCard={(imp) => (
        <div key={imp.id} className="equipamento-card">
          {imp.foto_url && <img src={imp.foto_url} alt={imp.nome} />}
          <h4>{imp.nome}</h4>
          <p><strong>Modelo:</strong> {imp.marca} {imp.modelo}</p>
          <p><strong>IP:</strong> {imp.ip_address}</p>
          <p><strong>Setor:</strong> {imp.setor}</p>
          <p><strong>Propriedade:</strong> {imp.propriedade === 'propria' ? '🏢 Própria' : '📋 Alugada'}</p>
          <span className={`status-badge ${imp.status}`}>{imp.status}</span>
        </div>
      )}
    />
  );
}

export function Celulares() {
  return (
    <EquipamentosList
      title="Celulares"
      icon="📱"
      endpoint="celulares"
      fields={[
        { name: 'numero_linha', label: 'Número da Linha', required: true },
        { name: 'marca', label: 'Marca do Aparelho' },
        { name: 'modelo', label: 'Modelo do Aparelho' },
        { name: 'operadora', label: 'Operadora', required: true },
        { name: 'tipo_plano', label: 'Tipo de Plano' },
        { name: 'valor_mensal', label: 'Valor Mensal', type: 'number' },
        { name: 'usuario_nome', label: 'Usuário' },
        { name: 'cargo_usuario', label: 'Cargo do Usuário' },
        { name: 'observacoes', label: 'Observações', type: 'textarea' }
      ]}
      renderCard={(cel) => (
        <div key={cel.id} className="equipamento-card">
          <h4>{cel.numero_linha}</h4>
          <p><strong>Aparelho:</strong> {cel.marca} {cel.modelo}</p>
          <p><strong>Usuário:</strong> {cel.usuario_nome}</p>
          <p><strong>Operadora:</strong> {cel.operadora}</p>
          <p><strong>Plano:</strong> R$ {cel.valor_mensal}/mês</p>
          <span className={`status-badge ${cel.status}`}>{cel.status}</span>
        </div>
      )}
    />
  );
}

export function Links() {
  return (
    <EquipamentosList
      title="Links de Internet"
      icon="🌐"
      endpoint="links"
      fields={[
        { name: 'nome', label: 'Nome do Link', required: true },
        { name: 'cp', label: 'CP (Centro de Processamento)' },
        { name: 'titular', label: 'Titular' },
        { name: 'cnpj_titular', label: 'CNPJ do Titular' },
        { name: 'operadora', label: 'Operadora', required: true },
        { name: 'tipo_conexao', label: 'Tipo', type: 'select', options: ['fibra', 'radio', 'adsl', 'cabo'], required: true },
        { name: 'velocidade_download', label: 'Velocidade Download' },
        { name: 'velocidade_upload', label: 'Velocidade Upload' },
        { name: 'valor_mensal', label: 'Valor Mensal', type: 'number' },
        { name: 'valor_anual', label: 'Valor Anual', type: 'number' },
        { name: 'data_vencimento', label: 'Data Vencimento (DD/MM)' },
        { name: 'linha_fixa', label: 'Linha Fixa' },
        { name: 'ip_fixo', label: 'IP Fixo' },
        { name: 'link_acesso', label: 'Link de Acesso' },
        { name: 'login_acesso', label: 'Login de Acesso' },
        { name: 'senha_acesso', label: 'Senha de Acesso', type: 'password' },
        { name: 'observacoes', label: 'Observações', type: 'textarea' }
      ]}
      renderCard={(link) => (
        <div key={link.id} className="equipamento-card">
          <h4>{link.nome} {link.principal && '⭐'}</h4>
          <p><strong>Operadora:</strong> {link.operadora}</p>
          <p><strong>Velocidade:</strong> {link.velocidade_download}/{link.velocidade_upload}</p>
          <p><strong>Tipo:</strong> {link.tipo_conexao}</p>
          {link.titular && <p><strong>Titular:</strong> {link.titular}</p>}
          {link.cp && <p><strong>CP:</strong> {link.cp}</p>}
          <p><strong>Valor:</strong> R$ {link.valor_mensal}/mês</p>
          <span className={`status-badge ${link.status}`}>{link.status}</span>
        </div>
      )}
    />
  );
}

export function EquipamentosRede() {
  return (
    <EquipamentosList
      title="Equipamentos de Rede"
      icon="🔌"
      endpoint="equipamentos-rede"
      fields={[
        { name: 'nome', label: 'Nome/Identificação', required: true },
        { name: 'tipo', label: 'Tipo', type: 'select', options: ['switch', 'roteador', 'firewall', 'access_point', 'modem', 'rack', 'nobreak'], required: true },
        { name: 'marca', label: 'Marca' },
        { name: 'modelo', label: 'Modelo' },
        { name: 'ip_address', label: 'Endereço IP' },
        { name: 'portas_total', label: 'Total de Portas', type: 'number' },
        { name: 'posicao_rack', label: 'Posição no Rack' },
        { name: 'foto', label: 'Foto', type: 'file' },
        { name: 'observacoes', label: 'Observações', type: 'textarea' }
      ]}
      renderCard={(eq) => (
        <div key={eq.id} className="equipamento-card">
          {eq.foto_url && <img src={eq.foto_url} alt={eq.nome} />}
          <h4>{eq.nome}</h4>
          <p><strong>Tipo:</strong> {eq.tipo}</p>
          <p><strong>Modelo:</strong> {eq.marca} {eq.modelo}</p>
          <p><strong>IP:</strong> {eq.ip_address}</p>
          {eq.portas_total && <p><strong>Portas:</strong> {eq.portas_usadas}/{eq.portas_total}</p>}
          <span className={`status-badge ${eq.status}`}>{eq.status}</span>
        </div>
      )}
    />
  );
}

// =============================================
// NOVO COMPONENTE: FORNECEDORES
// =============================================
export function Fornecedores() {
  const [fornecedores, setFornecedores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedSegmento, setSelectedSegmento] = useState('');
  const [formData, setFormData] = useState({
    nome: '', razao_social: '', cnpj: '', segmento: '', 
    telefone_comercial: '', email: '', endereco: '', portal_web: '', 
    status: 'ativo', observacoes: ''
  });

  const segmentos = [
    'Telefonia/Internet',
    'Hardware',
    'Software',
    'Segurança',
    'Infraestrutura',
    'Energia',
    'Serviços',
    'Outros'
  ];

  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      const response = await axios.get(`${API_URL}/fornecedores`);
      setFornecedores(response.data);
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await axios.put(`${API_URL}/fornecedores/${editingItem.id}`, formData);
      } else {
        await axios.post(`${API_URL}/fornecedores`, formData);
      }
      loadFornecedores();
      resetForm();
      alert('Fornecedor salvo com sucesso!');
    } catch (err) {
      alert('Erro ao salvar fornecedor: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (fornecedor) => {
    setEditingItem(fornecedor);
    setFormData(fornecedor);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este fornecedor?')) {
      try {
        await axios.delete(`${API_URL}/fornecedores/${id}`);
        loadFornecedores();
        alert('Fornecedor deletado com sucesso!');
      } catch (err) {
        alert('Erro ao deletar fornecedor');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '', razao_social: '', cnpj: '', segmento: '', 
      telefone_comercial: '', email: '', endereco: '', portal_web: '', 
      status: 'ativo', observacoes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const filteredFornecedores = selectedSegmento 
    ? fornecedores.filter(f => f.segmento === selectedSegmento)
    : fornecedores;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📦 Fornecedores</h2>
        <div className="header-controls">
          <select 
            value={selectedSegmento} 
            onChange={(e) => setSelectedSegmento(e.target.value)}
            className="loja-filter"
          >
            <option value="">Todos os Segmentos</option>
            {segmentos.map(seg => (
              <option key={seg} value={seg}>{seg}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            ➕ Novo Fornecedor
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-section">
                  <h4>Identificação</h4>
                  <input
                    type="text"
                    placeholder="Nome Fantasia"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Razão Social"
                    value={formData.razao_social}
                    onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="CNPJ"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                    required
                  />
                  <select
                    value={formData.segmento}
                    onChange={(e) => setFormData({...formData, segmento: e.target.value})}
                    required
                  >
                    <option value="">Selecione o Segmento</option>
                    {segmentos.map(seg => (
                      <option key={seg} value={seg}>{seg}</option>
                    ))}
                  </select>
                </div>

                <div className="form-section">
                  <h4>Contato</h4>
                  <input
                    type="tel"
                    placeholder="Telefone Comercial"
                    value={formData.telefone_comercial}
                    onChange={(e) => setFormData({...formData, telefone_comercial: e.target.value})}
                    required
                  />
                  <input
                    type="email"
                    placeholder="E-mail"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Endereço Completo"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  />
                  <input
                    type="url"
                    placeholder="Portal Web (URL)"
                    value={formData.portal_web}
                    onChange={(e) => setFormData({...formData, portal_web: e.target.value})}
                  />
                </div>

                <div className="form-section full-width">
                  <h4>Status e Observações</h4>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                  <textarea
                    placeholder="Observações"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Razão Social</th>
              <th>CNPJ</th>
              <th>Segmento</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredFornecedores.map(fornecedor => (
              <tr key={fornecedor.id}>
                <td><strong>{fornecedor.nome}</strong></td>
                <td>{fornecedor.razao_social}</td>
                <td>{fornecedor.cnpj}</td>
                <td><span className="badge">{fornecedor.segmento}</span></td>
                <td>{fornecedor.telefone_comercial}</td>
                <td>
                  <span className={`badge ${fornecedor.status === 'ativo' ? 'active' : 'inactive'}`}>
                    {fornecedor.status}
                  </span>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(fornecedor)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(fornecedor.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =============================================
// NOVO COMPONENTE: CFTV (DVR/NVR)
// =============================================
export function CFTV() {
  const [dispositivos, setDispositivos] = useState([]);
  const [lojas, setLojas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [selectedLoja, setSelectedLoja] = useState('');
  const [formData, setFormData] = useState({
    loja_id: '', cp: '', quantidade_dispositivos: 1, total_canais: '', 
    canais_em_uso: '', tecnologia: 'DVR', marca: '', modelo: '', 
    numero_serie: '', ip_address: '', ddns: '', porta_acesso: 8000,
    usuario_acesso: '', senha_acesso: '', status: 'ativo', 
    data_instalacao: '', observacoes: ''
  });

  useEffect(() => {
    loadDispositivos();
    loadLojas();
  }, []);

  const loadDispositivos = async () => {
    try {
      const response = await axios.get(`${API_URL}/cftv`);
      setDispositivos(response.data);
    } catch (err) {
      console.error('Erro ao carregar CFTV:', err);
    }
  };

  const loadLojas = async () => {
    try {
      const response = await axios.get(`${API_URL}/lojas`);
      setLojas(response.data);
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.foto instanceof File) {
        const form = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            form.append(key, formData[key]);
          }
        });

        if (editingItem) {
          await axios.put(`${API_URL}/cftv/${editingItem.id}`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        } else {
          await axios.post(`${API_URL}/cftv`, form, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        }
      } else {
        const dataToSend = {};
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            dataToSend[key] = formData[key];
          }
        });

        if (editingItem) {
          await axios.put(`${API_URL}/cftv/${editingItem.id}`, dataToSend);
        } else {
          await axios.post(`${API_URL}/cftv`, dataToSend);
        }
      }
      
      loadDispositivos();
      resetForm();
      alert('Dispositivo CFTV salvo com sucesso!');
    } catch (err) {
      console.error('❌ Erro ao salvar:', err.response?.data || err.message);
      alert('Erro ao salvar: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleEdit = (dispositivo) => {
    setEditingItem(dispositivo);
    setFormData(dispositivo);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este dispositivo?')) {
      try {
        await axios.delete(`${API_URL}/cftv/${id}`);
        loadDispositivos();
        alert('Dispositivo deletado com sucesso!');
      } catch (err) {
        alert('Erro ao deletar dispositivo');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      loja_id: '', cp: '', quantidade_dispositivos: 1, total_canais: '', 
      canais_em_uso: '', tecnologia: 'DVR', marca: '', modelo: '', 
      numero_serie: '', ip_address: '', ddns: '', porta_acesso: 8000,
      usuario_acesso: '', senha_acesso: '', status: 'ativo', 
      data_instalacao: '', observacoes: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const filteredDispositivos = selectedLoja 
    ? dispositivos.filter(d => d.loja_id == selectedLoja)
    : dispositivos;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📹 CFTV (DVR/NVR)</h2>
        <div className="header-controls">
          <select 
            value={selectedLoja} 
            onChange={(e) => setSelectedLoja(e.target.value)}
            className="loja-filter"
          >
            <option value="">Todas as Lojas</option>
            {lojas.map(loja => (
              <option key={loja.id} value={loja.id}>{loja.nome}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            ➕ Adicionar Dispositivo
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingItem ? 'Editar Dispositivo' : 'Novo Dispositivo CFTV'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-section">
                  <h4>Local e Identificação</h4>
                  <select
                    value={formData.loja_id}
                    onChange={(e) => setFormData({...formData, loja_id: e.target.value})}
                    required
                  >
                    <option value="">Selecione a Loja</option>
                    {lojas.map(loja => (
                      <option key={loja.id} value={loja.id}>{loja.nome}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="CP (Centro de Processamento)"
                    value={formData.cp}
                    onChange={(e) => setFormData({...formData, cp: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Quantidade de Dispositivos"
                    value={formData.quantidade_dispositivos}
                    onChange={(e) => setFormData({...formData, quantidade_dispositivos: e.target.value})}
                  />
                </div>

                <div className="form-section">
                  <h4>Canais</h4>
                  <input
                    type="number"
                    placeholder="Total de Canais"
                    value={formData.total_canais}
                    onChange={(e) => setFormData({...formData, total_canais: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Canais em Uso"
                    value={formData.canais_em_uso}
                    onChange={(e) => setFormData({...formData, canais_em_uso: e.target.value})}
                    required
                  />
                </div>

                <div className="form-section">
                  <h4>Hardware</h4>
                  <select
                    value={formData.tecnologia}
                    onChange={(e) => setFormData({...formData, tecnologia: e.target.value})}
                    required
                  >
                    <option value="DVR">DVR (Analógico)</option>
                    <option value="NVR">NVR (IP)</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Marca"
                    value={formData.marca}
                    onChange={(e) => setFormData({...formData, marca: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Modelo"
                    value={formData.modelo}
                    onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Número de Série"
                    value={formData.numero_serie}
                    onChange={(e) => setFormData({...formData, numero_serie: e.target.value})}
                  />
                </div>

                <div className="form-section">
                  <h4>Rede e Acesso</h4>
                  <input
                    type="text"
                    placeholder="Endereço IP Local"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="DDNS (Acesso Remoto)"
                    value={formData.ddns}
                    onChange={(e) => setFormData({...formData, ddns: e.target.value})}
                  />
                  <input
                    type="number"
                    placeholder="Porta de Acesso"
                    value={formData.porta_acesso}
                    onChange={(e) => setFormData({...formData, porta_acesso: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Usuário de Acesso"
                    value={formData.usuario_acesso}
                    onChange={(e) => setFormData({...formData, usuario_acesso: e.target.value})}
                  />
                  <input
                    type="password"
                    placeholder="Senha de Acesso"
                    value={formData.senha_acesso}
                    onChange={(e) => setFormData({...formData, senha_acesso: e.target.value})}
                  />
                </div>

                <div className="form-section full-width">
                  <h4>Status e Outros</h4>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="ativo">Ativo</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="inativo">Inativo</option>
                  </select>
                  <input
                    type="date"
                    placeholder="Data de Instalação"
                    value={formData.data_instalacao}
                    onChange={(e) => setFormData({...formData, data_instalacao: e.target.value})}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({...formData, foto: e.target.files[0]})}
                  />
                  <textarea
                    placeholder="Observações"
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    rows="3"
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="equipamentos-grid">
        {filteredDispositivos.map(dispositivo => (
          <div key={dispositivo.id} className="equipamento-card">
            {dispositivo.foto_url && <img src={dispositivo.foto_url} alt={dispositivo.marca} />}
            <h4>{dispositivo.tecnologia} - {dispositivo.marca} {dispositivo.modelo}</h4>
            <p><strong>Loja:</strong> {dispositivo.loja_nome}</p>
            {dispositivo.cp && <p><strong>CP:</strong> {dispositivo.cp}</p>}
            <p><strong>Canais:</strong> {dispositivo.canais_em_uso}/{dispositivo.total_canais} em uso</p>
            <p><strong>IP:</strong> {dispositivo.ip_address}</p>
            {dispositivo.ddns && <p><strong>DDNS:</strong> {dispositivo.ddns}</p>}
            <span className={`status-badge ${dispositivo.status}`}>{dispositivo.status}</span>
            <div style={{marginTop: '10px', display: 'flex', gap: '5px'}}>
              <button className="btn-edit" onClick={() => handleEdit(dispositivo)}>✏️</button>
              <button className="btn-delete" onClick={() => handleDelete(dispositivo.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE: TICKETS
// =============================================
export function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [lojas, setLojas] = useState([]);
  const [formData, setFormData] = useState({
    loja_id: '', titulo: '', descricao: '', categoria: 'hardware', prioridade: 'media'
  });

  useEffect(() => {
    loadTickets();
    loadLojas();
  }, []);

  const loadTickets = async () => {
    try {
      const response = await axios.get(`${API_URL}/tickets`);
      setTickets(response.data);
    } catch (err) {
      console.error('Erro ao carregar tickets:', err);
    }
  };

  const loadLojas = async () => {
    try {
      const response = await axios.get(`${API_URL}/lojas`);
      setLojas(response.data);
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tickets`, formData);
      loadTickets();
      setShowForm(false);
      setFormData({ loja_id: '', titulo: '', descricao: '', categoria: 'hardware', prioridade: 'media' });
    } catch (err) {
      alert('Erro ao criar ticket');
    }
  };

  const handleStatusChange = async (id, novoStatus) => {
    try {
      await axios.put(`${API_URL}/tickets/${id}`, { status: novoStatus });
      loadTickets();
    } catch (err) {
      alert('Erro ao atualizar status');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🎫 Tickets de Suporte</h2>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          ➕ Novo Ticket
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3>Novo Ticket</h3>
            <form onSubmit={handleSubmit}>
              <select
                value={formData.loja_id}
                onChange={(e) => setFormData({...formData, loja_id: e.target.value})}
                required
              >
                <option value="">Selecione a Loja</option>
                {lojas.map(loja => (
                  <option key={loja.id} value={loja.id}>{loja.nome}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Título do Ticket"
                value={formData.titulo}
                onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                required
              />
              <textarea
                placeholder="Descrição detalhada do problema"
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                rows="4"
                required
              />
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({...formData, categoria: e.target.value})}
              >
                <option value="hardware">Hardware</option>
                <option value="software">Software</option>
                <option value="rede">Rede</option>
                <option value="impressora">Impressora</option>
                <option value="celular">Celular</option>
                <option value="cftv">CFTV</option>
                <option value="outros">Outros</option>
              </select>
              <select
                value={formData.prioridade}
                onChange={(e) => setFormData({...formData, prioridade: e.target.value})}
              >
                <option value="baixa">🟢 Baixa</option>
                <option value="media">🟡 Média</option>
                <option value="alta">🟠 Alta</option>
                <option value="urgente">🔴 Urgente</option>
              </select>
              <div className="form-buttons">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tickets-list">
        {tickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <div className="ticket-header">
              <h3>{ticket.titulo}</h3>
              <span className={`priority-badge ${ticket.prioridade}`}>
                {ticket.prioridade}
              </span>
            </div>
            <p className="ticket-numero">{ticket.numero}</p>
            <p className="ticket-loja">🏪 {ticket.loja_nome}</p>
            <p className="ticket-descricao">{ticket.descricao}</p>
            <div className="ticket-footer">
              <span className="ticket-categoria">{ticket.categoria}</span>
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                className={`status-select ${ticket.status}`}
              >
                <option value="aberto">Aberto</option>
                <option value="em_andamento">Em Andamento</option>
                <option value="aguardando">Aguardando</option>
                <option value="resolvido">Resolvido</option>
                <option value="fechado">Fechado</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}