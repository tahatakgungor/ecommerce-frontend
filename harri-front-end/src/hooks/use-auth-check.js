import { safeGetItem, safeRemoveItem, safeSetItem } from "@utils/localstorage";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useLazyGetUserQuery } from "src/redux/features/auth/authApi";
import { userLoggedIn, userLoggedOut } from "src/redux/features/auth/authSlice";

export default function useAuthCheck() {
    const dispatch = useDispatch();
    const [fetchMe] = useLazyGetUserQuery();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const storedUser = safeGetItem("user_profile");
        const storedToken = safeGetItem("auth_access_token");
        let hasStoredUser = false;

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user) {
                    hasStoredUser = true;
                    dispatch(userLoggedIn({ accessToken: storedToken || undefined, user }));
                }
            } catch (_) {}
        }

        if (!hasStoredUser && !storedToken) {
            dispatch(userLoggedOut());
            setAuthChecked(true);
            return;
        }

        // Token var ama profil yoksa /me cevabını bekleyerek state'i doldur.
        if (!hasStoredUser && storedToken) {
            dispatch(userLoggedIn({ accessToken: storedToken, user: undefined }));
        }

        const validateSession = () => fetchMe()
            .unwrap()
            .then((user) => {
                safeSetItem("user_profile", JSON.stringify(user));
                dispatch(userLoggedIn({ accessToken: storedToken || undefined, user }));
            })
            .catch((error) => {
                if (error?.status === 401 || error?.status === 403) {
                    safeRemoveItem("user_profile");
                    safeRemoveItem("auth_access_token");
                    dispatch(userLoggedOut());
                }
            })
            .finally(() => setAuthChecked(true));

        validateSession();

        const onVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                validateSession();
            }
        };
        document.addEventListener("visibilitychange", onVisibilityChange);
        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [dispatch, fetchMe]);

    return authChecked;
}
