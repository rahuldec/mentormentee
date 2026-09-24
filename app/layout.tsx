import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { logout } from "@/lib/actions";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mentor Mentee",
  description: "Mentor-mentee roster lookup",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
            <Link href="/" className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-okiedokie.png"
                alt="Okie Dokie"
                className="h-16 w-16 shrink-0 object-contain sm:h-20 sm:w-20"
              />
              <div className="leading-tight">
                <div className="text-xl font-semibold text-foreground sm:text-2xl">
                  Okie Dokie
                </div>
                <div className="text-xs text-muted sm:text-sm">Campus Automation Partner</div>
                <div className="mt-0.5 text-sm font-medium text-accent sm:text-base">
                  Mentor Mentee Program
                </div>
              </div>
            </Link>
            {session && (
              <div className="flex shrink-0 items-center gap-3">
                <span className="hidden text-sm text-muted sm:inline">
                  {session.isAdmin ? "Admin" : session.mentorName}
                </span>
                <form action={logout}>
                  <button
                    type="submit"
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground hover:bg-background"
                  >
                    Log out
                  </button>
                </form>
              </div>
            )}
          </div>
          <div className="h-1 bg-accent" />
        </header>
        <main className="flex flex-1 flex-col">{children}</main>
        <footer className="border-t border-border bg-surface px-6 py-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-1">
            <p className="text-sm text-muted">
              &copy; {new Date().getFullYear()} Okie Dokie. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
