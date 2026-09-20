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

## Prompt 4: color and typography

I asked the AI to make the website more colorful and the fonts a bit larger and more interesting. The stylesheet adds teal, gold, and plum accents, softly colored event cards, larger text and controls, and a Palatino-style heading font using locally available font fallbacks. Card colors follow their positions rather than event years.

## Prompt 5: timeline layout refinements

I asked the AI to keep each event card's color unchanged while it moves, add an earliest-to-latest scale on the right, let the introduction use the full page width, keep the main question on one line on wider screens, and make the movement arrows thicker. Event colors are now assigned from stable event text rather than list position.

## Prompt 6: drag controls and unique colors

I asked the AI to simplify the introductory description, replace the visible arrow buttons with drag controls, and give all seven event cards clearly different colors without relying on red or green. The cards support mouse dragging, touch dragging from the handle, and keyboard reordering with the Up and Down keys. Each color is assigned once when a challenge loads and stays with that event.

## Prompt 7: pins and time guesses

I asked the AI to enlarge the event text, add a pin button, and add a field where players can record when they think each event happened. A pinned event stays in its numbered position while unpinned cards move around it. Time guesses stay attached to their events, do not affect scoring, and are cleared with pins when the player selects Try Again.

## Prompt 8: pointer-only dragging

I asked the AI to repair dragging, remove the keyboard movement control, and make the time-guess input smaller and inline with its label. Reordering now uses one pointer-based implementation for mouse, touch, and pen input. The drag grip is no longer a button, and the compact guess field uses `2000` as its example.
