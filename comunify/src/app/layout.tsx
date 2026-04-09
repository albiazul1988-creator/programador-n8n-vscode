import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' })

export const metadata: Metadata = {
  title: 'Comunify — El panel inteligente para tu comunidad de vecinos',
  description: 'Gestiona incidencias, cuotas, reservas, votaciones y documentos desde un solo lugar. Diseñado para administradores de fincas y presidentes de comunidad en España.',
  keywords: 'gestión comunidad vecinos, administrador fincas, cuotas comunidad, incidencias vecinos, software comunidades',
  openGraph: {
    title: 'Comunify — Gestión moderna de comunidades de vecinos',
    description: 'Todo lo que necesita tu comunidad en un panel intuitivo.',
    locale: 'es_ES',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white font-sans">{children}</body>
    </html>
  )
}
