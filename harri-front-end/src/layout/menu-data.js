const getMenuData = (t) => [
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
    title: t('shop'),
    link: '/shop',
  },
  {
    id: 4,
    hasDropdown: true,
    title: t('pages'),
    link: '/about',
    submenus: [
      { title: t('faqs'), link: '/faq' },
      { title: t('privacy'), link: '/policy' },
      { title: t('terms'), link: '/terms' },
      { title: t('login'), link: '/login' },
      { title: t('register'), link: '/register' },
      { title: t('forgotPassword'), link: '/forgot' },
      { title: t('cart'), link: '/cart' },
      { title: t('wishlist'), link: '/wishlist' },
      { title: t('checkout'), link: '/checkout' },
    ],
  },
  {
    id: 5,
    title: t('contactUs'),
    link: '/contact',
  },
];

export default getMenuData;
