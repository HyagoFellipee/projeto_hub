import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const { login } = useAuth();

  // Validação em tempo real
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          errors.username = 'Nome de usuário é obrigatório';
        } else if (value.length < 3) {
          errors.username = 'Mínimo 3 caracteres';
        } else {
          delete errors.username;
        }
        break;
      case 'password':
        if (!value) {
          errors.password = 'Senha é obrigatória';
        } else if (value.length < 6) {
          errors.password = 'Mínimo 6 caracteres';
        } else {
          delete errors.password;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    if (error) setError('');
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const isUsernameValid = validateField('username', credentials.username);
    const isPasswordValid = validateField('password', credentials.password);
    
    if (!isUsernameValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    
    try {
      await login(credentials);
    } catch (error) {
      console.error('Erro no login:', error);
      
      if (error.response?.status === 401) {
        setError('Usuário e/ou senha incorreto(s)');
      } else if (error.response?.status === 429) {
        setError('Muitas tentativas. Tente novamente em alguns minutos');
      } else if (!navigator.onLine) {
        setError('Sem conexão com a internet');
      } else {
        setError('Erro no servidor. Tente novamente');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = credentials.username && credentials.password && Object.keys(fieldErrors).length === 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gray-900">
      {/* Background gradient escuro */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-blue-900 opacity-20"></div>
      
      {/* Container principal */}
      <div className="relative z-10 w-full max-w-md animate-slide-up">
        {/* Card principal com tema escuro */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Logo melhorado */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-3xl text-3xl font-bold tracking-wider mb-6 hover:scale-105 transition-transform duration-200 shadow-lg">
                HUB
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-2">
              Sistema de Correspondências
            </h1>
            <p className="text-gray-400 text-sm">
              Entre com suas credenciais para acessar o sistema
            </p>
          </div>

          {/* Banner de erro global */}
          {error && (
            <div className="flex items-center gap-3 p-3 px-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400 text-sm animate-slide-up mb-6" role="alert" aria-live="polite">
              <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Campo Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-white">
                Nome de usuário
              </label>
              <div className="relative">
                {/* Ícone do usuário */}
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors duration-200"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                
                <input
                  id="username"
                  type="text"
                  name="username"
                  value={credentials.username}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-11 border-2 rounded-xl bg-gray-700 text-white text-sm transition-all duration-200 focus:ring-4 disabled:bg-gray-600 disabled:text-gray-400 placeholder:text-gray-500 ${
                    fieldErrors.username ? 'border-red-500/50 bg-red-900/20 focus:border-red-500 focus:ring-red-500/20' : 
                    credentials.username && !fieldErrors.username ? 'border-green-500/50 bg-green-900/20 focus:border-green-500 focus:ring-green-500/20' : 
                    'border-gray-600 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Digite seu usuário"
                  disabled={loading}
                  autoComplete="username"
                  aria-describedby={fieldErrors.username ? 'username-error' : undefined}
                  aria-invalid={!!fieldErrors.username}
                />
              </div>
              
              {fieldErrors.username && (
                <div id="username-error" className="flex items-center gap-2 text-red-400 text-xs mt-1" role="alert">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.username}
                </div>
              )}
            </div>

            {/* Campo Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white">
                Senha
              </label>
              <div className="relative">
                {/* Ícone do cadeado */}
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 transition-colors duration-200"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={credentials.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 pl-11 pr-12 border-2 rounded-xl bg-gray-700 text-white text-sm transition-all duration-200 focus:ring-4 disabled:bg-gray-600 disabled:text-gray-400 placeholder:text-gray-500 ${
                    fieldErrors.password ? 'border-red-500/50 bg-red-900/20 focus:border-red-500 focus:ring-red-500/20' : 
                    credentials.password && !fieldErrors.password ? 'border-green-500/50 bg-green-900/20 focus:border-green-500 focus:ring-green-500/20' : 
                    'border-gray-600 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  placeholder="Digite sua senha"
                  disabled={loading}
                  autoComplete="current-password"
                  aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                  aria-invalid={!!fieldErrors.password}
                />
                
                {/* Botão toggle da senha */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-md transition-colors duration-200"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              
              {fieldErrors.password && (
                <div id="password-error" className="flex items-center gap-2 text-red-400 text-xs mt-1" role="alert">
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Botão Submit */}
            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={!isFormValid || loading}
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </>
              ) : (
                'Acessar Sistema'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;