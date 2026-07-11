/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }], // school logos/student photos come from arbitrary URLs
  },
};
module.exports = nextConfig;