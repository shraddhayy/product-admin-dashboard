"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getProducts } from "@/services/productService";
import type { Product } from "@/types/product";

export default function ProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sortBy, setSortBy] = useState("");

  const requestIdRef = useRef(0);

  const totalPages = Math.ceil(totalProducts / pageSize);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
      return;
    }

    const timeoutId = setTimeout(() => {
      const fetchProducts = async () => {
        const requestId = ++requestIdRef.current;

        try {
          setIsLoading(true);
          setError("");

          const skip = (currentPage - 1) * pageSize;

          const data = await getProducts(
            pageSize,
            skip,
            search,
            category
          );

          if (requestId !== requestIdRef.current) {
            return;
          }

          setProducts(data.products);
          const sortedProducts = [...data.products];

if (sortBy === "price-asc") {
  sortedProducts.sort((a, b) => a.price - b.price);
}

if (sortBy === "price-desc") {
  sortedProducts.sort((a, b) => b.price - a.price);
}

if (sortBy === "rating-desc") {
  sortedProducts.sort((a, b) => b.rating - a.rating);
}

if (sortBy === "stock-desc") {
  sortedProducts.sort((a, b) => b.stock - a.stock);
}

setProducts(sortedProducts);
        } catch (err) {
          console.error(err);

          if (requestId === requestIdRef.current) {
            setError(
              "Failed to load products. Please try again."
            );
          }
        } finally {
          if (requestId === requestIdRef.current) {
            setIsLoading(false);
          }
        }
      };

      fetchProducts();
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [router, currentPage, pageSize, search, category]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newPageSize = Number(event.target.value);

    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let page = 1; page <= totalPages; page++) {
        pages.push(page);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  const firstItem =
    totalProducts === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const lastItem = Math.min(
    currentPage * pageSize,
    totalProducts
  );

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
            type="button"
            onClick={handleLogout}
            className="w-full rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto"
          >
            Logout
          </button>
        </div>

        {/* Product List */}
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm sm:p-6">
          {/* Title + Search + Filter */}
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Products
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                View inventory and product information.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end">
              {/* Search */}
              <div className="w-full sm:w-72">
                <label
                  htmlFor="product-search"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Search products
                </label>

                <input
                  id="product-search"
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search products..."
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-400"
                />
              </div>

              {/* Category Filter */}
              <div className="w-full sm:w-48">
                <label
                  htmlFor="product-category"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Category
                </label>

                <select
                  id="product-category"
                  value={category}
                  onChange={(event) => {
                    setCategory(event.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
                >
                  <option value="">All categories</option>
                  <option value="beauty">Beauty</option>
                  <option value="fragrances">Fragrances</option>
                  <option value="furniture">Furniture</option>
                  <option value="groceries">Groceries</option>
                </select>
              </div>
            </div>
            <div className="w-full sm:w-48">
  <label
    htmlFor="product-sort"
    className="mb-1 block text-sm font-medium text-gray-700"
  >
    Sort by
  </label>

  <select
    id="product-sort"
    value={sortBy}
    onChange={(event) => {
      setSortBy(event.target.value);
      setCurrentPage(1);
    }}
    className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
  >
    <option value="">Default</option>
    <option value="price-asc">Price: Low to High</option>
    <option value="price-desc">Price: High to Low</option>
    <option value="rating-desc">Rating: High to Low</option>
    <option value="stock-desc">Stock: High to Low</option>
  </select>
</div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="py-10 text-center text-sm text-gray-500">
              Loading products...
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Product Data */}
          {!isLoading && !error && (
            <>
              {/* Empty State */}
              {products.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-500">
                  No products found.
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 text-gray-500">
                          <th className="px-4 py-3 font-medium">
                            Product
                          </th>

                          <th className="px-4 py-3 font-medium">
                            Category
                          </th>

                          <th className="px-4 py-3 font-medium">
                            Price
                          </th>

                          <th className="px-4 py-3 font-medium">
                            Rating
                          </th>

                          <th className="px-4 py-3 font-medium">
                            Stock
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {products.map((product) => (
                          <tr
                            key={product.id}
                            className="border-b border-gray-100 last:border-0"
                          >
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

                            <td className="px-4 py-4">
                              <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                                {product.category}
                              </span>
                            </td>

                            <td className="px-4 py-4 font-medium text-gray-900">
                              ${product.price}
                            </td>

                            <td className="px-4 py-4">
                              <span className="inline-flex items-center gap-1 font-medium text-yellow-500">
                                <span className="text-sm">
                                  ★
                                </span>
                                {product.rating}
                              </span>
                            </td>

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

                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                          <div>
                            <p className="text-xs text-gray-500">
                              Category
                            </p>

                            <span className="mt-1 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                              {product.category}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Price
                            </p>

                            <p className="mt-1 text-sm font-medium text-gray-900">
                              ${product.price}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Rating
                            </p>

                            <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-yellow-500">
                              <span>★</span>
                              {product.rating}
                            </span>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Stock
                            </p>

                            <span className="mt-1 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                              In Stock ({product.stock})
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 border-t border-gray-100 pt-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        {/* Showing */}
                        <div className="text-center text-sm text-gray-500 lg:text-left">
                          Showing{" "}
                          <span className="font-medium text-gray-900">
                            {firstItem}–{lastItem}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium text-gray-900">
                            {totalProducts}
                          </span>{" "}
                          products
                        </div>

                        {/* Page Navigation */}
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handlePageChange(
                                currentPage - 1
                              )
                            }
                            disabled={currentPage === 1}
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Previous
                          </button>

                          {getPageNumbers().map(
                            (page, index) => {
                              if (
                                typeof page === "string"
                              ) {
                                return (
                                  <span
                                    key={`ellipsis-${index}`}
                                    className="px-1 text-sm text-gray-400"
                                  >
                                    ...
                                  </span>
                                );
                              }

                              return (
                                <button
                                  type="button"
                                  key={page}
                                  onClick={() =>
                                    handlePageChange(page)
                                  }
                                  className={`h-9 min-w-9 rounded-lg px-2 text-sm font-medium ${
                                    currentPage === page
                                      ? "bg-gray-900 text-white"
                                      : "text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            }
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handlePageChange(
                                currentPage + 1
                              )
                            }
                            disabled={
                              currentPage === totalPages
                            }
                            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Next
                          </button>
                        </div>

                        {/* Page Size */}
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 lg:justify-end">
                          <span>Show</span>

                          <select
                            value={pageSize}
                            onChange={
                              handlePageSizeChange
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none focus:border-gray-400"
                          >
                            <option value="10">
                              10
                            </option>

                            <option value="20">
                              20
                            </option>

                            <option value="50">
                              50
                            </option>
                          </select>

                          <span>per page</span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}