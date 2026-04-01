'use client';
import React, { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Search from "@svg/search";
import { useLanguage } from "src/context/LanguageContext";
import { useGetShowingProductsQuery } from "src/redux/features/productApi";
import useClickOutside from "@hooks/use-click-outside";

const SearchForm = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Use cached product data — no extra API calls
  const { data } = useGetShowingProductsQuery();
  const allProducts = data?.products ?? [];

  // Filter suggestions — top 5 matching products
  const suggestions = searchText.trim().length > 0
    ? allProducts
        .filter((p) =>
          p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.category?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.brand?.name?.toLowerCase().includes(searchText.toLowerCase())
        )
        .slice(0, 5)
    : [];

  // Close dropdown when user clicks outside
  const handleClickOutside = useCallback(() => setIsOpen(false), []);
  useClickOutside(wrapperRef, handleClickOutside);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchText.trim())}`);
    } else {
      router.push("/");
    }
    setSearchText("");
    setIsOpen(false);
  };

  const handleChange = (e) => {
    setSearchText(e.target.value);
    setIsOpen(true);
  };

  const handleSuggestionClick = (id) => {
    router.push(`/product-details/${id}`);
    setSearchText("");
    setIsOpen(false);
  };

  const showDropdown = isOpen && searchText.trim().length > 0;

  return (
    <div ref={wrapperRef} className="tp-search-wrapper" style={{ position: "relative" }}>
      <form onSubmit={handleSubmit}>
        <div className="header__search-input-13">
          <input
            onChange={handleChange}
            onFocus={() => searchText.trim().length > 0 && setIsOpen(true)}
            value={searchText}
            type="text"
            placeholder={t("searchPlaceholder")}
            autoComplete="off"
          />
          <button type="submit" aria-label="Search">
            <Search />
          </button>
        </div>
      </form>

      {/* ── Autocomplete Dropdown ── */}
      {showDropdown && (
        <div className="tp-search-dropdown">
          {suggestions.length === 0 ? (
            <div className="tp-search-dropdown__empty">
              <span>{t("noResults") || "Sonuç bulunamadı"}</span>
            </div>
          ) : (
            <ul>
              {suggestions.map((product) => (
                <li key={product._id}>
                  <button
                    type="button"
                    onClick={() => handleSuggestionClick(product._id)}
                    className="tp-search-dropdown__item"
                  >
                    <div className="tp-search-dropdown__thumb">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.title}
                          width={48}
                          height={48}
                          style={{ objectFit: "cover", borderRadius: "6px" }}
                        />
                      ) : (
                        <div className="tp-search-dropdown__thumb-placeholder" />
                      )}
                    </div>
                    <div className="tp-search-dropdown__info">
                      <span className="tp-search-dropdown__title">
                        {product.title}
                      </span>
                      {product.category?.name && (
                        <span className="tp-search-dropdown__category">
                          {product.category.name}
                        </span>
                      )}
                    </div>
                    <div className="tp-search-dropdown__price">
                      ₺{product.originalPrice?.toFixed(2)}
                    </div>
                  </button>
                </li>
              ))}
              {/* View all results link */}
              <li>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="tp-search-dropdown__view-all"
                >
                  <Search />
                  <span>
                    {t("viewAllResults") || "Tüm sonuçları gör"} &ldquo;{searchText}&rdquo;
                  </span>
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchForm;
