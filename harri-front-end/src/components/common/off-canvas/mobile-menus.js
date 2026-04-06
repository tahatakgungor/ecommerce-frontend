'use client';
import React, { useState } from "react";
import Link from "next/link";
// internal
import getMenuData from "@layout/menu-data";
import { useLanguage } from "src/context/LanguageContext";
import { useGetCategoriesQuery } from "src/redux/features/categoryApi";
import { buildCategoryMenuItems } from "src/utils/category-menu";

const MobileMenus = ({ setIsOffCanvasOpen }) => {
  const [navTitle, setNavTitle] = useState("");
  const { t } = useLanguage();
  const { data: categories } = useGetCategoriesQuery();
  const categorySubmenus = buildCategoryMenuItems(categories, t);
  const menu_data = getMenuData(t, categorySubmenus);

  const openMobileMenu = (menu) => {
    setNavTitle(navTitle === menu ? "" : menu);
  };

  const closeMenu = () => {
    setIsOffCanvasOpen(false);
    setNavTitle("");
  };

  return (
    <nav className="mean-nav">
      <ul>
        {menu_data.map((menu, i) => (
          <React.Fragment key={i}>
            {!menu.hasDropdown && (
              <li>
                <Link href={menu.link} onClick={closeMenu}>{menu.title}</Link>
              </li>
            )}
            {menu.hasDropdown && (
              <li className="has-dropdown">
                <Link href={menu.link} onClick={closeMenu}>{menu.title}</Link>
                <ul
                  className="submenu"
                  style={{ display: navTitle === menu.title ? "block" : "none" }}
                >
                  {menu.submenus.map((sub, i) => (
                    <li key={i}>
                      <Link href={sub.link} onClick={closeMenu}>{sub.title}</Link>
                    </li>
                  ))}
                </ul>
                <a
                  className={`mean-expand ${navTitle === menu.title ? "mean-clicked" : ""}`}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    openMobileMenu(menu.title);
                  }}
                  style={{ fontSize: "18px" }}
                >
                  <i className="fal fa-plus"></i>
                </a>
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
};

export default MobileMenus;
