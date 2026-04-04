
import ShopDetailsMainArea from "@components/product-details/product-details-area-main";


export const metadata = {
  title: "Product Details - Serravit",
};

const ProductDetailsPage = async ({ params, searchParams }) => {
  const { id } = await params;
  const qp = await searchParams;
  const initialTab = typeof qp?.tab === "string" ? qp.tab : null;
  return <ShopDetailsMainArea id={id} initialTab={initialTab} />;
};

export default ProductDetailsPage;
