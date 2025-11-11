export const dynamic = "force-dynamic";

import { Toaster } from "sonner";
import { Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "@/app/globals.css";
import { AdminFrame } from "@/components/admin/admin-frame";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${poppins.variable} font-sans antialiased`}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <AdminFrame>{children}</AdminFrame>
      </ThemeProvider>
    </div>
  );
}
