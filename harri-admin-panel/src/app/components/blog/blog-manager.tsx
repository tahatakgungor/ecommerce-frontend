"use client";

import React, { useMemo, useState } from "react";
import GlobalImgUpload from "../category/global-img-upload";
import { notifyError, notifySuccess } from "@/utils/toast";
import { normalizeMediaUrl } from "@/utils/media-url";
import {
  BlogPostItem,
  BlogStatus,
  useCreateBlogPostMutation,
  useDeleteBlogPostMutation,
  useGetAdminBlogPostsQuery,
  useUpdateBlogPostMutation,
  useUpdateBlogPostStatusMutation,
} from "@/redux/blog/blogApi";
import { useGetAllProductsQuery } from "@/redux/product/productApi";

type BlogForm = {
  title: string;
  slug: string;
  summary: string;
  coverImage: string;
  contentHtml: string;
  relatedProductIds: string[];
  status: BlogStatus;
  seoTitle: string;
  seoDescription: string;
};

const initialForm: BlogForm = {
  title: "",
  slug: "",
  summary: "",
  coverImage: "",
  contentHtml: "",
  relatedProductIds: [],
  status: "draft",
  seoTitle: "",
  seoDescription: "",
};

const slugifyTr = (input: string): string => {
  const map: Record<string, string> = {
    c: "c",
    g: "g",
    i: "i",
    o: "o",
    s: "s",
    u: "u",
    C: "c",
    G: "g",
    I: "i",
    O: "o",
    S: "s",
    U: "u",
  };

  return (input || "")
    .trim()
    .split("")
    .map((ch) => {
      if (ch === "ç") return "c";
      if (ch === "ğ") return "g";
      if (ch === "ı") return "i";
      if (ch === "ö") return "o";
      if (ch === "ş") return "s";
      if (ch === "ü") return "u";
      if (map[ch]) return map[ch];
      return ch;
    })
    .join("")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}+/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 240);
};

const BlogManager = () => {
  const [form, setForm] = useState<BlogForm>(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: blogData, isLoading: postsLoading, isFetching: postsFetching } = useGetAdminBlogPostsQuery();
  const { data: productsData } = useGetAllProductsQuery();

  const [createPost, { isLoading: creating }] = useCreateBlogPostMutation();
  const [updatePost, { isLoading: updating }] = useUpdateBlogPostMutation();
  const [updateStatus, { isLoading: statusUpdating }] = useUpdateBlogPostStatusMutation();
  const [deletePost, { isLoading: deleting }] = useDeleteBlogPostMutation();

  const posts = useMemo(() => (Array.isArray(blogData) ? blogData : []), [blogData]);
  const products = useMemo(() => (Array.isArray(productsData?.data) ? productsData.data : []), [productsData]);
  const busy = creating || updating || statusUpdating || deleting;

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setSlugTouched(false);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 0);
  };

  const startEdit = (post: BlogPostItem) => {
    setEditingId(post.id);
    setSlugTouched(true);
    setForm({
      title: post.title || "",
      slug: post.slug || "",
      summary: post.summary || "",
      coverImage: post.coverImage || "",
      contentHtml: post.contentHtml || "",
      relatedProductIds: Array.isArray(post.relatedProductIds) ? post.relatedProductIds : [],
      status: post.status || "draft",
      seoTitle: post.seoTitle || "",
      seoDescription: post.seoDescription || "",
    });
  };

  const handleTitleChange = (value: string) => {
    setForm((prev) => {
      if (slugTouched) {
        return { ...prev, title: value };
      }
      return { ...prev, title: value, slug: slugifyTr(value) };
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim()) {
      notifyError("Blog başlığı zorunludur.");
      return;
    }
    if (!form.contentHtml.trim()) {
      notifyError("Blog içeriği zorunludur.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      slug: slugifyTr(form.slug || form.title),
      summary: form.summary.trim() || null,
      coverImage: form.coverImage.trim() || null,
      contentHtml: form.contentHtml,
      relatedProductIds: form.relatedProductIds,
      status: form.status,
      seoTitle: form.seoTitle.trim() || null,
      seoDescription: form.seoDescription.trim() || null,
    };

    try {
      if (editingId) {
        await updatePost({ id: editingId, data: payload }).unwrap();
        notifySuccess("Blog yazısı güncellendi.");
      } else {
        await createPost(payload).unwrap();
        notifySuccess("Blog yazısı oluşturuldu.");
      }
      resetForm();
    } catch (error: any) {
      notifyError(error?.data?.message || "Blog yazısı kaydedilemedi.");
    }
  };

  const handleStatusToggle = async (post: BlogPostItem) => {
    const nextStatus: BlogStatus = post.status === "published" ? "draft" : "published";
    try {
      await updateStatus({ id: post.id, status: nextStatus }).unwrap();
      notifySuccess(nextStatus === "published" ? "Yazı yayına alındı." : "Yazı taslağa alındı.");
    } catch (error: any) {
      notifyError(error?.data?.message || "Durum güncellenemedi.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Bu blog yazısını silmek istiyor musunuz?")) return;
    try {
      await deletePost({ id }).unwrap();
      if (editingId === id) {
        resetForm();
      }
      notifySuccess("Blog yazısı silindi.");
    } catch (error: any) {
      notifyError(error?.data?.message || "Blog yazısı silinemedi.");
    }
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      <div className="col-span-12 lg:col-span-5">
        <form onSubmit={handleSubmit}>
          <div className="bg-white px-6 py-6 rounded-md">
            <h4 className="text-[20px] font-semibold text-heading mb-4">
              {editingId ? "Blog Yazısını Düzenle" : "Yeni Blog Yazısı"}
            </h4>

            <GlobalImgUpload
              setImage={(value) =>
                setForm((prev) => {
                  const nextValue = typeof value === "function" ? value(prev.coverImage) : value;
                  return {
                    ...prev,
                    coverImage: normalizeMediaUrl(nextValue),
                  };
                })
              }
              isSubmitted={isSubmitted}
              default_img={form.coverImage}
              image={form.coverImage}
              setIsSubmitted={setIsSubmitted}
            />

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Başlık</label>
              <input
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Humik Asit Nedir?"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Link Adı (Slug)</label>
              <input
                className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm((prev) => ({ ...prev, slug: slugifyTr(e.target.value) }));
                }}
                placeholder="humik-asit-nedir"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">Özet</label>
              <textarea
                className="w-full border border-gray6 px-3 py-2 rounded-md"
                rows={3}
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Yazı listesinde gözükecek kısa açıklama"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">İçerik (HTML)</label>
              <textarea
                className="w-full border border-gray6 px-3 py-2 rounded-md font-mono text-sm"
                rows={10}
                value={form.contentHtml}
                onChange={(e) => setForm((prev) => ({ ...prev, contentHtml: e.target.value }))}
                placeholder="<h2>Humik Asit Nedir?</h2><p>...</p>"
              />
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">İlişkili Ürünler</label>
              <select
                multiple
                className="w-full border border-gray6 px-3 py-2 rounded-md min-h-[130px]"
                value={form.relatedProductIds}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions).map((option) => option.value);
                  setForm((prev) => ({ ...prev, relatedProductIds: values }));
                }}
              >
                {products.map((product: any) => (
                  <option key={product._id || product.id} value={String(product._id || product.id)}>
                    {product.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray6 mt-1">Ctrl/Cmd ile birden fazla ürün seçebilirsiniz.</p>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-black mb-1 inline-block">SEO Başlık</label>
                <input
                  className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                  value={form.seoTitle}
                  onChange={(e) => setForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder="Google başlığı"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-black mb-1 inline-block">Durum</label>
                <select
                  className="input h-[44px] w-full border border-gray6 px-3 rounded-md"
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as BlogStatus }))}
                >
                  <option value="draft">Taslak</option>
                  <option value="published">Yayında</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium text-black mb-1 inline-block">SEO Açıklama</label>
              <textarea
                className="w-full border border-gray6 px-3 py-2 rounded-md"
                rows={3}
                value={form.seoDescription}
                onChange={(e) => setForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="Google meta description"
              />
            </div>

            <div className="flex gap-2">
              <button type="submit" className="tp-btn px-6 py-2" disabled={busy}>
                {editingId ? "Güncelle" : "Kaydet"}
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

      <div className="col-span-12 lg:col-span-7">
        <div className="bg-white px-6 py-6 rounded-md">
          <h4 className="text-[20px] font-semibold text-heading mb-4">Blog Yazıları</h4>
          <div className="admin-table-shell">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Başlık</th>
                  <th className="text-left py-3 px-2">Link</th>
                  <th className="text-left py-3 px-2">Durum</th>
                  <th className="text-left py-3 px-2">Güncelleme</th>
                  <th className="text-left py-3 px-2">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {(postsLoading || postsFetching) && (
                  <tr>
                    <td className="py-8 px-2 text-gray6" colSpan={5}>
                      Blog yazıları yükleniyor...
                    </td>
                  </tr>
                )}
                {!postsLoading && !postsFetching && posts.length === 0 && (
                  <tr>
                    <td className="py-8 px-2 text-gray6" colSpan={5}>
                      Henüz blog yazısı yok.
                    </td>
                  </tr>
                )}
                {!postsLoading &&
                  !postsFetching &&
                  posts.map((post) => (
                    <tr key={post.id} className="border-b align-top">
                      <td className="py-3 px-2">
                        <p className="font-medium text-heading">{post.title}</p>
                        {post.summary ? <p className="text-xs text-gray6 mt-1 line-clamp-2">{post.summary}</p> : null}
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-xs text-gray6">/blog/{post.slug}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={
                            "inline-block text-xs px-2 py-1 rounded " +
                            (post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600")
                          }
                        >
                          {post.status === "published" ? "Yayında" : "Taslak"}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-xs text-gray6">
                        {post.updatedAt ? new Date(post.updatedAt).toLocaleString("tr-TR") : "-"}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 rounded border border-slate-300 text-slate-700"
                            onClick={() => startEdit(post)}
                            disabled={busy}
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 rounded border border-amber-500 text-amber-700"
                            onClick={() => handleStatusToggle(post)}
                            disabled={busy}
                          >
                            {post.status === "published" ? "Taslağa Al" : "Yayına Al"}
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 rounded border border-red-500 text-red-700"
                            onClick={() => handleDelete(post.id)}
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

export default BlogManager;
