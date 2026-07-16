import { Container } from "@/components/ui/Container";

const stackGroups = [
  {
    title: "Frontend",
    items: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4"],
  },
  {
    title: "Backend",
    items: ["NestJS", "Prisma ORM", "PostgreSQL", "Auth.js"],
  },
  {
    title: "Operations",
    items: ["Docker", "Nginx", "GitHub Actions", "Analytics"],
  },
];

export function TechStack() {
  return (
    <section className="border-y border-white/10 bg-[#080c12] py-20 sm:py-24">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase text-sky-300">
              Architecture
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Built on a pragmatic, scalable stack.
            </h2>
            <p className="mt-4 text-base leading-7 text-slate-400">
              The frontend starts as a high-performance server-rendered
              application, with backend services and data layers added feature
              by feature.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {stackGroups.map((group) => (
              <div
                className="rounded-lg border border-white/10 bg-slate-950/80 p-6"
                key={group.title}
              >
                <h3 className="text-base font-semibold text-white">
                  {group.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {group.items.map((item) => (
                    <li
                      className="flex items-center gap-3 text-sm text-slate-400"
                      key={item}
                    >
                      <span className="size-1.5 rounded-full bg-sky-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
