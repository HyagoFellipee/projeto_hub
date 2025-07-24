import { useState, useEffect } from 'react';
import { dashboardService, correspondenciaService } from '../services/api';

function StatsCard({ title, value, subtitle, color = 'blue', icon }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 border-blue-500/20',
    green: 'from-green-500 to-green-600 border-green-500/20',
    orange: 'from-orange-500 to-orange-600 border-orange-500/20',
    red: 'from-red-500 to-red-600 border-red-500/20',
    purple: 'from-purple-500 to-purple-600 border-purple-500/20',
  };

  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${colorClasses[color]} text-white`}>
              {icon}
            </div>
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">
              {title}
            </h3>
          </div>
          <p className="text-3xl font-bold text-white mb-1 transition-colors duration-200">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-400">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, children }) {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all duration-200">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        {title}
      </h3>
      {children || (
        <div className="text-center">
          <p className="text-4xl font-bold text-white mb-2">
            {value}
          </p>
          <p className="text-gray-400">{subtitle}</p>
        </div>
      )}
    </div>
  );
}

function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }) {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t border-gray-700">
      {/* Informações da paginação */}
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-400">
          Mostrando <span className="font-medium text-white">{startItem}</span> até{' '}
          <span className="font-medium text-white">{endItem}</span> de{' '}
          <span className="font-medium text-white">{totalItems}</span> resultados
        </div>
        
        {/* Seletor de itens por página */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-400">Por página:</label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Controles de navegação */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* Botão Anterior */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </button>

          {/* Números das páginas */}
          <div className="flex items-center gap-1 mx-2">
            {getVisiblePages().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={page === '...'}
                className={`w-10 h-10 text-sm rounded-lg transition-all duration-200 ${
                  page === currentPage
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white font-medium'
                    : page === '...'
                    ? 'text-gray-500 cursor-default'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Botão Próximo */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400 rounded-lg transition-all duration-200"
          >
            Próximo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, pendentesResponse] = await Promise.all([
        dashboardService.getStats(),
        correspondenciaService.pendentes()
      ]);
      
      setStats(statsResponse.data);
      setPendentes(pendentesResponse.data);
      
      // Reset para primeira página quando carrega novos dados
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
      setError('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (dias) => {
    if (dias > 30) return 'red';
    if (dias > 15) return 'orange';
    return 'green';
  };

  const getStatusClasses = (dias) => {
    if (dias > 30) return 'bg-red-900/20 text-red-400 border border-red-500/30';
    if (dias > 15) return 'bg-orange-900/20 text-orange-400 border border-orange-500/30';
    return 'bg-green-900/20 text-green-400 border border-green-500/30';
  };

  // Cálculos da paginação
  const totalPages = Math.ceil(pendentes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = pendentes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // Ajustar a página atual para não ultrapassar o limite
    const newTotalPages = Math.ceil(pendentes.length / newItemsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
        <div className="text-red-400 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
        </div>
        <button 
          onClick={loadDashboardData} 
          className="btn-primary"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de atualizar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-gray-400">Visão geral do sistema de correspondências</p>
        </div>
        <button 
          onClick={loadDashboardData} 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Atualizar
        </button>
      </div>

      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Clientes"
          value={stats?.total_clientes || 0}
          subtitle={`${stats?.clientes_ativos || 0} ativos`}
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Caixas Ativas"
          value={stats?.total_caixas_ativas || 0}
          color="green"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        
        <StatsCard
          title="Pendentes"
          value={stats?.correspondencias_pendentes || 0}
          subtitle="Correspondências"
          color="orange"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Hoje"
          value={stats?.correspondencias_hoje || 0}
          subtitle="Recebidas hoje"
          color="purple"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {/* Métricas adicionais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MetricCard
          title="📈 Últimos 7 dias"
          value={stats?.correspondencias_ultimos_7_dias || 0}
          subtitle="Correspondências recebidas"
        />

        <MetricCard
          title="📋 Contratos"
          value={stats?.contratos_ativos || 0}
          subtitle="Contratos ativos"
        />
      </div>

      {/* Gráficos de distribuição */}
      {stats?.correspondencias_por_tipo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricCard title="📊 Por Tipo">
            <div className="space-y-3">
              {Object.entries(stats.correspondencias_por_tipo)
                .sort(([,a], [,b]) => b - a)
                .map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="capitalize text-gray-300">{tipo.toLowerCase()}</span>
                  <span className="font-bold text-white bg-gray-600 px-3 py-1 rounded-full text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </MetricCard>

          <MetricCard title="📈 Por Status">
            <div className="space-y-3">
              {Object.entries(stats.correspondencias_por_status)
                .sort(([,a], [,b]) => b - a)
                .map(([status, count]) => (
                <div key={status} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg">
                  <span className="capitalize text-gray-300">
                    {status === 'RECEBIDA' ? 'Recebidas' : 
                     status === 'RETIRADA' ? 'Retiradas' : 
                     status === 'DEVOLVIDA' ? 'Devolvidas' : status}
                  </span>
                  <span className="font-bold text-white bg-gray-600 px-3 py-1 rounded-full text-sm">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </MetricCard>
        </div>
      )}

      {/* Tabela de correspondências pendentes com paginação */}
      {pendentes.length > 0 && (
        <div className="bg-gray-800 rounded-2xl border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Correspondências Pendentes
              </h3>
              <span className="bg-orange-900/20 text-orange-400 px-3 py-1 rounded-full text-sm font-medium border border-orange-500/30">
                {pendentes.length} {pendentes.length === 1 ? 'item' : 'itens'}
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Cliente</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Tipo</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Remetente</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Recebida</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Dias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {currentItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-700/30 transition-colors duration-200">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-white">{item.cliente_nome}</div>
                        <div className="text-sm text-gray-400">Caixa {item.caixa_numero}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm font-medium">
                        {item.tipo_display}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">{item.remetente || '-'}</td>
                    <td className="py-4 px-6 text-sm text-gray-400">
                      {new Date(item.data_recebimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusClasses(item.dias_na_caixa)}`}>
                        {item.dias_na_caixa} {item.dias_na_caixa === 1 ? 'dia' : 'dias'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Componente de Paginação */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pendentes.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </div>
      )}
    </div>
  );
}

export default Dashboard;