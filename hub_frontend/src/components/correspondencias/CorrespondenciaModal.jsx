import { useState, useEffect, useRef } from 'react';
import { correspondenciaService } from '../../services/api';

function ClienteCaixaAutocomplete({ value, onChange, clientes, caixasPostais, placeholder = "Buscar cliente..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCaixa, setSelectedCaixa] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value && selectedCaixa && selectedCaixa.id.toString() === value) {
      return;
    }
    
    if (value) {
      const caixa = caixasPostais.find(c => c.id.toString() === value);
      if (caixa) {
        setSelectedCaixa(caixa);
        const cliente = clientes.find(cl => cl.id === caixa.cliente);
        setSearchTerm(cliente ? cliente.nome : '');
      } else {
        const cliente = clientes.find(cl => cl.id.toString() === value);
        if (cliente) {
          setSearchTerm(cliente.nome);
        }
      }
    } else {
      setSelectedCaixa(null);
      setSearchTerm('');
    }
  }, [value, caixasPostais, clientes, selectedCaixa]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento?.includes(searchTerm)
  ).slice(0, 10);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    
    if (!newValue) {
      setSelectedCaixa(null);
      onChange('');
    }
  };

  const handleClienteSelect = (cliente) => {
    const caixa = caixasPostais.find(c => c.cliente === cliente.id);
    if (caixa) {
      setSelectedCaixa(caixa);
      setSearchTerm(cliente.nome);
      setIsOpen(false);
      onChange(caixa.id.toString());
    } else {
      alert(`Cliente "${cliente.nome}" não possui caixa postal. Crie uma caixa postal primeiro no cadastro de clientes.`);
    }
  };

  const handleClear = () => {
    setSelectedCaixa(null);
    setSearchTerm('');
    onChange('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
        />
        {selectedCaixa && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
            title="Limpar seleção"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && searchTerm && (
        <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {filteredClientes.length > 0 ? (
            <>
              {filteredClientes.map((cliente) => {
                const caixa = caixasPostais.find(c => c.cliente === cliente.id);
                if (!caixa) {
                  console.log('Cliente sem caixa:', cliente.nome, cliente.id);
                }
                return (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => handleClienteSelect(cliente)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white truncate">{cliente.nome}</div>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          {caixa && (
                            <span className="bg-purple-900/20 text-purple-400 px-2 py-1 rounded-full text-xs">
                              Caixa {caixa.numero}
                            </span>
                          )}
                          <span className="font-mono text-xs">{cliente.documento}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CorrespondenciaModal({ correspondencia, caixasPostais, clientes, onClose, onSave }) {
  const getBrasiliaDateTime = () => {
    const now = new Date();
    const brasiliaOffset = -3 * 60;
    const localOffset = now.getTimezoneOffset();
    const brasiliaTime = new Date(now.getTime() + (localOffset - brasiliaOffset) * 60 * 1000);
    return brasiliaTime.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    caixa_postal: correspondencia?.caixa_postal || '',
    tipo: correspondencia?.tipo || 'CARTA',
    descricao: correspondencia?.descricao || '',
    remetente: correspondencia?.remetente || '',
    codigo_rastreamento: correspondencia?.codigo_rastreamento || '',
    observacoes: correspondencia?.observacoes || '',
    data_recebimento: correspondencia?.data_recebimento 
      ? new Date(correspondencia.data_recebimento).toISOString().slice(0, 16)
      : getBrasiliaDateTime()
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
      
      let errorMessage = 'Erro ao salvar correspondência';
      if (error.response?.data) {
        if (error.response.data.detail) {
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 3.26a2 2 0 001.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {correspondencia ? 'Editar Correspondência' : 'Nova Correspondência'}
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
                  Cliente - Caixa Postal *
                </label>
                {correspondencia ? (
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 bg-gray-600 border-2 border-gray-500 rounded-xl text-gray-300 cursor-not-allowed"
                      value={(() => {
                        const caixa = caixasPostais.find(c => c.id === correspondencia.caixa_postal);
                        if (caixa) {
                          return `Caixa ${caixa.numero || 'N/A'} - ${caixa.cliente_nome || 'Cliente não encontrado'}`;
                        }
                        return `Caixa ${correspondencia.caixa_numero || 'N/A'} - ${correspondencia.cliente_nome || 'Cliente não encontrado'}`;
                      })()}                      
                      disabled
                      readOnly
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                ) : (
                  <ClienteCaixaAutocomplete
                    value={formData.caixa_postal}
                    onChange={(value) => handleChange('caixa_postal', value)}
                    clientes={clientes}
                    caixasPostais={caixasPostais}
                    placeholder="Buscar cliente para selecionar caixa postal..."
                  />
                )}
                {correspondencia && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    A caixa postal não pode ser alterada após a criação
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Tipo *
                </label>
                <select
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  value={formData.tipo}
                  onChange={(e) => handleChange('tipo', e.target.value)}
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

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Descrição *
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 resize-vertical min-h-[80px]"
                rows="3"
                maxLength="500"
                value={formData.descricao}
                onChange={(e) => handleChange('descricao', e.target.value)}
                placeholder="Descreva a correspondência... (máximo 500 caracteres)"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.descricao.length}/500 caracteres
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Remetente *
                </label>
                <input
                  type="text"
                  maxLength="200"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                  placeholder="Nome do remetente (máximo 200 caracteres)"
                  value={formData.remetente}
                  onChange={(e) => handleChange('remetente', e.target.value)}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.remetente.length}/200 caracteres
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Código de Rastreamento
                </label>
                <input
                  type="text"
                  maxLength="50"
                  className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 font-mono"
                  placeholder="BR123456789BR (máximo 50 caracteres)"
                  value={formData.codigo_rastreamento}
                  onChange={(e) => handleChange('codigo_rastreamento', e.target.value)}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {formData.codigo_rastreamento.length}/50 caracteres
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Data de Recebimento *
              </label>
              <input
                type="datetime-local"
                lang="pt-BR"
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                value={formData.data_recebimento}
                onChange={(e) => handleChange('data_recebimento', e.target.value)}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Horário de Brasília (UTC-3)
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 resize-vertical min-h-[80px]"
                rows="3"
                maxLength="1000"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações adicionais... (máximo 1000 caracteres)"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.observacoes.length}/1000 caracteres
              </div>
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

export default CorrespondenciaModal;