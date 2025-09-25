import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { DataProvider } from "@/lib/data-context"
import "./globals.css"
import { Suspense } from "react"

export const metadata: Metadata = {
  title: "ROAS Dashboard - SKU-Level Analytics",
  description: "Track Return on Ad Spend at the SKU level with inventory insights",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={<div>Loading...</div>}>
          <DataProvider>{children}</DataProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
