import { useState } from 'react';
import { Search, ShoppingCart, User, Plus, Minus, X, Check, AlertCircle } from 'lucide-react';

interface Product {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  category: string;
}

interface CartItem extends Product {
  cantidad: number;
}

const mockProducts: Product[] = [
  { id: '1', nombre: 'Arroz Premium (lb)', precio: 45, stock: 50, category: 'Granos' },
  { id: '2', nombre: 'Aceite de Girasol (lt)', precio: 180, stock: 20, category: 'Aceites' },
  { id: '3', nombre: 'Leche Entera (lt)', precio: 75, stock: 35, category: 'Lácteos' },
  { id: '4', nombre: 'Habichuelas Rojas (lb)', precio: 60, stock: 30, category: 'Granos' },
  { id: '5', nombre: 'Salami Induveca (lb)', precio: 125, stock: 15, category: 'Embutidos' },
  { id: '6', nombre: 'Café Molido (oz)', precio: 25, stock: 100, category: 'Café' },
];

export default function Ventas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isCredit, setIsCredit] = useState(true);

  const filteredProducts = mockProducts.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...product, cantidad: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.cantidad + delta);
        return { ...item, cantidad: newQty };
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-h1">Ventas</h1>
          <p className="text-muted">Procesa ventas al contado o "fiao" a tus clientes.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card" style={{ padding: '1rem' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={20} />
              <input 
                type="text" 
                placeholder="Buscar productos por nombre o categoría..." 
                className="input"
                style={{ paddingLeft: '2.75rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="card hover:border-primary cursor-pointer transition-all" onClick={() => addToCart(product)}>
                <div className="flex justify-between items-start mb-2">
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'hsl(var(--color-bg-base))', borderRadius: '1rem', color: 'hsl(var(--color-text-muted))' }}>
                    {product.category}
                  </span>
                  <span className={product.stock < 10 ? 'text-danger font-600' : 'text-success'} style={{ fontSize: '0.75rem' }}>
                    S: {product.stock}
                  </span>
                </div>
                <h3 className="font-600" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{product.nombre}</h3>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-h3" style={{ color: 'hsl(var(--color-primary))' }}>RD$ {product.precio}</span>
                  <button className="btn btn-secondary" style={{ padding: '0.4rem', minWidth: 'auto', borderRadius: '50%' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart and Sale Info */}
        <div className="space-y-6">
          <div className="card sticky top-6 shadow-lg border-primary/20">
            <h2 className="text-h3 mb-6 flex items-center gap-2">
              <ShoppingCart size={20} className="text-primary" />
              Detalle de Venta
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-12 text-muted">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-20" />
                <p>El carrito está vacío</p>
                <p style={{ fontSize: '0.875rem' }}>Selecciona productos de la izquierda</p>
              </div>
            ) : (
              <div className="space-y-4 mb-8 max-h-[400px] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div style={{ flex: 1 }}>
                      <p className="font-500" style={{ fontSize: '0.925rem' }}>{item.nombre}</p>
                      <p className="text-muted" style={{ fontSize: '0.75rem' }}>RD$ {item.precio} x {item.cantidad}</p>
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => updateQuantity(item.id, -1)} className="btn btn-secondary" style={{ padding: '0.25rem', minWidth: 'auto' }}><Minus size={14} /></button>
                       <span style={{ minWidth: '1.5rem', textAlign: 'center', fontWeight: 600 }}>{item.cantidad}</span>
                       <button onClick={() => updateQuantity(item.id, 1)} className="btn btn-secondary" style={{ padding: '0.25rem', minWidth: 'auto' }}><Plus size={14} /></button>
                       <button onClick={() => removeFromCart(item.id)} className="ml-2 text-danger opacity-40 group-hover:opacity-100 transition-opacity"><X size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 border-t space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-muted">Total a Pagar</span>
                <span className="text-h2 text-primary">RD$ {total.toLocaleString()}</span>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-500">Seleccionar Cliente</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                  <select 
                    className="input w-full" 
                    style={{ paddingLeft: '2.5rem' }}
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                  >
                    <option value="">-- Cliente de Contado --</option>
                    <option value="1">Juan Pérez (Deuda: RD$ 450, Lim: 5,000)</option>
                    <option value="2">María Gómez (Deuda: RD$ 1,500, Lim: 2,000)</option>
                    <option value="3">Luis Martínez (BLOQUEADO - Límite Excedido)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-muted/20 p-3 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-xs font-600 text-muted uppercase">Método de Venta</p>
                  <p className="text-sm font-500">{isCredit ? 'Venta a Crédito (Fiao)' : 'Venta de Contado'}</p>
                </div>
                <button 
                  onClick={() => setIsCredit(!isCredit)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isCredit ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCredit ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {selectedClient === '3' && (
                <div className="flex items-start gap-2 p-3 bg-danger/10 text-danger text-xs rounded-lg animate-shake">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <p>Este cliente ha superado su límite de crédito. El sistema no permite ventas adicionales a crédito.</p>
                </div>
              )}

              <button 
                className="btn btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                disabled={cart.length === 0 || (isCredit && !selectedClient) || (isCredit && selectedClient === '3')}
              >
                <Check size={20} />
                Registrar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
