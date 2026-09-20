prompt 1: 

I will be doing a hw project, the instructions are as follow, you do not need to generate anything now.





**Goal:** Use AI tools to explore and integrate a public API of your choice into a small but interesting app, or you may add an API-related feature on your portfolio website. The goal is hands-on experience with how APIs work, how to call them from code, and how to read and discuss the resulting code. &#x20;



1. Choose a public API you find interesting (preferably free or with a free tier).
2. Decide on a small scope: fetch and display current data (e.g., current weather for a city), or fetch and show a list (e.g., latest quotes), or perhaps a plot (e.g. for stock data or recent temperatures), or add a small dynamic widget to your portfolio. You should choose something that can do more than just return the same data every time, e.g. you should fetch recent data, or you should allow the user to specify some parameters for the information they wish to retrieve.
3. Use AI tools to help learn how the API works and to generate some code. As always, be explicit in your prompts so that you get results that align with your goals.
4. Implement the code and test it locally. Remember, keep API keys and other secrets out of the repo — use environment variables or a local text file or config file excluded from version control. See below for instructions on setting up a .gitignore if needed. (This is only relevant if your API requires authentication or a secret key.)
5. **Try to break it.** Test a misspelled or empty input, a search that returns no results, and a request that fails (turn your wifi off for a moment). Your app should say something useful rather than crashing with a traceback.
6. Write a short README and prompt log as described above and include these in your repo.





**Privacy note:** **Do not commit API keys, credentials, or other secrets to GitHub.** If the API requires a key, use environment variables or a local text file or config file excluded via .gitignore, and explain in the README how to provide the key locally. **See the Tips section below for advice on how to set up a .gitignore file. Security is important, and you will receive a zero if your repository contains a private key that should not be exposed.** (Ask on Ed if you aren't sure if something is a private key or not!) **One trap to avoid:** if your API requires a key, don't call it directly from JavaScript running in the browser. Any key in front-end code is visible to every visitor who opens the developer tools, no matter how you store it. Use Python for a keyed API, or choose a keyless API if you want the project running live on your portfolio. (Doing this properly requires a backend, which we'll explore in a later assignment.) **If you do accidentally commit a key,** deleting it in a later commit is not enough, because it's still in your repository's history. Go to whoever issued the key, revoke or regenerate it immediately, and then let us know. Doing that promptly is the right professional response and won't be held against you. &#x20;








prompt 2: 

Build a complete, small browser game called **ChronoClash** using only vanilla HTML, CSS, and JavaScript.

The project is for a beginner-friendly course about using AI to integrate a public API. Keep the code readable, clearly organized, and easy for me to explain. Do not use React, TypeScript, npm, frameworks, a backend, a database, API keys, build tools, or external JavaScript libraries.

Create these files:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`
- `prompt_log.md`

## Game concept

ChronoClash is a historical timeline challenge.

The player selects any month and day of the year. The app fetches historical events that occurred on that date from Wikimedia’s official “On This Day” API:
```text
https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/MM/DD
```

For example:
```text
https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/09/20
```

The app selects exactly seven events from different years, hides their years, and displays them in a shuffled order. The player uses up and down buttons to arrange the events from earliest to latest. After submitting, the app reveals the years, shows the correct timeline, and calculates a score.

## Required features

### 1. Date selection

Provide:

- A `Play Today` button
- A month dropdown
- A day dropdown
- A `Load Challenge` button

The month and day controls should default to today’s local date.

Update the number of available days when the month changes. Allow February 29.

Do not ask the player to choose a year because the game only uses the month and day.

### 2. URL challenge parameter

Store the selected date in the URL using this format:
```text
?date=09-20
```

When the page loads:

- Read the `date` query parameter.
- Validate it.
- If it is valid, automatically load that challenge.
- If it is missing or invalid, load today’s challenge.

Use `history.replaceState()` or `history.pushState()` so selecting another date updates the URL without reloading the page.

### 3. Wikimedia API

Fetch data from:
```js
https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}
```

Use the `events` array returned by the API.

Each usable event must have:

- A numeric `year`
- Nonempty `text`

Filter out duplicate years so that all seven events have different years. If fewer than seven usable events remain, show a clear error message.

Handle loading and network-error states cleanly.

### 4. Deterministic challenge generation

Everyone who selects the same month and day must receive:

- The same seven events
- The same initial shuffled order

Do not use plain `Math.random()`.

Implement a small deterministic seeded random-number generator. Use the `MM-DD` date string as the seed.

Before selecting events:

1. Normalize the API data.
2. Sort it consistently by year and then by event text.
3. Apply a deterministic seeded shuffle.
4. Select seven events with distinct years.

The result must remain consistent even if two users load the challenge independently.

Give every selected event a stable internal ID.

### 5. Timeline interface

Display seven numbered event cards without their years.

Each card must have:

- The event text
- A Move Up button
- A Move Down button

The buttons may use accessible arrow symbols, but they must also have descriptive `aria-label` attributes.

Disable the Move Up button on the first card and the Move Down button on the final card.

Do not implement drag and drop. The controls must work reliably on both desktop and mobile.

Whenever an event moves, update the displayed position numbers.

### 6. Submitting and scoring

Provide a `Submit Timeline` button.

After submission:

- Disable all movement controls.
- Reveal the year of every event.
- Show the correct chronological order in a separate results section.
- Show how many events were placed in their exact correct position.
- Calculate a pairwise timeline score.

With seven events, there are:
```text
7 choose 2 = 21
```

possible pairs.

For every pair of events in the player’s submitted order, award one point if their relative chronological order is correct. Display the result like:
```text
Timeline Score: 17/21
Exact Positions: 3/7
```

Use a clear nested-loop implementation for the pairwise score so that I can easily understand and explain it.

Support years before the Common Era if the API returns them. Display a negative year such as `-44` as `44 BC`.

### 7. Replay and sharing

Provide:

- `Try Again` — restores the same seven events in their original shuffled order.
- `Choose Another Date`
- `Copy Challenge Link`

After the player submits, also provide `Copy Result`.

Example copied result:
```text
I scored 17/21 on the September 20 ChronoClash. Can you beat me?
https://example.com/chronoclash/?date=09-20
```

Use the browser Clipboard API. Show short visible confirmation after copying. If clipboard access fails, show a helpful error rather than crashing.

Do not include the answers or years in the shared URL.

### 8. Visual design

Create a clean, polished, responsive interface with a subtle historical/editorial feeling.

Use:

- Deep navy as the main color
- Warm off-white as the background
- A restrained red accent
- Strong readable typography
- Thin borders
- Clear spacing
- Square or slightly rounded cards

Avoid:

- Gradients
- Glassmorphism
- Neon effects
- Excessive animation
- Oversized decorative elements
- Generic startup-style floating cards

Make the event text easy to read. The design should work well on a laptop and a phone.

Use a small amount of meaningful animation only if it does not complicate the code.

### 9. Accessibility

Include:

- Semantic HTML
- Proper labels
- Keyboard-accessible buttons
- Visible focus states
- Sufficient color contrast
- An `aria-live` region for loading, errors, answers, and copy confirmation

### 10. Code quality

Keep the JavaScript beginner-readable.

Use:

- Clear function names
- Small functions with one purpose
- A small state object
- Helpful comments around the API request, seeded shuffle, URL handling, movement logic, and pairwise scoring

Do not overengineer the project or introduce classes unless genuinely necessary.

Do not add any Easter eggs, birthdays, accounts, leaderboards, timers, images, multiple game modes, or unrelated features.

## Verification

After creating the files:

1. Check `script.js` for JavaScript syntax errors.
2. Review the generated HTML, CSS, and JavaScript for mismatched IDs or selectors.
3. Verify the API endpoint format.
4. Confirm that changing an event’s position updates the state correctly.
5. Confirm that the maximum pairwise score is 21.
6. Confirm that the same date always generates the same seven events and initial ordering.
7. Confirm that invalid URL dates fall back safely to today.
8. Briefly summarize the files created and any testing performed.

Implement the project now. Do not merely describe the solution, and do not ask me to choose additional features.






prompt 3:
Modify the existing ChronoClash project without rebuilding or redesigning it. Otherwise, it is too easy;

Change the event-selection logic:

1. Use all valid historical events returned by the API
2. Sort events from newest to oldest.
3. Select the seven most recent events from seven distinct years.
4. Use the existing date-seeded shuffle only to randomize their displayed order.
5. If fewer than seven distinct years are available, show a clear error.

Update the visible instructions and README accordingly. Preserve all existing date selection, URL sharing, movement, reset, deterministic challenge, and scoring functionality.



Do you understand the instruction?









prompt 4:
Remove all events with explict year, because that makes answer obvious.



prompt 5:
Make the following changes:

1 Do not change the color of the event while moving the events
2 could you add a scale to the right showing earlist to latest to help the player?
3 "Can you put the past in its place?" make this one line (extend to the right)
4 "Choose a date, then arrange up to seven of its most recent historical events from earliest to latest. Events that print a year in their description are left out, and all remaining years stay hidden until you submit.  " (extend to the right, make this not just ocupyying the left right)

5 make the moving arrow thicker looks more interesting

Do you understand the instructions?






prompt 6:
make the following changes

1 "Choose a date, then arrange up to seven historical events from earliest to latest. "  simplify the desciption sentence to this

2 Could you try to switch to dragging the event, instead of using the arrows?

3 The colors should not repeat, and the constart between the seven colors should be more obvious ( and avoid red and green if possible)

Are the instructions clear?






prompt 7:
1 Could you make the fonts of the events larger?&#x20;
2 Could you add a pin button to pin an event
3 also, add a box for the users to annotate the time they think the event happend at. This can help them organize the events.

(Are these instructions clear?)




prompt 8:
1 I think you just remove the dragging function, fix it&#x20;
2 The example of the time guess should be 2000 (and make the box smaller, and be on the same line with ""your Time guess", the key focus should be the events)
3 Remove the button for keyboard move, only allow moving by dragging



prompt 9:
1 remove the button for dragging, that six dot button is no longer useful. The player should be able to drag by just holding the box of the event
2 Make dragging smoother, no need to deal with pen handling&#x20;
&#x20;(now the dragging is too abrupt)




prompt 10:
The dragging needs a bit more change:

The player should be able to drag the event outside the page edge to make dragging easier

(I might not express it really good, could you confirm you get the idea before you start changing?)




prompt 11:
1. For the time guess box, set the default to "eg: 2000"&#x20;
2. After enter the words and hit enter, the select highlight on the guess box should disapper
3. change the sentence"**EarliestLatest**

   Hold and drag a card, then release it over the closest timeline position. Move near a page edge to scroll, pin positions you feel sure about, and record your time guesses." to "Hold and drag a card, then release it over the closest timeline position. Pin positions you feel sure about, and fill in the time guesses to help you arrange" ( something like this, you should revise the sentence a bit to  work out the grammar and expression). Also put this on the top, right under Build the timeline and date


