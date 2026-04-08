'use client';
import React from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
// internal
import OrderDetails from "./order-details";
import OrderSingleCartItem from "./order-single-cart-item";
import { useLanguage } from "src/context/LanguageContext";

const OrderArea = ({
  register,
  errors,
  discountAmount,
  shippingCost,
  cartTotal,
  handleShippingCost,
  isCheckoutSubmit,
  appliedCoupon,
  handleRemoveCoupon,
  showIyzicoModal,
  isAgreementChecked,
  setIsAgreementChecked,
}) => {
  const { cart_products } = useSelector((state) => state.cart);
  const { t, lang } = useLanguage();
  const [showAgreementModal, setShowAgreementModal] = React.useState(false);

  const agreementText = `
MADDE 1 – TARAFLAR
SATICI
Ticari Ünvanı : Humat Kimya İlaç Kozmetik Gıda Çevre San. Tic. Ltd. Şti.
Adresi : Kocakaymas M. Eski Kandıra C. No:12 Kandıra/Kocaeli
Telefon : 0 262 581 55 15
E-mail : info@humat.com.tr
(Bundan sonra “SATICI” anılacaktır.)

ALICI
Adı – soyadı :
Adresi : Kocaeli
Telefon :
E-mail :
(Bundan sonra “ALICI” anılacaktır.)

MADDE 2 – SÖZLEŞMENİN KONUSU ve KAPSAMI
İşbu Mesafeli Satış Sözleşmesi (“Sözleşme”) Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik’e uygun olarak düzenlenmiştir. İşbu Sözleşme’nin tarafları işbu Sözleşme tahtında Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik’ten kaynaklanan yükümlülük ve sorumluluklarını bildiklerini ve anladıklarını kabul ve beyan ederler. İşbu sözleşmenin konusu, Alıcı’nın, SATICI’ya ait ythobby.com veya sunulan hizmete bağlı diler alan adları üzerinden (“Websitesi”), Satıcıya ait ürünlerin satın alınmasına yönelik elektronik olarak sipariş verdiği, sözleşmede belirtilen niteliklere sahip mal/hizmetin satışı ve teslimi ile ilgili olarak Tüketicinin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanması oluşturur.

MADDE 3 – SÖZLEŞME KONUSU MALIN TEMEL NİTELİKLERİ VE BEDELİ
Ürün/Ürünlerin cinsi ve türü, miktarı, marka/modeli, rengi ve vergiler dahil satış bedeli ve teslimat bilgileri aşağıdaki gibidir:
Kargo Ücreti: Ücretsiz!
Toplam: ${cartTotal}₺

MADDE 4 – MALIN TESLİMİ VE TESLİM ŞEKLİ
Mal/hizmet, Alıcı’nın sipariş formunda ve işbu sözleşmede belirtmiş olduğu adreste bulunan kişi/kişilere teslim edilecektir.

... (İlgili metnin devamı modal içinde gösterilecektir)
`;

  return (
    <div className="your-order mb-30 ">
      <h3>{t('yourOrder')}</h3>
      <div className="your-order-table table-responsive">
        <table>
          <thead>
            <tr>
              <th className="product-name">{t('product')}</th>
              <th className="product-total text-end">{t('total')}</th>
            </tr>
          </thead>
          <tbody>
            {cart_products?.map((item, i) => {
              const netPrice =
                Number.isFinite(Number(item.price))
                  ? Number(item.price)
                  : (item.discount && item.discount > 0
                      ? item.originalPrice - (item.originalPrice * item.discount) / 100
                      : item.originalPrice);
              return (
                <OrderSingleCartItem
                  key={i}
                  productId={item._id}
                  title={item.title}
                  image={item.image}
                  quantity={item.orderQuantity}
                  price={(netPrice * item.orderQuantity).toFixed(2)}
                />
              );
            })}
          </tbody>
          <tfoot>
            <OrderDetails
              register={register}
              errors={errors}
              discountAmount={discountAmount}
              cartTotal={cartTotal}
              shippingCost={shippingCost}
              handleShippingCost={handleShippingCost}
              appliedCoupon={appliedCoupon}
              handleRemoveCoupon={handleRemoveCoupon}
            />
          </tfoot>
        </table>
      </div>

      {!showIyzicoModal && (
        <>
          <div className="payment-method-selection mt-25">
            <h3 className="mb-10" style={{ fontSize: '18px', fontWeight: '700' }}>
              {lang === 'tr' ? "Ödeme Yöntemi" : "Payment Method"}
            </h3>
            <div 
              className="payment-selected-card"
              style={{
                background: '#fcfcfc',
                border: '1px solid #2EAA46',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                position: 'relative'
              }}
            >
              <div className="d-flex align-items-center gap-3">
                <div 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    background: '#2EAA46', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                >
                  <i className="fas fa-check"></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#333' }}>
                    {showIyzicoModal 
                      ? (lang === 'tr' ? "Ödeme İşlemi Bekleniyor" : "Awaiting Payment")
                      : (lang === 'tr' ? "iyzico ile Güvenli Öde" : "Pay with iyzico")}
                  </h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#777' }}>
                    {showIyzicoModal
                      ? (lang === 'tr' ? "Lütfen soldaki formu doldurun" : "Please fill in the form on the left")
                      : (lang === 'tr' ? "Kart Bilgileri Bir Sonraki Adımda" : "Secure Payment Gateway")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-15 p-2" style={{ background: '#f8fdf9', borderRadius: '6px', border: '1px solid #eefae1' }}>
              <p style={{ fontSize: '11px', color: '#555', margin: 0, lineHeight: '1.4' }}>
                <i className="fas fa-lock me-1" style={{ color: '#2EAA46' }}></i>
                {lang === 'tr' 
                  ? "256-bit SSL korumalı iyzico altyapısı."
                  : "256-bit SSL protected iyzico infrastructure."}
              </p>
            </div>
          </div>

          <div className="agreement-checkbox mt-20" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="agreement-check"
              checked={isAgreementChecked}
              onChange={(e) => setIsAgreementChecked(e.target.checked)}
              style={{ width: '18px', height: '18px', marginTop: '2px', cursor: 'pointer' }}
            />
            <label htmlFor="agreement-check" style={{ fontSize: '13px', lineHeight: '1.5', color: '#555', cursor: 'pointer' }}>
              <button 
                type="button"
                onClick={() => setShowAgreementModal(true)}
                style={{ color: '#2EAA46', fontWeight: 'bold', textDecoration: 'underline', background: 'none', border: 'none', padding: 0 }}
              >
                Mesafeli Satış Sözleşmesini
              </button> okudum ve kabul ediyorum.
            </label>
          </div>

          <div className="order-button-payment mt-20">
            <div className="iyzico-info mb-20 text-center" style={{ 
              background: 'linear-gradient(135deg, #ffffff 0%, #f4fdf6 100%)', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1px solid #e1f5e6',
              boxShadow: '0 4px 12px rgba(46, 170, 70, 0.05)'
            }}>
               <img 
                 src="https://www.iyzipay.com/assets/img/iyzico-logo.png" 
                 alt="iyzico" 
                 style={{ height: '22px', marginBottom: '10px', display: 'block', margin: '0 auto' }} 
                 onError={(e) => e.target.style.display = 'none'}
               />
               <p style={{ fontSize: '12px', color: '#555', margin: 0, fontWeight: '500', lineHeight: '1.5' }}>
                 {lang === 'tr' 
                   ? "Ödemeniz iyzico güvencesiyle 256-bit SSL korumalı altyapı üzerinden alınacaktır." 
                   : "Your payment will be processed securely via iyzico with 256-bit SSL protection."}
               </p>
            </div>
            <button
              type="submit"
              className="tp-btn"
              disabled={cart_products.length === 0 || isCheckoutSubmit || !isAgreementChecked}
              style={{
                width: "100%",
                opacity: (!isAgreementChecked || isCheckoutSubmit) ? 0.6 : 1,
                cursor: (!isAgreementChecked || isCheckoutSubmit) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '15px',
                fontWeight: '700',
                backgroundColor: '#2EAA46'
              }}
            >
              <i className="fas fa-lock" style={{ fontSize: '13px' }}></i>
              {isCheckoutSubmit
                ? (lang === "tr" ? "İşleniyor..." : "Processing...")
                : (lang === "tr" ? "iyzico ile Güvenli Öde" : "Pay Securely with iyzico")}
            </button>
          </div>

          {/* Agreement Modal */}
          {showAgreementModal && createPortal(
            <div style={{ position: 'fixed', inset: 0, zIndex: 9999999, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <div style={{ background: '#fff', maxWidth: '800px', width: '100%', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0 }}>Mesafeli Satış Sözleşmesi</h4>
                  <button onClick={() => setShowAgreementModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px' }}>&times;</button>
                </div>
                <div style={{ padding: '24px', overflowY: 'auto', fontSize: '14px', lineHeight: '1.6', color: '#444', whiteSpace: 'pre-wrap' }}>
                  {`MADDE 1 – TARAFLAR
SATICI
Ticari Ünvanı : Humat Kimya İlaç Kozmetik Gıda Çevre San. Tic. Ltd. Şti.
Adresi : Kocakaymas M. Eski Kandıra C. No:12 Kandıra/Kocaeli
Telefon : 0 262 581 55 15
E-mail : info@humat.com.tr
(Bundan sonra “SATICI” anılacaktır.)

ALICI
Adı – soyadı :
Adresi : Kocaeli
Telefon :
E-mail :
(Bundan sonra “ALICI” anılacaktır.)

MADDE 2 – SÖZLEŞMENİN KONUSU ve KAPSAMI
İşbu Mesafeli Satış Sözleşmesi (“Sözleşme”) Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik’e uygun olarak düzenlenmiştir. İşbu Sözleşme’nin tarafları işbu Sözleşme tahtında Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik’ten kaynaklanan yükümlülük ve sorumluluklarını bildiklerini ve anladıklarını kabul ve beyan ederler. İşbu sözleşmenin konusu, Alıcı’nın, SATICI’ya ait ythobby.com veya sunulan hizmete bağlı diler alan adları üzerinden (“Websitesi”), Satıcıya ait ürünlerin satın alınmasına yönelik elektronik olarak sipariş verdiği, sözleşmede belirtilen niteliklere sahip mal/hizmetin satışı ve teslimi ile ilgili olarak Tüketicinin Korunması Hakkındaki Kanun ve Mesafeli Sözleşmelere Dair Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin saptanması oluşturur.

MADDE 3 – SÖZLEŞME KONUSU MALIN TEMEL NİTELİKLERİ VE BEDELİ
Ürün/Ürünlerin cinsi ve türü, miktarı, marka/modeli, rengi ve vergiler dahil satış bedeli ve teslimat bilgileri aşağıdaki gibidir:
Kargo Ücreti: Ücretsiz!
Toplam: ${cartTotal}₺

MADDE 4 – MALIN TESLİMİ VE TESLİM ŞEKLİ
Sözleşme Alıcı tarafından onaylanmakla yürürlüğe girmiş olup, Alıcı’nın Satıcı’dan satın almış olduğu Mal/Hizmet’in Alıcı’ya teslim edilmesiyle ifa edilmiş olur. Mal/hizmet, Alıcı’nın sipariş formunda ve işbu sözleşmede belirtmiş olduğu adreste bulunan kişi/kişilere teslim edilecektir.

MADDE 5 – TESLİMAT MASRAFLARI VE İFASI
Mal/Hizmet’in teslimat masrafları Alıcı’ya aittir. Satıcı’nın, websitesinde teslimat ücretinin kendisince karşılanacağını beyan etmişse, teslimat masrafları Satıcı’ya ait olacaktır. Malın teslimatı; Satıcı’nın stokunun müsait olması ve ödemenin gerçekleşmesinden sonra taahhüt edilen sürede yapılır. Satıcı Mal/Hizmet’i, Alıcı tarafından Mal/Hizmet’in sipariş edilmesinden itibaren 30 (otuz) gün içinde teslim eder ve bu süre içinde yazılı bildirimle ek 10 (on) günlük süre uzatım hakkını saklı tutar.

MADDE 6 – ALICININ BEYAN VE TAAHHÜTLERİ
Alıcı, Websitesinde yer alan sözleşme konusu ürünün temel nitelikleri, satış fiyatı ve ödeme şekli ile teslimata ilişkin olarak Satıcı tarafından yüklenen ön bilgileri okuyup bilgi sahibi olduğunu ve elektronik ortamda gerekli teyidi verdiğini beyan eder.

MADDE 7 – SATICININ BEYAN VE TAAHHÜTLERİ
Satıcı, Sözleşme konusu Mal/Hizmet’in Tüketici Mevzuatına uygun olarak, sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgeleri ve kullanım kılavuzları ile Alıcı’ya teslim edilmesinden sorumludur.

MADDE 8 – CAYMA HAKKI
Alıcı’nın hiçbir hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin teslim aldığı veya sözleşmenin imzalandığı tarihten itibaren 7 (yedi) gün içerisinde malı veya hizmeti reddederek sözleşmeden cayma hakkının var olduğunu ve cayma bildiriminin Satıcı’ya ulaşması tarihinden itibaren Satıcı’nın malı geri alacağını Satıcı taahhüt eder.

MADDE 9 – CAYMA HAKKININ KULLANILAMAYACAĞI HALLER
Cayma hakkı aşağıdaki hallerde kullanılamaz: Tüketicinin istekleri veya açıkça onun kişisel ihtiyaçları doğrultusunda hazırlanan, niteliği itibariyle geri gönderilmeye elverişli olmayan ve çabuk bozulma tehlikesi olan mallar.

MADDE 10 – UYUŞMAZLIKLARIN ÇÖZÜMÜ
Uyuşmazlık durumunda Alıcı’nın ikametgahının bulunduğu yerdeki Tüketici Hakem Heyetleri veya Tüketici Mahkemeleri yetkilidir.

MADDE 11 – MAL/HİZMETİN FİYATI
Mal/hizmetin peşin veya vadeli fiyatı sipariş formunda yer alan fiyattır.

MADDE 12 – TEMERRÜD HALİ VE HUKUKİ SONUÇLARI
Alıcı, kredi kartı ile yapmış olduğu işlemlerinde temerrüde düşmesi halinde kart sahibi bankaya karşı sorumlu olacaktır.

MADDE 13 – BİLDİRİMLER ve DELİL SÖZLEŞMESİ
Taraflar arasındaki her türlü yazışma e-mail aracılığıyla yapılacaktır.

MADDE 14 – YÜRÜRLÜK
14 maddeden ibaret bu Sözleşme, Alıcı tarafından elektronik ortamda onaylanmak suretiyle akdedilmiş ve derhal yürürlüğe girmiştir.`}
                </div>
                <div style={{ padding: '20px', borderTop: '1px solid #eee', textAlign: 'right' }}>
                  <button 
                    onClick={() => {
                      setIsAgreementChecked(true);
                      setShowAgreementModal(false);
                    }} 
                    className="tp-btn"
                    style={{ padding: '10px 24px' }}
                  >
                    Okudum, Kabul Ediyorum
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}

      {isCheckoutSubmit && typeof window !== "undefined" && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 999999, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'wait', pointerEvents: 'all' }}>
          <div style={{ width: 54, height: 54, border: '5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'checkoutSpin 0.75s linear infinite' }} />
          <style>{'@keyframes checkoutSpin{to{transform:rotate(360deg)}}'}</style>
        </div>,
        document.body
      )}
    </div>
  );
};

export default OrderArea;
