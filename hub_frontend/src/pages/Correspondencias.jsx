import { useState, useEffect } from 'react';
import { correspondenciaService, clienteService, caixaPostalService } from '../services/api';

function Correspondencias() {
  const [correspondencias, setCorrespondencias] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [caixasPostais, setCaixasPostais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState({
    cliente_id: '',
    status: '',
    tipo: '',
    data_inicio: '',
    data_fim: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [correspondenciaParaEditar, setCorrespondenciaParaEditar] = useState(null);
  const [showRetiradaModal, setShowRetiradaModal] = useState(false);
  const [correspondenciaParaRetirada, setCorrespondenciaParaRetirada] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [correspondenciasRes, clientesRes, caixasRes] = await Promise.all([
        correspondenciaService.list(filtros),
        clienteService.list(),
        caixaPostalService.list()
      ]);
      
      setCorrespondencias(correspondenciasRes.data.results || correspondenciasRes.data);
      setClientes(clientesRes.data.results || clientesRes.data);
      setCaixasPostais(caixasRes.data.results || caixasRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar correspondências');
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    loadData();
  };

  const clearFilters = () => {
    setFiltros({
      cliente_id: '',
      status: '',
      tipo: '',
      data_inicio: '',
      data_fim: ''
    });
    setTimeout(loadData, 100);
  };

  const handleMarcarRetirada = async (correspondencia) => {
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
      case 'RECEBIDA': return 'bg-orange-100 text-orange-800';
      case 'RETIRADA': return 'bg-green-100 text-green-800';
      case 'DEVOLVIDA': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDiasColor = (dias, status) => {
    if (status !== 'RECEBIDA') return 'bg-gray-100 text-gray-800';
    if (dias > 30) return 'bg-red-100 text-red-800';
    if (dias > 15) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

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
        <h1 className="text-2xl font-bold">Correspondências</h1>
        <button onClick={() => openModal()} className="btn-primary">
          Nova Correspondência
        </button>
      </div>

      <div className="card mb-6">
        <h3 className="font-bold mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <select
              className="input-field"
              value={filtros.cliente_id}
              onChange={(e) => setFiltros(prev => ({ ...prev, cliente_id: e.target.value }))}
            >
              <option value="">Todos os clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              className="input-field"
              value={filtros.status}
              onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Todos os status</option>
              <option value="RECEBIDA">Recebida</option>
              <option value="RETIRADA">Retirada</option>
              <option value="DEVOLVIDA">Devolvida</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <select
              className="input-field"
              value={filtros.tipo}
              onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
            >
              <option value="">Todos os tipos</option>
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

          <div>
            <label className="block text-sm font-medium mb-2">Data Início</label>
            <input
              type="date"
              className="input-field"
              value={filtros.data_inicio}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_inicio: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Data Fim</label>
            <input
              type="date"
              className="input-field"
              value={filtros.data_fim}
              onChange={(e) => setFiltros(prev => ({ ...prev, data_fim: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <button onClick={handleFilter} className="btn-primary">
            Filtrar
          </button>
          <button onClick={clearFilters} className="btn-secondary">
            Limpar Filtros
          </button>
        </div>
      </div>

      {error && (
        <div className="card mb-6">
          <p style={{color: 'red'}}>{error}</p>
          <button onClick={loadData} className="btn-primary mt-2">
            Tentar novamente
          </button>
        </div>
      )}

      <div className="card">
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {correspondencias.length} {correspondencias.length === 1 ? 'correspondência encontrada' : 'correspondências encontradas'}
          </p>
        </div>

        {correspondencias.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhuma correspondência encontrada</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Cliente / Caixa</th>
                  <th className="text-left py-2">Descrição</th>
                  <th className="text-left py-2">Tipo</th>
                  <th className="text-left py-2">Remetente</th>
                  <th className="text-left py-2">Recebida em</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Dias</th>
                  <th className="text-left py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {correspondencias.map((correspondencia) => (
                  <tr key={correspondencia.id} className="border-b">
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{correspondencia.cliente_nome}</div>
                        <div className="text-sm text-gray-600">
                          Caixa {correspondencia.caixa_numero}
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="max-w-xs">
                        <div className="font-medium">{correspondencia.descricao}</div>
                        {correspondencia.codigo_rastreamento && (
                          <div className="text-sm text-gray-600 font-mono">
                            {correspondencia.codigo_rastreamento}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {correspondencia.tipo_display}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {correspondencia.remetente || '-'}
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(correspondencia.data_recebimento).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${getStatusColor(correspondencia.status)}`}>
                        {correspondencia.status_display}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-sm ${getDiasColor(correspondencia.dias_na_caixa, correspondencia.status)}`}>
                        {correspondencia.dias_na_caixa} dias
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        {correspondencia.status === 'RECEBIDA' && (
                          <button
                            onClick={() => handleMarcarRetirada(correspondencia)}
                            className="btn-primary text-sm"
                          >
                            Marcar Retirada
                          </button>
                        )}
                        <button
                          onClick={() => openModal(correspondencia)}
                          className="btn-secondary text-sm"
                        >
                          Editar
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

function CorrespondenciaModal({ correspondencia, caixasPostais, onClose, onSave }) {
  const [formData, setFormData] = useState({
    caixa_postal: correspondencia?.caixa_postal || '',
    tipo: correspondencia?.tipo || 'CARTA',
    descricao: correspondencia?.descricao || '',
    remetente: correspondencia?.remetente || '',
    codigo_rastreamento: correspondencia?.codigo_rastreamento || '',
    observacoes: correspondencia?.observacoes || '',
    data_recebimento: correspondencia?.data_recebimento 
      ? new Date(correspondencia.data_recebimento).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const dataToSend = {
        ...formData,
        data_recebimento: new Date(formData.data_recebimento).toISOString()
      };

      if (correspondencia) {
        await correspondenciaService.update(correspondencia.id, dataToSend);
      } else {
        await correspondenciaService.create(dataToSend);
      }
      onSave();
    } catch (error) {
      console.error('Erro ao salvar correspondência:', error);
      setError(error.response?.data?.detail || 'Erro ao salvar correspondência');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {correspondencia ? 'Editar Correspondência' : 'Nova Correspondência'}
          </h2>
          <button onClick={onClose} className="text-gray-500 text-xl">×</button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Caixa Postal *</label>
              <select
                className="input-field"
                value={formData.caixa_postal}
                onChange={(e) => setFormData(prev => ({ ...prev, caixa_postal: e.target.value }))}
                required
              >
                <option value="">Selecione uma caixa postal</option>
                {caixasPostais.map(caixa => (
                  <option key={caixa.id} value={caixa.id}>
                    Caixa {caixa.numero} - {caixa.cliente_nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tipo *</label>
              <select
                className="input-field"
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                required
              >
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
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Descrição *</label>
            <textarea
              className="input-field"
              rows="3"
              value={formData.descricao}
              onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Remetente</label>
              <input
                type="text"
                className="input-field"
                value={formData.remetente}
                onChange={(e) => setFormData(prev => ({ ...prev, remetente: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Código de Rastreamento</label>
              <input
                type="text"
                className="input-field"
                value={formData.codigo_rastreamento}
                onChange={(e) => setFormData(prev => ({ ...prev, codigo_rastreamento: e.target.value }))}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Data de Recebimento *</label>
            <input
              type="datetime-local"
              className="input-field"
              value={formData.data_recebimento}
              onChange={(e) => setFormData(prev => ({ ...prev, data_recebimento: e.target.value }))}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              className="input-field"
              rows="3"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
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

function RetiradaModal({ correspondencia, onClose, onSave }) {
  const [formData, setFormData] = useState({
    retirado_por: '',
    documento_retirada: '',
    observacoes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await correspondenciaService.marcarRetirada(correspondencia.id, formData);
      onSave();
    } catch (error) {
      console.error('Erro ao marcar retirada:', error);
      setError(error.response?.data?.detail || 'Erro ao marcar retirada');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Marcar como Retirada</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">×</button>
        </div>

        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded">
          <strong>Cliente:</strong> {correspondencia.cliente_nome}<br/>
          <strong>Tipo:</strong> {correspondencia.tipo_display}<br/>
          <strong>Descrição:</strong> {correspondencia.descricao}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Retirado por</label>
            <input
              type="text"
              className="input-field"
              value={formData.retirado_por}
              onChange={(e) => setFormData(prev => ({ ...prev, retirado_por: e.target.value }))}
              placeholder="Nome de quem retirou"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Documento</label>
            <input
              type="text"
              className="input-field"
              value={formData.documento_retirada}
              onChange={(e) => setFormData(prev => ({ ...prev, documento_retirada: e.target.value }))}
              placeholder="CPF/RG de quem retirou"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Observações</label>
            <textarea
              className="input-field"
              rows="3"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              placeholder="Observações sobre a retirada"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Marcando...' : 'Marcar como Retirada'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Correspondencias;