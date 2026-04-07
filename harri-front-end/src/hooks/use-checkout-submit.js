"use client";
import * as dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { userLoggedOut } from "src/redux/features/auth/authSlice";
import { normalizeSavedAddresses } from "src/utils/saved-addresses";
import { useUpdateProfileMutation } from "src/redux/features/auth/authApi";
import { getFirstName, getFullName, getLastName, normalizeFirstAndLastName } from "src/utils/user-name";
import { useInitializePaymentMutation } from "src/redux/features/order/orderApi";

const useCheckoutSubmit = () => {
  const { t, lang } = useLanguage();
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  const [initializePayment] = useInitializePaymentMutation();
  const { cart_products } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { coupon_info } = useSelector((state) => state.coupon);
  const { shipping_info } = useSelector((state) => state.order);
  const { total } = useCartInfo();
  const [cartTotal, setCartTotal] = useState(0);
  const [minimumAmount, setMinimumAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0); // Always free as requested
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountProductType, setDiscountProductType] = useState("");
  const [isCheckoutSubmit, setIsCheckoutSubmit] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [useManualAddress, setUseManualAddress] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressDraft, setAddressDraft] = useState({
    label: "",
    address: "",
    city: "",
    country: "",
    zipCode: "",
  });
  const [showIyzicoModal, setShowIyzicoModal] = useState(false);
  const [checkoutFormContent, setCheckoutFormContent] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' or 'iyzico'
  const [isAgreementChecked, setIsAgreementChecked] = useState(false);
  const [updateProfile] = useUpdateProfileMutation();

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const couponRef = useRef("");

  useEffect(() => {
    const normalized = normalizeSavedAddresses(user?.savedAddresses);
    setSavedAddresses(normalized);

    const defaultAddress = normalized.find((item) => item?.isDefault) || normalized[0];
    setSelectedAddressId(defaultAddress?.id || "");
    setUseManualAddress(normalized.length === 0);
    setShowAddAddressForm(false);
  }, [user?.savedAddresses]);

  useEffect(() => {
    if (coupon_info) {
      setDiscountPercentage(coupon_info.discountPercentage || 0);
      setMinimumAmount(coupon_info.minimumAmount || 0);
      setDiscountProductType(coupon_info.productType || "");
    } else {
      setDiscountPercentage(0);
      setMinimumAmount(0);
      setDiscountProductType("");
    }
  }, [coupon_info]);

  useEffect(() => {
    if (cart_products.length === 0) {
      dispatch(clear_coupon());
      setCartTotal(0);
    }
  }, [cart_products.length, dispatch]);

  //calculate total and discount value
  useEffect(() => {
    if (cart_products.length === 0) {
      setDiscountAmount(0);
      setCartTotal(0);
      return;
    }

    const result = cart_products?.filter((p) => {
      const productType = p.parent || p.category?.name || p.type;
      return productType === discountProductType;
    });
    const discountProductTotal = result?.reduce(
      (preValue, currentValue) =>
        preValue + ((Number.isFinite(Number(currentValue.price))
          ? Number(currentValue.price)
          : ((currentValue.discount && currentValue.discount > 0)
              ? currentValue.originalPrice - (currentValue.originalPrice * currentValue.discount) / 100
              : currentValue.originalPrice)) * currentValue.orderQuantity),
      0
    );
    let subTotal = Number((total + shippingCost).toFixed(2));
    let discountTotal = Number(discountProductTotal * (discountPercentage / 100));
    let totalValue = Number(subTotal - discountTotal);
    setDiscountAmount(discountTotal);
    setCartTotal(totalValue);
  }, [
    total,
    shippingCost,
    discountPercentage,
    cart_products,
    discountProductType,
  ]);

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
    if (!user?.email) {
      return notifyError(t('couponLoginRequired'));
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
      dispatch(set_coupon({
        ...result[0],
        appliedByEmail: user.email.toLowerCase(),
      }));
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(clear_coupon());
    setDiscountAmount(0);
    setDiscountPercentage(0);
    setMinimumAmount(0);
    setDiscountProductType("");
    if (couponRef.current) {
      couponRef.current.value = "";
    }
    notifySuccess(t('couponRemoved'));
  };

  const handleShippingCost = (value) => {
    setShippingCost(0); // Ignore value, always free
  };

  // Formu doldur: önce kayıtlı shipping_info, yoksa user profilinden al
  useEffect(() => {
    setValue("firstName", shipping_info.firstName || getFirstName(user) || "");
    setValue("lastName", shipping_info.lastName || getLastName(user) || "");
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
    setValue("firstName", shipping_info.firstName || getFirstName(user) || "");
    setValue("lastName", shipping_info.lastName || getLastName(user) || "");
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

  const openAddAddressForm = () => {
    setShowAddAddressForm(true);
    setAddressDraft({
      label: "",
      address: "",
      city: "",
      country: "",
      zipCode: "",
    });
  };

  const cancelAddAddressForm = () => {
    setShowAddAddressForm(false);
  };

  const saveAddressFromCheckout = async () => {
    const label = (addressDraft.label || "").trim();
    const address = (addressDraft.address || "").trim();
    const city = (addressDraft.city || "").trim();
    const country = (addressDraft.country || "").trim();
    const zipCode = (addressDraft.zipCode || "").trim();

    if (!address || !city || !country || !zipCode) {
      notifyError(lang === "tr" ? "Adres, şehir, il/ülke ve posta kodu zorunludur." : "Address, city, country and zip code are required.");
      return;
    }

    const created = {
      id: `checkout-${Date.now()}`,
      label: label || (lang === "tr" ? "Evim" : "Home"),
      address,
      city,
      country,
      zipCode,
      isDefault: savedAddresses.length === 0,
    };

    const next = [...savedAddresses, created];
    const defaultAddress = next.find((a) => a.isDefault) || next[0];
    setIsSavingAddress(true);

    try {
      const userFirstName = getFirstName(user);
      const userLastName = getLastName(user);
      await updateProfile({
        name: getFullName({ firstName: userFirstName, lastName: userLastName }),
        firstName: userFirstName,
        lastName: userLastName,
        email: user?.email || "",
        phone: user?.phone || "",
        address: defaultAddress?.address || "",
        city: defaultAddress?.city || "",
        country: defaultAddress?.country || "",
        zipCode: defaultAddress?.zipCode || "",
        savedAddresses: JSON.stringify(next),
      }).unwrap();

      setSavedAddresses(next);
      setSelectedAddressId(created.id);
      setUseManualAddress(false);
      setShowAddAddressForm(false);

      setValue("address", created.address);
      setValue("city", created.city);
      setValue("country", created.country);
      setValue("zipCode", created.zipCode);

      notifySuccess(lang === "tr" ? "Adres profilinize kaydedildi." : "Address saved to your profile.");
    } catch (error) {
      notifyError(error?.data?.message || (lang === "tr" ? "Adres kaydedilemedi." : "Address could not be saved."));
    } finally {
      setIsSavingAddress(false);
    }
  };

  const closeIyzicoModal = () => {
    setShowIyzicoModal(false);
    setCheckoutFormContent("");
  };

  // submitHandler — iyzico ödeme başlatma
  const submitHandler = async (data) => {
    if (isCheckoutSubmit) return;
    dispatch(set_shipping(data));
    setIsCheckoutSubmit(true);

    const normalizedName = normalizeFirstAndLastName(data.firstName, data.lastName);
    const orderData = {
      name: normalizedName.fullName,
      firstName: normalizedName.firstName,
      lastName: normalizedName.lastName,
      address: data.address,
      contact: data.contact,
      email: data.email,
      city: data.city,
      country: data.country,
      zipCode: data.zipCode,
      shippingOption: data.shippingOption,
      cart: cart_products,
      shippingCost: shippingCost,
      couponCode: coupon_info?.couponCode || undefined,
    };

    try {
      const result = await initializePayment(orderData).unwrap();

      // iyzico redirect sonrası state kaybolur, sessionStorage'a kaydet
      if (typeof window !== "undefined") {
        sessionStorage.setItem("iyzico_conversation_id", result.conversationId || "");
        sessionStorage.setItem("iyzico_pending_order", JSON.stringify(orderData));
      }

      setCheckoutFormContent(result.checkoutFormContent || "");
      setShowIyzicoModal(true);
    } catch (err) {
      const status = err?.status;
      if (status === 401 || status === 403) {
        notifyError(
          lang === "tr"
            ? "Oturumunuz sona ermiş görünüyor. Lütfen tekrar giriş yapın."
            : "Your session appears to have expired. Please sign in again."
        );
        dispatch(userLoggedOut());
        router.push("/login?redirect=/checkout");
      } else {
        notifyError(err?.data?.message || t("orderCreateFailed"));
      }
    } finally {
      setIsCheckoutSubmit(false);
    }
  };

  return {
    handleCouponCode,
    handleRemoveCoupon,
    couponRef,
    appliedCoupon: coupon_info,
    handleShippingCost,
    discountAmount,
    total,
    shippingCost,
    discountPercentage,
    discountProductType,
    isCheckoutSubmit,
    register,
    errors,
    submitHandler,
    handleSubmit,
    watch,
    cartTotal,
    savedAddresses,
    selectedAddressId,
    applySavedAddress,
    useManualAddress,
    enableManualAddress,
    selectedSavedAddress,
    showAddAddressForm,
    openAddAddressForm,
    cancelAddAddressForm,
    addressDraft,
    setAddressDraft,
    saveAddressFromCheckout,
    isSavingAddress,
    showIyzicoModal,
    checkoutFormContent,
    closeIyzicoModal,
    paymentMethod,
    setPaymentMethod,
    isAgreementChecked,
    setIsAgreementChecked,
  };
};

export default useCheckoutSubmit;
