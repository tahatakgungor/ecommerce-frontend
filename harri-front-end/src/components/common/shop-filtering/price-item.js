import { useRouter, useSearchParams } from "next/navigation";
import { buildShopRoute, resolvePriceFilters } from "src/utils/shop-filters";
import { useLanguage } from "src/context/LanguageContext";

const PriceItem = ({ id, min, max }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const priceMin = searchParams.get("priceMin");
  const rangeMax = searchParams.get("max");
  const priceMax = searchParams.get("priceMax");
  const { minPrice, maxPrice } = resolvePriceFilters({ priceMin, max: rangeMax, priceMax });
  const currencyFormatter = new Intl.NumberFormat(lang === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  });
  const isSelected = minPrice === min && ((maxPrice === null && max === null) || maxPrice === max);

  const handlePrice = (min, max) => {
    if (isSelected) {
      router.push(buildShopRoute(searchParams, { priceMin: null, max: null, priceMax: null }));
      return;
    }

    if (min !== undefined && max !== undefined) {
      router.push(buildShopRoute(searchParams, { priceMin: min, max, priceMax: null }));
    } else {
      router.push(buildShopRoute(searchParams, { priceMin: max, max: null, priceMax: null }));
    }
  };

  return (
    <div className={`shop__widget-list-item ${isSelected ? "is-active" : ""}`}>
      <input
        onChange={() => handlePrice(min, max)}
        type="checkbox"
        id={`higher-${id}`}
        checked={isSelected}
      />
      {max !== null ? (
        <label htmlFor={`higher-${id}`}>
          {currencyFormatter.format(min)} - {currencyFormatter.format(max)}
        </label>
      ) : (
        <label htmlFor={`higher-${id}`}>
          {currencyFormatter.format(min)}+
        </label>
      )}
    </div>
  );
};

export default PriceItem;
