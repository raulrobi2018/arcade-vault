# SPEC 04 — Juego Asteroids

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-20
> **Objective:** Portar a TypeScript el juego Asteroids de `references/started-games/02-asteroids/` y montarlo en `/juegos/asteroids/jugar` dentro del marco CRT y el HUD de la plataforma, renombrando la entrada ROCAS del catálogo a ASTEROIDS.

## Por qué existe esta spec

El reproductor del spec 01 (`GamePlayer.tsx`) es un placeholder: el score sube con un temporizador y la "arena" es decoración CSS. `references/started-games/02-asteroids/` trae un Asteroids completo en canvas, un solo `game.js` con globals que lee `document.getElementById("canvas")` y escucha `window`, pensado para abrirse como página suelta. No sirve tal cual en React: no se puede desmontar, no se puede pausar desde fuera y no comunica puntuación, vidas ni nivel.

Esta spec convierte el juego en un módulo montable y conecta su estado al HUD, la pausa y el modal de fin de partida que ya existen. Es el primer juego real; los demás (Tetris, Arkanoid, etc.) seguirán con el placeholder hasta sus propias specs.

## Scope

**In:**

- Port a TypeScript del motor de `game.js` a `app/games/asteroids/`, con la misma física, constantes, puntos (20/50/100), 3 vidas, invencibilidad al reaparecer, partículas y power-up `3x` (triple disparo).
- API del motor sin globals ni `document`: se le pasa un `<canvas>` y callbacks, devuelve un handle con `pause`, `resume` y `destroy`.
- Componente cliente `AsteroidsArena` que monta el motor en un `<canvas width=800 height=600>` escalado al `.crt-screen` (4:3) y lo limpia al desmontar.
- `GamePlayer` muestra `AsteroidsArena` en lugar de la arena decorativa cuando `game.id === "asteroids"`, y alimenta su HUD (puntuación, vidas, nivel) con el estado real.
- Botones PAUSA, FIN y JUGAR DE NUEVO controlan el juego real. El modal FIN DEL JUEGO muestra la puntuación real.
- Renombrar la entrada `rocas` a `asteroids` (id y título) en `app/data/games.ts`, `app/data/scores.ts` y `app/data/activity.ts`.
- Controles de teclado: `←` `→` rotar, `↑` propulsar, `Espacio` disparar.

**Out of scope (para futuras specs):**

- Guardar la puntuación en Supabase (GUARDAR PUNTUACIÓN sigue siendo visual).
- Controles táctiles o gamepad.
- Sonido, OVNIs, hiperespacio o cualquier mecánica que el juego original no tenga.
- Portar Tetris (`03-tetris`) y Arkanoid (`04-arkanoid`) o hacer un registro genérico de juegos.
- Recolorear el canvas con la paleta neón: se mantiene el estilo vectorial blanco original.
- Reescribir la descripción de la tarjeta del juego más allá del renombrado.
- Framework de tests.

## Modelo de datos

Los datos del juego no se persisten. Estructuras nuevas, todas en memoria:

```ts
// app/games/asteroids/engine.ts
export type AsteroidsStats = {
    score: number;
    lives: number; // 0..3
    level: number; // 1..
};

export type AsteroidsCallbacks = {
    onStats: (stats: AsteroidsStats) => void; // solo cuando algún valor cambia
    onGameOver: (finalScore: number) => void; // una vez por partida, al perder la última vida
};

export type AsteroidsHandle = {
    pause: () => void;
    resume: () => void;
    destroy: () => void; // detiene rAF y quita listeners
};

export function createAsteroids(
    canvas: HTMLCanvasElement,
    callbacks: AsteroidsCallbacks,
): AsteroidsHandle;
```

Cambios en datos existentes (solo literales, sin cambiar tipos):

| Archivo                | Cambio                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `app/data/games.ts`    | `id: "rocas"` → `"asteroids"`, `title: "ROCAS"` → `"ASTEROIDS"`. `cover: "cover-rocas"` se mantiene. |
| `app/data/scores.ts`   | Clave `rocas` → `asteroids`. Valores intactos.                                                       |
| `app/data/activity.ts` | `game: "Rocas"` → `"Asteroids"`.                                                                     |

Convenciones:

- El canvas es siempre 800×600 lógico (`W`, `H`). El tamaño visible lo da el CSS (`width: 100%; height: 100%` dentro de `.crt-screen`, que ya es 4:3).
- El motor no dibuja HUD ni GAME OVER. Sí dibuja el indicador `3x  4.2s` del power-up, porque el HUD de la plataforma no tiene hueco para él.
- `onStats` se dispara al iniciar y cuando cambian `score`, `lives` o `level`, no en cada frame.

## Rutas y archivos

| Archivo                             | Acción | Descripción                                                                                                                                              |
| ----------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/games/asteroids/engine.ts`     | nuevo  | `createAsteroids`, bucle `requestAnimationFrame`, estado, update y draw. Importa las entidades.                                                          |
| `app/games/asteroids/entities.ts`   | nuevo  | Clases `Bullet`, `Asteroid`, `PowerUp`, `Ship`, `Particle` tipadas, y constantes. Reciben el `ctx` en `draw(ctx)`.                                       |
| `app/games/asteroids/input.ts`      | nuevo  | `keys` y `justPressed` por instancia, listeners de `keydown`/`keyup`/`blur` en `window`, `preventDefault` en teclas del juego.                           |
| `app/components/AsteroidsArena.tsx` | nuevo  | Client Component. Crea y destruye el motor con `useEffect`; recibe `paused`, `runId`, `onStats`, `onGameOver`.                                           |
| `app/components/GamePlayer.tsx`     | cambia | Estado de `lives` y `level` real, `runId` para reiniciar, `AsteroidsArena` cuando `game.id === "asteroids"`. El placeholder queda para los demás juegos. |
| `app/data/games.ts`                 | cambia | Renombrado de la entrada.                                                                                                                                |
| `app/data/scores.ts`                | cambia | Renombrado de la clave.                                                                                                                                  |
| `app/data/activity.ts`              | cambia | Renombrado del texto.                                                                                                                                    |

Convenciones:

- `app/games/asteroids/` no importa nada de `react`, `next` ni de `references/`. Solo usa APIs del navegador (`CanvasRenderingContext2D`, `window`, `requestAnimationFrame`, `performance`).
- `references/started-games/02-asteroids/` no se modifica.
- Ruta de juego: `/juegos/asteroids` (detalle) y `/juegos/asteroids/jugar` (reproductor). `generateStaticParams` ya las genera desde `getGames()`.

## Implementation plan

1. **Renombrado.** Cambiar id y título en `games.ts`, la clave en `scores.ts` y el texto en `activity.ts`. Verificación: `npx tsc --noEmit` sin errores, `/juegos/asteroids` carga con el título ASTEROIDS, `/juegos/rocas` da el 404 temático y `/juegos?cat=SHOOTER` muestra INVASORES y ASTEROIDS.
2. **Entidades.** Crear `entities.ts` portando `Bullet`, `Asteroid`, `PowerUp`, `Ship` y `Particle` con tipos y constantes idénticos, sustituyendo `ctx` y `keys` globales por parámetros (`draw(ctx)`, `update(dt, input)`). Verificación: `npx tsc --noEmit` sin errores.
3. **Entrada.** Crear `input.ts` con `createInput()` que devuelve `{ keys, pressed(code), destroy() }`. Ignora eventos cuyo `target` sea `input` o `textarea`. Hace `preventDefault` en `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` y `Space` (en `keydown` y `keyup`). Limpia `keys` en `blur` de la ventana. Verificación: `npx tsc --noEmit` sin errores.
4. **Motor.** Crear `engine.ts` con `createAsteroids`: estado local (`ship`, `bullets`, `asteroids`, `particles`, `powerUps`, `score`, `lives`, `level`), `update`/`draw` del original, `dt` limitado a 50 ms, sin HUD ni GAME OVER en el canvas, `onStats` al cambiar valores, `onGameOver` una sola vez, `pause`/`resume` que congelan `update` y reinician `lastTime`, `destroy` que cancela rAF y quita listeners. Al perder la última vida el bucle sigue dibujando partículas pero no acepta disparo ni reinicio por `Espacio`. Verificación: `npx tsc --noEmit` y `npm run lint` sin errores.
5. **Componente de arena.** Crear `AsteroidsArena.tsx`: `<canvas width={800} height={600}>` con `className="absolute inset-0 h-full w-full"` dentro de `.crt-screen`, `useEffect` que llama a `createAsteroids` y devuelve `destroy`, otro efecto que aplica `pause`/`resume` según `paused`. Cambiar `runId` recrea el motor. Verificación: abrir `/juegos/asteroids/jugar` con el componente montado a mano muestra la nave parpadeando y asteroides moviéndose.
6. **Conexión con `GamePlayer`.** Sustituir `lives` constante y `level` calculado por estado alimentado por `onStats`. Renderizar `AsteroidsArena` solo para `asteroids`. `onGameOver` llama a `setOver(true)` y fija la puntuación final. `FIN` pone `over` y detiene el juego. `restart` incrementa `runId`, resetea `saved` y `over`. Para los demás juegos el comportamiento no cambia. Verificación: jugar una partida completa, ver puntuación, vidas y nivel reales en el HUD, y el modal con la puntuación final al perder la tercera vida.
7. **Repaso de teclado y foco.** Comprobar que `Espacio` y las flechas no hacen scroll, que escribir en el input del modal funciona (incluida la barra espaciadora), que tras pulsar PAUSA con el ratón y REANUDAR, `Espacio` dispara y no reactiva el botón, y que al salir a `/juegos/asteroids` y volver no quedan listeners duplicados. Aplicar `/frontend-design` si hace falta ajustar el marco según `CLAUDE.md`.
8. **Verificación final.** `npm run build`, `npm run lint`, y recorrer a mano los criterios de aceptación, incluido el juego a 375 px de ancho (se ve entero, sin scroll horizontal).

## Acceptance criteria

- [ ] `npm run build` termina sin errores de TypeScript ni de Next.
- [ ] `npm run lint` termina sin errores.
- [ ] `/juegos/asteroids` muestra el detalle con el título ASTEROIDS y "JUGAR" lleva a `/juegos/asteroids/jugar`.
- [ ] `/juegos/rocas` y `/juegos/rocas/jugar` muestran el 404 temático.
- [ ] `/juegos?cat=SHOOTER` muestra exactamente INVASORES y ASTEROIDS, y buscar "aster" en `/juegos` deja solo ASTEROIDS.
- [ ] En `/juegos/asteroids/jugar` aparece un canvas 800×600 dentro de `.crt-screen` sin deformarse y sin barras de scroll.
- [ ] La nave empieza en el centro con 3 vidas, parpadea unos 3 s y 4 asteroides grandes aparecen a más de 130 px del centro.
- [ ] `←` `→` rotan, `↑` propulsa con llama y `Espacio` dispara, con 0,2 s de cooldown entre disparos.
- [ ] Destruir un asteroide grande, mediano y pequeño suma 20, 50 y 100 puntos, y los grandes y medianos se parten en dos del tamaño inferior.
- [ ] El HUD de la plataforma muestra la puntuación, las vidas (♥) y el nivel reales, y se actualizan sin recargar.
- [ ] Al limpiar todos los asteroides sube el nivel y aparecen `3 + nivel` asteroides.
- [ ] Al chocar con la nave sin invencibilidad se pierde una vida y la nave reaparece a los 2 s en el centro.
- [ ] El power-up `3x` aparece, se recoge al tocarlo, dispara 3 balas abiertas durante 5 s y el canvas muestra el temporizador.
- [ ] Al perder la tercera vida aparece el modal FIN DEL JUEGO con la puntuación real y el canvas no dibuja su propio "GAME OVER".
- [ ] "FIN" termina la partida y muestra el modal con la puntuación actual.
- [ ] "PAUSA" congela asteroides, balas y temporizadores, y "REANUDAR" continúa sin salto brusco.
- [ ] "JUGAR DE NUEVO" arranca una partida nueva con 0 puntos, 3 vidas y nivel 1.
- [ ] Con el modal abierto se puede escribir en el campo de iniciales, incluidos espacios, y `Espacio` no dispara.
- [ ] `Espacio` y las flechas no hacen scroll de la página mientras se juega.
- [ ] Al salir de la página (SALIR, VOLVER AL VAULT o navegación) el bucle se detiene y no quedan listeners de teclado del juego (comprobar que una pulsación posterior no hace `preventDefault`).
- [ ] Cambiar de pestaña y volver no deja una tecla pulsada ni causa un salto de `dt`.
- [ ] El resto de juegos (por ejemplo `/juegos/caida/jugar`) siguen mostrando el placeholder y su HUD funciona como antes.
- [ ] A 375 px de ancho el canvas se ve entero y no hay scroll horizontal.
- [ ] Ningún archivo bajo `app/` importa nada de `references/`, y `references/started-games/02-asteroids/` no cambió (`git status`).
- [ ] No quedan referencias a `rocas` o `ROCAS` en `app/` salvo la clase CSS `cover-rocas`.

## Decisions

- **Sí:** port a TypeScript con una función `createAsteroids(canvas, callbacks)`. Permite montar, pausar y destruir desde React y comunicar el estado al HUD.
- **No:** `iframe` con el HTML original. No se comunica con la pausa, el HUD ni el modal.
- **No:** cargar `game.js` con `next/script`. Usa globals y `document.getElementById`, y se duplicaría con el doble montaje de React en desarrollo.
- **Sí:** renombrar la entrada ROCAS a ASTEROIDS (id y título). El juego se llama Asteroids y no tiene sentido mantener dos entradas ni una URL desalineada. Decisión explícita del usuario.
- **No:** mantener `rocas` como alias o redirección. La app aún no tiene enlaces externos y el 404 es aceptable.
- **Sí:** mantener la clase CSS `cover-rocas`. Es un nombre interno de la portada y cambiarla solo añade ruido.
- **Sí:** HUD, pausa, FIN y modal de la plataforma. Es la experiencia que ya definió el spec 01 y mantiene los juegos consistentes.
- **No:** HUD propio dibujado en el canvas. Duplicaría información.
- **Sí:** el indicador del power-up `3x` se dibuja en el canvas. El HUD de la plataforma no tiene espacio para él y es información de juego.
- **Sí:** estilo vectorial blanco original. El marco CRT ya aporta el neón y se conserva la fidelidad con el juego.
- **Sí:** conservar el power-up `3x` aunque el README no lo mencione. Está en `game.js` y es parte del juego.
- **Sí:** teclado y pausa de la plataforma. Controles táctiles abren otra área de UI.
- **Sí:** mostrar la puntuación real en el modal y dejar GUARDAR PUNTUACIÓN como visual. Persistir toca Supabase, tablas y RLS y va en su spec.
- **Sí:** el reinicio solo desde el modal (JUGAR DE NUEVO), no con `Espacio` como en el original. El modal es la UI de plataforma y `Espacio` no debe disparar con el modal abierto.
- **Sí:** `GamePlayer` decide por `game.id === "asteroids"` en lugar de crear un registro genérico. Con un solo juego real un registro sería abstracción prematura; se introduce con el segundo juego.
- **Sí:** estado del juego dentro del motor y no en React. El motor corre a 60 fps y solo notifica cuando cambian score, vidas o nivel, para evitar re-render por frame.

## Risks

| Riesgo                                                                                                                                          | Mitigación                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| React Strict Mode monta, desmonta y vuelve a montar el efecto en desarrollo, y puede dejar dos bucles o listeners duplicados.                   | `destroy()` cancela rAF y quita listeners; el efecto lo devuelve como cleanup. Verificar en `next dev` que solo hay un bucle (una sola nave, velocidad normal).               |
| `Espacio` activa el botón con foco (PAUSA/REANUDAR) y dispara a la vez.                                                                         | `input.ts` hace `preventDefault` en `keydown` y `keyup` de `Space`, salvo en `input`/`textarea`. Verificar en el paso 7 y, si no basta, hacer `blur()` al botón tras el clic. |
| `preventDefault` global en `Espacio` rompe la escritura del campo de iniciales o de otros inputs de la página.                                  | El filtro por `target` ignora `input` y `textarea`, y el motor se destruye al terminar la partida.                                                                            |
| `requestAnimationFrame` corre con la pestaña oculta o `dt` enorme al volver.                                                                    | `dt` limitado a 50 ms, como en el original, y limpieza de `keys` en `blur`.                                                                                                   |
| El canvas se ve borroso en pantallas HiDPI al escalar 800×600 a un `.crt-screen` más grande.                                                    | Aceptado en el MVP (trazos vectoriales de 1,5 px se ven bien). Si molesta, escalar con `devicePixelRatio` en una spec posterior.                                              |
| `cacheComponents: true`: un Client Component con canvas no accede a datos de request, pero la página `jugar` usa `params` dentro de `Suspense`. | No se cambia la estructura de la página; `AsteroidsArena` solo recibe props serializables. Leer `node_modules/next/dist/docs/` sobre Client Components antes del paso 5.      |
| Renombrar `rocas` rompe tests manuales o enlaces que apuntaban a `/juegos/rocas`.                                                               | `grep` en `app/` de `rocas` tras el paso 1. Las specs 01 y 02 conservan el nombre histórico y no se editan.                                                                   |
| En móvil no hay controles, así que el juego es injugable sin teclado.                                                                           | Aceptado y fuera de alcance. El canvas se ve, pero los controles táctiles son una spec aparte.                                                                                |

## What is **not** in this spec

- Guardado de puntuaciones en Supabase.
- Controles táctiles, gamepad o sonido.
- OVNIs u otras mecánicas nuevas.
- Portar Tetris y Arkanoid, o un registro genérico de juegos.
- Recolorear el canvas con la paleta neón.
- Escalado HiDPI del canvas.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
