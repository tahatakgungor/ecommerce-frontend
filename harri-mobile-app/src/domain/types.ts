export type TenantPalette = {
  primary: string;
  primarySoft: string;
  accent: string;
  background: string;
  surface: string;
  border: string;
  text: string;
  mutedText: string;
};

export type TenantSection = {
  title: string;
  description: string;
};

export type CommerceTenant = {
  id: string;
  brandName: string;
  industry: string;
  tagline: string;
  apiBaseUrl?: string;
  heroTitle: string;
  heroDescription: string;
  palette: TenantPalette;
  promises: string[];
  mobileSections: TenantSection[];
};
