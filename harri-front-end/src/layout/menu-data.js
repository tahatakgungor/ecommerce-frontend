const fallbackCategorySubmenus = (t) => [
  { title: t("allProducts"), link: "/shop" },
];

const getMenuData = (t, categorySubmenus = null) => [
  {
    id: 1,
    title: t('home'),
    link: '/',
  },
  {
    id: 2,
    title: t('about'),
    link: '/about',
  },
  {
    id: 3,
    hasDropdown: true,
    title: t('categoriesMenu'),
    link: '/shop',
    submenus: categorySubmenus && categorySubmenus.length > 0
      ? categorySubmenus
      : fallbackCategorySubmenus(t),
  },
  {
    id: 4,
    hasDropdown: true,
    title: t('pages'),
    link: '/about',
    submenus: [
      { title: t('blog'), link: '/blog' },
      { title: t('faqs'), link: '/faq' },
      { title: t('privacy'), link: '/policy' },
      { title: t('terms'), link: '/terms' },
    ],
  },
  {
    id: 5,
    title: t('contactUs'),
    link: '/contact',
  },
];

export default getMenuData;
