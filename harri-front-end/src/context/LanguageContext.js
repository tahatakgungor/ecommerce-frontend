"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { safeGetItem, safeSetItem } from "src/utils/localstorage";

const translations = {
  tr: {
    // Nav / Menu
    home: "Ana Sayfa",
    about: "Hakkımızda",
    shop: "Mağaza",
    contact: "İletişim",
    pages: "Sayfalar",
    faqs: "SSS",
    privacy: "Gizlilik Politikası",
    terms: "Kullanım Koşulları",
    login: "Giriş Yap",
    register: "Kayıt Ol",
    forgotPassword: "Şifremi Unuttum",
    cart: "Sepetim",
    wishlist: "Favorilerim",
    checkout: "Ödeme",
    error404: "Hata 404",
    contactUs: "İletişim",

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
    popularProducts: "Popüler Ürünler",
    topRated: "En Çok Beğenilen",
    bestSelling: "En Çok Satan",
    latestProduct: "En Yeni",
    dealOfTheDay: "Günün Fırsatı",
    viewAllProducts: "Tüm Ürünleri Gör",
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
    addToWishlist: "Favorilere Ekle",
    tags: "Etiketler",
    share: "Paylaş",
    products: "Ürünler",
    goToCart: "Sepete Git",
    quickView: "Hızlı Bakış",
    productDetails: "Ürün Detayı",
    viewCart: "Sepeti Görüntüle",

    // Invoice
    invoiceTitle: "FATURA",
    invoiceId: "Fatura No:",
    date: "Tarih:",
    productName: "Ürün Adı",
    sl: "Sıra",
    itemPrice: "Birim Fiyat",
    amount: "Tutar",
    totalAmount: "Toplam Tutar",
    print: "Yazdır",
    thankYouOrder: "Teşekkürler, siparişiniz alındı!",

    // Search
    searchResult: "Arama Sonuçları",
    itemsFound: "ürün bulundu",
    sortByPrice: "Fiyata Göre Sırala",
    noResults: "Sonuç bulunamadı",
    viewAllResults: "Tüm sonuçları gör",

    // Cart Page
    myCart: "Sepetim",
    myWishlist: "Favorilerim",
    cart: "Sepet",
    cartEmpty: "Sepetiniz boş",
    continueShopping: "Alışverişe Devam Et",
    proceedToCheckout: "Ödemeye Geç",
    subtotal: "Ara Toplam",
    total: "Toplam",
    remove: "Kaldır",
    images: "Görsel",
    product: "Ürün",
    unitPrice: "Birim Fiyat",
    cartTotals: "Sepet Toplamı",
    updateCart: "Sepeti Güncelle",
    couponCodePlaceholder: "Kupon kodunu girin",
    applyCoupon: "Kuponu Uygula",
    goToShop: "Mağazaya Git",
    productNotFound: "Üzgünüz, ürün bulunamadı 😥",

    // Cart Sidebar
    shoppingCart: "Sepetim",
    subtotalColon: "Ara Toplam:",
    viewCart: "Sepeti Görüntüle",

    // Checkout
    billingDetails: "Fatura Bilgileri",
    firstName: "Ad",
    lastName: "Soyad",
    address: "Adres",
    streetAddress: "Sokak adresi",
    city: "Şehir",
    stateCounty: "İl / İlçe",
    postcodeZip: "Posta Kodu",
    country: "Ülke",
    zipCode: "Posta Kodu",
    phone: "Telefon",
    phoneNumber: "Telefon numarası",
    email: "E-posta",
    emailAddress: "E-posta Adresi",
    yourEmail: "E-posta adresiniz",
    orderNotes: "Sipariş Notu",
    orderNotesPlaceholder: "Siparişiniz hakkında notlar, örneğin teslimat için özel notlar.",
    placeOrder: "Siparişi Tamamla",
    paymentMethod: "Ödeme Yöntemi",
    orderSummary: "Sipariş Özeti",
    shipping: "Kargo",
    discount: "İndirim",
    couponCode: "Kupon Kodu",
    haveAccount: "Hesabınız var mı?",
    clickToLogin: "Giriş yapmak için tıklayın",
    haveCoupon: "Kuponunuz var mı?",
    clickToEnterCode: "Kodu girmek için tıklayın",
    returningCustomer: "Mevcut müşteri misiniz?",
    yourOrder: "Siparişiniz",
    cartSubtotal: "Sepet Ara Toplam",
    shippingCost: "Kargo Ücreti",
    subTotal: "Ara Toplam",
    totalOrder: "Toplam Tutar",
    deliveryToday: "Bugün Teslimat: 60₺",
    delivery7Days: "7 Günde Teslimat: 20₺",
    directBankTransfer: "Kredi Kartı ile Öde",
    shippingOption: "Kargo Seçeneği",
    noCartItems: "Ödeme yapılacak ürün bulunamadı",
    returnToShop: "Mağazaya Dön",

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
    enterName: "Ad soyadınızı girin",
    enterEmail: "E-posta adresinizi girin",
    enterPassword: "Şifrenizi girin",
    confirmPasswordPlaceholder: "Şifrenizi tekrar girin",
    forgotPasswordTitle: "Şifremi Unuttum",
    resetYourPassword: "Şifrenizi Sıfırlayın",
    sendRequest: "İstek Gönder",
    confirmPasswordBtn: "Şifreyi Onayla",

    // User Dashboard
    profile: "Profilim",
    information: "Bilgilerim",
    changePassword: "Şifre Değiştir",
    logout: "Çıkış Yap",
    noOrdersYet: "Henüz siparişiniz bulunmuyor!",
    orderId: "Sipariş No",
    orderTime: "Sipariş Tarihi",
    statusLabel: "Durum",
    viewLabel: "Görüntüle",
    invoiceLink: "Fatura",
    totalOrders: "Toplam Sipariş",
    pendingOrder: "Bekleyen Sipariş",
    processingOrder: "İşlemdeki Sipariş",
    completeOrder: "Tamamlanan Sipariş",
    welcomeUser: "Hoşgeldiniz",
    personalDetails: "Kişisel Bilgiler",
    updateProfile: "Profili Güncelle",
    currentPassword: "Mevcut Şifre",
    newPassword: "Yeni Şifre",
    update: "Güncelle",

    // Contact
    contactTitle: "BİZE ULAŞIN",
    contactSubtitle: "Bir projeniz mi var? Konuşalım.",
    sendMessage: "Mesaj Gönder",
    sendMessageTitle: "Mesaj Gönderin",
    yourName: "Adınız",
    yourMessage: "Mesajınız",
    subject: "Konu",
    mobileNo: "Telefon numarası",
    company: "Şirket",
    privacyAgree: "Hizmet şartlarını ve Gizlilik Politikasını kabul ediyorum.",
    getToKnowUs: "TANIŞALIM",

    // About
    aboutTitle: "Hakkımızda",
    welcomeTitle: "SERRAVİT'e Hoşgeldiniz",

    // Footer / Off-canvas
    footerTagline: "1997'den bu yana humik asit bazlı doğal ürünlerle sağlıklı yaşama destek oluyoruz.",
    talkToUs: "Bize Ulaşın",
    corporate: "Kurumsal",
    categories: "Kategoriler",
    support: "Destek",
    socialFollow: "Bizi Takip Edin:",
    getStarted: "Mağazaya Gir",
  },
  en: {
    // Nav / Menu
    home: "Home",
    about: "About Us",
    shop: "Shop",
    contact: "Contact",
    pages: "Pages",
    faqs: "FAQs",
    privacy: "Privacy & Policy",
    terms: "Terms & Conditions",
    login: "Login",
    register: "Register",
    forgotPassword: "Forgot Password",
    cart: "My Cart",
    wishlist: "Wishlist",
    checkout: "Checkout",
    error404: "Error 404",
    contactUs: "Contact Us",

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
    popularProducts: "Popular Products",
    topRated: "Top Rated",
    bestSelling: "Best Selling",
    latestProduct: "Latest Product",
    dealOfTheDay: "Deal of The Day",
    viewAllProducts: "View All Products",
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
    addToWishlist: "Add To Wishlist",
    tags: "Tags",
    share: "Share",
    products: "Products",
    goToCart: "Go to Cart",
    quickView: "Quick View",
    productDetails: "Product Details",
    viewCart: "View Cart",

    // Invoice
    invoiceTitle: "INVOICE",
    invoiceId: "Invoice ID:",
    date: "Date:",
    productName: "Product Name",
    sl: "SL",
    itemPrice: "Item Price",
    amount: "Amount",
    totalAmount: "Total Amount",
    print: "Print",
    thankYouOrder: "Thank you, your order has been received!",

    // Search
    searchResult: "Search Results",
    itemsFound: "items found",
    sortByPrice: "Sort By Price",
    noResults: "No results found",
    viewAllResults: "View all results for",

    // Cart Page
    myCart: "My Cart",
    myWishlist: "My Wishlist",
    cart: "Cart",
    cartEmpty: "Your cart is empty",
    continueShopping: "Continue Shopping",
    proceedToCheckout: "Proceed to Checkout",
    subtotal: "Subtotal",
    total: "Total",
    remove: "Remove",
    images: "Images",
    product: "Product",
    unitPrice: "Unit Price",
    cartTotals: "Cart Totals",
    updateCart: "Update Cart",
    couponCodePlaceholder: "Coupon code",
    applyCoupon: "Apply Coupon",
    goToShop: "Go to Shop",
    productNotFound: "Sorry, we can not find this product 😥",

    // Cart Sidebar
    shoppingCart: "Shopping Cart",
    subtotalColon: "Subtotal:",
    viewCart: "View Cart",

    // Checkout
    billingDetails: "Billing Details",
    firstName: "First Name",
    lastName: "Last Name",
    address: "Address",
    streetAddress: "Street address",
    city: "City",
    stateCounty: "State / County",
    postcodeZip: "Postcode / Zip",
    country: "Country",
    zipCode: "Zip Code",
    phone: "Phone",
    phoneNumber: "Phone number",
    email: "Email",
    emailAddress: "Email Address",
    yourEmail: "Your Email",
    orderNotes: "Order Notes",
    orderNotesPlaceholder: "Notes about your order, e.g. special notes for delivery.",
    placeOrder: "Place Order",
    paymentMethod: "Payment Method",
    orderSummary: "Order Summary",
    shipping: "Shipping",
    discount: "Discount",
    couponCode: "Coupon Code",
    haveAccount: "Have an account?",
    clickToLogin: "Click to login",
    haveCoupon: "Have a coupon?",
    clickToEnterCode: "Click here to enter your code",
    returningCustomer: "Returning customer?",
    yourOrder: "Your Order",
    cartSubtotal: "Cart Subtotal",
    shippingCost: "Shipping Cost",
    subTotal: "Sub Total",
    totalOrder: "Total Order",
    deliveryToday: "Delivery: Today Cost: $60.00",
    delivery7Days: "Delivery: 7 Days Cost: $20.00",
    directBankTransfer: "Pay with Credit Card",
    shippingOption: "Shipping Option",
    noCartItems: "No items found in cart to checkout",
    returnToShop: "Return to Shop",

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
    enterName: "Enter your name",
    enterEmail: "Enter your email",
    enterPassword: "Password",
    confirmPasswordPlaceholder: "Confirm Password",
    forgotPasswordTitle: "Forgot Password",
    resetYourPassword: "Reset Your Password",
    sendRequest: "Send Request",
    confirmPasswordBtn: "Confirm Password",

    // User Dashboard
    profile: "Profile",
    information: "Information",
    changePassword: "Change Password",
    logout: "Logout",
    noOrdersYet: "You Have no orders Yet!",
    orderId: "Order Id",
    orderTime: "Order Time",
    statusLabel: "Status",
    viewLabel: "View",
    invoiceLink: "Invoice",
    totalOrders: "Total Orders",
    pendingOrder: "Pending Order",
    processingOrder: "Processing Order",
    completeOrder: "Complete Order",
    welcomeUser: "Welcome",
    personalDetails: "Personal Details",
    updateProfile: "Update Profile",
    currentPassword: "Current Password",
    newPassword: "New Password",
    update: "Update",

    // Contact
    contactTitle: "GET IN TOUCH",
    contactSubtitle: "Have a project in mind? Let's talk.",
    sendMessage: "Send Message",
    sendMessageTitle: "Send a message",
    yourName: "Your Name",
    yourMessage: "Your Message",
    subject: "Subject",
    mobileNo: "Mobile no",
    company: "Company",
    privacyAgree: "I am bound by the terms of the Service I accept Privacy Policy.",
    getToKnowUs: "GET TO KNOW US",

    // About
    aboutTitle: "About Us",
    welcomeTitle: "Welcome to SERRAVİT",

    // Footer / Off-canvas
    footerTagline: "Supporting healthy living since 1997 with natural humic acid-based products.",
    talkToUs: "Talk To Us",
    corporate: "Corporate",
    categories: "Categories",
    support: "Support",
    socialFollow: "Follow:",
    getStarted: "Getting Started",
  },
};

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    if (true) {
      return safeGetItem("lang") || "tr";
    }
    return "tr";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const toggleLang = () => {
    const next = lang === "tr" ? "en" : "tr";
    setLang(next);
    if (true) {
      safeSetItem("lang", next);
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
