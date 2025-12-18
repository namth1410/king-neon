import type { Metadata } from "next";
import "@/styles/globals.scss";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import CartProvider from "@/components/CartProvider";
import { ReduxProvider } from "@/store";
import { ToastProvider } from "@/components/Toast";
import { AuthProvider } from "@/hooks/useAuth";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://king-neon.com"
  ),
  title: {
    default: "King Neon - Custom LED Neon Signs",
    template: "%s | King Neon",
  },
  description:
    "Create stunning custom LED neon signs for your home, business, or special event. Designed by you, crafted by experts.",
  keywords: [
    "neon signs",
    "LED neon",
    "custom signs",
    "wedding signs",
    "business signs",
    "neon light",
    "custom neon",
  ],
  authors: [{ name: "King Neon Team" }],
  creator: "King Neon",
  publisher: "King Neon",
  openGraph: {
    title: "King Neon - Custom LED Neon Signs",
    description:
      "Create stunning custom LED neon signs. Designed by you, crafted by experts.",
    url: "/",
    siteName: "King Neon",
    locale: "en_US",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthProvider>
            <CartProvider>
              <ToastProvider>
                <Header />
                <CartSidebar />
                <main className="min-h-screen pt-20 pb-10">{children}</main>
                <Footer />
              </ToastProvider>
            </CartProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
