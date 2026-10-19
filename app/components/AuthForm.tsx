"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Tab = "in" | "up";

// Visual only: no session is created. Submitting just returns to the library;
// real authentication goes in its own spec.
export function AuthForm() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("in");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/juegos");
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <div className="mark"></div>
        <h2 className="neon-cyan">ARCADE VAULT</h2>
        <div className="mono mt-1.5 text-[11px] tracking-[0.16em] text-ink-faint">
          ACCESO AL SISTEMA · v2.6
        </div>
      </div>

      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "in"}
          className={tab === "in" ? "on" : ""}
          onClick={() => setTab("in")}
        >
          INICIAR SESIÓN
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "up"}
          className={tab === "up" ? "on" : ""}
          onClick={() => setTab("up")}
        >
          CREAR CUENTA
        </button>
      </div>

      <form onSubmit={submit}>
        <div className="field">
          <label htmlFor="auth-user">Usuario</label>
          <input
            id="auth-user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="px_kai"
            autoComplete="username"
          />
        </div>
        {tab === "up" && (
          <div className="field slide-in">
            <label htmlFor="auth-email">Correo electrónico</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jugador@vault.gg"
              autoComplete="email"
            />
          </div>
        )}
        <div className="field">
          <label htmlFor="auth-pass">Contraseña</label>
          <input
            id="auth-pass"
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            placeholder="••••••••"
            autoComplete={tab === "in" ? "current-password" : "new-password"}
          />
        </div>

        <button className="btn lg mt-2 w-full" type="submit">
          {tab === "in" ? "ENTRAR AL VAULT" : "CREAR Y JUGAR"}
        </button>
      </form>

      <Link href="/juegos" className="btn ghost mt-2.5 w-full">
        JUGAR COMO INVITADO
      </Link>

      <div className="auth-divider">O CONTINÚA CON</div>
      <div className="social">
        <button className="btn ghost" type="button">
          ◆ GOOGLE
        </button>
        <button className="btn ghost" type="button">
          ▣ GITHUB
        </button>
      </div>

      <div className="mt-[18px] text-center text-[11px] tracking-[0.1em] text-ink-faint">
        AL ENTRAR ACEPTAS LOS TÉRMINOS DEL SALÓN ARCADE
      </div>
    </div>
  );
}
