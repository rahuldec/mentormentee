import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentor Mentee",
  description: "Mentor-mentee roster lookup",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://okiedokie-erp-images.s3.ap-south-1.amazonaws.com/RKSDCK/2023/07/logo/59b4898e508e48f834fb-304964661_410091617923325_636038283123227638_n.jpeg"
                alt="R K S D College"
                className="h-16 w-16 shrink-0 rounded-full border border-border object-cover sm:h-20 sm:w-20"
              />
              <div className="leading-tight">
                <div className="text-xl font-semibold text-foreground sm:text-2xl">
                  R K S D College
                </div>
                <div className="text-sm text-muted sm:text-base">
                  Mentor Mentee Program
                </div>
              </div>
            </Link>
          </div>
          <div className="h-1 bg-accent" />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
