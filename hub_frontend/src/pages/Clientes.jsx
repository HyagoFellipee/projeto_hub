import { useState, useEffect } from 'react';
import { clienteService } from '../services/api';
import Pagination from '../components/clientes/Pagination';
import ClienteModal from '../components/clientes/ClienteModal';
import ConfirmationModal from '../components/clientes/ConfirmationModal';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const [searchApplied, setSearchApplied] = useState('');
  const [filtroTipoApplied, setFiltroTipoApplied] = useState('');
  const [filtroStatusApplied, setFiltroStatusApplied] = useState('');

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const response = await clienteService.list({ 
        page_size: 1000,
        limit: 1000,
        page: 1
      });
      
      let allClientes = response.data.results || response.data;
      
      if (response.data.results && response.data.next) {
        let nextUrl = response.data.next;
        while (nextUrl) {
          try {
            const urlParams = new URL(nextUrl).searchParams;
            const nextResponse = await clienteService.list({
              page: urlParams.get('page'),
              page_size: urlParams.get('page_size') || 1000,
              limit: urlParams.get('limit') || 1000
            });
            
            allClientes = [...allClientes, ...(nextResponse.data.results || [])];
            nextUrl = nextResponse.data.next;
          } catch (error) {
            break;
          }
        }
      }
      
      setClientes(allClientes);
      setCurrentPage(1);
    } catch (error) {
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchApplied(search);
    setFiltroTipoApplied(filtroTipo);
    setFiltroStatusApplied(filtroStatus);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearch('');
    setFiltroTipo('');
    setFiltroStatus('');
    setSearchApplied('');
    setFiltroTipoApplied('');
    setFiltroStatusApplied('');
    setCurrentPage(1);
  };

  const handleDelete = (cliente) => {
    setClienteParaExcluir(cliente);
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = async () => {
    setLoadingDelete(true);
    
    try {
      await clienteService.delete(clienteParaExcluir.id);
      loadClientes();
      setShowDeleteConfirmation(false);
      setClienteParaExcluir(null);
    } catch (error) {
      alert('Erro ao excluir cliente');
    } finally {
      setLoadingDelete(false);
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

  const filteredClientes = clientes.filter(cliente => {
    const matchSearch = searchApplied === '' || 
      cliente.nome.toLowerCase().includes(searchApplied.toLowerCase()) ||
      cliente.documento.includes(searchApplied) ||
      cliente.email.toLowerCase().includes(searchApplied.toLowerCase());

    const matchTipo = filtroTipoApplied === '' || cliente.tipo === filtroTipoApplied;
    const matchStatus = filtroStatusApplied === '' || cliente.ativo === (filtroStatusApplied === 'true');

    return matchSearch && matchTipo && matchStatus;
  });

  const totalPages = Math.ceil(filteredClientes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredClientes.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    const newTotalPages = Math.ceil(filteredClientes.length / newItemsPerPage);
    if (currentPage > newTotalPages) {
      setCurrentPage(newTotalPages || 1);
    }
  };

  const hasActiveFilters = searchApplied || filtroTipoApplied || filtroStatusApplied;

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

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

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
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
              {hasActiveFilters && (
                <div className="flex items-center gap-2">
                  {searchApplied && (
                    <span className="bg-blue-900/20 text-blue-400 px-2 py-1 rounded-full text-xs border border-blue-500/30">
                      Busca: "{searchApplied}"
                    </span>
                  )}
                  {filtroTipoApplied && (
                    <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded-full text-xs border border-green-500/30">
                      {filtroTipoApplied === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  )}
                  {filtroStatusApplied !== '' && (
                    <span className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded-full text-xs border border-purple-500/30">
                      {filtroStatusApplied === 'true' ? 'Ativo' : 'Inativo'}
                    </span>
                  )}
                </div>
              )}
              <span className="bg-purple-900/20 text-purple-400 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
              </span>
            </div>
          </div>
        </div>

        {filteredClientes.length === 0 ? (
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
                          <div className="font-medium text-white" title={cliente.nome}>
                            {truncateText(cliente.nome, 30)}
                          </div>
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
                          <span className="text-sm" title={cliente.email}>
                            {truncateText(cliente.email, 25)}
                          </span>
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
                            onClick={() => handleDelete(cliente)}
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredClientes.length}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        )}
      </div>

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

      {showDeleteConfirmation && (
        <ConfirmationModal
          isOpen={showDeleteConfirmation}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setClienteParaExcluir(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o cliente "${clienteParaExcluir?.nome}"? Esta ação não pode ser desfeita.`}
          confirmText="Excluir Cliente"
          cancelText="Cancelar"
          type="delete"
          loading={loadingDelete}
        />
      )}
    </div>
  );
}

export default Clientes;