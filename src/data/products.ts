export type ProductId = 'drink2go' | 'heltea';

export type Product = {
  id: ProductId;
  name: 'Drink2Go' | 'HelTea';
  category: string;
  badge: string;
  tagline: string;
  description: string;
  price: number;
  volume: string;
  image: string;
  imageAlt: string;
  benefits: string[];
  moments: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
    dark: string;
  };
};

export type Pack = {
  id: string;
  name: string;
  detail: string;
  price: number;
  recommended?: boolean;
  items: Array<{ productId: ProductId; quantity: number }>;
};

export const products: Product[] = [
  {
    id: 'drink2go',
    name: 'Drink2Go',
    category: 'Bebida energética',
    badge: 'Más vendido',
    tagline: 'La energía que sigue tu ritmo',
    description: 'Para concentración, entrenamiento y jornadas largas. Sabor intenso, formato práctico y precio competitivo.',
    price: 35,
    volume: '250 ml',
    image: '/drink2go-product.png',
    imageAlt: 'Render real de Drink2Go EnergyMax',
    benefits: ['Energía', 'Concentración', 'Rendimiento'],
    moments: ['Concentración', 'Entrenamiento', 'Jornada larga'],
    colors: {
      primary: '#2378ff',
      secondary: '#111d4f',
      accent: '#7c3cff',
      soft: '#eaf2ff',
      dark: '#08142f',
    },
  },
  {
    id: 'heltea',
    name: 'HelTea',
    category: 'Bebida refrescante a base de té',
    badge: 'Opción ligera',
    tagline: 'Actívate de una forma más ligera',
    description: 'Una alternativa fresca y ligera para pausas activas, compra rápida y consumo cotidiano.',
    price: 32,
    volume: '250 ml',
    image: '/heltea-product.png',
    imageAlt: 'Render real de HelTea EnergyMax',
    benefits: ['Frescura', 'Ligereza', 'Bienestar'],
    moments: ['Pausa activa', 'Día ligero', 'Compra rápida'],
    colors: {
      primary: '#20c7b8',
      secondary: '#127a53',
      accent: '#a8f5cd',
      soft: '#e8fff9',
      dark: '#083a32',
    },
  },
];

export const packs: Pack[] = [
  {
    id: 'pack-energia',
    name: 'Pack Energía',
    detail: '6 Drink2Go para semanas con ritmo intenso.',
    price: 195,
    items: [{ productId: 'drink2go', quantity: 6 }],
  },
  {
    id: 'pack-frescura',
    name: 'Pack Frescura',
    detail: '6 HelTea para pausas ligeras y prácticas.',
    price: 178,
    items: [{ productId: 'heltea', quantity: 6 }],
  },
  {
    id: 'pack-energymax',
    name: 'Pack EnergyMax',
    detail: '3 Drink2Go + 3 HelTea para probar la línea completa.',
    price: 189,
    recommended: true,
    items: [
      { productId: 'drink2go', quantity: 3 },
      { productId: 'heltea', quantity: 3 },
    ],
  },
];

export const formatPrice = (value: number) => `$${value.toLocaleString('es-MX', { maximumFractionDigits: 0 })} MXN`;

export const getProduct = (id: ProductId) => products.find((product) => product.id === id)!;
