import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const filterTags = ["Trending", "Offers", "Clothing", "Electronics", "Sunglasses", "Shoes", "Watches", "Bags"];

const activityData = [
  {
    id: 1,
    productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    brandName: "Nike Store",
    activity: "59 people liked this Blue Running Shoes",
    offer: "20% off"
  },
  {
    id: 2,
    productImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    brandName: "TechWorld",
    activity: "23 people commented on Wireless Headphones",
    offer: "Buy 1 Get 1"
  },
  {
    id: 3,
    productImage: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    brandName: "Fashion Hub",
    activity: "87 people shared this Black Sunglasses",
    offer: "30% off"
  },
  {
    id: 4,
    productImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop",
    brandName: "Sneaker Zone",
    activity: "15 people saved this White Sneakers",
    offer: "15% off"
  }
];

export default function Community() {
  useSEO({ 
    title: "Community – LocalIt", 
    description: "Join the LocalIt community and discover trending products from local retailers.", 
    canonical: window.location.origin + "/community" 
  });

  const [activeFilter, setActiveFilter] = useState("Trending");

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header with logo */}
      <div className="bg-gray-800 h-20 flex items-center justify-center relative">
        <div className="text-2xl font-bold">
          <span className="text-white">loca</span>
          <span className="text-brand">lit.</span>
        </div>
        
        {/* Community pill - positioned half in/half out */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-black text-white px-6 py-2 rounded-full text-sm font-medium">
          Community
        </div>
      </div>

      {/* Filter pills */}
      <div className="px-4 mt-8 mb-6">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === tag
                  ? "bg-brand text-brand-foreground"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Activity cards */}
      <div className="px-4 space-y-4">
        {activityData.map((item) => (
          <div key={item.id} className="bg-white rounded-lg border shadow-sm p-4 h-[140px] flex gap-4">
            {/* Product image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                src={item.productImage} 
                alt="Product" 
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              {/* Top section with brand name and follow button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{item.brandName}</span>
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-white" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs px-3 py-1 h-auto">
                  Follow
                </Button>
              </div>

              {/* Activity text */}
              <div className="flex-1 flex items-center">
                <p className="text-sm text-gray-600 leading-relaxed">{item.activity}</p>
              </div>
            </div>

            {/* Offer pill */}
            <div className="absolute top-4 right-4">
              <div className="bg-brand text-brand-foreground px-2 py-1 rounded-full text-xs font-medium">
                {item.offer}
              </div>
            </div>
          </div>
        ))}
      </div>

      <BottomNav active="community" />
    </main>
  );
}