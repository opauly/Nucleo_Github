import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { AuthProvider } from "@/lib/auth/auth-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Núcleo - Iglesia Cristiana",
  description: "Bienvenido a Núcleo, una comunidad cristiana acogedora donde encontrarás amor, esperanza y propósito.",
  keywords: ["iglesia", "cristiana", "comunidad", "fe", "esperanza", "amor"],
  authors: [{ name: "Núcleo" }],
  openGraph: {
    title: "Núcleo - Iglesia Cristiana",
    description: "Bienvenido a Núcleo, una comunidad cristiana acogedora donde encontrarás amor, esperanza y propósito.",
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "Núcleo - Iglesia Cristiana",
    description: "Bienvenido a Núcleo, una comunidad cristiana acogedora donde encontrarás amor, esperanza y propósito.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable}`}>
      <body className="antialiased bg-background text-foreground">
        <AuthProvider>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
