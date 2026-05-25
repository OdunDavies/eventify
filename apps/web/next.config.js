/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@eventtix/ui",
    "@eventtix/db",
    "@eventtix/config",
    "@eventtix/email",
    "@eventtix/payment",
  ],
};

module.exports = nextConfig;
