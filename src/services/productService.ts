import api from "@/lib/api";
import type {
  GetProductsOptions,
  Product,
  ProductCategory,
  ProductListResponse,
} from "@/types/product";

type RequestOptions = {
  signal?: AbortSignal;
};

export const getProducts = async ({
  limit = 10,
  skip = 0,
  search = "",
  category = "",
  sortBy,
  order = "asc",
  delay = 0,
  signal,
}: GetProductsOptions & RequestOptions = {}): Promise<ProductListResponse> => {
  const trimmedSearch = search.trim();

  let endpoint = "/products";

  if (trimmedSearch) {
    endpoint = "/products/search";
  } else if (category) {
    endpoint = `/products/category/${encodeURIComponent(category)}`;
  }

  const response = await api.get<ProductListResponse>(endpoint, {
    params: {
      limit,
      skip,
      ...(trimmedSearch ? { q: trimmedSearch } : {}),
      ...(sortBy ? { sortBy, order } : {}),
      ...(delay > 0 ? { delay } : {}),
    },
    signal,
  });

  return response.data;
};

export const getCategories = async (
  options: RequestOptions = {}
): Promise<ProductCategory[]> => {
  const response = await api.get<ProductCategory[]>(
    "/products/categories",
    {
      signal: options.signal,
    }
  );

  return response.data;
};

export const getProductById = async (
  id: number,
  options: RequestOptions = {}
): Promise<Product> => {
  const response = await api.get<Product>(
    `/products/${id}`,
    {
      signal: options.signal,
    }
  );

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