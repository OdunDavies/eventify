/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@eventtix/db",
    "@eventtix/ui",
    "@eventtix/email",
    "@eventtix/payment",
    "@eventtix/config",
  ],
};

module.exports = nextConfig;
