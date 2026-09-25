"use client";

import { useRouter } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import ProductNavbar from "@/components/ProductNavbar";
import { createProduct } from "@/services/productService";
import { saveCreatedProduct } from "@/lib/productLocalStore";
import type { Product } from "@/types/product";

export default function NewProductPage() {
  const router = useRouter();

  const handleCreate = async (product: Partial<Product>) => {
    const createdProduct = await createProduct(product);

    saveCreatedProduct(createdProduct);

    router.push("/products");
  };

  return (
    <>
      <ProductNavbar />

      <main className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="mb-4 text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Products
            </button>

            <h1 className="text-2xl font-bold text-gray-900">
              Add New Product
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Create a new product for the catalog.
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <ProductForm
              submitLabel="Create Product"
              onSubmit={handleCreate}
            />
          </div>
        </div>
      </main>
    </>
  );
}