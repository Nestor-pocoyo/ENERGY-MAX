import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  GraduationCap,
  Leaf,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Route,
  ShoppingBag,
  Sparkles,
  Store,
  Target,
  Trash2,
  Truck,
  UserRound,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react';
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

const navItems = [
  ['Empresa', '#empresa'],
  ['Estrategia', '#estrategia'],
  ['Productos', '#productos'],
  ['Recomendador', '#recomendador'],
  ['Cobertura', '#cobertura'],
];

const strategy: Array<{ title: string; text: string; metric: string; icon: LucideIcon }> = [
  {
    title: 'Materia prima Medium',
    text: 'Equilibrio entre calidad y costo para sostener precios competitivos.',
    metric: 'balance',
    icon: CircleDollarSign,
  },
  {
    title: 'Mejora del producto',
    text: 'Inversión en percepción, empaque y experiencia para aumentar preferencia.',
    metric: '+valor',
    icon: BadgeCheck,
  },
  {
    title: 'Recuperación de mercado',
    text: 'Promociones, paquetes y compra digital para acelerar la recompra.',
    metric: 'share',
    icon: Target,
  },
  {
    title: 'Cobertura y compra digital',
    text: 'Más puntos de venta, entrega simulada y checkout rápido.',
    metric: 'online',
    icon: Route,
  },
];

const channels: Array<{ title: string; detail: string; icon: LucideIcon }> = [
  { title: 'Universidades', detail: 'Consumo rápido entre clases.', icon: GraduationCap },
  { title: 'Gimnasios', detail: 'Energía antes y después de entrenar.', icon: Zap },
  { title: 'Tiendas', detail: 'Disponibilidad cotidiana.', icon: Store },
  { title: 'Cafeterías', detail: 'Pausas frescas con HelTea.', icon: Leaf },
  { title: 'Compra en línea', detail: 'Carrito y checkout simulado.', icon: ShoppingBag },
  { title: 'Entrega local', detail: 'Cobertura práctica para pedidos.', icon: Truck },
];

const recommendationOptions: Array<{ label: string; detail: string; productId: ProductId; icon: LucideIcon }> = [
  { label: 'Necesito concentrarme', detail: 'Estudio, entregas y jornadas largas.', productId: 'drink2go', icon: Target },
  { label: 'Voy a entrenar', detail: 'Ritmo físico y energía inmediata.', productId: 'drink2go', icon: Zap },
  { label: 'Quiero algo fresco', detail: 'Pausa ligera sin sentirme pesado.', productId: 'heltea', icon: Leaf },
  { label: 'Voy de salida', detail: 'Compra rápida para llevar.', productId: 'heltea', icon: ShoppingBag },
];

function readCart() {
  if (typeof window === 'undefined') return [];
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
  const [recommendation, setRecommendation] = useState(0);
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
      subtitle: `${product.category} - ${product.volume}`,
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
      <Header cartCount={cartCount} menuOpen={menuOpen} setMenuOpen={setMenuOpen} onCart={() => setCartOpen(true)} />

      <main>
        <Hero onAdd={addProduct} />
        <CompanySection />
        <StrategySection />
        <ProductsSection onAdd={addProduct} onDetail={setSelectedProduct} />
        <PacksSection onAdd={addPack} />
        <RecommenderSection
          recommendation={recommendation}
          setRecommendation={setRecommendation}
          onAdd={addProduct}
          onDetail={setSelectedProduct}
        />
        <CoverageSection />
        <FinalCta onAdd={addProduct} onPack={() => addPack(packs.find((pack) => pack.id === 'pack-energymax')!)} />
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

function Header({
  cartCount,
  menuOpen,
  setMenuOpen,
  onCart,
}: {
  cartCount: number;
  menuOpen: boolean;
  setMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onCart: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink/88 text-white backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3 font-black" onClick={() => setMenuOpen(false)}>
          <img src="/energymax-icon.svg" alt="" className="h-11 w-11 rounded-2xl shadow-glow" />
          <span className="tracking-wide">EnergyMax</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map(([item, href]) => (
            <a key={item} href={href} className="rounded-full px-4 py-2 text-sm font-bold text-white/82 hover:bg-white/10 hover:text-white">
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCart}
            className="relative inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 font-black text-ink shadow-lg shadow-black/10"
            aria-label={`Abrir carrito con ${cartCount} artículos`}
          >
            <ShoppingBag size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-teal px-1 text-xs text-ink">
                {cartCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu size={21} aria-hidden="true" />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="grid gap-2 border-t border-white/10 px-4 py-4 lg:hidden">
          {navItems.map(([item, href]) => (
            <a
              key={item}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="rounded-2xl bg-white/8 px-4 py-3 font-bold text-white/88"
            >
              {item}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}

function Hero({ onAdd }: { onAdd: (product: Product) => void }) {
  return (
    <section id="inicio" className="hero-premium relative overflow-hidden pt-24 text-white">
      <Container>
        <div className="grid min-h-[760px] items-center gap-8 py-12 lg:grid-cols-[0.82fr_1.18fr] lg:py-16">
          <motion.div initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-black text-white/90 backdrop-blur-xl">
              <Sparkles size={16} aria-hidden="true" />
              Línea premium EnergyMax
            </span>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.95] sm:text-7xl">
              Activa tu día con EnergyMax
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-bold text-white/76 sm:text-2xl">
              Energía y frescura para cada momento.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#productos" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-ink shadow-xl shadow-black/20">
                Comprar ahora <ChevronRight size={18} aria-hidden="true" />
              </a>
              <a href="#productos" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/24 bg-white/8 px-6 py-4 font-black backdrop-blur-xl">
                Descubrir productos <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ['2', 'bebidas'],
                ['Medium', 'materia prima'],
                ['digital', 'compra'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/12 bg-white/8 p-4 backdrop-blur-xl">
                  <strong className="block text-2xl">{value}</strong>
                  <span className="text-xs font-bold uppercase text-white/58">{label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="hero-stage hero-stage-ad"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.7 }}
          >
            <div className="hero-ad-frame">
              <img
                src="/energymax-hero.png"
                alt="Anuncio principal de EnergyMax con Drink2Go y HelTea"
                className="hero-ad-image"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="hero-card hero-card-left">
              <strong>Más vendido</strong>
              <span>{formatPrice(products[0].price)}</span>
            </div>
            <div className="hero-card hero-card-right">
              <strong>Opción ligera</strong>
              <span>{formatPrice(products[1].price)}</span>
            </div>
            <div className="hero-strip">
              <button type="button" onClick={() => onAdd(products[0])} className="rounded-full bg-white px-5 py-3 font-black text-ink">
                Comprar Drink2Go
              </button>
              <button type="button" onClick={() => onAdd(products[1])} className="rounded-full bg-teal px-5 py-3 font-black text-ink">
                Comprar HelTea
              </button>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function CompanySection() {
  return (
    <section id="empresa" className="bg-white py-20 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <div>
            <SectionHeader eyebrow="Presentación de la empresa" title="Una marca de bebidas pensada para comprar rápido y verse real." />
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <VisualPoint icon={UserRound} title="Público objetivo" text="Estudiantes, jóvenes adultos, deportistas y personas con días activos." />
              <VisualPoint icon={Sparkles} title="Identidad de marca" text="Visual moderna, energética, fresca y comercial." />
              <VisualPoint icon={ShoppingBag} title="Compra digital" text="Catálogo, recomendador, carrito y checkout simulado." />
              <VisualPoint icon={PackageCheck} title="Oferta clara" text="Drink2Go, HelTea y paquetes promocionales." />
            </div>
          </div>
          <div className="brand-showcase">
            <img src="/energymax-icon.svg" alt="EnergyMax" className="brand-showcase-logo" />
            <DuoVisual />
            <div className="brand-showcase-copy">
              <span>EnergyMax</span>
              <strong>Dos momentos de consumo, una misma familia visual.</strong>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function StrategySection() {
  return (
    <section id="estrategia" className="strategy-bg py-20 text-white sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-center">
          <div>
            <SectionHeader eyebrow="Nuestra estrategia EnergyMax" title="Decisiones del simulador convertidas en una propuesta vendible." light />
            <p className="mt-5 max-w-xl text-lg font-semibold text-white/68">
              Menos teoría en pantalla y más evidencia visual: precio, producto, cobertura y compra digital trabajando juntos.
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/12 bg-white/8 p-5 backdrop-blur-xl">
              <div className="grid grid-cols-[110px_1fr] items-center gap-5">
                <DuoVisual compact />
                <div>
                  <p className="text-sm font-black uppercase text-teal">Simulador</p>
                  <h3 className="mt-1 text-2xl font-black">Recuperar mercado sin perder margen.</h3>
                  <p className="mt-2 text-sm text-white/62">Medium + mejora de producto + promociones + cobertura digital.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {strategy.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.article
                  key={item.title}
                  className="strategy-card"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-ink">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <strong className="rounded-full bg-teal/18 px-3 py-1 text-xs uppercase text-teal">{item.metric}</strong>
                  </div>
                  <h3 className="mt-6 text-2xl font-black">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/66">{item.text}</p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProductsSection({
  onAdd,
  onDetail,
}: {
  onAdd: (product: Product) => void;
  onDetail: (product: Product) => void;
}) {
  return (
    <section id="productos" className="bg-white py-20 sm:py-24">
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader eyebrow="Catálogo" title="Drink2Go y HelTea listos para convertir visitas en compras." />
          <p className="max-w-md text-sm font-bold text-slate-500">
            Precios ilustrativos y experiencia de compra simulada para un prototipo universitario premium.
          </p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} onDetail={onDetail} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProductCard({
  product,
  onAdd,
  onDetail,
}: {
  product: Product;
  onAdd: (product: Product) => void;
  onDetail: (product: Product) => void;
}) {
  return (
    <motion.article
      className="product-card group"
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      style={{ '--product-primary': product.colors.primary, '--product-soft': product.colors.soft } as CSSProperties}
    >
      <div className="product-card-visual">
        <div className="product-card-badge">{product.badge}</div>
        <ProductVisual product={product} className="product-card-image" />
      </div>
      <div className="p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-black uppercase" style={{ color: product.colors.primary }}>
              {product.category}
            </p>
            <h3 className="mt-2 text-4xl font-black">{product.name}</h3>
            <p className="mt-2 text-lg font-bold text-slate-600">{product.tagline}</p>
          </div>
          <strong className="w-max rounded-2xl bg-slate-100 px-4 py-3 text-2xl">{formatPrice(product.price)}</strong>
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
          <button type="button" onClick={() => onDetail(product)} className="rounded-full border border-slate-200 px-5 py-3 font-black hover:border-ink">
            Ver detalles
          </button>
          <button type="button" onClick={() => onAdd(product)} className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white hover:bg-electric">
            <ShoppingBag size={18} aria-hidden="true" />
            Agregar al carrito
          </button>
        </div>
      </div>
    </motion.article>
  );
}

function PacksSection({ onAdd }: { onAdd: (pack: Pack) => void }) {
  return (
    <section className="bg-mist py-20 sm:py-24">
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader eyebrow="Paquetes promocionales" title="Promos con apariencia de campaña real." />
          <div className="rounded-full bg-white px-5 py-3 text-sm font-black text-electric shadow-sm">
            Precios ilustrativos
          </div>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} onAdd={onAdd} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function PackCard({ pack, onAdd }: { pack: Pack; onAdd: (pack: Pack) => void }) {
  const featured = pack.recommended;
  return (
    <motion.article
      className={`pack-card ${featured ? 'pack-card-featured' : ''}`}
      whileHover={{ y: -7 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-full px-3 py-2 text-xs font-black ${featured ? 'bg-teal text-ink' : 'bg-white text-electric'}`}>
          {featured ? 'Recomendado' : 'Promoción'}
        </span>
        <strong className={featured ? 'text-teal' : 'text-electric'}>{formatPrice(pack.price)}</strong>
      </div>
      <div className="my-7 grid min-h-[210px] place-items-center">
        <PackVisual pack={pack} />
      </div>
      <h3 className="text-3xl font-black">{pack.name}</h3>
      <p className={`mt-3 min-h-[52px] ${featured ? 'text-white/68' : 'text-slate-600'}`}>{pack.detail}</p>
      <button type="button" onClick={() => onAdd(pack)} className={`mt-6 w-full rounded-full px-5 py-4 font-black ${featured ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
        Agregar paquete
      </button>
    </motion.article>
  );
}

function RecommenderSection({
  recommendation,
  setRecommendation,
  onAdd,
  onDetail,
}: {
  recommendation: number;
  setRecommendation: (index: number) => void;
  onAdd: (product: Product) => void;
  onDetail: (product: Product) => void;
}) {
  const selectedOption = recommendationOptions[recommendation] ?? recommendationOptions[0];
  const product = getProduct(selectedOption.productId);
  return (
    <section id="recomendador" className="bg-white py-20 sm:py-24">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div>
            <SectionHeader eyebrow="Recomendador" title="Elige tu momento y EnergyMax responde." />
            <div className="mt-8 grid gap-3">
              {recommendationOptions.map((option, index) => {
                const Icon = option.icon;
                const active = recommendation === index;
                return (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => setRecommendation(index)}
                    className={`recommendation-option ${active ? 'recommendation-option-active' : ''}`}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-ink">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <span>
                      <strong>{option.label}</strong>
                      <small>{option.detail}</small>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <motion.article
            key={product.id}
            className="recommendation-card"
            style={{ '--product-primary': product.colors.primary, '--product-secondary': product.colors.secondary, '--product-soft': product.colors.soft } as CSSProperties}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="recommendation-visual">
              <AnimatePresence mode="wait">
                <ProductVisual key={product.id} product={product} className="recommendation-image" />
              </AnimatePresence>
            </div>
            <div className="recommendation-copy">
              <span className="rounded-full bg-white/18 px-4 py-2 text-sm font-black text-white">Recomendación</span>
              <h3 className="mt-5 text-5xl font-black text-white">{product.name}</h3>
              <p className="mt-3 text-xl font-bold text-white/78">{product.tagline}</p>
              <p className="mt-5 text-white/66">{product.description}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => onAdd(product)} className="rounded-full bg-white px-5 py-3 font-black text-ink">
                  Agregar al carrito
                </button>
                <button type="button" onClick={() => onDetail(product)} className="rounded-full border border-white/20 px-5 py-3 font-black text-white">
                  Ver producto
                </button>
              </div>
            </div>
          </motion.article>
        </div>
      </Container>
    </section>
  );
}

function CoverageSection() {
  return (
    <section id="cobertura" className="bg-ink py-20 text-white sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <SectionHeader eyebrow="Cobertura y distribución" title="EnergyMax cerca del cliente y listo para compra digital." light />
            <p className="mt-5 text-white/66">La cobertura mejora con puntos físicos, entrega local y un flujo de compra simulado que reduce fricción.</p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-black text-ink">
              <MapPin size={18} />
              Cobertura en crecimiento
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {channels.map((channel) => {
              const Icon = channel.icon;
              return (
                <article key={channel.title} className="coverage-card">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal text-ink">
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-black">{channel.title}</h3>
                  <p className="mt-2 text-sm text-white/62">{channel.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}

function FinalCta({ onAdd, onPack }: { onAdd: (product: Product) => void; onPack: () => void }) {
  return (
    <section className="final-cta overflow-hidden py-20 text-white sm:py-24">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-black uppercase text-teal">Compra simulada</p>
            <h2 className="mt-3 max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
              Dos bebidas. Dos momentos. Una misma energía.
            </h2>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button type="button" onClick={() => onAdd(products[0])} className="rounded-full bg-white px-6 py-4 font-black text-ink">
                Comprar Drink2Go
              </button>
              <button type="button" onClick={() => onAdd(products[1])} className="rounded-full bg-teal px-6 py-4 font-black text-ink">
                Comprar HelTea
              </button>
              <button type="button" onClick={onPack} className="rounded-full border border-white/22 px-6 py-4 font-black text-white">
                Probar Pack EnergyMax
              </button>
            </div>
          </div>
          <div className="final-cta-visual">
            <DuoVisual />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProductModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product, quantity?: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/72 p-4 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.article
        className="relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white shadow-soft"
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 20 }}
      >
        <button type="button" onClick={onClose} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full bg-white/88 shadow-sm" aria-label="Cerrar detalle">
          <X size={20} />
        </button>
        <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
          <div className="product-modal-visual" style={{ '--product-primary': product.colors.primary, '--product-secondary': product.colors.secondary } as CSSProperties}>
            <ProductVisual product={product} />
          </div>
          <div className="p-7 sm:p-10">
            <span className="rounded-full px-4 py-2 text-sm font-black text-white" style={{ backgroundColor: product.colors.primary }}>
              {product.badge}
            </span>
            <h2 className="mt-5 text-5xl font-black">{product.name}</h2>
            <p className="mt-3 text-xl font-bold text-slate-700">{product.tagline}</p>
            <p className="mt-5 text-slate-600">{product.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info label="Presentación" value={product.volume} />
              <Info label="Precio" value={formatPrice(product.price)} />
              <Info label="Momento" value={product.moments[0]} />
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {product.moments.map((moment) => (
                <span key={moment} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black">
                  {moment}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <QuantityControl value={quantity} setValue={setQuantity} />
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
          <div className="grid min-h-80 place-items-center overflow-hidden rounded-3xl bg-mist p-8 text-center">
            <div>
              <DuoVisual compact />
              <h3 className="mt-5 text-xl font-black">Tu carrito está listo</h3>
              <p className="mt-2 text-slate-600">Agrega Drink2Go, HelTea o un paquete EnergyMax.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {cart.map((item) => (
              <article key={item.id} className="grid grid-cols-[78px_1fr] gap-3 rounded-2xl border border-slate-200 p-3">
                <div className="grid min-h-[90px] place-items-center overflow-hidden rounded-2xl bg-mist">
                  <CartVisual visual={item.visual} />
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
        <p className="rounded-2xl bg-white p-3 text-sm font-bold text-slate-600">Envío y pago simulados. No se procesa ningún pago real.</p>
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
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink/72 p-4 backdrop-blur-md" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <article className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-black uppercase text-electric">Proceso simulado</p>
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
                <Field label="Teléfono" value={checkout.phone} onChange={(value) => setCheckout((data) => ({ ...data, phone: value }))} />
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4">
                <Field label="Dirección" value={checkout.address} onChange={(value) => setCheckout((data) => ({ ...data, address: value }))} />
                <Field label="Ciudad" value={checkout.city} onChange={(value) => setCheckout((data) => ({ ...data, city: value }))} />
                <Field label="Código postal" value={checkout.zip} onChange={(value) => setCheckout((data) => ({ ...data, zip: value }))} />
                <label className="grid gap-2 text-sm font-black">
                  Método de pago simulado
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
                <CreditCard className="text-electric" size={34} />
                <h3 className="mt-3 text-2xl font-black">Revisión del pedido</h3>
                <p className="mt-2 text-slate-600">Confirma para cerrar la simulación académica.</p>
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
                <div key={item.id} className="grid grid-cols-[54px_1fr_auto] items-center gap-3 rounded-2xl bg-white p-3">
                  <div className="grid h-14 place-items-center overflow-hidden rounded-xl bg-mist">
                    <CartVisual visual={item.visual} small />
                  </div>
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

function Confirmation({ order, onClose }: { order: { id: string; items: CartItem[]; total: number }; onClose: () => void }) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink p-4 text-white" role="dialog" aria-modal="true" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <article className="confirmation-card">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal text-ink">
          <CheckCircle2 size={42} />
        </span>
        <h2 className="mt-6 text-4xl font-black">Tu pedido EnergyMax ha sido confirmado</h2>
        <p className="mt-3 text-white/72">Pedido ficticio: {order.id}</p>
        <div className="my-6">
          <DuoVisual compact />
        </div>
        <div className="rounded-3xl bg-white p-4 text-left text-ink">
          {order.items.map((item) => (
            <div key={item.id} className="mb-2 flex justify-between rounded-2xl bg-slate-50 px-4 py-3 last:mb-0">
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

function ProductVisual({ product, className = '' }: { product: Product; className?: string }) {
  return (
    <motion.img
      src={product.image}
      alt={product.imageAlt}
      className={`product-render ${className}`}
      loading="lazy"
      decoding="async"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
    />
  );
}

function DuoVisual({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`duo-visual ${compact ? 'duo-visual-compact' : ''}`} aria-label="Drink2Go y HelTea" role="img">
      <img src={products[0].image} alt="" className="duo-product duo-product-left" loading="lazy" decoding="async" />
      <img src={products[1].image} alt="" className="duo-product duo-product-right" loading="lazy" decoding="async" />
    </div>
  );
}

function PackVisual({ pack }: { pack: Pack }) {
  if (pack.items.length > 1) return <DuoVisual compact />;
  return <ProductVisual product={getProduct(pack.items[0].productId)} className="pack-single-image" />;
}

function CartVisual({ visual, small = false }: { visual: ProductId | 'mixed'; small?: boolean }) {
  if (visual === 'mixed') return <DuoVisual compact />;
  const product = getProduct(visual);
  return <img src={product.image} alt="" className={small ? 'cart-image-small' : 'cart-image'} loading="lazy" decoding="async" />;
}

function VisualPoint({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-ink text-white">
        <Icon size={20} aria-hidden="true" />
      </span>
      <h3 className="mt-5 text-xl font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

function QuantityControl({ value, setValue }: { value: number; setValue: (value: number) => void }) {
  return (
    <div className="flex w-max items-center gap-2 rounded-full bg-slate-100 p-1">
      <button type="button" onClick={() => setValue(Math.max(1, value - 1))} className="grid h-10 w-10 place-items-center rounded-full bg-white" aria-label="Disminuir cantidad">
        <Minus size={16} />
      </button>
      <strong className="w-8 text-center">{value}</strong>
      <button type="button" onClick={() => setValue(value + 1)} className="grid h-10 w-10 place-items-center rounded-full bg-white" aria-label="Aumentar cantidad">
        <Plus size={16} />
      </button>
    </div>
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

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return (
    <label className="grid gap-2 text-sm font-black">
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" />
    </label>
  );
}

function SectionHeader({ eyebrow, title, light = false }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      <p className={`text-sm font-black uppercase ${light ? 'text-teal' : 'text-electric'}`}>{eyebrow}</p>
      <h2 className={`mt-3 text-4xl font-black leading-tight sm:text-5xl ${light ? 'text-white' : 'text-ink'}`}>{title}</h2>
    </div>
  );
}

function Container({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">{children}</div>;
}

function Footer() {
  return (
    <footer className="bg-white py-10">
      <Container>
        <div className="flex flex-col justify-between gap-3 border-t border-slate-200 pt-8 text-sm text-slate-600 sm:flex-row">
          <strong className="text-ink">EnergyMax</strong>
          <span>Prototipo académico. No procesa pagos reales.</span>
        </div>
      </Container>
    </footer>
  );
}

export default App;
