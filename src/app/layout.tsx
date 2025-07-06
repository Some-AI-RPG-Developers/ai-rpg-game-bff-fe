import type { Metadata } from 'next';
import { Inter, Cinzel } from 'next/font/google';
import { GameContextProvider } from '@/client/context/GameContext';
import { ThemeProvider } from '@/client/context/ThemeContext';
import React from "react";
import '../styles/globals.css';
import '../client/styles/fantasy-animations.css';
import '../client/styles/dark-fantasy-theme.css';
import '../client/styles/performance-theme.css';

const inter = Inter({ subsets: ['latin'] });
const cinzel = Cinzel({ subsets: ['latin'], variable: '--font-cinzel' });

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
      <body className={`${inter.className} ${cinzel.variable}`}>
        <ThemeProvider>
          <GameContextProvider>
            {children}
          </GameContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}