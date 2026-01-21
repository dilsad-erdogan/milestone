/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/milestone",
  assetPrefix: "/milestone/",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
