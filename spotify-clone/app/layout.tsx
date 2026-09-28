import type { Metadata } from "next";
import Figtree from "next/font/local";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import SupabaseProvider from "@/providers/SupabaseProvider";
import UserProvider from "@/providers/UserProvider";
import ModelProvider from '@/providers/ModelProvider'
import ToasterProvider from "@/providers/ToasterProvider";
import getSongsByUserId from "@/actions/getSongsByUserId";
import Player from "@/components/Player";

const font = Figtree({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Music Player",
  description: "Listen to music!",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userSongs = await getSongsByUserId();
  return (
    <html lang="en">
      <body className={`${font.variable} ${font.variable} antialiased`}>
        <ToasterProvider/>
        <SupabaseProvider>
          <UserProvider> 
          <ModelProvider/>
          <Sidebar songs={userSongs}>
          {children}
          </Sidebar>
          <Player />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
