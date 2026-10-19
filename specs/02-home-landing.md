# SPEC 02 — Home (landing page)

> **Status:** Implementado
> **Depends on:** SPEC 01
> **Date:** 2026-10-17
> **Objective:** Implementar en `/` la landing page de `references/templates/home-about/home.jsx` (hero, por qué Arcade Vault, juegos, stats, actividad, precios y CTA final) y mover la Biblioteca a `/juegos`.

## Por qué existe esta spec

El spec 01 dejó la Biblioteca como página de inicio. La plantilla `references/templates/home-about/` separa una landing de marketing ("Inicio") de la Biblioteca. Esta spec crea esa landing y desplaza la Biblioteca a `/juegos`, que ya es el prefijo de `/juegos/[id]`. Los datos de actividad se aíslan en `app/data/` como en el spec 01.

La carpeta de la plantilla también trae `about.jsx` (Acerca de + contacto). Queda fuera de esta spec.

## Scope

**In:**

- Pantalla **Home** (`/`) con seis bloques, en este orden:
    1. Hero: eyebrow "▸ INSERTA UNA MONEDA\_", título de tres líneas, subtítulo, CTAs "▶ EXPLORAR JUEGOS" y "✦ CREAR CUENTA", indicador "DESLIZA" y ocho siluetas pixel flotantes.
    2. `// 01 ¿POR QUÉ ARCADE VAULT?`: 4 tarjetas con icono pixel (JUEGOS CLÁSICOS, 100% GRATIS, LADDER BOARDS, SIEMPRE CRECIENDO).
    3. `// 02 JUEGOS DISPONIBLES AHORA`: riel con 6 mini-tarjetas y botón "VER TODOS LOS JUEGOS →".
    4. Banda de stats: "12+ JUEGOS", "MILES DE PARTIDAS", "GLOBAL RANKING".
    5. `// 03 ACTIVIDAD EN VIVO`: "ÚLTIMAS PUNTUACIONES" (7 filas) y "TOP JUGADORES · HOY" (5 filas con barra y enlace "VER SALÓN →").
    6. `// 04 PRECIOS`: tarjeta "JUGADOR VAULT $0 / SIEMPRE", tres preguntas frecuentes y CTA final "¿LISTO PARA JUGAR?".
- Animación `reveal` al entrar en pantalla (`IntersectionObserver`) en las secciones 2 a 6.
- Mover la Biblioteca de `/` a `/juegos` con sus filtros (`/juegos?q=&cat=`).
- Nav: nuevo enlace "Inicio" (`/`), "Biblioteca" pasa a `/juegos`, el logo sigue yendo a `/`. Panel móvil con los mismos enlaces.
- Capa de datos `app/data/activity.ts` con las últimas puntuaciones y el top del día.
- Estilos de `HOME PAGE`, `ACTIVITY` y `PRICING` de la plantilla portados a `app/globals.css`.

**Out of scope (para futuras specs):**

- Pantalla "Acerca de" y formulario de contacto (`about.jsx`).
- Enlace "Acerca de" en el Nav.
- Actividad en vivo real, puntuaciones reales o actualización periódica de los feeds.
- Estado de sesión en el Nav (`user`, `onSignOut`) que trae `nav.jsx`.
- Ajustar los textos de marketing al estado real del proyecto.
- Sistema de créditos funcional.
- Framework de tests.

## Modelo de datos

Un solo archivo nuevo. Reutiliza `AccentColor` de `app/data/games.ts`. Las pantallas solo consumen las funciones exportadas.

```ts
// app/data/activity.ts
import type {AccentColor} from "./games";

export type RecentScore = {
    player: string; // "NEONFOX"
    game: string; // "Caída" (texto libre, no es un id de juego)
    score: number; // 184220, se muestra "+184.220"
    ago: string; // "hace 2 min"
    color: AccentColor; // color del nombre del jugador
};

export type TopPlayer = {
    rank: number; // 1..5
    player: string; // "NEONFOX"
    score: number; // 312840
};

export async function getRecentScores(): Promise<RecentScore[]>; // 7 entradas
export async function getTopPlayers(): Promise<TopPlayer[]>; // 5 entradas
```

Convenciones:

- Las 7 y 5 entradas se copian tal cual de `home.jsx`, con los mismos valores y orden.
- Los números se formatean con `toLocaleString("es-ES")`, igual que en el spec 01.
- La preview de juegos usa `getGames()` y toma los 6 primeros. No se añaden campos a `Game`.
- Los textos de marketing (hero, features, stats, precios, FAQ) son literales en los componentes. No son datos.

## Rutas y archivos

| Ruta      | Archivo               | Origen                                           |
| --------- | --------------------- | ------------------------------------------------ |
| `/`       | `app/page.tsx`        | `home.jsx` (nuevo)                               |
| `/juegos` | `app/juegos/page.tsx` | antiguo `app/page.tsx` (Biblioteca, sin cambios) |

Componentes nuevos en `app/components/`:

- `FloatingSilhouettes.tsx`: las 8 siluetas SVG decorativas.
- `FeatureIcon.tsx`: iconos pixel `GAMEPAD`, `FREE`, `TROPHY`, `ROCKET`.
- `MiniCard.tsx`: mini-tarjeta que enlaza a `/juegos/[id]`.
- `Reveal.tsx` (cliente): envuelve una sección y añade la clase `in` al entrar en pantalla.

Componentes y archivos que cambian:

- `Nav.tsx`: enlace "Inicio" y lógica de enlace activo (`/` es Inicio, `/juegos` y `/juegos/**` son Biblioteca).
- `LibraryFilters.tsx`: `libraryHref` apunta a `/juegos`.
- `app/globals.css`: bloques portados.
- Enlaces "VOLVER AL VAULT" y equivalentes que hoy van a `/` y deben ir a `/juegos`: `app/juegos/[id]/page.tsx`, `app/salon-de-la-fama/page.tsx`, `app/components/GamePlayer.tsx`, `app/components/AuthForm.tsx` (botón invitado y envío del formulario).
- `app/not-found.tsx` mantiene su enlace a `/` (ahora el Home).

Destinos de los CTAs del Home:

| CTA                                         | Destino             |
| ------------------------------------------- | ------------------- |
| EXPLORAR JUEGOS, VER TODOS, INSERTAR MONEDA | `/juegos`           |
| CREAR CUENTA, EMPEZAR GRATIS                | `/login`            |
| VER SALÓN →                                 | `/salon-de-la-fama` |
| Mini-tarjeta                                | `/juegos/[id]`      |

## Implementation plan

1. **Estilos.** Copiar a `app/globals.css` los bloques `HOME PAGE`, `ACTIVITY (leaderboard + ticker)` y `PRICING` de `references/templates/home-about/styles.css`, junto con sus `@keyframes` (`float`, `bounce`, `tickin`, `pulse-led` si los usan). Omitir `ABOUT PAGE`, `GAMEPAD`, `Theme variants` y los duplicados de `fadeIn`/`slideIn`. Verificación: `npm run build` sin errores y la Biblioteca se ve igual.
2. **Datos.** Crear `app/data/activity.ts` con los tipos, los datos y las dos funciones async. Verificación: `npx tsc --noEmit` sin errores.
3. **Mover la Biblioteca.** `git mv app/page.tsx app/juegos/page.tsx`, cambiar `PageProps<"/">` a `PageProps<"/juegos">` y `libraryHref` a `/juegos`. Crear un `app/page.tsx` mínimo con el hero del Home (`FloatingSilhouettes` + título + CTAs). Actualizar los enlaces de "VOLVER AL VAULT" y de `AuthForm` a `/juegos`. Verificación: `/juegos?cat=PUZZLE` filtra y `/` muestra el hero.
4. **Nav.** Añadir "Inicio" en la barra y en el panel móvil, apuntar "Biblioteca" a `/juegos` y ajustar `sectionOf`. Verificación: en `/` está activo "Inicio", en `/juegos/caida` está activo "Biblioteca".
5. **Reveal + secciones 01 y 02.** Crear `Reveal.tsx`, `FeatureIcon.tsx` y `MiniCard.tsx`. Añadir "¿POR QUÉ ARCADE VAULT?" y "JUEGOS DISPONIBLES AHORA" (con `getGames()`, 6 primeros). Verificación: aparecen 4 tarjetas y 6 mini-tarjetas, y se animan al hacer scroll.
6. **Stats y actividad.** Añadir la banda de stats y "ACTIVIDAD EN VIVO" con `getRecentScores()` y `getTopPlayers()`. Verificación: 7 filas en el ticker, 5 en el top, y la primera fila tiene el estilo `top1`.
7. **Precios y CTA final.** Añadir la tarjeta de precios, las tres FAQ y "¿LISTO PARA JUGAR?". Verificación: el botón "EMPEZAR GRATIS →" navega a `/login`.
8. **Repaso visual.** Comparar `/` con `references/templates/home-about/arcade-vault-standalone.html` abierto en el navegador, a 1440px y a 375px. Corregir diferencias en `app/globals.css`. Usar Tailwind para cualquier estilo nuevo. Aplicar `/frontend-design` según `CLAUDE.md`.

## Acceptance criteria

- [ ] `npm run build` termina sin errores de TypeScript ni de Next.
- [ ] `npm run lint` termina sin errores.
- [ ] `/` y `/juegos` cargan sin errores en la consola del navegador.
- [ ] `/` muestra el hero con el título "EL ARCADE CLÁSICO ESTÁ DE VUELTA" y 8 siluetas decorativas.
- [ ] `/` muestra 4 tarjetas de features, 6 mini-tarjetas de juego, 3 bloques de stats, 7 filas de últimas puntuaciones, 5 filas de top jugadores y 3 preguntas frecuentes.
- [ ] Las 6 mini-tarjetas corresponden a los 6 primeros juegos de `getGames()`.
- [ ] Pulsar una mini-tarjeta navega a `/juegos/<id>` de ese juego.
- [ ] "▶ EXPLORAR JUEGOS", "VER TODOS LOS JUEGOS →" e "INSERTAR MONEDA →" navegan a `/juegos`.
- [ ] "✦ CREAR CUENTA" y "EMPEZAR GRATIS →" navegan a `/login`.
- [ ] "VER SALÓN →" navega a `/salon-de-la-fama`.
- [ ] Las secciones 2 a 6 empiezan ocultas y reciben la clase `in` al entrar en pantalla.
- [ ] `/juegos` muestra las 8 tarjetas y `/juegos?cat=SHOOTER` muestra exactamente INVASORES y ROCAS.
- [ ] Escribir "ser" en el buscador de `/juegos` deja solo SERPENTINA y la URL pasa a `/juegos?q=ser`.
- [ ] Recargar `/juegos?cat=PUZZLE` mantiene el filtro.
- [ ] "VOLVER AL VAULT" en Detalle, Reproductor y Salón navega a `/juegos`.
- [ ] El Nav muestra "Inicio", "Biblioteca" y "Salón de la Fama", y no muestra "Acerca de".
- [ ] "Inicio" está activo en `/`. "Biblioteca" está activo en `/juegos` y `/juegos/caida`.
- [ ] `/juegos/no-existe` muestra el 404 temático y su enlace lleva a `/`.
- [ ] A 375px de ancho no hay scroll horizontal en `/` y el menú hamburguesa sustituye a los enlaces.
- [ ] Ningún archivo bajo `app/` importa nada de `references/`.

## Decisions

- **Sí:** Home en `/` y Biblioteca en `/juegos`. Una landing en la raíz es lo esperable, y `/juegos` ya es el prefijo del Detalle.
- **No:** Home en `/inicio` con la Biblioteca en `/`. Deja la landing en una ruta secundaria.
- **Sí:** solo Home en esta spec. "Acerca de" es otra pantalla y mezclar dos hace crecer la spec.
- **No:** añadir "Acerca de" al Nav ahora. Llevaría a una página inexistente.
- **Sí:** feeds de actividad en `app/data/activity.ts` con funciones async. Misma convención del spec 01, y pasar a BD solo cambia el cuerpo de las funciones.
- **No:** arrays dentro del JSX como en la plantilla. Acopla la pantalla al mock.
- **Sí:** textos de marketing copiados tal cual, incluso donde no coinciden con el estado real ("12+ JUEGOS", "Arkanoid, Tetris, Snake…", "Guarda tus puntuaciones"). Es una landing con datos ficticios, igual que el resto del MVP.
- **No:** reescribir esos textos ahora. Habría que decidir cada uno y se pierde la fidelidad con la plantilla.
- **Sí:** CTAs de registro a `/login`. Es la única pantalla de cuenta que existe.
- **Sí:** "VOLVER AL VAULT", el botón invitado y el envío del login van a `/juegos`. "Vault" es la Biblioteca, no la landing.
- **Sí:** `Reveal.tsx` como único componente cliente nuevo. El resto del Home se renderiza en servidor.
- **No:** `useReveal()` global con `document.querySelectorAll` como la plantilla. En React se hace por componente.
- **Sí:** reutilizar las clases CSS de la plantilla en `globals.css` y Tailwind para lo nuevo, como en el spec 01.
- **Sí:** `next/link` con `href` real en todos los CTAs. La plantilla usa `onClick` con `navigate()`.
- **Sí:** la sección de nombre de juego del ticker es texto libre (`game: string`). Son strings de ejemplo, no una relación con `Game`.

## Risks

| Riesgo                                                                                                                       | Mitigación                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `.reveal` deja las secciones en `opacity: 0` hasta que corre JS, así que sin JS no se ven.                                   | Aceptado para el MVP. Si molesta, añadir `@media (prefers-reduced-motion: reduce)` que fuerce `opacity: 1` en `.reveal`.                         |
| `cacheComponents: true`: `getGames()` y los feeds async deben quedar en el shell estático o en `<Suspense>`.                 | Leer `node_modules/next/dist/docs/` sobre Cache Components antes del paso 5. Los datos son estáticos, así que no deberían requerir `<Suspense>`. |
| Mover `app/page.tsx` rompe enlaces y tests manuales que apuntaban a `/` como Biblioteca.                                     | El paso 3 actualiza todos los enlaces listados en "Rutas y archivos". Verificar con `grep` que no queda `href="/"` pensado para la Biblioteca.   |
| El `styles.css` de la plantilla trae más CSS que el del spec 01 (1744 vs 950 líneas) y puede pisar clases existentes.        | Copiar solo los tres bloques indicados y comparar con `git diff` que ninguna regla existente cambia.                                             |
| El overflow de las siluetas flotantes puede causar scroll horizontal en móvil.                                               | El hero ya usa `position: relative` con siluetas absolutas. Revisar a 375px en el paso 8 y añadir `overflow: hidden` si hace falta.              |
| `references/templates/home-about/` contiene una carpeta anidada `home-about/` duplicada y archivos `.DS_Store`/`.thumbnail`. | No importar nada de esa carpeta. Limpiar los duplicados fuera de esta spec.                                                                      |

## What is **not** in this spec

- Pantalla "Acerca de" y formulario de contacto.
- Enlace "Acerca de" en el Nav.
- Datos de actividad reales o en vivo.
- Estado de sesión y Nav con usuario.
- Corrección de los textos de marketing.
- Créditos funcionales.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
