import { useState, useEffect } from 'react';
import { clienteService } from '../services/api';

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
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
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

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  
  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  useEffect(() => {
    loadClientes();
  }, []);

  // Debug: adicionar log quando clientes carregam
  useEffect(() => {
    console.log('Clientes carregados:', clientes.length);
    console.log('Estrutura da resposta:', clientes);
  }, [clientes]);

  const loadClientes = async () => {
    try {
      setLoading(true);
      // Tentar carregar TODOS os clientes forçando um limite alto
      const response = await clienteService.list({ 
        page_size: 1000, // ou limit: 1000, depende da API
        limit: 1000,
        page: 1
      });
      
      // Verificar se tem paginação e carregar todas as páginas se necessário
      let allClientes = response.data.results || response.data;
      
      // Se tem paginação e mais páginas, carregar todas
      if (response.data.results && response.data.next) {
        console.log('API tem paginação, carregando todas as páginas...');
        let nextUrl = response.data.next;
        while (nextUrl) {
          try {
            // Usar clienteService em vez de fetch direto para manter autenticação
            const urlParams = new URL(nextUrl).searchParams;
            const nextResponse = await clienteService.list({
              page: urlParams.get('page'),
              page_size: urlParams.get('page_size') || 1000,
              limit: urlParams.get('limit') || 1000
            });
            
            allClientes = [...allClientes, ...(nextResponse.data.results || [])];
            nextUrl = nextResponse.data.next;
          } catch (error) {
            console.error('Erro ao carregar página adicional:', error);
            break;
          }
        }
      }
      
      console.log(`Total de clientes carregados: ${allClientes.length}`);
      setClientes(allClientes);
      
      // Reset para primeira página quando carrega novos dados
      setCurrentPage(1);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Não precisa mais recarregar do backend, apenas resetar a página
    setCurrentPage(1);
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir o cliente ${nome}?`)) {
      try {
        await clienteService.delete(id);
        loadClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        alert('Erro ao excluir cliente');
      }
    }
  };

  const openModal = (cliente = null) => {
    setClienteParaEditar(cliente);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setClienteParaEditar(null);
  };

  // Filtrar clientes baseado na busca
  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    cliente.documento.includes(search) ||
    cliente.email.toLowerCase().includes(search.toLowerCase())
  );

  // Aplicar filtro de tipo se selecionado
  let filteredByType = filtroTipo 
    ? filteredClientes.filter(cliente => cliente.tipo === filtroTipo)
    : filteredClientes;

  // Aplicar filtro de status se selecionado
  const finalFilteredClientes = filtroStatus !== ''
    ? filteredByType.filter(cliente => cliente.ativo === (filtroStatus === 'true'))
    : filteredByType;

  // Cálculos da paginação
  const totalPages = Math.ceil(finalFilteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = finalFilteredClientes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    // Ajustar a página atual para não ultrapassar o limite
    const newTotalPages = Math.ceil(finalFilteredClientes.length / newItemsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  };

  // Resetar página quando filtros mudarem
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  useEffect(() => {
    handleFilterChange();
  }, [search, filtroTipo, filtroStatus]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-gray-400">Gerencie os clientes do sistema</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Cliente
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
            {/* Campo de busca */}
            <div className="lg:col-span-5">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Buscar clientes
              </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Nome, documento ou email..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            {/* Filtro tipo */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Tipo
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
            </div>

            {/* Filtro status */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Status
              </label>
              <select
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
              >
                <option value="">Todos</option>
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
            
            {/* Botões */}
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
                onClick={() => {
                  setSearch('');
                  setFiltroTipo('');
                  setCurrentPage(1); // Reset apenas a página, não recarregar dados
                }}
                className="px-4 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-colors duration-200"
                title="Limpar filtros"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-gray-800 rounded-2xl p-6 border border-red-500/30 text-center">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium">{error}</p>
          </div>
          <button 
            onClick={loadClientes} 
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Tentar novamente
          </button>
        </div>
      )}

      {/* Tabela de clientes com paginação */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              Lista de Clientes
            </h3>
            <div className="flex items-center gap-3">
              {/* Indicador de filtros ativos */}
              {(search || filtroTipo || filtroStatus) && (
                <div className="flex items-center gap-2">
                  {search && (
                    <span className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-500/30">
                      Busca: "{search}"
                    </span>
                  )}
                  {filtroTipo && (
                    <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded-full text-xs border border-green-500/30">
                      {filtroTipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  )}
                  {filtroStatus !== '' && (
                    <span className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded-full text-xs border border-purple-500/30">
                      {filtroStatus === 'true' ? 'Ativo' : 'Inativo'}
                    </span>
                  )}
                </div>
              )}
              <span className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                {finalFilteredClientes.length} {finalFilteredClientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
              </span>
            </div>
          </div>
        </div>

        {finalFilteredClientes.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-gray-400 text-lg">Nenhum cliente encontrado</p>
            <p className="text-gray-500 text-sm mt-1">Tente ajustar os filtros ou cadastre um novo cliente</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Nome/Razão Social</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Tipo</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Documento</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-400 uppercase tracking-wide">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {currentItems.map((cliente) => (
                    <tr key={cliente.id} className="hover:bg-gray-700/30 transition-colors duration-200">
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-white">{cliente.nome}</div>
                          {cliente.telefone && (
                            <div className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {cliente.telefone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                          cliente.tipo === 'PF' 
                            ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' 
                            : 'bg-green-900/20 text-green-400 border-green-500/30'
                        }`}>
                          {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-300 bg-gray-700/50 px-2 py-1 rounded">
                          {cliente.documento_formatado}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-gray-300">
                          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                          </svg>
                          <span className="text-sm">{cliente.email}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                          cliente.ativo 
                            ? 'bg-green-900/20 text-green-400 border-green-500/30' 
                            : 'bg-red-900/20 text-red-400 border-red-500/30'
                        }`}>
                          {cliente.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(cliente)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600/10 text-blue-400 font-medium rounded-lg border border-blue-500/20 hover:bg-blue-600/20 transition-colors duration-200 text-sm"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(cliente.id, cliente.nome)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600/10 text-red-400 font-medium rounded-lg border border-red-500/20 hover:bg-red-600/20 transition-colors duration-200 text-sm"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Excluir
                          </button>
                        </div>
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
              totalItems={finalFilteredClientes.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ClienteModal
          cliente={clienteParaEditar}
          onClose={closeModal}
          onSave={() => {
            loadClientes();
            closeModal();
          }}
        />
      )}
    </div>
  );
}

function ClienteModal({ cliente, onClose, onSave }) {
  const [formData, setFormData] = useState({
    tipo: cliente?.tipo || 'PF',
    nome: cliente?.nome || '',
    documento: cliente?.documento_formatado || cliente?.documento || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    endereco: cliente?.endereco || '',
    ativo: cliente?.ativo ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar email antes de enviar
    const emailValidation = validateEmail(formData.email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    
    setLoading(true);
    setError('');
    setEmailError('');

    try {
      // Remover máscaras antes de enviar
      const dataToSend = {
        ...formData,
        documento: formData.documento.replace(/\D/g, ''), // Remove tudo que não é número
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : '' // Remove máscara do telefone
      };

      if (cliente) {
        await clienteService.update(cliente.id, dataToSend);
      } else {
        await clienteService.create(dataToSend);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      
      // Melhor tratamento de erro
      let errorMessage = 'Erro ao salvar cliente';
      
      if (error.response?.data) {
        if (error.response.data.telefone) {
          errorMessage = `Telefone: ${error.response.data.telefone[0]}`;
        } else if (error.response.data.documento) {
          errorMessage = `Documento: ${error.response.data.documento[0]}`;
        } else if (error.response.data.email) {
          errorMessage = `Email: ${error.response.data.email[0]}`;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field === 'documento') {
      // Aplicar máscara baseada no tipo
      const maskedValue = applyDocumentMask(value, formData.tipo);
      setFormData(prev => ({ ...prev, [field]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const applyDocumentMask = (value, tipo) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    if (tipo === 'PF') {
      // Máscara CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
      // Máscara CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    }
  };

  const handleTipoChange = (novoTipo) => {
    setFormData(prev => ({
      ...prev,
      tipo: novoTipo,
      documento: '' // Limpar documento quando trocar tipo
    }));
  };

  const validateEmail = (email) => {
    if (!email) return '';
    
    // Regex básico para validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return 'Digite um email válido (exemplo: usuario@dominio.com)';
    }
    
    // Verificações adicionais
    if (email.length > 254) {
      return 'Email muito longo (máximo 254 caracteres)';
    }
    
    if (email.includes('..')) {
      return 'Email não pode ter pontos consecutivos';
    }
    
    if (email.startsWith('.') || email.endsWith('.')) {
      return 'Email não pode começar ou terminar com ponto';
    }
    
    return '';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {cliente ? 'Editar Cliente' : 'Novo Cliente'}
            </h2>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  value={formData.tipo}
                  onChange={(e) => handleTipoChange(e.target.value)}
                  required
                >
                  <option value="PF">Pessoa Física</option>
                  <option value="PJ">Pessoa Jurídica</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  value={formData.ativo}
                  onChange={(e) => handleChange('ativo', e.target.value === 'true')}
                >
                  <option value="true">Ativo</option>
                  <option value="false">Inativo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                {formData.tipo === 'PF' ? 'Nome Completo' : 'Razão Social'} *
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  {formData.tipo === 'PF' ? 'CPF' : 'CNPJ'} *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 font-mono"
                  placeholder={formData.tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                  value={formData.documento}
                  onChange={(e) => handleChange('documento', e.target.value)}
                  maxLength={formData.tipo === 'PF' ? 14 : 18}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  placeholder="(11) 99999-9999"
                  value={formData.telefone}
                  onChange={(e) => handleChange('telefone', e.target.value)}
                  maxLength={15}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                className={`w-full px-4 py-3 bg-gray-700 border-2 rounded-xl text-white placeholder:text-gray-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 ${
                  emailError 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-gray-600 focus:border-purple-500'
                }`}
                placeholder="usuario@exemplo.com"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
              {emailError && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Endereço
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 resize-vertical min-h-[80px]"
                rows="3"
                value={formData.endereco}
                onChange={(e) => handleChange('endereco', e.target.value)}
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-6 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-colors duration-200"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={loading} 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Salvar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Clientes;