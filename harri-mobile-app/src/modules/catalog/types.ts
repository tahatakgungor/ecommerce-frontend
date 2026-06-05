export type CatalogProduct = {
  id: string;
  title: string;
  brand: string;
  category: string;
  imageUrl: string | null;
  priceText: string;
};

export type CatalogCategory = {
  parent: string;
  count: number;
};

export type CatalogSnapshot = {
  total: number;
  page: number;
  size: number;
  products: CatalogProduct[];
  categories: CatalogCategory[];
  brands: string[];
};
