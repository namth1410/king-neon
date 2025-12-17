import type { Metadata } from "next";
import "@/styles/globals.scss";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { ReduxProvider } from "@/store";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "King Neon - Custom LED Neon Signs",
  description:
    "Create stunning custom LED neon signs for your home, business, or special event. Designed by you, crafted by experts.",
  keywords: [
    "neon signs",
    "LED neon",
    "custom signs",
    "wedding signs",
    "business signs",
  ],
  openGraph: {
    title: "King Neon - Custom LED Neon Signs",
    description:
      "Create stunning custom LED neon signs. Designed by you, crafted by experts.",
    type: "website",
    siteName: "King Neon",
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
          <ToastProvider>
            <Header />
            <CartSidebar />
            <main className="min-h-screen pt-20 pb-10">{children}</main>
            <Footer />
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
