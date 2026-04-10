import Link from "next/link";
import React from "react";

const Breadcrumb = ({
  title,
  subtitle,
  subChild = true,
}: {
  title: string;
  subtitle: string;
  subChild?: boolean;
}) => {
  return (
    <div className="mb-10 rounded-xl border border-slate-200 bg-slate-50 px-5 py-4 sm:px-6 sm:py-5">
      <div className="page-title">
        <h3 className="mb-1 text-[28px]">{title}</h3>
        {subChild && (
          <ul className="text-tiny font-medium flex items-center space-x-3 text-text3 mb-0">
            <li className="breadcrumb-item text-muted">
              <Link href="/dashboard" className="text-hover-primary">
                Anasayfa
              </Link>
            </li>
            <li className="breadcrumb-item flex items-center">
              <span className="inline-block bg-text3/60 w-[4px] h-[4px] rounded-full"></span>
            </li>
            <li className="breadcrumb-item text-muted">{subtitle}</li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default Breadcrumb;
