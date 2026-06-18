import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Dumbbell,
  GraduationCap,
  Laptop,
  Leaf,
  MapPin,
  Menu,
  MessageCircle,
  Minus,
  PackageCheck,
  Percent,
  Plus,
  Route,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Target,
  Trash2,
  Truck,
  UserRound,
  Users,
  X,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
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
  delivery: string;
  payment: string;
};

type Order = {
  id: string;
  items: CartItem[];
  total: number;
  delivery: string;
  payment: string;
  city: string;
};

const CART_STORAGE_KEY = 'energymax-cart';
const MAX_CART_QUANTITY = 20;

const initialCheckout: CheckoutData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  zip: '',
  delivery: 'Entrega simulada a domicilio',
  payment: 'Tarjeta simulada',
};

const navItems = [
  { label: 'Empresa', href: '#empresa', id: 'empresa' },
  { label: 'Estrategia', href: '#estrategia', id: 'estrategia' },
  { label: 'Productos', href: '#productos', id: 'productos' },
  { label: 'Momentos', href: '#momentos', id: 'momentos' },
  { label: 'Recomendador', href: '#recomendador', id: 'recomendador' },
  { label: 'Cobertura', href: '#cobertura', id: 'cobertura' },
];

const heroBenefits: Array<{ title: string; icon: LucideIcon }> = [
  { title: 'Calidad accesible', icon: ShieldCheck },
  { title: 'Dos opciones para distintos momentos', icon: BadgeCheck },
  { title: 'Compra rápida', icon: ShoppingBag },
  { title: 'Cobertura en crecimiento', icon: Route },
];

const companyCards: Array<{ title: string; text: string; icon: LucideIcon }> = [
  {
    title: 'Público objetivo',
    text: 'Estudiantes, jóvenes adultos, deportistas y personas con días activos.',
    icon: Users,
  },
  {
    title: 'Identidad de marca',
    text: 'Energía, frescura y presencia visual moderna para compra cotidiana.',
    icon: Sparkles,
  },
  {
    title: 'Propuesta de valor',
    text: 'Dos bebidas accesibles para diferentes ritmos y momentos del día.',
    icon: Target,
  },
  {
    title: 'Compra digital',
    text: 'Catálogo, recomendador, carrito y checkout simulado en un mismo flujo.',
    icon: ShoppingBag,
  },
];

const strategy: Array<{ title: string; text: string; detail: string; metric: string; icon: LucideIcon }> = [
  {
    title: 'Calidad inteligente',
    text: 'Materia prima Medium para equilibrar calidad, costos y precio.',
    detail: 'La decisión evita extremos: mantiene una percepción confiable sin elevar demasiado el precio final.',
    metric: '01',
    icon: CircleDollarSign,
  },
  {
    title: 'Productos más competitivos',
    text: 'Inversión para fortalecer la percepción de Drink2Go y HelTea.',
    detail: 'La mejora del producto se traduce en más valor visible para el consumidor y mejor presentación comercial.',
    metric: '02',
    icon: BadgeCheck,
  },
  {
    title: 'Recuperación de mercado',
    text: 'Promociones, mayor visibilidad y paquetes para impulsar las ventas.',
    detail: 'Los paquetes y mensajes de campaña ayudan a recuperar interés sin depender solo de bajar precios.',
    metric: '03',
    icon: Percent,
  },
  {
    title: 'Más cerca del cliente',
    text: 'Cobertura física y digital para facilitar la compra.',
    detail: 'El prototipo conecta disponibilidad, carrito y compra simulada para representar una ruta de crecimiento.',
    metric: '04',
    icon: Route,
  },
];

const strategyFlow = ['Calidad', 'Valor percibido', 'Promoción', 'Cobertura', 'Compra'];

const channels: Array<{ title: string; detail: string; icon: LucideIcon }> = [
  { title: 'Universidades', detail: 'Consumo rápido entre clases.', icon: GraduationCap },
  { title: 'Tiendas', detail: 'Disponibilidad cotidiana.', icon: Store },
  { title: 'Gimnasios', detail: 'Energía antes y después de entrenar.', icon: Zap },
  { title: 'Cafeterías', detail: 'Pausas frescas con HelTea.', icon: Leaf },
  { title: 'Compra en línea', detail: 'Carrito y checkout simulado.', icon: ShoppingBag },
  { title: 'Entrega a domicilio', detail: 'Cobertura práctica para pedidos.', icon: Truck },
];

const recommendationOptions: Array<{
  label: string;
  detail: string;
  result: string;
  productId: ProductId;
  icon: LucideIcon;
}> = [
  {
    label: 'Necesito concentrarme',
    detail: 'Enfoque para estudio, tareas y entregas.',
    result: 'Drink2Go acompaña sesiones de concentración con una personalidad intensa y directa.',
    productId: 'drink2go',
    icon: Target,
  },
  {
    label: 'Voy a entrenar',
    detail: 'Impulso para moverte con más decisión.',
    result: 'Drink2Go es la recomendación para momentos activos y rutinas con más movimiento.',
    productId: 'drink2go',
    icon: Dumbbell,
  },
  {
    label: 'Tengo una jornada larga',
    detail: 'Energía práctica para sostener el día.',
    result: 'Drink2Go funciona como la opción directa para días con muchas actividades.',
    productId: 'drink2go',
    icon: Clock3,
  },
  {
    label: 'Quiero algo fresco y ligero',
    detail: 'Frescura para una pausa más suave.',
    result: 'HelTea es la alternativa ligera para refrescarte sin salir del ritmo.',
    productId: 'heltea',
    icon: Leaf,
  },
];

const momentCards: Array<{
  title: string;
  message: string;
  productId: ProductId;
  icon: LucideIcon;
  sceneIcons: LucideIcon[];
}> = [
  {
    title: 'Estudio',
    message: 'Mantén el enfoque',
    productId: 'drink2go',
    icon: BookOpen,
    sceneIcons: [Laptop, BookOpen, Target],
  },
  {
    title: 'Entrenamiento',
    message: 'Sigue tu ritmo',
    productId: 'drink2go',
    icon: Dumbbell,
    sceneIcons: [Dumbbell, Zap, Clock3],
  },
  {
    title: 'Día ligero',
    message: 'Frescura para continuar',
    productId: 'heltea',
    icon: Leaf,
    sceneIcons: [Leaf, MapPin, Sparkles],
  },
];

const comparisonRows = [
  { label: 'Perfil', drink2go: 'Energético', heltea: 'Refrescante' },
  { label: 'Momento', drink2go: 'Estudio y entrenamiento', heltea: 'Día ligero' },
  { label: 'Sensación', drink2go: 'Intensidad y movimiento', heltea: 'Frescura y ligereza' },
  { label: 'Precio ilustrativo', drink2go: '$35 MXN', heltea: '$32 MXN' },
];

const testimonials = [
  {
    name: 'Andrea',
    role: 'estudiante',
    quote: 'Me gusta poder elegir una bebida según el tipo de día.',
    initials: 'A',
  },
  {
    name: 'Carlos',
    role: 'deportista',
    quote: 'El proceso de compra se entiende rápidamente.',
    initials: 'C',
  },
  {
    name: 'Mariana',
    role: 'joven profesionista',
    quote: 'El Pack EnergyMax permite probar ambas opciones.',
    initials: 'M',
  },
];

const clampQuantity = (value: unknown) => {
  const number = Math.floor(Number(value));
  if (!Number.isFinite(number)) return 1;
  return Math.min(MAX_CART_QUANTITY, Math.max(1, number));
};

const makeProductCartItem = (product: Product, quantity = 1): CartItem => ({
  id: product.id,
  title: product.name,
  subtitle: `${product.category} - ${product.volume}`,
  price: product.price,
  quantity,
  visual: product.id,
});

const makePackCartItem = (pack: Pack, quantity = 1): CartItem => ({
  id: pack.id,
  title: pack.name,
  subtitle: pack.items.map((item) => `${item.quantity} ${getProduct(item.productId).name}`).join(' + '),
  price: pack.price,
  quantity,
  visual: pack.items.length > 1 ? 'mixed' : pack.items[0].productId,
});

const getExpectedCartItem = (id: string) => {
  const product = products.find((entry) => entry.id === id);
  if (product) return makeProductCartItem(product);

  const pack = packs.find((entry) => entry.id === id);
  if (pack) return makePackCartItem(pack);

  return null;
};

function sanitizeCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) {
      window.localStorage.removeItem(CART_STORAGE_KEY);
      return [];
    }

    let changed = false;
    const clean = parsed
      .map((item) => {
        if (!item || typeof item !== 'object') {
          changed = true;
          return null;
        }

        const candidate = item as Partial<CartItem>;
        if (typeof candidate.id !== 'string') {
          changed = true;
          return null;
        }

        const expected = getExpectedCartItem(candidate.id);
        if (!expected) {
          changed = true;
          return null;
        }

        const quantity = clampQuantity(candidate.quantity);
        const matchesCatalog =
          candidate.title === expected.title &&
          candidate.subtitle === expected.subtitle &&
          candidate.price === expected.price &&
          candidate.visual === expected.visual;

        if (!matchesCatalog) {
          changed = true;
          return null;
        }

        if (quantity !== candidate.quantity) changed = true;
        return { ...expected, quantity };
      })
      .filter(Boolean) as CartItem[];

    if (changed) {
      if (clean.length) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(clean));
      else window.localStorage.removeItem(CART_STORAGE_KEY);
    }

    return clean;
  } catch {
    window.localStorage.removeItem(CART_STORAGE_KEY);
    return [];
  }
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(sanitizeCart);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [recommendation, setRecommendation] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkout, setCheckout] = useState<CheckoutData>(initialCheckout);
  const [order, setOrder] = useState<Order | null>(null);
  const [activeSection, setActiveSection] = useState('empresa');

  useEffect(() => {
    if (cart.length) window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    else window.localStorage.removeItem(CART_STORAGE_KEY);
  }, [cart]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [menuOpen]);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-36% 0px -46% 0px', threshold: [0.18, 0.35, 0.52] },
    );

    navItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const energyPack = packs.find((pack) => pack.id === 'pack-energymax')!;

  const addItem = (item: CartItem) => {
    const normalized = { ...item, quantity: clampQuantity(item.quantity) };
    setCart((current) => {
      const found = current.find((entry) => entry.id === normalized.id);
      if (!found) return [...current, normalized];
      return current.map((entry) =>
        entry.id === normalized.id
          ? { ...entry, quantity: Math.min(MAX_CART_QUANTITY, entry.quantity + normalized.quantity) }
          : entry,
      );
    });
    setCartOpen(true);
  };

  const addProduct = (product: Product, quantity = 1) => {
    addItem(makeProductCartItem(product, quantity));
  };

  const addPack = (pack: Pack, quantity = 1) => {
    addItem(makePackCartItem(pack, quantity));
  };

  const updateQuantity = (id: string, change: number) => {
    setCart((current) =>
      current
        .map((item) => {
          if (item.id !== id) return item;
          return { ...item, quantity: Math.min(MAX_CART_QUANTITY, Math.max(0, item.quantity + change)) };
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const finishOrder = () => {
    setOrder({
      id: `EMX-${Math.floor(100000 + Math.random() * 900000)}`,
      items: cart,
      total: subtotal,
      delivery: checkout.delivery,
      payment: checkout.payment,
      city: checkout.city,
    });
    setCart([]);
    setCheckoutOpen(false);
    setCheckoutStep(0);
    setCheckout(initialCheckout);
  };

  return (
    <div className="min-h-screen bg-mist text-ink">
      <Header
        cartCount={cartCount}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        activeSection={activeSection}
        onCart={() => setCartOpen(true)}
      />
      <span className="sr-only" aria-live="polite">
        Carrito con {cartCount} artículos.
      </span>

      <main>
        <Hero onPack={() => addPack(energyPack)} />
        <CompanySection />
        <StrategySection />
        <StrategyExperienceSection />
        <ProductsSection onAdd={addProduct} onDetail={setSelectedProduct} />
        <ProductComparison onAdd={addProduct} />
        <MomentsSection onAdd={addProduct} onDetail={setSelectedProduct} />
        <PacksSection onAdd={addPack} />
        <RecommenderSection
          recommendation={recommendation}
          setRecommendation={setRecommendation}
          onAdd={addProduct}
          onDetail={setSelectedProduct}
        />
        <TestimonialsSection />
        <CoverageSection />
        <FinalCta onAdd={addProduct} onPack={() => addPack(energyPack)} />
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
            onClear={() => setCart([])}
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
  activeSection,
  onCart,
}: {
  cartCount: number;
  menuOpen: boolean;
  setMenuOpen: Dispatch<SetStateAction<boolean>>;
  activeSection: string;
  onCart: () => void;
}) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-ink/92 text-white backdrop-blur-2xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8" aria-label="Navegación principal">
        <a href="#inicio" className="brand-link flex min-w-0 items-center font-black" onClick={() => setMenuOpen(false)}>
          <img src="/energymax-icon.svg" alt="" className="brand-mark brand-mark-header" />
          <span className="brand-word tracking-wide">EnergyMax</span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`nav-link ${activeSection === item.id ? 'nav-link-active' : ''}`}
              aria-current={activeSection === item.id ? 'true' : undefined}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCart}
            className="cart-nav-button relative inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 font-black text-ink shadow-lg shadow-black/10"
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
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div id="mobile-menu" className="grid gap-2 border-t border-white/10 px-4 py-4 lg:hidden">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`mobile-nav-link ${activeSection === item.id ? 'mobile-nav-link-active' : ''}`}
              aria-current={activeSection === item.id ? 'true' : undefined}
            >
              {item.label}
            </a>
          ))}
          <button type="button" onClick={onCart} className="mobile-cart-link">
            <ShoppingBag size={18} aria-hidden="true" />
            Carrito
          </button>
        </div>
      )}
    </header>
  );
}

function Hero({ onPack }: { onPack: () => void }) {
  return (
    <section id="inicio" className="hero-premium relative overflow-hidden pt-28 text-white">
      <Container>
        <div className="hero-layout grid min-h-[calc(100vh-3rem)] items-center gap-10 py-8 lg:grid-cols-[0.86fr_1.14fr] lg:py-12">
          <motion.div className="hero-copy" initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.96] sm:text-6xl xl:text-7xl">
              Activa tu día con EnergyMax
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-bold text-white/82 sm:text-2xl">
              Energía y frescura para cada momento.
            </p>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-white/66 sm:text-lg">
              Dos bebidas creadas para acompañar distintos ritmos, actividades y momentos del día.
            </p>
            <div className="hero-actions mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a href="#productos" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-4 font-black text-ink shadow-xl shadow-black/20">
                Comprar ahora <ChevronRight size={18} aria-hidden="true" />
              </a>
              <a href="#productos" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/24 bg-white/8 px-6 py-4 font-black backdrop-blur-xl">
                Descubrir productos <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>
            <button type="button" onClick={onPack} className="hero-pack-link mt-5 inline-flex items-center gap-2 font-black text-teal">
              Ver Pack EnergyMax <ShoppingBag size={17} aria-hidden="true" />
            </button>
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
                alt="Imagen publicitaria de EnergyMax con Drink2Go y HelTea"
                className="hero-ad-image"
                loading="eager"
                decoding="async"
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          className="hero-benefit-strip"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
        >
          {heroBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="hero-benefit-card">
                <Icon size={20} aria-hidden="true" />
                <span>{benefit.title}</span>
              </div>
            );
          })}
        </motion.div>
      </Container>
    </section>
  );
}

function CompanySection() {
  return (
    <section id="empresa" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <SectionHeader eyebrow="Presentación de la empresa" title="Una marca creada para moverse contigo" />
            <p className="company-intro">
              EnergyMax acompaña distintos ritmos, actividades y momentos del día.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {companyCards.map((card) => (
                <VisualPoint key={card.title} icon={card.icon} title={card.title} text={card.text} />
              ))}
            </div>
          </motion.div>
          <motion.div className="brand-showcase" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <img src="/energymax-icon.svg" alt="EnergyMax" className="brand-showcase-logo" />
            <DuoVisual />
            <div className="brand-showcase-copy">
              <span>Drink2Go + HelTea</span>
              <strong>Dos estilos de consumo, una marca clara y accesible.</strong>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function StrategySection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="estrategia" className="strategy-bg py-16 text-white sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <SectionHeader eyebrow="Nuestra estrategia EnergyMax" title="Del simulador a una estrategia comercial" light />
            <p className="mt-5 max-w-xl text-lg font-semibold text-white/72">
              Las decisiones de Energy&Co se convierten en una experiencia digital orientada al cliente.
            </p>
            <div className="mt-8 rounded-[2rem] border border-white/12 bg-white/8 p-5 backdrop-blur-xl">
              <div className="grid grid-cols-[110px_1fr] items-center gap-5">
                <DuoVisual compact />
                <div>
                  <p className="text-sm font-black uppercase text-teal">Simulador Energy&Co</p>
                  <h3 className="mt-1 text-2xl font-black">Medium, mejora de producto, promociones y compra digital.</h3>
                  <p className="mt-2 text-sm text-white/66">Una lectura visual para explicar la estrategia frente al docente.</p>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="strategy-progress">
            {strategy.map((item, index) => {
              const Icon = item.icon;
              const open = openIndex === index;
              return (
                <motion.article
                  key={item.title}
                  className="strategy-card"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className="strategy-number">{item.metric}</div>
                  <div className="flex items-start gap-4">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-ink">
                      <Icon size={25} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-[1.35rem] font-black leading-tight">{item.title}</h3>
                      <p className="mt-3 text-base leading-7 text-white/74">{item.text}</p>
                      <button
                        type="button"
                        onClick={() => setOpenIndex(open ? -1 : index)}
                        className="strategy-toggle"
                        aria-expanded={open}
                      >
                        {open ? 'Ocultar detalle' : 'Ver decisión'}
                      </button>
                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.p
                            className="strategy-detail"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            {item.detail}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                  {index < strategy.length - 1 && <ArrowRight className="strategy-arrow" size={19} aria-hidden="true" />}
                </motion.article>
              );
            })}
          </div>
        </div>
        <div className="strategy-flow" aria-label="Flujo de estrategia">
          {strategyFlow.map((step, index) => (
            <span key={step}>
              {step}
              {index < strategyFlow.length - 1 && <ChevronRight size={18} aria-hidden="true" />}
            </span>
          ))}
        </div>
      </Container>
    </section>
  );
}

function StrategyExperienceSection() {
  const flow = [
    'Mejora del producto',
    'Mayor percepción de valor',
    'Promociones atractivas',
    'Mayor cobertura',
    'Más oportunidades de compra',
  ];

  return (
    <section className="strategy-experience bg-mist py-16 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHeader eyebrow="Estrategia aplicada" title="Cómo la estrategia se convierte en experiencia digital" />
            <p className="mt-5 max-w-xl text-lg font-bold text-slate-600">
              La aplicación traduce las decisiones de Energy&Co en una experiencia clara para el consumidor.
            </p>
          </div>
          <div className="digital-flow">
            {flow.map((step, index) => (
              <motion.div
                key={step}
                className="digital-flow-step"
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{step}</strong>
              </motion.div>
            ))}
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
  onAdd: (product: Product, quantity?: number) => void;
  onDetail: (product: Product) => void;
}) {
  return (
    <section id="productos" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader eyebrow="Catálogo" title="Drink2Go y HelTea listos para comprar" />
          <p className="max-w-md text-sm font-bold text-slate-500">Productos protagonistas, precio visible y compra simulada en pocos pasos.</p>
        </div>
        <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-2">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={onAdd} onDetail={onDetail} />
          ))}
        </div>
        <p className="mt-5 text-sm font-bold text-slate-500">Información, presentaciones y precios ilustrativos para fines académicos.</p>
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
  onAdd: (product: Product, quantity?: number) => void;
  onDetail: (product: Product) => void;
}) {
  const [quantity, setQuantity] = useState(1);

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
      <div className="product-card-body p-6 sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-black uppercase" style={{ color: product.colors.primary }}>
              {product.category}
            </p>
            <h3 className="mt-2 text-4xl font-black">{product.name}</h3>
            <p className="mt-2 text-lg font-bold text-slate-600">{product.tagline}</p>
          </div>
          <strong className="price-chip">{formatPrice(product.price)}</strong>
        </div>
        <p className="mt-5 text-slate-600">{product.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black">{product.volume}</span>
          {product.benefits.map((benefit) => (
            <span key={benefit} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black">
              {benefit}
            </span>
          ))}
        </div>
        <div className="product-card-footer">
          <QuantityControl value={quantity} setValue={setQuantity} />
          <div className="product-actions">
            <button type="button" onClick={() => onDetail(product)} className="rounded-full border border-slate-200 px-5 py-3 font-black hover:border-ink">
              Ver detalles
            </button>
            <motion.button
              type="button"
              onClick={() => onAdd(product, quantity)}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-black text-white hover:bg-electric"
            >
              <ShoppingBag size={18} aria-hidden="true" />
              Agregar al carrito
            </motion.button>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function ProductComparison({ onAdd }: { onAdd: (product: Product) => void }) {
  return (
    <section className="comparison-section bg-mist py-16 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader eyebrow="Comparador" title="¿Cuál bebida va contigo?" />
          <p className="max-w-md text-base font-bold text-slate-600">Dos perfiles claros para elegir por energía, frescura y momento de consumo.</p>
        </div>
        <div className="comparison-showdown mt-8">
          <article className="comparison-profile comparison-profile-drink">
            <div className="comparison-media">
              <ProductVisual product={products[0]} className="comparison-product" />
            </div>
            <div className="comparison-copy">
              <span>Perfil energético</span>
              <h3>Drink2Go</h3>
              <ul>
                <li>Estudio y entrenamiento</li>
                <li>Intensidad y movimiento</li>
                <li>Precio ilustrativo: $35 MXN</li>
              </ul>
              <button type="button" onClick={() => onAdd(products[0])}>
                Elegir Drink2Go
              </button>
            </div>
          </article>
          <div className="comparison-divider" aria-hidden="true">
            <span>VS</span>
            <i />
          </div>
          <article className="comparison-profile comparison-profile-tea">
            <div className="comparison-media">
              <ProductVisual product={products[1]} className="comparison-product" />
            </div>
            <div className="comparison-copy">
              <span>Perfil refrescante</span>
              <h3>HelTea</h3>
              <ul>
                <li>Día ligero</li>
                <li>Frescura y equilibrio</li>
                <li>Precio ilustrativo: $32 MXN</li>
              </ul>
              <button type="button" onClick={() => onAdd(products[1])}>
                Elegir HelTea
              </button>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}

function MomentsSection({
  onAdd,
  onDetail,
}: {
  onAdd: (product: Product) => void;
  onDetail: (product: Product) => void;
}) {
  return (
    <section id="momentos" className="moments-section py-16 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader eyebrow="Momentos de consumo" title="Elige tu momento EnergyMax" />
          <p className="max-w-md text-sm font-bold text-slate-500">Escenarios visuales que conectan cada necesidad con una recomendación clara.</p>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {momentCards.map((card, index) => {
            const product = getProduct(card.productId);
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                className={`moment-card moment-card-${product.id}`}
                style={{ '--product-primary': product.colors.primary, '--product-soft': product.colors.soft } as CSSProperties}
                whileHover={{ y: -8 }}
                transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              >
                <div className="moment-scene">
                  {card.sceneIcons.map((SceneIcon, sceneIndex) => (
                    <span key={`${card.title}-${sceneIndex}`} className={`scene-icon scene-icon-${sceneIndex + 1}`}>
                      <SceneIcon size={28} aria-hidden="true" />
                    </span>
                  ))}
                  <ProductVisual product={product} className="moment-product" />
                </div>
                <div className="moment-copy">
                  <span className="moment-index">0{index + 1}</span>
                  <Icon size={22} aria-hidden="true" />
                  <h3>{card.title}</h3>
                  <p>{card.message}</p>
                  <strong>Recomendado: {product.name}</strong>
                  <div className="moment-actions">
                    <button type="button" onClick={() => onDetail(product)}>
                      Ver detalle
                    </button>
                    <button type="button" onClick={() => onAdd(product)}>
                      Agregar
                    </button>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

function PacksSection({ onAdd }: { onAdd: (pack: Pack, quantity?: number) => void }) {
  return (
    <section className="bg-mist py-16 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader eyebrow="Paquetes promocionales" title="Promos con presentación de campaña real" />
          <div className="rounded-full bg-white px-5 py-3 text-sm font-black text-electric shadow-sm">
            Promoción académica simulada
          </div>
        </div>
        <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
          {packs.map((pack) => (
            <PackCard key={pack.id} pack={pack} onAdd={onAdd} />
          ))}
        </div>
        <p className="mt-5 text-sm font-bold text-slate-500">Todos los precios de paquetes son ilustrativos para fines académicos.</p>
      </Container>
    </section>
  );
}

function PackCard({ pack, onAdd }: { pack: Pack; onAdd: (pack: Pack, quantity?: number) => void }) {
  const [quantity, setQuantity] = useState(1);
  const featured = pack.recommended;

  return (
    <motion.article
      className={`pack-card ${featured ? 'pack-card-featured' : ''}`}
      whileHover={{ y: -7 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <div className="pack-card-head flex items-center justify-between gap-4">
        <span className={`rounded-full px-3 py-2 text-xs font-black ${featured ? 'bg-teal text-ink' : 'bg-white text-electric'}`}>
          {featured ? 'Recomendado' : 'Promoción'}
        </span>
        <strong className={featured ? 'text-teal' : 'text-electric'}>{formatPrice(pack.price)}</strong>
      </div>
      <div className="pack-media">
        <PackVisual pack={pack} />
      </div>
      <h3 className="text-3xl font-black">{pack.name}</h3>
      <p className={`pack-detail mt-3 ${featured ? 'text-white/76' : 'text-slate-600'}`}>{pack.detail}</p>
      {featured && (
        <div className="pack-promo">
          <span>Precio regular ilustrativo: $201 MXN</span>
          <strong>Precio del paquete: $189 MXN</strong>
          <span>Ahorro ilustrativo: $12 MXN</span>
        </div>
      )}
      <div className="pack-card-footer">
        <QuantityControl value={quantity} setValue={setQuantity} />
        <button type="button" onClick={() => onAdd(pack, quantity)} className={`pack-button w-full rounded-full px-5 py-4 font-black ${featured ? 'bg-white text-ink' : 'bg-ink text-white'}`}>
          Agregar paquete
        </button>
      </div>
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
    <section id="recomendador" className="bg-white py-16 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch">
          <div>
            <SectionHeader eyebrow="Recomendador" title="¿Qué EnergyMax necesitas hoy?" />
            <div className="mt-8 grid gap-3" role="listbox" aria-label="Opciones del recomendador">
              {recommendationOptions.map((option, index) => {
                const Icon = option.icon;
                const active = recommendation === index;
                return (
                  <button
                    type="button"
                    key={option.label}
                    onClick={() => setRecommendation(index)}
                    className={`recommendation-option ${active ? 'recommendation-option-active' : ''}`}
                    aria-pressed={active}
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
            key={`${product.id}-${recommendation}`}
            className="recommendation-card"
            style={{ '--product-primary': product.colors.primary, '--product-secondary': product.colors.secondary, '--product-soft': product.colors.soft } as CSSProperties}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            aria-live="polite"
          >
            <div className="recommendation-visual">
              <AnimatePresence mode="wait">
                <ProductVisual key={product.id} product={product} className="recommendation-image" />
              </AnimatePresence>
            </div>
            <div className="recommendation-copy">
              <span className="rounded-full bg-white/18 px-4 py-2 text-sm font-black text-white">Recomendación</span>
              <h3 className="mt-5 text-5xl font-black text-white">{product.name}</h3>
              <p className="mt-3 text-xl font-bold text-white/78">{selectedOption.result}</p>
              <div className="mt-5 flex items-center gap-3">
                <strong className="rounded-2xl bg-white px-4 py-3 text-xl text-ink">{formatPrice(product.price)}</strong>
                <span className="text-sm font-bold text-white/62">{product.volume}</span>
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={() => onAdd(product)} className="rounded-full bg-white px-5 py-3 font-black text-ink">
                  Agregar al carrito
                </button>
                <button type="button" onClick={() => onDetail(product)} className="rounded-full border border-white/20 px-5 py-3 font-black text-white">
                  Ver producto
                </button>
              </div>
              <button type="button" onClick={() => setRecommendation(0)} className="mt-5 text-sm font-black text-white/70 underline decoration-white/30 underline-offset-4">
                Cambiar respuesta
              </button>
            </div>
          </motion.article>
        </div>
      </Container>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="testimonials-section bg-mist py-16 sm:py-20">
      <Container>
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <SectionHeader eyebrow="Opiniones de demostración" title="Así se viviría la experiencia EnergyMax" />
          <p className="max-w-md text-sm font-bold text-slate-500">Opiniones de demostración para el prototipo académico.</p>
        </div>
        <div className="testimonial-track mt-10">
          {testimonials.map((testimonial) => (
            <motion.article key={testimonial.name} className="testimonial-card" whileHover={{ y: -5 }}>
              <div className="testimonial-avatar" aria-hidden="true">
                {testimonial.initials}
              </div>
              <div className="flex gap-1 text-electric" aria-hidden="true">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
              </div>
              <p>“{testimonial.quote}”</p>
              <strong>
                {testimonial.name}, <span>{testimonial.role}</span>
              </strong>
            </motion.article>
          ))}
        </div>
      </Container>
    </section>
  );
}

function CoverageSection() {
  return (
    <section id="cobertura" className="coverage-section bg-ink py-16 text-white sm:py-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <SectionHeader eyebrow="Cobertura y distribución" title="EnergyMax cada vez más cerca de ti" light />
            <p className="mt-5 text-white/66">Una red ilustrativa de puntos físicos y compra digital para acercar las bebidas al cliente.</p>
            <p className="mt-3 text-sm font-bold text-white/52">Localizador simulado, sin ubicaciones reales.</p>
            <button type="button" className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 font-black text-ink">
              <Search size={18} aria-hidden="true" />
              Buscar punto de venta
            </button>
          </motion.div>
          <div className="coverage-network">
            <div className="coverage-center">
              <span className="coverage-center-mark">
                <ShoppingBag size={36} aria-hidden="true" />
              </span>
              <strong>Compra en línea</strong>
            </div>
            {channels.map((channel, index) => {
              const Icon = channel.icon;
              return (
                <motion.article
                  key={channel.title}
                  className={`coverage-card coverage-node coverage-node-${index + 1}`}
                  initial={{ opacity: 0, scale: 0.94 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.04 }}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal text-ink">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-lg font-black">{channel.title}</h3>
                  <p className="mt-2 text-sm leading-5 text-white/72">{channel.detail}</p>
                </motion.article>
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
    <section className="final-cta overflow-hidden py-16 text-white sm:py-20">
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
              Dos bebidas. Dos momentos. Una misma energía.
            </h2>
            <p className="mt-4 text-xl font-bold text-white/70">Elige cómo activar tu día.</p>
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
          </motion.div>
          <motion.div className="final-cta-visual final-duo-visual" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="final-cta-orbit final-cta-orbit-one" aria-hidden="true" />
            <span className="final-cta-orbit final-cta-orbit-two" aria-hidden="true" />
            <img src={products[0].image} alt="Drink2Go EnergyMax" className="final-product final-product-left" loading="lazy" decoding="async" />
            <img src={products[1].image} alt="HelTea EnergyMax" className="final-product final-product-right" loading="lazy" decoding="async" />
          </motion.div>
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
      aria-labelledby="product-modal-title"
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
            <h2 id="product-modal-title" className="mt-5 text-5xl font-black">{product.name}</h2>
            <p className="mt-3 text-xl font-bold text-slate-700">{product.tagline}</p>
            <p className="mt-5 text-slate-600">{product.description}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info label="Presentación" value={product.volume} />
              <Info label="Precio ilustrativo" value={formatPrice(product.price)} />
              <Info label="Momento" value={product.moments[0]} />
            </div>
            <div className="mt-7 flex flex-wrap gap-2">
              {product.moments.map((moment) => (
                <span key={moment} className="rounded-full bg-slate-100 px-3 py-2 text-sm font-black">
                  {moment}
                </span>
              ))}
            </div>
            <p className="mt-6 text-sm font-bold text-slate-500">Información ilustrativa para fines académicos. No incluye información nutrimental oficial.</p>
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
  onClear,
  onCheckout,
}: {
  cart: CartItem[];
  subtotal: number;
  onClose: () => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
}) {
  const [promoCode, setPromoCode] = useState('');
  const shipping = 0;

  return (
    <motion.aside
      className="fixed bottom-0 right-0 top-0 z-50 flex w-full max-w-md flex-col bg-white shadow-soft"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      role="dialog"
      aria-modal="true"
      aria-label="Carrito"
    >
      <div className="flex items-center justify-between border-b border-slate-200 p-5">
        <div>
          <p className="text-xs font-black uppercase text-electric">Compra simulada</p>
          <h2 className="text-3xl font-black">Tu carrito</h2>
        </div>
        <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-slate-100" aria-label="Cerrar carrito">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-5" aria-live="polite">
        {cart.length === 0 ? (
          <div className="grid min-h-80 place-items-center overflow-hidden rounded-3xl bg-mist p-8 text-center">
            <div>
              <DuoVisual compact />
              <h3 className="mt-5 text-xl font-black">Tu carrito está vacío</h3>
              <p className="mt-2 text-slate-600">Agrega Drink2Go, HelTea o un paquete EnergyMax.</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-3">
            {cart.map((item) => (
              <article key={item.id} className="cart-item-card">
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
                    <div>
                      <strong>{formatPrice(item.price)}</strong>
                      <p className="text-xs font-bold text-slate-500">Línea: {formatPrice(item.price * item.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full bg-slate-100 p-1">
                      <button type="button" onClick={() => onDec(item.id)} className="grid h-8 w-8 place-items-center rounded-full bg-white" aria-label={`Disminuir ${item.title}`}>
                        <Minus size={14} />
                      </button>
                      <strong className="w-6 text-center">{item.quantity}</strong>
                      <button
                        type="button"
                        onClick={() => onInc(item.id)}
                        disabled={item.quantity >= MAX_CART_QUANTITY}
                        className="grid h-8 w-8 place-items-center rounded-full bg-white disabled:opacity-35"
                        aria-label={`Aumentar ${item.title}`}
                      >
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
        <label className="promo-field">
          Código promocional ilustrativo
          <input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="ENERGYMAX" />
        </label>
        <div className="cart-summary mt-4">
          <div>
            <span>Subtotal</span>
            <strong>{formatPrice(subtotal)}</strong>
          </div>
          <div>
            <span>Envío simulado</span>
            <strong>{shipping === 0 ? 'Gratis' : formatPrice(shipping)}</strong>
          </div>
          <div className="cart-summary-total">
            <span>Total</span>
            <strong>{formatPrice(subtotal + shipping)}</strong>
          </div>
        </div>
        <p className="mt-3 rounded-2xl bg-white p-3 text-sm font-bold text-slate-600">Envío y pago simulados. No se procesa ningún pago real.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onClear} disabled={cart.length === 0} className="rounded-full bg-white px-5 py-4 font-black text-ink disabled:opacity-45">
            Vaciar carrito
          </button>
          <button type="button" onClick={onCheckout} disabled={cart.length === 0} className="rounded-full bg-ink px-5 py-4 font-black text-white disabled:bg-slate-300">
            Continuar compra
          </button>
        </div>
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
  setCheckout: Dispatch<SetStateAction<CheckoutData>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  cart: CartItem[];
  subtotal: number;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkout.email.trim());
  const dataValid = checkout.name.trim() && emailValid && checkout.phone.trim().length >= 7;
  const deliveryValid = checkout.address.trim() && checkout.city.trim() && checkout.zip.trim().length >= 4 && checkout.delivery.trim();
  const canContinue = step === 0 ? dataValid : deliveryValid;
  const validationMessage =
    step === 0
      ? 'Completa nombre, correo válido y teléfono.'
      : 'Completa dirección, ciudad, código postal y entrega simulada.';

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink/72 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="checkout-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <article className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <p className="text-xs font-black uppercase text-electric">Proceso simulado con fines académicos.</p>
            <h2 id="checkout-title" className="text-3xl font-black">Checkout EnergyMax</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-slate-100" aria-label="Cerrar checkout">
            <X size={20} />
          </button>
        </div>
        <div className="grid max-h-[70vh] overflow-y-auto lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-5 sm:p-8">
            <div className="mb-7 grid grid-cols-3 gap-2" aria-label="Pasos del checkout">
              {['Datos', 'Entrega', 'Revisión'].map((label, index) => (
                <div
                  key={label}
                  className={`checkout-step ${index <= step ? 'checkout-step-active' : ''}`}
                  aria-current={index === step ? 'step' : undefined}
                >
                  <span>{index + 1}</span>
                  {label}
                </div>
              ))}
            </div>
            {step === 0 && (
              <div className="grid gap-4">
                <Field label="Nombre" value={checkout.name} onChange={(value) => setCheckout((data) => ({ ...data, name: value }))} required />
                <Field
                  label="Correo"
                  value={checkout.email}
                  onChange={(value) => setCheckout((data) => ({ ...data, email: value }))}
                  type="email"
                  required
                  error={checkout.email.length > 0 && !emailValid ? 'Ingresa un correo válido.' : undefined}
                />
                <Field label="Teléfono" value={checkout.phone} onChange={(value) => setCheckout((data) => ({ ...data, phone: value }))} required />
                <p className="checkout-note">No se guarda información personal. El flujo es únicamente demostrativo.</p>
              </div>
            )}
            {step === 1 && (
              <div className="grid gap-4">
                <Field label="Dirección" value={checkout.address} onChange={(value) => setCheckout((data) => ({ ...data, address: value }))} required />
                <Field label="Ciudad" value={checkout.city} onChange={(value) => setCheckout((data) => ({ ...data, city: value }))} required />
                <Field label="Código postal" value={checkout.zip} onChange={(value) => setCheckout((data) => ({ ...data, zip: value }))} required />
                <label className="grid gap-2 text-sm font-black">
                  Entrega simulada
                  <select
                    value={checkout.delivery}
                    onChange={(event) => setCheckout((data) => ({ ...data, delivery: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                    required
                  >
                    <option>Entrega simulada a domicilio</option>
                    <option>Recolección simulada en tienda</option>
                    <option>Entrega simulada en universidad</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-black">
                  Método de pago simulado
                  <select
                    value={checkout.payment}
                    onChange={(event) => setCheckout((data) => ({ ...data, payment: event.target.value }))}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                    required
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
                  <Info label="Entrega" value={`${checkout.delivery} - ${checkout.city}`} />
                  <Info label="Pago simulado" value={checkout.payment} />
                </div>
              </div>
            )}
            {step < 2 && !canContinue && <p className="validation-message" role="status">{validationMessage}</p>}
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
            <div className="mt-5 grid gap-2 rounded-2xl bg-white p-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="flex justify-between">
                <span>Envío simulado</span>
                <strong>Gratis</strong>
              </div>
            </div>
            <div className="mt-3 flex justify-between rounded-2xl bg-ink px-4 py-3 text-white">
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
            <button type="button" onClick={onConfirm} disabled={cart.length === 0} className="rounded-full bg-electric px-6 py-3 font-black text-white disabled:bg-slate-300">
              Confirmar compra
            </button>
          )}
        </div>
      </article>
    </motion.div>
  );
}

function Confirmation({ order, onClose }: { order: Order; onClose: () => void }) {
  const closeTo = (hash: string) => {
    onClose();
    window.setTimeout(() => {
      window.location.hash = hash;
    }, 0);
  };

  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-ink p-4 text-white" role="dialog" aria-modal="true" aria-live="polite" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <article className="confirmation-card">
        <motion.span
          className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-teal text-ink"
          initial={{ scale: 0.75 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        >
          <CheckCircle2 size={42} />
        </motion.span>
        <h2 className="mt-6 text-4xl font-black">Tu pedido EnergyMax ha sido confirmado</h2>
        <p className="mt-3 text-white/72">Pedido ficticio: {order.id}</p>
        <p className="mt-2 text-white/66">Gracias por completar la experiencia de compra simulada.</p>
        <div className="my-6">
          <DuoVisual compact />
        </div>
        <div className="rounded-3xl bg-white p-4 text-left text-ink">
          {order.items.map((item) => (
            <div key={item.id} className="mb-2 flex justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3 last:mb-0">
              <span>{item.title} x {item.quantity}</span>
              <strong>{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="mt-3 grid gap-2 rounded-2xl bg-slate-50 px-4 py-3">
            <Info label="Método de entrega" value={order.delivery} />
            <Info label="Ciudad" value={order.city || 'Simulada'} />
            <Info label="Pago" value={order.payment} />
          </div>
          <div className="mt-3 flex justify-between rounded-2xl bg-ink px-4 py-3 text-white">
            <strong>Total</strong>
            <strong>{formatPrice(order.total)}</strong>
          </div>
        </div>
        <div className="confirmation-actions">
          <button type="button" onClick={() => closeTo('inicio')} className="rounded-full bg-white px-6 py-3 font-black text-ink">
            Volver al inicio
          </button>
          <button type="button" onClick={() => closeTo('productos')} className="rounded-full bg-teal px-6 py-3 font-black text-ink">
            Seguir comprando
          </button>
        </div>
      </article>
    </motion.div>
  );
}

function ProductVisual({ product, className = '' }: { product: Product; className?: string }) {
  return (
    <motion.img
      src={product.image}
      alt={product.imageAlt}
      className={`product-render product-render-${product.id} ${className}`}
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
      <img src={products[0].image} alt="" className="duo-product duo-product-left duo-product-drink2go" loading="lazy" decoding="async" />
      <img src={products[1].image} alt="" className="duo-product duo-product-right duo-product-heltea" loading="lazy" decoding="async" />
    </div>
  );
}

function PackVisual({ pack }: { pack: Pack }) {
  if (pack.items.length > 1) return <DuoVisual compact />;
  return <ProductVisual product={getProduct(pack.items[0].productId)} className="pack-single-image" />;
}

function CartVisual({ visual, small = false }: { visual: ProductId | 'mixed'; small?: boolean }) {
  if (visual === 'mixed') {
    return (
      <div className={small ? 'cart-mix-small' : 'cart-mix'} aria-hidden="true">
        <img src={products[0].image} alt="" />
        <img src={products[1].image} alt="" />
      </div>
    );
  }
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
      <button
        type="button"
        onClick={() => setValue(Math.min(MAX_CART_QUANTITY, value + 1))}
        disabled={value >= MAX_CART_QUANTITY}
        className="grid h-10 w-10 place-items-center rounded-full bg-white disabled:opacity-35"
        aria-label="Aumentar cantidad"
      >
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

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  const fieldId = `field-${label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`;

  return (
    <label className="grid gap-2 text-sm font-black" htmlFor={fieldId}>
      {label}
      <input
        id={fieldId}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`rounded-2xl border px-4 py-3 ${error ? 'border-red-400 bg-red-50' : 'border-slate-200'}`}
        required={required}
        aria-invalid={Boolean(error)}
      />
      {error && <span className="field-error">{error}</span>}
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
    <footer className="footer-premium bg-white py-10">
      <Container>
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#inicio" className="brand-link flex min-w-0 items-center font-black">
              <img src="/energymax-icon.svg" alt="" className="brand-mark footer-mark" />
              <span className="brand-word tracking-wide">EnergyMax</span>
            </a>
            <p>Prototipo académico. No procesa pagos reales.</p>
          </div>
          <nav className="footer-nav" aria-label="Navegación inferior">
            <a href="#productos">Productos</a>
            <a href="#estrategia">Estrategia</a>
            <a href="#cobertura">Cobertura</a>
          </nav>
          <div className="footer-social" aria-label="Redes simuladas">
            <span>Redes simuladas</span>
            <div>
              <span>IG</span>
              <span>TT</span>
              <span>WA</span>
            </div>
          </div>
          <a href="#inicio" className="footer-top">
            Volver arriba <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </Container>
    </footer>
  );
}

export default App;
