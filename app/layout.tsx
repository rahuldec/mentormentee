import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-surface">
          <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://okiedokie-erp-images.s3.ap-south-1.amazonaws.com/RKSDCK/2023/07/logo/59b4898e508e48f834fb-304964661_410091617923325_636038283123227638_n.jpeg"
                alt="R K S D College"
                className="h-9 w-9 rounded-full border border-border object-cover"
              />
              <div className="leading-tight">
                <div className="text-sm font-semibold text-foreground">R K S D College</div>
                <div className="text-xs text-muted">Mentor Mentee Program</div>
              </div>
            </Link>
          </div>
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
      </body>
    </html>
  );
}
