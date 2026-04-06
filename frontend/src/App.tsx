import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, Users, ShoppingCart, CreditCard, FileText, Settings, LogOut, Shield } from 'lucide-react';
import './index.css';

import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Reportes from './pages/Reportes';
import Pagos from './pages/Pagos';
import Usuarios from './pages/Usuarios';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function Sidebar() {
  const location = useLocation();
  const { logout, user } = useAuth();

  const menu = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
    { name: 'Punto de Venta', path: '/ventas', icon: <ShoppingCart size={20} /> },
    { name: 'Pagos', path: '/pagos', icon: <CreditCard size={20} /> },
    { name: 'Reportes', path: '/reportes', icon: <FileText size={20} /> },
  ];

  // Agregar Usuarios solo si es admin
  if (user?.rol === 'admin') {
    menu.push({ name: 'Usuarios', path: '/usuarios', icon: <Shield size={20} /> });
  }

  return (
    <div className="sidebar">
      <div className="mb-6">
        <h1 className="text-h2 text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧾 Fiao<span className="text-main">App</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '0.875rem' }}>Colmado El Primo</p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
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

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
        <div style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
           <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--color-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
             {user?.username?.[0]?.toUpperCase()}
           </div>
           <div style={{ minWidth: 0 }}>
             <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</p>
             <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>{user?.rol}</p>
           </div>
        </div>
        <button onClick={logout} className="sidebar-link text-danger" style={{ border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <LogOut size={20} /> Cerrar Sesión
        </button>
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
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><Clientes /></ProtectedRoute>} />
            <Route path="/ventas" element={<ProtectedRoute><Ventas /></ProtectedRoute>} />
            <Route path="/reportes" element={<ProtectedRoute><Reportes /></ProtectedRoute>} />
            <Route path="/pagos" element={<ProtectedRoute><Pagos /></ProtectedRoute>} />
            <Route path="/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
