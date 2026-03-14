import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL("http://localhost:3000"),
    title: "AdsMaster AI — Học tập, Xây dựng, Phân tích & Quy mô Quảng cáo Facebook",
    description:
        "Nền tang SaaS Marketing hỗ trợ bởi AI cho Quảng cáo Facebook. Học từ các khóa học chuyên gia, xây dựng chiến dịch với trợ lý AI và mở rộng quy mô với dữ liệu thực tế.",
    keywords: "Facebook Ads, AI Marketing, Campaign Builder, Ad Analytics, Social Media Marketing, Quảng cáo Facebook, AI Marketing Tiếng Việt",
    openGraph: {
        title: "AdsMaster AI",
        description: "Học tập, Xây dựng, Phân tích và Quy mô Quảng cáo Facebook với AI.",
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
