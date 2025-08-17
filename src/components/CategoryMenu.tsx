import { useEffect, useState } from "react";
import { LucideIcon, Sparkles, Tag } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type Category = Tables<'categories'>;
type CategoryWithIcon = Category & {
  Icon: LucideIcon;
  color: "brand" | "primary" | "accent" | "secondary" | "muted" | "destructive";
};

// Color mapping for categories - cycles through available colors
const colorOptions: ("brand" | "primary" | "accent" | "secondary" | "muted" | "destructive")[] = [
  "brand", "primary", "accent", "secondary", "muted", "destructive"
];

const getColorForCategory = (index: number): "brand" | "primary" | "accent" | "secondary" | "muted" | "destructive" => {
  return colorOptions[index % colorOptions.length];
};

const getIconComponent = (iconName: string): LucideIcon => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || Tag;
};

interface CategoryMenuProps {
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export default function CategoryMenu({ selectedCategoryId = 'all', onCategorySelect }: CategoryMenuProps) {
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Fetch categories from Supabase
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      // Add "All" category at the beginning
      const allCategory: CategoryWithIcon = {
        id: 'all',
        name: 'All',
        icon: 'Sparkles',
        created_at: null,
        updated_at: null,
        Icon: Sparkles,
        color: 'brand'
      };

      // Transform categories with icons and colors
      const transformedCategories: CategoryWithIcon[] = [
        allCategory,
        ...(data || []).map((category, index) => ({
          ...category,
          Icon: getIconComponent(category.icon),
          color: getColorForCategory(index + 1) // +1 because "All" takes index 0
        }))
      ];

      setCategories(transformedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to "All" category if there's an error
      setCategories([{
        id: 'all',
        name: 'All',
        icon: 'Sparkles',
        created_at: null,
        updated_at: null,
        Icon: Sparkles,
        color: 'brand'
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <nav className="w-full overflow-x-auto no-scrollbar" aria-label="Categories">
        <ul className="flex gap-4 py-2">
          {[...Array(6)].map((_, index) => (
            <li key={index} className="flex-shrink-0">
              <div className="flex flex-col items-center justify-center w-16">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                <div className="mt-1 h-3 w-8 bg-muted rounded animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  return (
    <nav className="w-full overflow-x-auto no-scrollbar" aria-label="Categories">
      <ul className="flex gap-4 py-2">
        {categories.map(({ id, name, color, Icon }) => {
          const isSelected = selectedCategoryId === id;
          const map = {
            brand: "bg-brand text-brand-foreground",
            primary: "bg-primary text-primary-foreground",
            accent: "bg-accent text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground",
            muted: "bg-muted text-muted-foreground",
            destructive: "bg-destructive text-destructive-foreground",
          } as const;
          const colorClass = map[color];
          const selectedClass = isSelected ? colorClass : "bg-muted/50 text-muted-foreground";

          return (
            <li key={id} className="flex-shrink-0">
              <button
                className="flex flex-col items-center justify-center w-16 transition-all duration-200 hover:scale-105"
                onClick={() => onCategorySelect?.(id)}
                aria-pressed={isSelected}
              >
                <span className={`h-10 w-10 rounded-full grid place-items-center shadow transition-all duration-200 ${selectedClass} ${isSelected ? 'ring-2 ring-offset-2 ring-brand/50' : ''}`}>
                  <Icon size={18} />
                </span>
                <span className={`mt-1 text-xs text-center leading-tight transition-colors duration-200 ${name.length > 8 ? 'text-[10px]' : ''} ${isSelected ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {name}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
