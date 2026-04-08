"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetBlogPostsQuery } from "src/redux/features/blogApi";
import { useLanguage } from "src/context/LanguageContext";
import { buildBlogExcerpt, getBlogReadTime } from "src/utils/blog-utils";

const fallbackCover = "/assets/img/slider/13/slider-1.png";

const BlogListPage = () => {
  const { data, error, isLoading, isFetching, isError } = useGetBlogPostsQuery();
  const { lang } = useLanguage();
  const posts = Array.isArray(data?.posts) ? data.posts : [];
  const backendMessage = error?.data?.message;

  return (
    <section className="pt-60 pb-80 grey-bg-17">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tp-section-title-wrapper mb-35 rounded-4 p-4 p-md-5" style={{ background: "linear-gradient(135deg, #eef7e9 0%, #f8fbf5 100%)", border: "1px solid #dcebd2" }}>
              <h3 className="tp-section-title-3 mb-2">{lang === "tr" ? "Serravit Blog" : "Serravit Blog"}</h3>
              <p className="text-muted mb-0" style={{ maxWidth: 680 }}>
                {lang === "tr"
                  ? "Ürünlerimiz ve kullanım alanları hakkında içerikler"
                  : "Articles about our products and use cases"}
              </p>
            </div>
          </div>
        </div>

        {(isLoading || isFetching) && (
          <div className="row">
            <div className="col-12">
              <p>{lang === "tr" ? "Yazılar yükleniyor..." : "Loading posts..."}</p>
            </div>
          </div>
        )}

        {isError && (
          <div className="row">
            <div className="col-12">
              <div className="p-4 bg-white rounded" style={{ border: "1px solid #f1d3d3" }}>
                <p className="mb-1" style={{ color: "#9f1239", fontWeight: 600 }}>
                  {lang === "tr" ? "Blog servisine erişilemedi." : "Blog service is not reachable."}
                </p>
                <p className="mb-0 text-muted">
                  {backendMessage ||
                    (lang === "tr"
                      ? "Backend tarafında /api/blog endpointi henüz yayında olmayabilir."
                      : "Backend /api/blog endpoint might not be deployed yet.")}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !isFetching && posts.length === 0 && (
          <div className="row">
            <div className="col-12">
              <div className="p-4 bg-white rounded">
                <p className="mb-0">{lang === "tr" ? "Henüz yayınlanmış yazı bulunmuyor." : "No published posts yet."}</p>
              </div>
            </div>
          </div>
        )}

        <div className="row g-4">
          {posts.map((post) => (
            <div key={post.id || post.slug} className="col-xl-4 col-lg-6 col-md-6">
              <article className="bg-white rounded overflow-hidden h-100 d-flex flex-column" style={{ border: "1px solid #e9ecef", boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)" }}>
                <Link href={"/blog/" + post.slug} className="d-block position-relative" style={{ height: 220 }}>
                  <Image
                    src={post.coverImage || fallbackCover}
                    alt={post.title || "Blog"}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </Link>

                <div className="p-4 d-flex flex-column flex-grow-1" style={{ gap: 12 }}>
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <span className="badge text-bg-light border">{lang === "tr" ? "Blog" : "Article"}</span>
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      {getBlogReadTime(post)} {lang === "tr" ? "dk okuma" : "min read"}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 0, minHeight: 52 }}>
                    <Link href={"/blog/" + post.slug} className="text-heading">
                      {post.title}
                    </Link>
                  </h4>
                  <p className="text-muted mb-0" style={{ minHeight: 72 }}>
                    {buildBlogExcerpt(post) || (lang === "tr" ? "Yazıyı incelemek için devam edin." : "Read the full article.")}
                  </p>
                  <div className="mt-auto">
                    <Link href={"/blog/" + post.slug} className="tp-btn-border w-100 text-center">
                      {lang === "tr" ? "Yazıyı Oku" : "Read Article"}
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogListPage;
