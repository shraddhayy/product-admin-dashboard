"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import ProductNavbar from "@/components/ProductNavbar";
import {
  getProductById,
  updateProduct,
} from "@/services/productService";
import { saveUpdatedProduct } from "@/lib/productLocalStore";
import type { Product } from "@/types/product";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
          setError("Invalid product ID.");
          return;
        }

        const data = await getProductById(id, {
          signal: controller.signal,
        });

        if (!controller.signal.aborted) {
          setProduct(data);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError("Failed to load product.");
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

  const handleUpdate = async (values: Partial<Product>) => {
    if (!product) {
      return;
    }

    const updatedProduct = await updateProduct(
      product.id,
      values
    );

    const productForUi: Product = {
      ...product,
      ...updatedProduct,
      ...values,
      id: product.id,
      thumbnail: product.thumbnail,
      images: product.images,
      reviews: product.reviews,
    };

    saveUpdatedProduct(productForUi);

    router.push(`/products/${product.id}`);
  };

  return (
    <>
      <ProductNavbar />

      <main className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                <p className="text-sm text-gray-500">
                  Loading product...
                </p>
              </div>
            </div>
          ) : error || !product ? (
            <div className="rounded-xl border border-red-200 bg-white p-8 text-center shadow-sm">
              <h1 className="text-xl font-bold text-gray-900">
                {error || "Product not found."}
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                The product could not be loaded.
              </p>

              <button
                type="button"
                onClick={() => router.push("/products")}
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Back to Products
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/products/${product.id}`)
                  }
                  className="mb-4 text-sm font-medium text-blue-600 hover:underline"
                >
                  ← Back to Product
                </button>

                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Product
                </h1>

                <p className="mt-1 text-sm text-gray-600">
                  Update the product information below.
                </p>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
                <ProductForm
                  initialValues={product}
                  submitLabel="Update Product"
                  onSubmit={handleUpdate}
                />
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}