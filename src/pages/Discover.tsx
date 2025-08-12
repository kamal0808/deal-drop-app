import { useEffect, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import CategoryMenu from "@/components/CategoryMenu";
import RotatingSearch from "@/components/RotatingSearch";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";

// Sample brand/store logos
const storeLogos = [
  "https://upload.wikimedia.org/wikipedia/commons/3/36/Adidas_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/2f/Zara_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
  "https://upload.wikimedia.org/wikipedia/commons/7/7d/Sephora_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/f/fd/Nike_Swoosh_Logo_Black.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/24/Puma_AG.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/23/Lenovo_logo_2015.svg",
  "https://upload.wikimedia.org/wikipedia/commons/5/5f/Hewlett_Packard_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/4/48/Sony_logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/24/Dell_Logo.svg",
  "https://upload.wikimedia.org/wikipedia/commons/2/2e/LG_logo_%282015%29.svg",
  "https://upload.wikimedia.org/wikipedia/commons/5/5a/Under_armour_logo.svg",
];

const offers = ["30% OFF", "20% OFF", "BUY 1 GET 1", "SALE 40%", "HOT DEAL", "NEW"];

export default function Discover() {
  useSEO({
    title: "Discover Deals – LocalIt",
    description: "Search, browse categories, explore top offers and follow your favorite brands.",
    canonical: window.location.origin + "/discover",
  });

  // Infinite grid data
  const [gridItems, setGridItems] = useState<string[]>(storeLogos);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setGridItems((p) => [...p, ...storeLogos]);
      }
    }, { rootMargin: "200px" });
    if (loaderRef.current) ob.observe(loaderRef.current);
    return () => ob.disconnect();
  }, []);

  return (
    <main className="pb-24 max-w-md mx-auto">
      <section className="px-4 pt-4">
        <RotatingSearch />
      </section>

      <section className="mt-2 px-3">
        <CategoryMenu />
      </section>

      <section className="mt-3">
        <div className="h-11 bg-destructive text-destructive-foreground grid place-items-center text-xs font-semibold tracking-wider">
          TOP OFFERS TO GRAB
        </div>
        <div className="bg-muted h-[180px] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 px-3 py-3">
            {Array.from({ length: 20 }).map((_, i) => {
              const logo = storeLogos[i % storeLogos.length];
              const offer = offers[i % offers.length];
              return (
                <div key={i} className="relative h-[112px] w-[112px] rounded-xl overflow-hidden bg-card shadow-sm flex-shrink-0 grid place-items-center">
                  <img src={logo} alt="store logo" className="max-h-[64px] max-w-[80px] object-contain" loading="lazy" />
                  <div className="absolute bottom-0 inset-x-0 h-5 bg-destructive text-destructive-foreground grid place-items-center text-[10px] font-semibold">
                    {offer}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mt-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          {gridItems.map((logo, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden bg-card aspect-square grid place-items-center shadow">
              <img src={logo} alt="brand logo" className="max-h-[80px] max-w-[100px] object-contain" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 h-6 bg-foreground text-background text-[11px] grid place-items-center">
                <Button size="sm" variant="ghost" className="h-6 px-2 py-0 text-[11px] text-background">
                  Follow
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div ref={loaderRef} className="h-10" />
      </section>

      <BottomNav active="discover" />
    </main>
  );
}
