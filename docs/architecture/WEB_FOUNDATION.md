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
- `components/layout`: `Navbar`, `Footer`, `SiteShell`
- `components/home`: `Hero`, `Features`, `TechStack`, `CTA`
- `components/sections`: reusable non-route-specific page sections
- `data`: static typed content contracts used before CMS persistence exists

## Route Shells

The first route shells exist for `blog`, `projects`, `courses`, `shop`, `portfolio`, and `videos`.

These pages intentionally use a shared `PlatformPageTemplate` and typed data from `src/data/platform-pages.ts`. This avoids duplicated page markup while the product model is still being shaped. The static data is not the final CMS architecture; it is a temporary content contract that can later be backed by Prisma models, MDX, or an admin CMS without rewriting every route.

## Trade-offs

- A shared route template is less visually distinct than bespoke pages, but it keeps the first navigation layer maintainable and consistent.
- Static typed data is faster and safer than introducing a database too early, but it should not be stretched into a fake CMS.
- The next major content feature should define real domain models before adding admin CRUD screens.

## Next Architecture Steps

- Add a resources route when its product scope is clear.
- Introduce CMS data contracts before adding persistence.
- Add authentication only when dashboard workflows require it.
- Move shared UI into `packages/ui` after at least two apps need it.
