import { Footer } from "@/modules/home/ui/footer";
import Navbar from "@/modules/home/ui/navbar";
import SearchFilters from "@/modules/home/ui/search-filters";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilters />
      <div className="flex-1 bg-[#F4F4F0]">{children}</div>
      <Footer />
    </div>
  );
}
