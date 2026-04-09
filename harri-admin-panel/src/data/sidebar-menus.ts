import { ISidebarMenus } from "./../types/menu-types";
import {
  Dashboard,
  Categories,
  Coupons,
  Customers,
  Orders,
  Pages,
  Products,
  Profile,
  Reviews,
  Setting,
  Leaf,
  StuffUser,
} from "@/svg";

const sidebar_menu: Array<ISidebarMenus> = [
  {
    id: 1,
    icon: Dashboard,
    link: "/dashboard",
    title: "Panel",
  },
  {
    id: 2,
    icon: Products,
    link: "/product-list",
    title: "Ürünler",
    subMenus: [
      { title: "Ürün Listesi", link: "/product-list" },
      { title: "Ürün Kartları", link: "/product-grid" },
      { title: "Ürün Ekle", link: "/add-product" }
    ],
  },
  {
    id: 3,
    icon: Categories,
    link: "/category",
    title: "Kategoriler",
  },
  {
    id: 4,
    icon: Orders,
    link: "/orders",
    title: "Siparişler",
  },
  {
    id: 5,
    icon: Leaf,
    link: "/brands",
    title: "Markalar",
  },
  {
    id: 6,
    icon: Coupons,
    link: "/coupon",
    title: "Kuponlar",
  },
  {
    id: 7,
    icon: Profile,
    link: "/profile",
    title: "Profil",
  },
  {
    id: 8,
    icon: Setting,
    link: "/site-settings",
    title: "Mağaza Ayarları",
  },
  {
    id: 81,
    icon: Orders,
    link: "/returns",
    title: "İadeler",
  },
  {
    id: 9,
    icon: StuffUser,
    link: "/our-staff",
    title: "Müşteri Hesapları",
  },
  {
    id: 10,
    icon: Reviews,
    link: "/reviews",
    title: "Yorumlar",
  },
  {
    id: 11,
    icon: StuffUser,
    link: "/staff",
    title: "Personel",
  },
  {
    id: 12,
    icon: Customers,
    link: "/newsletter",
    title: "Bülten",
  },
  {
    id: 13,
    icon: Pages,
    link: "/banner",
    title: "Banner",
  },
  {
    id: 14,
    icon: Pages,
    link: "/blog",
    title: "Blog",
  },
  {
    id: 15,
    icon: Setting,
    link: "/activity-logs",
    title: "Aktivite Logları",
  },
];

export default sidebar_menu;
