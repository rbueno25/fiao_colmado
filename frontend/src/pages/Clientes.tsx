import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, Edit2, Trash2 } from 'lucide-react';

export default function Clientes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<any>(null);
  
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [cedula, setCedula] = useState('');
  const [limite, setLimite] = useState(3000);

  const fetchClientes = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/clientes");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (e) {
      console.error("API Error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  // Formaters
  const formatTelefono = (value: string) => {
    const numbers = value.replace(/\D/g, '').substring(0, 10);
    let formated = '';
    if (numbers.length > 0) formated += numbers.substring(0, 3);
    if (numbers.length > 3) formated += '-' + numbers.substring(3, 6);
    if (numbers.length > 6) formated += '-' + numbers.substring(6, 10);
    return formated;
  };

  const formatCedula = (value: string) => {
    const numbers = value.replace(/\D/g, '').substring(0, 11);
    let formated = '';
    if (numbers.length > 0) formated += numbers.substring(0, 3);
    if (numbers.length > 3) formated += '-' + numbers.substring(3, 10);
    if (numbers.length > 10) formated += '-' + numbers.substring(10, 11);
    return formated;
  };

  const handleOpenModal = (client?: any) => {
    if (client) {
      setEditClient(client);
      setNombre(client.nombre);
      setTelefono(client.telefono || '');
      setCedula(client.cedula || '');
      setLimite(Number(client.limite));
    } else {
      setEditClient(null);
      setNombre(''); setTelefono(''); setCedula(''); setLimite(3000);
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editClient ? "PUT" : "POST";
      const url = editClient 
        ? `http://localhost:3000/api/clientes/${editClient.id}` 
        : "http://localhost:3000/api/clientes";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, cedula, limite })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.message || "Error al guardar");
        return;
      }

      setIsModalOpen(false);
      setNombre(''); setTelefono(''); setCedula(''); setLimite(3000);
      fetchClientes();
    } catch (e) {
      console.error(e);
      alert("Error de conexión con el servidor");
    }
  };

  const handleDelete = async (id: number) => {
    if(!confirm("¿Estás seguro de que quieres eliminar a este cliente permanentemente?")) return;

    try {
      await fetch(`http://localhost:3000/api/clientes/${id}`, {
        method: "DELETE"
      });
      fetchClientes();
    } catch(e) {
      console.error(e);
      alert("Error al eliminar");
    }
  };

  const filteredClients = clients.filter(client => 
    client.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (client.telefono && client.telefono.includes(searchTerm))
  );

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-h1">Directorio de Clientes</h1>
          <p className="text-muted">Gestiona a quienes le fias, límites de crédito y deudas actuales.</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <UserPlus size={18} /> Agregar Cliente
        </button>
      </div>

      <div className="card mb-6" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} className="text-muted" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            className="input" 
            placeholder="Buscar por nombre o teléfono..." 
            style={{ paddingLeft: '2.5rem' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={18} /> Filtros
        </button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid hsl(var(--border-color))', color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                <th style={{ padding: '1rem 0.5rem' }}>Cliente</th>
                <th style={{ padding: '1rem 0.5rem' }}>Contacto</th>
                <th style={{ padding: '1rem 0.5rem' }}>Deuda Actual</th>
                <th style={{ padding: '1rem 0.5rem' }}>Límite Válido</th>
                <th style={{ padding: '1rem 0.5rem' }}>Estado</th>
                <th style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--color-text-muted))' }}>Cargando datos desde la API...</td></tr>
              ) : filteredClients.map((client) => {
                const porcentaje = (client.deuda / client.limite) * 100;
                let deudaColorClass = 'text-main';
                if (porcentaje >= 100) deudaColorClass = 'text-danger';
                else if (porcentaje >= 80) deudaColorClass = 'text-warning';

                return (
                  <tr key={client.id} style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                    <td style={{ padding: '1rem 0.5rem', fontWeight: 500 }}>{client.nombre}</td>
                    <td style={{ padding: '1rem 0.5rem', color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>{client.telefono || 'Sin registrar'}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      <span className={`font-600 ${deudaColorClass}`}>RD$ {Number(client.deuda).toLocaleString()}</span>
                    </td>
                    <td style={{ padding: '1rem 0.5rem', color: 'hsl(var(--color-text-muted))' }}>RD$ {Number(client.limite).toLocaleString()}</td>
                    <td style={{ padding: '1rem 0.5rem' }}>
                      {client.estado === 'activo' ? (
                        <span className="badge badge-success">Activo</span>
                      ) : (
                        <span className="badge badge-danger">Bloqueado</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem 0.5rem', textAlign: 'right' }}>
                      <button className="btn btn-secondary" style={{ padding: '0.4rem', border: 'none', marginRight: '0.5rem', background: 'transparent', color: 'hsl(var(--color-text-muted))' }} onClick={() => handleOpenModal(client)} title="Editar">
                        <Edit2 size={18} />
                      </button>
                      <button className="btn btn-danger" style={{ padding: '0.4rem', border: 'none', background: 'transparent' }} onClick={() => handleDelete(client.id)} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {!loading && filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--color-text-muted))' }}>
                    No se encontraron clientes. ¡Usa el botón de arriba para registrar uno!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="card glass animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 className="text-h2 mb-2">{editClient ? 'Editar Cliente' : 'Nuevo Cliente'}</h2>
            <p className="text-muted mb-6">{editClient ? 'Modifica los datos del cliente actual.' : 'Registra los datos para habilitar crédito (fiao).'}</p>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Nombre Completo *</label>
                <input type="text" className="input" placeholder="Ej: Ramon Ramirez" value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Telefono *</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="809-555-1234" 
                    value={telefono} 
                    onChange={e => setTelefono(formatTelefono(e.target.value))} 
                    required 
                    pattern="\d{3}-\d{3}-\d{4}" 
                    title="Formato: 809-555-1234" 
                  />
                </div>
                <div>
                  <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Cedula *</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="001-9312809-2" 
                    value={cedula} 
                    onChange={e => setCedula(formatCedula(e.target.value))} 
                    required 
                    pattern="\d{3}-\d{7}-\d{1}" 
                    title="Formato: 001-9312809-2" 
                  />
                </div>
              </div>
              <div>
                <label className="text-muted mb-1" style={{ display: 'block', fontSize: '0.875rem' }}>Limite de Credito Permitido (RD$) *</label>
                <input type="number" className="input" placeholder="Ej: 5000" required value={limite} onChange={e => setLimite(Number(e.target.value))} min="0" />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editClient ? 'Actualizar Cliente' : 'Guardar Cliente'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
