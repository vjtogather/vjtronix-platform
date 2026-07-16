# Web Foundation

The `apps/web` application is the public-facing VJtronix frontend. The first foundation feature replaces the default Next.js starter screen with a server-rendered landing page and reusable UI primitives.

## Decisions

- Use the Next.js App Router with Server Components by default.
- Keep the first landing page static and dependency-free for fast builds, strong SEO, and low operational complexity.
- Centralize brand metadata in `src/constants/site.ts` and navigation in `src/constants/navigation.ts`.
- Build small reusable primitives in `src/components/ui` before adding feature-specific screens.
- Keep styling in Tailwind CSS v4 utility classes and global design tokens in `src/app/globals.css`.

## Current Modules

- `components/ui`: `Button`, `Container`, `Logo`
- `components/layout`: `Navbar`, `Footer`
- `components/home`: `Hero`, `Features`, `TechStack`, `CTA`

## Next Architecture Steps

- Add real route groups for blog, projects, courses, shop, portfolio, resources, and videos.
- Introduce CMS data contracts before adding persistence.
- Add authentication only when dashboard workflows require it.
- Move shared UI into `packages/ui` after at least two apps need it.
