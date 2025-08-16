import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import { ChevronRight } from "lucide-react";

const followedRetailers = [
  "https://logo.clearbit.com/nike.com",
  "https://logo.clearbit.com/adidas.com", 
  "https://logo.clearbit.com/puma.com",
  "https://logo.clearbit.com/apple.com",
  "https://logo.clearbit.com/samsung.com",
  "https://logo.clearbit.com/levis.com"
];

const generalLinks = [
  "Terms & Conditions",
  "Privacy Policy", 
  "Send a feedback",
  "Logout"
];

export default function Profile() {
  useSEO({ 
    title: "Profile – LocalIt", 
    description: "Manage your LocalIt profile and preferences.", 
    canonical: window.location.origin + "/profile" 
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLinkClick = (link: string) => {
    if (link === "Logout") {
      setShowLogoutConfirm(true);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-20">
      {/* Header container */}
      <div className="bg-gray-800 h-[186px] flex flex-col items-center justify-center relative">
        {/* Logo */}
        <div className="text-2xl font-bold mb-4">
          <span className="text-white">loca</span>
          <span className="text-brand">lit.</span>
        </div>
        
        {/* Tagline */}
        <p className="text-white text-sm text-center">
          your social network for{" "}
          <span className="text-brand">local commerce</span>
        </p>

        {/* Profile picture - positioned half in/half out */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-[140px] h-[140px] rounded-full border-4 border-white overflow-hidden bg-gray-200">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* User info */}
      <div className="text-center mt-20 px-4">
        <h1 className="text-lg font-semibold text-foreground mb-1">Hey, RITIK SAHU</h1>
        <p className="text-muted-foreground text-sm">ritikprajjwalsahu@gmail.com</p>
      </div>

      {/* Followed retailers section */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-semibold mb-4">Followed Retailers</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
          {followedRetailers.map((logo, index) => (
            <div key={index} className="w-[90px] h-[90px] rounded-full border overflow-hidden flex-shrink-0 bg-gray-100">
              <img 
                src={logo}
                alt="Retailer logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=Store&background=e5e7eb&color=6b7280&size=90`;
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* General section */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-semibold mb-4 text-muted-foreground">GENERAL</h2>
        <div className="space-y-1">
          {generalLinks.map((link) => (
            <button
              key={link}
              onClick={() => handleLinkClick(link)}
              className="w-full flex items-center justify-between py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <span className={`text-sm ${link === "Logout" ? "text-destructive" : "text-foreground"} underline`}>
                {link}
              </span>
              <ChevronRight size={16} className="text-muted-foreground" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout confirmation drawer */}
      {showLogoutConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 z-50 animate-slide-up">
            <h3 className="text-lg font-bold text-center mb-6">Logout?</h3>
            <div className="space-y-3">
              <button 
                onClick={() => {
                  // Handle logout logic here
                  setShowLogoutConfirm(false);
                }}
                className="w-full py-3 text-destructive font-medium text-center border-b border-gray-100"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="w-full py-3 text-foreground font-medium text-center"
              >
                No
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNav active="profile" />
    </main>
  );
}