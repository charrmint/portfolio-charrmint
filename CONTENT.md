# Editing your portfolio

Run `npm run dev`, edit the files below, and refresh the browser. When deployed through Vercel, commit your edits to GitHub to trigger a new build.

## Paste your résumé

Paste plain text or Markdown into **`content/resume/resume.md`**. For example:

```md
# Your Name
Mechanical engineer · Software developer

## Experience
**Role — Company**
2024–2026

- Describe a responsibility you owned.
- Describe a real outcome.

## Education
Your degree, institution, and dates.

## Skills
CAD, Python, JavaScript, prototyping.

[LinkedIn](https://www.linkedin.com/in/your-profile)
```

A **Résumé** tab appears automatically in the recruiter Atlas, available immediately via `/#atlas/resume`. Keep the file blank to omit it. To hide it without deleting your source, set `enabled` to `false` in `content/resume/config.json`.

For a PDF, place it inside `content/resume/` (for example `my-resume.pdf`), and update the configuration:

```json
{
  "title": "Résumé",
  "enabled": true,
  "pdf": "my-resume.pdf"
}
```

The build copies that file to `dist/resume/resume.pdf` and adds a download link. A PDF alone also enables the résumé tab. The PDF is linked, not parsed; paste readable text into `resume.md` if you want an inline résumé as well.

## Add a project, role, qualification, or activity

Create one `.json` file per entry in the appropriate folder. No manifest to update, no JavaScript to edit, and no hardcoded item limit. Files are discovered directly inside each category folder; subfolders are not scanned.

This works for every category:

```json
{
  "order": 2,
  "title": "My project",
  "subtitle": "Personal project · Software",
  "period": "2026",
  "summary": "One or two sentences explaining what it is and why it matters.",
  "body": "A longer explanation. Use **bold** for emphasis.",
  "tags": ["JavaScript", "Design"],
  "image": {
    "src": "images/my-project.png",
    "alt": "Describe the project screenshot"
  },
  "sections": [
    { "title": "The problem", "body": "What you were trying to solve." },
    { "title": "My contribution", "body": "What you personally did." },
    { "title": "The outcome", "body": "What happened, with evidence where available." }
  ],
  "links": [
    { "label": "Source code", "url": "https://github.com/your-name/your-project" },
    { "label": "Live demo", "url": "https://your-demo.example" }
  ]
}
```

Save that as `content/portfolio/my-project.json`. Put its image at `public/images/my-project.png`. **The sample image and URLs above are examples, not included assets.** Omit `image` and `links` until your files and destinations are ready.

Only `title` is required. Omit fields you do not need. For a role, use the role as `title`, company as `subtitle`, dates as `period`, and achievements as `sections`. For education, use the qualification, institution, dates, and relevant coursework. Add as many files and detail sections as you need.

Each entry has its own detail buttons in the game view. Clicking a detail affects only that entry. Recruiter Atlas displays all detail sections expanded. Entries appear in document order and grow vertically; there is no slider or hidden limit.

## Longer writing without JSON escapes

Keep metadata in JSON and put the long body in a Markdown file alongside it:

```json
{
  "title": "A longer project write-up",
  "bodyFile": "my-project.md"
}
```

`bodyFile` is relative to that entry’s folder. It replaces `body` when both are present. Markdown files alone are not entries; they need a JSON file referencing them. You can also use `bodyFile` for your About Me or experience narrative.

Supported Markdown: paragraphs, `#` headings, `-` bullet lists, numbered lists, `**bold**`, inline code, and `[label](https://example.com)` links. Headings start at level 2 inside the page so its main heading stays consistent. Tables, embedded HTML, nested lists, inline images, italics, and fenced code blocks are not supported by this small renderer. Use the `image` field for images. Raw HTML is displayed as text.

## Remove, hide, or reorder

- **Remove:** delete the JSON file.
- **Hide temporarily:** add `"draft": true` to that JSON object.
- **Reorder:** set `order` to a number; smaller values appear first. Entries without it use 100. Ties sort by filename.
- **Replace a sample:** edit its fields and remove `"placeholder": true`.
- **Empty a category:** remove/hide every entry. Its map stop remains with “Nothing to share here just yet.” This keeps the existing journey playable.

A draft is omitted from the deployed content, but remains visible in a public source repository if committed. Files in `public/` are always deployed. Only put material intended for visitors there.

## Contact links

Edit `content/contact/contact.json`:

```json
{
  "title": "Let’s talk.",
  "summary": "I’m interested in engineering and software opportunities.",
  "links": [
    { "label": "Email me", "url": "mailto:you@example.com" },
    { "label": "GitHub", "url": "https://github.com/your-name" },
    { "label": "LinkedIn", "url": "https://www.linkedin.com/in/your-name" }
  ]
}
```

Use real destinations. This creates links, not a contact form.

## Editing notes

- JSON needs double quotes and no trailing commas. The build names files with invalid JSON or unsupported field types.
- Enter line breaks in JSON strings as `\n`, or use `bodyFile` for easier long-form writing.
- Image and local link paths are relative to the **website root**, without `public/`: `public/images/demo.png` becomes `images/demo.png`.
- External links support `https:`, `http:`, `mailto:`, and `tel:`. Script URLs are rejected.
- Entry filenames form internal IDs. Use simple unique filenames such as `robot-arm.json` and `summer-internship.json`.
- `content/site.json` changes your identity/greeting; `content/sections.json` changes page titles and NPC introductory text.
- Adding new *categories or map buildings* still requires code/layout changes. Adding content within the existing categories does not.
