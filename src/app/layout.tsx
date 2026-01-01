import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "SEOAlex | Visual SEO Agent",
    description: "Generate SEO content, landing pages, and email templates with one click.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body>
                <main>{children}</main>
            </body>
        </html>
    );
}
