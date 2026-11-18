# Varun Nagendran personal website

## What this is
A single-page personal site that scrolls, themed as a fantasy football **Scouting Report**. It's hosted on GitHub Pages and will get a custom domain later (not bought yet).

## Approved design (index.html is the source of truth)
`index.html` is the design Varun approved, exported from a mockup. Keep the look exactly as it is unless he asks for a change.

**Theme:** Varun as a draft prospect. The theme lives in the labels, framing and a couple of interactions. The actual experience must stay easy to skim for a recruiter.

**Colors**
- Background #0A0C0B, cards #121614, borders #1F2622 / #34403A
- Text #EDEFEC, muted text #A2ABA5 / #86908A
- One accent, lime #C8F031, set in the CSS variable `--accent`
- Faint vertical "yard line" pattern behind the hero and the Sign section

**Fonts (Google Fonts)**
- Barlow Condensed (700/800, uppercase) for headings and big numbers
- Inter for body text
- JetBrains Mono for small uppercase labels

**Section order**
1. Scrolling stats ticker
2. Sticky nav (Career stats, Game film, Combine, Highlights, Locker room, Sign)
3. Hero: prospect intro, plus a start/sit card with a playful "98 START" score
4. 01 Career stats (experience)
5. 02 Game film (projects)
6. 03 The combine (education)
7. 04 Highlight reel (leadership)
8. 05 Locker room (outside work)
9. 06 Sign this player (contact)
10. Footer

**Interactions**
- The ticker scrolls with CSS animation and stops for users who prefer reduced motion.
- The Start/Sit buttons on the hero card swap the verdict line (`script.js`).
- The nav link for the section on screen lights up in lime with a lime underline (`script.js`). Nothing is lit in the hero; Sign is lit at the bottom of the page. On phones the link row slides to keep the lit link in view.

**Files:** `index.html` (markup), `styles.css` (all styling; colors and fonts are CSS variables in `:root`, phone layout under `@media (max-width: 640px)`), `script.js` (Start/Sit buttons, nav highlight). No inline styles except the meter bar widths on the start/sit card.

**Caching:** `index.html` links `styles.css?v=N` and `script.js?v=N`. Bump N whenever either file changes so browsers fetch the new version.

## Content rules
- Content comes from Varun's resumes. Don't invent stats, titles or dates. The "98" start score is the one deliberate joke number.
- Experience entries are "seasons": year, title · company, one short line, a "Plays" line of project names, and 2–3 stat boxes. No long bullet lists.
- Game film holds personal projects only (no work projects). Right now that's just the Fantasy Football Start/Sit Model, marked "In progress". Keep its description in sync with what's actually built in the ff-start-sit repo.
- Writing style: direct, no em-dashes, no corporate filler.

## Open items
- The GitHub link on the project card should point to the ff-start-sit repo once it's confirmed.
- Footer shows `varunnagendran.github.io` until the custom domain is bought. Swap it then.
- The "Resume" button in the hero expects `resume.pdf` in the repo root.

## Links
- LinkedIn: https://www.linkedin.com/in/varun-nagendran/
- GitHub: https://github.com/varunnagendran
- Email: vnagendran.msc2026@ivey.ca (mailto link)

## Hosting
- GitHub user: varunnagendran. Repo: `varunnagendran.github.io`, deployed from the `main` branch root.
- Keep it static: plain HTML/CSS/JS, no build step, no framework.

## Working style
Varun prefers going step by step: explain the plan, make one change, show it, then continue. Commit after each meaningful change, using clear commit messages.
