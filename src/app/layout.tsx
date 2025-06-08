import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GameContextProvider } from '@/client/context/GameContext';
import React from "react";
// If you have a global CSS file, import it here.
// import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI RPG Game',
  description: 'An interactive text-based adventure game powered by AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GameContextProvider>
          {children}
        </GameContextProvider>
      </body>
    </html>
  );
}