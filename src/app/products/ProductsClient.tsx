"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";

import ProductNavbar from "@/components/ProductNavbar";

import {
  deleteProduct,
  getCategories,
  getProducts,
} from "@/services/productService";

import type {
  Product,
  ProductCategory,
  ProductSortBy,
  ProductSortOrder,
} from "@/types/product";

import {
  applyLocalProductChanges,
  getCreatedProducts,
  getDeletedProductIds,
  saveDeletedProductId,
} from "@/lib/productLocalStore";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

const PAGE_SIZE_OPTIONS = [10, 20, 50];

const SORT_OPTIONS = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Rating: High to Low", value: "rating-desc" },
  { label: "Title: A to Z", value: "title-asc" },
  { label: "Title: Z to A", value: "title-desc" },
];

const DELAY_OPTIONS = [
  { label: "None", value: 0 },
  { label: "500 ms", value: 500 },
  { label: "1000 ms", value: 1000 },
  { label: "2000 ms", value: 2000 },
];

const parsePositiveInteger = (
  value: string | null,
  fallback: number
) => {
  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0
    ? parsed
    : fallback;
};

const parsePageSize = (
  value: string | null
): number => {
  const parsed = Number(value);

  return PAGE_SIZE_OPTIONS.includes(parsed)
    ? parsed
    : DEFAULT_PAGE_SIZE;
};

const parseDelay = (
  value: string | null
): number => {
  const parsed = Number(value);

  return DELAY_OPTIONS.some(
    (option) => option.value === parsed
  )
    ? parsed
    : 0;
};

const getSortValue = (
  value: string | null
) => {
  const exists = SORT_OPTIONS.some(
    (option) => option.value === value
  );

  return exists
    ? value ?? "default"
    : "default";
};

export default function ProductsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<
    ProductCategory[]
  >([]);

  const [searchInput, setSearchInput] = useState("");

  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [retryCount, setRetryCount] = useState(0);

  const page = parsePositiveInteger(
    searchParams.get("page"),
    DEFAULT_PAGE
  );

  const pageSize = parsePageSize(
    searchParams.get("pageSize")
  );

  const urlSearch =
    searchParams.get("search")?.trim() ?? "";

  const category =
    searchParams.get("category")?.trim() ?? "";

  const sort = getSortValue(
    searchParams.get("sort")
  );

  const delay = parseDelay(
    searchParams.get("delay")
  );

  const skip = (page - 1) * pageSize;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  const currentSort = useMemo(() => {
    switch (sort) {
      case "price-asc":
        return {
          sortBy: "price" as ProductSortBy,
          order: "asc" as ProductSortOrder,
        };

      case "price-desc":
        return {
          sortBy: "price" as ProductSortBy,
          order: "desc" as ProductSortOrder,
        };

      case "rating-desc":
        return {
          sortBy: "rating" as ProductSortBy,
          order: "desc" as ProductSortOrder,
        };

      case "title-asc":
        return {
          sortBy: "title" as ProductSortBy,
          order: "asc" as ProductSortOrder,
        };

      case "title-desc":
        return {
          sortBy: "title" as ProductSortBy,
          order: "desc" as ProductSortOrder,
        };

      default:
        return {};
    }
  }, [sort]);

  /*
   * Keep the search input synchronized with the URL.
   */
  useEffect(() => {
    setSearchInput(urlSearch);
  }, [urlSearch]);

  /*
   * Debounced search.
   * Search and category are mutually exclusive because
   * DummyJSON cannot apply both in one API request.
   */
  useEffect(() => {
    if (searchInput.trim() === urlSearch) {
      return;
    }

    const timer = window.setTimeout(() => {
      const params = new URLSearchParams(
        searchParams.toString()
      );

      const value = searchInput.trim();

      if (value) {
        params.set("search", value);
        params.delete("category");
      } else {
        params.delete("search");
      }

      params.set("page", "1");

      router.replace(
        `${pathname}?${params.toString()}`
      );
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    searchInput,
    urlSearch,
    pathname,
    router,
    searchParams,
  ]);

  /*
   * Load categories once.
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);

        const data = await getCategories({
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setCategories(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setCategories([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      controller.abort();
    };
  }, []);

  /*
   * Load products and apply local CRUD changes.
   *
   * AbortController prevents stale delayed responses from
   * replacing newer search/filter results.
   */
  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getProducts({
          limit: pageSize,
          skip,
          search: urlSearch,
          category,
          sortBy: currentSort.sortBy,
          order: currentSort.order,
          delay,
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        /*
         * Apply locally stored updates/deletions.
         */
        let visibleProducts =
          applyLocalProductChanges(
            response.products
          );

        /*
         * Created products are not returned by DummyJSON
         * after a fresh request, so include them locally.
         *
         * We only add them to the general product list when
         * there is no search/category filter.
         */
        if (!urlSearch && !category) {
          const createdProducts =
            getCreatedProducts();

          const deletedIds =
            getDeletedProductIds();

          const existingIds = new Set(
            visibleProducts.map(
              (product) => product.id
            )
          );

          const additionalCreatedProducts =
            createdProducts.filter(
              (product) =>
                !existingIds.has(product.id) &&
                !deletedIds.includes(product.id)
            );

          visibleProducts = [
            ...additionalCreatedProducts,
            ...visibleProducts,
          ];
        }

        setProducts(visibleProducts);

        /*
         * Calculate the UI total while accounting for
         * locally created/deleted products.
         */
        const deletedIds =
          getDeletedProductIds();

        const deletedFromApi =
          response.products.filter(
            (product) =>
              deletedIds.includes(product.id)
          ).length;

        const createdCount =
          !urlSearch && !category
            ? getCreatedProducts().filter(
                (product) =>
                  !deletedIds.includes(
                    product.id
                  )
              ).length
            : 0;

        const adjustedTotal = Math.max(
          0,
          response.total -
            deletedFromApi +
            createdCount
        );

        setTotal(adjustedTotal);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setProducts([]);
        setTotal(0);
        setError("Failed to load products.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      controller.abort();
    };
  }, [
    pageSize,
    skip,
    urlSearch,
    category,
    currentSort,
    delay,
    retryCount,
  ]);

  /*
   * Fix invalid page values such as:
   * /products?page=abc
   * /products?page=999
   */
  useEffect(() => {
    if (loading || total === 0) {
      return;
    }

    if (page > totalPages) {
      const params = new URLSearchParams(
        searchParams.toString()
      );

      params.set(
        "page",
        String(totalPages)
      );

      router.replace(
        `${pathname}?${params.toString()}`
      );
    }
  }, [
    loading,
    total,
    page,
    totalPages,
    pathname,
    router,
    searchParams,
  ]);

  const updateQuery = (
    updates: Record<
      string,
      string | null
    >
  ) => {
    const params = new URLSearchParams(
      searchParams.toString()
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value === null ||
          value === ""
        ) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
    );

    router.replace(
      `${pathname}?${params.toString()}`
    );
  };

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;

    setSearchInput("");

    updateQuery({
      page: "1",
      category: value || null,
      search: null,
    });
  };

  const handleSortChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateQuery({
      page: "1",
      sort:
        event.target.value === "default"
          ? null
          : event.target.value,
    });
  };

  const handleDelayChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateQuery({
      page: "1",
      delay:
        event.target.value === "0"
          ? null
          : event.target.value,
    });
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    updateQuery({
      page: "1",
      pageSize: event.target.value,
    });
  };

  const handlePageChange = (
    nextPage: number
  ) => {
    updateQuery({
      page: String(nextPage),
    });
  };

  const handleDelete = async (
    id: number
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");

      await deleteProduct(id);

      /*
       * Persist the deletion locally because
       * DummyJSON does not permanently delete it.
       */
      saveDeletedProductId(id);

      setProducts(
        (currentProducts) =>
          currentProducts.filter(
            (product) =>
              product.id !== id
          )
      );

      setTotal(
        (currentTotal) =>
          Math.max(
            0,
            currentTotal - 1
          )
      );
    } catch {
      setError(
        "Failed to delete product. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handleRetry = () => {
    setRetryCount(
      (currentCount) =>
        currentCount + 1
    );
  };

  const clearFilters = () => {
    setSearchInput("");

    updateQuery({
      page: "1",
      search: null,
      category: null,
      sort: null,
      delay: null,
    });
  };

  const getPageNumbers = () => {
    const pages: number[] = [];

    for (
      let number = 1;
      number <= totalPages;
      number += 1
    ) {
      pages.push(number);
    }

    return pages;
  };

  const startItem =
    total === 0
      ? 0
      : skip + 1;

  const endItem =
    total === 0
      ? 0
      : Math.min(
          skip + products.length,
          total
        );

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <ProductNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
        {/* Heading */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Products Management
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your inventory, search, filter,
              and modify product records
            </p>
          </div>

          <Link
            href="/products/new"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <span className="text-base">
              +
            </span>
            Add Product
          </Link>
        </div>

        {/* Search */}
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <input
            type="text"
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value
              )
            }
            placeholder="Search products..."
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {searchInput.trim() !==
            urlSearch && (
            <p className="mt-2 text-xs text-gray-400">
              Searching...
            </p>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Category
              </label>

              <select
                id="category"
                value={category}
                onChange={
                  handleCategoryChange
                }
                disabled={
                  categoriesLoading
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="">
                  {categoriesLoading
                    ? "Loading categories..."
                    : "All Categories"}
                </option>

                {categories.map(
                  (item) => (
                    <option
                      key={item.slug}
                      value={item.slug}
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label
                htmlFor="sort"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Sort
              </label>

              <select
                id="sort"
                value={sort}
                onChange={
                  handleSortChange
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {SORT_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Delay */}
            <div>
              <label
                htmlFor="delay"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Delay
              </label>

              <select
                id="delay"
                value={delay}
                onChange={
                  handleDelayChange
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {DELAY_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Page Size */}
            <div>
              <label
                htmlFor="page-size"
                className="mb-1.5 block text-xs font-medium text-gray-500"
              >
                Page Size
              </label>

              <select
                id="page-size"
                value={pageSize}
                onChange={
                  handlePageSizeChange
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                {PAGE_SIZE_OPTIONS.map(
                  (size) => (
                    <option
                      key={size}
                      value={size}
                    >
                      {size} per page
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && !loading && (
          <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={
                handleRetry
              }
              className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex min-h-[360px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                <p className="text-sm text-gray-500">
                  Loading products...
                </p>
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex min-h-[360px] items-center justify-center px-6">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-800">
                  No products found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search
                  or filters.
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-4 text-sm font-medium text-blue-600 hover:underline"
                >
                  Clear filters
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop table */}
<div className="hidden overflow-x-auto md:block">
  <table className="w-full min-w-[1050px]">
    <thead className="border-b bg-gray-50">
      <tr>
        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Product
        </th>

        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Category
        </th>

        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Price
        </th>

        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Rating
        </th>

        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Stock
        </th>

        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
          Actions
        </th>
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
      {products.map((product) => (
        <tr
          key={product.id}
          className="transition hover:bg-gray-50"
        >
          <td className="px-6 py-4">
            <div className="flex items-center gap-3">
              <img
                src={product.thumbnail}
                alt={product.title}
                className="h-12 w-12 rounded-lg bg-gray-100 object-cover"
              />

              <div className="max-w-[280px]">
                <p className="truncate font-medium text-gray-900">
                  {product.title}
                </p>

                <p className="mt-0.5 text-xs text-gray-400">
                  ID: {product.id}
                </p>
              </div>
            </div>
          </td>

          <td className="px-6 py-4">
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium capitalize text-gray-600">
              {product.category}
            </span>
          </td>

          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </td>

          <td className="px-6 py-4">
            <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-800">
              <span
                aria-hidden="true"
                className="text-yellow-500"
              >
                ★
              </span>

              {product.rating.toFixed(1)}
            </span>
          </td>

          <td className="px-6 py-4">
            <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
              In Stock ({product.stock})
            </span>
          </td>

          <td className="px-6 py-4">
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={`/products/${product.id}`}
                className="font-medium text-blue-600 hover:underline"
              >
                View
              </Link>

              <Link
                href={`/products/${product.id}/edit`}
                className="font-medium text-gray-700 hover:underline"
              >
                Edit
              </Link>

              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                disabled={deletingId === product.id}
                className="font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId === product.id
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

{/* Mobile cards */}
<div className="grid gap-4 p-4 md:hidden">
  {products.map((product) => (
    <article
      key={product.id}
      className="rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="flex items-start gap-3">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-16 w-16 shrink-0 rounded-lg bg-gray-100 object-cover"
        />

        <div className="min-w-0 flex-1">
          <h2 className="truncate font-semibold text-gray-900">
            {product.title}
          </h2>

          <p className="mt-1 text-xs text-gray-400">
            ID: {product.id}
          </p>

          <span className="mt-2 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium capitalize text-gray-600">
            {product.category}
          </span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Price
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Rating
          </p>

          <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gray-900">
            <span className="text-yellow-500">
              ★
            </span>

            {product.rating.toFixed(1)}
          </p>
        </div>

        <div className="rounded-lg bg-gray-50 p-3">
          <p className="text-xs text-gray-500">
            Stock
          </p>

          <p className="mt-1 text-sm font-semibold text-gray-900">
            {product.stock}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
        <span className="text-xs font-medium text-gray-500">
          In Stock ({product.stock})
        </span>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href={`/products/${product.id}`}
            className="font-medium text-blue-600 hover:underline"
          >
            View
          </Link>

          <Link
            href={`/products/${product.id}/edit`}
            className="font-medium text-gray-700 hover:underline"
          >
            Edit
          </Link>

          <button
            type="button"
            onClick={() => handleDelete(product.id)}
            disabled={deletingId === product.id}
            className="font-medium text-red-600 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deletingId === product.id
              ? "Deleting..."
              : "Delete"}
          </button>
        </div>
      </div>
    </article>
  ))}
</div>

              {/* Pagination */}
              <div className="border-t border-gray-100 px-6 py-4">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-gray-500">
                    Showing{" "}
                    <span className="font-semibold text-gray-700">
                      {startItem}–
                      {endItem}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-gray-700">
                      {total}
                    </span>{" "}
                    products
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {/* Previous */}
                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(
                          Math.max(
                            1,
                            page - 1
                          )
                        )
                      }
                      disabled={
                        page === 1
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map(
                      (
                        pageNumber
                      ) => (
                        <button
                          key={
                            pageNumber
                          }
                          type="button"
                          onClick={() =>
                            handlePageChange(
                              pageNumber
                            )
                          }
                          className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium ${
                            pageNumber ===
                            page
                              ? "bg-blue-600 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {
                            pageNumber
                          }
                        </button>
                      )
                    )}

                    {/* Next */}
                    <button
                      type="button"
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            totalPages,
                            page + 1
                          )
                        )
                      }
                      disabled={
                        page ===
                        totalPages
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}