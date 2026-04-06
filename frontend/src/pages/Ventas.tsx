import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Plus, Minus, X, Check, AlertCircle, Tag, RefreshCw, Package } from 'lucide-react';
import Notification from '../components/Notification';
import type { NotificationType } from '../components/Notification';

interface Product {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  categoria?: string;
}

interface CartItem extends Product {
  cantidad: number;
}

interface Client {
  id: number;
  nombre: string;
  telefono: string;
  deuda: number;
  limite: number;
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function Ventas() {
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [tipoPago, setTipoPago] = useState<'contado' | 'credito'>('contado');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: NotificationType } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/api/productos`);
      if (!resp.ok) throw new Error('Error fetching products');
      const prodData = await resp.json();
      
      const clientResp = await fetch(`${API}/api/clientes`);
      if (!clientResp.ok) throw new Error('Error fetching clients');
      const clientData = await clientResp.json();

      const salesResp = await fetch(`${API}/api/ventas`);
      const salesData = await salesResp.json();
      setRecentSales(Array.isArray(salesData) ? salesData.slice(0, 10) : []);
      
      const formattedProds = Array.isArray(prodData) ? prodData.map((p: any) => ({
        ...p,
        precio: Number(p.precio),
        stock: Number(p.stock)
      })) : [];
      
      setProducts(formattedProds);
      setClients(Array.isArray(clientData) ? clientData : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setNotification({ message: 'No se pudieron cargar los datos de productos y clientes.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const categories = ['Todos', ...Array.from(new Set(products.map(p => p.categoria || 'General')))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'Todos' || (p.categoria || 'General') === selectedCategory;
    return matchSearch && matchCat;
  });

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      setNotification({ message: `No hay stock disponible para ${product.nombre}.`, type: 'warning' });
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cantidad >= product.stock) {
          setNotification({ message: 'Has alcanzado el límite de stock para este producto.', type: 'warning' });
          return prev;
        }
        return prev.map(item =>
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.cantidad + delta;
        if (newQty <= 0) return item; 
        if (newQty > item.stock) {
          setNotification({ message: `Solo hay ${item.stock} unidades disponibles.`, type: 'warning' });
          return item;
        }
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const isBlocked = tipoPago === 'credito' && selectedClient &&
    selectedClient.limite !== undefined &&
    Number(selectedClient.deuda) + total > Number(selectedClient.limite);

  const canSubmit = !submitting && cart.length > 0;

  const handleVenta = async () => {
    if (cart.length === 0) {
      setNotification({ message: 'El carrito está vacío.', type: 'warning' });
      return;
    }

    if (!selectedClient) {
      setNotification({ message: '¡Atención! Selecciona un cliente para continuar.', type: 'error' });
      return;
    }

    if (tipoPago === 'credito' && isBlocked) {
      const remainingLimit = Number(selectedClient.limite) - Number(selectedClient.deuda);
      setNotification({ 
        message: `Límite de crédito excedido. El cliente solo tiene RD$ ${remainingLimit} disponible y la compra es de RD$ ${total}.`, 
        type: 'error' 
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        clienteId: selectedClient?.id || null,
        tipo: tipoPago,
        montoTotal: total,
        items: cart.map(item => ({
          id: item.id,
          cantidad: item.cantidad,
          subtotal: item.precio * item.cantidad,
        }))
      };

      const res = await fetch(`${API}/api/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccess(true);
        setNotification({ message: 'Venta registrada con éxito.', type: 'success' });
        setCart([]);
        setSelectedClient(null);
        setTipoPago('contado');
        await fetchData();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const err = await res.json();
        setNotification({ message: err.message || 'Error al registrar la venta.', type: 'error' });
      }
    } catch {
      setNotification({ message: 'Error de conexión con el servidor.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 className="text-h2">Punto de Venta</h1>
          <p className="text-muted">Gestión de ventas y crédito.</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}

      {success && (
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.875rem', borderRadius: '10px' }}>
          <Check size={18} /> ¡Venta exitosa!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem' }}>
        
        {/* LEFT: Catalog + History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="input"
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      style={{
                        padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid var(--border)',
                        background: selectedCategory === cat ? 'var(--primary)' : 'white',
                        color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
            </div>
          </div>

          <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem' }}>
              {filteredProducts.map(product => (
                <div key={product.id} className="card" onClick={() => addToCart(product)} style={{ cursor: 'pointer', padding: '1rem', border: cart.find(c => c.id === product.id) ? '2px solid var(--primary)' : '1px solid var(--border)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>{product.categoria}</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: product.stock < 10 ? 'red' : 'green' }}>{product.stock} uds</span>
                   </div>
                   <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{product.nombre}</div>
                   <div style={{ marginTop: '0.5rem', fontWeight: 800, color: 'var(--primary)' }}>RD$ {product.precio}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Historial Reciente */}
          <div className="card" style={{ padding: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem' }}>Ventas Recientes</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Monto</th>
                  <th style={{ textAlign: 'right' }}>Hora</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map(sale => (
                  <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)', background: sale.tipo === 'credito' ? 'rgba(59, 130, 246, 0.03)' : 'transparent' }}>
                    <td style={{ padding: '0.6rem 0.2rem' }}>{sale.cliente?.nombre || 'Al Contado'}</td>
                    <td>
                      <span className={`badge ${sale.tipo === 'contado' ? 'badge-primary' : 'badge-secondary'}`} style={{ fontSize: '0.6rem' }}>
                        {sale.tipo === 'contado' ? '💵 Efectivo' : '📋 Fiao'}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>RD$ {Number(sale.montoTotal).toLocaleString()}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>{new Date(sale.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: Cart + Client */}
        <div style={{ position: 'sticky', top: '1rem', height: 'fit-content' }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} className="text-primary" /> Carrito
            </h2>

            <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
              <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--primary)' }} />
              <select
                className="input"
                value={selectedClient?.id || ''}
                onChange={e => setSelectedClient(clients.find(c => c.id === Number(e.target.value)) || null)}
                style={{ paddingLeft: '2.25rem', border: '2px solid var(--primary)', fontWeight: 600, background: 'hsl(var(--color-primary-light) / 0.1)' }}
              >
                <option value="">👤 SELECCIONAR CLIENTE</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id} style={{ color: Number(c.deuda) > 0 ? 'red' : 'green' }}>
                    {c.nombre} {Number(c.deuda) > 0 ? `(Debe: RD$ ${c.deuda})` : '(Limpio)'}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem', background: 'white', border: '1px solid var(--border)', borderRadius: '10px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{item.nombre}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RD$ {item.precio} c/u</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, -1); }} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Minus size={12} />
                    </button>
                    <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem' }}>{item.cantidad}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQuantity(item.id, 1); }} style={{ width: '24px', height: '24px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Plus size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); removeFromCart(item.id); }} style={{ marginLeft: '0.2rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <X size={12} />
                    </button>
                  </div>
                </div>
              ))}
              {cart.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed var(--border)', borderRadius: '12px', background: 'var(--bg-base)', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={32} style={{ opacity: 0.1, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.85rem' }}>Carrito de compras vacío</p>
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span className="text-muted">Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>RD$ {total.toLocaleString()}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button onClick={() => setTipoPago('contado')} className={`btn ${tipoPago === 'contado' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>💵 Contado</button>
                <button onClick={() => setTipoPago('credito')} className={`btn ${tipoPago === 'credito' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1 }}>📋 Fiao</button>
              </div>

              <button onClick={handleVenta} className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem', opacity: submitting ? 0.7 : 1 }}>
                {submitting ? '...' : 'CONFIRMAR VENTA'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
