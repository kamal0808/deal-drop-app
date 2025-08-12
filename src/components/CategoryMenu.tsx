import { LucideIcon, Laptop, Shirt, Dumbbell, Watch, Sparkles, ShoppingBasket, Home, Baby, Footprints, Palette } from "lucide-react";

const categories: { name: string; color: "brand" | "primary" | "accent" | "secondary" | "muted" | "destructive"; Icon: LucideIcon }[] = [
  { name: "All", color: "brand", Icon: Sparkles },
  { name: "Electronics", color: "primary", Icon: Laptop },
  { name: "Clothing", color: "accent", Icon: Shirt },
  { name: "Sports", color: "secondary", Icon: Dumbbell },
  { name: "Watches", color: "muted", Icon: Watch },
  { name: "Beauty", color: "destructive", Icon: Palette },
  { name: "Grocery", color: "primary", Icon: ShoppingBasket },
  { name: "Home", color: "accent", Icon: Home },
  { name: "Kids", color: "secondary", Icon: Baby },
  { name: "Footwear", color: "muted", Icon: Footprints },
];

export default function CategoryMenu() {
  return (
    <nav className="w-full overflow-x-auto no-scrollbar" aria-label="Categories">
      <ul className="flex gap-4 py-2">
        {categories.map(({ name, color, Icon }) => {
          const map = {
            brand: "bg-brand text-brand-foreground",
            primary: "bg-primary text-primary-foreground",
            accent: "bg-accent text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground",
            muted: "bg-muted text-muted-foreground",
            destructive: "bg-destructive text-destructive-foreground",
          } as const;
          const colorClass = map[color];
          return (
            <li key={name} className="flex-shrink-0">
              <button className="flex flex-col items-center justify-center w-16">
                <span className={`h-10 w-10 rounded-full grid place-items-center shadow ${colorClass}`}>
                  <Icon size={18} />
                </span>
                <span className="mt-1 text-xs text-muted-foreground">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
