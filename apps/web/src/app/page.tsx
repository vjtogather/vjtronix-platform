import { CTA } from "@/components/home/CTA";
import { Features } from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import { TechStack } from "@/components/home/TechStack";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <TechStack />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
