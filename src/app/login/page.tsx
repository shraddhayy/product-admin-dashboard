"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await login({
        username: username.trim(),
        password,
      });

      localStorage.setItem("token", response.accessToken);

      router.push("/products");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
       {/* Logo + Heading */}
<div className="mb-8 text-center">
  {/* Logo */}
  <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-7 w-7 text-white"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  </div>

  {/* Heading */}
  <h1 className="text-2xl font-bold text-gray-900">
    Product Admin Portal
  </h1>

  <p className="mt-2 text-sm text-gray-500">
    Sign in to manage inventory and products.
  </p>
</div>

        {/* Supplied Credentials */}
        <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-semibold text-gray-800">
            Supplied Credentials: Fill Credentials
          </p>

          <div className="mt-3 flex items-center gap-8 text-sm text-gray-600">
            <span>
              Username:{" "}
              <span className="font-semibold text-gray-900">emilys</span>
            </span>

            <span>
              Password:{" "}
              <span className="font-semibold text-gray-900">
                emilyspass
              </span>
            </span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Username
            </label>

            <div className="relative">
              {/* User Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              >
                <circle cx="12" cy="8" r="5" />
                <path d="M20 21a8 8 0 0 0-16 0" />
              </svg>

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-gray-900 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <div className="relative">
              {/* Lock Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 outline-none focus:border-gray-900 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-gray-900 px-4 py-2.5 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}