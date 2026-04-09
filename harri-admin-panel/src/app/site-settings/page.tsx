"use client";

import { useEffect, useState } from "react";
import Wrapper from "@/layout/wrapper";
import Breadcrumb from "../components/breadcrumb/breadcrumb";
import { notifyError, notifySuccess } from "@/utils/toast";
import { useGetAdminSiteSettingsQuery, useUpdateAdminSiteSettingsMutation } from "@/redux/site-settings/siteSettingsApi";

const SiteSettingsPage = () => {
  const { data, isLoading } = useGetAdminSiteSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateAdminSiteSettingsMutation();
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (data) {
      setForm({
        announcementActive: Boolean(data.announcementActive),
        announcementTextTr: data.announcementTextTr || "",
        announcementTextEn: data.announcementTextEn || "",
        announcementLink: data.announcementLink || "",
        announcementSpeed: data.announcementSpeed || 40,
        whatsappNumber: data.whatsappNumber || "",
        whatsappLabel: data.whatsappLabel || "",
        supportEmail: data.supportEmail || "",
        supportPhone: data.supportPhone || "",
        returnWindowDays: data.returnWindowDays || 14,
      });
    }
  }, [data]);

  const onChange = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(form).unwrap();
      notifySuccess("Site ayarları güncellendi.");
    } catch (err: any) {
      notifyError(err?.data?.message || "Ayarlar güncellenemedi.");
    }
  };

  return (
    <Wrapper>
      <div className="body-content bg-slate-100">
        <Breadcrumb title="Site Ayarları" subtitle="Duyuru, WhatsApp ve destek bilgileri" />
        <div className="bg-white rounded-md p-6">
          {isLoading ? (
            <p>Ayarlar yükleniyor...</p>
          ) : (
            <form onSubmit={onSubmit} className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(form.announcementActive)}
                    onChange={(e) => onChange("announcementActive", e.target.checked)}
                  />
                  Duyuru barı aktif
                </label>
              </div>
              <div className="col-span-12 md:col-span-6">
                <label>Duyuru Metni (TR)</label>
                <input className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.announcementTextTr || ""} onChange={(e) => onChange("announcementTextTr", e.target.value)} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label>Duyuru Metni (EN)</label>
                <input className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.announcementTextEn || ""} onChange={(e) => onChange("announcementTextEn", e.target.value)} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label>Duyuru Linki</label>
                <input className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.announcementLink || ""} onChange={(e) => onChange("announcementLink", e.target.value)} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label>Akış Hızı (sn)</label>
                <input type="number" className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.announcementSpeed || 40} onChange={(e) => onChange("announcementSpeed", Number(e.target.value || 40))} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label>WhatsApp No</label>
                <input className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.whatsappNumber || ""} onChange={(e) => onChange("whatsappNumber", e.target.value)} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label>WhatsApp Etiketi</label>
                <input className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.whatsappLabel || ""} onChange={(e) => onChange("whatsappLabel", e.target.value)} />
              </div>
              <div className="col-span-12 md:col-span-4">
                <label>Destek Telefon</label>
                <input className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.supportPhone || ""} onChange={(e) => onChange("supportPhone", e.target.value)} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label>Destek E-posta</label>
                <input className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.supportEmail || ""} onChange={(e) => onChange("supportEmail", e.target.value)} />
              </div>
              <div className="col-span-12 md:col-span-6">
                <label>İade Süresi (gün)</label>
                <input type="number" className="input w-full h-[44px] border border-gray6 px-3 rounded-md" value={form.returnWindowDays || 14} onChange={(e) => onChange("returnWindowDays", Number(e.target.value || 14))} />
              </div>
              <div className="col-span-12">
                <button disabled={isSaving} className="tp-btn">
                  {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Wrapper>
  );
};

export default SiteSettingsPage;
