/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

    output: 'standalone',
    env: {
    WOOCOMMERCE_URL: process.env.WOOCOMMERCE_URL,
    WOOCOMMERCE_CONSUMER_KEY: process.env.WOOCOMMERCE_CONSUMER_KEY,
    WOOCOMMERCE_CONSUMER_SECRET: process.env.WOOCOMMERCE_CONSUMER_SECRET,
  },
};

export default nextConfig;
