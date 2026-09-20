# AI Prompt Log

This file records how AI was used while creating ChronoClash.

## Prompt 1: project requirements

I asked the AI to build a complete beginner-friendly browser game using only vanilla HTML, CSS, and JavaScript. The prompt specified:

- Use Wikimedia's keyless On This Day API for a player-selected month and day.
- Read and update a `?date=MM-DD` URL parameter.
- Deterministically choose and shuffle seven events from different years.
- Let players reorder cards with accessible up and down buttons.
- Reveal years and calculate exact-position and pairwise-order scores.
- Add replay, date selection, challenge-link copying, and result copying.
- Handle invalid dates, too little data, network failures, and clipboard failures.
- Use an accessible, responsive navy, off-white, and red editorial design.
- Keep the JavaScript organized, commented, and easy for a beginner to explain.
- Create `index.html`, `styles.css`, `script.js`, `README.md`, and this prompt log.
- Check syntax, selectors, endpoint formatting, movement, scoring, determinism, and invalid URL behavior.

## How I reviewed the result

I reviewed the generated files instead of accepting them blindly. In particular, I checked that:

- No API keys, frameworks, packages, or external JavaScript libraries were added.
- The API URL uses two-digit month and day values.
- The seeded random-number generator is used instead of `Math.random()`.
- Events are normalized and sorted before the deterministic shuffle.
- State changes when a card moves, and the interface is rendered again from that state.
- Pairwise scoring uses a straightforward nested loop and has 21 possible points for seven events.
- Invalid URL dates fall back to the local current date.
- Loading, network, insufficient-data, and clipboard errors produce visible messages.

## Possible follow-up prompts

If I continue improving the project, I might ask AI to:

- Explain the seeded shuffle line by line in beginner-friendly language.
- Help write a manual test checklist without changing the game code.
- Review the page with a screen reader and suggest accessibility improvements.

Any future AI-assisted changes should also be recorded here.

## Prompt 2: use the most recent events

I asked the AI to preserve the existing project and change only the challenge selection rules. Valid events now sort from newest to oldest, the app selects up to seven events from distinct recent years, and the existing date-seeded shuffle runs only after selection. I clarified that if fewer than seven distinct years are available, the game should use all of them instead of showing an error.

## Prompt 3: hide explicit years

I asked the AI to remove events whose descriptions contain an explicit year because those descriptions make the timeline answer too obvious. The filtering step now runs before recent-year selection and recognizes common numeric years, decades, era labels such as BC or AD, and early years introduced by common date-related words.
