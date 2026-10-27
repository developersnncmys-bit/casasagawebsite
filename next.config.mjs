/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // `NEXT_DIST_DIR=.next-new npm run build` builds beside the live site, which keeps running
  // until the new build is moved into .next (see deploy.sh)
  distDir: process.env.NEXT_DIST_DIR || ".next",
};
export default nextConfig;
