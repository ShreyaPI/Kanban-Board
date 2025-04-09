// app/layout.js
import "./globals.css"; // Import global styles (Tailwind or custom)
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Kanban Board",
  description: "Simple Kanban board with Google login",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-100 text-gray-900 min-h-screen`}
      >
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          {children}
        </div>
      </body>
    </html>
  );
}
