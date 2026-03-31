import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Pupilos da Lani - Portal de Pupilos',
  description: 'Conectando talentos com oportunidades. Portal profissional para pupilos em Minas Gerais.',
  keywords: 'pupilos, portfólio, minas gerais, casting, fotografia, publicidade',
  authors: [{ name: 'Pupilos da Lani' }],
  creator: 'Pupilos da Lani',
  publisher: 'Pupilos da Lani',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Pupilos da Lani - Portal de Pupilos',
    description: 'Conectando talentos com oportunidades. Portal profissional para pupilos em Minas Gerais.',
    siteName: 'Pupilos da Lani',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pupilos da Lani - Portal de Pupilos',
    description: 'Conectando talentos com oportunidades. Portal profissional para pupilos em Minas Gerais.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}