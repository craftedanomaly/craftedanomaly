import ScrollProgress from "@/components/ui/scroll-progress";
import { Header } from "./header";
// import { ScrollProgress } from "@/components/ui/scroll-progress";
import { SiteFloatingInfo } from "@/components/layout/site-floating-info";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <ScrollProgress>
      <div className="min-h-screen flex flex-col">
        {/* <ScrollProgress /> */}
        <Header />
        <main className="flex-1">{children}</main>
        <SiteFloatingInfo />
      </div>
    </ScrollProgress>
  );
}
