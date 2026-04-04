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
        let hasStoredUser = false;

        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user) {
                    hasStoredUser = true;
                    dispatch(userLoggedIn({ accessToken: undefined, user }));
                }
            } catch (_) {}
        }

        if (!hasStoredUser) {
            dispatch(userLoggedOut());
            setAuthChecked(true);
            return;
        }

        fetchMe()
            .unwrap()
            .then((user) => {
                safeSetItem("user_profile", JSON.stringify(user));
                dispatch(userLoggedIn({ accessToken: undefined, user }));
            })
            .catch((error) => {
                if ((error?.status === 401 || error?.status === 403) && hasStoredUser) {
                    safeRemoveItem("user_profile");
                    dispatch(userLoggedOut());
                }
            })
            .finally(() => setAuthChecked(true));
    }, [dispatch, fetchMe]);

    return authChecked;
}
