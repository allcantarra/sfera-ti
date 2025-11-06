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
                <span className={`status-badge ${link.status}`}>{link.status}</span>
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
      // Para formulários com arquivo
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
        // Para formulários sem arquivo
        const dataToSend = {};
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
            dataToSend[key] = formData[key];
          }
        });

        console.log('📤 Enviando dados:', dataToSend);
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
        { name: 'operadora', label: 'Operadora', required: true },
        { name: 'tipo_conexao', label: 'Tipo', type: 'select', options: ['fibra', 'radio', 'adsl', 'cabo'], required: true },
        { name: 'velocidade_download', label: 'Velocidade Download' },
        { name: 'velocidade_upload', label: 'Velocidade Upload' },
        { name: 'valor_mensal', label: 'Valor Mensal', type: 'number' },
        { name: 'ip_fixo', label: 'IP Fixo' },
        { name: 'observacoes', label: 'Observações', type: 'textarea' }
      ]}
      renderCard={(link) => (
        <div key={link.id} className="equipamento-card">
          <h4>{link.nome} {link.principal && '⭐'}</h4>
          <p><strong>Operadora:</strong> {link.operadora}</p>
          <p><strong>Velocidade:</strong> {link.velocidade_download}/{link.velocidade_upload}</p>
          <p><strong>Tipo:</strong> {link.tipo_conexao}</p>
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