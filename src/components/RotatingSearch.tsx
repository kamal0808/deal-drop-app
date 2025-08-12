import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const placeholders = ["Green Shoes", "White T-shirt", "Michael Kors Watches"];

export default function RotatingSearch() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % placeholders.length), 2000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
      <Input className="pl-9" placeholder={placeholders[idx]} aria-label="Search products" />
    </div>
  );
}
