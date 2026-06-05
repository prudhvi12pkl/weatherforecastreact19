# Weather App — Technical Documentation

**Version:** 1.0.0  
**Stack:** React 19 · Vite 6 · Axios · OpenWeatherMap API  
**Deployment:** Vercel  
**Author:** _your name here_  
**Last updated:** June 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [File Structure Explained](#3-file-structure-explained)
4. [Data Flow](#4-data-flow)
5. [Key React 19 Concepts Used](#5-key-react-19-concepts-used)
6. [API Integration](#6-api-integration)
7. [Component Reference](#7-component-reference)
8. [Hook Reference](#8-hook-reference)
9. [Utility Reference](#9-utility-reference)
10. [Styling Approach](#10-styling-approach)
11. [Error Handling Strategy](#11-error-handling-strategy)
12. [Geolocation Implementation](#12-geolocation-implementation)
13. [Environment & Configuration](#13-environment--configuration)
14. [Build & Deployment](#14-build--deployment)
15. [Extending the App](#15-extending-the-app)
16. [Decisions & Trade-offs](#16-decisions--trade-offs)

---

## 1. Project Overview

The Weather App displays real-time weather conditions and a 5-day forecast for any city in the world. It was built as a learning project to practice React 19's new hooks (`useActionState`) and browser APIs (Geolocation).

### What it does (non-technical)

A user opens the app and immediately sees the weather for their current location — no need to type anything. They can also search for any city. The app shows temperature, humidity, wind speed, a weather icon, and a 5-day forecast with daily high and low temperatures.

### What it does (technical)

- On mount: calls `navigator.geolocation.getCurrentPosition`, passes coordinates to OpenWeatherMap `/weather` endpoint, renders `WeatherCard`
- On search: form submission triggers `useActionState` action, calls `/weather` and `/forecast` in parallel via `Promise.all`, renders `WeatherCard` + `ForecastCard`
- Forecast data (40 three-hour entries) is grouped into daily summaries by `groupByDay` utility
- All async state (loading, error, result) is managed by `useActionState` — no manual `useState` juggling

---

## 2. Architecture

```
┌─────────────────────────────────────────────┐
│                  Browser                     │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │             App.jsx                   │   │
│  │  (orchestrator — no fetch logic here) │   │
│  │                                       │   │
│  │  useWeather()      useGeoWeather()    │   │
│  │       │                  │            │   │
│  │       ▼                  ▼            │   │
│  │  WeatherCard        WeatherCard       │   │
│  │  ForecastCard                         │   │
│  └──────────────────────────────────────┘   │
│                    │                         │
│            src/api/weather.js                │
│                    │                         │
└────────────────────┼────────────────────────┘
                     │ HTTPS
                     ▼
        OpenWeatherMap API
        /data/2.5/weather
        /data/2.5/forecast
```

### Design principles

**Separation of concerns** — fetch logic lives only in `src/api/weather.js`. Hooks handle state. Components only render.

**No prop drilling** — `App.jsx` passes data directly to the two display components. The app is small enough that Context is not needed.

**Fail gracefully** — every async path has an error state with a user-friendly message. The geolocation failure does not break the search flow.

---

## 3. File Structure Explained

```
src/
├── api/
│   └── weather.js
│       fetchWeather(city)              → current weather by city name
│       fetchWeatherByCoords(lat, lon)  → current weather by GPS
│       fetchForecast(city)             → 5-day forecast by city name
│       fetchForecastByCoords(lat, lon) → 5-day forecast by GPS
│
├── components/
│   ├── WeatherCard.jsx    → pure display, receives `data` prop (OWM weather object)
│   └── ForecastCard.jsx   → receives `forecastData` prop (OWM forecast object)
│                            calls groupByDay() internally
│
├── hooks/
│   ├── useWeather.js      → wraps useActionState for city search
│   └── useGeoWeather.js   → runs geolocation on mount, manages its own state
│
├── utils/
│   └── groupForecast.js   → groups 40 OWM 3-hour entries into 5 daily summaries
│
├── App.jsx                → wires hooks + components, priority logic for display
└── index.css              → all styles, no CSS modules or Tailwind
```

---

## 4. Data Flow

### Search flow (step by step)

```
User types city → submits form
        │
        ▼
useActionState action fires (useWeather.js)
        │
        ▼
Promise.all([fetchWeather(city), fetchForecast(city)])
        │
   ┌────┴────┐
   ▼         ▼
weather    forecast
object     object (40 entries)
   │         │
   │         ▼
   │    groupByDay() → 5 daily summaries
   │         │
   ▼         ▼
WeatherCard  ForecastCard
renders      renders
```

### Geolocation flow (on mount)

```
Component mounts
        │
        ▼
navigator.geolocation.getCurrentPosition()
        │
   ┌────┴──────────────┐
   ▼ success           ▼ error / denied
{ latitude,          setGeoState({ error: msg })
  longitude }                │
        │                    ▼
        ▼              error message shown
fetchWeatherByCoords()  search still works
        │
        ▼
setGeoState({ data })
        │
        ▼
WeatherCard renders
```

### Priority logic in App.jsx

```js
const displayData = state.data ?? geo.data;
const displayForecast = state.forecast ?? null;
const displayError = state.error ?? geo.error;
```

Search result always wins. If no search has been made, geolocation result is shown. Errors follow the same priority.

---

## 5. Key React 19 Concepts Used

### useActionState

Introduced in React 19. Replaces the common pattern of managing `loading`, `error`, and `data` as separate `useState` hooks for async form submissions.

**Before React 19:**

```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [data, setData] = useState(null);

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const result = await fetchWeather(city);
    setData(result);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**With React 19:**

```jsx
const [state, action, isPending] = useActionState(
  async (prevState, formData) => {
    try {
      const data = await fetchWeather(formData.get("city"));
      return { data, error: null };
    } catch {
      return { data: null, error: "City not found." };
    }
  },
  { data: null, error: null }, // initial state
);
```

`isPending` is true while the async function runs. `state` holds the last returned value. The form's `action` prop accepts the function directly — no `onSubmit` needed.

### Async form actions

In React 19 you can pass an async function to `<form action={...}>`. React manages the submission lifecycle.

```jsx
<form action={action}>
  <input name="city" />
  <button disabled={isPending}>Search</button>
</form>
```

`formData.get('city')` inside the action reads the input by its `name` attribute.

### ref as a prop (not used here, but worth knowing)

React 19 removes the need for `forwardRef`. Components now accept `ref` as a regular prop. Not used in this app since no imperative DOM access is needed.

---

## 6. API Integration

### Base configuration

```js
// src/api/weather.js
const BASE_URL = "https://api.openweathermap.org/data/2.5";
const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
```

`import.meta.env` is Vite's way of reading `.env` variables. The `VITE_` prefix is required — Vite strips variables without it for security.

### Endpoints used

#### Current weather by city

```
GET https://api.openweathermap.org/data/2.5/weather
    ?q=Hyderabad
    &appid=YOUR_KEY
    &units=metric
```

**Key response fields used:**

```json
{
  "name": "Hyderabad",
  "sys": { "country": "IN" },
  "main": {
    "temp": 34.2,
    "feels_like": 38.1,
    "humidity": 55
  },
  "weather": [{ "description": "haze", "icon": "50d" }],
  "wind": { "speed": 3.1 }
}
```

#### 5-day forecast by city

```
GET https://api.openweathermap.org/data/2.5/forecast
    ?q=Hyderabad
    &appid=YOUR_KEY
    &units=metric
```

Returns `{ list: [...] }` — 40 entries, one every 3 hours.

**Each entry:**

```json
{
  "dt_txt": "2026-06-04 12:00:00",
  "main": { "temp": 35.1, "temp_min": 32.0, "temp_max": 36.5, "humidity": 48 },
  "weather": [{ "description": "clear sky", "icon": "01d" }]
}
```

#### Weather icon URL pattern

```
https://openweathermap.org/img/wn/{icon}@2x.png
```

Example: `https://openweathermap.org/img/wn/01d@2x.png`

Use `@2x.png` for the 64×64 version (current weather), plain `.png` for 32×32 (forecast rows).

---

## 7. Component Reference

### `<WeatherCard data={data} />`

Displays current weather for one location.

**Props:**

| Prop   | Type     | Description                           |
| ------ | -------- | ------------------------------------- |
| `data` | `object` | Direct OWM `/weather` response object |

**Renders:**

- City name + country code
- Weather description
- Weather icon (64×64)
- Temperature (rounded to nearest degree)
- Feels like, humidity, wind speed in a 3-column grid

**No internal state.** Pure display component.

---

### `<ForecastCard forecastData={forecastData} />`

Displays a 5-day forecast summary.

**Props:**

| Prop           | Type     | Description                            |
| -------------- | -------- | -------------------------------------- |
| `forecastData` | `object` | Direct OWM `/forecast` response object |

**Internally calls** `groupByDay(forecastData.list)` to convert 40 entries into 5 daily summaries.

**Renders:** One row per day showing day name, icon, description, high/low temperatures.

---

## 8. Hook Reference

### `useWeather()`

Manages the city search form state using `useActionState`.

**Returns:**

| Key              | Type             | Description                   |
| ---------------- | ---------------- | ----------------------------- |
| `state.data`     | `object \| null` | OWM weather response          |
| `state.forecast` | `object \| null` | OWM forecast response         |
| `state.error`    | `string \| null` | Human-readable error message  |
| `searchAction`   | `function`       | Pass to `<form action={...}>` |
| `isPending`      | `boolean`        | True while fetching           |

**Error cases handled:**

- Empty input → `"Please enter a city name."`
- 404 from API → `"City 'X' not found. Check the spelling."`
- Any other error → `"Something went wrong. Try again."`

---

### `useGeoWeather()`

Runs `navigator.geolocation.getCurrentPosition` on mount. Returns current weather for the user's physical location.

**Returns:**

| Key         | Type             | Description                        |
| ----------- | ---------------- | ---------------------------------- |
| `data`      | `object \| null` | OWM weather response               |
| `error`     | `string \| null` | Human-readable error               |
| `isPending` | `boolean`        | True while waiting for GPS + fetch |

**Error cases handled:**

| Scenario                                | Message shown                                               |
| --------------------------------------- | ----------------------------------------------------------- |
| Browser doesn't support geolocation     | `"Geolocation is not supported by your browser."`           |
| User denies permission (err.code === 1) | `"Location access denied. Allow permission and try again."` |
| GPS timeout or other error              | `"Could not get your location."`                            |
| Fetch fails after getting coordinates   | `"Could not fetch weather for your location."`              |

**Important:** All `setGeoState` calls inside the `useEffect` body are wrapped in `setTimeout(..., 0)` to avoid React 19's warning about synchronous state updates inside effects.

---

## 9. Utility Reference

### `groupByDay(forecastList)`

**Input:** Array of 40 OWM forecast entries (each has `dt_txt`, `main`, `weather`)

**Output:** Array of up to 5 objects:

```js
{
  date: "2026-06-04",       // YYYY-MM-DD
  minTemp: 29,              // lowest temp_min across all entries that day
  maxTemp: 37,              // highest temp_max across all entries that day
  description: "clear sky", // from the noon entry (or middle entry)
  icon: "01d",              // from the noon entry
  humidity: 48              // from the noon entry
}
```

**Logic:**

1. Group all entries by date (`dt_txt.split(' ')[0]`)
2. For each date, find the entry with `dt_txt` containing `"12:00:00"` as the representative (noon best reflects daytime conditions)
3. Fall back to the middle entry if no noon entry exists (common for today's date when it's past noon)
4. Compute `minTemp` and `maxTemp` across all entries for that day — not just the noon entry — for accuracy

---

## 10. Styling Approach

Plain CSS in a single `index.css` file. No CSS modules, no Tailwind, no styled-components.

**Rationale:** Keeps the project simple and focused on React concepts rather than styling infrastructure. Suitable for a learning project or small production app.

**Design tokens used:**

- Background: `#f0f4f8` (page), `#fff` (cards)
- Primary text: `#1e293b`
- Secondary text: `#64748b`, `#94a3b8`
- Accent: `#3b82f6` (button)
- Border: `#e2e8f0`, `#cbd5e1`
- Error: `#dc2626` text, `#fef2f2` background

**Responsive:** Single-column layout with `max-width: 420px` centered. Works on all screen sizes without media queries.

---

## 11. Error Handling Strategy

The app uses a **return-based error pattern** inside `useActionState` — errors are returned as state values, not thrown:

```js
// Good — error is part of state
return { data: null, error: "City not found." };

// Avoided — would require separate try/catch in the component
throw new Error("City not found.");
```

This keeps the component clean — it just reads `state.error` to decide whether to show the error message.

**HTTP errors** are caught via Axios, which throws on non-2xx responses. The `err.response.status` is checked to give specific messages (404 = city not found vs. 500 = server error).

---

## 12. Geolocation Implementation

The browser's Geolocation API is asynchronous and permission-gated. Key implementation details:

```js
navigator.geolocation.getCurrentPosition(
  successCallback, // called with { coords: { latitude, longitude } }
  errorCallback, // called with { code: 1 | 2 | 3 }
  { timeout: 10000 }, // give up after 10 seconds
);
```

**Error codes:**

- `1` = PERMISSION_DENIED — user clicked "Block"
- `2` = POSITION_UNAVAILABLE — GPS hardware failed
- `3` = TIMEOUT — took longer than `timeout` ms

**HTTPS requirement:** Browsers only expose `navigator.geolocation` on secure origins (HTTPS or localhost). This works in Vite dev (`localhost`) and on Vercel (HTTPS). It will fail on plain HTTP production deployments.

---

## 13. Environment & Configuration

### .env file

```env
VITE_WEATHER_API_KEY=your_key_here
```

### .env.example (commit this, not .env)

```env
VITE_WEATHER_API_KEY=
```

### Vite config

```js
// vite.config.js
export default {
  server: {
    proxy: {
      "/api": "http://localhost:3000", // only needed if adding a backend
    },
  },
};
```

No special Vite config is needed for this project beyond the default.

### Units

Currently set to `metric` (°C, m/s). To switch to imperial (°F, mph) change `units: 'metric'` to `units: 'imperial'` in all four functions in `weather.js`.

---

## 14. Build & Deployment

### Build

```bash
npm run build
```

Outputs to `/dist`. Vite bundles and minifies all JS/CSS. The output is a static site — no server required.

### Vercel deployment

1. Push to GitHub
2. Import repo on vercel.com
3. Add `VITE_WEATHER_API_KEY` in Environment Variables
4. Deploy

**Build settings Vercel auto-detects for Vite:**

- Framework: Vite
- Build command: `vite build`
- Output directory: `dist`
- Install command: `npm install`

Every push to `main` triggers an automatic redeploy.

---

## 15. Extending the App

### Add hourly forecast

Use the same `/forecast` endpoint — render the entries for today without grouping by day.

### Add geolocation forecast

In `useGeoWeather.js`, call `fetchForecastByCoords(lat, lon)` alongside the existing weather fetch using `Promise.all`. Pass the result up through `App.jsx` to `ForecastCard`.

### Add unit toggle (°C / °F)

Add a `useState('metric')` in `App.jsx`. Pass the unit to all fetch functions. Display `°C` or `°F` based on state.

### Add search history

Store an array of recent searches in `localStorage`. Display as chips below the search bar. Clicking a chip triggers a new search.

### Add dark mode

Add a `data-theme` attribute to `<html>` and define CSS variables for both themes in `index.css`. Toggle with a button.

---

## 16. Decisions & Trade-offs

| Decision          | Chosen                    | Alternative             | Reason                                                                  |
| ----------------- | ------------------------- | ----------------------- | ----------------------------------------------------------------------- |
| HTTP client       | Axios                     | fetch API               | Axios throws on non-2xx automatically; cleaner error handling           |
| State management  | useActionState + useState | React Query             | App is small; React Query adds dependency for minimal gain              |
| Styling           | Plain CSS                 | Tailwind CSS            | Keeps focus on React, not utility classes                               |
| Forecast grouping | Client-side               | Server-side / paid tier | Free API doesn't provide daily summaries; grouping is simple            |
| Geo fetch         | On mount                  | On button click         | Better UX — user sees local weather immediately                         |
| Env variables     | Vite VITE\_ prefix        | Runtime config          | Standard Vite pattern; build-time injection is simpler for static sites |
