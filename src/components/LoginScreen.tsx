"use client";

import { useState, type FormEvent } from "react";
import CakeLogo from "@/components/CakeLogo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "@/lib/auth";
import { cakeStrings as s } from "@/lib/strings";

/**
 * Full-screen login gate shown by `AuthGate` in place of the app whenever
 * nobody's logged in yet. One form, one hardcoded account (see
 * `src/lib/auth.ts`) — there's no "forgot password" or sign-up flow because
 * there's nothing behind this but a client-side check.
 */
export default function LoginScreen() {
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("username") ?? "");
    const password = String(data.get("password") ?? "");

    if (!login(username, password)) {
      setError(s.errorLogin);
      return;
    }
    setError(null);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-[radial-gradient(circle_at_top,var(--primary-tint),var(--background)_55%)] p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-hover text-primary-foreground shadow-[0_6px_16px_-6px_color-mix(in_srgb,var(--primary)_55%,transparent)]">
          <CakeLogo className="size-7" />
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            {s.loginTitle}
          </h1>
          <p className="mt-1 text-sm text-muted">{s.loginSubtitle}</p>
        </div>

        <Card className="w-full gap-4 p-4 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">{s.username}</Label>
              <Input
                id="username"
                type="text"
                name="username"
                autoComplete="username"
                autoFocus
                className="h-11"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{s.password}</Label>
              <Input
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                className="h-11"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11">
              {s.login}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
