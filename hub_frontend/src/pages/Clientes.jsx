import { useState, useEffect } from 'react';
import { clienteService } from '../services/api';

function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [clienteParaEditar, setClienteParaEditar] = useState(null);

  useEffect(() => {
    loadClientes();
  }, []);

  const loadClientes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (filtroTipo) params.tipo = filtroTipo;
      
      const response = await clienteService.list(params);
      setClientes(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setError('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadClientes();
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

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
    cliente.documento.includes(search) ||
    cliente.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <button onClick={() => openModal()} className="btn-primary">
          Novo Cliente
        </button>
      </div>

      <div className="card mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Buscar clientes
            </label>
            <input
              type="text"
              placeholder="Nome, documento ou email..."
              className="input-field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Tipo
            </label>
            <select
              className="input-field"
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>
          
          <button type="submit" className="btn-primary">
            Buscar
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              setSearch('');
              setFiltroTipo('');
              loadClientes();
            }}
            className="btn-secondary"
          >
            Limpar
          </button>
        </form>
      </div>

      {error && (
        <div className="card mb-6">
          <p style={{color: 'red'}}>{error}</p>
          <button onClick={loadClientes} className="btn-primary mt-2">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="card">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredClientes.length} {filteredClientes.length === 1 ? 'cliente encontrado' : 'clientes encontrados'}
          </p>
        </div>

        {filteredClientes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum cliente encontrado</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Nome/Razão Social</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Documento</th>
                  <th className="text-left py-2">Email</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="border-b">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{cliente.nome}</div>
                        {cliente.telefone && (
                          <div className="text-sm text-gray-600">{cliente.telefone}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        cliente.tipo === 'PF' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {cliente.tipo === 'PF' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-sm">
                      {cliente.documento_formatado}
                    </td>
                    <td className="py-3 text-sm">
                      {cliente.email}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {cliente.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(cliente)}
                          className="btn-secondary text-sm"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id, cliente.nome)}
                          className="btn-danger text-sm"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </div>
  );
}

function ClienteModal({ cliente, onClose, onSave }) {
  const [formData, setFormData] = useState({
    tipo: cliente?.tipo || 'PF',
    nome: cliente?.nome || '',
    documento: cliente?.documento || '',
    email: cliente?.email || '',
    telefone: cliente?.telefone || '',
    endereco: cliente?.endereco || '',
    ativo: cliente?.ativo ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (cliente) {
        await clienteService.update(cliente.id, formData);
      } else {
        await clienteService.create(formData);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setError(error.response?.data?.detail || 'Erro ao salvar cliente');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {cliente ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button onClick={onClose} className="text-gray-500 text-xl">
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Tipo *
              </label>
              <select
                className="input-field"
                value={formData.tipo}
                onChange={(e) => handleChange('tipo', e.target.value)}
                required
              >
                <option value="PF">Pessoa Física</option>
                <option value="PJ">Pessoa Jurídica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Status
              </label>
              <select
                className="input-field"
                value={formData.ativo}
                onChange={(e) => handleChange('ativo', e.target.value === 'true')}
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              {formData.tipo === 'PF' ? 'Nome Completo' : 'Razão Social'} *
            </label>
            <input
              type="text"
              className="input-field"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {formData.tipo === 'PF' ? 'CPF' : 'CNPJ'} *
              </label>
              <input
                type="text"
                className="input-field"
                placeholder={formData.tipo === 'PF' ? '000.000.000-00' : '00.000.000/0000-00'}
                value={formData.documento}
                onChange={(e) => handleChange('documento', e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Telefone
              </label>
              <input
                type="tel"
                className="input-field"
                placeholder="(11) 99999-9999"
                value={formData.telefone}
                onChange={(e) => handleChange('telefone', e.target.value)}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Email *
            </label>
            <input
              type="email"
              className="input-field"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Endereço
            </label>
            <textarea
              className="input-field"
              rows="3"
              value={formData.endereco}
              onChange={(e) => handleChange('endereco', e.target.value)}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Clientes;