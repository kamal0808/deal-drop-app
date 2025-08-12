import { useEffect, useRef, useState } from "react";
import { MapPin, Heart, MessageCircle, Share2, BadgeCheck } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";
import img1 from "@/assets/feed1.jpg";
import img2 from "@/assets/feed2.jpg";
import img3 from "@/assets/feed3.jpg";
import img4 from "@/assets/feed4.jpg";
import img5 from "@/assets/feed5.jpg";
import img6 from "@/assets/feed6.jpg";
import BottomNav from "@/components/BottomNav";
import CategoryMenu from "@/components/CategoryMenu";
import RotatingSearch from "@/components/RotatingSearch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";




type Post = {
  id: string;
  image: string;
  offer: string;
  store: string;
  description: string;
  logoUrl: string;
  sellerSlug: string;
};

const initialPosts: Post[] = [
  { id: "1", image: img1, offer: "SALE 40%", store: "Trendy Threads", description: "Pastel fits for summer. Breathable and comfy cotton linens with seasonal palette. Limited time offers across sizes.", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/4/44/H%26M-Logo.svg", sellerSlug: "trendy-threads" },
  { id: "2", image: img2, offer: "BUY 1 GET 1", store: "ElectroHub", description: "Headphones, earbuds and smart accessories. Grab the BOGO while stocks last. Noise-cancelling selections included.", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", sellerSlug: "electrohub" },
  { id: "3", image: img3, offer: "SALE 30%", store: "Sportify", description: "High-energy activewear and kicks for every game day. Seasonal markdowns on jerseys and performance shoes.", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/36/Adidas_Logo.svg", sellerSlug: "sportify" },
  { id: "4", image: img4, offer: "10% OFF", store: "Time & Co.", description: "Lux watch curation with timeless designs. Subtle reductions on select collections — upgrade your wrist game.", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Rolex_Logo.svg", sellerSlug: "time-co" },
  { id: "5", image: img5, offer: "NEW ARRIVALS", store: "Pastel House", description: "Fresh silhouettes in calming tones. Discover soft textures and layer-friendly picks for the week.", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Zara_Logo.svg", sellerSlug: "pastel-house" },
  { id: "6", image: img6, offer: "FESTIVE OFFER", store: "GlowLab", description: "Skincare and cosmetics bundled for festive glow. Handpicked lip shades and serum combos.", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Sephora_Logo.svg", sellerSlug: "glowlab" },
];



const FeedPost = ({ post }: { post: Post }) => {
  const [liked, setLiked] = useState(false);
  const [following, setFollowing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [shake, setShake] = useState<{ like?: boolean; comment?: boolean; share?: boolean }>({});

  const trig = (key: keyof typeof shake) => {
    setShake((s) => ({ ...s, [key]: true }));
    setTimeout(() => setShake((s) => ({ ...s, [key]: false })), 380);
  };

  const onShare = async () => {
    const shareData = { title: "LocalIt", text: `${post.store}: ${post.offer}`, url: window.location.href };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
        toast.success("Link copied to clipboard");
      }
    } catch {}
  };

  return (
    <article className="relative rounded-xl overflow-hidden shadow-md bg-card animate-fade-in">
      <div className="relative" style={{ height: 440 }}>
        <img src={post.image} alt={`${post.store} deal visual`} className={`w-full h-full object-cover ${expanded ? 'blur-[2px]' : ''}`} loading="lazy" />
        {/* Ribbon */}
        <div className="absolute left-3 top-3">
          <div className="bg-destructive text-destructive-foreground px-3 py-1 rounded-sm shadow"
               style={{ transform: 'rotate(-6deg)' }}>
            <span className="text-xs font-semibold leading-tight whitespace-pre-line">{post.offer}</span>
          </div>
        </div>
        {/* Action stack */}
          <div className="absolute right-2 bottom-28 flex flex-col items-center gap-3">
          <button onClick={() => { setLiked(v => !v); trig('like'); }} className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.like ? 'animate-shake' : ''}`} aria-label="Like">
            <Heart size={20} className={`transition-colors ${liked ? 'text-destructive fill-destructive' : ''}`} />
          </button>
          <button onClick={() => { setOpenComments(true); trig('comment'); }} className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.comment ? 'animate-shake' : ''}`} aria-label="Comments">
            <MessageCircle size={20} />
          </button>
          <button onClick={() => { onShare(); trig('share'); }} className={`h-10 w-10 rounded-full grid place-items-center bg-background/80 backdrop-blur hover-scale ${shake.share ? 'animate-shake' : ''}`} aria-label="Share">
            <Share2 size={20} />
          </button>
        </div>
        {/* Bottom glass panel */}
        <div className={`absolute inset-x-0 bottom-0 p-3 transition-all ${expanded ? 'h-1/2' : 'h-1/4'} glass`}> 
          <div className="flex items-center justify-between">
            <Link to={`/seller/${post.sellerSlug}`} className="text-sm font-medium text-primary-foreground flex items-center gap-1"><BadgeCheck className="text-primary-foreground" size={14} /> {post.store}</Link>
            <Button size="sm" variant={following ? 'secondary' : 'default'} onClick={() => setFollowing(f => !f)}>
              {following ? 'Following' : 'Follow'}
            </Button>
          </div>
          <div className="mt-3 flex gap-3 items-start">
            <Link to={`/seller/${post.sellerSlug}`} className="shrink-0 h-9 w-9 rounded-full bg-brand text-brand-foreground grid place-items-center overflow-hidden">
              <img src={post.logoUrl} alt={`${post.store} logo`} className="h-9 w-9 object-contain p-1" />
            </Link>
            <button className="text-left text-sm text-primary-foreground" onClick={() => setExpanded(e => !e)} aria-expanded={expanded}>
              <span className={`${expanded ? '' : 'line-clamp-3'}`}>{post.description}</span>
              <span className="ml-1 opacity-80">{expanded ? ' Show less' : ' …more'}</span>
            </button>
          </div>
        </div>
      </div>

      <Sheet open={openComments} onOpenChange={setOpenComments}>
        <SheetContent side="bottom" className="h-[60vh]">
          <SheetHeader>
            <SheetTitle>Comments</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {["Looks great!", "Is size M available?", "What are the store timings today?"] .map((c,i)=> (
              <div key={i} className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-xs">U{i+1}</div>
                <p className="text-sm">{c}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Input placeholder="Add a comment" />
            <Button>Post</Button>
          </div>
        </SheetContent>
      </Sheet>
    </article>
  );
};

const Home = () => {
  useSEO({
    title: "LocalIt Home – Best deals at Sarath City Mall",
    description: "Scroll hyperlocal deals, follow stores, like, comment and share offers around Sarath City Mall.",
    canonical: window.location.origin + "/home",
  });

  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ob = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPosts((p) => [...p, ...initialPosts.map(x => ({ ...x, id: Math.random().toString().slice(2) }))]);
      }
    }, { rootMargin: '200px' });
    if (loaderRef.current) ob.observe(loaderRef.current);
    return () => ob.disconnect();
  }, []);

  return (
    <main className="pb-24 max-w-md mx-auto">
      <header className="px-4 pt-4">
        <p className="text-xs text-muted-foreground">Here are the best deals at</p>
        <h1 className="text-base font-semibold flex items-center gap-1"><MapPin size={16} className="text-brand" /> Sarath City Mall</h1>
      </header>

      <section className="px-4 mt-3">
        <RotatingSearch />
      </section>

      <section className="mt-2 px-3">
        <CategoryMenu />
      </section>

      <section className="mt-2 px-5 space-y-4">
        {posts.map((p) => (
          <FeedPost key={p.id} post={p} />
        ))}
        <div ref={loaderRef} className="h-12" />
      </section>

      <BottomNav active="home" />
    </main>
  );
};

export default Home;
