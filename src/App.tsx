import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Dumbbell,
  GraduationCap,
  Leaf,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Route,
  ShoppingBag,
  Store,
  Target,
  Trash2,
  Truck,
  UserRound,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatPrice, getProduct, packs, products, type Pack, type Product, type ProductId } from './data/products';

type CartItem = {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  quantity: number;
  visual: ProductId | 'mixed';
};

type CheckoutData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  payment: string;
};

const initialCheckout: CheckoutData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  payment: 'Tarjeta simulada',
};

const strategy = [
  {
    title: 'Materia prima Medium',
    text: 'Equilibrio entre calidad y costo para mantener una propuesta accesible.',
    icon: CircleDollarSign,
  },
  {
    title: 'Mejora del producto',
    text: 'Inversion en valor percibido para fortalecer Drink2Go y HelTea.',
    icon: BadgeCheck,
  },
  {
    title: 'Recuperacion de mercado',
    text: 'Promociones, paquetes y precios competitivos para impulsar ventas.',
    icon: Target,
  },
  {
    title: 'Cobertura y compra digital',
    text: 'Canales simulados, entrega y checkout para acercar EnergyMax al cliente.',
    icon: Route,
  },
];

const channels = ['Universidades', 'Tiendas', 'Gimnasios', 'Cafeterias', 'Compra en linea', 'Entrega a domicilio'];

function readCart() {
  try {
    const stored = window.localStorage.getItem('energymax-cart');
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(readCart);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendation, setRecommendation] = useState<ProductId>('drink2go');
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkout, setCheckout] = useState<CheckoutData>(initialCheckout);
  const [order, setOrder] = useState<{ id: string; items: CartItem[]; total: number } | null>(null);

  useEffect(() => {
    window.localStorage.setItem('energymax-cart', JSON.stringify(cart));
  }, [cart]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const addItem = (item: CartItem) => {
    setCart((current) => {
      const found = current.find((entry) => entry.id === item.id);
      if (!found) return [...current, item];
      return current.map((entry) =>
        entry.id === item.id ? { ...entry, quantity: entry.quantity + item.quantity } : entry,
      );
    });
    setCartOpen(true);
  };

  const addProduct = (product: Product, quantity = 1) => {
    addItem({
      id: product.id,
      title: product.name,
      subtitle: `${product.category} · ${product.volume}`,
      price: product.price,
      quantity,
      visual: product.id,
    });
  };

  const addPack = (pack: Pack) => {
    addItem({
      id: pack.id,
      title: pack.name,
      subtitle: pack.items.map((item) => `${item.quantity} ${getProduct(item.productId).name}`).join(' + '),
      price: pack.price,
      quantity: 1,
      visual: pack.items.length > 1 ? 'mixed' : pack.items[0].productId,
    });
  };

  const updateQuantity = (id: string, change: number) => {
    setCart((current) =>
      current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + change) } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const finishOrder = () => {
    setOrder({
      id: `EMX-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart,
      total: subtotal,
    });
    setCart([]);
    setCheckoutOpen(false);
    setCheckoutStep(0);
    setCheckout(initialCheckout);
  };

  return (
    <div className="min-h-screen bg-mist text-ink">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink/90 text-white backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <a href="#inicio" className="flex items-center gap-3 font-black" onClick={() => setMenuOpen(false)}>
            <span className="grid h-11 w-11 place-items-center rounded-full bg-electric">
              <Zap size={21} aria-hidden="true" />
            </span>
            EnergyMax
          </a>
          <div className="hidden items-center gap-2 lg:flex">
            {['Empresa', 'Estrategia', 'Productos', 'Recomendador', 'Cobertura'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="rounded-full px-4 py-2 text-sm font-bold hover:bg-white/10">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 font-black text-ink"
              aria-label={`Abrir carrito con ${cartCount} articulos`}
            >
              <ShoppingBag size={18} aria-hidden="true" />
              <span className="hidden sm:inline">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1 text-xs">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="grid h-11 w-11 place-items-center rounded-full border border-white/20 lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu size={21} aria-hidden="true" />
            </button>
          </div>
        </nav>
        {menuOpen && (
          <div className="grid gap-2 border-t border-white/10 px-4 py-4 lg:hidden">
            {['Empresa', 'Estrategia', 'Productos', 'Recomendador', 'Cobertura'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl bg-white/8 px-4 py-3 font-bold"
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </header>

      <main>
        <section id="inicio" className="hero-bg relative overflow-hidden pt-28 text-white">
          <div className="mx-auto grid min-h-[760px] max-w-7xl items-center gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-black">
                Prototipo academico Energy&Co
              </span>
              <h1 className="mt-7 max-w-3xl text-5xl font-black leading-none sm:text-7xl">
                Activa tu dia con EnergyMax
              </h1>
              <p className="mt-5 text-xl font-bold text-white/78">Energia y frescura para cada momento.</p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a href="#productos" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-ink">
                  Comprar ahora <ChevronRight size={18} aria-hidden="true" />
                </a>
                <a href="#estrategia" className="inline-flex items-center justify-center rounded-full border border-white/24 px-6 py-4 font-black">
                  Ver estrategia
                </a>
              </div>
            </motion.div>
            <div className="relative min-h-[520px]">
              <div className="absolute bottom-10 left-1/2 h-24 w-[75%] -translate-x-1/2 rounded-full bg-black/30 blur-3xl" />
              <Can product={products[0]} className="absolute left-[8%] top-8 rotate-[-8deg] animate-float" size="large" />
              <Can product={products[1]} className="absolute right-[4%] top-24 rotate-[9deg] animate-float [animation-delay:1.2s]" size="large" />
            </div>
          </div>
        </section>

        <section id="empresa" className="bg-white py-20 sm:py-24">
          <Container>
            <SectionHeader eyebrow="Presentacion de la empresa" title="EnergyMax conecta energia, frescura y practicidad." />
            <div className="mt-10 grid gap-5 lg:grid-cols-4">
              {[
                ['Publico objetivo', 'Estudiantes, jovenes adultos, deportistas y personas con dias activos.'],
                ['Identidad de marca', 'Moderna, dinamica, confiable y accesible.'],
                ['Propuesta de valor', 'Dos bebidas para distintos momentos de consumo.'],
                ['Compra digital', 'Recorrido simple desde exploracion hasta confirmacion simulada.'],
              ].map(([title, text]) => (
                <article key={title} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6 shadow-sm">
                  <h3 className="text-xl font-black">{title}</h3>
                  <p className="mt-3 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="estrategia" className="bg-mist py-20 sm:py-24">
          <Container>
            <SectionHeader eyebrow="Nuestra estrategia EnergyMax" title="Decisiones del simulador convertidas en experiencia digital." />
            <div className="mt-10 grid gap-5 lg:grid-cols-4">
              {strategy.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    className="rounded-[1.5rem] bg-white p-6 shadow-soft"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white">
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <strong className="text-electric">0{index + 1}</strong>
                    </div>
                    <h3 className="mt-6 text-xl font-black">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                  </motion.article>
                );
              })}
            </div>
          </Container>
        </section>

        <section id="productos" className="bg-ink py-20 text-white sm:py-24">
          <Container>
            <SectionHeader eyebrow="Catalogo" title="Drink2Go y HelTea, dos opciones EnergyMax." light />
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {products.map((product) => (
                <article key={product.id} className="overflow-hidden rounded-[2rem] bg-white text-ink shadow-soft">
                  <div
                    className="grid min-h-80 place-items-center p-6"
                    style={{ background: `linear-gradient(135deg, ${product.colors.secondary}, ${product.colors.primary})` }}
                  >
                    <Can product={product} size="large" />
                  </div>
                  <div className="p-6 sm:p-8">
                    <p className="text-sm font-black uppercase" style={{ color: product.colors.primary }}>
                      {product.category}
                    </p>
                    <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <h3 className="text-3xl font-black">{product.name}</h3>
                        <p className="mt-2 font-bold text-slate-600">"{product.tagline}"</p>
                      </div>
                      <strong className="rounded-2xl bg-slate-100 px-4 py-3 text-2xl">{formatPrice(product.price)}</strong>
                    </div>
                    <p className="mt-5 text-slate-600">{product.description}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {product.benefits.map((benefit) => (
                        <span key={benefit} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black">
                          {benefit}
                        </span>
                      ))}
                    </div>
                    <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                      <button type="button" onClick={() => setSelectedProduct(product)} className="rounded-full border border-slate-200 px-5 py-3 font-black">
                        Ver detalles
                      </button>
                      <button type="button" onClick={() => addProduct(product)} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white">
                        <ShoppingBag size={18} aria-hidden="true" />
                        Agregar al carrito
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="mt-5 text-sm font-bold text-white/64">Informacion y precios ilustrativos para fines academicos.</p>
          </Container>
        </section>

        <section className="bg-white py-20 sm:py-24">
          <Container>
            <SectionHeader eyebrow="Paquetes promocionales" title="Promociones para impulsar recuperacion de mercado." />
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {packs.map((pack) => (
                <article key={pack.id} className={`rounded-[1.75rem] p-6 shadow-soft ${pack.recommended ? 'bg-ink text-white' : 'bg-slate-50 text-ink'}`}>
                  {pack.recommended && <span className="rounded-full bg-teal px-3 py-2 text-xs font-black text-ink">Recomendado</span>}
                  <div className="my-8 flex justify-center">
                    {pack.items.length > 1 ? <MixedCans /> : <Can product={getProduct(pack.items[0].productId)} size="small" />}
                  </div>
                  <h3 className="text-2xl font-black">{pack.name}</h3>
                  <p className={`mt-2 ${pack.recommended ? 'text-white/70' : 'text-slate-600'}`}>{pack.detail}</p>
                  <div className="mt-5 flex items-center justify-between rounded-2xl bg-white px-4 py-3 text-ink">
                    <span className="font-bold">Precio ilustrativo</span>
                    <strong>{formatPrice(pack.price)}</strong>
                  </div>
                  <button type="button" onClick={() => addPack(pack)} className={`mt-5 w-full rounded-full px-5 py-3 font-black ${pack.recommended ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
                    Agregar paquete
                  </button>
                </article>
              ))}
            </div>
          </Container>
        </section>

        <section id="recomendador" className="bg-mist py-20 sm:py-24">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <SectionHeader eyebrow="Recomendador" title="Que EnergyMax necesitas hoy?" />
                <div className="mt-8 grid gap-3">
                  {[
                    ['Necesito concentrarme', 'drink2go'],
                    ['Voy a entrenar', 'drink2go'],
                    ['Tengo una jornada larga', 'drink2go'],
                    ['Quiero algo refrescante y ligero', 'heltea'],
                  ].map(([label, id]) => (
                    <button
                      type="button"
                      key={label}
                      onClick={() => setRecommendation(id as ProductId)}
                      className={`rounded-2xl border p-4 text-left font-black ${recommendation === id ? 'border-ink bg-ink text-white' : 'border-slate-200 bg-white'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <Recommendation product={getProduct(recommendation)} onAdd={addProduct} onDetail={setSelectedProduct} />
            </div>
          </Container>
        </section>

        <section id="cobertura" className="bg-white py-20 sm:py-24">
          <Container>
            <SectionHeader eyebrow="Cobertura y distribucion" title="EnergyMax cada vez mas cerca de ti." />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {channels.map((channel, index) => (
                <article key={channel} className="flex items-center gap-4 rounded-3xl bg-mist p-5">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white">
                    {index % 3 === 0 ? <GraduationCap size={21} /> : index % 3 === 1 ? <Store size={21} /> : <Truck size={21} />}
                  </span>
                  <strong>{channel}</strong>
                </article>
              ))}
            </div>
          </Container>
        </section>
      </main>

      <Footer />

      <AnimatePresence>
        {selectedProduct && (
          <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAdd={addProduct} />
        )}
        {cartOpen && (
          <CartDrawer
            cart={cart}
            subtotal={subtotal}
            onClose={() => setCartOpen(false)}
            onInc={(id) => updateQuantity(id, 1)}
            onDec={(id) => updateQuantity(id, -1)}
            onRemove={(id) => setCart((current) => current.filter((item) => item.id !== id))}
            onCheckout={() => {
              setCartOpen(false);
              setCheckoutOpen(true);
            }}
          />
        )}
        {checkoutOpen && (
          <CheckoutModal
            checkout={checkout}
            setCheckout={setCheckout}
            step={checkoutStep}
            setStep={setCheckoutStep}
            cart={cart}
            subtotal={subtotal}
            onClose={() => setCheckoutOpen(false)}
            onConfirm={finishOrder}
          />
        )}
        {order && <Confirmation order={order} onClose={() => setOrder(null)} />}
      </AnimatePresence>
    </div>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

function SectionHeader({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`text-sm font-black uppercase ${light ? 'text-teal' : 'text-electric'}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-4xl font-black sm:text-5xl ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
    </div>
  );
}

function Can({ product, size = 'normal', className = '' }: { product: Product; size?: 'small' | 'normal' | 'large'; className?: string }) {
  return (
    <div
      className={`can ${size === 'small' ? 'small' : ''} ${className}`}
      style={{ '--primary': product.colors.primary, '--secondary': product.colors.secondary, '--accent': product.colors.accent } as React.CSSProperties}
      aria-label={`Mockup de lata ${product.name}`}
      role="img"
    >
      <div className="can-body">
        <div className="sparkles" />
        <div className="can-label">
          <span>{product.id === 'drink2go' ? 'ENERGY' : 'FRESH'}</span>
          <strong>{product.name}</strong>
          {size !== 'small' && <span>{product.volume}</span>}
        </div>
      </div>
    </div>
  );
}

function MixedCans() {
  return (
    <div className="flex items-end justify-center">
      <Can product={products[0]} size="small" />
      <div className="-ml-4 translate-y-4">
        <Can product={products[1]} size="small" />
      </div>
    </div>
  );
}

function Recommendation({ product, onAdd, onDetail }: { product: Product; onAdd: (product: Product) => void; onDetail: (product: Product) => void }) {
  return (
    <motion.article key={product.id} className="rounded-[2rem] bg-white p-6 shadow-soft" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-center">
        <div className="grid min-h-72 place-items-center rounded-[1.5rem]" style={{ backgroundColor: product.colors.soft }}>
          <Can product={product} size="large" />
        </div>
        <div>
          <span className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: product.colors.primary }}>
            Resultado
          </span>
          <h3 className="mt-5 text-4xl font-black">{product.name}</h3>
          <p className="mt-3 font-bold text-slate-600">{product.tagline}</p>
          <p className="mt-5 text-slate-600">{product.description}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => onAdd(product)} className="rounded-full bg-ink px-5 py-3 font-black text-white">
              Agregar al carrito
            </button>
            <button type="button" onClick={() => onDetail(product)} className="rounded-full border border-slate-200 px-5 py-3 font-black">
              Ver producto
            </button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ProductModal({ product, onClose, onAdd }: { product: Product; onClose: () => void; onAdd: (product: Product, quantity?: number) => void }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.article className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-soft" initial={{ scale: 0.96, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 20 }}>
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-slate-100" aria-label="Cerrar detalle">
          <X size={20} />
        </button>
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="grid min-h-[420px] place-items-center" style={{ backgroundColor: product.colors.soft }}>
            <Can product={product} size="large" />
          </div>
          <div className="p-7 sm:p-10">
            <p className="text-sm font-black uppercase" style={{ color: product.colors.primary }}>
              {product.category}
            </p>
            <h2 className="mt-3 text-5xl font-black">{product.name}</h2>
            <p className="mt-3 text-xl font-bold text-slate-700">{product.tagline}</p>
            <p className="mt-5 text-slate-600">{product.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info label="Presentacion" value={product.volume} />
              <Info label="Precio" value={formatPrice(product.price)} />
              <Info label="Momentos" value={product.moments[0]} />
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {product.moments.map((moment) => (
                <span key={moment} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black">
                  {moment}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex w-max items-center gap-2 rounded-full bg-slate-100 p-1">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-white" aria-label="Disminuir cantidad">
                  <Minus size={16} />
                </button>
                <strong className="w-8 text-center">{quantity}</strong>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-white" aria-label="Aumentar cantidad">
                  <Plus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  onAdd(product, quantity);
                  onClose();
                }}
                className="rounded-full bg-ink px-6 py-3 font-black text-white"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <span className="text-xs font-black uppercase text-slate-500">{label}</span>
      <strong className="mt-1 block">{value}</strong>
    </div>
  );
}

function CartDrawer({
  cart,
  subtotal,
  onClose,
  onInc,
  onDec,
  onRemove,
  onCheckout,
}: {
  cart: CartItem[];
  subtotal: number;
  onClose: () => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
}) {
  return (
    <motion.aside className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white shadow-soft" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} aria-label="Carrito">
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <p className="text-xs font-black uppercase text-electric">Compra simulada</p>
          <h2 className="text-3xl font-black">Tu carrito</h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-slate-100" aria-label="Cerrar carrito">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        {cart.length === 0 ? (
          <div className="grid min-h-80 place-items-center rounded-3xl bg-mist p-8 text-center">
            <div>
              <MixedCans />
              <h3 className="mt-5 text-xl font-black">Tu carrito esta listo</h3>
              <p className="mt-2 text-slate-600">Agrega Drink2Go, HelTea o un paquete EnergyMax.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {cart.map((item) => (
              <article key={item.id} className="grid grid-cols-[70px_1fr] gap-3 rounded-2xl border border-slate-200 p-3">
                <div className="grid place-items-center rounded-2xl bg-mist">
                  {item.visual === 'mixed' ? <MixedCans /> : <Can product={getProduct(item.visual)} size="small" />}
                </div>
                <div>
                  <div className="flex justify-between gap-2">
                    <div>
                      <h3 className="font-black">{item.title}</h3>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                    <button type="button" onClick={() => onRemove(item.id)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-red-50" aria-label={`Eliminar ${item.title}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <strong>{formatPrice(item.price)}</strong>
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                      <button type="button" onClick={() => onDec(item.id)} className="grid h-8 w-8 place-items-center rounded-full bg-white" aria-label={`Disminuir ${item.title}`}>
                        <Minus size={14} />
                      </button>
                      <strong className="w-6 text-center">{item.quantity}</strong>
                      <button type="button" onClick={() => onInc(item.id)} className="grid h-8 w-8 place-items-center rounded-full bg-white" aria-label={`Aumentar ${item.title}`}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-slate-200 bg-slate-50 p-5">
        <p className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-600">Envio y pago simulados. No se procesa ningun pago real.</p>
        <div className="mt-4 flex justify-between text-xl font-black">
          <span>Total</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <button type="button" onClick={onCheckout} disabled={cart.length === 0} className="mt-5 w-full rounded-full bg-ink px-5 py-4 font-black text-white disabled:bg-slate-300">
          Continuar compra
        </button>
      </div>
    </motion.aside>
  );
}

function CheckoutModal({
  checkout,
  setCheckout,
  step,
  setStep,
  cart,
  subtotal,
  onClose,
  onConfirm,
}: {
  checkout: CheckoutData;
  setCheckout: React.Dispatch<React.SetStateAction<CheckoutData>>;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  cart: CartItem[];
  subtotal: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const canContinue =
    step === 0
      ? checkout.name.trim() && checkout.email.includes('@') && checkout.phone.trim().length >= 7
      : checkout.address.trim() && checkout.city.trim() && checkout.zip.trim().length >= 4;
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink/70 p-4 backdrop-blur-md" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <article className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-black uppercase text-electric">Proceso simulado con fines academicos</p>
            <h2 className="text-3xl font-black">Checkout EnergyMax</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-slate-100" aria-label="Cerrar checkout">
            <X size={20} />
          </button>
        </div>
        <div className="grid max-h-[70vh] overflow-y-auto lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-5 sm:p-8">
            <div className="mb-7 grid grid-cols-3 gap-2">
              {['Datos', 'Entrega', 'Resumen'].map((label, index) => (
                <div key={label} className={`rounded-2xl px-3 py-3 text-center text-sm font-black ${index <= step ? 'bg-ink text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {label}
                </div>
              ))}
            </div>
            {step === 0 && (
              <div className="grid gap-4">
                <Field label="Nombre" value={checkout.name} onChange={(value) => setCheckout((data) => ({ ...data, name: value }))} />
                <Field label="Correo" value={checkout.email} onChange={(value) => setCheckout((data) => ({ ...data, email: value }))} type="email" />
                <Field label="Telefono" value={checkout.phone} onChange={(value) => setCheckout((data) => ({ ...data, phone: value }))} />
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4">
                <Field label="Direccion" value={checkout.address} onChange={(value) => setCheckout((data) => ({ ...data, address: value }))} />
                <Field label="Ciudad" value={checkout.city} onChange={(value) => setCheckout((data) => ({ ...data, city: value }))} />
                <Field label="Codigo postal" value={checkout.zip} onChange={(value) => setCheckout((data) => ({ ...data, zip: value }))} />
                <label className="grid gap-2 text-sm font-black">
                  Metodo de pago simulado
                  <select
                    value={checkout.payment}
                    onChange={(event) => setCheckout((data) => ({ ...data, payment: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <option>Tarjeta simulada</option>
                    <option>Pago en punto de venta simulado</option>
                    <option>Transferencia simulada</option>
                  </select>
                </label>
              </div>
            )}
            {step === 2 && (
              <div className="rounded-3xl bg-mist p-5">
                <CheckCircle2 className="text-electric" size={34} />
                <h3 className="mt-3 text-2xl font-black">Revision del pedido</h3>
                <p className="mt-2 text-slate-600">Confirma para cerrar la simulacion academica.</p>
                <div className="mt-5 grid gap-2">
                  <Info label="Cliente" value={checkout.name} />
                  <Info label="Entrega" value={checkout.city} />
                  <Info label="Pago" value={checkout.payment} />
                </div>
              </div>
            )}
          </div>
          <aside className="bg-slate-50 p-5 sm:p-8">
            <h3 className="text-xl font-black">Resumen</h3>
            <div className="mt-4 grid gap-3">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-white p-3">
                  <span>
                    <strong>{item.title}</strong> x {item.quantity}
                  </span>
                  <strong>{formatPrice(item.price * item.quantity)}</strong>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-between rounded-2xl bg-ink px-4 py-3 text-white">
              <strong>Total</strong>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
          </aside>
        </div>
        <div className="flex justify-between gap-3 border-t border-slate-200 p-5">
          <button type="button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="rounded-full bg-slate-100 px-5 py-3 font-black disabled:opacity-40">
            Anterior
          </button>
          {step < 2 ? (
            <button type="button" onClick={() => canContinue && setStep(step + 1)} disabled={!canContinue} className="rounded-full bg-ink px-6 py-3 font-black text-white disabled:bg-slate-300">
              Siguiente
            </button>
          ) : (
            <button type="button" onClick={onConfirm} className="rounded-full bg-electric px-6 py-3 font-black text-white">
              Confirmar compra
            </button>
          )}
        </div>
      </article>
    </motion.div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" />
    </label>
  );
}

function Confirmation({ order, onClose }: { order: { id: string; items: CartItem[]; total: number }; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink p-4 text-white" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <article className="w-full max-w-2xl rounded-[2rem] border border-white/12 bg-white/10 p-8 text-center backdrop-blur-xl">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal text-ink">
          <CheckCircle2 size={42} />
        </span>
        <h2 className="mt-6 text-4xl font-black">Tu pedido EnergyMax ha sido confirmado</h2>
        <p className="mt-3 text-white/72">Pedido ficticio: {order.id}</p>
        <div className="mt-6 rounded-3xl bg-white p-4 text-left text-ink">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <span>{item.title} x {item.quantity}</span>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="mt-3 flex justify-between rounded-2xl bg-ink px-4 py-3 text-white">
            <strong>Total</strong>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </div>
        <button type="button" onClick={onClose} className="mt-6 rounded-full bg-white px-6 py-3 font-black text-ink">
          Volver al inicio
        </button>
      </article>
    </motion.div>
  );
}

function Footer() {
  return (
    <footer className="bg-white py-10">
      <Container>
        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-8 text-sm text-slate-600 sm:flex-row">
          <strong className="text-ink">EnergyMax</strong>
          <span>Prototipo academico. No procesa pagos reales.</span>
        </div>
      </Container>
    </footer>
  );
}

export default App;
