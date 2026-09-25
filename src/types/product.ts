export type ProductReview = {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
};

export type Product = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  sku?: string;
  thumbnail: string;
  images: string[];
  reviews: ProductReview[];
  availabilityStatus?: string;
};

export type ProductListResponse = {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
};

export type ProductCategory = {
  slug: string;
  name: string;
  url: string;
};

export type ProductSortBy = "price" | "rating" | "title";

export type ProductSortOrder = "asc" | "desc";

export type GetProductsOptions = {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  sortBy?: ProductSortBy;
  order?: ProductSortOrder;
  delay?: number;
};