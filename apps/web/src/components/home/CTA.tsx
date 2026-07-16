import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CTA() {
  return (
    <section className="bg-slate-950 py-20 sm:py-24">
      <Container>
        <div className="grid gap-8 rounded-lg border border-white/10 bg-white/[0.04] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Start with the platform foundation.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
              The next production features should add content routes, data
              models, authentication, and admin workflows in controlled
              increments.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Button href="/blog" variant="secondary">
              Read Blog
            </Button>
            <Button href="/portfolio">View Portfolio</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
