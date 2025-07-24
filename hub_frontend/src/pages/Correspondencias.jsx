import { useState, useEffect } from 'react';
import { correspondenciaService, clienteService, caixaPostalService } from '../services/api';
import ClienteAutocomplete from '../components/correspondencias/ClienteAutocomplete';
import Pagination from '../components/correspondencias/Pagination';
import CorrespondenciaModal from '../components/correspondencias/CorrespondenciaModal';
import RetiradaModal from '../components/correspondencias/RetiradaModal';

function Correspondencias() {
  const [correspondencias, setCorrespondencias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [caixasPostais, setCaixasPostais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroDataInicio, setFiltroDataInicio] = useState('');
  const [filtroDataFim, setFiltroDataFim] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [correspondenciaParaEditar, setCorrespondenciaParaEditar] = useState(null);
  const [showRetiradaModal, setShowRetiradaModal] = useState(false);
  const [correspondenciaParaRetirada, setCorrespondenciaParaRetirada] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const params = {
        page_size: 1000,
        limit: 1000
      };
      
      if (filtroCliente) params.cliente_id = filtroCliente;
      if (filtroStatus) params.status = filtroStatus;
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroDataInicio) params.data_inicio = filtroDataInicio;
      if (filtroDataFim) params.data_fim = filtroDataFim;

      const [correspondenciasRes, clientesRes, caixasRes] = await Promise.all([
        correspondenciaService.list(params),
        clienteService.list({ page_size: 1000, limit: 1000 }),
        caixaPostalService.list({ page_size: 1000, limit: 1000 })
      ]);
      
      let allCorrespondencias = correspondenciasRes.data.results || correspondenciasRes.data;
      let allClientes = clientesRes.data.results || clientesRes.data;
      let allCaixas = caixasRes.data.results || caixasRes.data;

      if (correspondenciasRes.data.results && correspondenciasRes.data.next) {
        let nextUrl = correspondenciasRes.data.next;
        while (nextUrl) {
          try {
            const urlParams = new URL(nextUrl).searchParams;
            const nextResponse = await correspondenciaService.list({
              page: urlParams.get('page'),
              page_size: urlParams.get('page_size') || 1000,
              ...params
            });
            allCorrespondencias = [...allCorrespondencias, ...(nextResponse.data.results || [])];
            nextUrl = nextResponse.data.next;
          } catch (error) {
            console.error('Erro ao carregar página adicional de correspondências:', error);
            break;
          }
        }
      }

      if (clientesRes.data.results && clientesRes.data.next) {
        let nextUrl = clientesRes.data.next;
        while (nextUrl) {
          try {
            const urlParams = new URL(nextUrl).searchParams;
            const nextResponse = await clienteService.list({
              page: urlParams.get('page'),
              page_size: urlParams.get('page_size') || 1000,
            });
            allClientes = [...allClientes, ...(nextResponse.data.results || [])];
            nextUrl = nextResponse.data.next;
          } catch (error) {
            console.error('Erro ao carregar página adicional de clientes:', error);
            break;
          }
        }
      }
      
      setCorrespondencias(allCorrespondencias);
      setClientes(allClientes);
      setCaixasPostais(allCaixas);
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar correspondências');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadData();
    setCurrentPage(1);
  };

  const clearAllFilters = async () => {
    setSearch('');
    setFiltroCliente('');
    setFiltroStatus('');
    setFiltroTipo('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setCurrentPage(1);
    
    try {
      setLoading(true);
      
      const [correspondenciasRes, clientesRes, caixasRes] = await Promise.all([
        correspondenciaService.list({ page_size: 1000, limit: 1000 }),
        clienteService.list({ page_size: 1000, limit: 1000 }),
        caixaPostalService.list({ page_size: 1000, limit: 1000 })
      ]);
      
      let allCorrespondencias = correspondenciasRes.data.results || correspondenciasRes.data;
      let allClientes = clientesRes.data.results || clientesRes.data;
      let allCaixas = caixasRes.data.results || caixasRes.data;

      if (correspondenciasRes.data.results && correspondenciasRes.data.next) {
        let nextUrl = correspondenciasRes.data.next;
        while (nextUrl) {
          try {
            const urlParams = new URL(nextUrl).searchParams;
            const nextResponse = await correspondenciaService.list({
              page: urlParams.get('page'),
              page_size: urlParams.get('page_size') || 1000,
            });
            allCorrespondencias = [...allCorrespondencias, ...(nextResponse.data.results || [])];
            nextUrl = nextResponse.data.next;
          } catch (error) {
            console.error('Erro ao carregar página adicional:', error);
            break;
          }
        }
      }

      if (clientesRes.data.results && clientesRes.data.next) {
        let nextUrl = clientesRes.data.next;
        while (nextUrl) {
          try {
            const urlParams = new URL(nextUrl).searchParams;
            const nextResponse = await clienteService.list({
              page: urlParams.get('page'),
              page_size: urlParams.get('page_size') || 1000,
            });
            allClientes = [...allClientes, ...(nextResponse.data.results || [])];
            nextUrl = nextResponse.data.next;
          } catch (error) {
            console.error('Erro ao carregar página adicional de clientes:', error);
            break;
          }
        }
      }
      
      setCorrespondencias(allCorrespondencias);
      setClientes(allClientes);
      setCaixasPostais(allCaixas);
      
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
      setError('Erro ao limpar filtros');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarRetirada = (correspondencia) => {
    setCorrespondenciaParaRetirada(correspondencia);
    setShowRetiradaModal(true);
  };

  const openModal = (correspondencia = null) => {
    setCorrespondenciaParaEditar(correspondencia);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCorrespondenciaParaEditar(null);
  };

  const closeRetiradaModal = () => {
    setShowRetiradaModal(false);
    setCorrespondenciaParaRetirada(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'RECEBIDA': return 'bg-orange-900/20 text-orange-400 border-orange-500/30';
      case 'RETIRADA': return 'bg-green-900/20 text-green-400 border-green-500/30';
      case 'DEVOLVIDA': return 'bg-red-900/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    }
  };

  const getDiasColor = (dias, status) => {
    if (status !== 'RECEBIDA') return 'bg-gray-900/20 text-gray-400 border-gray-500/30';
    if (dias > 30) return 'bg-red-900/20 text-red-400 border-red-500/30';
    if (dias > 15) return 'bg-orange-900/20 text-orange-400 border-orange-500/30';
    return 'bg-green-900/20 text-green-400 border-green-500/30';
  };

  const getTipoColor = (tipo) => {
    const colors = {
      'CARTA': 'bg-blue-900/20 text-blue-400 border-blue-500/30',
      'PACOTE': 'bg-purple-900/20 text-purple-400 border-purple-500/30',
      'AR': 'bg-yellow-900/20 text-yellow-400 border-yellow-500/30',
      'SEDEX': 'bg-pink-900/20 text-pink-400 border-pink-500/30',
      'PAC': 'bg-indigo-900/20 text-indigo-400 border-indigo-500/30',
      'ENCOMENDA': 'bg-cyan-900/20 text-cyan-400 border-cyan-500/30',
      'DOCUMENTO': 'bg-emerald-900/20 text-emerald-400 border-emerald-500/30',
      'OUTRO': 'bg-gray-900/20 text-gray-400 border-gray-500/30'
    };
    return colors[tipo] || colors['OUTRO'];
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const filteredCorrespondencias = correspondencias.filter(corr => {
    const matchSearch = search === '' || 
      corr.cliente_nome?.toLowerCase().includes(search.toLowerCase()) ||
      corr.descricao?.toLowerCase().includes(search.toLowerCase()) ||
      corr.remetente?.toLowerCase().includes(search.toLowerCase()) ||
      corr.codigo_rastreamento?.toLowerCase().includes(search.toLowerCase());

    return matchSearch;
  });

  const totalPages = Math.ceil(filteredCorrespondencias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCorrespondencias.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    const newTotalPages = Math.ceil(filteredCorrespondencias.length / newItemsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  };

  const hasActiveFilters = search || filtroCliente || filtroStatus || filtroTipo || filtroDataInicio || filtroDataFim;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando correspondências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-gray-400">Gerencie as correspondências do sistema</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Correspondência
        </button>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Buscar correspondências
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Cliente, descrição, remetente..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Cliente</label>
              <ClienteAutocomplete
                value={filtroCliente}
                onChange={setFiltroCliente}
                clientes={clientes}
                placeholder="Buscar cliente por nome, documento..."
              />
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
              <select
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="RECEBIDA">Recebida</option>
                <option value="RETIRADA">Retirada</option>
                <option value="DEVOLVIDA">Devolvida</option>
              </select>
            </div>

            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">Tipo</label>
              <select
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="CARTA">Carta</option>
                <option value="PACOTE">Pacote</option>
                <option value="AR">AR</option>
                <option value="SEDEX">Sedex</option>
                <option value="PAC">PAC</option>
                <option value="ENCOMENDA">Encomenda</option>
                <option value="DOCUMENTO">Documento</option>
                <option value="OUTRO">Outro</option>
              </select>
            </div>
            
            <div className="lg:col-span-3 flex gap-2">
              <button 
                type="submit" 
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Buscar
              </button>
              
              <button 
                type="button" 
                onClick={clearAllFilters}
                className="px-4 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-colors duration-200"
                title="Limpar filtros"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Data início</label>
              <input
                type="date"
                lang="pt-BR"
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Data fim</label>
              <input
                type="date"
                lang="pt-BR"
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-red-500/30 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button 
            onClick={loadData} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tentar novamente
          </button>
        </div>
      )}

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Lista de Correspondências
            </h3>
            <div className="flex items-center gap-3">
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  {search && (
                    <span className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-500/30">
                      Busca: "{search}"
                    </span>
                  )}
                  {filtroCliente && (
                    <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded-full text-xs border border-green-500/30">
                      Cliente: {clientes.find(c => c.id.toString() === filtroCliente)?.nome}
                    </span>
                  )}
                  {filtroStatus && (
                    <span className="bg-orange-900/20 text-orange-400 px-2 py-1 rounded-full text-xs border border-orange-500/30">
                      Status: {filtroStatus}
                    </span>
                  )}
                  {filtroTipo && (
                    <span className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded-full text-xs border border-purple-500/30">
                      Tipo: {filtroTipo}
                    </span>
                  )}
                  {(filtroDataInicio || filtroDataFim) && (
                    <span className="bg-pink-900/20 text-pink-400 px-2 py-1 rounded-full text-xs border border-pink-500/30">
                      Período: {filtroDataInicio || '...'} - {filtroDataFim || '...'}
                    </span>
                  )}
                </div>
              )}
              <span className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                {filteredCorrespondencias.length} {filteredCorrespondencias.length === 1 ? 'correspondência encontrada' : 'correspondências encontradas'}
              </span>
            </div>
          </div>
        </div>

        {filteredCorrespondencias.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-400 text-lg">Nenhuma correspondência encontrada</p>
            <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros ou cadastre uma nova correspondência</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-48">Cliente / Caixa</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-64">Descrição</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-32">Tipo</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-48">Remetente</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-32">Recebida em</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-32">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-24">Dias</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide w-40">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentItems.map((correspondencia) => (
                    <tr key={correspondencia.id} className="hover:bg-gray-700/30 transition-colors duration-200">
                      {/* COLUNA 1: Cliente / Caixa */}
                      <td className="py-4 px-6 w-48">
                        <div>
                          <div className="font-medium text-white truncate" title={correspondencia.cliente_nome}>
                            {truncateText(correspondencia.cliente_nome, 25)}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                            <span className="truncate">Caixa {correspondencia.caixa_numero}</span>
                          </div>
                        </div>
                      </td>
                      
                      {/* COLUNA 2: Descrição */}
                      <td className="py-4 px-6 w-64">
                        <div>
                          <div className="font-medium text-white break-words" title={correspondencia.descricao}>
                            {truncateText(correspondencia.descricao, 40)}
                          </div>
                          {correspondencia.codigo_rastreamento && (
                            <div className="text-sm text-gray-400 font-mono bg-gray-700/50 px-2 py-1 rounded mt-1 truncate" title={correspondencia.codigo_rastreamento}>
                              {truncateText(correspondencia.codigo_rastreamento, 20)}
                            </div>
                          )}
                        </div>
                      </td>
                      
                      {/* COLUNA 3: Tipo */}
                      <td className="py-4 px-6 w-32">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getTipoColor(correspondencia.tipo)}`}>
                          {correspondencia.tipo_display || correspondencia.tipo}
                        </span>
                      </td>
                      
                      {/* COLUNA 4: Remetente */}
                      <td className="py-4 px-6 w-48">
                        <div className="text-sm text-gray-300 truncate" title={correspondencia.remetente}>
                          {truncateText(correspondencia.remetente, 25)}
                        </div>
                      </td>
                      
                      {/* COLUNA 5: Recebida em */}
                      <td className="py-4 px-6 w-32">
                        <div className="text-sm text-gray-300">
                          {new Date(correspondencia.data_recebimento).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </div>
                      </td>
                      
                      {/* COLUNA 6: Status */}
                      <td className="py-4 px-6 w-32">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(correspondencia.status)}`}>
                          {correspondencia.status_display || correspondencia.status}
                        </span>
                      </td>
                      
                      {/* COLUNA 7: Dias */}
                      <td className="py-4 px-6 w-32">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDiasColor(correspondencia.dias_na_caixa, correspondencia.status)}`}>
                          {correspondencia.dias_na_caixa} {correspondencia.dias_na_caixa === 1 ? 'dia' : 'dias'}
                        </span>
                      </td>
                      
                      {/* COLUNA 8: Ações */}
                      <td className="py-4 px-6 w-40">
                        <div className="flex gap-2">
                          {correspondencia.status === 'RECEBIDA' && (
                            <button
                              onClick={() => handleMarcarRetirada(correspondencia)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600/10 text-green-400 font-medium rounded-lg border border-green-500/20 hover:bg-green-600/20 transition-colors duration-200 text-sm"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                              Retirar
                            </button>
                          )}
                          <button
                            onClick={() => openModal(correspondencia)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 text-blue-400 font-medium rounded-lg border border-blue-500/20 hover:bg-blue-600/20 transition-colors duration-200 text-sm"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredCorrespondencias.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>

      {showModal && (
        <CorrespondenciaModal
          correspondencia={correspondenciaParaEditar}
          caixasPostais={caixasPostais}
          onClose={closeModal}
          onSave={() => {
            loadData();
            closeModal();
          }}
        />
      )}

      {showRetiradaModal && (
        <RetiradaModal
          correspondencia={correspondenciaParaRetirada}
          onClose={closeRetiradaModal}
          onSave={() => {
            loadData();
            closeRetiradaModal();
          }}
        />
      )}
    </div>
  );
}

export default Correspondencias;