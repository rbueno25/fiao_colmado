import { Users, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-h1">Dashboard</h1>
          <p className="text-muted">Resumen financiero y de clientes hoy.</p>
        </div>
        <div>
          <Link to="/ventas" className="btn btn-primary">+ Nueva Venta (Fiao)</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Deuda Total</h3>
            <div style={{ background: 'hsl(var(--color-primary-light))', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-primary))' }}>
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-h2">RD$ 45,200</p>
          <p className="text-success" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>+RD$ 2,000 esta semana</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Clientes Activos</h3>
            <div style={{ background: 'hsl(var(--color-bg-base))', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-text-main))' }}>
              <Users size={20} />
            </div>
          </div>
          <p className="text-h2">124</p>
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>4 nuevos clientes este mes</p>
        </div>

        <div className="card" style={{ borderColor: 'hsl(var(--color-danger) / 0.3)' }}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-danger" style={{ fontSize: '0.875rem', fontWeight: 500 }}>En Riesgo (Límite Superado)</h3>
            <div style={{ background: 'hsl(var(--color-danger) / 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-danger))' }}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <p className="text-h2 text-danger">8</p>
          <p className="text-danger" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Requieren atención inmediata</p>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 500 }}>Pagos Recibidos (Hoy)</h3>
            <div style={{ background: 'hsl(var(--color-success) / 0.1)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-success))' }}>
              <CheckCircle size={20} />
            </div>
          </div>
          <p className="text-h2">RD$ 5,500</p>
          <p className="text-success" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>Ayer: RD$ 3,200</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card md:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-h3">Últimas Transacciones</h2>
            <Link to="/reportes" className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>Ver todas</Link>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid hsl(var(--border-color))', color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                  <th style={{ padding: '1rem 0' }}>Cliente</th>
                  <th style={{ padding: '1rem 0' }}>Tipo</th>
                  <th style={{ padding: '1rem 0' }}>Monto</th>
                  <th style={{ padding: '1rem 0' }}>Fecha/Hora</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                  <td style={{ padding: '1rem 0' }}><span className="font-500">Juan Pérez</span></td>
                  <td style={{ padding: '1rem 0' }}><span className="badge badge-warning">Fiado (Venta)</span></td>
                  <td style={{ padding: '1rem 0' }}>RD$ 450</td>
                  <td style={{ padding: '1rem 0', color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>Hace 10 min</td>
                </tr>
                <tr style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                  <td style={{ padding: '1rem 0' }}><span className="font-500">María Gómez</span></td>
                  <td style={{ padding: '1rem 0' }}><span className="badge badge-success">Abono (Pago)</span></td>
                  <td style={{ padding: '1rem 0' }}>RD$ 1,500</td>
                  <td style={{ padding: '1rem 0', color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>Hace 1 hora</td>
                </tr>
                <tr style={{ borderBottom: '1px solid hsl(var(--border-color))' }}>
                  <td style={{ padding: '1rem 0' }}><span className="font-500">Colmado Pedro</span></td>
                  <td style={{ padding: '1rem 0' }}><span className="badge badge-warning">Fiado (Venta)</span></td>
                  <td style={{ padding: '1rem 0' }}>RD$ 230</td>
                  <td style={{ padding: '1rem 0', color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>Hace 3 horas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h2 className="text-h3 mb-6">Asistente Fiao</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--color-primary-light))', color: 'hsl(var(--color-primary-dark))', fontSize: '0.875rem' }}>
              <p>💡 <b>Tip del día:</b> Tienes 3 clientes que suelen pagar los viernes. ¡Recuérdales su deuda mañana!</p>
            </div>
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', background: 'hsl(var(--color-danger) / 0.1)', color: 'hsl(var(--color-danger))', fontSize: '0.875rem' }}>
              <p>⚠️ <b>Alerta:</b> Luis Martínez ha excedido su límite de crédito por RD$ 500. Se recomienda no fiar más hasta que abone.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
