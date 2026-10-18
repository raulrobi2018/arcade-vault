import type { Metadata } from "next";
import Link from "next/link";
import { ContinueCountdown } from "./components/ContinueCountdown";

export const metadata: Metadata = {
  title: "GAME OVER · 404 · Arcade Vault",
};

export default function NotFound() {
  return (
    <section className="fade-in mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center gap-8 px-4 py-16 text-center">
      {/* Misaligned-CRT chromatic split: cyan and magenta ghosts either side. */}
      <h1
        className="pixel m-0 text-[clamp(64px,18vw,140px)] leading-none text-ink [text-shadow:-4px_0_0_var(--cyan),4px_0_0_var(--magenta),0_0_24px_rgba(255,0,110,0.45)]"
        aria-label="Error 404"
      >
        404
      </h1>

      <div className="flex flex-col gap-4">
        <h2 className="pixel neon-magenta m-0 text-xl sm:text-2xl">
          GAME OVER
        </h2>
        <p className="m-0 text-ink-dim">
          Esta dirección no lleva a ningún juego. Puede que el enlace esté mal
          escrito o que el juego ya no esté en el vault.
        </p>
      </div>

      <ContinueCountdown />

      <Link href="/" className="btn lg">
        VOLVER A LA BIBLIOTECA
      </Link>
    </section>
  );
}
