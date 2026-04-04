'use client';
import React, { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
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
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const dropdownRef = useRef(null);
  const outsideSafeRefs = useMemo(() => [dropdownRef], []);

  const { data } = useGetShowingProductsQuery();
  const allProducts = data?.products ?? [];

  const suggestions = searchText.trim().length > 0
    ? allProducts
        .filter((p) =>
          p.title?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.category?.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          p.brand?.name?.toLowerCase().includes(searchText.toLowerCase())
        )
        .slice(0, 5)
    : [];

  const handleClickOutside = useCallback(() => setIsOpen(false), []);
  useClickOutside(wrapperRef, handleClickOutside, outsideSafeRefs);

  const updateDropdownPosition = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : rect.width;
    const desiredWidth = Math.max(rect.width, 280);
    const width = Math.min(desiredWidth, viewportWidth - 16);
    const left = Math.max(8, Math.min(rect.left, viewportWidth - width - 8));

    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 8,
      left,
      width,
      zIndex: 99999,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateDropdownPosition();
    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);
    return () => {
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [isOpen, searchText, updateDropdownPosition]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (searchText.trim()) {
      router.push(`/search?query=${encodeURIComponent(searchText.trim())}`);
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

  const dropdown = showDropdown ? (
    <div ref={dropdownRef} className="tp-search-dropdown" style={dropdownStyle}>
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
                  <span className="tp-search-dropdown__title">{product.title}</span>
                  {product.category?.name && (
                    <span className="tp-search-dropdown__category">{product.category.name}</span>
                  )}
                </div>
                <div className="tp-search-dropdown__price">
                  ₺{product.originalPrice?.toFixed(2)}
                </div>
              </button>
            </li>
          ))}
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
  ) : null;

  return (
    <div ref={wrapperRef} className="tp-search-wrapper">
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
      {typeof document !== "undefined" && createPortal(dropdown, document.body)}
    </div>
  );
};

export default SearchForm;
