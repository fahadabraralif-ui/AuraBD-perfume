import Link from "next/link";
import { getProducts } from "@/lib/store";
import DeleteProduct from "./DeleteProduct";
import QuickPrice from "./QuickPrice";

export default async function ProductsPage() {
  const products = await getProducts({ all: true });

  return (
    <>
      <div className="adm-title-row">
        <h1 className="adm-title">পণ্য</h1>
        <Link href="/admin/products/new" className="adm-btn">➕ নতুন পণ্য</Link>
      </div>
      <p className="adm-muted adm-intro">প্রথম (সবার উপরের) সক্রিয় পণ্যের দাম ল্যান্ডিং পেজে অফার মূল্য হিসেবে দেখায়। দাম, আগের দাম বা স্টক এখানেই বদলে <b>💾 সেভ</b> চাপুন (বা Enter) — সাথে সাথে সাইটে বদলে যাবে।</p>

      <div className="adm-box">
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr><th></th><th>নাম</th><th>দাম</th><th>আগের দাম</th><th>স্টক</th><th>অবস্থা</th><th></th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.image ? <img src={p.image} alt="" className="adm-thumb" /> : "—"}</td>
                  <td><b>{p.name}</b></td>
                  <QuickPrice p={p} />
                  <td><span className={`pill ${p.active ? "st-delivered" : "st-cancelled"}`}>{p.active ? "সক্রিয়" : "বন্ধ"}</span></td>
                  <td className="adm-actions">
                    <Link href={`/admin/products/${p.id}`} className="adm-btn sm ghost">✏️ এডিট</Link>
                    <DeleteProduct id={p.id} name={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
