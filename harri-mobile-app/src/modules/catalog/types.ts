export type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  brand: string;
  category: string;
  parentCategory: string;
  childCategory: string;
  imageUrl: string | null;
  gallery: string[];
  price: number;
  priceText: string;
  originalPrice: number;
  originalPriceText: string;
  discount: number;
  stockQuantity: number;
  tags: string[];
  colors: string[];
  sku: string;
  status: string;
  averageRating?: number;
  totalReviews?: number;
};

export type CatalogSnapshot = {
  total: number;
  page: number;
  size: number;
  totalPages: number;
  products: CatalogProduct[];
  brands: string[];
  categories: Array<{ parent: string; count: number }>;
  priceBounds: {
    min: number;
    max: number;
  };
};

export type RawProductResponse = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  quantity?: number;
  sku?: string;
  image?: string;
  img?: string;
  status?: string;
  discount?: number;
  brand?: { name?: string } | string;
  category?: { name?: string };
  parent?: string;
  children?: string;
  tags?: string[];
  relatedImages?: string[];
  imageURLs?: string[];
  colors?: string[];
  averageRating?: number;
  totalReviews?: number;
};

export type RawCatalogResponse = {
  products?: RawProductResponse[];
  total?: number;
  page?: number;
  size?: number;
  totalPages?: number;
  facets?: {
    brands?: Array<{ name?: string } | string>;
  };
  priceBounds?: {
    min?: number;
    max?: number;
  };
};
