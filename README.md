(This file is written by Chatgpt and I have revised this)


# ChronoClash

ChronoClash is a small browser game that turns real historical events into a timeline challenge. Choose a month and day, arrange up to seven of its most recent events from earliest to latest, and submit your answer to see your score.

The project uses only HTML, CSS, and JavaScript. It has no framework, build step, backend, database, or API key.

## Run the project locally

There are no packages or dependencies to install. The simplest option is to download or clone the repository and open `index.html` in a modern web browser.

If your browser restricts API requests from local files, use Python 3 to start a small local web server from the project folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser. Stop the server by pressing `Ctrl+C` in the terminal.

## How to play

1. Select a month and day, or choose **Play Today**.
2. Select **Load Challenge** to fetch events for that date.
3. Add an optional time guess to each event and press Enter to finish the entry. Pin any card you want to lock in its current position.
4. Hold and drag anywhere on an unpinned event card, except its Pin button or time field, to arrange the events from earliest to latest. The card follows the pointer freely and changes position only when you release it.
5. Select **Submit Timeline** to reveal the dates, the correct order, and your score.
6. Try the same challenge again, choose another date, or copy a link to share it.

## Scoring

There are two scores:

- **Exact Positions** counts cards placed in exactly the correct slot.
- **Timeline Score** checks every pair of cards, and each correctly ordered pair earns one point. Seven cards contain 21 pairs; a shorter challenge automatically uses the correct smaller total.

Years below zero are displayed as BC years, so API year `-44` appears as `44 BC`.





## Public API

ChronoClash uses Wikimedia's official On This Day API:

```text
https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/MM/DD
```

### How the API call works

The app uses the browser's built-in `fetch()` function, so no external JavaScript modules are needed. It sends a GET request to the Wikimedia endpoint with the selected month and day as two-digit URL path values, such as `09/20`. Wikimedia returns JSON containing an `events` array, and each usable event has a numeric `year` and a text string. The code checks whether the request succeeded, converts the response with `response.json()`, and then filters, sorts, selects, and shuffles the event objects for the game. This public endpoint does not require an API key, account, or other authentication, so there are no credentials to obtain or configure.

For a commented copy of the request code and a smaller usage example, see `api_code_reference.txt`.

### How events become a challenge

The app keeps entries with a numeric year and nonempty event text, but removes descriptions that contain an explicit written year because that would reveal too much of the answer. It recognizes common four-digit years and decades, years labeled BC, BCE, AD, or CE, and early years written in common date-related phrases.

The remaining events are sorted from newest to oldest. The app selects up to seven events from distinct years and then uses a seeded shuffle based on the `MM-DD` string to set their displayed order.

If a date has fewer than seven usable distinct years, the challenge uses all available events. A date with no usable events shows an error. The seeded process means the same date produces the same selected events and starting order, as long as the API data itself has not changed. 
(// providing the same events is important because this allows people to play together)





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
   (//For 15113 grading : this is an important feature to prevent possible bugs, I have view this)
5. Disconnect from the network and load a new challenge; the app should show an error instead of crashing.
6. Block clipboard permission and try a copy button; the app should explain that copying failed.

## Project files

- `index.html` - semantic page structure and accessible controls
- `styles.css` - responsive historical/editorial visual design
- `script.js` - API request, deterministic challenge generation, game state, scoring, and sharing
- `api_code_reference.txt` - a beginner-friendly copy and explanation of the API request code
- `prompt_log.md` - record of the AI prompts and how the output was reviewed


## Privacy and security
This project does not use credentials or store personal data. If it is extended later with a keyed API, do not place the key in browser JavaScript or commit it to GitHub.
