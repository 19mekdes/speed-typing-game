/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '⚡ Speed Typing Game | Test Your Typing Speed',
  description: 'Challenge yourself with this interactive speed typing test. Track your WPM, accuracy, and improve your typing skills!',
  keywords: 'typing game, speed test, WPM, typing practice, keyboard skills',
  authors: [{ name: 'Speed Typing Game' }],
  viewport: 'width=device-width, initial-scale=1.0',
  openGraph: {
    title: 'Speed Typing Game',
    description: 'Test your typing speed and accuracy',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}