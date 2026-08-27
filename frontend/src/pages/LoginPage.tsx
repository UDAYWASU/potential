// LoginPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      const user = await refreshUser();

      if (!user) {
        throw new Error("Unable to load your account information.");
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Unable to login.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f7f3ea] px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex h-11 w-11 rounded-full bg-[#7a4a25] items-center justify-center text-[#f3e6c9] text-sm tracking-widest mb-4">
            P
          </div>
          <h1 className="text-2xl font-serif font-medium text-[#2b2318]">Sign in to Potential</h1>
          <p className="mt-2 text-sm text-[#8a7a5c]">PRPCEM Training &amp; Placement Cell</p>
        </div>

        <div className="border border-[#d8cbb0] bg-white/60 p-8">
          {error && (
            <div
              role="alert"
              className="mb-6 border border-[#c98a5f] bg-[#f6e3d3] text-[#7a3a1a] text-sm px-4 py-3"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs tracking-wide uppercase text-[#8a7a5c] mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full border border-[#c9b98f] bg-white px-4 py-2.5 text-sm text-[#2b2318] focus:outline-none focus:border-[#7a4a25] focus:ring-1 focus:ring-[#7a4a25] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 px-4 py-3 text-sm tracking-wide text-[#f3e6c9] bg-[#7a4a25] hover:bg-[#63391b] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-[#5c4d33] space-y-2">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="text-[#7a4a25] hover:underline">
              Register
            </Link>
          </p>
          <p>
            <Link to="/" className="text-[#8a7a5c] hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}