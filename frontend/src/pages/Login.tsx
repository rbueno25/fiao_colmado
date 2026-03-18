import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin_colmado' && password === 'fiao123') {
      navigate('/');
    } else {
      alert('Credenciales incorrectas. (Usa admin_colmado / fiao123)');
    }
  };

  return (
    <div className="login-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, hsl(var(--color-bg-base)) 0%, hsl(var(--color-primary-light)) 100%)' }}>
      <div className="card glass animate-fade-in" style={{ maxWidth: '400px', width: '100%', padding: '2.5rem', borderTop: '4px solid hsl(var(--color-primary))' }}>
        <div className="text-center mb-6">
          <h1 className="text-h1 text-primary mb-2">Fiao<span style={{ color: 'hsl(var(--color-text-main))'}}>App</span></h1>
          <p className="text-muted">Control de crédito para tu colmado</p>
        </div>
        
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Usuario</label>
            <input 
              type="text" 
              className="input" 
              placeholder="Ej: admin_colmado" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Contraseña</label>
            <input 
              type="password" 
              className="input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem', padding: '0.75rem' }}>
            Ingresar al Sistema
          </button>
        </form>
        
        <div className="text-center" style={{ marginTop: '2rem' }}>
          <p className="text-muted" style={{ fontSize: '0.75rem' }}>MVP FiaoApp © 2026</p>
        </div>
      </div>
    </div>
  );
}
