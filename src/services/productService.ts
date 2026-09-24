import api from "@/lib/api";
import type { Product, ProductListResponse } from "@/types/product";

export const getProducts = async (
  limit: number = 10,
  skip: number = 0,
  search: string = "",
  category: string = ""
): Promise<ProductListResponse> => {
  const endpoint = search.trim()
    ? `/products/search?q=${encodeURIComponent(search.trim())}`
    : category
      ? `/products/category/${encodeURIComponent(category)}`
      : "/products";

  const response = await api.get<ProductListResponse>(endpoint, {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};

export const getProductById = async (
  id: number
): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);

  return response.data;
};

export const createProduct = async (
  product: Partial<Product>
): Promise<Product> => {
  const response = await api.post<Product>(
    "/products/add",
    product
  );

  return response.data;
};

export const updateProduct = async (
  id: number,
  product: Partial<Product>
): Promise<Product> => {
  const response = await api.put<Product>(
    `/products/${id}`,
    product
  );

  return response.data;
};

export const deleteProduct = async (
  id: number
): Promise<Product> => {
  const response = await api.delete<Product>(
    `/products/${id}`
  );

  return response.data;
};