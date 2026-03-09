import { MegaMenu } from "@/components/marketing/MegaMenu";
import { Footer } from "@/components/marketing/Footer";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <MegaMenu />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
