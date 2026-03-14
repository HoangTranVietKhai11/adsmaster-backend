/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: "standalone",
    images: {
        domains: ["images.unsplash.com", "avatars.githubusercontent.com"],
        remotePatterns: [{ protocol: "https", hostname: "**.amazonaws.com" }],
    },
    async rewrites() {
        // NEXT_PUBLIC_API_URL is set in Vercel dashboard for production
        // Falls back to localhost:4005 for local development
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4005";
        return [
            {
                source: "/api/:path*",
                destination: `${apiUrl}/api/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;

