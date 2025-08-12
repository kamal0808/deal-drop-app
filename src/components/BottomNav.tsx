import { Home, Compass, Users, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/discover", label: "Discover", Icon: Compass },
  { to: "/community", label: "Community", Icon: Users },
  { to: "/profile", label: "Profile", Icon: User },
];

export default function BottomNav({ active }: { active?: string }) {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Primary" className="fixed bottom-3 inset-x-3 rounded-2xl bg-background/90 backdrop-blur border shadow-lg px-2 py-2">
      <ul className="grid grid-cols-4 gap-1">
        {items.map(({ to, label, Icon }) => {
          const isActive = pathname === to || active === label.toLowerCase();
          return (
            <li key={to} className="text-center">
              <Link to={to} className={`flex flex-col items-center justify-center py-1 rounded-xl ${isActive ? 'text-brand' : 'text-muted-foreground'} hover-scale`}>
                <Icon size={20} />
                <span className="text-[11px] mt-0.5">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
