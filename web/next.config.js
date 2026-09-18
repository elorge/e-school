/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '**' }], // school logos/student photos come from arbitrary URLs
  },
  webpack: (config) => {
    // elorge-capacitor-local-server is a local `file:` dependency that
    // lives outside web/ (in the sibling ../native folder), so
    // node_modules/elorge-capacitor-local-server is a symlink. With
    // Node's default symlink behaviour, webpack resolves modules that
    // package imports (like @capacitor/core) starting from the symlink's
    // REAL physical location, walking up from ../native — which never
    // reaches web/node_modules, so it can't find @capacitor/core even
    // though it's installed right here. Turning symlink-following off
    // makes webpack resolve as if the package were physically inside
    // web/node_modules, which is what every other tool already assumes.
    config.resolve.symlinks = false;
    return config;
  },
};
module.exports = nextConfig;