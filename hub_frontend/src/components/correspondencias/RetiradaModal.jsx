import { useState } from 'react';
import { correspondenciaService } from '../../services/api';

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
      
      let errorMessage = 'Erro ao marcar retirada';
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

  const truncateText = (text, maxLength = 30) => {
    if (!text) return '-';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Marcar como Retirada
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
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Cliente:</span>
                <span className="text-white font-medium" title={correspondencia.cliente_nome}>
                  {truncateText(correspondencia.cliente_nome, 20)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tipo:</span>
                <span className="text-blue-400">{correspondencia.tipo_display || correspondencia.tipo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Descrição:</span>
                <span className="text-white" title={correspondencia.descricao}>
                  {truncateText(correspondencia.descricao, 20)}
                </span>
              </div>
            </div>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Retirado por *
              </label>
              <input
                type="text"
                maxLength="200"
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                placeholder="Nome de quem retirou (máximo 200 caracteres)"
                value={formData.retirado_por}
                onChange={(e) => handleChange('retirado_por', e.target.value)}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.retirado_por.length}/200 caracteres
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Documento *
              </label>
              <input
                type="text"
                maxLength="50"
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200"
                placeholder="CPF/RG de quem retirou (máximo 50 caracteres)"
                value={formData.documento_retirada}
                onChange={(e) => handleChange('documento_retirada', e.target.value)}
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.documento_retirada.length}/50 caracteres
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Observações
              </label>
              <textarea
                className="w-full px-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-200 resize-vertical min-h-[80px]"
                rows="3"
                maxLength="500"
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Observações sobre a retirada (máximo 500 caracteres)"
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.observacoes.length}/500 caracteres
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
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Marcando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Marcar como Retirada
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

export default RetiradaModal;