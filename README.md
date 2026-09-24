# Adhithi Mudaliyar — Portfolio

A dark, interactive personal portfolio exploring healthcare, AI, data, software, and embedded engineering through a digital-anatomy visual system.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Edit content

Personal content, links, experience, skills, projects, and research live in `src/content.js`. Visual styles are in `src/styles.css`, while the 3D stage is isolated in `src/scene.js`.

## Deploy to Vercel

Import the GitHub repository. Vercel detects Vite automatically and uses `npm run build`, with `dist` as the output directory.

## 3D asset and fallback

The anatomical skeleton is stored locally in `public/models`. Attribution and the full license are documented in `THIRD_PARTY_NOTICES.md` and `public/licenses`. If WebGL is unavailable or reduced motion is preferred, the site uses `public/images/skeleton-fallback.png` while preserving all content and navigation.
