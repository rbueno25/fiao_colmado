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

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/reportes/auditoria-diaria`);
        if (res.ok) setAudit(await res.json());
      } catch (e) {
        console.error("Error fetching audit", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

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
(Asegúrese de que los clientes han firmado sus vales correspondientes)

4. AUDITORÍA DE INVENTARIO Y STOCK
------------------------------------------
Productos en AlertaCrítica: ${audit.productosBajoStock}
Detalle de Productos a Reponer:
${audit.detalleBajoStock.length > 0 
  ? audit.detalleBajoStock.map(p => `  [!] ${p.nombre.padEnd(25)} | Quedan: ${p.stock.toString().padStart(3)}`).join('\n')
  : "  Todos los productos cuentan con stock suficiente."}

------------------------------------------
REPORTE GENERADO AUTOMÁTICAMENTE POR FIAO APP
PARA USO EXCLUSIVO ADMINISTRATIVO
==========================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `auditoria_colmado_${today.replace(/\//g, '-')}.txt`;
    link.click();
  };

  if (loading) return <div className="p-8 text-center text-muted">Generando auditoría...</div>;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-h1">Reportes y Auditoría</h1>
          <p className="text-muted">Análisis diario de la situación financiera del colmado.</p>
        </div>
        <button 
          onClick={downloadReport}
          className="btn btn-primary flex items-center gap-2"
          style={{ padding: '0.75rem 1.5rem' }}
        >
          <Download size={18} />
          Descargar Auditoría
        </button>
      </div>

      {audit && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card shadow-sm border-l-4 border-l-primary">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-primary/10 p-2 rounded-lg text-primary">
                  <TrendingUp size={24} />
                </div>
                <span className="text-xs font-600 text-success bg-success/10 px-2 py-0.5 rounded">HOY</span>
              </div>
              <h3 className="text-muted text-xs uppercase font-600 mb-1">Ventas Totales</h3>
              <p className="text-h2">RD$ {audit.totalVentas.toLocaleString()}</p>
            </div>

            <div className="card shadow-sm border-l-4 border-l-success">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-success/10 p-2 rounded-lg text-success">
                  <Wallet size={24} />
                </div>
              </div>
              <h3 className="text-muted text-xs uppercase font-600 mb-1">Efectivo en Caja</h3>
              <p className="text-h2">RD$ {(audit.ventasContado + audit.cobrosRealizados).toLocaleString()}</p>
            </div>

            <div className="card shadow-sm border-l-4 border-l-warning">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-warning/10 p-2 rounded-lg text-warning">
                  <FileText size={24} />
                </div>
              </div>
              <h3 className="text-muted text-xs uppercase font-600 mb-1">Nuevas Deudas</h3>
              <p className="text-h2">RD$ {audit.ventasCredito.toLocaleString()}</p>
            </div>

            <div className="card shadow-sm border-l-4 border-l-danger">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-danger/10 p-2 rounded-lg text-danger">
                  <AlertTriangle size={24} />
                </div>
              </div>
              <h3 className="text-muted text-xs uppercase font-600 mb-1">Alertas Stock</h3>
              <p className="text-h2">{audit.productosBajoStock}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="card">
                <h3 className="text-h3 mb-6 flex items-center gap-2">
                  <BarChart3 size={20} className="text-primary" />
                  Desglose Financiero
                </h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted">Ventas al Contado</span>
                      <span className="font-600">RD$ {audit.ventasContado.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-success h-full transition-all" 
                        style={{ width: `${audit.totalVentas > 0 ? (audit.ventasContado / audit.totalVentas) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted">Ventas a Crédito (Fiao)</span>
                      <span className="font-600">RD$ {audit.ventasCredito.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted/20 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-warning h-full transition-all" 
                        style={{ width: `${audit.totalVentas > 0 ? (audit.ventasCredito / audit.totalVentas) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista Previa de Auditoría */}
              <div className="card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-h3 flex items-center gap-2">
                    <FileText size={20} className="text-primary" />
                    Vista Previa de la Auditoría
                  </h3>
                  <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded font-600 uppercase">Documento Interno</span>
                </div>
                <div 
                  className="bg-[#1e1e1e] text-[#d4d4d4] p-6 rounded-lg font-mono text-sm overflow-auto shadow-inner border border-white/5"
                  style={{ maxHeight: '400px', width: '100%' }}
                >
                  <pre style={{ margin: 0, whiteSpace: 'pre' }}>
{`AUDITORÍA DIARIA - FIAO APP
Fecha: ${new Date().toLocaleDateString('es-DO')}
----------------------------------

RESUMEN DE OPERACIONES:
Total Ventas:      RD$ ${audit.totalVentas.toLocaleString().padStart(10)}
  - Al Contado:    RD$ ${audit.ventasContado.toLocaleString().padStart(10)}
  - A Crédito:     RD$ ${audit.ventasCredito.toLocaleString().padStart(10)}

COBROS Y ABONOS:
Total Recolectado: RD$ ${audit.cobrosRealizados.toLocaleString().padStart(10)}

ALERTAS DE INVENTARIO:
Productos con Bajo Stock: ${audit.productosBajoStock}
${audit.detalleBajoStock.length > 0 
  ? audit.detalleBajoStock.map(p => `- ${p.nombre.padEnd(20)}: ${p.stock} unidades`).join('\n')
  : 'Todo el inventario está en niveles óptimos.'}

----------------------------------
ESTADO FINANCIERO DEL DÍA:
Caja Estimada:     RD$ ${(audit.ventasContado + audit.cobrosRealizados).toLocaleString().padStart(10)}
Nuevas Deudas:     RD$ ${audit.ventasCredito.toLocaleString().padStart(10)}

----------------------------------
CIERRE GENERADO POR FIAO APP AT: ${new Date().toLocaleTimeString()}
`}
                  </pre>
                </div>
                <p className="mt-4 text-xs text-muted flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Esta es una vista en vivo. Los datos se actualizan conforme se registran ventas.
                </p>
              </div>
            </div>

            <div className="card h-fit sticky top-6">
              <h3 className="text-h3 mb-6 flex items-center gap-2 text-danger">
                <AlertTriangle size={20} />
                Reposición de Inventario
              </h3>
              {audit.detalleBajoStock.length > 0 ? (
                <div className="space-y-4">
                  {audit.detalleBajoStock.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-2 rounded bg-danger/5 border border-danger/10">
                      <span className="text-sm font-500">{p.nombre}</span>
                      <span className="text-xs px-2 py-1 bg-danger text-white rounded-full">Quedan: {p.stock}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="bg-success/10 text-success p-3 rounded-full w-fit mx-auto mb-4">
                    <Calendar size={32} />
                  </div>
                  <p className="text-muted text-sm italic">Inventario óptimo.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
