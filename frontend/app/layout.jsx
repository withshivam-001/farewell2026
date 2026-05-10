import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata = {
  title: 'Farewell 2024–26 | Class of 2026',
  description: 'A cinematic farewell to the 2024–26 batch. Memories, videos, and moments that last forever.',
  openGraph: {
    title: 'Farewell 2024–26',
    description: 'Our story. Our batch. Our farewell.',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="noise antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#f0f0f8',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              fontFamily: 'var(--font-body)',
            },
            success: { iconTheme: { primary: '#7c3aed', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
