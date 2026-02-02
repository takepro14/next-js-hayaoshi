import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'YOKOMOJI',
  description: 'シンプルな早押しクイズゲーム'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;900&family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Noto+Serif+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="header">
          <div className="header-content">
            <svg
              className="logo"
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="8"
                y="8"
                width="24"
                height="24"
                rx="4"
                stroke="#2563eb"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M16 20L18 22L24 16"
                stroke="#2563eb"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="header-title">YOKOMOJI</h1>
          </div>
        </header>
        <main className="main-content">{children}</main>
      </body>
    </html>
  );
}
