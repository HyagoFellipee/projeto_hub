import { useState } from 'react';
import { clienteService } from '../../services/api';
import ConfirmationModal from './ConfirmationModal';

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
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailValidation = validateEmail(formData.email);
    if (emailValidation) {
      setEmailError(emailValidation);
      return;
    }
    
    setError('');
    setEmailError('');
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    setError('');
    setShowConfirmation(false);

    try {
      const dataToSend = {
        ...formData,
        documento: formData.documento.replace(/\D/g, ''),
        telefone: formData.telefone ? formData.telefone.replace(/\D/g, '') : ''
      };

      if (cliente) {
        await clienteService.update(cliente.id, dataToSend);
      } else {
        await clienteService.create(dataToSend);
      }
      onSave();
    } catch (error) {
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
      const maskedValue = applyDocumentMask(value, formData.tipo);
      setFormData(prev => ({ ...prev, [field]: maskedValue }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const applyDocumentMask = (value, tipo) => {
    const numbers = value.replace(/\D/g, '');
    
    if (tipo === 'PF') {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
    } else {
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
      documento: ''
    }));
  };

  const validateEmail = (email) => {
    if (!email) return '';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      return 'Digite um email válido (exemplo: usuario@dominio.com)';
    }
    
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                {cliente ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmSubmit}
        title={cliente ? 'Confirmar Edição' : 'Confirmar Criação'}
        message={cliente ? 'Tem certeza que deseja atualizar este cliente?' : 'Tem certeza que deseja criar este cliente?'}
        confirmText={cliente ? 'Atualizar' : 'Criar'}
        type={cliente ? 'edit' : 'create'}
        loading={loading}
      />
    </div>
  );
}

export default ClienteModal;