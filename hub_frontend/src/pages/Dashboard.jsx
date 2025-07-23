import { useState, useEffect } from 'react';
import { dashboardService, correspondenciaService } from '../services/api';

function StatsCard({ title, value, subtitle, color = 'blue' }) {
  const colorClasses = {
    blue: 'border-blue-500 text-blue-600',
    green: 'border-green-500 text-green-600',
    orange: 'border-orange-500 text-orange-600',
    red: 'border-red-500 text-red-600',
    purple: 'border-purple-500 text-purple-600',
  };

  return (
    <div className={`card border-l-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="font-medium">{title}</p>
          {subtitle && <p className="text-sm opacity-75">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [pendentes, setPendentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p style={{color: 'red'}}>{error}</p>
        <button onClick={loadDashboardData} className="btn-primary">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button onClick={loadDashboardData} className="btn-secondary">
          Atualizar
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Clientes"
          value={stats?.total_clientes || 0}
          subtitle={`${stats?.clientes_ativos || 0} ativos`}
          color="blue"
        />
        
        <StatsCard
          title="Caixas Ativas"
          value={stats?.total_caixas_ativas || 0}
          color="green"
        />
        
        <StatsCard
          title="Pendentes"
          value={stats?.correspondencias_pendentes || 0}
          subtitle="Correspondências"
          color="orange"
        />
        
        <StatsCard
          title="Hoje"
          value={stats?.correspondencias_hoje || 0}
          subtitle="Recebidas hoje"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-bold mb-4">Últimos 7 dias</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {stats?.correspondencias_ultimos_7_dias || 0}
            </p>
            <p className="text-gray-600">Correspondências recebidas</p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Contratos</h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {stats?.contratos_ativos || 0}
            </p>
            <p className="text-gray-600">Contratos ativos</p>
          </div>
        </div>
      </div>

      {stats?.correspondencias_por_tipo && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-bold mb-4">Por Tipo</h3>
            <div className="space-y-2">
              {Object.entries(stats.correspondencias_por_tipo).map(([tipo, count]) => (
                <div key={tipo} className="flex justify-between items-center">
                  <span className="capitalize">{tipo.toLowerCase()}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Por Status</h3>
            <div className="space-y-2">
              {Object.entries(stats.correspondencias_por_status).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="capitalize">
                    {status === 'RECEBIDA' ? 'Recebidas' : 
                     status === 'RETIRADA' ? 'Retiradas' : 
                     status === 'DEVOLVIDA' ? 'Devolvidas' : status}
                  </span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {pendentes.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Correspondências Pendentes</h3>
            <span className="text-sm text-gray-600">
              {pendentes.length} {pendentes.length === 1 ? 'item' : 'itens'}
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Cliente</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Remetente</th>
                  <th className="text-left py-2">Recebida</th>
                  <th className="text-left py-2">Dias</th>
                </tr>
              </thead>
              <tbody>
                {pendentes.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">
                      <div>
                        <div className="font-medium">{item.cliente_nome}</div>
                        <div className="text-sm text-gray-600">Caixa {item.caixa_numero}</div>
                      </div>
                    </td>
                    <td className="py-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                        {item.tipo_display}
                      </span>
                    </td>
                    <td className="py-2">{item.remetente || '-'}</td>
                    <td className="py-2 text-sm text-gray-600">
                      {new Date(item.data_recebimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-2">
                      <span 
                        className={`px-2 py-1 rounded text-sm font-medium text-${getStatusColor(item.dias_na_caixa)}-700 bg-${getStatusColor(item.dias_na_caixa)}-100`}
                        style={{
                          color: getStatusColor(item.dias_na_caixa) === 'red' ? '#dc2626' : 
                                getStatusColor(item.dias_na_caixa) === 'orange' ? '#ea580c' : '#16a34a',
                          backgroundColor: getStatusColor(item.dias_na_caixa) === 'red' ? '#fee2e2' : 
                                          getStatusColor(item.dias_na_caixa) === 'orange' ? '#fed7aa' : '#dcfce7'
                        }}
                      >
                        {item.dias_na_caixa} dias
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {pendentes.length > 10 && (
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Mostrando 10 de {pendentes.length} correspondências pendentes
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;