const AuthBrandPanel = () => {
  return (
    <div className="relative hidden min-h-[575px] overflow-hidden bg-[#143b2b] lg:col-span-6 lg:block">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(183,217,92,0.35),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(255,255,255,0.16),transparent_35%)]" />
      <div className="absolute -right-20 -top-16 h-64 w-64 rounded-full border border-white/15" />
      <div className="absolute -bottom-24 -left-12 h-72 w-72 rounded-full border border-[#b7d95c]/30" />
      <div className="relative flex h-full min-h-[575px] flex-col justify-between p-12 text-white">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#d5ec8a]">
            SERRAVIT
          </p>
          <h1 className="mt-5 max-w-sm text-4xl font-semibold leading-tight">
            Operasyonunuzu tek ekrandan yönetin.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-white/75">
            Sipariş, stok, iade ve müşteri taleplerini güvenli yönetim panelinden takip edin.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <span className="block text-lg font-semibold text-[#d5ec8a]">Canlı</span>
            Sipariş takibi
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <span className="block text-lg font-semibold text-[#d5ec8a]">Güvenli</span>
            Yetkili erişim
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthBrandPanel;
