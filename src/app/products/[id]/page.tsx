"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import ProductNavbar from "@/components/ProductNavbar";

import { getProductById } from "@/services/productService";

import {
  getCreatedProducts,
  getDeletedProductIds,
  getUpdatedProducts,
} from "@/lib/productLocalStore";

import type { Product } from "@/types/product";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(
    null
  );

  const [selectedImage, setSelectedImage] =
    useState("");

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        setLoading(true);
        setNotFound(false);

        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
          setNotFound(true);
          return;
        }

        const deletedIds = getDeletedProductIds();

        if (deletedIds.includes(id)) {
          setNotFound(true);
          return;
        }

        /*
         * Check locally created products first because
         * DummyJSON does not return created products
         * from future GET requests.
         */
        const createdProduct = getCreatedProducts().find(
          (item) => item.id === id
        );

        /*
         * Check locally updated products next so edits
         * remain visible on the details page.
         */
        const updatedProduct = getUpdatedProducts().find(
          (item) => item.id === id
        );

        if (createdProduct) {
          if (!controller.signal.aborted) {
            setProduct(createdProduct);

            setSelectedImage(
              createdProduct.thumbnail ||
                createdProduct.images?.[0] ||
                ""
            );
          }

          return;
        }

        if (updatedProduct) {
          if (!controller.signal.aborted) {
            setProduct(updatedProduct);

            setSelectedImage(
              updatedProduct.thumbnail ||
                updatedProduct.images?.[0] ||
                ""
            );
          }

          return;
        }

        /*
         * Fall back to the real API for normal products.
         */
        const data = await getProductById(id, {
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        if (!data || !data.id) {
          setNotFound(true);
          return;
        }

        setProduct(data);

        setSelectedImage(
          data.thumbnail ||
            data.images?.[0] ||
            ""
        );
      } catch {
        if (!controller.signal.aborted) {
          setNotFound(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      controller.abort();
    };
  }, [params.id]);

  if (loading) {
    return (
      <>
        <ProductNavbar />

        <main className="min-h-screen bg-gray-50">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="text-sm text-gray-500">
                Loading product...
              </p>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (notFound || !product) {
    return (
      <>
        <ProductNavbar />

        <main className="min-h-screen bg-gray-50">
          <div className="mx-auto flex min-h-[500px] max-w-7xl items-center justify-center px-6">
            <div className="text-center">
              <p className="text-6xl font-bold text-gray-200">
                404
              </p>

              <h1 className="mt-4 text-2xl font-bold text-gray-900">
                Product not found
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                The product you are looking for does not exist.
              </p>

              <button
                type="button"
                onClick={() => router.push("/products")}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Back to Products
              </button>
            </div>
          </div>
        </main>
      </>
    );
  }

  const images = Array.from(
    new Set(
      [
        product.thumbnail,
        ...(product.images ?? []),
      ].filter(Boolean)
    )
  );

  return (
    <>
      <ProductNavbar />

      <main className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8 md:px-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="w-fit text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Products
            </button>

            <Link
              href={`/products/${product.id}/edit`}
              className="w-fit rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Edit Product
            </Link>
          </div>

          {/* Product Information */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Image Gallery */}
              <div>
                <div className="overflow-hidden rounded-xl bg-gray-100">
                  <img
                    src={
                      selectedImage ||
                      product.thumbnail
                    }
                    alt={product.title}
                    className="h-[380px] w-full object-contain"
                  />
                </div>

                {images.length > 0 && (
                  <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                    {images.map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() =>
                          setSelectedImage(image)
                        }
                        className={`flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2 bg-gray-50 ${
                          selectedImage === image
                            ? "border-blue-600"
                            : "border-gray-200"
                        }`}
                      >
                        <img
                          src={image}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium capitalize text-gray-600">
                    {product.category}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                    <span className="text-yellow-500">
                      ★
                    </span>

                    {product.rating.toFixed(1)}
                  </span>
                </div>

                <h1 className="mt-4 text-3xl font-bold text-gray-900">
                  {product.title}
                </h1>

                <p className="mt-5 leading-7 text-gray-600">
                  {product.description}
                </p>

                <div className="mt-6">
                  <p className="text-3xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </p>

                  {product.discountPercentage > 0 && (
                    <p className="mt-1 text-sm text-green-600">
                      {product.discountPercentage.toFixed(
                        1
                      )}
                      % discount
                    </p>
                  )}
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Stock
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      In Stock ({product.stock})
                    </p>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Product ID
                    </p>

                    <p className="mt-1 font-semibold text-gray-900">
                      #{product.id}
                    </p>
                  </div>
                </div>

                {product.brand && (
                  <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs text-gray-500">
                      Brand
                    </p>

                    <p className="mt-1 font-semibold capitalize text-gray-900">
                      {product.brand}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Reviews
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Customer feedback for this product
                </p>
              </div>

              <span className="text-sm text-gray-500">
                {product.reviews?.length ?? 0} reviews
              </span>
            </div>

            {!product.reviews ||
            product.reviews.length === 0 ? (
              <div className="mt-6 rounded-lg bg-gray-50 p-6 text-center">
                <p className="text-sm text-gray-500">
                  No reviews available.
                </p>
              </div>
            ) : (
              <div className="mt-6 divide-y divide-gray-100">
                {product.reviews.map(
                  (review, index) => (
                    <div
                      key={`${review.reviewerEmail}-${index}`}
                      className="py-5 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {review.reviewerName}
                          </p>

                          <p className="text-xs text-gray-400">
                            {review.reviewerEmail}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-yellow-500">
                            {"★".repeat(
                              Math.max(
                                0,
                                review.rating
                              )
                            )}
                          </span>

                          <span className="text-sm font-medium text-gray-700">
                            {review.rating}/5
                          </span>
                        </div>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-gray-600">
                        {review.comment}
                      </p>

                      <p className="mt-2 text-xs text-gray-400">
                        {new Date(
                          review.date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}