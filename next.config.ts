import type { NextConfig } from 'next';

const apiUrl = process.env.CUSTOMER_API_URL ?? 'http://localhost:8002';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The browser calls the API same-origin under /customer, so the backend's
  // httpOnly session cookies (scoped to /customer) just work. In production
  // nginx does this routing; in development Next forwards it.
  async rewrites() {
    return [{ source: '/customer/:path*', destination: `${apiUrl}/:path*` }];
  },
};

export default nextConfig;
