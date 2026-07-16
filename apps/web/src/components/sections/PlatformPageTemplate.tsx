import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { PlatformPage, PlatformPageAction } from "@/data/platform-pages";

interface PlatformPageTemplateProps {
  page: PlatformPage;
}

function getExternalLinkProps(action: PlatformPageAction) {
  if (!action.isExternal) {
    return {};
  }

  return {
    rel: "noopener noreferrer",
    target: "_blank",
  };
}

export function PlatformPageTemplate({ page }: PlatformPageTemplateProps) {
  const primaryLinkProps = getExternalLinkProps(page.primaryAction);
  const secondaryLinkProps = getExternalLinkProps(page.secondaryAction);

  return (
    <section className="min-h-[calc(100vh-4rem)] bg-slate-950 py-20 sm:py-24">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase text-sky-300">
              {page.eyebrow}
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">
              {page.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              {page.description}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={page.primaryAction.href} {...primaryLinkProps}>
                {page.primaryAction.label}
              </Button>
              <Button
                href={page.secondaryAction.href}
                variant="secondary"
                {...secondaryLinkProps}
              >
                {page.secondaryAction.label}
              </Button>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-base font-semibold text-white">
                Planned Scope
              </h2>
              <ul className="mt-5 space-y-4">
                {page.highlights.map((item) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-slate-400"
                    key={item}
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
              <h2 className="text-base font-semibold text-white">
                Next Build Steps
              </h2>
              <ol className="mt-5 space-y-4">
                {page.roadmap.map((item, index) => (
                  <li
                    className="flex gap-3 text-sm leading-6 text-slate-400"
                    key={item}
                  >
                    <span className="grid size-6 shrink-0 place-items-center rounded-md bg-sky-300/10 text-xs font-semibold text-sky-200">
                      {index + 1}
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </div>
      </Container>
    </section>
  );
}
