"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between rounded-xl bg-white p-6 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Product Admin Portal
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage inventory &amp; products
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            Logout
          </button>
        </div>

        <div className="mt-6 rounded-xl bg-white p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Products
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Product management will be added next.
          </p>
        </div>
      </div>
    </main>
  );
}
