# Varun Nagendran personal website

## What this is
A single-page personal site that scrolls, showing experience, projects, education, leadership and interests. It's hosted on GitHub Pages and will get a custom domain later (not bought yet).

## Approved design (index.html is the source of truth)
`index.html` is the design Varun approved, exported from a mockup. Keep the look exactly as it is unless he asks for a change:
- Dark theme: background #0B0D10, cards #11151A, borders #1C2128 / #2A313B, text #E6E8EB, muted text #A3ABB6 / #8B949E
- One accent, teal #5EEAD4, set in the CSS variable `--accent`
- Fonts: Space Grotesk for headings, Inter for body text, JetBrains Mono for small labels (Google Fonts)
- Section order: Hero, 01 Experience, 02 Projects, 03 Education, 04 Leadership & recognition, 05 Outside work, 06 Contact, footer
- Sticky top nav with anchor links

## Content rules
- Content comes from Varun's resumes. Don't invent stats, titles or dates.
- Experience stays simple: dates, title · company, one short line, then project names as labels. No long bullet lists.
- Projects holds personal projects only (no TBS or other work projects). Right now that's just the Fantasy Football Start/Sit Model, marked "In progress".
- Writing style: direct, no em-dashes, no corporate filler.

## Open items
- LinkedIn button points to https://www.linkedin.com/ as a placeholder. Varun will provide his profile URL.
- Footer shows `[yourdomain].com` as a placeholder until the domain is bought.
- Resume button needs a real PDF at `resume.pdf` in the repo root.

## Hosting
- GitHub user: varunnagendran. Repo: `varunnagendran.github.io`, deployed from the `main` branch root.
- Keep it static: plain HTML/CSS, no build step, no framework.

## Working style
Varun prefers going step by step: explain the plan, make one change, show it, then continue. Commit after each meaningful change, using clear commit messages.
