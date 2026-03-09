import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "AdsMaster AI — Learn, Build, Analyze & Scale Facebook Ads",
    description:
        "The AI-powered Marketing SaaS Platform for Facebook Ads. Learn from expert courses, build campaigns with AI assistance, and scale with data-driven insights.",
    keywords: "Facebook Ads, AI Marketing, Campaign Builder, Ad Analytics, Social Media Marketing",
    openGraph: {
        title: "AdsMaster AI",
        description: "Learn, Build, Analyze and Scale Facebook Ads with AI.",
        type: "website",
    },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body className={inter.className}>
                <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
                    {children}
                    <Toaster />
                </ThemeProvider>
            </body>
        </html>
    );
}
