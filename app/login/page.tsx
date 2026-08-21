"use client";

import { FormEvent, useState } from "react";

function destinationFromSearch() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: form.get("login"), password: form.get("password") }),
    });

    if (response.ok) {
      window.location.assign(destinationFromSearch());
      return;
    }

    const data = await response.json().catch(() => null);
    setError(data?.message ?? "Não foi possível entrar. Tente novamente.");
    setIsSubmitting(false);
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <p className="login-eyebrow">Área restrita</p>
        <h1>Operador<br /><strong>Nota 1.000</strong></h1>
        <p className="login-intro">Informe o login e a senha para acessar a apresentação.</p>

        <label>
          Login
          <input name="login" autoComplete="username" required disabled={isSubmitting} />
        </label>
        <label>
          Senha
          <input name="password" type="password" autoComplete="current-password" required disabled={isSubmitting} />
        </label>
        {error && <p className="login-error" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Entrando..." : "Entrar"}</button>
      </form>
    </main>
  );
}
