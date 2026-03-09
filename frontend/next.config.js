/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    images: {
        domains: ["images.unsplash.com", "avatars.githubusercontent.com"],
        remotePatterns: [{ protocol: "https", hostname: "**.amazonaws.com" }],
    },
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;
