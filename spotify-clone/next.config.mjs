/** @type {import('next').NextConfig} */
const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig = demo
    ? {
        // Demo mode: static export for GitHub Pages (see libs/demo.ts).
        output: "export",
        trailingSlash: true,
        basePath,
        images: { unoptimized: true },
    }
    : {
        images: {
            remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
        },
    };

export default nextConfig;
