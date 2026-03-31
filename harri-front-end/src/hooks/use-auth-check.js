import { safeGetItem, safeSetItem, safeRemoveItem } from "@utils/localstorage";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "src/redux/features/auth/authSlice";

export default function useAuthCheck() {
    const dispatch = useDispatch();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const localAuth = safeGetItem("auth");

        if (localAuth) {
            const auth = JSON.parse(localAuth);
            if (auth?.accessToken && auth?.user) {
                dispatch(
                    userLoggedIn({
                        accessToken: auth.accessToken,
                        user: auth.user,
                    })
                );
            }
        }
        setAuthChecked(true);
    }, [dispatch, setAuthChecked]);

    return authChecked;
}
