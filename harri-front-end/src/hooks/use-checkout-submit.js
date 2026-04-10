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
import { useGetSiteSettingsQuery } from "src/redux/features/siteSettingsApi";

const normalizeCompareText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "");

const getItemProductTypeCandidates = (item) => {
  const candidates = [
    item?.parent,
    item?.category?.name,
    item?.type,
    item?.productType,
  ];
  return candidates.map(normalizeCompareText).filter(Boolean);
};

const getItemUnitPrice = (item) => {
  const numericPrice = Number(item?.price);
  if (Number.isFinite(numericPrice)) return numericPrice;
  const original = Number(item?.originalPrice || 0);
  const discount = Number(item?.discount || 0);
  if (discount > 0) {
    return original - (original * discount) / 100;
  }
  return original;
};

const roundCurrency = (value) => Number(Number(value || 0).toFixed(2));

const isAllProductsScope = (coupon) =>
  String(coupon?.productScope || "").toUpperCase() === "ALL_PRODUCTS";

const isBeforeStart = (rawStartTime) => {
  if (!rawStartTime) return false;
  const start = dayjs(rawStartTime);
  if (!start.isValid()) return false;
  return dayjs().isBefore(start);
};

const isExpired = (rawEndTime) => {
  if (!rawEndTime) return false;
  const end = dayjs(rawEndTime);
  if (!end.isValid()) return false;
  return dayjs().isAfter(end);
};

const useCheckoutSubmit = () => {
  const DEFAULT_FREE_SHIPPING_THRESHOLD = 400;
  const DEFAULT_SHIPPING_FEE = 49.9;
  const MIN_CHECKOUT_LOADING_MS = 900;
  const { t, lang } = useLanguage();
  const { data: siteSettings } = useGetSiteSettingsQuery();
  const { data: offerCoupons, isError, isLoading } = useGetOfferCouponsQuery();
  const [initializePayment] = useInitializePaymentMutation();
  const { cart_products } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const { coupon_info } = useSelector((state) => state.coupon);
  const { shipping_info } = useSelector((state) => state.order);
  const { total } = useCartInfo();
  const [minimumAmount, setMinimumAmount] = useState(0);
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
    // Reset payment states when entering checkout
    setShowIyzicoModal(false);
    setCheckoutFormContent("");
    setIsCheckoutSubmit(false);
  }, []);

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
    }
  }, [cart_products.length, dispatch]);

  const freeShippingThreshold = Number(
    siteSettings?.freeShippingThreshold ?? DEFAULT_FREE_SHIPPING_THRESHOLD
  );
  const defaultShippingFee = Number(
    siteSettings?.defaultShippingFee ?? DEFAULT_SHIPPING_FEE
  );

  const subtotalAmount = roundCurrency(total);
  const shippingCost = roundCurrency(
    subtotalAmount >= freeShippingThreshold ? 0 : defaultShippingFee
  );
  const normalizedCouponType = normalizeCompareText(discountProductType);
  const discountBase = normalizedCouponType
    ? cart_products.reduce((acc, item) => {
        const candidates = getItemProductTypeCandidates(item);
        if (!candidates.includes(normalizedCouponType)) {
          return acc;
        }
        return acc + getItemUnitPrice(item) * Number(item?.orderQuantity || 0);
      }, 0)
    : subtotalAmount;
  const discountAmount = roundCurrency(discountBase * (discountPercentage / 100));
  const cartTotal = roundCurrency(
    Math.max(0, subtotalAmount + shippingCost - discountAmount)
  );
  const remainingForFreeShipping = roundCurrency(
    Math.max(0, freeShippingThreshold - subtotalAmount)
  );
  const isFreeShipping = shippingCost <= 0;

  // handleCouponCode
  const handleCouponCode = (e) => {
    e.preventDefault();
    const enteredCode = couponRef.current?.value?.trim();
    const currentEmail = user?.email || watch("email");

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
    if (!currentEmail) {
      return notifyError(lang === "tr" ? "Kupon kullanmak için email adresinizi giriniz." : "Enter your email to use a coupon.");
    }
    const result = offerCoupons?.filter(
      (coupon) => coupon.couponCode?.toLowerCase() === enteredCode.toLowerCase()
    );

    if (result.length < 1) {
      notifyError(t('couponInvalid'));
      return;
    }

    const coupon = result[0];

    if (isBeforeStart(coupon?.startTime)) {
      notifyError(lang === "tr" ? "Bu kupon henüz aktif değil." : "This coupon is not active yet.");
      return;
    }

    if (isExpired(coupon?.endTime)) {
      notifyError(t('couponExpired'));
      return;
    }

    if (total < coupon?.minimumAmount) {
      notifyError(`${t('couponMinimumAmount')} ₺${coupon.minimumAmount}`);
      return;
    }

    const eligibleTotal = isAllProductsScope(coupon)
      ? Number(total || 0)
      : cart_products.reduce((acc, item) => {
          const couponType = normalizeCompareText(coupon?.productType);
          const candidates = getItemProductTypeCandidates(item);
          if (!couponType || !candidates.includes(couponType)) {
            return acc;
          }
          return acc + getItemUnitPrice(item) * Number(item?.orderQuantity || 0);
        }, 0);

    if (eligibleTotal <= 0) {
      notifyError(lang === "tr" ? "Bu kupon sepetteki ürünlere uygulanamıyor." : "This coupon does not match products in your cart.");
      return;
    } else {
      notifySuccess(`${coupon.title} ${t('couponAppliedSuccess')}`);
      setMinimumAmount(coupon?.minimumAmount);
      setDiscountProductType(coupon.productType || "");
      setDiscountPercentage(coupon.discountPercentage);
      dispatch(set_coupon({
        ...coupon,
        appliedByEmail: currentEmail.toLowerCase(),
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
    setIsCheckoutSubmit(false);
  };

  // submitHandler — iyzico ödeme başlatma
  const submitHandler = async (data) => {
    if (isCheckoutSubmit) return;
    const submitStartedAt = Date.now();
    dispatch(set_shipping(data));
    setIsCheckoutSubmit(true);

    if (coupon_info?.couponCode) {
      const eligibleTotal = isAllProductsScope(coupon_info)
        ? Number(total || 0)
        : cart_products.reduce((acc, item) => {
            const couponType = normalizeCompareText(coupon_info?.productType);
            const candidates = getItemProductTypeCandidates(item);
            if (!couponType || !candidates.includes(couponType)) {
              return acc;
            }
            return acc + getItemUnitPrice(item) * Number(item?.orderQuantity || 0);
          }, 0);

      if (total < Number(coupon_info?.minimumAmount || 0)) {
        notifyError(lang === "tr" ? "Kupon için minimum sepet tutarı artık sağlanmıyor." : "Minimum cart amount is no longer met for this coupon.");
        setIsCheckoutSubmit(false);
        return;
      }

      if (eligibleTotal <= 0) {
        notifyError(lang === "tr" ? "Kupon sepetteki ürünlere uygulanamıyor. Lütfen kuponu kaldırın." : "Coupon no longer matches your cart. Please remove it.");
        setIsCheckoutSubmit(false);
        return;
      }
    }

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
      subTotal: subtotalAmount,
      discountAmount: discountAmount,
      totalAmount: cartTotal,
      couponCode: coupon_info?.couponCode || undefined,
    };

    try {
      const result = await initializePayment(orderData).unwrap();
      const elapsed = Date.now() - submitStartedAt;
      if (elapsed < MIN_CHECKOUT_LOADING_MS) {
        await new Promise((resolve) => setTimeout(resolve, MIN_CHECKOUT_LOADING_MS - elapsed));
      }

      setCheckoutFormContent(result.checkoutFormContent || "");
      setShowIyzicoModal(true);
    } catch (err) {
      const status = err?.status;
      // We now allow guest checkout, so we don't automatically redirect on 401/403.
      // 401/403 might still happen if the endpoint was wrongly restricted.
      notifyError(err?.data?.message || t("orderCreateFailed"));
    } finally {
      setIsCheckoutSubmit(false);
    }
  };

  return {
    handleCouponCode,
    handleRemoveCoupon,
    couponRef,
    appliedCoupon: coupon_info,
    discountAmount,
    total,
    shippingCost,
    isFreeShipping,
    remainingForFreeShipping,
    subtotalAmount,
    defaultShippingFee,
    freeShippingThreshold,
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
