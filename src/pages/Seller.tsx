import { useMemo, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { useParams } from "react-router-dom";
import { useSEO } from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { BadgeCheck, MapPin, Phone, MessageCircle, Navigation, Heart, MessageSquare, Share2 } from "lucide-react";
import img1 from "@/assets/feed1.jpg";
import img2 from "@/assets/feed2.jpg";
import img3 from "@/assets/feed3.jpg";
import img4 from "@/assets/feed4.jpg";
import img5 from "@/assets/feed5.jpg";
import img6 from "@/assets/feed6.jpg";

const gallery = [img1, img2, img3, img4, img5, img6, img1, img2, img3, img4, img5, img6];

export default function Seller() {
  const { sellername } = useParams();
  const prettyName = useMemo(() => (sellername || "store").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), [sellername]);

  useSEO({
    title: `${prettyName} – LocalIt Outlet`,
    description: `Discover deals, posts and contact details for ${prettyName}.`,
    canonical: window.location.origin + `/seller/${sellername}`,
  });

  const [viewerOpen, setViewerOpen] = useState(false);
  const [startIndex, setStartIndex] = useState(0);

  const openViewer = (idx: number) => { setStartIndex(idx); setViewerOpen(true); };

  const cover = img4;
  const logo = "https://upload.wikimedia.org/wikipedia/commons/3/36/Adidas_Logo.svg";
  const address = "Level 2, Sarath City Capital, Hyderabad";
  const phone = "+91 90000 00000";

  return (
    <main className="pb-24 max-w-md mx-auto">
      <section className="relative h-[180px] w-full overflow-hidden">
        <img src={cover} alt={`${prettyName} cover`} className="w-full h-full object-cover" />
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 h-36 w-36 rounded-full bg-background shadow-xl grid place-items-center overflow-hidden border">
          <img src={logo} alt={`${prettyName} logo`} className="p-3 object-contain" />
        </div>
      </section>

      <section className="mt-20 px-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {prettyName}
              <BadgeCheck className="text-primary" size={18} />
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin size={14} className="text-brand" /> {address}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm">Follow</Button>
              <a href={`tel:${phone}`} className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground" aria-label="Call"><Phone size={18} /></a>
              <a href={`sms:${phone}`} className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground" aria-label="Text"><MessageCircle size={18} /></a>
              <a href={`https://wa.me/919000000000`} target="_blank" className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground" aria-label="WhatsApp" rel="noreferrer"><MessageSquare size={18} /></a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" className="h-9 w-9 rounded-full grid place-items-center bg-secondary text-secondary-foreground" aria-label="Maps" rel="noreferrer"><Navigation size={18} /></a>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-full bg-secondary text-secondary-foreground py-2">
            <div className="text-base font-semibold">25</div>
            <div className="text-[11px] opacity-80 -mt-0.5">posts</div>
          </div>
          <div className="rounded-full bg-secondary text-secondary-foreground py-2">
            <div className="text-base font-semibold">12.5k</div>
            <div className="text-[11px] opacity-80 -mt-0.5">followers</div>
          </div>
          <div className="rounded-full bg-secondary text-secondary-foreground py-2">
            <div className="text-base font-semibold">60k</div>
            <div className="text-[11px] opacity-80 -mt-0.5">impressions</div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 auto-rows-[80px] gap-2">
          {gallery.map((g, idx) => {
            const span = [5,6,8,9].includes(idx) ? "col-span-2 row-span-2" : "";
            return (
              <button key={idx} onClick={() => openViewer(idx)} className={`relative overflow-hidden rounded-md bg-card ${span}`}>
                <img src={g} alt={`post ${idx+1}`} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              </button>
            );
          })}
        </div>
      </section>

      {viewerOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 overflow-y-auto snap-y snap-mandatory">
          {gallery.map((g, i) => (
            <section key={i} className="h-screen w-full relative snap-start">
              <img src={g} alt="full view" className="absolute inset-0 w-full h-full object-contain" />
              <div className="absolute right-3 bottom-28 flex flex-col items-center gap-3">
                <button className="h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale" aria-label="Like">
                  <Heart size={20} />
                </button>
                <button className="h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale" aria-label="Comments">
                  <MessageCircle size={20} />
                </button>
                <button className="h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale" aria-label="Share">
                  <Share2 size={20} />
                </button>
              </div>
              <div className="absolute left-0 right-0 bottom-0 p-4 glass text-primary-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full overflow-hidden bg-background grid place-items-center">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/Adidas_Logo.svg" alt="store logo" className="p-1 object-contain" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{prettyName}</div>
                    <div className="text-xs opacity-80">Great discounts on latest arrivals. Limited period offer.</div>
                  </div>
                </div>
              </div>
              <button onClick={() => setViewerOpen(false)} className="absolute top-4 right-4 bg-background text-foreground rounded-full h-9 px-3 text-sm">Close</button>
            </section>
          )).slice(startIndex).concat(gallery.slice(0, startIndex).map((g, i) => (
            <section key={`wrap-${i}`} className="h-screen w-full relative snap-start">
              <img src={g} alt="full view" className="absolute inset-0 w-full h-full object-contain" />
            </section>
          )))}
        </div>
      )}

      <BottomNav />
    </main>
  );
}
