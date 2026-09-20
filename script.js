"use strict";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const EVENT_COUNT = 7;

// A small state object keeps the current challenge and interface mode together.
const state = {
  dateKey: "",
  originalOrder: [],
  playerOrder: [],
  submitted: false,
  pairwiseScore: 0,
  exactPositions: 0,
  requestController: null
};

let draggedEventId = null;
let pointerDraggedEventId = null;

const elements = {
  datePanel: document.querySelector("#date-panel"),
  dateForm: document.querySelector("#date-form"),
  monthSelect: document.querySelector("#month-select"),
  daySelect: document.querySelector("#day-select"),
  todayButton: document.querySelector("#today-button"),
  loadButton: document.querySelector("#load-button"),
  statusMessage: document.querySelector("#status-message"),
  gameSection: document.querySelector("#game-section"),
  challengeDate: document.querySelector("#challenge-date"),
  eventList: document.querySelector("#event-list"),
  submitButton: document.querySelector("#submit-button"),
  resultsSection: document.querySelector("#results-section"),
  timelineScore: document.querySelector("#timeline-score"),
  exactScore: document.querySelector("#exact-score"),
  correctList: document.querySelector("#correct-list"),
  retryButton: document.querySelector("#retry-button"),
  chooseDateButton: document.querySelector("#choose-date-button"),
  copyLinkButton: document.querySelector("#copy-link-button"),
  copyResultButton: document.querySelector("#copy-result-button")
};

function twoDigits(number) {
  return String(number).padStart(2, "0");
}

function getTodayDateKey() {
  const today = new Date();
  return `${twoDigits(today.getMonth() + 1)}-${twoDigits(today.getDate())}`;
}

function daysInMonth(month) {
  // Leap year 2000 deliberately makes February 29 available every year.
  return new Date(2000, month, 0).getDate();
}

function isValidDateKey(value) {
  if (!/^\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [month, day] = value.split("-").map(Number);
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(month);
}

function readDateFromUrl() {
  const value = new URLSearchParams(window.location.search).get("date");
  return value && isValidDateKey(value) ? value : getTodayDateKey();
}

// Keep the challenge in the URL without reloading the page or exposing answers.
function updateUrl(dateKey) {
  const url = new URL(window.location.href);
  url.searchParams.set("date", dateKey);
  window.history.replaceState({ date: dateKey }, "", url);
}

function populateMonths() {
  MONTH_NAMES.forEach((name, index) => {
    const option = document.createElement("option");
    option.value = twoDigits(index + 1);
    option.textContent = name;
    elements.monthSelect.append(option);
  });
}

function populateDays(selectedDay) {
  const month = Number(elements.monthSelect.value);
  const maximumDay = daysInMonth(month);
  const safeDay = Math.min(Number(selectedDay) || 1, maximumDay);

  elements.daySelect.replaceChildren();

  for (let day = 1; day <= maximumDay; day += 1) {
    const option = document.createElement("option");
    option.value = twoDigits(day);
    option.textContent = String(day);
    elements.daySelect.append(option);
  }

  elements.daySelect.value = twoDigits(safeDay);
}

function setDateControls(dateKey) {
  const [month, day] = dateKey.split("-");
  elements.monthSelect.value = month;
  populateDays(day);
}

function getSelectedDateKey() {
  return `${elements.monthSelect.value}-${elements.daySelect.value}`;
}

function formatChallengeDate(dateKey) {
  const [month, day] = dateKey.split("-").map(Number);
  return `${MONTH_NAMES[month - 1]} ${day}`;
}

function formatYear(year) {
  return year < 0 ? `${Math.abs(year)} BC` : String(year);
}

function showStatus(message, type = "info") {
  elements.statusMessage.textContent = message;
  elements.statusMessage.dataset.type = type;
}

function setLoading(isLoading) {
  elements.loadButton.disabled = isLoading;
  elements.todayButton.disabled = isLoading;
  elements.monthSelect.disabled = isLoading;
  elements.daySelect.disabled = isLoading;
  elements.loadButton.textContent = isLoading ? "Loading…" : "Load Challenge";
}

// Convert a text seed into a repeatable 32-bit number.
function hashSeed(seedText) {
  let hash = 2166136261;

  for (let index = 0; index < seedText.length; index += 1) {
    hash ^= seedText.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

// Mulberry32 returns the same sequence of numbers for the same numeric seed.
function createSeededRandom(seed) {
  let value = seed >>> 0;

  return function seededRandom() {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle, using the seeded generator instead of unseeded randomness.
function seededShuffle(items, seedText) {
  const shuffled = [...items];
  const random = createSeededRandom(hashSeed(seedText));

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }

  return shuffled;
}

function stableEventId(year, text) {
  return `event-${year}-${hashSeed(`${year}|${text}`).toString(16)}`;
}

function compareEventsNewestFirst(first, second) {
  if (first.year !== second.year) {
    return second.year - first.year;
  }

  if (first.text < second.text) {
    return -1;
  }

  return first.text > second.text ? 1 : 0;
}

function containsExplicitYear(text, eventYear) {
  // Catch common written years, decades, and years labeled BC/BCE/AD/CE.
  const fourDigitYear = /\b(?:1\d{3}|20\d{2})(?:s|'s)?\b/i;
  const eraYear = /(?:\b(?:BC|BCE|AD|CE)\s*\d{1,4}\b|\b\d{1,4}\s*(?:BC|BCE|AD|CE)\b)/i;
  const earlyYearInContext = /\b(?:in|since|from|year)\s+\d{1,3}\b/i;
  const exactEventYear = Number.isFinite(eventYear)
    ? new RegExp(`\\b${Math.abs(eventYear)}\\b`)
    : null;

  return fourDigitYear.test(text)
    || eraYear.test(text)
    || earlyYearInContext.test(text)
    || (exactEventYear && exactEventYear.test(text));
}

function normalizeEvents(apiEvents) {
  if (!Array.isArray(apiEvents)) {
    return [];
  }

  return apiEvents
    .filter((event) => {
      return event
        && Number.isFinite(event.year)
        && typeof event.text === "string"
        && event.text.trim()
        && !containsExplicitYear(event.text, event.year);
    })
    .map((event) => ({
      year: event.year,
      text: event.text.trim(),
      id: stableEventId(event.year, event.text.trim())
    }))
    .sort(compareEventsNewestFirst);
}

function createChallenge(apiEvents, dateKey) {
  const normalizedEvents = normalizeEvents(apiEvents);
  const usedYears = new Set();
  const recentEvents = [];

  // Select the most recent event years before doing any shuffling.
  for (const event of normalizedEvents) {
    if (!usedYears.has(event.year)) {
      recentEvents.push(event);
      usedYears.add(event.year);
    }

    if (recentEvents.length === EVENT_COUNT) {
      break;
    }
  }

  // The date-seeded shuffle changes only the cards' initial displayed order.
  return seededShuffle(recentEvents, dateKey);
}

// Wikimedia's endpoint is keyless and returns historical entries in its events array.
async function fetchEvents(dateKey, signal) {
  const [month, day] = dateKey.split("-");
  const endpoint = `https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/events/${month}/${day}`;
  const response = await fetch(endpoint, { signal });

  if (!response.ok) {
    throw new Error(`Wikimedia returned status ${response.status}.`);
  }

  const data = await response.json();

  if (!Array.isArray(data.events)) {
    throw new Error("Wikimedia returned an unexpected response.");
  }

  return data.events;
}

async function loadChallenge(dateKey) {
  if (!isValidDateKey(dateKey)) {
    showStatus("Please choose a valid month and day.", "error");
    return;
  }

  if (state.requestController) {
    state.requestController.abort();
  }

  const controller = new AbortController();
  state.requestController = controller;
  setLoading(true);
  showStatus(`Loading the ${formatChallengeDate(dateKey)} challenge…`);
  elements.gameSection.hidden = true;
  elements.resultsSection.hidden = true;

  try {
    const apiEvents = await fetchEvents(dateKey, controller.signal);
    const selectedEvents = createChallenge(apiEvents, dateKey);

    if (selectedEvents.length === 0) {
      throw new Error("This date does not have any usable historical events. Please choose another date.");
    }

    // Assign every displayed event one unique color that stays with it as it moves.
    const coloredEvents = selectedEvents.map((event, index) => ({
      ...event,
      colorIndex: index
    }));

    state.dateKey = dateKey;
    state.originalOrder = coloredEvents.map((event) => ({ ...event }));
    state.playerOrder = coloredEvents.map((event) => ({ ...event }));
    state.submitted = false;
    state.pairwiseScore = 0;
    state.exactPositions = 0;

    updateUrl(dateKey);
    renderGame();
    elements.gameSection.hidden = false;
    const eventMessage = selectedEvents.length === EVENT_COUNT
      ? "seven recent events"
      : `all ${selectedEvents.length} available events from distinct years`;
    showStatus(`Challenge ready for ${formatChallengeDate(dateKey)} with ${eventMessage}.`, "success");
  } catch (error) {
    if (error.name !== "AbortError") {
      const message = error instanceof TypeError
        ? "Could not reach Wikimedia. Check your internet connection and try again."
        : error.message;
      showStatus(message, "error");
    }
  } finally {
    if (state.requestController === controller) {
      state.requestController = null;
      setLoading(false);
    }
  }
}

function createDragHandle(index) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "drag-handle";
  button.textContent = "\u283f";
  button.dataset.index = String(index);
  button.disabled = state.submitted;
  button.setAttribute(
    "aria-label",
    `Drag event at position ${index + 1}. Use the Up and Down arrow keys to move it.`
  );
  button.title = "Drag to reorder";
  return button;
}

function renderGame() {
  elements.eventList.replaceChildren();
  elements.challengeDate.textContent = formatChallengeDate(state.dateKey);

  state.playerOrder.forEach((event, index) => {
    const item = document.createElement("li");
    item.className = "event-card";
    item.classList.add(`event-color-${event.colorIndex}`);
    item.dataset.eventId = event.id;
    item.draggable = !state.submitted;

    const position = document.createElement("span");
    position.className = "event-position";
    position.textContent = String(index + 1);
    position.setAttribute("aria-hidden", "true");

    const content = document.createElement("div");

    if (state.submitted) {
      const year = document.createElement("span");
      year.className = "event-year";
      year.textContent = formatYear(event.year);
      content.append(year);
    }

    const text = document.createElement("p");
    text.className = "event-text";
    text.textContent = event.text;
    content.append(text);

    item.append(position, content, createDragHandle(index));
    elements.eventList.append(item);
  });

  elements.submitButton.disabled = state.submitted;
}

function moveEvent(index, direction) {
  if (state.submitted) {
    return;
  }

  const destination = direction === "up" ? index - 1 : index + 1;

  if (destination < 0 || destination >= state.playerOrder.length) {
    return;
  }

  [state.playerOrder[index], state.playerOrder[destination]] = [
    state.playerOrder[destination],
    state.playerOrder[index]
  ];

  renderGame();

  const movedEvent = state.playerOrder[destination];
  const movedCard = elements.eventList.querySelector(`[data-event-id="${movedEvent.id}"]`);
  movedCard.querySelector(".drag-handle").focus();
  showStatus(`Moved event to position ${destination + 1}.`);
}

function moveEventToIndex(eventId, destinationIndex) {
  if (state.submitted) {
    return;
  }

  const sourceIndex = state.playerOrder.findIndex((event) => event.id === eventId);

  if (sourceIndex < 0 || destinationIndex < 0 || sourceIndex === destinationIndex) {
    return;
  }

  const [movedEvent] = state.playerOrder.splice(sourceIndex, 1);
  state.playerOrder.splice(destinationIndex, 0, movedEvent);
  renderGame();
  showStatus(`Moved event to position ${destinationIndex + 1}.`);
}

function clearDragStyles() {
  elements.eventList.querySelectorAll(".event-card").forEach((card) => {
    card.classList.remove("is-dragging", "drag-over");
  });
}

// Desktop browsers use the native drag-and-drop events.
function handleDragStart(event) {
  const card = event.target.closest(".event-card");

  if (!card || state.submitted) {
    event.preventDefault();
    return;
  }

  draggedEventId = card.dataset.eventId;
  card.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedEventId);
}

function handleDragOver(event) {
  if (!draggedEventId || state.submitted) {
    return;
  }

  const targetCard = event.target.closest(".event-card");

  if (!targetCard || targetCard.dataset.eventId === draggedEventId) {
    return;
  }

  event.preventDefault();
  elements.eventList.querySelectorAll(".drag-over").forEach((card) => {
    card.classList.remove("drag-over");
  });
  targetCard.classList.add("drag-over");
  event.dataTransfer.dropEffect = "move";
}

function handleDrop(event) {
  const targetCard = event.target.closest(".event-card");

  if (!draggedEventId || !targetCard) {
    return;
  }

  event.preventDefault();
  const destinationIndex = state.playerOrder.findIndex(
    (item) => item.id === targetCard.dataset.eventId
  );
  const eventId = draggedEventId;
  draggedEventId = null;
  clearDragStyles();
  moveEventToIndex(eventId, destinationIndex);
}

function handleDragEnd() {
  draggedEventId = null;
  clearDragStyles();
}

function updateCardPositionLabels() {
  [...elements.eventList.children].forEach((card, index) => {
    card.querySelector(".event-position").textContent = String(index + 1);
    const handle = card.querySelector(".drag-handle");
    handle.dataset.index = String(index);
    handle.setAttribute(
      "aria-label",
      `Drag event at position ${index + 1}. Use the Up and Down arrow keys to move it.`
    );
  });
}

// Touch users drag from the handle; the DOM follows the finger until release.
function handlePointerDown(event) {
  const handle = event.target.closest(".drag-handle");

  if (!handle || event.pointerType === "mouse" || state.submitted) {
    return;
  }

  event.preventDefault();
  const card = handle.closest(".event-card");
  pointerDraggedEventId = card.dataset.eventId;
  handle.setPointerCapture(event.pointerId);
  card.classList.add("is-dragging");
}

function handlePointerMove(event) {
  if (!pointerDraggedEventId) {
    return;
  }

  event.preventDefault();
  const pointedElement = document.elementFromPoint(event.clientX, event.clientY);
  const targetCard = pointedElement ? pointedElement.closest(".event-card") : null;
  const draggedCard = elements.eventList.querySelector(
    `[data-event-id="${pointerDraggedEventId}"]`
  );

  if (!targetCard || !draggedCard || targetCard === draggedCard) {
    return;
  }

  const targetBounds = targetCard.getBoundingClientRect();
  const placeAfter = event.clientY > targetBounds.top + targetBounds.height / 2;
  const referenceCard = placeAfter ? targetCard.nextElementSibling : targetCard;
  elements.eventList.insertBefore(draggedCard, referenceCard);
  updateCardPositionLabels();
}

function finishPointerDrag() {
  if (!pointerDraggedEventId) {
    return;
  }

  const orderedIds = [...elements.eventList.children].map((card) => card.dataset.eventId);
  const eventsById = new Map(state.playerOrder.map((event) => [event.id, event]));
  const movedEventId = pointerDraggedEventId;
  pointerDraggedEventId = null;
  state.playerOrder = orderedIds.map((id) => eventsById.get(id));
  const destinationIndex = state.playerOrder.findIndex((event) => event.id === movedEventId);
  renderGame();
  showStatus(`Moved event to position ${destinationIndex + 1}.`);
}

function getCorrectOrder() {
  return [...state.playerOrder].sort((first, second) => first.year - second.year);
}

function calculateExactPositions(playerOrder, correctOrder) {
  return playerOrder.reduce((total, event, index) => {
    return total + (event.id === correctOrder[index].id ? 1 : 0);
  }, 0);
}

function calculatePairwiseScore(playerOrder) {
  let score = 0;

  // Compare every possible pair in the submitted order: 7 events make 21 pairs.
  for (let firstIndex = 0; firstIndex < playerOrder.length; firstIndex += 1) {
    for (let secondIndex = firstIndex + 1; secondIndex < playerOrder.length; secondIndex += 1) {
      if (playerOrder[firstIndex].year < playerOrder[secondIndex].year) {
        score += 1;
      }
    }
  }

  return score;
}

function calculateTotalPairs(eventCount) {
  return (eventCount * (eventCount - 1)) / 2;
}

function renderCorrectTimeline(correctOrder) {
  elements.correctList.replaceChildren();

  correctOrder.forEach((event) => {
    const item = document.createElement("li");
    item.className = "correct-item";

    const year = document.createElement("span");
    year.className = "correct-year";
    year.textContent = formatYear(event.year);

    const text = document.createElement("p");
    text.textContent = event.text;

    item.append(year, text);
    elements.correctList.append(item);
  });
}

function submitTimeline() {
  if (state.submitted || state.playerOrder.length === 0) {
    return;
  }

  const correctOrder = getCorrectOrder();
  const totalPairs = calculateTotalPairs(state.playerOrder.length);
  state.pairwiseScore = calculatePairwiseScore(state.playerOrder);
  state.exactPositions = calculateExactPositions(state.playerOrder, correctOrder);
  state.submitted = true;

  renderGame();
  renderCorrectTimeline(correctOrder);
  elements.timelineScore.textContent = `${state.pairwiseScore}/${totalPairs}`;
  elements.exactScore.textContent = `Exact Positions: ${state.exactPositions}/${state.playerOrder.length}`;
  elements.resultsSection.hidden = false;
  showStatus(
    `Answers revealed. Timeline score ${state.pairwiseScore} out of ${totalPairs}; ${state.exactPositions} exact positions.`,
    "success"
  );
  elements.resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function retryChallenge() {
  state.playerOrder = state.originalOrder.map((event) => ({ ...event }));
  state.submitted = false;
  state.pairwiseScore = 0;
  state.exactPositions = 0;
  elements.resultsSection.hidden = true;
  renderGame();
  showStatus(`The ${formatChallengeDate(state.dateKey)} challenge has been reset.`, "success");
  elements.gameSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function chooseAnotherDate() {
  elements.datePanel.scrollIntoView({ behavior: "smooth", block: "start" });
  elements.monthSelect.focus({ preventScroll: true });
  showStatus("Choose a new month and day, then load the challenge.");
}

function getChallengeUrl() {
  const url = new URL(window.location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("date", state.dateKey);
  return url.toString();
}

async function copyText(text, successMessage) {
  try {
    if (!navigator.clipboard || !window.isSecureContext) {
      throw new Error("Clipboard access is not available in this browser or context.");
    }

    await navigator.clipboard.writeText(text);
    showStatus(successMessage, "success");
  } catch (error) {
    showStatus("Copying failed. Please copy the address from your browser's address bar instead.", "error");
  }
}

function copyChallengeLink() {
  copyText(getChallengeUrl(), "Challenge link copied.");
}

function copyResult() {
  const totalPairs = calculateTotalPairs(state.playerOrder.length);
  const resultText = `I scored ${state.pairwiseScore}/${totalPairs} on the ${formatChallengeDate(state.dateKey)} ChronoClash. Can you beat me?\n${getChallengeUrl()}`;
  copyText(resultText, "Result copied.");
}

function attachEventListeners() {
  elements.monthSelect.addEventListener("change", () => {
    populateDays(elements.daySelect.value);
  });

  elements.dateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    loadChallenge(getSelectedDateKey());
  });

  elements.todayButton.addEventListener("click", () => {
    const todayKey = getTodayDateKey();
    setDateControls(todayKey);
    loadChallenge(todayKey);
  });

  elements.eventList.addEventListener("keydown", (event) => {
    const handle = event.target.closest(".drag-handle");

    if (!handle || (event.key !== "ArrowUp" && event.key !== "ArrowDown")) {
      return;
    }

    event.preventDefault();
    moveEvent(
      Number(handle.dataset.index),
      event.key === "ArrowUp" ? "up" : "down"
    );
  });

  elements.eventList.addEventListener("dragstart", handleDragStart);
  elements.eventList.addEventListener("dragover", handleDragOver);
  elements.eventList.addEventListener("drop", handleDrop);
  elements.eventList.addEventListener("dragend", handleDragEnd);
  elements.eventList.addEventListener("pointerdown", handlePointerDown);
  elements.eventList.addEventListener("pointermove", handlePointerMove);
  elements.eventList.addEventListener("pointerup", finishPointerDrag);
  elements.eventList.addEventListener("pointercancel", finishPointerDrag);

  elements.submitButton.addEventListener("click", submitTimeline);
  elements.retryButton.addEventListener("click", retryChallenge);
  elements.chooseDateButton.addEventListener("click", chooseAnotherDate);
  elements.copyLinkButton.addEventListener("click", copyChallengeLink);
  elements.copyResultButton.addEventListener("click", copyResult);
}

function initializeApp() {
  populateMonths();
  attachEventListeners();

  const initialDate = readDateFromUrl();
  setDateControls(initialDate);
  loadChallenge(initialDate);
}

initializeApp();
