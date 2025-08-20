import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/useDebounce";

const placeholders = ["Green Shoes", "White T-shirt", "Michael Kors Watches"];

interface RotatingSearchProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  searchQuery?: string;
  enableAutoSearch?: boolean; // Enable automatic search on typing (debounced)
}

export default function RotatingSearch({
  onSearch,
  onClear,
  searchQuery = "",
  enableAutoSearch = false
}: RotatingSearchProps) {
  const [idx, setIdx] = useState(0);
  const [inputValue, setInputValue] = useState(searchQuery);
  const debouncedSearchTerm = useDebounce(inputValue, 1000); // 1000ms debounce for slower typers

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % placeholders.length), 2000);
    return () => clearInterval(t);
  }, []);

  // Sync input value with external searchQuery prop
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  // Auto search when debounced term changes (if enabled)
  useEffect(() => {
    if (enableAutoSearch && debouncedSearchTerm.trim() && debouncedSearchTerm !== searchQuery) {
      onSearch?.(debouncedSearchTerm.trim());
    }
  }, [debouncedSearchTerm, enableAutoSearch, onSearch, searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch?.(inputValue.trim());
    }
  };

  const handleClear = () => {
    // Clear input immediately for better UX
    setInputValue("");
    // Then notify parent component
    onClear?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
      <Input
        className="pl-10 pr-12 h-12 shadow-lg"
        placeholder={inputValue ? "" : placeholders[idx]}
        aria-label="Search products"
        value={inputValue}
        onChange={handleInputChange}
      />
      {inputValue && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
          onClick={handleClear}
        >
          <X size={14} />
        </Button>
      )}
    </form>
  );
}
