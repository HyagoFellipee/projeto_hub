import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    console.log('Tentando login com:', credentials);
    
    try {
      await login(credentials);
      console.log('Login bem-sucedido!');
    } catch (error) {
      console.error('Erro no login:', error);
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
      setError(error.response?.data?.detail || 'Erro no login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        
        {error && (
          <div style={{color: 'red', marginBottom: '1rem', textAlign: 'center'}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Usuário"
            className="input-field mb-4"
            value={credentials.username}
            onChange={(e) => setCredentials({...credentials, username: e.target.value})}
          />
          <input
            type="password"
            placeholder="Senha"
            className="input-field mb-6"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
          />
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;