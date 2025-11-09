import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IAF.css';

const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:3001/api' : '/api';

export function IAF() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [resumoLojas, setResumoLojas] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [computadores, setComputadores] = useState([]);
  const [celulares, setCelulares] = useState([]);
  const [graficoData, setGraficoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState({ computadores: false, celulares: false });
  const [selectedLoja, setSelectedLoja] = useState('');
  const [lojas, setLojas] = useState([]);

  useEffect(() => {
    loadData();
    loadLojas();
  }, []);

  const loadLojas = async () => {
    try {
      const response = await axios.get(`${API_URL}/lojas`);
      setLojas(response.data);
    } catch (err) {
      console.error('Erro ao carregar lojas:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, resumoRes, alertasRes, graficoRes] = await Promise.all([
        axios.get(`${API_URL}/iaf/estatisticas-gerais`),
        axios.get(`${API_URL}/iaf/resumo-lojas`),
        axios.get(`${API_URL}/iaf/alertas`),
        axios.get(`${API_URL}/iaf/grafico-garantias-mes`)
      ]);

      setStats(statsRes.data);
      setResumoLojas(resumoRes.data);
      setAlertas(alertasRes.data);
      setGraficoData(graficoRes.data);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
    setLoading(false);
  };

  const loadComputadores = async () => {
    try {
      const params = selectedLoja ? `?loja_id=${selectedLoja}` : '';
      const response = await axios.get(`${API_URL}/iaf/computadores${params}`);
      setComputadores(response.data);
    } catch (err) {
      console.error('Erro ao carregar computadores:', err);
    }
  };

  const loadCelulares = async () => {
    try {
      const params = selectedLoja ? `?loja_id=${selectedLoja}` : '';
      const response = await axios.get(`${API_URL}/iaf/celulares${params}`);
      setCelulares(response.data);
    } catch (err) {
      console.error('Erro ao carregar celulares:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'computadores') {
      loadComputadores();
    } else if (activeTab === 'celulares') {
      loadCelulares();
    }
  }, [activeTab, selectedLoja]);

  const handleUpload = async (tipo) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('arquivo', file);

      setUploadProgress({ ...uploadProgress, [tipo]: true });

      try {
        const response = await axios.post(
          `${API_URL}/iaf/upload-${tipo}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );

        alert(`✅ Upload concluído!\n\n` +
              `Inseridos: ${response.data.estatisticas.inseridos}\n` +
              `Atualizados: ${response.data.estatisticas.atualizados}\n` +
              `Removidos: ${response.data.estatisticas.removidos}\n` +
              `Erros: ${response.data.estatisticas.erros}`);

        loadData();
      } catch (err) {
        alert('❌ Erro no upload: ' + (err.response?.data?.error || err.message));
      } finally {
        setUploadProgress({ ...uploadProgress, [tipo]: false });
      }
    };

    input.click();
  };

  if (loading) {
    return <div className="iaf-loading">⏳ Carregando dados do IAF...</div>;
  }

  return (
    <div className="iaf-container">
      <div className="iaf-header">
        <div className="iaf-header-left">
          <h1>📊 IAF - Inventário e Alertas de Frota</h1>
          <p className="iaf-subtitle">Sistema de Gestão de Garantias e Alertas</p>
        </div>
        <div className="iaf-header-right">
          <div className="iaf-last-update">
            <span className="iaf-update-label">Última atualização:</span>
            <span className="iaf-update-time">
              {stats?.ultima_atualizacao 
                ? new Date(stats.ultima_atualizacao).toLocaleString('pt-BR')
                : 'Nunca'}
            </span>
          </div>
          <button 
            className="btn-upload" 
            onClick={() => handleUpload('computadores')}
            disabled={uploadProgress.computadores}
          >
            {uploadProgress.computadores ? '⏳ Processando...' : '📤 Upload Computadores'}
          </button>
          <button 
            className="btn-upload" 
            onClick={() => handleUpload('celulares')}
            disabled={uploadProgress.celulares}
          >
            {uploadProgress.celulares ? '⏳ Processando...' : '📤 Upload Celulares'}
          </button>
        </div>
      </div>

      <div className="iaf-tabs">
        <button 
          className={`iaf-tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`iaf-tab ${activeTab === 'alertas' ? 'active' : ''}`}
          onClick={() => setActiveTab('alertas')}
        >
          ⚠️ Alertas ({alertas.length})
        </button>
        <button 
          className={`iaf-tab ${activeTab === 'computadores' ? 'active' : ''}`}
          onClick={() => setActiveTab('computadores')}
        >
          💻 Computadores ({stats?.total_computadores || 0})
        </button>
        <button 
          className={`iaf-tab ${activeTab === 'celulares' ? 'active' : ''}`}
          onClick={() => setActiveTab('celulares')}
        >
          📱 Celulares ({stats?.total_celulares || 0})
        </button>
      </div>

      <div className="iaf-content">
        {activeTab === 'dashboard' && (
          <Dashboard stats={stats} resumoLojas={resumoLojas} graficoData={graficoData} />
        )}
        {activeTab === 'alertas' && (
          <Alertas alertas={alertas} lojas={lojas} selectedLoja={selectedLoja} setSelectedLoja={setSelectedLoja} />
        )}
        {activeTab === 'computadores' && (
          <Computadores 
            computadores={computadores} 
            lojas={lojas} 
            selectedLoja={selectedLoja} 
            setSelectedLoja={setSelectedLoja} 
          />
        )}
        {activeTab === 'celulares' && (
          <Celulares 
            celulares={celulares} 
            lojas={lojas} 
            selectedLoja={selectedLoja} 
            setSelectedLoja={setSelectedLoja} 
          />
        )}
      </div>
    </div>
  );
}

// =============================================
// DASHBOARD
// =============================================

function Dashboard({ stats, resumoLojas, graficoData }) {
  const totalEquipamentos = (stats?.total_computadores || 0) + (stats?.total_celulares || 0);
  const totalVencendo = (stats?.comp_vencendo || 0) + (stats?.cel_vencendo || 0);
  const totalVencida = (stats?.comp_vencida || 0) + (stats?.cel_vencida || 0);
  
  const percentualAlerta = totalEquipamentos > 0 
    ? ((totalVencendo + totalVencida) / totalEquipamentos * 100).toFixed(1)
    : 0;

  return (
    <div className="iaf-dashboard">
      {/* KPIs */}
      <div className="iaf-kpis">
        <div className="iaf-kpi primary">
          <div className="iaf-kpi-icon">📦</div>
          <div className="iaf-kpi-content">
            <div className="iaf-kpi-value">{totalEquipamentos}</div>
            <div className="iaf-kpi-label">Total de Equipamentos</div>
          </div>
        </div>

        <div className={`iaf-kpi ${totalVencendo > 0 ? 'warning' : 'success'}`}>
          <div className="iaf-kpi-icon">⚠️</div>
          <div className="iaf-kpi-content">
            <div className="iaf-kpi-value">{totalVencendo}</div>
            <div className="iaf-kpi-label">Garantias Vencendo (≤120 dias)</div>
          </div>
        </div>

        <div className={`iaf-kpi ${totalVencida > 0 ? 'danger' : 'success'}`}>
          <div className="iaf-kpi-icon">❌</div>
          <div className="iaf-kpi-content">
            <div className="iaf-kpi-value">{totalVencida}</div>
            <div className="iaf-kpi-label">Garantias Vencidas</div>
          </div>
        </div>

        <div className={`iaf-kpi ${percentualAlerta > 20 ? 'danger' : percentualAlerta > 10 ? 'warning' : 'success'}`}>
          <div className="iaf-kpi-icon">📊</div>
          <div className="iaf-kpi-content">
            <div className="iaf-kpi-value">{percentualAlerta}%</div>
            <div className="iaf-kpi-label">Taxa de Alerta</div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="iaf-charts">
        <div className="iaf-chart-card">
          <h3>📈 Vencimentos por Mês</h3>
          <div className="iaf-chart">
            <GraficoBarras data={graficoData} />
          </div>
        </div>

        <div className="iaf-chart-card">
          <h3>🥧 Status de Garantias</h3>
          <div className="iaf-chart">
            <GraficoPizza stats={stats} />
          </div>
        </div>
      </div>

      {/* Tabela de Lojas */}
      <div className="iaf-table-card">
        <h3>🏪 Resumo por Loja</h3>
        <div className="iaf-table-scroll">
          <table className="iaf-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Loja</th>
                <th>💻 Computadores</th>
                <th>📱 Celulares</th>
                <th>⚠️ Alertas</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {resumoLojas.map(loja => {
                const totalAlertas = (loja.alertas_comp || 0) + (loja.alertas_cel || 0);
                return (
                  <tr key={loja.loja_id} className={totalAlertas > 0 ? 'row-alert' : ''}>
                    <td><strong>{loja.cod_loja}</strong></td>
                    <td>{loja.loja_nome}</td>
                    <td>
                      <span className="badge-count">{loja.total_computadores}</span>
                      <span className="badge-mini success">{loja.comp_vigente}</span>
                      <span className="badge-mini warning">{loja.comp_vencendo}</span>
                      <span className="badge-mini danger">{loja.comp_vencida}</span>
                    </td>
                    <td>
                      <span className="badge-count">{loja.total_celulares}</span>
                      <span className="badge-mini success">{loja.cel_vigente}</span>
                      <span className="badge-mini warning">{loja.cel_vencendo}</span>
                      <span className="badge-mini danger">{loja.cel_vencida}</span>
                    </td>
                    <td>
                      {totalAlertas > 0 && (
                        <span className="badge-alert">{totalAlertas}</span>
                      )}
                    </td>
                    <td>
                      {totalAlertas === 0 ? (
                        <span className="status-ok">✓ OK</span>
                      ) : (
                        <span className="status-warning">⚠ Atenção</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================
// ALERTAS
// =============================================

function Alertas({ alertas, lojas, selectedLoja, setSelectedLoja }) {
  const filteredAlertas = selectedLoja 
    ? alertas.filter(a => a.cod_loja === lojas.find(l => l.id == selectedLoja)?.codigo)
    : alertas;

  return (
    <div className="iaf-alertas">
      <div className="iaf-filter-bar">
        <select 
          value={selectedLoja} 
          onChange={(e) => setSelectedLoja(e.target.value)}
          className="iaf-filter-select"
        >
          <option value="">Todas as Lojas</option>
          {lojas.map(loja => (
            <option key={loja.id} value={loja.id}>{loja.nome}</option>
          ))}
        </select>
      </div>

      {filteredAlertas.length === 0 ? (
        <div className="iaf-empty-state">
          <div className="iaf-empty-icon">✓</div>
          <h3>Nenhum alerta no momento!</h3>
          <p>Todas as garantias estão dentro do prazo.</p>
        </div>
      ) : (
        <div className="iaf-table-card">
          <div className="iaf-table-scroll">
            <table className="iaf-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Loja</th>
                  <th>Local</th>
                  <th>Equipamento</th>
                  <th>Modelo</th>
                  <th>Término Garantia</th>
                  <th>Dias</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAlertas.map((alerta, idx) => (
                  <tr key={idx} className={alerta.status_garantia === 'vencida' ? 'row-danger' : 'row-warning'}>
                    <td>
                      <span className="badge-type">
                        {alerta.tipo_equipamento === 'computador' ? '💻' : '📱'}
                      </span>
                    </td>
                    <td><strong>{alerta.loja_nome}</strong></td>
                    <td>{alerta.local}</td>
                    <td>{alerta.equipamento}</td>
                    <td>{alerta.modelo}</td>
                    <td>{new Date(alerta.termino_garantia).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span className={`badge-dias ${alerta.dias_para_vencer < 0 ? 'danger' : 'warning'}`}>
                        {alerta.dias_para_vencer < 0 ? 'Vencida' : `${alerta.dias_para_vencer} dias`}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${alerta.status_garantia}`}>
                        {alerta.status_garantia === 'vencida' ? '❌ Vencida' : '⚠️ Vencendo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================
// COMPUTADORES
// =============================================

function Computadores({ computadores, lojas, selectedLoja, setSelectedLoja }) {
  return (
    <div className="iaf-equipamentos">
      <div className="iaf-filter-bar">
        <select 
          value={selectedLoja} 
          onChange={(e) => setSelectedLoja(e.target.value)}
          className="iaf-filter-select"
        >
          <option value="">Todas as Lojas</option>
          {lojas.map(loja => (
            <option key={loja.id} value={loja.id}>{loja.nome}</option>
          ))}
        </select>
      </div>

      <div className="iaf-table-card">
        <div className="iaf-table-scroll">
          <table className="iaf-table">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Local</th>
                <th>Computador</th>
                <th>Modelo</th>
                <th>Tag</th>
                <th>Memória</th>
                <th>Término Garantia</th>
                <th>Dias</th>
                <th>Tempo Uso</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {computadores.map((comp, idx) => (
                <tr key={idx} className={comp.dias_para_vencer <= 120 ? 'row-highlight' : ''}>
                  <td><strong>{comp.loja_nome}</strong></td>
                  <td>{comp.local}</td>
                  <td>{comp.computador}</td>
                  <td>{comp.modelo}</td>
                  <td>{comp.tag}</td>
                  <td>{comp.memoria}</td>
                  <td>{comp.termino_garantia ? new Date(comp.termino_garantia).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    {comp.dias_para_vencer !== null && (
                      <span className={`badge-dias ${
                        comp.dias_para_vencer < 0 ? 'danger' : 
                        comp.dias_para_vencer <= 120 ? 'warning' : 
                        'success'
                      }`}>
                        {comp.dias_para_vencer < 0 ? 'Vencida' : `${comp.dias_para_vencer}d`}
                      </span>
                    )}
                  </td>
                  <td>{comp.tempo_uso_anos ? `${comp.tempo_uso_anos} anos` : '-'}</td>
                  <td>
                    <span className={`status-badge ${comp.status_garantia}`}>
                      {comp.status_garantia === 'vigente' ? '✓' : 
                       comp.status_garantia === 'vencendo' ? '⚠️' : '❌'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================
// CELULARES
// =============================================

function Celulares({ celulares, lojas, selectedLoja, setSelectedLoja }) {
  return (
    <div className="iaf-equipamentos">
      <div className="iaf-filter-bar">
        <select 
          value={selectedLoja} 
          onChange={(e) => setSelectedLoja(e.target.value)}
          className="iaf-filter-select"
        >
          <option value="">Todas as Lojas</option>
          {lojas.map(loja => (
            <option key={loja.id} value={loja.id}>{loja.nome}</option>
          ))}
        </select>
      </div>

      <div className="iaf-table-card">
        <div className="iaf-table-scroll">
          <table className="iaf-table">
            <thead>
              <tr>
                <th>Loja</th>
                <th>Local</th>
                <th>Celular</th>
                <th>Modelo</th>
                <th>Modelo Detalhado</th>
                <th>Término Garantia</th>
                <th>Dias</th>
                <th>Status Operacional</th>
                <th>Status Garantia</th>
              </tr>
            </thead>
            <tbody>
              {celulares.map((cel, idx) => (
                <tr key={idx} className={cel.dias_para_vencer <= 120 ? 'row-highlight' : ''}>
                  <td><strong>{cel.loja_nome}</strong></td>
                  <td>{cel.local}</td>
                  <td>{cel.celular}</td>
                  <td>{cel.modelo}</td>
                  <td>{cel.modelo_detalhado}</td>
                  <td>{cel.termino_garantia ? new Date(cel.termino_garantia).toLocaleDateString('pt-BR') : '-'}</td>
                  <td>
                    {cel.dias_para_vencer !== null && (
                      <span className={`badge-dias ${
                        cel.dias_para_vencer < 0 ? 'danger' : 
                        cel.dias_para_vencer <= 120 ? 'warning' : 
                        'success'
                      }`}>
                        {cel.dias_para_vencer < 0 ? 'Vencida' : `${cel.dias_para_vencer}d`}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${cel.status}`}>
                      {cel.status}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${cel.status_garantia}`}>
                      {cel.status_garantia === 'vigente' ? '✓' : 
                       cel.status_garantia === 'vencendo' ? '⚠️' : '❌'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// =============================================
// GRÁFICOS SIMPLES
// =============================================

function GraficoBarras({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-empty">Sem dados para exibir</div>;
  }

  const maxValue = Math.max(...data.map(d => d.total));

  return (
    <div className="chart-bars">
      {data.map((item, idx) => (
        <div key={idx} className="chart-bar-group">
          <div className="chart-bar-container">
            <div 
              className="chart-bar" 
              style={{ height: `${(item.total / maxValue) * 100}%` }}
            >
              <span className="chart-bar-value">{item.total}</span>
            </div>
          </div>
          <div className="chart-bar-label">{item.mes}</div>
        </div>
      ))}
    </div>
  );
}

function GraficoPizza({ stats }) {
  const total = (stats?.total_computadores || 0) + (stats?.total_celulares || 0);
  const vigente = (stats?.comp_vigente || 0) + (stats?.cel_vigente || 0);
  const vencendo = (stats?.comp_vencendo || 0) + (stats?.cel_vencendo || 0);
  const vencida = (stats?.comp_vencida || 0) + (stats?.cel_vencida || 0);

  if (total === 0) {
    return <div className="chart-empty">Sem dados para exibir</div>;
  }

  const vigentePercent = (vigente / total * 100).toFixed(1);
  const vencendoPercent = (vencendo / total * 100).toFixed(1);
  const vencidaPercent = (vencida / total * 100).toFixed(1);

  return (
    <div className="chart-pizza">
      <div className="pizza-legend">
        <div className="pizza-legend-item">
          <span className="pizza-dot success"></span>
          <span>Vigente: {vigentePercent}%</span>
        </div>
        <div className="pizza-legend-item">
          <span className="pizza-dot warning"></span>
          <span>Vencendo: {vencendoPercent}%</span>
        </div>
        <div className="pizza-legend-item">
          <span className="pizza-dot danger"></span>
          <span>Vencida: {vencidaPercent}%</span>
        </div>
      </div>
    </div>
  );
}