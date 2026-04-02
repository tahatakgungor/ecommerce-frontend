'use client';
import { useSelector } from 'react-redux';

const GlobalLoadingBar = () => {
  const isLoading = useSelector((state) => {
    const queries = state?.api?.queries ?? {};
    const mutations = state?.api?.mutations ?? {};
    const pendingQuery = Object.values(queries).some((q) => q?.status === 'pending');
    const pendingMutation = Object.values(mutations).some((m) => m?.status === 'pending');
    return pendingQuery || pendingMutation;
  });

  if (!isLoading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        zIndex: 99999,
        background: 'linear-gradient(90deg, #74aa4c, #a8d87e, #74aa4c)',
        backgroundSize: '200% 100%',
        animation: 'globalLoadingBar 1.2s linear infinite',
      }}
    >
      <style>{`
        @keyframes globalLoadingBar {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default GlobalLoadingBar;
