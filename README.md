# Mintvale

A static, MMO-inspired portfolio. This project root is the source for your GitHub repository and Vercel deployment. The village, character customizer, guided paths, NPCs, and recruiter Atlas are included.

Personal content lives in `content/`. You do not need to edit the interface code to add projects or update your résumé. A dependency-free Node build collects the files and produces a plain HTML/CSS/JavaScript site in `dist/`. No database, API keys, server runtime, or account system is required.

## Preview locally

Install Node.js 20 or newer, then run:

```sh
npm run dev
```

Open **http://127.0.0.1:4173**. Edit files, save, and refresh the browser; the local server rebuilds on refresh. Stop with Ctrl+C. There are no packages to install.

Use the server rather than double-clicking the source `index.html`: generated content is only available in the built site.

## Add your content

See [CONTENT.md](CONTENT.md) for complete examples, supported Markdown, links, images, drafts, and ordering.

| Edit here | Appears here |
| --- | --- |
| `content/site.json` | Your name, world name, greeting, search description |
| `content/sections.json` | Encounter page titles and section metadata |
| `content/about/*.json` | About me / cottage |
| `content/portfolio/*.json` | Projects / workshop |
| `content/education/*.json` | Education / academy |
| `content/experience/*.json` | Experience / guild hall |
| `content/activities/*.json` | Beyond work / campfire |
| `content/contact/*.json` | Contact / post office |
| `content/resume/resume.md` | Résumé in the recruiter Atlas |
| `content/resume/config.json` | Résumé title, visibility, optional PDF |
| `public/` | Your downloadable files and project images |

Each JSON file is one entry. Duplicate a file, change its contents, and save it with a new filename. There is no hardcoded item limit or registration list. Delete a file or set `"draft": true` to remove it from the built website. Entries sort by `order`, then filename.

The six map locations stay stable. Adding entries expands the corresponding encounter and recruiter page, not the map or leveling requirements. Empty categories show a short empty state and remain finishable. Recruiter view shows every entry and detail without NPCs or extra clicks.

The portfolio includes personal entries and a downloadable résumé. Update the JSON entries and the résumé Markdown/PDF separately when your information changes. Pasting a résumé does not automatically parse it into education and experience entries.

## Build and verify

```sh
npm test
npm run build
```

Only `dist/` is deployed. The build reports invalid content with its filename. Markdown body files and unpublished JSON drafts are not copied into `dist/`; their published content is bundled in `content-data.js`. Images and files placed in `public/` are public even if their related entry is a draft.

Drafts are excluded from the website, **not from Git history**. Files you commit to a public GitHub repository are public, including draft content and the résumé source.

## Publish to GitHub, then Vercel

1. Create your GitHub repository using **this project root**. Commit the source files; `.gitignore` excludes generated `dist/`, local tools, and the old hosted checkout.
2. In Vercel, import that repository. Use the repository root as Root Directory.
3. The included `vercel.json` selects **Other**, runs **`npm run build`**, and publishes **`dist`**. No environment variables are needed.
4. Deploy. Future content commits rebuild with the rest of the site.

These settings follow [Vercel’s configuration documentation](https://vercel.com/docs/project-configuration/vercel-json). Hash routes such as `/#atlas/projects` and `/#atlas/resume` work without custom rewrite rules. For another static host, upload the contents of `dist/` after building.

No GitHub repository has been created or pushed, and no Vercel deployment has been performed by this setup.

## Source layout

- `index.html` — page shell, map art, dialogs, navigation.
- `styles.css` — existing visual design and responsive layouts.
- `app.js` — game flow and routing.
- `village.js` — shared map/road/travel coordinates.
- `content-renderer.js` — safe text/Markdown rendering and entry interactions.
- `scripts/` — content collection, static build, local preview.
- `tests/` — content and rendering regression checks.
- `assets/` — shared village and character artwork, with credits.

`mintvale-site/` is the preserved checkout for the earlier OpenAI Sites prototype. It is **not** the new deployment source and is excluded from Git and Vercel. The live mock-up has not been updated by this local packaging work. Work in the root files from now on.

The guest login is fictional. Progress lasts for the current page session and resets on refresh. Contact links open the destinations you provide; there is no message-sending backend.

## Artwork

Retain [asset credits](assets/CREDITS.md) and the attribution links in the site footer. Campfire and log artwork have CC BY 3.0 attribution requirements. The original NPC sprite sheet was generated for this mock-up.
# portfolio-charrmint
