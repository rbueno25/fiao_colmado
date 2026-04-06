import React, { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, Wallet, AlertTriangle, FileText, Calendar } from 'lucide-react';

interface DailyAudit {
  totalVentas: number;
  ventasContado: number;
  ventasCredito: number;
  cobrosRealizados: number;
  productosBajoStock: number;
  detalleBajoStock: { nombre: string; stock: number }[];
}

export default function Reportes() {
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<DailyAudit | null>(null);
  const [periodo, setPeriodo] = useState<'diario' | 'semanal' | 'mensual'>('diario');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reportes/auditoria-diaria?periodo=${periodo}&month=${selectedMonth}&year=${selectedYear}`);
      if (res.ok) setAudit(await res.json());
    } catch (e) {
      console.error("Error fetching audit", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [periodo, selectedMonth, selectedYear]);

  const downloadReport = () => {
    if (!audit) return;
    
    const today = new Date().toLocaleDateString('es-DO');
    const now = new Date().toLocaleTimeString();
    const content = `
==========================================
   AUDITORÍA DIARIA DE OPERACIONES
==========================================
FIAO APP - Colmado El Primo
Fecha: ${today} | Hora de Cierre: ${now}
------------------------------------------

1. RESUMEN FINANCIERO (MOVIMIENTOS)
------------------------------------------
Total de Ventas Brutas:  RD$ ${audit.totalVentas.toLocaleString().padStart(12)}
  > Ventas al Contado:   RD$ ${audit.ventasContado.toLocaleString().padStart(12)}
  > Ventas a Crédito:    RD$ ${audit.ventasCredito.toLocaleString().padStart(12)}

Recolectado por Abonos:  RD$ ${audit.cobrosRealizados.toLocaleString().padStart(12)}

2. BALANCE DE CAJA ESTIMADO
------------------------------------------
Efectivo Total (Ventas + Abonos): RD$ ${(audit.ventasContado + audit.cobrosRealizados).toLocaleString().padStart(10)}

3. ESTADO DE CRÉDITOS Y FIADOS
------------------------------------------
Nuevas Deudas Generadas: RD$ ${audit.ventasCredito.toLocaleString().padStart(12)}

4. AUDITORÍA DE INVENTARIO Y STOCK
------------------------------------------
Productos en Alerta Crítica: ${audit.productosBajoStock}
Detalle de Productos a Reponer:
${audit.detalleBajoStock.length > 0 
  ? audit.detalleBajoStock.map(p => `  [!] ${p.nombre.padEnd(25)} | Quedan: ${p.stock.toString().padStart(3)}`).join('\n')
  : "  Todos los productos cuentan con stock suficiente."}

==========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria_colmado_${today.replace(/\//g, '-')}.txt`;
    link.click();
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Generando auditoría...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p className="text-muted">Análisis periódico de la situación financiera del colmado.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Selector de Periodo */}
          <div style={{ display: 'flex', background: '#f3f4f6', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            {(['diario', 'semanal', 'mensual'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriodo(p)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  background: periodo === p ? 'white' : 'transparent',
                  color: periodo === p ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  boxShadow: periodo === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Selectores de Mes/Año (Solo si es mensual) */}
          {periodo === 'mensual' && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '0.85rem' }}
              >
                {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                style={{ padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'white', fontSize: '0.85rem' }}
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          <button 
            onClick={downloadReport}
            className="btn btn-primary"
          >
            <Download size={18} /> Descargar Auditoría
          </button>
        </div>
      </div>

      {audit && (
        <>
          {/* Top 4 Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Ventas {periodo === 'diario' ? 'de Hoy' : periodo === 'semanal' ? 'de la Semana' : 'del Mes'}
                </h3>
                <div style={{ background: 'hsl(var(--color-primary) / 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-primary))' }}>
                  <TrendingUp size={20} />
                </div>
              </div>
              <p className="text-h2">RD$ {audit.totalVentas.toLocaleString()}</p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-success)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Efectivo en Caja</h3>
                <div style={{ background: 'hsl(var(--color-success) / 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-success))' }}>
                  <Wallet size={20} />
                </div>
              </div>
              <p className="text-h2">RD$ {(audit.ventasContado + audit.cobrosRealizados).toLocaleString()}</p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-warning)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Nuevas Deudas</h3>
                <div style={{ background: 'hsl(var(--color-warning) / 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-warning))' }}>
                  <FileText size={20} />
                </div>
              </div>
              <p className="text-h2">RD$ {audit.ventasCredito.toLocaleString()}</p>
            </div>

            <div className="card" style={{ borderLeft: '4px solid var(--color-danger)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 className="text-muted" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase' }}>Alertas Stock</h3>
                <div style={{ background: 'hsl(var(--color-danger) / 0.15)', padding: '0.5rem', borderRadius: '50%', color: 'hsl(var(--color-danger))' }}>
                  <AlertTriangle size={20} />
                </div>
              </div>
              <p className="text-h2 text-danger">{audit.productosBajoStock}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
            <div className="card" style={{ flex: '2 1 500px' }}>
              <h3 className="text-h3" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart3 size={20} className="text-primary" /> Desglose Financiero
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span className="text-muted">Ventas al Contado</span>
                    <span style={{ fontWeight: 600 }}>RD$ {audit.ventasContado.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', background: '#f3f4f6', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-success)', height: '100%', width: `${audit.totalVentas > 0 ? (audit.ventasContado / audit.totalVentas) * 100 : 0}%` }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <span className="text-muted">Ventas a Crédito (Fiao)</span>
                    <span style={{ fontWeight: 600 }}>RD$ {audit.ventasCredito.toLocaleString()}</span>
                  </div>
                  <div style={{ width: '100%', background: '#f3f4f6', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: 'var(--color-warning)', height: '100%', width: `${audit.totalVentas > 0 ? (audit.ventasCredito / audit.totalVentas) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ flex: '1 1 300px' }}>
              <h3 className="text-h3 text-danger" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} /> Reposición de Inventario
              </h3>
              {audit.detalleBajoStock.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {audit.detalleBajoStock.map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{p.nombre}</span>
                      <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', background: 'var(--color-danger)', color: 'white', borderRadius: '12px', fontWeight: 600 }}>Quedan: {p.stock}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', padding: '1rem', borderRadius: '50%', display: 'inline-block', marginBottom: '1rem' }}>
                    <Calendar size={32} />
                  </div>
                  <p className="text-muted" style={{ fontStyle: 'italic', fontSize: '0.9rem' }}>Inventario en nivel óptimo.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
