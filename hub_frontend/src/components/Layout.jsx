import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Layout() {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">HUB</h1>
            </div>
            <button onClick={logout} className="btn-secondary">
              Sair
            </button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;