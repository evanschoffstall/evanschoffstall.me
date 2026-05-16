const distDir =
  process.env.PLAYWRIGHT_NEXT_DIST_DIR ?? process.env.NEXT_DIST_DIR ?? ".next";
const tsconfigPath = process.env.NEXT_TYPESCRIPT_CONFIG_PATH ?? "tsconfig.json";

const nextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  distDir,
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  productionBrowserSourceMaps: distDir.startsWith(".next-playwright"),
  typescript: {
    tsconfigPath,
  },
};

export default nextConfig;
