'use client';
import { useRouter } from "next/navigation";
import React from "react";
import { useDispatch } from "react-redux";
import { userLoggedOut } from "src/redux/features/auth/authSlice";
import { useLogoutUserMutation } from "src/redux/features/auth/authApi";
import { clear_cart } from "src/redux/features/cartSlice";
import { clear_wishlist } from "src/redux/features/wishlist-slice";
import { apiSlice } from "src/redux/api/apiSlice";
import { useLanguage } from "src/context/LanguageContext";

const ProfileNav = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useLanguage();
  const [logoutUser] = useLogoutUserMutation();

  const handleLogout = async () => {
    // Backend'e logout isteği gönder — httpOnly cookie temizlenir
    await logoutUser().catch(() => {});
    // Global state tamamen temizle
    dispatch(userLoggedOut());
    dispatch(clear_cart());
    dispatch(clear_wishlist());
    dispatch(apiSlice.util.resetApiState());
    router.push('/login');
  };

  return (
    <div className="profile__tab mr-40">
      <nav>
        <div
          className="nav nav-tabs tp-tab-menu flex-column"
          id="profile-tab"
          role="tablist"
        >
          <button
            className="nav-link active"
            id="nav-profile-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-profile"
            type="button"
            role="tab"
            aria-controls="nav-profile"
            aria-selected="false"
          >
            <span><i className="fa-regular fa-user-pen"></i></span>
            {t('profile')}
          </button>

          <button
            className="nav-link"
            id="nav-order-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-order"
            type="button"
            role="tab"
            aria-controls="nav-order"
            aria-selected="false"
          >
            <span><i className="fa-light fa-clipboard-list-check"></i></span>
            {t('myOrders')}
          </button>

          <button
            className="nav-link"
            id="nav-reviews-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-reviews"
            type="button"
            role="tab"
            aria-controls="nav-reviews"
            aria-selected="false"
          >
            <span><i className="fa-regular fa-star"></i></span>
            {t('myReviews')}
          </button>

          <button
            className="nav-link"
            id="nav-information-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-information"
            type="button"
            role="tab"
            aria-controls="nav-information"
            aria-selected="false"
          >
            <span><i className="fa-regular fa-circle-info"></i></span>{" "}
            {t('information')}
          </button>

          <button
            className="nav-link"
            id="nav-password-tab"
            data-bs-toggle="tab"
            data-bs-target="#nav-password"
            type="button"
            role="tab"
            aria-controls="nav-password"
            aria-selected="false"
          >
            <span><i className="fa-regular fa-lock"></i></span>{" "}
            {t('changePassword')}
          </button>

          <button onClick={handleLogout} className="nav-link" type="button">
            <span><i className="fa-light fa-arrow-right-from-bracket"></i></span>
            {t('logout')}
          </button>
          <span
            id="marker-vertical"
            className="tp-tab-line d-none d-sm-inline-block"
          ></span>
        </div>
      </nav>
    </div>
  );
};

export default ProfileNav;
