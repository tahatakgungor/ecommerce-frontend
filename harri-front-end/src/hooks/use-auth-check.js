import { safeGetItem } from "@utils/localstorage";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { userLoggedIn } from "src/redux/features/auth/authSlice";

export default function useAuthCheck() {
    const dispatch = useDispatch();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        // Token artık httpOnly cookie'de — sadece kullanıcı profilini localStorage'dan yükle
        const storedUser = safeGetItem("user_profile");
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                if (user) {
                    // accessToken: undefined — httpOnly cookie ile backend auth çalışır
                    dispatch(userLoggedIn({ accessToken: undefined, user }));
                }
            } catch (_) {}
        }
        setAuthChecked(true);
    }, [dispatch]);

    return authChecked;
}
