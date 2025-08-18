import hero from "@/assets/localit-hero.jpg";
import Logo from "@/components/Logo";
import { useSEO } from "@/hooks/useSEO";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden>
    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.64,6.053,29.083,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.818C14.655,16.108,18.961,13,24,13c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.64,6.053,29.083,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.202l-6.195-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.5,5.02C9.5,39.556,16.227,44,24,44z"/>
    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.094,5.56 c0.001-0.001,0.002-0.001,0.003-0.002l6.195,5.238C36.971,39.723,44,35,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
  </svg>
);

const Landing = () => {
  const { user, loading, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: "LocalIt – Hyperlocal Deals & Retail Social",
    description: "Discover the best hyperlocal deals near you. Join LocalIt and follow favorite stores.",
    canonical: window.location.origin + "/",
  });

  // Redirect to home if user is already authenticated
  useEffect(() => {
    if (user && !loading) {
      navigate('/home', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <img src={hero} alt="Local retail collage background with product thumbnails and sale offers" className="absolute inset-0 w-full h-full object-cover" loading="eager" />
      <div className="absolute inset-0 bg-background/60" />

      <section className="relative z-10 w-full max-w-md mx-auto px-6 py-16 text-center animate-fade-in">
        <header className="mb-8 flex items-center justify-center">
          <Logo size={36} />
        </header>
        <h1 className="sr-only">LocalIt – Hyperlocal shopping and deals</h1>
        <p className="text-sm text-muted-foreground mb-8">Shop smarter with hyperlocal deals from stores around you.</p>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-brand-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-elevated)" }}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          By continuing you agree to our <a className="story-link" href="#">Terms</a> and <a className="story-link" href="#">Privacy Policy</a>.
        </p>
      </section>
    </main>
  );
};

export default Landing;
