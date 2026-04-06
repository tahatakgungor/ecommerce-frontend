"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetBlogPostsQuery } from "src/redux/features/blogApi";
import { useLanguage } from "src/context/LanguageContext";

const fallbackCover = "/assets/img/slider/13/slider-1.png";

const BlogListPage = () => {
  const { data, isLoading, isFetching } = useGetBlogPostsQuery();
  const { lang } = useLanguage();
  const posts = Array.isArray(data?.posts) ? data.posts : [];

  return (
    <section className="pt-60 pb-80 grey-bg-17">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tp-section-title-wrapper mb-35">
              <h3 className="tp-section-title-3">{lang === "tr" ? "Blog" : "Blog"}</h3>
              <p className="text-muted mb-0">
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
              <article className="bg-white rounded overflow-hidden h-100" style={{ border: "1px solid #e9ecef" }}>
                <Link href={"/blog/" + post.slug} className="d-block position-relative" style={{ height: 220 }}>
                  <Image
                    src={post.coverImage || fallbackCover}
                    alt={post.title || "Blog"}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </Link>

                <div className="p-4 d-flex flex-column" style={{ gap: 12 }}>
                  <h4 style={{ fontSize: 20, lineHeight: 1.3, marginBottom: 0 }}>
                    <Link href={"/blog/" + post.slug} className="text-heading">
                      {post.title}
                    </Link>
                  </h4>
                  <p className="text-muted mb-0" style={{ minHeight: 48 }}>
                    {post.summary || (lang === "tr" ? "Yazıyı incelemek için devam edin." : "Read the full article.")}
                  </p>
                  <div>
                    <Link href={"/blog/" + post.slug} className="tp-btn-border">
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
