import { CTA } from "@/components/home/CTA";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { TechStack } from "@/components/home/TechStack";
import { SiteShell } from "@/components/layout/SiteShell";

export default function Home() {
  return (
    <SiteShell>
      <Hero />
      <Features />
      <TechStack />
      <CTA />
    </SiteShell>
  );
}
