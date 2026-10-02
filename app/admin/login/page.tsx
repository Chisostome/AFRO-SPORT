"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const notAdmin = searchParams.get("error") === "not-admin";
  const next = searchParams.get("next") || "/admin";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("Barua pepe au nenosiri si sahihi.");
      setLoading(false);
      return;
    }

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setError("Imeshindikana kuthibitisha akaunti yako.");
      setLoading(false);
      return;
    }

    const { data: role, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (
      roleError ||
      (role?.role !== "admin" && role?.role !== "super_admin")
    ) {
      await supabase.auth.signOut();
      setError("Akaunti hii haina ruhusa ya Admin.");
      setLoading(false);
      return;
    }

    if (!remember) {
      // Supabase manages the authenticated session cookie. This checkbox
      // is intentionally informational until we add an explicit session policy.
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <main className="shell">
      <div className="page">
        <div className="login-card">
          <div className="eyebrow">AFRO SPORT</div>
          <h1>Ingia kwenye Admin</h1>
          <p className="lead">
            Simamia ligi, timu, wachezaji, mechi, matokeo na habari.
          </p>

          {notAdmin && (
            <div className="notice error">
              Akaunti yako imeingia lakini haina ruhusa ya Admin.
            </div>
          )}

          {error && <div className="notice error">{error}</div>}

          <form className="form-grid" onSubmit={submit}>
            <input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Barua pepe"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Nenosiri"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#a8bbb0",
              }}
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Nikumbuke
            </label>

            <button className="primary" type="submit" disabled={loading}>
              {loading ? "Inaingia..." : "INGIA"}
            </button>
          </form>

          <p style={{ marginTop: 20, color: "#789187", fontSize: 13 }}>
            Hii ni sehemu salama ya usimamizi wa AFRO SPORT.
          </p>
        </div>
      </div>
    </main>
  );
}
