"use client";

import React, { useMemo, useState } from "react";
import { notifyError, notifySuccess } from "@/utils/toast";
import GlobalImgUpload from "../category/global-img-upload";
import {
  type BannerItem,
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetAdminBannersQuery,
  useToggleBannerMutation,
  useUpdateBannerMutation,
} from "@/redux/banner/bannerApi";
import { normalizeMediaUrl } from "@/utils/media-url";

type BannerForm = {
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  imageUrl: string;
  imageAlt: string;
  active: boolean;
  openInNewTab: boolean;
  sortOrder: number;
};

const defaultForm: BannerForm = {
  title: "",
  subtitle: "",
  ctaLabel: "Hemen Alışveriş Yap",
  ctaLink: "/shop",
  imageUrl: "",
  imageAlt: "",
  active: true,
  openInNewTab: false,
  sortOrder: 0,
};

const BannerManager = () => {
  const [form, setForm] = useState<BannerForm>(defaultForm);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetAdminBannersQuery();
  const [createBanner, { isLoading: isCreating }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating }] = useUpdateBannerMutation();
  const [toggleBanner, { isLoading: isToggling }] = useToggleBannerMutation();
  const [deleteBanner, { isLoading: isDeleting }] = useDeleteBannerMutation();

  const banners = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const busy = isCreating || isUpdating || isToggling || isDeleting;

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 0);
  };

  const handleEdit = (banner: BannerItem) => {
    setEditingId(banner.id);
    setForm({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      ctaLabel: banner.ctaLabel || "",
      ctaLink: banner.ctaLink || "",
      imageUrl: banner.imageUrl || "",
      imageAlt: banner.imageAlt || "",
      active: banner.active,
      openInNewTab: banner.openInNewTab,
      sortOrder: Number.isFinite(Number(banner.sortOrder)) ? Number(banner.sortOrder) : 0,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      notifyError("Banner başlığı zorunludur.");
      return;
    }
    if (!form.imageUrl.trim()) {
      notifyError("Banner görseli zorunludur.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim() || null,
      ctaLabel: form.ctaLabel.trim() || null,
      ctaLink: form.ctaLink.trim() || null,
      imageUrl: form.imageUrl.trim(),
      imageAlt: form.imageAlt.trim() || null,
      active: form.active,
      openInNewTab: form.openInNewTab,
      sortOrder: Number.isFinite(Number(form.sortOrder)) ? Number(form.sortOrder) : 0,
    };

    try {
      if (editingId) {
        await updateBanner({ id: editingId, data: payload }).unwrap();
        notifySuccess("Banner güncellendi.");
      } else {
        await createBanner(payload).unwrap();
        notifySuccess("Banner eklendi.");
      }
      resetForm();
    } catch (error: any) {
      notifyError(error?.data?.message || "Banner kaydedilemedi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu banner silinsin mi?")) return;
    try {
      await deleteBanner({ id }).unwrap();
      if (editingId === id) {
        resetForm();
      }
      notifySuccess("Banner silindi.");
    } catch (error: any) {
      notifyError(error?.data?.message || "Banner silinemedi.");
    }
  };

  const handleToggle = async (banner: BannerItem) => {
    try {
      await toggleBanner({ id: banner.id, active: !banner.active }).unwrap();
      notifySuccess(banner.active ? "Banner pasife alındı." : "Banner aktifleştirildi.");
    } catch (error: any) {
      notifyError(error?.data?.message || "Banner durumu güncellenemedi.");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-4">
        <form onSubmit={handleSubmit}>
          <div className="bg-white px-6 py-6 rounded-md">
            <h4 className="text-[20px] font-semibold text-heading mb-4">
              {editingId ? "Banner Düzenle" : "Yeni Banner Ekle"}
            </h4>

            <GlobalImgUpload
              setImage={(value) =>
                setForm((prev) => {
                  const nextValue =
                    typeof value === "function" ? value(prev.imageUrl) : value;
                  return {
                    ...prev,
                    imageUrl: normalizeMediaUrl(nextValue),
                  };
                })
              }
              isSubmitted={isSubmitted}
              default_img={form.imageUrl}
              image={form.imageUrl}
              setIsSubmitted={setIsSubmitted}
            />

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Başlık</label>
              <input
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Doğanın Gücüyle Sağlıklı Yaşam"
                required
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Alt Başlık</label>
              <input
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.subtitle}
                onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Hızlı ve Güçlü Detoks"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Buton Metni</label>
              <input
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.ctaLabel}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
                placeholder="Hemen Alışveriş Yap"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Tıklama Linki</label>
              <input
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.ctaLink}
                onChange={(e) => setForm((prev) => ({ ...prev, ctaLink: e.target.value }))}
                placeholder="/shop?category=gida-takviyesi"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Görsel Alt Metni</label>
              <input
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.imageAlt}
                onChange={(e) => setForm((prev) => ({ ...prev, imageAlt: e.target.value }))}
                placeholder="Sağlık ürünleri kampanya görseli"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Sıra</label>
              <input
                type="number"
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.sortOrder}
                onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: Number(e.target.value || 0) }))}
              />
            </div>

            <div className="mb-4 flex flex-col gap-2">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                />
                Aktif
              </label>
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.openInNewTab}
                  onChange={(e) => setForm((prev) => ({ ...prev, openInNewTab: e.target.checked }))}
                />
                Yeni sekmede aç
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="tp-btn px-6 py-2" disabled={busy}>
                {editingId ? "Güncelle" : "Ekle"}
              </button>
              {editingId ? (
                <button
                  type="button"
                  className="tp-btn-border px-6 py-2"
                  onClick={resetForm}
                  disabled={busy}
                >
                  İptal
                </button>
              ) : null}
            </div>
          </div>
        </form>
      </div>

      <div className="col-span-12 lg:col-span-8">
        <div className="bg-white px-6 py-6 rounded-md">
          <h4 className="text-[20px] font-semibold text-heading mb-4">Banner Listesi</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Görsel</th>
                  <th className="text-left py-3 px-2">Başlık</th>
                  <th className="text-left py-3 px-2">Link</th>
                  <th className="text-left py-3 px-2">Sıra</th>
                  <th className="text-left py-3 px-2">Durum</th>
                  <th className="text-left py-3 px-2">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {(isLoading || isFetching) && (
                  <tr>
                    <td className="py-8 px-2 text-gray6" colSpan={6}>
                      Bannerlar yükleniyor...
                    </td>
                  </tr>
                )}
                {!isLoading && !isFetching && banners.length === 0 && (
                  <tr>
                    <td className="py-8 px-2 text-gray6" colSpan={6}>
                      Henüz banner yok.
                    </td>
                  </tr>
                )}
                {!isLoading &&
                  !isFetching &&
                  banners.map((banner) => (
                    <tr key={banner.id} className="border-b align-top">
                      <td className="py-3 px-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={normalizeMediaUrl(banner.imageUrl)}
                          alt={banner.imageAlt || banner.title}
                          style={{
                            width: 96,
                            height: 54,
                            borderRadius: 8,
                            objectFit: "cover",
                            border: "1px solid #e5e7eb",
                            background: "#fff",
                          }}
                        />
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-medium text-heading">{banner.title}</p>
                        {banner.subtitle ? <p className="text-xs text-gray6 mt-1">{banner.subtitle}</p> : null}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs text-gray6 break-all">{banner.ctaLink || "-"}</span>
                      </td>
                      <td className="py-3 px-2">{banner.sortOrder}</td>
                      <td className="py-3 px-2">
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded ${
                            banner.active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {banner.active ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 rounded border border-slate-300 text-slate-700"
                            onClick={() => handleEdit(banner)}
                            disabled={busy}
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 rounded border border-amber-500 text-amber-700"
                            onClick={() => handleToggle(banner)}
                            disabled={busy}
                          >
                            {banner.active ? "Pasif Yap" : "Aktif Yap"}
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 rounded border border-red-500 text-red-700"
                            onClick={() => handleDelete(banner.id)}
                            disabled={busy}
                          >
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerManager;
