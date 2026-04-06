import { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, CheckCircle, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [data, setData] = useState({
    deudaTotal: 0,
    clientesActivos: 0,
    enRiesgo: 0,
    pagosRecibidos: 0
  });
  const [transacciones, setTransacciones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [clientesRes, ventasRes, reporteRes] = await Promise.all([
          fetch(`${API}/api/clientes`),
          fetch(`${API}/api/ventas`),
          fetch(`${API}/api/reportes/auditoria-diaria`)
        ]);

        const clientes = await clientesRes.json();
        const ventas = await ventasRes.json();
        const reporte = await reporteRes.json();

        const deudaTotal = clientes.reduce((acc: number, c: any) => acc + Number(c.deuda), 0);
        const enRiesgo = clientes.filter((c: any) => Number(c.deuda) >= Number(c.limite)).length;

        setData({
          deudaTotal,
          clientesActivos: clientes.filter((c: any) => c.estado === 'activo').length,
          enRiesgo,
          pagosRecibidos: reporte.cobrosRealizados || 0
        });

        const recentVentas = ventas.slice(0, 8).map((v: any) => ({
          id: v.id,
          cliente: v.cliente?.nombre || 'Cliente General',
          tipo: v.tipo === 'credito' ? 'Fiado' : 'Contado',
          monto: v.montoTotal,
          fecha: new Date(v.fecha)
        }));

        setTransacciones(recentVentas);
      } catch (error) {
        console.error("Error al cargar dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando resumen...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p className="text-muted">Resumen operativo y financiero para hoy.</p>
        </div>
        <Link to="/ventas" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShoppingBag size={18} /> Nueva Venta
        </Link>
      </div>

      {/* Grid de Tarjetas Superiores */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Deuda Total</h3>
            <div style={{ background: 'hsl(var(--color-primary) / 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-primary))' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-h2">RD$ {data.deudaTotal.toLocaleString()}</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-text-main)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Clientes Activos</h3>
            <div style={{ background: 'hsl(var(--color-text-main) / 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-text-main))' }}>
              <Users size={20} />
            </div>
          </div>
          <p className="text-h2">{data.clientesActivos}</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Límite Superado</h3>
            <div style={{ background: 'hsl(var(--color-danger) / 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-danger))' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-h2 text-danger">{data.enRiesgo}</p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Abonos Hoy</h3>
            <div style={{ background: 'hsl(var(--color-success) / 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-success))' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-h2">RD$ {data.pagosRecibidos.toLocaleString()}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Historial de Transacciones */}
        <div className="card" style={{ flex: '2 1 600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 className="text-h3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={20} className="text-primary" /> Últimas Transacciones
            </h3>
            <Link to="/reportes" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Ver Auditoría</Link>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            {transacciones.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f3f4f6', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: '0.75rem 0' }}>Cliente</th>
                    <th style={{ padding: '0.75rem 0' }}>Tipo</th>
                    <th style={{ padding: '0.75rem 0' }}>Monto</th>
                    <th style={{ padding: '0.75rem 0' }}>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {transacciones.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '1px solid #f9fafb' }}>
                      <td style={{ padding: '0.75rem 0', fontWeight: 500 }}>{t.cliente}</td>
                      <td style={{ padding: '0.75rem 0' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          padding: '0.15rem 0.5rem', 
                          borderRadius: '12px', 
                          background: t.tipo === 'Fiado' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                          color: t.tipo === 'Fiado' ? '#d97706' : '#059669', 
                          fontWeight: 700,
                          textTransform: 'uppercase'
                        }}>
                          {t.tipo}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 0', fontWeight: 600 }}>RD$ {Number(t.monto).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                        {t.fecha.toLocaleTimeString('es-DO', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>No hay ventas registradas aún.</p>
            )}
          </div>
        </div>

        {/* Asistente y Tips */}
        <div className="card" style={{ flex: '1 1 300px' }}>
          <h3 className="text-h3" style={{ marginBottom: '1.5rem' }}>Asistente Fiao</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'hsl(var(--color-primary) / 0.08)', border: '1px solid hsl(var(--color-primary) / 0.1)' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-primary-dark)', margin: 0 }}>
                💡 <b>Tip:</b> Revisa los productos bajo stock en el módulo de reportes para reponer inventario a tiempo.
              </p>
            </div>
            {data.enRiesgo > 0 ? (
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                <p style={{ fontSize: '0.9rem', color: '#dc2626', margin: 0 }}>
                  ⚠️ <b>Alerta:</b> Tienes {data.enRiesgo} clientes que han superado su límite de confianza.
                </p>
              </div>
            ) : (
              <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                <p style={{ fontSize: '0.9rem', color: '#059669', margin: 0 }}>
                  ✅ <b>Saludable:</b> Todos tus clientes se mantienen dentro de sus límites de crédito.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
