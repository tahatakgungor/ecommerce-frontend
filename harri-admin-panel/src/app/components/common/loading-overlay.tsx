"use client";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

// Herhangi bir RTK mutation beklenirken sayfayı dondurur.
const LoadingOverlay = () => {
  const isMutating = useSelector((state: RootState) => {
    const mutations = (state as any)?.api?.mutations ?? {};
    return Object.values(mutations).some((m: any) => m?.status === "pending");
  });

  if (!isMutating) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "wait",
        // Keep visual feedback but do not lock navigation/menu interactions.
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          border: "5px solid rgba(255,255,255,0.3)",
          borderTopColor: "#fff",
          borderRadius: "50%",
          animation: "adminOverlaySpin 0.75s linear infinite",
        }}
      />
      <style>{`
        @keyframes adminOverlaySpin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingOverlay;
