/** @type {import('next').NextConfig} */
const nextConfig = {
  // Campaign landing page (public/combo1490.html) ke /combo1490 e dekhay
  async rewrites() {
    return [{ source: "/combo1490", destination: "/combo1490.html" }];
  },
};
export default nextConfig;
