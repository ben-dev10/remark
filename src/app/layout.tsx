import type { Metadata } from "next";
import "./globals.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { ConvexClientProvider } from "@/context/convex-client";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/context/theme-provider";
import { shadcn } from "@clerk/themes";
import { Toaster } from "sonner";
import { berkeleyMono, ppe, sfPro } from "./_components/fonts";

export const metadata: Metadata = {
  title: "Remark",
  description: "Comments Section for blogs, articles and more.",
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
          className={`_ui ${ppe.variable} ${sfPro.variable} ${berkeleyMono.variable} font-sans antialiased`}
        >
          <ConvexClientProvider>
            <ThemeProvider>
              <RootProvider>
                {children}

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
