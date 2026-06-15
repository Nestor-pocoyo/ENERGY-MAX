export type ProductId = 'drink2go' | 'heltea';

export type Product = {
  id: ProductId;
  name: 'Drink2Go' | 'HelTea';
  category: string;
  tagline: string;
  description: string;
  price: number;
  volume: string;
  benefits: string[];
  moments: string[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    soft: string;
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
    category: 'Bebida energetica',
    tagline: 'La energia que sigue tu ritmo',
    description:
      'Una opcion practica para momentos de estudio, entrenamiento y jornadas largas dentro del prototipo EnergyMax.',
    price: 35,
    volume: '250 ml',
    benefits: ['Energia', 'Concentracion', 'Practicidad'],
    moments: ['Estudio', 'Entrenamiento', 'Jornada larga'],
    colors: {
      primary: '#2378ff',
      secondary: '#111d4f',
      accent: '#7c3cff',
      soft: '#eaf2ff',
    },
  },
  {
    id: 'heltea',
    name: 'HelTea',
    category: 'Bebida refrescante a base de te',
    tagline: 'Activate de una forma mas ligera',
    description:
      'Una alternativa fresca y ligera para seguir el dia con una experiencia visual mas natural y equilibrada.',
    price: 32,
    volume: '250 ml',
    benefits: ['Frescura', 'Ligereza', 'Practicidad'],
    moments: ['Dia ligero', 'Pausa activa', 'Compra rapida'],
    colors: {
      primary: '#22cfc2',
      secondary: '#127a53',
      accent: '#9af5cd',
      soft: '#e8fff9',
    },
  },
];

export const packs: Pack[] = [
  {
    id: 'pack-energia',
    name: 'Pack Energia',
    detail: '6 Drink2Go para semanas con ritmo intenso.',
    price: 195,
    items: [{ productId: 'drink2go', quantity: 6 }],
  },
  {
    id: 'pack-frescura',
    name: 'Pack Frescura',
    detail: '6 HelTea para pausas frescas y practicas.',
    price: 178,
    items: [{ productId: 'heltea', quantity: 6 }],
  },
  {
    id: 'pack-energymax',
    name: 'Pack EnergyMax',
    detail: '3 Drink2Go + 3 HelTea para probar la linea completa.',
    price: 186,
    recommended: true,
    items: [
      { productId: 'drink2go', quantity: 3 },
      { productId: 'heltea', quantity: 3 },
    ],
  },
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    maximumFractionDigits: 0,
  }).format(value);

export const getProduct = (id: ProductId) => products.find((product) => product.id === id)!;
