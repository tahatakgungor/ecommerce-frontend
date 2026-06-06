export type HeroBanner = {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  imageUrl: string | null;
  imageAlt: string;
  openInNewTab: boolean;
};

export type RawHeroBanner = {
  id?: string;
  _id?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  imageUrl?: string;
  imageAlt?: string;
  openInNewTab?: boolean;
};
