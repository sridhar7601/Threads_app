import '../globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ClerkProvider } from "@clerk/nextjs"; // Adjust the import path as needed
import Topbar from '@/components/shared/Topbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import RightSideBar from '@/components/shared/RightSidebar';
import Bottombar from '@/components/shared/Bottombar';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Threads',
  description: 'A Next.Js Threads app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Topbar />
          <main  className='flex flex-row'>
            <LeftSidebar />

            <section className='main-container'>
              <div className="w-full max-w-4xl">
                {children}
                <Analytics />

              </div>
            </section>

            <RightSideBar />
          </main>
          <Bottombar />
        </body>
      </html>
    </ClerkProvider>
  )
}
