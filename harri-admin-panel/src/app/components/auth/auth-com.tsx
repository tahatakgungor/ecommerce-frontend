import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Loading from "../common/loading";
import useAuthCheck from "@/hooks/use-auth-check";
import { RootState } from "@/redux/store";
import { isAdminPublicPath } from "@/utils/auth-routes";

const AuthCom = ({ children }: { children: React.ReactNode }) => {
  const { authChecked } = useAuthCheck();
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authChecked) return;
    const isPublic = isAdminPublicPath(pathname);
    if (!isPublic && !accessToken) {
      router.replace("/login");
    }
    if (isPublic && accessToken && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [accessToken, authChecked, pathname, router]);
  
  let content;
  if (!authChecked) {
    content = (
      <div className="flex items-center justify-center h-screen">
        <Loading spinner="fade" loading={!authChecked} />
      </div>
    );
  } else {
    content = children;
  }

  return <>{content}</>;
};

export default AuthCom;
