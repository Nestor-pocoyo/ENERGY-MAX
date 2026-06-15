# EnergyMax Web App

Aplicacion web academica para EnergyMax, creada con React, Vite, TypeScript, Tailwind CSS, Framer Motion y Lucide React.

EnergyMax presenta dos productos del simulador empresarial Energy&Co:

- Drink2Go: bebida energetica de demostracion.
- HelTea: bebida refrescante a base de te de demostracion.

El sitio incluye presentacion de empresa, estrategia del simulador, catalogo, detalle de productos, paquetes, recomendador, carrito persistente, checkout simulado y confirmacion.

## Prototipo academico

Los precios, promociones, opiniones, localizador, envio y pago son simulados para fines academicos. Esta aplicacion no procesa pagos reales ni guarda informacion personal.

## Instalacion

```bash
npm install
```

## Desarrollo local

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Vercel

El proyecto esta listo para Vercel desde la raiz del repositorio.

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

No requiere configurar un Root Directory interno.

## Estructura

```text
package.json
package-lock.json
vite.config.ts
tsconfig.json
index.html
vercel.json
src/
public/
```

## Modificar productos y precios

Edita `src/data/products.ts`.

## Modificar colores e identidad

Edita `tailwind.config.js`, `src/styles.css` y las paletas en `src/data/products.ts`.
