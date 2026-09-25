"use client";

import { useState } from "react";
import type { Product } from "@/types/product";

type ProductFormProps = {
  initialValues?: Partial<Product>;
  submitLabel: string;
  onSubmit: (product: Partial<Product>) => Promise<void>;
};

type FormErrors = {
  title?: string;
  description?: string;
  price?: string;
  stock?: string;
  category?: string;
};

export default function ProductForm({
  initialValues = {},
  submitLabel,
  onSubmit,
}: ProductFormProps) {
  const [title, setTitle] = useState(initialValues.title ?? "");
  const [description, setDescription] = useState(
    initialValues.description ?? ""
  );
  const [price, setPrice] = useState(
    initialValues.price?.toString() ?? ""
  );
  const [stock, setStock] = useState(
    initialValues.stock?.toString() ?? ""
  );
  const [category, setCategory] = useState(
    initialValues.category ?? ""
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};

    if (!title.trim()) {
      nextErrors.title = "Product title is required.";
    } else if (title.trim().length < 3) {
      nextErrors.title = "Product title must be at least 3 characters.";
    }

    if (!description.trim()) {
      nextErrors.description = "Description is required.";
    } else if (description.trim().length < 10) {
      nextErrors.description =
        "Description must be at least 10 characters.";
    }

    if (!price) {
      nextErrors.price = "Price is required.";
    } else if (Number(price) <= 0) {
      nextErrors.price = "Price must be greater than 0.";
    }

    if (!stock) {
      nextErrors.stock = "Stock is required.";
    } else if (Number(stock) < 0) {
      nextErrors.stock = "Stock cannot be negative.";
    } else if (!Number.isInteger(Number(stock))) {
      nextErrors.stock = "Stock must be a whole number.";
    }

    if (!category.trim()) {
      nextErrors.category = "Category is required.";
    }

    return nextErrors;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitError("");

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        category: category.trim(),
      });
    } catch {
      setSubmitError(
        "Something went wrong while saving the product. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {submitError}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Product Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Enter product title"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
            errors.title
              ? "border-red-400 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />

        {errors.title && (
          <p className="mt-1 text-sm text-red-500">
            {errors.title}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Enter product description"
          rows={4}
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
            errors.description
              ? "border-red-400 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />

        {errors.description && (
          <p className="mt-1 text-sm text-red-500">
            {errors.description}
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="price"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Price
          </label>

          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="Enter price"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
              errors.price
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.price && (
            <p className="mt-1 text-sm text-red-500">
              {errors.price}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="stock"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Stock
          </label>

          <input
            id="stock"
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            placeholder="Enter stock quantity"
            className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
              errors.stock
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500"
            }`}
          />

          {errors.stock && (
            <p className="mt-1 text-sm text-red-500">
              {errors.stock}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Category
        </label>

        <input
          id="category"
          type="text"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="e.g. beauty, groceries, furniture"
          className={`w-full rounded-lg border px-4 py-2.5 text-sm outline-none ${
            errors.category
              ? "border-red-400 focus:border-red-500"
              : "border-gray-300 focus:border-blue-500"
          }`}
        />

        {errors.category && (
          <p className="mt-1 text-sm text-red-500">
            {errors.category}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}