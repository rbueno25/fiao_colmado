import { useState, useEffect } from 'react';
import { UserPlus, Shield, Trash2, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Usuarios() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('empleado');
  const [error, setError] = useState('');

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API}/api/usuarios`);
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/api/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rol })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setUsername(''); setPassword('');
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || 'Error al crear usuario');
      }
    } catch (e) {
      setError('Error de conexión');
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser.id) return alert("No puedes eliminarte a ti mismo");
    if (!confirm("¿Eliminar este usuario?")) return;
    try {
      await fetch(`${API}/api/usuarios/${id}`, { method: 'DELETE' });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  if (currentUser.rol !== 'admin') {
    return (
      <div className="card text-center" style={{ padding: '4rem' }}>
        <Shield size={48} className="text-danger mb-4" style={{ margin: '0 auto' }} />
        <h2 className="text-h2">Acceso Restringido</h2>
        <p className="text-muted">Solo los administradores pueden gestionar usuarios.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-h1">Gestión de Usuarios</h1>
          <p className="text-muted">Administra quiénes tienen acceso al sistema y sus roles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <UserPlus size={18} /> Nuevo Usuario
        </button>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Usuario</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Rol</th>
              <th style={{ padding: '1rem', textAlign: 'left' }}>Creado el</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '50%' }}>
                    <User size={16} className="text-primary" />
                  </div>
                  <span style={{ fontWeight: 600 }}>{u.username}</span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${u.rol === 'admin' ? 'badge-primary' : 'badge-secondary'}`}>
                    {u.rol}
                  </span>
                </td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(u.id)}
                    disabled={u.id === currentUser.id}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card glass" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h2 className="text-h2 mb-4">Crear Usuario</h2>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>{error}</div>}
              <div>
                <label className="text-muted mb-1" style={{ fontSize: '0.85rem', display: 'block' }}>Nombre de Usuario</label>
                <input className="input" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ fontSize: '0.85rem', display: 'block' }}>Contraseña</label>
                <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div>
                <label className="text-muted mb-1" style={{ fontSize: '0.85rem', display: 'block' }}>Rol</label>
                <select className="input" value={rol} onChange={e => setRol(e.target.value)}>
                  <option value="empleado">Empleado (Cajero)</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
