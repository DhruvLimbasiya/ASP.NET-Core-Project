import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { LeaveProvider } from "../context/LeaveContext";
import AppLayout from "../components/AppLayout";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["sans-serif", "latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata = {
  title: "LMS Portal - Leave Management System",
  description: "Manage and approve employee leave requests efficiently",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <LeaveProvider>
          <AppLayout>
            {children}
          </AppLayout>
        </LeaveProvider>
      </body>
    </html>
  );
}
