import { useRouter, useSearchParams } from "next/navigation";
import { buildShopRoute } from "src/utils/shop-filters";

const PriceItem = ({ id, min, max }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");

  // handlePrice
  const handlePrice = (min, max) => {
    const selected =
      (priceMin === `${min}` && searchParams.get("max") === `${max}`) ||
      priceMax === `${max}`;

    if (selected) {
      router.push(buildShopRoute(searchParams, { priceMin: null, max: null, priceMax: null }));
      return;
    }

    if (min) {
      router.push(buildShopRoute(searchParams, { priceMin: min, max, priceMax: null }));
    } else {
      router.push(buildShopRoute(searchParams, { priceMin: null, max: null, priceMax: max }));
    }
  };
  return (
    <div
      className={`shop__widget-list-item ${
        priceMin === `${min}` || priceMax === `${max}` ? "is-active" : ""
      }`}
    >
      <input
        onChange={() => handlePrice(min, max)}
        type="checkbox"
        id={`higher-${id}`}
        checked={priceMin === `${min}` || priceMax === `${max}`}
        readOnly
      />
      {max < 200 ? (
        <label htmlFor={`higher-${id}`}>
          ₺{min}.00 - ₺{max}.00
        </label>
      ) : (
        <label htmlFor={`higher-${id}`}>
          ₺{max}.00+
        </label>
      )}
    </div>
  );
};

export default PriceItem;
