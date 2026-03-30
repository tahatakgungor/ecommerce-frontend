"use client";
import { createContext, useContext, useState } from "react";

const translations = {
  tr: {
    // Nav
    home: "Ana Sayfa",
    about: "Hakkımızda",
    shop: "Mağaza",
    contact: "İletişim",
    pages: "Sayfalar",
    faqs: "SSS",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    forgotPassword: "Şifremi Unuttum",
    cart: "Sepetim",
    wishlist: "Favorilerim",
    checkout: "Ödeme",
    error404: "Hata 404",

    // Header
    searchPlaceholder: "Ürün ara...",
    welcomeBack: "Tekrar Hoşgeldiniz!",
    signOut: "Çıkış Yap",
    myProfile: "Profilim",
    myOrders: "Siparişlerim",

    // Hero / Home
    heroSubtitle: "Hızlı ve Güçlü Detoks",
    heroTitle: "Doğanın Gücüyle\nSağlıklı Yaşam",
    heroDescription: "Humik asit bazlı doğal ürünlerimizle bağışıklık sisteminizi güçlendirin, vücudunuzu toksinlerden arındırın.",
    shopNow: "Hemen Alışveriş Yap",
    learnMore: "Daha Fazla Bilgi",

    // Products
    featuredProducts: "Öne Çıkan Ürünler",
    discountProducts: "İndirimli Ürünler",
    relatedProducts: "Benzer Ürünler",
    addToCart: "Sepete Ekle",
    addedToCart: "Sepete Eklendi",
    buyNow: "Hemen Satın Al",
    inStock: "Stokta Var",
    outOfStock: "Stokta Yok",
    quantity: "Adet",
    sku: "Ürün Kodu",
    category: "Kategori",
    brand: "Marka",
    description: "Açıklama",
    reviews: "Yorumlar",

    // Cart
    myCart: "Sepetim",
    cartEmpty: "Sepetiniz boş",
    continueShopping: "Alışverişe Devam Et",
    proceedToCheckout: "Ödemeye Geç",
    subtotal: "Ara Toplam",
    total: "Toplam",
    remove: "Kaldır",

    // Checkout
    billingDetails: "Fatura Bilgileri",
    firstName: "Ad",
    lastName: "Soyad",
    address: "Adres",
    city: "Şehir",
    country: "Ülke",
    zipCode: "Posta Kodu",
    phone: "Telefon",
    email: "E-posta",
    orderNotes: "Sipariş Notu",
    placeOrder: "Siparişi Tamamla",
    paymentMethod: "Ödeme Yöntemi",
    orderSummary: "Sipariş Özeti",
    shipping: "Kargo",
    discount: "İndirim",
    couponCode: "Kupon Kodu",
    applyCoupon: "Kuponu Uygula",
    haveAccount: "Hesabınız var mı?",
    clickToLogin: "Giriş yapmak için tıklayın",
    haveCoupon: "Kuponunuz var mı?",
    clickToEnter: "Girmek için tıklayın",

    // Auth
    loginTitle: "Hesabınıza Giriş Yapın",
    registerTitle: "Yeni Hesap Oluşturun",
    emailLabel: "E-posta Adresi",
    passwordLabel: "Şifre",
    confirmPassword: "Şifre Tekrarı",
    nameLabel: "Ad Soyad",
    rememberMe: "Beni Hatırla",
    forgotPasswordLink: "Şifremi unuttum?",
    signIn: "Giriş Yap",
    signUp: "Kayıt Ol",
    noAccount: "Hesabınız yok mu?",
    hasAccount: "Zaten hesabınız var mı?",
    createOne: "Hesap oluşturun",

    // Contact
    contactTitle: "BİZE ULAŞIN",
    contactSubtitle: "Sorularınız için bize ulaşın.",
    sendMessage: "Mesaj Gönder",
    yourName: "Adınız",
    yourEmail: "E-posta Adresiniz",
    yourMessage: "Mesajınız",
    subject: "Konu",

    // About
    aboutTitle: "Hakkımızda",
    welcomeTitle: "SERRAVİT'e Hoşgeldiniz",

    // Footer
    footerTagline: "1997'den bu yana humik asit bazlı doğal ürünlerle sağlıklı yaşama destek oluyoruz.",
    talkToUs: "Bize Ulaşın",
    corporate: "Kurumsal",
    categories: "Kategoriler",
    support: "Destek",
  },
  en: {
    // Nav
    home: "Home",
    about: "About Us",
    shop: "Shop",
    contact: "Contact",
    pages: "Pages",
    faqs: "FAQs",
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password",
    cart: "My Cart",
    wishlist: "Wishlist",
    checkout: "Checkout",
    error404: "Error 404",

    // Header
    searchPlaceholder: "Search products...",
    welcomeBack: "Welcome Back!",
    signOut: "Sign Out",
    myProfile: "My Profile",
    myOrders: "My Orders",

    // Hero / Home
    heroSubtitle: "Fast & Powerful Detox",
    heroTitle: "Healthy Living\nwith Nature's Power",
    heroDescription: "Strengthen your immune system and detoxify your body with our natural humic acid-based products.",
    shopNow: "Shop Now",
    learnMore: "Learn More",

    // Products
    featuredProducts: "Featured Products",
    discountProducts: "Discounted Products",
    relatedProducts: "Related Products",
    addToCart: "Add to Cart",
    addedToCart: "Added to Cart",
    buyNow: "Buy Now",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    quantity: "Quantity",
    sku: "SKU",
    category: "Category",
    brand: "Brand",
    description: "Description",
    reviews: "Reviews",

    // Cart
    myCart: "My Cart",
    cartEmpty: "Your cart is empty",
    continueShopping: "Continue Shopping",
    proceedToCheckout: "Proceed to Checkout",
    subtotal: "Subtotal",
    total: "Total",
    remove: "Remove",

    // Checkout
    billingDetails: "Billing Details",
    firstName: "First Name",
    lastName: "Last Name",
    address: "Address",
    city: "City",
    country: "Country",
    zipCode: "Zip Code",
    phone: "Phone",
    email: "Email",
    orderNotes: "Order Notes",
    placeOrder: "Place Order",
    paymentMethod: "Payment Method",
    orderSummary: "Order Summary",
    shipping: "Shipping",
    discount: "Discount",
    couponCode: "Coupon Code",
    applyCoupon: "Apply Coupon",
    haveAccount: "Have an account?",
    clickToLogin: "Click to login",
    haveCoupon: "Have a coupon?",
    clickToEnter: "Click to enter code",

    // Auth
    loginTitle: "Sign In to Your Account",
    registerTitle: "Create a New Account",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    confirmPassword: "Confirm Password",
    nameLabel: "Full Name",
    rememberMe: "Remember me",
    forgotPasswordLink: "Forgot password?",
    signIn: "Sign In",
    signUp: "Sign Up",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    createOne: "Create one",

    // Contact
    contactTitle: "GET IN TOUCH",
    contactSubtitle: "Have a question? Let's talk.",
    sendMessage: "Send Message",
    yourName: "Your Name",
    yourEmail: "Your Email",
    yourMessage: "Your Message",
    subject: "Subject",

    // About
    aboutTitle: "About Us",
    welcomeTitle: "Welcome to SERRAVİT",

    // Footer
    footerTagline: "Supporting healthy living since 1997 with natural humic acid-based products.",
    talkToUs: "Talk To Us",
    corporate: "Corporate",
    categories: "Categories",
    support: "Support",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("lang") || "tr";
    }
    return "tr";
  });

  const toggleLang = () => {
    const next = lang === "tr" ? "en" : "tr";
    setLang(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("lang", next);
    }
  };

  const t = (key) => translations[lang]?.[key] || translations["tr"][key] || key;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
