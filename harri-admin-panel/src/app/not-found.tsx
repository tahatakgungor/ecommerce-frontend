import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      fontFamily: "Poppins, sans-serif",
    }}>
      <h1 style={{ fontSize: 72, fontWeight: 700, color: "#821f40", margin: 0 }}>404</h1>
      <p style={{ fontSize: 18, color: "#555", marginTop: 8 }}>Sayfa bulunamadı</p>
      <Link
        href="/"
        style={{
          marginTop: 20,
          padding: "10px 24px",
          background: "#821f40",
          color: "#fff",
          borderRadius: 6,
          textDecoration: "none",
          fontSize: 14,
        }}
      >
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
