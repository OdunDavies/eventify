"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button, Input, Label, Card, CardContent } from "@eventtix/ui";
import { Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        setSent(true);
      }
    } catch {
      setError("Failed to send magic link. Try again.");
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto max-w-md px-4 py-24 text-center">
        <Mail className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-2xl font-bold">Check your email</h1>
        <p className="mt-2 text-muted-foreground">
          We sent a magic link to <strong>{email}</strong>. Click it to sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-24">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>

      <Card>
        <CardContent className="p-6">
          <h1 className="mb-2 text-2xl font-bold">Sign In</h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a magic link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={!email}>
              Send Magic Link
            </Button>
          </form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            No password needed. We believe in passwordless auth.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
