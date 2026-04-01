'use client';
import BoxItems from "./box-items";
import FormArea from "./form-area";
import LocationArea from "./location-area";
import CartBreadcrumb from "@components/cart/cart-breadcrumb";

const ContactArea = () => {
  return (
    <>
      <CartBreadcrumb title="contact" subtitle="contact" />
      <BoxItems/>
      <FormArea/>
      <LocationArea/>
    </>
  );
};

export default ContactArea;

