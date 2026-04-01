import Link from 'next/link';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const NavLink = ({ href, children }) => {
  const router = useRouter();
  const [activeLink, setActiveLink] = React.useState(router.pathname);
  useEffect(() => {
    setActiveLink(router.pathname);
  }, [router.pathname]);
  return (
    <Link href={href}>
      {children}
    </Link>
  );
}

export default NavLink;
