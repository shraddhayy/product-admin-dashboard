"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/services/productService";
import { Product } from "@/types/product";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getProducts(10, 0);
        setProducts(data.products);
      } catch {
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
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
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
          >
            Logout
          </button>
        </div>

        {/* Product List */}
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Products
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              View inventory and product information.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading products...
            </div>
          )}

          {/* Error State */}
          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          {/* Product Data */}
          {!isLoading && !error && (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500">
                      <th className="px-4 py-3 font-medium">Product</th>
                      <th className="px-4 py-3 font-medium">Category</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Rating</th>
                      <th className="px-4 py-3 font-medium">Stock</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        {/* Product */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />

                            <div>
                              <p className="font-medium text-gray-900">
                                {product.title}
                              </p>

                              <p className="text-xs text-gray-500">
                                {product.brand}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                            {product.category}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4 font-medium text-gray-900">
                          ${product.price}
                        </td>

                        {/* Rating */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 font-medium text-yellow-500">
                            <span className="text-sm">★</span>
                            {product.rating}
                          </span>
                        </td>

                        {/* Stock */}
                        <td className="px-4 py-4">
                          <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                            In Stock ({product.stock})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="space-y-4 md:hidden">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-xl border border-gray-200 p-4"
                  >
                    {/* Product Header */}
                    <div className="flex items-center gap-3">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="h-14 w-14 rounded-lg object-cover"
                      />

                      <div className="min-w-0">
                        <h3 className="truncate font-medium text-gray-900">
                          {product.title}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          {product.brand}
                        </p>
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                      {/* Category */}
                      <div>
                        <p className="text-xs text-gray-500">Category</p>

                        <span className="mt-1 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                          {product.category}
                        </span>
                      </div>

                      {/* Price */}
                      <div>
                        <p className="text-xs text-gray-500">Price</p>

                        <p className="mt-1 text-sm font-medium text-gray-900">
                          ${product.price}
                        </p>
                      </div>

                      {/* Rating */}
                      <div>
                        <p className="text-xs text-gray-500">Rating</p>

                        <p className="mt-1 text-sm font-medium text-yellow-500">
                          <span className="inline-flex items-center gap-1">
                            <span className="text-sm">★</span>
                            {product.rating}
                          </span>
                        </p>
                      </div>

                      {/* Stock */}
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>

                        <span className="mt-1 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                          In Stock ({product.stock})
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}