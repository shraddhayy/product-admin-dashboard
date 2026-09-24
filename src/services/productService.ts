import api from "@/lib/api";
import type { ProductListResponse } from "@/types/product";

export const getProducts = async (
  limit: number = 10,
  skip: number = 0,
  search: string = "",
  delay?: number
): Promise<ProductListResponse> => {
  const endpoint = search.trim()
    ? `/products/search?q=${encodeURIComponent(search.trim())}`
    : "/products";

  const response = await api.get<ProductListResponse>(endpoint, {
    params: {
      limit,
      skip,
      ...(delay ? { delay } : {}),
    },
  });

  return response.data;
};