import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { Providers } from "@/components/Providers";
import { getModules } from "@/app/actions/settings";
import { getGlobalSettings } from "@/app/actions/global-settings";
import { getNavigationItems } from "@/app/actions/admin-navigation";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getGlobalSettings()
  return {
    title: `${settings.STORE_NAME} - Loja Oficial`,
    description: settings.STORE_DESC,
    icons: {
      icon: settings.STORE_FAVICON_URL,
    }
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const modules = await getModules();
  const settings = await getGlobalSettings();
  const navItems = await getNavigationItems();

  return (
    <html lang="pt-PT" className="dark">
      <body className="min-h-screen bg-[#08080c] text-gray-100 flex flex-col justify-between antialiased">
        <Providers initialModules={modules} initialSettings={settings}>
          <NavBar initialNavItems={navItems} />
          <main className="flex-1 max-w-7xl 2xl:max-w-[90vw] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <CartSidebar />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
