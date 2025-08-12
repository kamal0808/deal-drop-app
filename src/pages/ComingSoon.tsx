import { useSEO } from "@/hooks/useSEO";
import BottomNav from "@/components/BottomNav";

export default function ComingSoon({ title, path }: { title: string; path: string }) {
  useSEO({ title: `${title} – LocalIt`, description: `${title} page coming soon on LocalIt.`, canonical: window.location.origin + path });
  return (
    <main className="min-h-screen flex items-center justify-center">
      <section className="text-center px-6">
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        <p className="text-muted-foreground">Coming soon</p>
      </section>
      <BottomNav />
    </main>
  );
}
