'use client';
import React, { useState } from "react";
import Link from "next/link";
// internal
import getMenuData from "@layout/menu-data";
import { useLanguage } from "src/context/LanguageContext";

const MobileMenus = () => {
  const [navTitle, setNavTitle] = useState("");
  const { t } = useLanguage();
  const menu_data = getMenuData(t);

  const openMobileMenu = (menu) => {
    setNavTitle(navTitle === menu ? "" : menu);
  };

  return (
    <nav className="mean-nav">
      <ul>
        {menu_data.map((menu, i) => (
          <React.Fragment key={i}>
            {!menu.hasDropdown && (
              <li>
                <Link href={menu.link}>{menu.title}</Link>
              </li>
            )}
            {menu.hasDropdown && (
              <li className="has-dropdown">
                <Link href={menu.link}>{menu.title}</Link>
                <ul
                  className="submenu"
                  style={{ display: navTitle === menu.title ? "block" : "none" }}
                >
                  {menu.submenus.map((sub, i) => (
                    <li key={i}>
                      <Link href={sub.link}>{sub.title}</Link>
                    </li>
                  ))}
                </ul>
                <a
                  className={`mean-expand ${navTitle === menu.title ? "mean-clicked" : ""}`}
                  href="#"
                  onClick={() => openMobileMenu(menu.title)}
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
