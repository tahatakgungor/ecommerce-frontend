import { toFilterSlug } from "./shop-filters";

export function buildCategoryMenuItems(categories, t) {
  const menuItems = [{ title: t("allProducts"), link: "/shop" }];
  const seen = new Set(["/shop"]);

  const categoryList = Array.isArray(categories?.categories) ? categories.categories : [];
  categoryList.forEach((parentCategory) => {
    const parentName = parentCategory?.parent || parentCategory?.name;
    if (parentName) {
      const parentLink = `/shop?Category=${toFilterSlug(parentName)}`;
      if (!seen.has(parentLink)) {
        menuItems.push({ title: parentName, link: parentLink });
        seen.add(parentLink);
      }
    }
  });

  return menuItems;
}
