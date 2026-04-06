import { useState, useEffect } from 'react';
import { DollarSign, Search, CheckCircle, Clock, User, TrendingDown, AlertCircle, X, FileText } from 'lucide-react';

interface Client {
  id: number;
  nombre: string;
  telefono: string;
  deuda: number;
}

interface Payment {
  id: number;
  monto: number;
  fecha: string;
  clienteId: number;
  clienteNombre?: string;
  nota?: string;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Pagos() {
  const [clients, setClients] = useState<Client[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [clientsRes, paymentsRes] = await Promise.all([
        fetch(`${API}/api/clientes`),
        fetch(`${API}/api/pagos`)
      ]);
      const clientsData = await clientsRes.json();
      const paymentsData = await paymentsRes.json();
      const sortedClients = clientsData
        .filter((c: Client) => Number(c.deuda) > 0)
        .sort((a: Client, b: Client) => Number(b.deuda) - Number(a.deuda));
      setClients(sortedClients);
      setPayments(paymentsData.slice(0, 20)); // últimos 20 pagos
    } catch {
      // silently handle
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredClients = clients.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono?.includes(search)
  );

  const totalDeuda = clients.reduce((acc, c) => acc + Number(c.deuda), 0);

  const handlePago = async () => {
    if (!selectedClient || !monto || Number(monto) <= 0) {
      setError('Selecciona un cliente e ingresa un monto válido.');
      return;
    }
    if (Number(monto) > Number(selectedClient.deuda)) {
      setError(`El monto no puede superar la deuda del cliente (RD$ ${Number(selectedClient.deuda).toLocaleString()}).`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: selectedClient.id,
          monto: Number(monto),
          nota
        })
      });

      if (res.ok) {
        setSuccess(true);
        setMonto('');
        setNota('');
        setSelectedClient(null);
        await fetchData();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Error al registrar el pago. Inténtalo de nuevo.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const downloadMorososReport = () => {
    const today = new Date().toLocaleDateString('es-DO');
    const morosos = clients.filter(c => Number(c.deuda) > 0).sort((a,b) => Number(b.deuda) - Number(a.deuda));
    const content = `
==========================================
       REPORTE DE CLIENTES MOROSOS
==========================================
Fecha: ${today}
Total en Deuda: RD$ ${totalDeuda.toLocaleString()}
Cantidad de Clientes: ${morosos.length}
------------------------------------------

${morosos.map((c, i) => `${(i+1).toString().padStart(2)}. ${c.nombre.padEnd(25)} | RD$ ${Number(c.deuda).toLocaleString()}`).join('\n')}

==========================================
      FIAO APP - USO ADMINISTRATIVO
==========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reporte_morosos_${today.replace(/\//g, '-')}.txt`;
    link.click();
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-h2">Cobros y Pagos</h1>
          <p className="text-muted">Registra abonos y gestiona las deudas de tus clientes.</p>
          <button 
            onClick={downloadMorososReport} 
            className="btn btn-secondary" 
            style={{ marginTop: '0.75rem', borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
          >
            <FileText size={16} /> Generar Reporte de Morosos
          </button>
        </div>
        <div className="card" style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', borderRadius: '12px', border: 'none', minWidth: '200px' }}>
          <div style={{ fontSize: '0.75rem', opacity: 0.85, marginBottom: '0.25rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total en Deudas</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>RD$ {totalDeuda.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', opacity: 0.75, marginTop: '0.2rem' }}>{clients.length} clientes con saldo pendiente</div>
        </div>
      </div>

      {/* Success Banner */}
      {success && (
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
          <CheckCircle size={20} />
          ¡Pago registrado exitosamente! La deuda del cliente ha sido actualizada.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

        {/* LEFT: Lista de clientes con deuda */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingDown size={18} style={{ color: '#ef4444' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Clientes con Deuda</h2>
            </div>

            {/* Buscador */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Buscar cliente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }}
              />
            </div>

            {/* Lista */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '400px', overflowY: 'auto' }}>
              {filteredClients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  {clients.length === 0 ? '🎉 ¡Ningún cliente tiene deuda pendiente!' : 'No se encontraron clientes.'}
                </div>
              ) : (
                filteredClients.map(client => (
                  <div
                    key={client.id}
                    onClick={() => { setSelectedClient(client); setMonto(''); setError(''); }}
                    style={{
                      padding: '0.875rem 1rem',
                      borderRadius: '10px',
                      border: selectedClient?.id === client.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: selectedClient?.id === client.id ? 'var(--primary-light)' : 'var(--bg-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <User size={16} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{client.nombre}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{client.telefono || 'Sin teléfono'}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>RD$ {Number(client.deuda).toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>pendiente</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Panel de cobro */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <DollarSign size={18} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Registrar Abono</h2>
            </div>

            {!selectedClient ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <User size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p style={{ margin: 0 }}>Selecciona un cliente de la lista para registrar su abono.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Cliente seleccionado */}
                <div style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedClient.nombre}</div>
                    <div style={{ fontSize: '0.8rem', color: '#ef4444', fontWeight: 600 }}>Deuda: RD$ {Number(selectedClient.deuda).toLocaleString()}</div>
                  </div>
                  <button onClick={() => setSelectedClient(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Monto */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto del Abono (RD$)</label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={monto}
                    onChange={e => setMonto(e.target.value)}
                    min="1"
                    max={selectedClient.deuda}
                    style={{ width: '100%', padding: '0.75rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600, boxSizing: 'border-box' }}
                  />
                  {/* Botones rápidos */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    {[100, 200, 500, 1000].map(v => (
                      <button
                        key={v}
                        onClick={() => setMonto(String(Math.min(v, Number(selectedClient.deuda))))}
                        className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                      >
                        RD$ {v}
                      </button>
                    ))}
                    <button
                      onClick={() => setMonto(String(selectedClient.deuda))}
                      className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    >
                      Pago total
                    </button>
                  </div>
                </div>

                {/* Nota */}
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>Nota (opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: Pago en efectivo, transferencia..."
                    value={nota}
                    onChange={e => setNota(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem 1rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Balance tras pago */}
                {monto && Number(monto) > 0 && (
                  <div style={{ padding: '0.875rem 1rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Balance después del pago</div>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: Number(selectedClient.deuda) - Number(monto) <= 0 ? '#10b981' : '#f59e0b' }}>
                      RD$ {Math.max(0, Number(selectedClient.deuda) - Number(monto)).toLocaleString()}
                    </div>
                    {Number(selectedClient.deuda) - Number(monto) <= 0 && (
                      <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '0.25rem' }}>✅ ¡Deuda saldada al 100%!</div>
                    )}
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444', fontSize: '0.875rem', padding: '0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertCircle size={15} />
                    {error}
                  </div>
                )}

                {/* Botón registrar */}
                <button
                  onClick={handlePago}
                  disabled={loading}
                  className="btn btn-primary confirm-payment-btn"
                  style={{ width: '100%', padding: '0.875rem', marginTop: '1rem' }}
                >
                  {loading ? 'Registrando...' : 'Confirmar Pago'}
                </button>
              </div>
            )}
          </div>

          {/* Historial reciente */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Clock size={18} style={{ color: 'var(--text-muted)' }} />
              <h2 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>Historial Reciente</h2>
            </div>

            {payments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                No hay pagos registrados aún.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto' }}>
                {payments.map(p => (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.clienteNombre || `Cliente #${p.clienteId}`}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(p.fecha).toLocaleDateString('es-DO', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {p.nota ? ` · ${p.nota}` : ''}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#10b981' }}>+ RD$ {Number(p.monto).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
