// app/layout.js
import './globals.css';
import ThemeToggle from "./components/ThemeToggle";

export const metadata = {
  title: "70th Birthday Surprise",
  description: "A polished multi‑stage interactive birthday greeting app.",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        {/* SEO meta tags */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta property="og:title" content="70th Birthday Surprise" />
        <meta property="og:description" content="A polished interactive birthday greeting experience" />
        <meta property="og:image" content="/original_images/PREM1434.JPG" />
        <meta property="og:url" content="http://localhost:3000" />
      </head>
      <body className="bg-gray-900 text-white font-sans min-h-screen flex flex-col">
        <ThemeToggle />
        {children}
      </body>
    </html>
  );
}
