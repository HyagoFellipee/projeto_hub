function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar", 
  type = "default", 
  loading = false 
}) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'create':
        return {
          iconColor: 'text-blue-400',
          buttonGradient: 'from-blue-500 to-purple-600',
          borderColor: 'border-blue-500/30',
          bgColor: 'bg-blue-900/20'
        };
      case 'edit':
        return {
          iconColor: 'text-orange-400',
          buttonGradient: 'from-orange-500 to-red-600',
          borderColor: 'border-orange-500/30',
          bgColor: 'bg-orange-900/20'
        };
      case 'retirada':
        return {
          iconColor: 'text-green-400',
          buttonGradient: 'from-green-500 to-emerald-600',
          borderColor: 'border-green-500/30',
          bgColor: 'bg-green-900/20'
        };
      default:
        return {
          iconColor: 'text-purple-400',
          buttonGradient: 'from-purple-500 to-blue-600',
          borderColor: 'border-purple-500/30',
          bgColor: 'bg-purple-900/20'
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'create':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        );
      case 'edit':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        );
      case 'retirada':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        );
      default:
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        );
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`p-3 rounded-full ${styles.bgColor} border ${styles.borderColor}`}>
              <svg className={`w-6 h-6 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {getIcon()}
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-gray-400 text-sm mt-1">{message}</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              onClick={onConfirm}
              disabled={loading}
              className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${styles.buttonGradient} text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg className={`w-4 h-4 ${styles.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {getIcon()}
                  </svg>
                  {confirmText}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;