import { useState, useEffect } from 'react';
import { Search, ShoppingCart, User, Plus, Minus, X, Check, AlertCircle, Tag, RefreshCw, Package } from 'lucide-react';

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
  limiteCredito?: number;
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
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API}/api/productos`);
      if (!resp.ok) throw new Error('Error fetching products');
      const prodData = await resp.json();
      
      const clientResp = await fetch(`${API}/api/clientes`);
      if (!clientResp.ok) throw new Error('Error fetching clients');
      const clientData = await clientResp.json();

      console.log('API Products:', prodData);
      
      const formattedProds = Array.isArray(prodData) ? prodData.map((p: any) => ({
        ...p,
        precio: Number(p.precio),
        stock: Number(p.stock)
      })) : [];
      
      setProducts(formattedProds);
      setClients(Array.isArray(clientData) ? clientData : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('No se pudieron cargar los datos. Verifica la conexión con el servidor.');
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
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cantidad >= product.stock) return prev;
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
        if (newQty <= 0) return item; // don't go below 1
        if (newQty > item.stock) return item; // respect stock
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const isBlocked = tipoPago === 'credito' && selectedClient &&
    selectedClient.limiteCredito !== undefined &&
    Number(selectedClient.deuda) >= Number(selectedClient.limiteCredito);

  const canSubmit = cart.length > 0 &&
    !submitting &&
    (tipoPago === 'contado' || (tipoPago === 'credito' && selectedClient && !isBlocked));

  const handleVenta = async () => {
    if (!canSubmit) {
      if (tipoPago === 'credito' && !selectedClient) {
        setError('Debes seleccionar un cliente para ventas a crédito.');
      }
      return;
    }
    setSubmitting(true);
    setError('');
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
        setCart([]);
        setSelectedClient(null);
        setTipoPago('contado');
        await fetchData();
        setTimeout(() => setSuccess(false), 4000);
      } else {
        const err = await res.json();
        setError(err.message || 'Error al registrar la venta.');
      }
    } catch {
      setError('Error de conexión con el servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 2rem)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <h1 className="text-h2">Punto de Venta</h1>
          <p className="text-muted">Registra ventas al contado o a crédito (fiao).</p>
        </div>
        <button onClick={fetchData} className="btn btn-secondary">
          <RefreshCw size={15} /> Actualizar
        </button>
      </div>

      {/* Success Banner */}
      {success && (
        <div style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.875rem 1.25rem', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
          <Check size={18} /> ¡Venta registrada exitosamente! El stock ha sido actualizado.
        </div>
      )}

      {/* Main POS layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.25rem', flex: 1, minHeight: 0 }}>

        {/* LEFT: Product catalog */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', minHeight: 0 }}>
          {/* Search + Category Filter */}
          <div className="card" style={{ padding: '1rem', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.25rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.9rem', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '0.4rem 0.875rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', border: '1px solid',
                      borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                      background: selectedCategory === cat ? 'var(--primary)' : 'var(--bg-secondary)',
                      color: selectedCategory === cat ? 'white' : 'var(--text-muted)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Product grid */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <RefreshCw size={32} style={{ opacity: 0.3, marginBottom: '0.75rem', animation: 'spin 1s linear infinite' }} />
                <p>Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <Package size={40} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
                <p>No se encontraron productos.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Agrega productos desde la base de datos.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.875rem', paddingRight: '0.25rem' }}>
                {filteredProducts.map(product => {
                  const inCart = cart.find(c => c.id === product.id);
                  const outOfStock = product.stock <= 0;
                  return (
                    <div
                      key={product.id}
                      onClick={() => !outOfStock && addToCart(product)}
                      className="card"
                      style={{
                        cursor: outOfStock ? 'not-allowed' : 'pointer',
                        opacity: outOfStock ? 0.5 : 1,
                        border: inCart ? '2px solid var(--primary)' : '1px solid var(--border)',
                        transition: 'all 0.15s ease',
                        padding: '1rem',
                        position: 'relative',
                        userSelect: 'none',
                      }}
                    >
                      {inCart && (
                        <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'var(--primary)', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700 }}>
                          {inCart.cantidad}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', background: 'var(--bg-base)', borderRadius: '20px', color: 'var(--text-muted)', fontWeight: 600 }}>
                          <Tag size={10} style={{ marginRight: '0.2rem', verticalAlign: 'middle' }} />
                          {product.categoria || 'General'}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: product.stock < 10 ? '#ef4444' : '#10b981' }}>
                          {product.stock} uds
                        </span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.3, marginBottom: '0.75rem' }}>{product.nombre}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>RD$ {product.precio.toLocaleString()}</span>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={14} color="white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Cart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
            <div style={{ marginBottom: '1rem', flexShrink: 0 }}>
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1rem', marginBottom: '0.875rem' }}>
                <ShoppingCart size={18} style={{ color: 'var(--primary)' }} />
                Detalle de Venta
                {cart.length > 0 && (
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', background: 'var(--primary)', color: 'white', borderRadius: '20px', padding: '0.1rem 0.6rem', fontWeight: 700 }}>
                    {cart.reduce((a, i) => a + i.cantidad, 0)} items
                  </span>
                )}
              </h2>

              {/* Client selector - always visible */}
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} />
                <select
                  value={selectedClient?.id || ''}
                  onChange={e => {
                    const client = clients.find(c => c.id === Number(e.target.value)) || null;
                    setSelectedClient(client);
                  }}
                  style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.25rem', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-secondary)', color: 'var(--text-main)', fontSize: '0.875rem', boxSizing: 'border-box', appearance: 'none' }}
                >
                  <option value="">👤 Cliente al contado (sin nombre)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}{Number(c.deuda) > 0 ? ` · Deuda: RD$ ${Number(c.deuda).toLocaleString()}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              {selectedClient && (
                <div style={{ marginTop: '0.4rem', padding: '0.4rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', fontSize: '0.78rem', display: 'flex', justifyContent: 'space-between', border: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Deuda actual de {selectedClient.nombre}:</span>
                  <span style={{ fontWeight: 700, color: Number(selectedClient.deuda) > 0 ? '#ef4444' : '#10b981' }}>RD$ {Number(selectedClient.deuda).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Cart items */}
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                  <ShoppingCart size={36} style={{ opacity: 0.2, marginBottom: '0.5rem' }} />
                  <p style={{ fontSize: '0.875rem' }}>Selecciona productos del catálogo</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {cart.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>RD$ {item.precio.toLocaleString()} c/u</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                        <button onClick={() => updateQuantity(item.id, -1)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Minus size={11} />
                        </button>
                        <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 700, fontSize: '0.9rem' }}>{item.cantidad}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} style={{ width: '22px', height: '22px', borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--bg-base)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Plus size={11} />
                        </button>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--primary)', minWidth: '70px', textAlign: 'right' }}>
                        RD$ {(item.precio * item.cantidad).toLocaleString()}
                      </div>
                      <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: 0.6, padding: '0.1rem', flexShrink: 0 }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Checkout section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.875rem', flexShrink: 0 }}>
              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>RD$ {total.toLocaleString()}</span>
              </div>

              {/* Tipo de pago */}
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>Tipo de Pago</label>
                <div style={{ display: 'flex', padding: '0.2rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '10px', gap: '0.2rem' }}>
                  <button
                    onClick={() => setTipoPago('contado')}
                    style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s ease', background: tipoPago === 'contado' ? 'white' : 'transparent', color: tipoPago === 'contado' ? 'var(--primary)' : 'var(--text-muted)', boxShadow: tipoPago === 'contado' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none' }}
                  >
                    💵 Contado
                  </button>
                  <button
                    onClick={() => setTipoPago('credito')}
                    style={{ flex: 1, padding: '0.55rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', border: 'none', transition: 'all 0.15s ease', background: tipoPago === 'credito' ? 'var(--primary)' : 'transparent', color: tipoPago === 'credito' ? 'white' : 'var(--text-muted)', boxShadow: tipoPago === 'credito' ? '0 2px 8px rgba(0,0,0,0.15)' : 'none' }}
                  >
                    📋 Fiao
                  </button>
                </div>
              </div>

              {/* Blocked warning only shown for Fiao + blocked client */}

              {/* Blocked warning */}
              {isBlocked && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.625rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem' }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                  Este cliente ha alcanzado su límite de crédito. No se pueden registrar ventas a crédito.
                </div>
              )}

              {/* Error */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 0.75rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem' }}>
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => { setCart([]); setError(''); }}
                  disabled={cart.length === 0}
                  className="btn btn-secondary"
                  style={{ opacity: cart.length === 0 ? 0.5 : 1, padding: '0.875rem 1.25rem' }}
                >
                  Limpiar
                </button>
                <button
                  onClick={handleVenta}
                  disabled={!canSubmit}
                  className="btn btn-primary"
                  style={{ flex: 1, opacity: canSubmit ? 1 : 0.5, padding: '0.875rem' }}
                >
                  <Check size={18} />
                  {submitting ? 'Registrando...' : 'Registrar Venta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
