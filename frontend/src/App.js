import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { 
  LojaDetalhes, 
  Usuarios, 
  Computadores, 
  Impressoras, 
  Celulares, 
  Links, 
  EquipamentosRede, 
  Tickets,
  Fornecedores,  // NOVO
  CFTV           // NOVO
} from './Components';
import { IAF } from './pages/IAF';

// API_URL sempre relativo - sem porta
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

// Configurar axios para incluir token automaticamente
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedLoja, setSelectedLoja] = useState(null);

  // Login/Auth
  const [loginForm, setLoginForm] = useState({ email: '', senha: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${API_URL}/auth/me`);
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginForm);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
    } catch (err) {
      alert('Erro no login: ' + (err.response?.data?.error || 'Erro desconhecido'));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="login-container">
        <div className="login-box">
          <div className="login-header">
            <h1>🏢 SFERA TI</h1>
            <p>Sistema de Controle de Franquias</p>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="E-mail"
              value={loginForm.email}
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={loginForm.senha}
              onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })}
              required
            />
            <button type="submit">Entrar</button>
          </form>
          <p className="login-hint">
            Padrão: admin@sfera.com.br / admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        user={user}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Header user={user} currentPage={currentPage} />
        <div className="content-area">
          {currentPage === 'dashboard' && <Dashboard setSelectedLoja={setSelectedLoja} setCurrentPage={setCurrentPage} />}
          {currentPage === 'iaf' && <IAF />}
          {currentPage === 'lojas' && <Lojas />}
          {currentPage === 'loja-detalhes' && selectedLoja && <LojaDetalhes lojaId={selectedLoja} />}
          {currentPage === 'usuarios' && <Usuarios />}
          {currentPage === 'computadores' && <Computadores />}
          {currentPage === 'impressoras' && <Impressoras />}
          {currentPage === 'celulares' && <Celulares />}
          {currentPage === 'links' && <Links />}
          {currentPage === 'equipamentos-rede' && <EquipamentosRede />}
          {currentPage === 'fornecedores' && <Fornecedores />}
          {currentPage === 'cftv' && <CFTV />}
          {currentPage === 'tickets' && <Tickets />}
        </div>
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE: Sidebar - ATUALIZADA
// =============================================
function Sidebar({ currentPage, setCurrentPage, user, onLogout }) {
  const menuItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'iaf', icon: '📊', label: 'IAF - Inventário' },
    { id: 'lojas', icon: '🏪', label: 'Lojas' },
    { id: 'usuarios', icon: '👥', label: 'Usuários' },
    { id: 'computadores', icon: '💻', label: 'Computadores' },
    { id: 'impressoras', icon: '🖨️', label: 'Impressoras' },
    { id: 'celulares', icon: '📱', label: 'Celulares' },
    { id: 'links', icon: '🌐', label: 'Internet' },
    { id: 'equipamentos-rede', icon: '🔌', label: 'Rede' },
    { id: 'fornecedores', icon: '🏭', label: 'Fornecedores' },  // NOVO
    { id: 'cftv', icon: '📹', label: 'CFTV' },                   // NOVO
    { id: 'tickets', icon: '🎫', label: 'Tickets' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>🏢 SFERA TI</h2>
        <p className="user-name">{user.nome}</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => setCurrentPage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <button className="logout-btn" onClick={onLogout}>
        🚪 Sair
      </button>
    </div>
  );
}

// =============================================
// COMPONENTE: Header - ATUALIZADA
// =============================================
function Header({ user, currentPage }) {
  const titles = {
    dashboard: 'Dashboard Geral',
    iaf: 'IAF - Inventário e Alertas de Frota',
    lojas: 'Gerenciar Lojas',
    usuarios: 'Gerenciar Usuários',
    computadores: 'Computadores',
    impressoras: 'Impressoras',
    celulares: 'Celulares',
    links: 'Links de Internet',
    'equipamentos-rede': 'Equipamentos de Rede',
    fornecedores: 'Fornecedores',              // NOVO
    cftv: 'CFTV - DVR/NVR',                    // NOVO
    tickets: 'Tickets de Suporte',
    'loja-detalhes': 'Detalhes da Loja'
  };

  return (
    <header className="top-header">
      <h1>{titles[currentPage] || 'SFERA TI'}</h1>
      <div className="header-info">
        <span>👤 {user.nome}</span>
        <span className="badge">{user.tipo}</span>
      </div>
    </header>
  );
}

// =============================================
// COMPONENTE: Dashboard - ATUALIZADO
// =============================================
function Dashboard({ setSelectedLoja, setCurrentPage }) {
  const [stats, setStats] = useState(null);
  const [lojas, setLojas] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/geral`);
      setStats(response.data.stats);
      setLojas(response.data.lojas);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  };

  if (!stats) {
    return <div className="loading">Carregando dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏪</div>
          <div className="stat-content">
            <h3>{stats.total_lojas}</h3>
            <p>Lojas Ativas</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💻</div>
          <div className="stat-content">
            <h3>{stats.total_computadores}</h3>
            <p>Computadores</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🖨️</div>
          <div className="stat-content">
            <h3>{stats.total_impressoras}</h3>
            <p>Impressoras</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📱</div>
          <div className="stat-content">
            <h3>{stats.total_celulares}</h3>
            <p>Celulares</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🌐</div>
          <div className="stat-content">
            <h3>{stats.total_links}</h3>
            <p>Links Internet</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📹</div>
          <div className="stat-content">
            <h3>{stats.total_cftv || 0}</h3>
            <p>CFTV</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏭</div>
          <div className="stat-content">
            <h3>{stats.total_fornecedores || 0}</h3>
            <p>Fornecedores</p>
          </div>
        </div>
        <div className="stat-card alert">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <h3>{stats.tickets_abertos}</h3>
            <p>Tickets Abertos</p>
          </div>
        </div>
      </div>

      <div className="lojas-section">
        <h2>Lojas da Rede SFERA</h2>
        <div className="lojas-grid">
          {lojas.map(loja => (
            <div key={loja.id} className="loja-card" onClick={() => {
              setSelectedLoja(loja.id);
              setCurrentPage('loja-detalhes');
            }}>
              <h3>{loja.nome}</h3>
              <p className="loja-codigo">{loja.codigo}</p>
              {loja.tipo_franquia && (
                <p className="loja-franquia">🏢 {loja.tipo_franquia}</p>
              )}
              <p className="loja-cidade">📍 {loja.cidade}</p>
              <p className="loja-gerente">👤 {loja.gerente_nome}</p>
              <div className="loja-stats">
                <span>💻 {loja.total_computadores}</span>
                <span>🖨️ {loja.total_impressoras}</span>
                <span>📱 {loja.total_celulares}</span>
                <span>🌐 {loja.total_links}</span>
              </div>
              {loja.tickets_abertos > 0 && (
                <div className="loja-alert">
                  🎫 {loja.tickets_abertos} ticket(s) aberto(s)
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
// COMPONENTE: Lojas - ATUALIZADA COM FILTRO DE FRANQUIA
// =============================================
function Lojas() {
  const [lojas, setLojas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingLoja, setEditingLoja] = useState(null);
  const [tipoFranquiaFilter, setTipoFranquiaFilter] = useState('');
  const [formData, setFormData] = useState({
    nome: '', codigo: '', tipo_franquia: '', cnpj: '', inscricao_estadual: '', razao_social: '',
    endereco: '', cidade: '', estado: '', cep: '', telefone: '', email: '',
    gerente_nome: '', gerente_telefone: '', gerente_email: '', 
    data_inauguracao: '', observacoes: '', ativo: true
  });

  useEffect(() => {
    loadLojas();
  }, [tipoFranquiaFilter]);

  const loadLojas = async () => {
    try {
      const params = tipoFranquiaFilter ? `?tipo_franquia=${tipoFranquiaFilter}` : '';
      const response = await axios.get(`${API_URL}/lojas${params}`);
      setLojas(response.data);
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLoja) {
        await axios.put(`${API_URL}/lojas/${editingLoja.id}`, formData);
      } else {
        await axios.post(`${API_URL}/lojas`, formData);
      }
      loadLojas();
      resetForm();
    } catch (err) {
      alert('Erro ao salvar loja: ' + (err.response?.data?.error || 'Erro desconhecido'));
    }
  };

  const handleEdit = (loja) => {
    setEditingLoja(loja);
    setFormData(loja);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta loja?')) {
      try {
        await axios.delete(`${API_URL}/lojas/${id}`);
        loadLojas();
      } catch (err) {
        alert('Erro ao deletar loja');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '', codigo: '', tipo_franquia: '', cnpj: '', inscricao_estadual: '', razao_social: '',
      endereco: '', cidade: '', estado: '', cep: '', telefone: '', email: '',
      gerente_nome: '', gerente_telefone: '', gerente_email: '',
      data_inauguracao: '', observacoes: '', ativo: true
    });
    setEditingLoja(null);
    setShowForm(false);
  };

  const franchiseTypes = ['Escritório', 'Levis', 'Hering', 'Boticário VD', 'Boticário Loja', 'Boticário Híbrida'];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Gerenciar Lojas</h2>
        <div className="header-controls">
          <select 
            value={tipoFranquiaFilter} 
            onChange={(e) => setTipoFranquiaFilter(e.target.value)}
            className="loja-filter"
          >
            <option value="">Todas as Franquias</option>
            {franchiseTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            ➕ Nova Loja
          </button>
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingLoja ? 'Editar Loja' : 'Nova Loja'}</h3>
            <form onSubmit={handleSubmit} className="form-grid">
              <div className="form-section">
                <h4>Identificação</h4>
                <input
                  type="text"
                  placeholder="Nome da Loja"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
                <input
                  type="text"
                  placeholder="Código (ex: SF001)"
                  value={formData.codigo}
                  onChange={(e) => setFormData({...formData, codigo: e.target.value})}
                  required
                />
                <select
                  value={formData.tipo_franquia}
                  onChange={(e) => setFormData({...formData, tipo_franquia: e.target.value})}
                  required
                >
                  <option value="">Selecione o Tipo de Franquia</option>
                  {franchiseTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="CNPJ"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Inscrição Estadual"
                  value={formData.inscricao_estadual}
                  onChange={(e) => setFormData({...formData, inscricao_estadual: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Razão Social"
                  value={formData.razao_social}
                  onChange={(e) => setFormData({...formData, razao_social: e.target.value})}
                />
              </div>

              <div className="form-section">
                <h4>Endereço</h4>
                <input
                  type="text"
                  placeholder="Endereço Completo"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Cidade"
                  value={formData.cidade}
                  onChange={(e) => setFormData({...formData, cidade: e.target.value})}
                />
                <input
                  type="text"
                  placeholder="Estado (UF)"
                  maxLength="2"
                  value={formData.estado}
                  onChange={(e) => setFormData({...formData, estado: e.target.value.toUpperCase()})}
                />
                <input
                  type="text"
                  placeholder="CEP"
                  value={formData.cep}
                  onChange={(e) => setFormData({...formData, cep: e.target.value})}
                />
              </div>

              <div className="form-section">
                <h4>Contato</h4>
                <input
                  type="tel"
                  placeholder="Telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="form-section">
                <h4>Gerente</h4>
                <input
                  type="text"
                  placeholder="Nome do Gerente"
                  value={formData.gerente_nome}
                  onChange={(e) => setFormData({...formData, gerente_nome: e.target.value})}
                />
                <input
                  type="tel"
                  placeholder="Telefone do Gerente"
                  value={formData.gerente_telefone}
                  onChange={(e) => setFormData({...formData, gerente_telefone: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="E-mail do Gerente"
                  value={formData.gerente_email}
                  onChange={(e) => setFormData({...formData, gerente_email: e.target.value})}
                />
              </div>

              <div className="form-section full-width">
                <h4>Outras Informações</h4>
                <input
                  type="date"
                  placeholder="Data de Inauguração"
                  value={formData.data_inauguracao}
                  onChange={(e) => setFormData({...formData, data_inauguracao: e.target.value})}
                />
                <textarea
                  placeholder="Observações"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  rows="3"
                />
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.ativo}
                    onChange={(e) => setFormData({...formData, ativo: e.target.checked})}
                  />
                  <span>Loja Ativa</span>
                </label>
              </div>

              <div className="form-buttons">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingLoja ? 'Atualizar' : 'Criar'}
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
              <th>Código</th>
              <th>Nome</th>
              <th>Franquia</th>
              <th>Cidade/UF</th>
              <th>Gerente</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lojas.map(loja => (
              <tr key={loja.id}>
                <td><strong>{loja.codigo}</strong></td>
                <td>{loja.nome}</td>
                <td><span className="badge">{loja.tipo_franquia || 'N/A'}</span></td>
                <td>{loja.cidade}/{loja.estado}</td>
                <td>{loja.gerente_nome}</td>
                <td>{loja.telefone}</td>
                <td>
                  <span className={`badge ${loja.ativo ? 'active' : 'inactive'}`}>
                    {loja.ativo ? 'Ativa' : 'Inativa'}
                  </span>
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(loja)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(loja.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;