export type CategoryItem = {
  id: string;
  label: string;
  slug: string;
  imageUrl: string | null;
  children: Array<{
    label: string;
    slug: string;
  }>;
};

export type RawCategoryResponse = {
  _id?: string;
  id?: string;
  name?: string;
  parent?: string;
  img?: string;
  image?: string;
  children?: string[];
};

export type RawCategoryEnvelope = {
  categories?: RawCategoryResponse[];
};
