export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  contentText: string;
  relatedProductIds: string[];
  publishedAt: string;
  updatedAt: string;
};

export type RawBlogPost = {
  id?: string;
  _id?: string;
  title?: string;
  slug?: string;
  summary?: string;
  coverImage?: string;
  contentHtml?: string;
  relatedProductIds?: string[];
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
};
