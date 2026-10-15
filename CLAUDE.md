# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

Arcade Vault is an online platform for playing games and competing for the highest score. It is currently a fresh `create-next-app` scaffold (only `app/layout.tsx` and `app/page.tsx`), so most features have yet to be built.

The project follows **Spec Driven Design** using the `/spec` and `/spec-impl` skills from [Klerith/fernando-skills](https://github.com/Klerith/fernando-skills) (installed with `npx skills@latest add Klerith/fernando-skills`). Write a spec with `/spec` before implementing a feature, then implement it with `/spec-impl`.

No test framework is set up yet.

## Stack and configuration notes

- **Next.js 16.4 / React 19.3, App Router only** (`app/`). As AGENTS.md says, APIs differ from older Next.js versions. Check `node_modules/next/dist/docs/` (`01-app/`, `03-architecture/`, …) before using any Next.js API.
- `next.config.ts` enables `cacheComponents: true` (Cache Components / `"use cache"` model instead of the older route segment config), `partialPrefetching`, and `experimental.agentFeedback`. Read the relevant docs before you add data fetching or caching.
- **Tailwind CSS v4** is wired in through a Turbopack loader rule (`@tailwindcss/turbopack` in `next.config.ts`), not PostCSS. There is no `postcss.config` or `tailwind.config`. Theme tokens are defined in `app/globals.css` via `@import "tailwindcss"` and `@theme inline` (CSS variables `--background`/`--foreground`, plus the Geist fonts from `next/font`).
- Route props use Next's globally generated types (e.g. `LayoutProps<"/">` in `app/layout.tsx`); they come from `.next/types` after `next dev` or `next build`.
- The path alias `@/*` maps to the repo root.

## Styles

Usa siempre /frontend-design para diseñar la interfaz de usuario
