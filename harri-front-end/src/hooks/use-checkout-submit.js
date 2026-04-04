"use client";
import { safeGetItem, safeRemoveItem } from "@utils/localstorage";
import * as dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
//internal import
import { notifyError, notifySuccess } from "@utils/toast";
import { useGetOfferCouponsQuery } from "src/redux/features/coupon/couponApi";
import { clear_coupon, set_coupon } from "src/redux/features/coupon/couponSlice";
import { clear_cart } from "src/redux/features/cartSlice";
import { useLanguage } from "src/context/LanguageContext";
import useCartInfo from "./use-cart-info";
import { set_shipping } from "src/redux/features/order/orderSlice";
import {
  useAddOrderMutation,
  useCreatePaymentIntentMutation,
} from "src/redux/features/order/orderApi";

const useCheckoutSubmit = () => {
  const { t } = useLanguage();
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  const [addOrder, {}] = useAddOrderMutation();
  const [createPaymentIntent, {}] = useCreatePaymentIntentMutation();
  const { cart_products } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { shipping_info } = useSelector((state) => state.order);
  const { total, setTotal } = useCartInfo();
  const [cartTotal, setCartTotal] = useState("");
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountProductType, setDiscountProductType] = useState("");
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [cardError, setCardError] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useManualAddress, setUseManualAddress] = useState(false);
  
  const dispatch = useDispatch();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  const couponRef = useRef("");

  useEffect(() => {
    try {
      const parsed = JSON.parse(user?.savedAddresses || "[]");
      const normalized = Array.isArray(parsed) ? parsed : [];
      setSavedAddresses(normalized);

      const defaultAddress = normalized.find((item) => item?.isDefault) || normalized[0];
      setSelectedAddressId(defaultAddress?.id || "");
      setUseManualAddress(normalized.length === 0);
    } catch {
      setSavedAddresses([]);
      setSelectedAddressId("");
      setUseManualAddress(true);
    }
  }, [user?.savedAddresses]);

  useEffect(() => {
    if (safeGetItem("couponInfo")) {
      const data = safeGetItem("couponInfo");
      const coupon = JSON.parse(data);
      setDiscountPercentage(coupon.discountPercentage);
      setMinimumAmount(coupon.minimumAmount);
      setDiscountProductType(coupon.productType);
    }
  }, []);

  useEffect(() => {
    if (minimumAmount - discountAmount > total || cart_products.length === 0) {
      setDiscountPercentage(0);
      setMinimumAmount(0);
      setDiscountProductType("");
      dispatch(clear_coupon());
    }
  }, [minimumAmount, total, discountAmount, cart_products, dispatch]);

  //calculate total and discount value
  useEffect(() => {
    const result = cart_products?.filter((p) => {
      const productType = p.parent || p.category?.name || p.type;
      return productType === discountProductType;
    });
    const discountProductTotal = result?.reduce(
      (preValue, currentValue) =>
        preValue + (((currentValue.discount && currentValue.discount > 0)
          ? currentValue.originalPrice - (currentValue.originalPrice * currentValue.discount) / 100
          : currentValue.originalPrice) * currentValue.orderQuantity),
      0
    );
    let totalValue = "";
    let subTotal = Number((total + shippingCost).toFixed(2));
    let discountTotal = Number(
      discountProductTotal * (discountPercentage / 100)
    );
    totalValue = Number(subTotal - discountTotal);
    setDiscountAmount(discountTotal);
    setCartTotal(totalValue);
  }, [
    total,
    shippingCost,
    discountPercentage,
    cart_products,
    discountProductType,
    discountAmount,
    cartTotal,
  ]);

  // create payment intent
  useEffect(() => {
    if (cartTotal) {
      createPaymentIntent({
        cart: cart_products,
        shippingCost,
        couponCode: safeGetItem("couponInfo") ? JSON.parse(safeGetItem("couponInfo")).couponCode : undefined,
      })
        .then((data) => {
          setClientSecret(data?.data?.clientSecret || "");
        })
        .catch(() => {});
    }
  }, [createPaymentIntent, cartTotal, cart_products, shippingCost]);

  // handleCouponCode
  const handleCouponCode = (e) => {
    e.preventDefault();
    const enteredCode = couponRef.current?.value?.trim();

    if (!enteredCode) {
      notifyError(t('couponCodeRequired'));
      return;
    }
    if (isLoading) {
      return;
    }
    if (isError) {
      return notifyError(t('somethingWentWrong'));
    }
    const result = offerCoupons?.filter(
      (coupon) => coupon.couponCode?.toLowerCase() === enteredCode.toLowerCase()
    );

    if (result.length < 1) {
      notifyError(t('couponInvalid'));
      return;
    }

    if (dayjs().isAfter(dayjs(result[0]?.endTime))) {
      notifyError(t('couponExpired'));
      return;
    }

    if (total < result[0]?.minimumAmount) {
      notifyError(`${t('couponMinimumAmount')} ₺${result[0].minimumAmount}`);
      return;
    } else {
      notifySuccess(`${result[0].title} ${t('couponAppliedSuccess')}`);
      setMinimumAmount(result[0]?.minimumAmount);
      setDiscountProductType(result[0].productType);
      setDiscountPercentage(result[0].discountPercentage);
      dispatch(set_coupon(result[0]));
    }
  };

  // handleShippingCost
  const handleShippingCost = (value) => {
    // setTotal(total + value);
    setShippingCost(value);
  };

  // Formu doldur: önce kayıtlı shipping_info, yoksa user profilinden al
  useEffect(() => {
    setValue("firstName", shipping_info.firstName || user?.name || "");
    setValue("lastName", shipping_info.lastName || "");
    setValue("address", shipping_info.address || user?.address || "");
    setValue("city", shipping_info.city || user?.city || "");
    setValue("country", shipping_info.country || user?.country || "");
    setValue("zipCode", shipping_info.zipCode || user?.zipCode || "");
    setValue("email", shipping_info.email || user?.email || "");
    setValue("contact", shipping_info.contact || user?.phone || "");
  }, [user, setValue, shipping_info, router]);

  const applySavedAddress = (addressId) => {
    setSelectedAddressId(addressId);
    setUseManualAddress(false);

    const selectedAddress = savedAddresses.find((item) => item?.id === addressId);
    if (!selectedAddress) {
      return;
    }

    setValue("address", selectedAddress.address || "");
    setValue("city", selectedAddress.city || "");
    setValue("country", selectedAddress.country || "");
    setValue("zipCode", selectedAddress.zipCode || "");
    setValue("contact", shipping_info.contact || user?.phone || "");
    setValue("email", shipping_info.email || user?.email || "");
    setValue("firstName", shipping_info.firstName || user?.name || "");
    setValue("lastName", shipping_info.lastName || "");
  };

  const enableManualAddress = () => {
    setSelectedAddressId("");
    setUseManualAddress(true);
    setValue("address", "");
    setValue("city", "");
    setValue("country", "");
    setValue("zipCode", "");
  };

  const selectedSavedAddress =
    savedAddresses.find((item) => item?.id === selectedAddressId) || null;

  // submitHandler — çift tıklamayı engelle
  const submitHandler = async (data) => {
    if (isCheckoutSubmit) return;
    dispatch(set_shipping(data));
    setIsCheckoutSubmit(true);

    let orderInfo = {
      name: `${data.firstName} ${data.lastName}`,
      address: data.address,
      contact: data.contact,
      email: data.email,
      city: data.city,
      country: data.country,
      zipCode: data.zipCode,
      shippingOption: data.shippingOption,
      status: "pending",
      cart: cart_products,
      subTotal: total,
      shippingCost: shippingCost,
      discount: discountAmount,
      totalAmount: cartTotal,
      couponCode: safeGetItem("couponInfo") ? JSON.parse(safeGetItem("couponInfo")).couponCode : undefined
    };
    if (!stripe || !elements) {
      return;
    }
    const card = elements.getElement(CardElement);
    if (card == null) {
      return;
    }
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card,
    });

    if (error) {
      setCardError(error?.message);
      setIsCheckoutSubmit(false);
    } else {
      setCardError("");
      const orderData = {
        ...orderInfo,
        cardInfo: paymentMethod,
      };
      await handlePaymentWithStripe(orderData);
    }
  };

  // handlePaymentWithStripe
  const handlePaymentWithStripe = async (order) => {
    try {
      const { paymentIntent, error: intentErr } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: user?.name,
              email: user?.email,
            },
          },
        });
      if (intentErr) {
        notifyError(intentErr.message);
        setIsCheckoutSubmit(false);
        return;
      }

      const orderData = {
        ...order,
        paymentIntent,
      };

      const result = await addOrder({ ...orderData });
      if (result?.error) {
        notifyError(t("orderCreateFailed"));
      } else {
        dispatch(clear_cart());
        notifySuccess(t("orderCreateSuccess"));
        router.push(`/order/${result.data?.order?._id}`);
      }
    } catch (err) {
      notifyError(t("orderCreateFailed"));
    } finally {
      setIsCheckoutSubmit(false);
    }
  };

  return {
    handleCouponCode,
    couponRef,
    handleShippingCost,
    discountAmount,
    total,
    shippingCost,
    discountPercentage,
    discountProductType,
    isCheckoutSubmit,
    setTotal,
    register,
    errors,
    cardError,
    submitHandler,
    stripe,
    handleSubmit,
    clientSecret,
    setClientSecret,
    cartTotal,
    savedAddresses,
    selectedAddressId,
    applySavedAddress,
    useManualAddress,
    enableManualAddress,
    selectedSavedAddress,
  };
};

export default useCheckoutSubmit;
