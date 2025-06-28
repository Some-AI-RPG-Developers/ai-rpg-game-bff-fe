import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { GameContextProvider } from '@/client/context/GameContext';
import { ThemeProvider } from '@/client/context/ThemeContext';
import React from "react";
import '../styles/globals.css';

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
        <ThemeProvider>
          <GameContextProvider>
            {children}
          </GameContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}