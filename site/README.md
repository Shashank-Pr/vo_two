# VO2 Bikes website

Public storefront for VO2 Bikes: browse bicycles for sale and rent, read about inspection and servicing, and contact the team on WhatsApp.

The site is an **Astro** project that reads its bicycle catalogue from a separate **Sanity** Studio repository.

## Git repositories

| Repository | Local path | Remote | Purpose |
| --- | --- | --- | --- |
| Storefront | `.` (this repo) | https://github.com/vo2bikesofficial/vo_two.git | Public Astro website |
| Sanity CMS | `../../sanity_cms` | https://github.com/vo2bikesofficial/sanity_cms.git | Headless CMS / Sanity Studio |

The storefront also has an upstream fork: https://github.com/Shashank-Pr/vo_two.git

## Tools and technologies

### Storefront

| Technology | Version | Used for |
| --- | --- | --- |
| Astro | `^7.3.5` | Pages, layouts, components, routing, and static site generation |
| Vite | bundled with Astro | Dev server and production bundling |
| TypeScript | via Astro | Typed data helpers such as `src/data/bicycles.ts` and `src/data/contact.ts` |
| GROQ | `^6.18.0` | Query language used to fetch Sanity documents |
| `@sanity/astro` | `^3.5.1` | Connects the Astro app to the configured Sanity project/dataset |
| `@sanity/client` | via `@sanity/astro` | Executes Sanity queries from the site |
| `@sanity/image-url` | `^2.1.1` | Builds Sanity image URLs, including hotspot-aware crops |
| Plain scoped CSS | Astro `<style>` blocks | All styling: flex/grid layout, responsive breakpoints, neon theme, CSS masks for the shield badges |
| Vanilla JavaScript | Astro `<script>` blocks | Share-to-clipboard toast, whole-card links, inspection toggle, and mobile menu behavior |
| Static image assets | WebP / AVIF / JPEG / PNG / SVG | Hero banners, bicycle photos, logos, and generated badge masks |
| Node.js | `>=22.12.0` | Required runtime for Astro |

There is no Tailwind, Bootstrap, Next.js, WordPress, React hydration, or custom SQL database in the public site.

### Sanity CMS

See [`sanity_cms/README.md`](../../sanity_cms/README.md) for the full content model and importer documentation.

| Technology | Version | Used for |
| --- | --- | --- |
| Sanity Studio | `^5.14.1` | Content editing UI for bicycles, inspection areas, and inspection standards |
| React | `^19.3.1` | Custom Studio inputs and document actions only |
| TypeScript | `~6.0` | Schemas, actions, and custom input components |
| `styled-components` | `^6.1.18` | Styling custom Studio components |
| `@sanity/vision` | `^5.31.1` | Running GROQ queries inside the Studio |
| `@sanity/client` | `^8.9.0` | Seed, fetch, and GUID migration scripts |
| ESLint + Prettier | `^9.39.5` / `^3.5` | Linting and formatting the Studio code |

## How the pieces work together

1. Editors manage bicycles, images, availability, prices, and inspection scores in Sanity Studio.
2. The site queries Sanity with GROQ through `@sanity/astro`.
3. Astro generates the main pages and the product routes from those documents.
4. Product detail pages re-fetch current Sanity prices on render, so edits are not hidden by stale prerendered props.
5. Shared UI behavior — share toast, inspection score toggle, and card navigation — is handled with small vanilla scripts.

## Project structure

```text
site/
├── astro.config.mjs       # Astro + Sanity integration, site URL, base path
├── package.json           # Dependencies and npm scripts
├── tsconfig.json
└── src/
    ├── assets/            # Images and generated CSS mask assets
    ├── components/        # Reusable Astro components (e.g. ProductInventory.astro)
    ├── data/              # Sanity query helpers and contact links
    ├── layouts/           # Shared Layout.astro with nav and hero styles
    └── pages/             # index, buy, rent, services, inspection, about,
                           # sell, coaching, and products/[slug].astro
```

## Commands

Run from the site directory:

```sh
npm install     # Install dependencies
npm run dev     # Start the dev server at http://localhost:4321
npm run build   # Build the site into ./dist/
npm run preview # Preview the production build locally
npm run astro   # Run Astro CLI commands
```

## Deployment

- The Astro `site` is configured as `https://vo2bikes.com`.
- `npm run build` outputs a static site to `dist/`.
- Hosting/deployment configuration is not stored in this repo.
- Sanity Studio can be published separately with `npm run deploy` in the CMS repo.
