import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Users, ShoppingCart, CreditCard, FileText, Settings, LogOut } from 'lucide-react';
import './index.css';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';

function Sidebar() {
  const location = useLocation();

  const menu = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
    { name: 'Ventas', path: '/ventas', icon: <ShoppingCart size={20} /> },
    { name: 'Pagos', path: '/pagos', icon: <CreditCard size={20} /> },
    { name: 'Reportes', path: '/reportes', icon: <FileText size={20} /> },
  ];

  return (
    <div className="sidebar">
      <div className="mb-6">
        <h1 className="text-h2 text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧾 Fiao<span className="text-main">App</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Colmado El Primo</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {menu.map((item) => (
          <Link 
            key={item.path} 
            to={item.path} 
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon} {item.name}
          </Link>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link to="/config" className="sidebar-link"><Settings size={20} /> Configuración</Link>
        <Link to="/login" className="sidebar-link text-danger"><LogOut size={20} /> Cerrar Sesión</Link>
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login';

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/clientes" element={<Clientes />} />
          {/* MVP placeholders for other routes */}
          <Route path="/ventas" element={<Ventas />} />
          <Route path="/pagos" element={<div className="animate-fade-in"><h1 className="text-h2">Módulo de Pagos</h1><p className="text-muted mb-6">Próximamente en el MVP...</p></div>} />
          <Route path="/reportes" element={<div className="animate-fade-in"><h1 className="text-h2">Reportes</h1><p className="text-muted mb-6">Próximamente en el MVP...</p></div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
