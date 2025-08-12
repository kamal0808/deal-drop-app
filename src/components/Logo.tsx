import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";

const Logo = ({ size = 28 }: { size?: number }) => {
  return (
    <Link to="/" aria-label="LocalIt Home" className="inline-flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--brand))" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <path d="M32 6c-9 0-16 7.2-16 16.1C16 36 32 58 32 58s16-22 16-35.9C48 13.2 41 6 32 6zm0 22.5c-3.6 0-6.5-2.9-6.5-6.5s2.9-6.5 6.5-6.5 6.5 2.9 6.5 6.5-2.9 6.5-6.5 6.5z" fill="url(#g)"/>
      </svg>
      <span className="font-semibold text-xl tracking-tight">
        <span className="text-brand">Local</span>It
      </span>
    </Link>
  );
};

export default Logo;
