# ChronoClash

ChronoClash is a small browser game that turns real historical events into a timeline challenge. Choose a month and day, arrange up to seven of its most recent events from earliest to latest, and submit your answer to see your score.

The project uses only HTML, CSS, and JavaScript. It has no framework, build step, backend, database, or API key.

## Run the project locally

The simplest option is to open `index.html` in a browser. If your browser restricts API requests from local files, serve the folder with a small local web server instead:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## How to play

1. Select a month and day, or choose **Play Today**.
2. Select **Load Challenge** to fetch events for that date.
3. Use each card's arrow buttons to arrange the events from earliest to latest.
4. Select **Submit Timeline** to reveal the dates, the correct order, and your score.
5. Try the same challenge again, choose another date, or copy a link to share it.

## Public API

ChronoClash uses Wikimedia's official On This Day API:

```text
https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/MM/DD
```

The response contains an `events` array. The app keeps entries with a numeric year and nonempty event text, but removes descriptions that contain an explicit written year because that would reveal too much of the answer. The filter always rejects a description containing its own API year. It also recognizes common four-digit years and decades, years labeled BC, BCE, AD, or CE, and early years written after words such as "in," "since," "from," or "year."

The remaining events are sorted from newest to oldest. The app walks through that sorted list and selects the seven most recent events from seven distinct years. Only after those events are selected does it use a seeded shuffle based on the `MM-DD` string to set their displayed order.

If a date has fewer than seven distinct event years, the challenge uses all available events from distinct years. A date with no usable events shows an error. This process means the same date produces the same selected events and starting order, as long as the API data itself has not changed.

No API key or other secret is required.

## Scoring

There are two scores:

- **Exact Positions** counts cards placed in exactly the correct slot.
- **Timeline Score** checks every pair of cards, and each correctly ordered pair earns one point. Seven cards contain 21 pairs; a shorter challenge automatically uses the correct smaller total.

Years below zero are displayed as BC years, so API year `-44` appears as `44 BC`.

## Error handling and tests

The interface shows useful messages for:

- Empty or invalid date selections
- Invalid `?date=MM-DD` URL values
- Network or API failures
- API responses with no usable historical events
- Dates where filtering explicit years leaves no playable events
- Clipboard permission or availability failures

Suggested manual tests:

1. Load a normal date and move the first and last cards.
2. Submit an untouched timeline, then use **Try Again**.
3. Open a valid shared URL such as `?date=09-20`.
4. Open invalid URLs such as `?date=13-40` or `?date=02-30`; they should safely load today's date.
5. Disconnect from the network and load a new challenge; the app should show an error instead of crashing.
6. Block clipboard permission and try a copy button; the app should explain that copying failed.

## Project files

- `index.html` — semantic page structure and accessible controls
- `styles.css` — responsive historical/editorial visual design
- `script.js` — API request, deterministic challenge generation, game state, scoring, and sharing
- `prompt_log.md` — record of the AI prompts and how the output was reviewed

## Privacy and security

This project does not use credentials or store personal data. If it is extended later with a keyed API, do not place the key in browser JavaScript or commit it to GitHub.
