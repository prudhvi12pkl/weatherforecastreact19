//a perfect overview of weather app is here that is butter smooth

# 🌤️ Weather App

A clean, responsive weather app built with **React 19** and **Vite**, powered by the OpenWeatherMap API. Search any city or let the app detect your location automatically — current conditions and a 5-day forecast load instantly.

**[Live Demo →](https://your-app.vercel.app)** &nbsp;·&nbsp; Built with React 19 · Vite · OpenWeatherMap API

---

## Screenshots

> _Add your screenshots here after deploying_  
> `![App screenshot](./screenshots/home.png)`

---

## Features

- **Current weather** — temperature, feels like, humidity, wind speed, weather icon
- **5-day forecast** — daily high/low, condition, icon
- **Auto geolocation** — detects your city on load (with permission)
- **City search** — search any city worldwide
- **Error handling** — clear messages for denied permissions, unknown cities, network failures
- **Responsive** — works on mobile, tablet, and desktop

---

## Tech Stack

| Layer              | Technology                 |
| ------------------ | -------------------------- |
| Frontend framework | React 19                   |
| Build tool         | Vite 6                     |
| HTTP client        | Axios                      |
| Styling            | Plain CSS                  |
| API                | OpenWeatherMap (free tier) |
| Deployment         | Vercel                     |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A free [OpenWeatherMap API key](https://openweathermap.org/api)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/weather-app.git
cd weather-app

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# Open .env and paste your API key

# 4. Start the dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
```

> **Note:** Never commit your `.env` file. It is already listed in `.gitignore`.

---

## Project Structure

```
weather-app/
├── public/
├── src/
│   ├── api/
│   │   └── weather.js          # All API fetch functions
│   ├── components/
│   │   ├── WeatherCard.jsx     # Current weather display
│   │   └── ForecastCard.jsx    # 5-day forecast display
│   ├── hooks/
│   │   ├── useWeather.js       # Search action + state (useActionState)
│   │   └── useGeoWeather.js    # Geolocation + fetch on mount
│   ├── utils/
│   │   └── groupForecast.js    # Groups 40 API entries into 5 days
│   ├── App.jsx                 # Root component, wires everything
│   └── index.css               # All styles
├── .env                        # Your API key (not committed)
├── .env.example                # Template for .env
├── .gitignore
├── index.html
├── vite.config.js
└── package.json
```

---

## Available Scripts

```bash
npm run dev        # Start development server (localhost:5173)
npm run build      # Build for production (outputs to /dist)
npm run preview    # Preview the production build locally
```

---

## Deployment

This app is deployed on **Vercel**. To deploy your own:

1. Push the repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import project
3. Add `VITE_WEATHER_API_KEY` under Environment Variables
4. Click Deploy

Every `git push` to `main` triggers an automatic redeploy.

---

## React 19 Highlights

This project uses two key React 19 features:

**`useActionState`** — replaces manual `useState` for loading/error/data in forms:

```jsx
const [state, action, isPending] = useActionState(
  async (prev, formData) => {
    const data = await fetchWeather(formData.get("city"));
    return { data, error: null };
  },
  { data: null, error: null },
);
```

**Async form actions** — the `action` prop on `<form>` now accepts an async function directly:

```jsx
<form action={action}>
  <input name="city" />
  <button disabled={isPending}>Search</button>
</form>
```

---

## API Reference

This app uses two [OpenWeatherMap](https://openweathermap.org/api) endpoints:

| Endpoint                 | Used for                                       |
| ------------------------ | ---------------------------------------------- |
| `GET /data/2.5/weather`  | Current weather by city or coordinates         |
| `GET /data/2.5/forecast` | 5-day / 3-hour forecast by city or coordinates |

Free tier allows 1,000 calls/day — more than enough for personal use.

---

## Known Limitations

- Geolocation requires browser permission and HTTPS (works on Vercel automatically)
- Forecast shows up to 5 days; the first entry may be a partial day depending on time of search
- Free API tier has a rate limit of 60 calls/minute

---

## License

MIT — free to use, modify, and distribute.

---

## Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/) for the free weather API
- [Vercel](https://vercel.com/) for free frontend hosting
- Built as part of a React 19 learning roadmap
