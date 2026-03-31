'use client';
import React, { useState } from "react";
import Search from "@svg/search";
import { useRouter } from "next/navigation";
import { useLanguage } from "src/context/LanguageContext";

const SearchForm = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState("");
  const { t } = useLanguage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText) {
      router.push(`/search?query=${searchText}`);
      setSearchText("");
    } else {
      router.push(`/ `);
      setSearchText("");
    }
  };
  return (
    <form onSubmit={handleSubmit}>
      <div className="header__search-input-13 d-none d-xxl-block">
        <input
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
          type="text"
          placeholder={t('searchPlaceholder')}
        />
        <button type="submit">
          <Search />
        </button>
      </div>
    </form>
  );
};

export default SearchForm;
