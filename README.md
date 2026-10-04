# Adnan Rafiq

Personal website and developer publication, built with Docusaurus and deployed on the existing Vercel project at https://adnanrafiq.com.

Use Node 24 or newer, matching `.nvmrc` and `package.json`.

```sh
npm ci
npm run start
```

Check the production site locally:

```sh
npm run typecheck
npm run build
npm run serve -- --host 127.0.0.1 --port 3000
```

The repository has no separate test suite. The build checks internal links and generates the article routes, sitemap, RSS, Atom, and JSON feeds. Verify navigation, article/code controls, writing search, and light/dark modes in a browser at desktop and mobile widths before publishing.

Articles live in `blog/`; their front matter controls the existing titles, dates, tags, and URLs. The `editorial` plugin shares Docusaurus' resolved metadata with the homepage and client-side writing search. Search covers published titles, descriptions, and tags. Existing drafts stay unpublished. Blog list pagination, tag pages, archives, article outlines, and previous/next links remain native Docusaurus features.

Presentation is in `src/css/custom.css`, the homepage CSS module, and the small theme overrides in `src/theme/`. The mobile menu places main navigation before the native article index. The homepage uses existing profile and journey photographs from `static/img/`.
