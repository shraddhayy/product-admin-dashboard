"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductLogo from "@/components/ProductLogo";

export default function ProductNavbar() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");

    document.cookie =
      "token=; Max-Age=0; path=/; SameSite=Lax";

    router.replace("/login");
  };

  return (
    <header className="border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-8">
        <Link
          href="/products"
          className="flex items-center gap-3"
        >
          <ProductLogo />

          <span className="text-lg font-semibold text-gray-900">
            Product Admin
          </span>
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </header>
  );
}