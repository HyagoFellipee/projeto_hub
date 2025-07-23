import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Clientes', href: '/clientes', icon: '👥' },
    { name: 'Correspondências', href: '/correspondencias', icon: '📮' },
    { name: 'Relatórios', href: '/relatorios', icon: '📈' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow">
          <h1 className="text-xl font-bold text-gray-900">HUB</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-50
          w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
        `}>
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center px-6 py-4 border-b">
              <h1 className="text-xl font-bold text-gray-900">HUB Sistema</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                    ${isActive(item.href)
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }
                  `}
                  style={{
                    backgroundColor: isActive(item.href) ? '#dbeafe' : '',
                    color: isActive(item.href) ? '#1d4ed8' : '',
                    borderRight: isActive(item.href) ? '2px solid #2563eb' : ''
                  }}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* User section */}
            <div className="border-t px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Usuário</p>
                  <p className="text-xs text-gray-500">Sistema HUB</p>
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                  title="Sair"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar for desktop */}
          <div className="hidden lg:block bg-white shadow-sm border-b">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {navigation.find(item => isActive(item.href))?.name || 'HUB'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Sistema de Correspondências
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {new Date().toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <button
                    onClick={logout}
                    className="btn-secondary"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;