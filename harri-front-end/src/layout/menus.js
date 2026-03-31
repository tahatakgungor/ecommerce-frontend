'use client';
import Link from 'next/link';
import React from 'react';
import getMenuData from './menu-data';
import { useLanguage } from 'src/context/LanguageContext';

const Menus = () => {
  const { t } = useLanguage();
  const menu_data = getMenuData(t);

  return (
    <ul>
      {menu_data.map((menu, i) => (
        <li key={i} className={`${menu.hasDropdown ? 'has-dropdown' : ''}`}>
          <Link href={`${menu.link}`}>
            {menu.title}
          </Link>
          {menu.hasDropdown && <ul className="submenu">
            {menu.submenus.map((sub, i) => (
              <li key={i}>
                <Link href={`${sub.link}`}>
                  {sub.title}
                </Link>
              </li>
            ))}
          </ul>}
        </li>
      ))}
    </ul>
  );
};

export default Menus;
