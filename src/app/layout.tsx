import type { Metadata } from "next";
import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ConvexClientProvider } from "@/context/convex-client";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/context/theme-provider";
import { shadcn } from "@clerk/themes";
import { Toaster } from "sonner";
import { berkeleyMono, ppe, sfPro } from "./_components/fonts";
import Navbar from "./_components/navbar";
import Footer from "./_components/footer";
import { siteConfig } from "@/lib/site";
import { metadata as baseMetadata, metadataKeywords } from "./metadata";

export const metadata: Metadata = {
  ...baseMetadata,
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: metadataKeywords,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{ theme: shadcn }}>
      <html lang="en">
        <body
          className={`${ppe.variable} ${sfPro.variable} _ui ${berkeleyMono.variable} font-sans overflow-x-hidden antialiased`}
        >
          <ConvexClientProvider>
            <ThemeProvider>
              <RootProvider>
                <Navbar />
                {children}
                <Footer />

                <Toaster
                  toastOptions={{
                    style: {
                      fontSize: "1rem",
                    },
                    className: "text-[1rem]",
                  }}
                  position="top-right"
                  richColors
                />
              </RootProvider>
            </ThemeProvider>
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
