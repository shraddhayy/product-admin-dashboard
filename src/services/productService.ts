import api from "@/lib/api";
import { ProductListResponse } from "@/types/product";

export const getProducts = async (
  limit: number = 10,
  skip: number = 0
): Promise<ProductListResponse> => {
  const response = await api.get<ProductListResponse>("/products", {
    params: {
      limit,
      skip,
    },
  });

  return response.data;
};