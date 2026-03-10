# UI States + Fetch (Vanilla)

Minimal HTML + CSS + JavaScript example that demonstrates the **state → render** pattern with common UI states:

- `idle`
- `loading`
- `success`
- `empty`
- `error`

The app calls a free, no-auth public API (Open-Meteo) to fetch current weather by city name.

## Project Structure
- `index.html` — markup (containers for loader/error/empty/results)
- `styles.css` — styling (includes `.hidden` and state styling)
- `app.js` — logic (state, render, fetch, events)

## How to Run
No server required. Just open the file:

1. Double-click `index.html`
2. Open DevTools (F12) if you want to inspect Network/Console
3. Type a city name and click **Search**

## Expected Behavior
- **Loading**: shows “Loading…” and disables the button
- **Success**: displays the location and current weather values
- **Empty**: shown when no locations match the city name
- **Error**: shown on request failures (network/CORS/HTTP), includes a **Retry** button

## Notes
- Two requests are used:
  1) Geocoding: convert city name → latitude/longitude
  2) Forecast: fetch current weather using latitude/longitude
- To force `empty`, try a clearly invalid city name.
- To test `error`, disconnect the internet and submit a search.

## References
- Open-Meteo (Geocoding + Forecast): https://open-meteo.com/
