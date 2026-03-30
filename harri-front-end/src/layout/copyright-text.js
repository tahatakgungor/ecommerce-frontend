import Link from "next/link";
import React from "react";

const CopyrightText = () => {
  return (
    <p>
      Copyright © {new Date().getFullYear()} <Link href="/">SERRAVİT</Link> — Humat Kimya İlaç Kozmetik Gıda Çevre San. Tic. Ltd. Şti. Tüm hakları saklıdır.
    </p>
  );
};

export default CopyrightText;
