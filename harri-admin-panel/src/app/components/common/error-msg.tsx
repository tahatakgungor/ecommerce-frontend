import React from "react";

type ErrorType = {
  msg: string;
};

const normalizeErrorMessage = (msg: string) => {
  const raw = String(msg || "").trim();
  if (!raw) return "Bir hata oluştu. Lütfen tekrar deneyin.";
  const lower = raw.toLowerCase();
  if (lower === "there was an error") return "Bir hata oluştu. Lütfen tekrar deneyin.";
  if (lower.includes("unauthorized") || lower.includes("token") || lower.includes("forbidden")) {
    return "Oturum doğrulaması başarısız. Lütfen tekrar giriş yapın.";
  }
  return raw;
};

const ErrorMsg = ({ msg }: ErrorType) => {
  return <div style={{ color: "red" }}>{normalizeErrorMessage(msg)}</div>;
};

export default ErrorMsg;
