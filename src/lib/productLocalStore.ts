import type { Product } from "@/types/product";

const CREATED_KEY = "product-admin-created";
const UPDATED_KEY = "product-admin-updated";
const DELETED_KEY = "product-admin-deleted";

const isBrowser = () =>
  typeof window !== "undefined";

export const getCreatedProducts = (): Product[] => {
  if (!isBrowser()) return [];

  try {
    return JSON.parse(
      localStorage.getItem(CREATED_KEY) ?? "[]"
    ) as Product[];
  } catch {
    return [];
  }
};

export const saveCreatedProduct = (
  product: Product
) => {
  if (!isBrowser()) return;

  const current = getCreatedProducts();

  localStorage.setItem(
    CREATED_KEY,
    JSON.stringify([...current, product])
  );
};

export const getUpdatedProducts = (): Product[] => {
  if (!isBrowser()) return [];

  try {
    return JSON.parse(
      localStorage.getItem(UPDATED_KEY) ?? "[]"
    ) as Product[];
  } catch {
    return [];
  }
};

export const saveUpdatedProduct = (
  product: Product
) => {
  if (!isBrowser()) return;

  const current = getUpdatedProducts();

  const withoutCurrent = current.filter(
    (item) => item.id !== product.id
  );

  localStorage.setItem(
    UPDATED_KEY,
    JSON.stringify([...withoutCurrent, product])
  );
};

export const getDeletedProductIds = (): number[] => {
  if (!isBrowser()) return [];

  try {
    return JSON.parse(
      localStorage.getItem(DELETED_KEY) ?? "[]"
    ) as number[];
  } catch {
    return [];
  }
};

export const saveDeletedProductId = (
  id: number
) => {
  if (!isBrowser()) return;

  const current = getDeletedProductIds();

  if (!current.includes(id)) {
    localStorage.setItem(
      DELETED_KEY,
      JSON.stringify([...current, id])
    );
  }
};

export const applyLocalProductChanges = (
  products: Product[]
): Product[] => {
  const updatedProducts = getUpdatedProducts();
  const deletedIds = getDeletedProductIds();

  const result = products
    .filter((product) => !deletedIds.includes(product.id))
    .map((product) => {
      const updated = updatedProducts.find(
        (item) => item.id === product.id
      );

      return updated ?? product;
    });

  return result;
};