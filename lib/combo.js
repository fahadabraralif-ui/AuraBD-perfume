import { bn } from "@/data/site";

// /combo1490 campaign page er lekha — admin > কম্বো ক্যাম্পেইন পেজ theke bodlano jay.
// settings.combo1490 = JSON { text, lists, product_id, enabled }
export const COMBO_TEXT = {
  meta_title: "{brand} | 11:11 Special Campaign",
  meta_desc: "৪টি ৩০ml প্রিমিয়াম পারফিউমের সাথে ১৫ml ফ্রি, মাত্র {price} টাকা।",
  topbar: "🔥 11:11 MEGA CAMPAIGN — ৪টি ৩০ml পারফিউমের সাথে ১৫ml সম্পূর্ণ ফ্রি!",
  topbar_cod: "🚚 ক্যাশ অন ডেলিভারি",
  countdown_show: "on",
  countdown_title: "🔥 ১১:১১ অফার শেষ হতে বাকি",
  // Page khulle baje emon voice (khali = main site er voice)
  voice_show: "on",
  voice: "",
  gallery_badge: "🎁 +১৫ml ফ্রি",
  rating: "৪.৯/৫",
  rating_note: "(১,২০০+ সন্তুষ্ট কাস্টমার)",
  wa_btn: "💬 WhatsApp এ অর্ডার করুন",
  nav_btn: "অর্ডার করুন",
  eyebrow: "✦ LIMITED TIME • 11:11 CAMPAIGN",
  hero_title: "আপনার প্রতিদিনের স্টাইলে যোগ হোক [প্রিমিয়াম সুবাস]",
  hero_text: "একটি কম্বোতেই পাচ্ছেন ৪টি ভিন্ন ঘরানার ৩০ml পারফিউম। সঙ্গে থাকছে ১৫ml Jahane Hawas Fire একদম ফ্রি!",
  save_badge: "স্পেশাল কম্বো অফার",
  hero_btn: "এখনই অর্ডার করুন →",
  hero_btn2: "কালেকশন দেখুন",
  trust: "✓ ৫টি পারফিউম\n✓ ক্যাশ অন ডেলিভারি\n✓ সারা বাংলাদেশে অর্ডার",
  poster: "",
  col_kicker: "THE SIGNATURE COLLECTION",
  col_title: "কম্বোতে যা যা পাচ্ছেন",
  col_text: "প্রতিটি মুহূর্তের জন্য আলাদা ঘরানার চারটি আকর্ষণীয় ফ্র্যাগরেন্স।",
  gift_show: "on",
  gift_image: "/images/hawas-fire.webp",
  gift_badge: "১৫ml একদম FREE!",
  gift_title: "কম্বোর সাথে পাচ্ছেন আরও একটি পারফিউম উপহার",
  gift_text: "Jahane Hawas Fire ১৫ml — আপনার ৪টি পারফিউমের কম্বোকে আরও সম্পূর্ণ করতে থাকছে এই স্পেশাল ফ্রি গিফট।",
  gift_btn: "গিফটসহ কম্বোটি অর্ডার করুন",
  ben_kicker: "WHY THIS COMBO",
  ben_title: "এক কম্বোতেই এত কিছু কেন?",
  ben_text: "নিজের জন্য হোক কিংবা প্রিয়জনকে উপহার—একসাথে পাচ্ছেন পাঁচটি ভিন্ন সুবাসের অভিজ্ঞতা।",
  offer_kicker: "11:11 SPECIAL CAMPAIGN",
  offer_title: "৫টি পারফিউমের প্রিমিয়াম কম্বো",
  offer_items: "Vampire Blood — ৩০ml\nHawas Ice — ৩০ml\nBleu de Chanel — ৩০ml\nAurevo Signature — ৩০ml\nJahane Hawas Fire — ১৫ml সম্পূর্ণ ফ্রি",
  offer_btn: "অফারটি নিতে অর্ডার করুন →",
  order_kicker: "PLACE YOUR ORDER",
  order_title: "অর্ডার করতে আপনার তথ্য দিয়ে [নিচের ফরমটি পূরণ করুন]",
  order_text: "আপনার সঠিক তথ্য দিন, আমরা অর্ডারটি নিশ্চিত করতে যোগাযোগ করব।",
  form_title: "১১:১১ স্পেশাল কম্বো",
  submit_btn: "অর্ডার করুন",
  success_title: "ধন্যবাদ! আপনার অর্ডারটি গ্রহণ করা হয়েছে",
  success_text: "আমাদের প্রতিনিধি খুব শীঘ্রই আপনাকে কল করে অর্ডার কনফার্ম করবেন।",
  faq_kicker: "HELP CENTER",
  faq_title: "সাধারণ কিছু প্রশ্ন",
  footer: "আপনার প্রতিদিনের সুবাস, আপনার নিজস্ব পরিচয়।",
  sticky_text: "১১:১১ স্পেশাল অফার",
  sticky_btn: "এখনই অর্ডার",
};

export const COMBO_LISTS = {
  products: [
    { image: "/images/vampire-blood.avif", name: "Vampire Blood", desc: "ডার্ক, রহস্যময় ও আকর্ষণীয় ঘরানা", tag: "৩০ml • কম্বোতে অন্তর্ভুক্ত" },
    { image: "/images/hawas-ice.avif", name: "Hawas Ice", desc: "ফ্রেশ, কুল ও রিফ্রেশিং অনুভূতি", tag: "৩০ml • কম্বোতে অন্তর্ভুক্ত" },
    { image: "", name: "Bleu de Chanel", desc: "এলিগ্যান্ট, স্মার্ট ও ক্লাসি ঘরানা", tag: "৩০ml • কম্বোতে অন্তর্ভুক্ত" },
    { image: "", name: "Aurevo Signature", desc: "আত্মবিশ্বাসী ও আধুনিক সুবাসের অনুভূতি", tag: "৩০ml • কম্বোতে অন্তর্ভুক্ত" },
  ],
  benefits: [
    { icon: "💎", title: "৫টি পারফিউম একসাথে", text: "৪টি ৩০ml পারফিউমের সাথে ১৫ml ফ্রি গিফট।" },
    { icon: "🎁", title: "স্পেশাল কম্বো অফার", text: "সবগুলো একসাথে পাচ্ছেন মাত্র {price} টাকায়।" },
    { icon: "🚚", title: "সারা বাংলাদেশে ডেলিভারি", text: "আপনার ঠিকানায় অর্ডার পৌঁছে দেওয়ার ব্যবস্থা।" },
  ],
  faq: [
    { q: "কম্বোতে কয়টি পারফিউম থাকছে?", a: "৪টি ৩০ml পারফিউমের সাথে ১৫ml Jahane Hawas Fire ফ্রি—মোট ৫টি পারফিউম।" },
    { q: "কম্বোর দাম কত?", a: "১১:১১ ক্যাম্পেইন অফার মূল্য {price} টাকা।" },
    { q: "কীভাবে অর্ডার করব?", a: "অর্ডার ফর্মে আপনার নাম, মোবাইল নম্বর ও সম্পূর্ণ ঠিকানা দিয়ে অর্ডার কনফার্ম করুন।" },
    { q: "ক্যাশ অন ডেলিভারি আছে?", a: "হ্যাঁ, ক্যাশ অন ডেলিভারি আছে। ঢাকার ভেতরে ডেলিভারি চার্জ {inside} টাকা, বাইরে {outside} টাকা।" },
  ],
};

// Admin page er section — [key, label, long?] ; "image" = chobi upload
export const COMBO_SECTIONS = [
  { id: "fx", title: "⏱ টাইমার, 🔊 ভয়েস ও রেটিং", fields: [
    ["countdown_show", "টাইমার দেখাবে? (on / off)"], ["countdown_title", "টাইমারের উপরের লেখা"],
    ["voice_show", "ভয়েস বাজবে? (on / off)"],
    ["voice", "এই পেজের ভয়েস (খালি রাখলে মেইন সাইটের ভয়েসটাই বাজবে)", "audio"],
    ["rating", "রেটিং (খালি রাখলে দেখাবে না)"], ["rating_note", "রেটিংয়ের পাশের লেখা"],
    ["gallery_badge", "পোস্টারের উপরের ব্যাজ"], ["wa_btn", "WhatsApp বাটনের লেখা (খালি = দেখাবে না)"],
  ] },
  { id: "top", title: "উপরের অংশ (হিরো)", fields: [
    ["topbar", "সবার উপরের লাল লাইন"], ["topbar_cod", "লাল লাইনের ডান পাশের লেখা"], ["eyebrow", "ছোট ব্যাজ"], ["hero_title", "বড় হেডিং — [ ] এর ভেতরের লেখা সোনালি", 1],
    ["hero_text", "হেডিংয়ের নিচের লেখা", 1], ["save_badge", "দামের পাশের সবুজ ব্যাজ"], ["hero_btn", "অর্ডার বাটন"], ["hero_btn2", "দ্বিতীয় বাটন"],
    ["nav_btn", "মেনুর অর্ডার বাটন"], ["trust", "নিচের ছোট লাইনগুলো (প্রতি লাইনে একটি)", 1], ["poster", "পোস্টার ছবি (ডানে বড় ছবি)", "image"],
  ] },
  { id: "col", title: "কম্বোর পণ্যগুলো", fields: [["col_kicker", "ছোট লেখা"], ["col_title", "হেডিং"], ["col_text", "লেখা", 1]],
    list: { key: "products", title: "পণ্য", fields: [["image", "ছবি", "image"], ["name", "নাম"], ["desc", "বর্ণনা"], ["tag", "ট্যাগ"]] } },
  { id: "gift", title: "ফ্রি গিফট", fields: [
    ["gift_show", "দেখাবে? (on / off)"], ["gift_badge", "লাল ব্যাজ"], ["gift_title", "হেডিং", 1], ["gift_text", "লেখা", 1],
    ["gift_btn", "বাটন"], ["gift_image", "গিফটের ছবি", "image"],
  ] },
  { id: "ben", title: "কেন নেবেন", fields: [["ben_kicker", "ছোট লেখা"], ["ben_title", "হেডিং"], ["ben_text", "লেখা", 1]],
    list: { key: "benefits", title: "কারণ", fields: [["icon", "ইমোজি"], ["title", "শিরোনাম"], ["text", "লেখা", 1]] } },
  { id: "offer", title: "অফার বক্স", fields: [
    ["offer_kicker", "ছোট লেখা"], ["offer_title", "হেডিং"], ["offer_items", "কম্বোতে যা আছে (প্রতি লাইনে একটি)", 1], ["offer_btn", "বাটন"],
  ] },
  { id: "order", title: "অর্ডার ফর্ম", fields: [
    ["order_kicker", "ছোট লেখা"], ["order_title", "হেডিং — [ ] এর ভেতরের লেখা সোনালি", 1], ["order_text", "লেখা", 1],
    ["form_title", "ফর্মের ভেতরের হেডিং"], ["submit_btn", "অর্ডার বাটন (পাশে মোট দাম বসবে)"],
    ["success_title", "অর্ডারের পর ধন্যবাদ হেডিং"], ["success_text", "অর্ডারের পর লেখা", 1],
  ] },
  { id: "faq", title: "প্রশ্ন-উত্তর (FAQ)", fields: [["faq_kicker", "ছোট লেখা"], ["faq_title", "হেডিং"]],
    list: { key: "faq", title: "প্রশ্ন", fields: [["q", "প্রশ্ন"], ["a", "উত্তর", 1]] } },
  { id: "other", title: "অন্যান্য (ফুটার, মোবাইল বার, SEO)", fields: [
    ["footer", "ফুটারের লেখা"], ["sticky_text", "মোবাইলে নিচের বারের লেখা"], ["sticky_btn", "মোবাইলে নিচের বাটন"],
    ["meta_title", "ব্রাউজার ট্যাবের টাইটেল"], ["meta_desc", "Google/Facebook শেয়ারের বর্ণনা", 1],
  ] },
];

export function getCombo(settings) {
  let saved = {};
  try { saved = JSON.parse(settings.combo1490 || "{}") || {}; } catch {}
  const lists = { ...COMBO_LISTS };
  for (const k of Object.keys(COMBO_LISTS)) if (Array.isArray(saved.lists?.[k])) lists[k] = saved.lists[k];
  return {
    text: { ...COMBO_TEXT, ...(saved.text || {}) },
    lists,
    productId: Number(saved.product_id) || 0,
    enabled: saved.enabled !== false,
  };
}

// {price} {old_price} {brand} {inside} {outside} boshay
export function comboFill(str, v) {
  return String(str ?? "").replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
}

export const comboVars = ({ price, oldPrice, brand, delivery }) => ({
  price: bn(price),
  old_price: bn(oldPrice || 0),
  brand,
  inside: bn(delivery[0]?.charge || 0),
  outside: bn(delivery[1]?.charge || 0),
});
