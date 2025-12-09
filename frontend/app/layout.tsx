import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Providers from "../components/providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mentor Trader",
  description: "Sistema de trading",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="debug-css-loaded">
      <body className={`${inter.className} debug-css-loaded`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
