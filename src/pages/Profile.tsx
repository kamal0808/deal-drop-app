import { useState } from "react";
import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";
import { ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useFollowedBusinesses } from "@/hooks/useFollowedBusinesses";

import { Link } from "react-router-dom";

// Removed static followedRetailers array - now using real data from database

const generalLinks = [
  { name: "Terms & Conditions", path: "/terms" },
  { name: "Privacy Policy", path: "/privacy" },
  { name: "Send a feedback", path: null },
  { name: "Logout", path: null }
];

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { followedBusinesses, loading: followedLoading, count: followedCount } = useFollowedBusinesses();

  useSEO({
    title: "Profile – LocalIt",
    description: "Manage your LocalIt profile and preferences.",
    canonical: window.location.origin + "/profile"
  });

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLinkClick = (linkName: string) => {
    if (linkName === "Logout") {
      setShowLogoutConfirm(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
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
            src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=e5e7eb&color=6b7280&size=140`}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || user?.email || 'User')}&background=e5e7eb&color=6b7280&size=140`;
            }}
          />
        </div>
      </div>

      {/* User info */}
      <div className="text-center mt-20 px-4">
        <h1 className="text-lg font-semibold text-foreground mb-1">
          Hey, {user?.user_metadata?.full_name?.toUpperCase() || user?.email?.split('@')[0]?.toUpperCase() || 'USER'}
        </h1>
        <p className="text-muted-foreground text-sm">{user?.email}</p>
      </div>

      {/* Followed retailers section */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-semibold mb-4">
          Followed Retailers {followedCount > 0 && `(${followedCount})`}
        </h2>

        {followedLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-brand" />
          </div>
        ) : followedBusinesses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">You haven't followed any businesses yet.</p>
            <p className="text-xs mt-1">Start following businesses to see them here!</p>
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {followedBusinesses.map((business) => (
              <Link
                key={business.id}
                to={`/seller/${business.id}`}
                className="w-[90px] h-[90px] rounded-full border overflow-hidden flex-shrink-0 bg-gray-100 hover:scale-105 transition-transform duration-200"
              >
                <img
                  src={business.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=e5e7eb&color=6b7280&size=90`}
                  alt={`${business.name} logo`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(business.name)}&background=e5e7eb&color=6b7280&size=90`;
                  }}
                />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* General section */}
      <div className="px-4 mt-8">
        <h2 className="text-base font-semibold mb-4 text-muted-foreground">GENERAL</h2>
        <div className="space-y-1">
          {generalLinks.map((link) => {
            if (link.path) {
              // Render as Link for pages with paths
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="w-full flex items-center justify-between py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm text-foreground underline">
                    {link.name}
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Link>
              );
            } else {
              // Render as button for actions
              return (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.name)}
                  className="w-full flex items-center justify-between py-3 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-sm ${link.name === "Logout" ? "text-destructive" : "text-foreground"} underline`}>
                    {link.name}
                  </span>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </button>
              );
            }
          })}
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
                  handleLogout();
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