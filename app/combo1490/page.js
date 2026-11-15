import { notFound } from "next/navigation";
import { bn } from "@/data/site";
import { getSettings, getProducts, deliveryOptions } from "@/lib/store";
import { getCombo, comboFill, comboVars } from "@/lib/combo";
import Tracking from "@/components/Tracking";
import ComboOrderForm from "@/components/ComboOrderForm";
import "./combo.css";

// Admin > কম্বো ক্যাম্পেইন পেজ theke shob lekha, chobi ar pondo ashe
async function load() {
  const [s, products] = await Promise.all([getSettings(), getProducts({ all: true })]);
  const c = getCombo(s);
  const product = products.find((p) => p.id === c.productId) || null;
  const delivery = deliveryOptions(s);
  const price = product?.price || 0;
  const v = comboVars({ price, oldPrice: product?.old_price, brand: s.brand, delivery });
  const t = (k) => comboFill(c.text[k], v);
  return { s, c, product, delivery, price, v, t };
}

export async function generateMetadata() {
  const { s, t } = await load();
  return {
    ...(s.logo ? { icons: { icon: s.logo, apple: s.logo } } : {}),
    title: t("meta_title"),
    description: t("meta_desc"),
  };
}

export const viewport = { themeColor: "#080d20" };

// [ ] er bhitorer lekha sonali
const Gold = ({ text }) =>
  String(text).split(/(\[[^\]]*\])/).map((p, i) => (p.startsWith("[") && p.endsWith("]") ? <em key={i}>{p.slice(1, -1)}</em> : p));
const lines = (str) => String(str || "").split("\n").map((x) => x.trim()).filter(Boolean);

export default async function ComboPage() {
  const { s, c, product, delivery, price, v, t } = await load();
  if (!c.enabled) notFound();
  const fill = (str) => comboFill(str, v);
  const L = c.lists;
  const oldPrice = product?.old_price > price ? product.old_price : 0;
  const brand = String(s.brand || "AYAAT PERFUME").toUpperCase();

  return (
    <div className="c1490">
      <Tracking pixel={s.fb_pixel} gtm={s.gtm_id} />
      <div className="cb-topbar">{t("topbar")}</div>
      <header className="cb-header">
        <div className="cb-container cb-nav">
          <a className="cb-brand" href="#">{brand}</a>
          <nav className="cb-navlinks">
            <a href="#collection">কালেকশন</a><a href="#benefits">কেন নেবেন</a><a href="#offer">অফার</a><a href="#faq">FAQ</a>
          </nav>
          <a className="cb-btn cb-navbtn" href="#order">{t("nav_btn")}</a>
        </div>
      </header>

      <main>
        <section className="cb-hero">
          <div className="cb-container cb-hero-grid">
            <div className="cb-hero-copy">
              <span className="cb-eyebrow">{t("eyebrow")}</span>
              <h1><Gold text={t("hero_title")} /></h1>
              <p>{t("hero_text")}</p>
              <div className="cb-price-line">
                <span className="cb-price">৳{v.price}</span>
                {oldPrice > 0 && <span className="cb-old">৳{bn(oldPrice)}</span>}
                {t("save_badge") && <span className="cb-save">{t("save_badge")}</span>}
              </div>
              <div className="cb-hero-actions">
                <a className="cb-btn" href="#order">{t("hero_btn")}</a>
                <a className="cb-secondary" href="#collection">{t("hero_btn2")}</a>
              </div>
              <div className="cb-trust">{lines(t("trust")).map((x) => <span key={x}>{x}</span>)}</div>
            </div>
            {c.text.poster && (
              <div className="cb-poster-wrap"><img className="cb-poster" src={c.text.poster} alt={t("meta_title")} /></div>
            )}
          </div>
        </section>

        {L.products.length > 0 && (
          <section className="cb-included" id="collection">
            <div className="cb-container">
              <div className="cb-head"><div className="cb-kicker">{t("col_kicker")}</div><h2>{t("col_title")}</h2><p>{t("col_text")}</p></div>
              <div className="cb-product-grid">
                {L.products.map((p, i) => (
                  <article key={i} className="cb-product">
                    {p.image ? <img src={p.image} alt={p.name} /> : <div className="cb-noimg">🧴</div>}
                    <h3>{fill(p.name)}</h3><p>{fill(p.desc)}</p>{p.tag && <span className="cb-tag">{fill(p.tag)}</span>}
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {c.text.gift_show !== "off" && (
          <section className="cb-free">
            <div className="cb-container cb-free-card">
              {c.text.gift_image ? <img src={c.text.gift_image} alt={t("gift_title")} /> : <div className="cb-noimg">🎁</div>}
              <div className="cb-free-copy">
                <span className="cb-free-badge">{t("gift_badge")}</span><h2>{t("gift_title")}</h2><p>{t("gift_text")}</p>
                <a className="cb-btn" href="#order">{t("gift_btn")}</a>
              </div>
            </div>
          </section>
        )}

        {L.benefits.length > 0 && (
          <section id="benefits">
            <div className="cb-container">
              <div className="cb-head"><div className="cb-kicker">{t("ben_kicker")}</div><h2>{t("ben_title")}</h2><p>{t("ben_text")}</p></div>
              <div className="cb-benefits">
                {L.benefits.map((b, i) => (
                  <div key={i} className="cb-benefit"><div className="cb-ico">{b.icon}</div><h3>{fill(b.title)}</h3><p>{fill(b.text)}</p></div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="cb-offer" id="offer">
          <div className="cb-container"><div className="cb-offer-box">
            <div className="cb-kicker">{t("offer_kicker")}</div><h2>{t("offer_title")}</h2>
            <span className="cb-price">৳{v.price}</span>
            <ul>{lines(t("offer_items")).map((x) => <li key={x}>{x}</li>)}</ul>
            <a className="cb-btn" href="#order">{t("offer_btn")}</a>
          </div></div>
        </section>

        <section className="cb-order" id="order">
          <div className="cb-container">
            <div className="cb-head"><div className="cb-kicker">{t("order_kicker")}</div><h2>{t("order_title")}</h2><p>{t("order_text")}</p></div>
            <div className="cb-order-wrap">
              <aside className="cb-order-info">
                <h3>{t("info_title")}</h3><p>{t("info_text")}</p>
                <div className="cb-summary"><span>কম্বো মূল্য</span><strong>৳{v.price}</strong></div>
                <p className="cb-small">ঢাকার ভেতরে ডেলিভারি ৳{v.inside} • বাইরে ৳{v.outside}</p>
              </aside>
              {product ? (
                <ComboOrderForm
                  product={{ id: product.id, name: product.name, price: product.price, boxes: product.boxes || 1 }}
                  delivery={delivery}
                  freeBoxes={Number(s.free_delivery_boxes) || 0}
                  text={{ form_title: t("form_title"), form_text: t("form_text"), submit_btn: t("submit_btn"), success_title: t("success_title"), success_text: t("success_text") }}
                />
              ) : (
                <div className="cb-form-card"><p>এই মুহূর্তে অর্ডার নেওয়া বন্ধ আছে। কল করুন: {s.phone}</p></div>
              )}
            </div>
          </div>
        </section>

        {L.faq.length > 0 && (
          <section id="faq"><div className="cb-container">
            <div className="cb-head"><div className="cb-kicker">{t("faq_kicker")}</div><h2>{t("faq_title")}</h2></div>
            <div className="cb-faq">
              {L.faq.map((f, i) => <details key={i}><summary>{fill(f.q)}</summary><p>{fill(f.a)}</p></details>)}
            </div>
          </div></section>
        )}
      </main>

      <footer className="cb-footer"><div className="cb-container"><strong>{brand}</strong><br />{t("footer")}<br />© {new Date().getFullYear()} {brand}. সর্বস্বত্ব সংরক্ষিত।</div></footer>
      <div className="cb-sticky"><div><small>{t("sticky_text")}</small><br /><b>৳{v.price}</b></div><a className="cb-btn" href="#order">{t("sticky_btn")}</a></div>
    </div>
  );
}
