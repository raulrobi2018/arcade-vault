# SPEC 01 — MVP visual: pantallas de Arcade Vault

> **Status:** Implementado
> **Depends on:** —
> **Date:** 2026-10-15
> **Objective:** Implementar en Next.js App Router las cinco pantallas de `references/templates/` (Biblioteca, Detalle, Reproductor, Login y Salón de la Fama) con datos ficticios y sin ningún juego real.

## Por qué existe esta spec

La plantilla de `references/templates/` es una SPA de React 18 en un HTML suelto, con navegación por `location.hash` y `localStorage`. Esta spec la convierte en rutas reales de Next.js 16. La estética no cambia. Los datos quedan aislados en una capa (`app/data/`) que más adelante se reemplazará por una base de datos sin tocar las pantallas.

## Scope

**In:**

- Shell común: `Nav` (logo, enlaces Biblioteca / Salón de la Fama, contador fijo "CRÉDITOS · 03", botón "Iniciar Sesión", menú hamburguesa móvil) y `Footer`.
- Pantalla **Biblioteca** (`/`): hero, buscador por nombre, chips de categoría, grilla de tarjetas con efecto tilt y estado "NO HAY RESULTADOS".
- Pantalla **Detalle** (`/juegos/[id]`): portada, tags, descripción larga, stat strip, botones "JUGAR AHORA" / "VOLVER AL VAULT" y leaderboard con el top 10.
- Pantalla **Reproductor** (`/juegos/[id]/jugar`): placeholder copiado de la plantilla. HUD (jugador, puntuación, vidas, nivel), arena CRT decorativa, puntuación simulada con timer, PAUSA / FIN / SALIR y modal "FIN DEL JUEGO".
- Pantalla **Login** (`/login`): pestañas INICIAR SESIÓN / CREAR CUENTA, campos, botón invitado y botones sociales decorativos.
- Pantalla **Salón de la Fama** (`/salon-de-la-fama`): pestañas por juego, podio top 3, tabla de 12 filas y botón de volver.
- Página 404 temática (`app/not-found.tsx`) para ids de juego inexistentes y rutas desconocidas.
- Capa de datos ficticios tipada en `app/data/` con funciones async.
- Estado de filtros en la URL (`searchParams`).

**Out of scope (para futuras specs):**

- Cualquier juego real. El Reproductor es un placeholder.
- Autenticación real, sesión de usuario y estado "logueado" (Nav con nombre, fila "tu mejor marca" del Salón).
- Guardar puntuaciones de verdad (ni en `localStorage` ni en BD).
- Base de datos o API.
- Sistema de créditos funcional.
- Login social (Google / GitHub).
- Framework de tests.

## Modelo de datos

Todo vive en `app/data/`. Las pantallas solo consumen las funciones exportadas, nunca las constantes internas.

```ts
// app/data/games.ts
export type Category = "ARCADE" | "PUZZLE" | "SHOOTER" | "VERSUS";
export type AccentColor = "cyan" | "magenta" | "yellow" | "green";

export type Game = {
    id: string; // slug, p. ej. "bloque-buster"
    title: string; // "BLOQUE BUSTER"
    short: string; // descripción de tarjeta
    long: string; // descripción de detalle
    category: Category;
    cover: string; // clase CSS de portada, p. ej. "cover-bricks"
    color: AccentColor; // color del botón JUGAR
    best: number; // mejor puntuación global
    plays: string; // "12.4K"
};

export const CATEGORY_FILTERS = [
    "TODOS",
    "ARCADE",
    "PUZZLE",
    "SHOOTER",
    "VERSUS"
] as const;

export async function getGames(filters?: {
    q?: string;
    category?: Category;
}): Promise<Game[]>;
export async function getGame(id: string): Promise<Game | null>;
```

```ts
// app/data/scores.ts
export type ScoreEntry = {
    rank: number; // 1..12
    player: string; // "PX_KAI"
    score: number;
    date: string; // ISO "2026-05-11", se formatea a "11/05/2026" en la UI
};

export async function getScores(
    gameId: string,
    limit?: number
): Promise<ScoreEntry[]>;
```

Convenciones:

- Los 8 juegos de `references/templates/data.jsx` se copian tal cual (mismos ids, textos y valores). El campo `cat` pasa a llamarse `category`.
- `scores.ts` contiene un array estático de 12 entradas por juego, ordenado por `score` descendente. No se porta `seededScores()`.
- Detalle usa `getScores(id, 10)`. Salón de la Fama usa `getScores(id)` (12).
- Los números se formatean con `toLocaleString("es-ES")`.
- Los tags "1 JUGADOR", "TECLADO / TÁCTIL", "RETRO 1985" y la dificultad "★ ★ ★ ☆ ☆" del Detalle quedan fijos como en la plantilla.

## Rutas y archivos

| Ruta                 | Archivo                          | Origen en plantilla |
| -------------------- | -------------------------------- | ------------------- |
| `/`                  | `app/page.tsx`                   | `biblioteca.jsx`    |
| `/juegos/[id]`       | `app/juegos/[id]/page.tsx`       | `detalle.jsx`       |
| `/juegos/[id]/jugar` | `app/juegos/[id]/jugar/page.tsx` | `reproductor.jsx`   |
| `/login`             | `app/login/page.tsx`             | `auth.jsx`          |
| `/salon-de-la-fama`  | `app/salon-de-la-fama/page.tsx`  | `salon.jsx`         |
| 404                  | `app/not-found.tsx`              | — (nuevo)           |

Parámetros de URL:

- Biblioteca: `/?q=<texto>&cat=<CATEGORÍA>`. Sin `cat` o con `cat=TODOS` se muestran todas las categorías.
- Salón de la Fama: `/salon-de-la-fama?juego=<id>`. Sin `juego` o con un id inválido se usa el primer juego.

Componentes en `app/components/`:

- `Nav.tsx` (cliente: menú móvil y enlace activo con `usePathname`).
- `Footer.tsx`.
- `GameCard.tsx` (cliente: efecto tilt).
- `LibraryFilters.tsx` (cliente: buscador y chips que actualizan la URL).
- `Leaderboard.tsx`.
- `GamePlayer.tsx` (cliente: timer, pausa, modal).
- `AuthForm.tsx` (cliente: pestañas y campos).
- `HallTabs.tsx`, `Podium.tsx`, `HallTable.tsx`.

## Implementation plan

1. **Capa de datos.** Crear `app/data/games.ts` y `app/data/scores.ts` con los tipos, los datos y las funciones async del modelo. Verificación: `npx tsc --noEmit` sin errores.
2. **Shell.** Crear `Nav.tsx` y `Footer.tsx`. Montarlos en `app/layout.tsx` alrededor de `<main className="av-main">{children}</main>`. Quitar el `<main>` propio de `app/page.tsx`. Verificación: `next dev`, el Nav y el footer se ven en `/` y el menú hamburguesa abre y cierra por debajo de 840px.
3. **Biblioteca (grilla).** En `app/page.tsx`, renderizar hero y grilla con `GameCard` a partir de `getGames()`. La tarjeta y el botón JUGAR enlazan a `/juegos/[id]`. Verificación: se ven las 8 tarjetas y el tilt reacciona al ratón.
4. **Biblioteca (filtros).** Crear `LibraryFilters.tsx`. El buscador y los chips escriben `q` y `cat` en la URL con `router.replace`. La página lee `searchParams` y filtra con `getGames({ q, category })`. Añadir el estado "NO HAY RESULTADOS". Envolver la parte dinámica en `<Suspense>` según exige `cacheComponents`. Verificación: `/?cat=PUZZLE` muestra solo CAÍDA y `/?q=zzz` muestra el estado vacío.
5. **Detalle.** Crear `app/juegos/[id]/page.tsx` y `Leaderboard.tsx`. Añadir `generateStaticParams` con los ids de `getGames()`. Llamar a `notFound()` si `getGame(id)` devuelve `null`. Verificación: `/juegos/caida` muestra el detalle y el top 10.
6. **404.** Crear `app/not-found.tsx` con estética arcade ("GAME OVER · 404") y un enlace a `/`. Verificación: `/juegos/no-existe` y `/cualquier-cosa` muestran esa página.
7. **Reproductor.** Crear `app/juegos/[id]/jugar/page.tsx` (servidor: carga el juego o `notFound()`) y `GamePlayer.tsx` (cliente: copia de `reproductor.jsx`). El jugador por defecto es "INVITADO". "GUARDAR PUNTUACIÓN" solo cambia al toast "▸ PUNTUACIÓN GUARDADA\_" sin persistir nada. SALIR vuelve a `/juegos/[id]` y "VOLVER AL VAULT" a `/`. Verificación: la puntuación sube, PAUSA la detiene, FIN abre el modal y "JUGAR DE NUEVO" reinicia.
8. **Login.** Crear `app/login/page.tsx` y `AuthForm.tsx`. El botón "Iniciar Sesión" del Nav enlaza a `/login`. Enviar el formulario o pulsar "JUGAR COMO INVITADO" navega a `/` sin guardar sesión. Los botones sociales no hacen nada. Verificación: la pestaña CREAR CUENTA muestra el campo de correo.
9. **Salón de la Fama.** Crear `app/salon-de-la-fama/page.tsx`, `HallTabs.tsx`, `Podium.tsx` y `HallTable.tsx`. Las pestañas son enlaces a `?juego=<id>`. El podio usa las 3 primeras entradas y la tabla las 12. Sin fila "tu mejor marca". Verificación: `/salon-de-la-fama?juego=caida` resalta la pestaña CAÍDA.
10. **Repaso visual.** Comparar cada pantalla con `references/templates/Arcade Vault.html` abierto en el navegador. Corregir diferencias en `app/globals.css` cuando falte o difiera una clase portada. Usar Tailwind para cualquier estilo nuevo (404, ajustes). Aplicar `/frontend-design` según `CLAUDE.md`.

## Acceptance criteria

- [ ] `npm run build` termina sin errores de TypeScript ni de Next.
- [ ] `npm run lint` termina sin errores.
- [ ] Las cinco rutas (`/`, `/juegos/caida`, `/juegos/caida/jugar`, `/login`, `/salon-de-la-fama`) cargan sin errores en la consola del navegador.
- [ ] `/` muestra 8 tarjetas de juego.
- [ ] `/?cat=SHOOTER` muestra exactamente INVASORES y ROCAS, y el chip SHOOTER aparece activo.
- [ ] Escribir "ser" en el buscador deja solo SERPENTINA y la URL contiene `q=ser`.
- [ ] `/?q=zzz` muestra "NO HAY RESULTADOS".
- [ ] Recargar `/?cat=PUZZLE` mantiene el filtro aplicado.
- [ ] Pulsar una tarjeta navega a `/juegos/<id>` de ese juego.
- [ ] El Detalle muestra un leaderboard de 10 filas, con las 3 primeras en oro, plata y bronce.
- [ ] "JUGAR AHORA" navega a `/juegos/<id>/jugar`.
- [ ] `/juegos/no-existe` y `/juegos/no-existe/jugar` muestran la página 404 temática.
- [ ] En el Reproductor la puntuación aumenta sola, PAUSA la congela y muestra "EN PAUSA", y REANUDAR la reactiva.
- [ ] FIN abre el modal "FIN DEL JUEGO" con la puntuación final.
- [ ] "GUARDAR PUNTUACIÓN" muestra "▸ PUNTUACIÓN GUARDADA\_" y no escribe nada en `localStorage`.
- [ ] En `/login`, la pestaña CREAR CUENTA muestra el campo "Correo electrónico" y la pestaña INICIAR SESIÓN lo oculta.
- [ ] Enviar el formulario de login navega a `/`, y el Nav sigue mostrando "Iniciar Sesión".
- [ ] `/salon-de-la-fama` muestra el podio y 12 filas del primer juego.
- [ ] Cambiar de pestaña en el Salón actualiza `?juego=<id>`, el podio y la tabla.
- [ ] El enlace del Nav de la sección actual aparece activo (Biblioteca también en Detalle y Reproductor).
- [ ] A 375px de ancho no hay scroll horizontal en ninguna pantalla y el menú hamburguesa sustituye a los enlaces.
- [ ] Ningún archivo bajo `app/` importa nada de `references/`.

## Decisions

- **Sí:** rutas reales del App Router. URLs compartibles y aprovecha Next.
- **No:** SPA con `location.hash` como la plantilla. Desaprovecha el router de Next.
- **Sí:** rutas en español (`/juegos`, `/salon-de-la-fama`). Coherentes con la UI.
- **Sí:** datos ficticios en `app/data/` con funciones async. Migrar a BD solo cambia el cuerpo de esas funciones.
- **No:** constantes exportadas o JSON consumidos directamente. Acoplan las pantallas al formato del mock.
- **Sí:** arrays estáticos de puntuaciones por juego. Deterministas y parecidos a lo que devolverá una BD.
- **No:** portar `seededScores()`. Es lógica falsa que habría que borrar después.
- **Sí:** filtros y pestaña del Salón en `searchParams`. Sobreviven al recargar y se pueden compartir.
- **No:** `useState` para filtros. Se pierde al recargar.
- **Sí:** sin estado de sesión. El login solo navega. La auth real es otra spec.
- **No:** usuario mock en contexto o fijo en datos. Introduce un estado que la spec de auth reemplazaría.
- **No:** persistir puntuaciones en `localStorage`. Nadie las lee todavía. "Guardar" es solo visual.
- **Sí:** Reproductor copiado tal cual de la plantilla. Es un placeholder hasta que existan los juegos reales.
- **Sí:** reutilizar las clases ya portadas en `app/globals.css` y usar Tailwind para todo lo nuevo. Fidelidad 1:1 sin reescribir 950 líneas de CSS.
- **No:** migrar todas las clases a utilidades Tailwind. Mucho trabajo y riesgo de diferencias visuales.
- **Sí:** componentes compartidos en `app/components/`.
- **Sí:** página 404 temática con `notFound()`.
- **Sí:** tags y dificultad del Detalle fijos como en la plantilla. No se añaden campos al modelo que nadie definió.

## Risks

| Riesgo                                                                                                        | Mitigación                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `cacheComponents: true` exige `<Suspense>` alrededor de lo que lee `searchParams`, y el build falla si falta. | Leer `node_modules/next/dist/docs/` sobre Cache Components antes del paso 4. Envolver filtros y resultados en `<Suspense>`. |
| `params` y `searchParams` son `Promise` en Next 16 y la plantilla no los usa.                                 | Usar los tipos globales `PageProps<"/juegos/[id]">` y hacer `await` según la documentación local.                           |
| Las clases de `globals.css` pueden no coincidir 100% con `styles.css` original.                               | El paso 10 compara pantalla a pantalla contra el HTML de referencia.                                                        |
| El timer del Reproductor sigue corriendo al salir de la página.                                               | Limpiar el `setInterval` en el cleanup del `useEffect`, como hace la plantilla.                                             |
| La plantilla usa `onClick` en `<a>` sin `href`.                                                               | Usar `next/link` con `href` real en todos los enlaces de navegación.                                                        |

## What is **not** in this spec

- Juegos reales (cada juego tendrá su propia spec).
- Autenticación, sesión y vistas de usuario logueado.
- Persistencia de puntuaciones.
- Base de datos o API.
- Créditos funcionales.
- Login social.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
