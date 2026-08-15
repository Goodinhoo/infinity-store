import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import CartSidebar from "@/components/CartSidebar";
import { Providers } from "@/components/Providers";
import MainWrapper from "@/components/MainWrapper";
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

  const primary = settings.THEME_PRIMARY_COLOR || '#bc13fe'
  const secondary = settings.THEME_SECONDARY_COLOR || '#00f0ff'
  const accent = settings.THEME_ACCENT_COLOR || '#ff007f'
  const background = settings.THEME_BACKGROUND_COLOR || '#08080c'

  const themeStyles = `
    :root {
      --color-primary: ${primary};
      --neon-purple: ${primary};
      --neon-blue: ${secondary};
      --neon-pink: ${accent};
      --background: ${background};
    }
    body {
      background-color: ${background} !important;
    }
  `

  return (
    <html lang="pt-PT" className="dark" data-theme={settings.ACTIVE_THEME || 'INFINITY_NEON'}>
      <body className="min-h-screen text-gray-100 flex flex-col justify-between antialiased" style={{ backgroundColor: background }}>
        <style id="theme-variables-live" dangerouslySetInnerHTML={{ __html: themeStyles }} />
        {settings.CUSTOM_CSS && (
          <style id="custom-css-live" dangerouslySetInnerHTML={{ __html: settings.CUSTOM_CSS }} />
        )}
        <Providers initialModules={modules} initialSettings={settings}>
          <NavBar initialNavItems={navItems} />
          <MainWrapper>
            {children}
          </MainWrapper>
          <CartSidebar />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
