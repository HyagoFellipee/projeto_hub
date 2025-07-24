import { useState, useEffect, useRef } from 'react';

function ClienteAutocomplete({ value, onChange, clientes, placeholder = "Buscar cliente..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (value) {
      const client = clientes.find(c => c.id.toString() === value);
      setSelectedClient(client);
      setSearchTerm(client ? client.nome : '');
    } else {
      setSelectedClient(null);
      setSearchTerm('');
    }
  }, [value, clientes]);

  const filteredClientes = clientes.filter(cliente =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.documento.includes(searchTerm) ||
    cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
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
      setSelectedClient(null);
      onChange('');
    }
  };

  const handleClientSelect = (cliente) => {
    setSelectedClient(cliente);
    setSearchTerm(cliente.nome);
    setIsOpen(false);
    onChange(cliente.id.toString());
  };

  const handleClear = () => {
    setSelectedClient(null);
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
        {selectedClient && (
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
              {filteredClientes.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => handleClientSelect(cliente)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-600 transition-colors duration-200 border-b border-gray-600 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-white truncate">{cliente.nome}</div>
                      <div className="text-sm text-gray-400 flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          cliente.tipo === 'PF' 
                            ? 'bg-blue-900/20 text-blue-400' 
                            : 'bg-green-900/20 text-green-400'
                        }`}>
                          {cliente.tipo}
                        </span>
                        <span className="font-mono">{cliente.documento_formatado}</span>
                      </div>
                    </div>
                    {selectedClient?.id === cliente.id && (
                      <svg className="w-5 h-5 text-purple-400 ml-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-3 text-gray-400 text-center">
              <svg className="w-8 h-8 mx-auto mb-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClienteAutocomplete;