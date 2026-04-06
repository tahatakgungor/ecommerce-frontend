"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetBlogPostBySlugQuery } from "src/redux/features/blogApi";
import { useGetShowingProductsQuery } from "src/redux/features/productApi";
import { useLanguage } from "src/context/LanguageContext";
import ProductRatingSummary from "src/components/products/product-rating-summary";

const fallbackCover = "/assets/img/slider/13/slider-1.png";

const toSafeDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const BlogDetailsPage = ({ slug }) => {
  const { lang } = useLanguage();
  const { data, isLoading, isFetching, isError } = useGetBlogPostBySlugQuery(slug, { skip: !slug });
  const { data: productsData } = useGetShowingProductsQuery();

  const post = data?.post || null;
  const allProducts = Array.isArray(productsData?.products) ? productsData.products : [];
  const relatedIdSet = new Set(Array.isArray(post?.relatedProductIds) ? post.relatedProductIds.map(String) : []);
  const relatedProducts = allProducts.filter((item) => relatedIdSet.has(String(item._id || item.id)));
  const publishedDate = toSafeDate(post?.publishedAt || post?.updatedAt || post?.createdAt);

  if (isLoading || isFetching) {
    return (
      <section className="pt-80 pb-80 grey-bg-17">
        <div className="container">
          <p>{lang === "tr" ? "Yazı yükleniyor..." : "Loading article..."}</p>
        </div>
      </section>
    );
  }

  if (isError || !post) {
    return (
      <section className="pt-80 pb-80 grey-bg-17">
        <div className="container">
          <div className="bg-white p-5 rounded">
            <h3 className="mb-3">{lang === "tr" ? "Yazı bulunamadı" : "Article not found"}</h3>
            <Link href="/blog" className="tp-btn-border">
              {lang === "tr" ? "Blog listesine dön" : "Back to blog"}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-60 pb-80 grey-bg-17">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><Link href="/">{lang === "tr" ? "Anasayfa" : "Home"}</Link></li>
                <li className="breadcrumb-item"><Link href="/blog">{lang === "tr" ? "Blog" : "Blog"}</Link></li>
                <li className="breadcrumb-item active" aria-current="page">{post.title}</li>
              </ol>
            </nav>
          </div>
        </div>

        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <article className="bg-white rounded overflow-hidden" style={{ border: "1px solid #e9ecef" }}>
              <div className="position-relative" style={{ minHeight: 300 }}>
                <Image
                  src={post.coverImage || fallbackCover}
                  alt={post.title || "Blog"}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1000px"
                  style={{ objectFit: "cover" }}
                />
              </div>

              <div className="p-4 p-md-5">
                <h1 style={{ fontSize: 34, lineHeight: 1.2, marginBottom: 12 }}>{post.title}</h1>
                {publishedDate ? (
                  <p className="text-muted mb-4">
                    {lang === "tr" ? "Yayın tarihi" : "Published"}: {publishedDate.toLocaleDateString(lang === "tr" ? "tr-TR" : "en-US")}
                  </p>
                ) : null}

                {post.summary ? <p className="mb-4" style={{ fontSize: 18, lineHeight: 1.6 }}>{post.summary}</p> : null}

                <div
                  className="tp-blog-richtext"
                  dangerouslySetInnerHTML={{ __html: post.contentHtml || "" }}
                />
              </div>
            </article>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="row mt-5">
            <div className="col-12">
              <h3 className="mb-4">{lang === "tr" ? "İlgili Ürünler" : "Related Products"}</h3>
            </div>
            {relatedProducts.map((product) => {
              const id = product._id || product.id;
              const href = "/product-details/" + id;
              return (
                <div key={String(id)} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 mb-4">
                  <article className="bg-white rounded p-3 h-100" style={{ border: "1px solid #e9ecef" }}>
                    <Link href={href} className="d-flex align-items-center justify-content-center mb-3" style={{ minHeight: 150 }}>
                      <Image
                        src={product.image || fallbackCover}
                        alt={product.name || "Product"}
                        width={160}
                        height={160}
                        style={{ objectFit: "contain" }}
                      />
                    </Link>
                    <h4 style={{ fontSize: 16, minHeight: 46 }}>
                      <Link href={href} className="text-heading">{product.name}</Link>
                    </h4>
                    <div className="mb-2">
                      <ProductRatingSummary productId={id} compact={true} />
                    </div>
                    <p className="mb-0 fw-semibold">\u20BA{Number(product.price || 0).toLocaleString("tr-TR")}</p>
                  </article>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogDetailsPage;
