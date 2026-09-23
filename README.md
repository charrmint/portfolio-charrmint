# Mintvale — charrmint’s world

**Welcome to my home instance.**

Mintvale is the personal portfolio of **Rutherford Calawagan**, a software engineer focused on backend services and databases, and a longtime MMORPG player known online as **charrmint**.

Inspired by the familiarity of an MMO hometown, the site turns a portfolio into a small illustrated village. Each location introduces a different part of my background: education, experience, projects, interests, and ways to connect.

## Explore the village

- **Create a traveler.** Choose an Explorer, Engineer, or Developer, customize a cloak, and follow a suggested route for that class.
- **Take your own path.** Story locations can be visited in any order. Unvisited places remain gray, while a gold marker and dashed road highlight the recommended next stop.
- **Collect stories.** Completing a first visit earns one level and a story skill, with a class-specific level-up message.
- **Finish at the campfire.** Completing all five stories brings the village characters together and unlocks the post office and the in-game World Atlas shortcut.
- **Start again.** A new adventure resets progress and opens character customization without a page reload.

For a direct look at the work, **View portfolio** opens the World Atlas immediately. It presents all sections and the résumé without the game progression or NPCs.

## Featured projects

- **[Rep-Pilot](https://github.com/charrmint/Rep-Pilot)** — workout tracking and deterministic progression recommendations. [Live app](https://rep-pilot.vercel.app/).
- **[FoodRadar](https://github.com/charrmint/FoodRadar)** — a food inventory prototype with camera-assisted scanning, built at BCS Hackathons and expanded afterward.
- **[JobTrackerApp](https://github.com/charrmint/JobTrackerApp)** — a Java desktop application for organizing a job search.

## How it’s built

The interface uses **HTML, CSS, and vanilla JavaScript**, with SVG scenery and shared coordinates for map landmarks, roads, and character travel. Hash-based routing connects the landing page, village, encounters, and World Atlas.

A dependency-free Node.js build validates and combines modular JSON and Markdown content into a static site. Adding portfolio entries expands the relevant pages without adding map locations or changing the progression system.

| Source | Purpose |
| --- | --- |
| `index.html` | Page shell, village artwork, navigation, and dialogs |
| `app.js` | Class routes, progression, rewards, and navigation |
| `village.js` | Responsive map layout and road-following travel |
| `content-renderer.js` | Content rendering and entry interactions |
| `styles.css` | Visual design and responsive layouts |
| `content/` | Profile, projects, experience, education, interests, and résumé |
| `assets/` and `public/` | Village artwork, portrait, and static assets |
| `scripts/` | Content validation, static build, and development server |
| `tests/` | Content, rendering, and journey regression tests |

The guest entry screen requires no account. Progress lives in memory for the current page session. The site has no database or message-sending backend.

## Run locally

Requires **Node.js 20 or newer**. No dependency installation is needed.

```sh
npm run dev
```

The development server runs at **http://127.0.0.1:4173** and rebuilds on page refresh.

```sh
npm test
npm run build
```

The production build is written to `dist/`. The included Vercel configuration uses `npm run build` and serves that directory. The output can also be served by another static host.

Content formats and editing examples are documented in [CONTENT.md](CONTENT.md).

## Artwork and credits

The village uses original illustrated scenery and generated NPC sprites. Campfire artwork by **Lorc** and log artwork by **Delapouite** are used under **CC BY 3.0**. See [asset credits](assets/CREDITS.md) for sources and modifications.

## Connect

[GitHub](https://github.com/charrmint) · [LinkedIn](https://www.linkedin.com/in/rutherbc/) · [Email](mailto:rbcalawagan.ca@gmail.com)
