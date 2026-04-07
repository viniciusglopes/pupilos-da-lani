import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import FaviconUpdater from "@/components/FaviconUpdater"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Pupilos da Lani - Portal de Pupilos",
  description: "Conectando talentos com oportunidades. Pupilos profissionais em Minas Gerais.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Fix emergencial para fotos homepage */}
        <link rel="stylesheet" href="/fix-homepage.css" />
      </head>
      <body className={inter.className}>
        <FaviconUpdater />
        {children}
      </body>
    </html>
  )
}