import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { 
      name: 'Dashboard', 
      href: '/dashboard', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    { 
      name: 'Clientes', 
      href: '/clientes', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      )
    },
    { 
      name: 'Correspondências', 
      href: '/correspondencias', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Relatórios', 
      href: '/relatorios', 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const getCurrentPageTitle = () => {
    const currentPage = navigation.find(item => isActive(item.href));
    return currentPage?.name || 'HUB';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile menu button */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg text-sm font-bold">
              HUB
            </div>
            <h1 className="text-lg font-bold text-white">Sistema</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static absolute inset-y-0 left-0 z-50
          w-64 bg-gray-800 border-r border-gray-700 transition-transform duration-300 ease-in-out
          min-h-screen flex flex-col
        `}>
          {/* Logo sem linha */}
          <div className="flex items-center gap-4 px-6 py-6 flex-shrink-0">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl text-xl font-bold">
              HUB
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sistema</h1>
              <p className="text-xs text-gray-400">Correspondências</p>
            </div>
          </div>

          {/* Navigation + Sair */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }
                `}
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}

            {/* Separador */}
            <div className="pt-4 mt-4 border-t border-gray-700">
              {/* Botão Sair na sidebar */}
              <button
                onClick={logout}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 text-red-400 hover:bg-red-600/10 hover:text-red-300 w-full text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar for desktop */}
          <div className="hidden lg:block bg-gray-800 border-b border-gray-700">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {getCurrentPageTitle()}
                  </h1>
                  <p className="text-sm text-gray-400">
                    Sistema de Correspondências
                  </p>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* User section no header */}
                  <div className="flex items-center gap-3 px-4 py-2 bg-gray-700/50 rounded-xl border border-gray-600/50">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-lg text-sm font-bold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {user?.username || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-400">Online</p>
                    </div>
                  </div>

                  {/* Divisor */}
                  <div className="w-px h-8 bg-gray-600"></div>

                  {/* Data */}
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-300">
                      {new Date().toLocaleDateString('pt-BR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long'
                      })}
                    </p>
                    <p className="text-xs text-gray-400">
                      Sistema HUB
                    </p>
                  </div>

                  {/* Divisor */}
                  <div className="w-px h-8 bg-gray-600"></div>

                  {/* Botão Sair */}
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-400 font-medium rounded-xl border border-red-500/20 hover:bg-red-600/20 hover:border-red-500/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-6 bg-gray-900">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default Layout;