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
    title: "Dashboard",
  },
  {
    id: 2,
    icon: Products,
    link: "/product-list",
    title: "Products",
    subMenus: [
      { title: "Product List", link: "/product-list" },
      { title: "Product Grid", link: "/product-grid" },
      { title: "Add Product", link: "/add-product" }
    ],
  },
  {
    id: 3,
    icon: Categories,
    link: "/category",
    title: "Category",
  },
  {
    id: 4,
    icon: Orders,
    link: "/orders",
    title: "Orders",
  },
  {
    id: 5,
    icon: Leaf,
    link: "/brands",
    title: "Brand",
  },
  {
    id: 6,
    icon: Coupons,
    link: "/coupon",
    title: "Coupons",
  },
  {
    id: 7,
    icon: Profile,
    link: "/profile",
    title: "Profile",
  },
  {
    id: 8,
    icon: Setting,
    link: "#",
    title: "Online store",
  },
  {
    id: 9,
    icon: StuffUser,
    link: "/our-staff",
    title: "Müşteriler",
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
    title: "Newsletter",
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
];

export default sidebar_menu;
