# SPEC 03 — Integración base con Supabase

> **Status:** Aprobado
> **Depends on:** SPEC 01
> **Date:** 2026-10-20
> **Objective:** Conectar la aplicación Next.js al proyecto Supabase existente con los clientes de servidor y de navegador, variables de entorno documentadas y una ruta de salud que confirme que la conexión funciona, sin crear tablas ni cambiar ninguna pantalla.

## Por qué existe esta spec

El proyecto Supabase ya existe (conectado por MCP en `.mcp.json`, ref `nexbqbujlmjybjotznsc`) pero la app no lo usa: `package.json` no tiene dependencias de Supabase, `.env.local` solo contiene `SUPABASE_DB_PASSWORD` y la base de datos tiene 0 tablas. Las specs 01 y 02 dejaron los datos en `app/data/` con funciones async pensadas para ser sustituidas por una BD.

Esta spec prepara solo el cableado. El esquema, la migración de los datos ficticios, la escritura de puntuaciones y la autenticación son specs posteriores y dependen de esta.

## Scope

**In:**

- Instalar `@supabase/supabase-js` y `@supabase/ssr`.
- Cliente de servidor en `app/lib/supabase/server.ts` y cliente de navegador en `app/lib/supabase/client.ts`.
- Variables de entorno `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` en `.env.local` (valores obtenidos con el MCP) y documentadas en `.env.example`.
- Ajustar `.gitignore` para que `.env.example` sí se versione.
- Ruta de salud `GET /api/health/supabase` que hace una llamada ligera a Supabase y devuelve el resultado.

**Out of scope (para futuras specs):**

- Crear tablas, migraciones, seed o políticas RLS (no hay tablas en esta spec).
- Sustituir el cuerpo de las funciones de `app/data/` por consultas a Supabase.
- Guardar puntuaciones reales (botón "GUARDAR PUNTUACIÓN").
- Autenticación con Supabase Auth, `proxy.ts` para refrescar la sesión y estado de sesión en el Nav.
- Tipos generados de la base de datos (`generate_typescript_types`).
- Service role key y cualquier clave secreta en la app.
- Framework de tests.

## Modelo de datos

Esta feature no introduce datos nuevos. No se crean tablas ni tipos. La única estructura nueva es la respuesta de la ruta de salud:

```ts
// GET /api/health/supabase
type HealthResponse = { ok: true } | { ok: false; error: string };
```

- Respuesta correcta: HTTP 200 con `{ ok: true }`.
- Fallo de conexión o credenciales: HTTP 503 con `{ ok: false, error }`. `error` es un mensaje corto y nunca incluye claves ni la URL completa.

## Rutas y archivos

| Archivo                            | Acción | Descripción                                                                                                 |
| ---------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------- |
| `package.json`                     | cambia | Añade `@supabase/supabase-js` y `@supabase/ssr`.                                                            |
| `app/lib/supabase/server.ts`       | nuevo  | `createClient()` async para Server Components, route handlers y actions, con `cookies()` de `next/headers`. |
| `app/lib/supabase/client.ts`       | nuevo  | `createClient()` para Client Components con `createBrowserClient`.                                          |
| `app/api/health/supabase/route.ts` | nuevo  | Route handler de salud.                                                                                     |
| `.env.local`                       | cambia | Añade las dos variables públicas. Mantiene `SUPABASE_DB_PASSWORD`.                                          |
| `.env.example`                     | nuevo  | Nombres de variables sin valores.                                                                           |
| `.gitignore`                       | cambia | Añade `!.env.example` tras `.env*`.                                                                         |

Convenciones:

- Los dos clientes usan solo la publishable key. Ningún archivo bajo `app/` referencia `SUPABASE_DB_PASSWORD` ni una service role key.
- `server.ts` es el único punto de acceso desde servidor y `client.ts` el único desde navegador. Las futuras specs importan de ahí.
- Si falta alguna variable de entorno, los clientes lanzan un error explícito con el nombre de la variable que falta.

## Implementation plan

1. **Dependencias.** `npm install @supabase/supabase-js @supabase/ssr`. Verificación: ambas aparecen en `package.json` y `npm run build` sigue pasando.
2. **Variables de entorno.** Obtener la URL y la publishable key con el MCP (`get_project_url` y `get_publishable_keys`), añadirlas a `.env.local`, crear `.env.example` con `NEXT_PUBLIC_SUPABASE_URL=` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=`, y añadir `!.env.example` a `.gitignore`. Verificación: `git status` muestra `.env.example` como nuevo y no muestra `.env.local`.
3. **Clientes.** Leer en `node_modules/next/dist/docs/` lo relativo a `cookies()` y a Cache Components. Crear `app/lib/supabase/server.ts` y `app/lib/supabase/client.ts`. Verificación: `npx tsc --noEmit` sin errores.
4. **Ruta de salud.** Crear `app/api/health/supabase/route.ts`, que usa el cliente de servidor para hacer una llamada ligera y devuelve `HealthResponse`. Verificación: `curl http://localhost:3000/api/health/supabase` devuelve `{"ok":true}`.
5. **Verificación final.** Ejecutar `npm run build` y `npm run lint`. Comprobar con una variable vacía que la ruta de salud devuelve 503 sin filtrar secretos y restaurarla. Confirmar que las cinco pantallas de la spec 01 y el Home siguen cargando igual.

## Acceptance criteria

- [ ] `@supabase/supabase-js` y `@supabase/ssr` están en `dependencies` de `package.json`.
- [ ] `npm run build` termina sin errores de TypeScript ni de Next.
- [ ] `npm run lint` termina sin errores.
- [ ] `GET /api/health/supabase` devuelve HTTP 200 y `{"ok":true}` con las variables correctas.
- [ ] Con `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` vacía o inválida, la ruta devuelve HTTP 503 y `{"ok":false,...}` sin mostrar ninguna clave en el cuerpo.
- [ ] `.env.example` existe, está versionado y contiene los dos nombres de variable sin valores.
- [ ] `.env.local` no aparece en `git status` ni en `git ls-files`.
- [ ] `app/lib/supabase/client.ts` solo se puede importar desde Client Components y `server.ts` solo desde servidor (no importa nada de `react` ni del navegador).
- [ ] Ningún archivo bajo `app/` contiene `SUPABASE_DB_PASSWORD` ni una service role key.
- [ ] `list_tables` del MCP sigue devolviendo 0 tablas en `public`.
- [ ] `/`, `/juegos`, `/juegos/caida`, `/juegos/caida/jugar`, `/login` y `/salon-de-la-fama` cargan sin errores en la consola y se ven igual que antes.
- [ ] Ningún archivo de `app/data/` fue modificado.

## Decisions

- **Sí:** esta spec solo cubre la integración. Datos, esquema y Auth son specs aparte; juntar todo tocaría más de tres áreas.
- **No:** crear tablas, migraciones ni seed aquí. Decisión explícita del usuario.
- **Sí:** clientes de servidor y de navegador desde el inicio. Las specs de datos (servidor) y de Auth (navegador) los necesitarán y crearlos ahora evita tocar cableado después.
- **No:** `proxy.ts` ahora. Solo refresca la sesión de Auth, y sin Auth no aporta nada.
- **Sí:** publishable key con nombre `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Es segura en el navegador siempre que las tablas futuras tengan RLS activo.
- **No:** service role key. Se salta RLS y no hace falta para leer datos públicos ni para Auth.
- **Sí:** `.env.example` versionado con `!.env.example` en `.gitignore`. Documenta qué variables hacen falta sin exponer valores.
- **Sí:** ruta de salud `/api/health/supabase` como criterio de aceptación. Es la única forma de verificar la conexión sin tablas, y es fácil de borrar.
- **No:** script con `tsx`. Añade una dependencia solo para verificar.
- **Sí:** clientes bajo `app/lib/supabase/`. Sigue la convención de código bajo `app/` de las specs 01 y 02, y el alias `@/*` apunta a la raíz del repo.
- **Sí:** `app/data/` queda intacto. Sustituir su cuerpo por consultas es la primera spec de datos.

## Risks

| Riesgo                                                                                                                        | Mitigación                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cacheComponents: true` y `cookies()` en `server.ts`: acceder a datos de request fuera de `<Suspense>` puede romper el build. | Leer `node_modules/next/dist/docs/` antes del paso 3. La ruta de salud es un route handler, que no se prerenderiza como una página.                                                                                                 |
| Sin tablas, una llamada ligera podría no distinguir "credenciales válidas" de "URL válida con clave errónea".                 | Elegir una llamada que exija una clave válida (p. ej. `auth.getSession` no basta; probar una consulta REST a una tabla inexistente y distinguir un 404 de tabla de un 401 de clave). Confirmar el comportamiento durante el paso 4. |
| Una clave publishable en el navegador es pública, y futuras tablas sin RLS quedarían expuestas.                               | Fuera de esta spec (no hay tablas). Las specs de esquema exigen RLS activo en cada tabla y se verifican con `get_advisors`.                                                                                                         |
| `.env*` en `.gitignore` oculta `.env.example` y los nuevos colaboradores no sabrían qué variables faltan.                     | El paso 2 añade `!.env.example` y verifica con `git status`.                                                                                                                                                                        |
| Hacer commit de `SUPABASE_DB_PASSWORD` o de otras claves por accidente.                                                       | `.env.local` sigue ignorado. El criterio de aceptación comprueba `git ls-files` y busca la contraseña en `app/`.                                                                                                                    |

## What is **not** in this spec

- Tablas, migraciones, seed y políticas RLS.
- Sustitución de `app/data/` por consultas reales.
- Guardado de puntuaciones.
- Autenticación, `proxy.ts` y estado de sesión.
- Tipos generados de la base de datos.
- Tests automatizados.

Cada uno de estos, si llega, va en su propia spec.
