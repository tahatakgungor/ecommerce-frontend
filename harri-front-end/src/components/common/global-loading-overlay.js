'use client';
import { useSelector } from 'react-redux';

// Mutation (veri değiştiren işlem) veya checkout işlemi sırasında sayfayı dondurur.
const GlobalLoadingOverlay = ({ forceShow = false }) => {
  const isMutating = useSelector((state) => {
    const mutations = state?.api?.mutations ?? {};
    return Object.values(mutations).some((m) => m?.status === 'pending');
  });

  if (!isMutating && !forceShow) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'wait',
        // Alttaki tüm tıklamaları engelle
        pointerEvents: 'all',
      }}
    >
      <div style={{
        width: 54,
        height: 54,
        border: '5px solid rgba(255,255,255,0.3)',
        borderTopColor: '#fff',
        borderRadius: '50%',
        animation: 'overlaySpinAnim 0.75s linear infinite',
      }} />
      <style>{`
        @keyframes overlaySpinAnim {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default GlobalLoadingOverlay;
