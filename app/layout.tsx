import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '早押しゲーム',
  description: 'シンプルな早押しクイズゲーム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
