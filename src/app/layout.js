import './globals.css'

export const metadata = {
  title: 'Aptech Carbon Footprint Tracker',
  description: 'A carbon footprint calculator deeply localized for Nepal.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=Playfair+Display:wght@400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500&family=Noto+Serif+Devanagari:wght@400&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
