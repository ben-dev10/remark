import localFont from "next/font/local";

// sans
export const sfPro = localFont({
  src: [
    {
      path: "../../../public/fonts/SFNS.ttf",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
  display: "swap",
});

// sans-serif
export const ppe = localFont({
  src: [
    {
      path: "../../../public/fonts/ppe-editorial.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-ppe-editorial",
  display: "swap",
});

// mono
export const berkeleyMono = localFont({
  src: [
    {
      path: "../../../public/fonts/berkeley-mono.woff2",
      weight: "100 900",
      style: "normal",
    },
  ],
  variable: "--font-berkeley-mono",
  display: "swap",
});
