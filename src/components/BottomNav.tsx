import { Home, Play, Compass, Users, User, Sparkles } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/feed", label: "Feed", Icon: Play },
  { to: "/discover", label: "Discover", Icon: Compass },
  { to: "/community", label: "Community", Icon: Users },
  { to: "/profile", label: "Profile", Icon: User },
  { to: "/ai", label: "Localit AI", Icon: Sparkles },
];

export default function BottomNav({ active }: { active?: string }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (to: string, label: string) => {
    if (to === '/ai') {
      // Pass current page as state when navigating to AI
      navigate(to, { state: { from: pathname } });
    } else {
      navigate(to);
    }
  };

  return (
    <nav aria-label="Primary" className="fixed bottom-3 inset-x-3 rounded-2xl bg-background/90 backdrop-blur border shadow-lg px-2 py-2">
      <ul className="grid grid-cols-6 gap-1">
        {items.map(({ to, label, Icon }) => {
          const isActive = pathname === to || active === label.toLowerCase() || (active === 'ai' && label === 'Localit AI');
          return (
            <li key={to} className="text-center">
              <button
                onClick={() => handleNavigation(to, label)}
                className={`flex flex-col items-center justify-center py-1 rounded-xl w-full ${isActive ? 'text-brand' : 'text-muted-foreground'} hover-scale`}
              >
                <Icon size={18} />
                <span className="text-[10px] mt-0.5">{label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
