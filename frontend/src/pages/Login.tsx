import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.message || 'Contraseña o usuario incorrectos. Intente de nuevo.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor. Verifique su red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, hsl(var(--color-bg-base)) 0%, hsl(var(--color-primary-light)) 100%)' }}>
      <div className="card glass animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', borderTop: '4px solid hsl(var(--color-primary))', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div className="text-center mb-8">
          <div style={{ display: 'inline-flex', background: 'hsl(var(--color-primary) / 0.1)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-h1 text-primary mb-2">Fiao<span style={{ color: 'hsl(var(--color-text-main))'}}>App</span></h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Gestión Segura de Crédito Colmado</p>
        </div>

        {error && (
          <div className="animate-shake" style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', padding: '0.875rem 1rem', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Usuario</label>
            <input 
              className="input" 
              placeholder="admin_colmado" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
              style={{ padding: '0.75rem 1rem' }}
            />
          </div>
          <div>
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600 }}>Contraseña</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              style={{ padding: '0.75rem 1rem' }}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem', fontWeight: 700, fontSize: '1rem' }}
          >
            {loading ? 'Validando...' : 'Entrar al Sistema'}
          </button>
        </form>
        
        <div className="text-center" style={{ marginTop: '2.5rem' }}>
          <p className="text-muted" style={{ fontSize: '0.75rem', opacity: 0.6 }}>MVP FiaoApp © 2026 · V 1.0.2</p>
        </div>
      </div>
    </div>
  );
}
