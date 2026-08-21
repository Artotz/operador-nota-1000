"use client";

import { useState } from "react";

export function LogoutButton() {
  const [isLeaving, setIsLeaving] = useState(false);

  async function logout() {
    setIsLeaving(true);
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  return <button className="logout-button" type="button" onClick={logout} disabled={isLeaving}>{isLeaving ? "Saindo..." : "Sair"}</button>;
}
