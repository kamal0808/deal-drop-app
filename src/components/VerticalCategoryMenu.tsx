import { useEffect, useState } from "react";
import { LucideIcon, Sparkles, Tag, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

type Category = Tables<'categories'>;
type CategoryWithIcon = Category & {
  Icon: LucideIcon;
};

const getIconComponent = (iconName: string): LucideIcon => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || Tag;
};

interface VerticalCategoryMenuProps {
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
  onClose?: () => void;
  isOpen: boolean;
}

export default function VerticalCategoryMenu({ 
  selectedCategoryId = 'all', 
  onCategorySelect, 
  onClose,
  isOpen 
}: VerticalCategoryMenuProps) {
  const [categories, setCategories] = useState<CategoryWithIcon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoading(true);

      // Fetch only categories that have posts associated with them
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id,
          name,
          icon,
          created_at,
          updated_at,
          posts!inner(id)
        `)
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
        Icon: Sparkles
      };

      // Transform categories with icons
      const transformedCategories: CategoryWithIcon[] = [
        allCategory,
        ...(data || []).map((category) => ({
          id: category.id,
          name: category.name,
          icon: category.icon,
          created_at: category.created_at,
          updated_at: category.updated_at,
          Icon: getIconComponent(category.icon)
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
        Icon: Sparkles
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategorySelect?.(categoryId);
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className="fixed right-4 top-20 bottom-20 w-64 bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl z-[210] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-lg">Categories</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            // Loading state
            <div className="space-y-2">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl">
                  <div className="h-8 w-8 rounded-full bg-white/10 animate-pulse" />
                  <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            // Categories
            <div className="space-y-1">
              {categories.map(({ id, name, Icon }) => {
                const isSelected = selectedCategoryId === id;
                
                return (
                  <button
                    key={id}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 hover:bg-white/10 ${
                      isSelected 
                        ? 'bg-white/20 text-white ring-1 ring-white/30' 
                        : 'text-white/80 hover:text-white'
                    }`}
                    onClick={() => handleCategoryClick(id)}
                  >
                    <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-white" />
                    </div>
                    <span className="text-sm font-medium truncate">{name}</span>
                    {isSelected && (
                      <div className="ml-auto w-2 h-2 bg-white rounded-full flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
