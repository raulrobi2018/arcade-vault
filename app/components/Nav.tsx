"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Section = "inicio" | "biblioteca" | "salon" | "auth";

function sectionOf(pathname: string | null): Section | null {
  if (pathname === null) return null;
  if (pathname === "/") return "inicio";
  if (pathname.startsWith("/juegos")) return "biblioteca";
  if (pathname.startsWith("/salon-de-la-fama")) return "salon";
  if (pathname.startsWith("/login")) return "auth";
  return null;
}

// Reads the pathname to highlight the active link. Under cacheComponents
// usePathname can suspend, so the layout wraps this in <Suspense> with
// <NavBar pathname={null} /> as fallback.
export function Nav() {
  return <NavBar pathname={usePathname()} />;
}

export function NavBar({ pathname }: { pathname: string | null }) {
  const [open, setOpen] = useState(false);
  const active = sectionOf(pathname);
  const cls = (s: Section) => (active === s ? "active" : undefined);
  const close = () => setOpen(false);

  return (
    <>
      <nav className="av-nav">
        <Link href="/" className="logo" onClick={close}>
          <div className="logo-mark"></div>
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>
        <div className="links">
          <Link href="/" className={cls("inicio")}>
            Inicio
          </Link>
          <Link href="/juegos" className={cls("biblioteca")}>
            Biblioteca
          </Link>
          <Link href="/salon-de-la-fama" className={cls("salon")}>
            Salón de la Fama
          </Link>
        </div>
        <div className="spacer"></div>
        <div className="coin-counter">
          <span className="coin"></span>
          <span>CRÉDITOS · 03</span>
        </div>
        {/* Below 480px it doesn't fit next to the logo and the hamburger;
            the mobile panel already has the same link. */}
        <Link href="/login" className="btn auth-btn max-[480px]:hidden">
          Iniciar Sesión
        </Link>
        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
          aria-expanded={open}
        >
          ≡
        </button>
      </nav>

      <div
        className={"av-mobile-backdrop" + (open ? " open" : "")}
        onClick={close}
      ></div>
      <aside className={"av-mobile-panel" + (open ? " open" : "")}>
        <div className="pixel neon-cyan mb-4 text-[11px]">MENÚ</div>
        <Link href="/" className={cls("inicio")} onClick={close}>
          Inicio
        </Link>
        <Link href="/juegos" className={cls("biblioteca")} onClick={close}>
          Biblioteca
        </Link>
        <Link href="/salon-de-la-fama" className={cls("salon")} onClick={close}>
          Salón de la Fama
        </Link>
        <Link href="/login" className={cls("auth")} onClick={close}>
          Iniciar Sesión
        </Link>
        <div className="flex-1"></div>
        <div className="pixel text-[9px] tracking-[0.16em] text-ink-faint">
          CRÉDITOS · 03
        </div>
      </aside>
    </>
  );
}
