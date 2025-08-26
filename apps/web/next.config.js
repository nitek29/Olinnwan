/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Handle i18next resources
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
};

export default nextConfig;
