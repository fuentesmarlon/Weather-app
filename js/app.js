
const state = {
  ui: "idle", // "idle" | "loading" | "success" | "empty" | "error"
  errorMessage: "",
  lastCity: "",
  result: null, // { placeName, temperature, windSpeed, time }
};


const form = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const searchBtn = document.querySelector("#searchBtn");

const statusEl = document.querySelector("#status");
const loaderEl = document.querySelector("#loader");

const errorBox = document.querySelector("#errorBox");
const errorMsg = document.querySelector("#errorMsg");
const retryBtn = document.querySelector("#retryBtn");

const emptyBox = document.querySelector("#emptyBox");

const results = document.querySelector("#results");
const placeTitle = document.querySelector("#placeTitle");
const tempEl = document.querySelector("#temp");
const windEl = document.querySelector("#wind");
const timeEl = document.querySelector("#time");


function setState(patch) {
  Object.assign(state, patch);
  render();
}

function render() {
  // Status text (siempre visible)
  statusEl.textContent = `Estado: ${state.ui}`;

  // Control de interacción
  const isLoading = state.ui === "loading";
  searchBtn.disabled = isLoading;

  // Mostrar/ocultar secciones según state.ui
  loaderEl.classList.toggle("hidden", state.ui !== "loading");
  errorBox.classList.toggle("hidden", state.ui !== "error");
  emptyBox.classList.toggle("hidden", state.ui !== "empty");
  results.classList.toggle("hidden", state.ui !== "success");

  // Contenido de error
  if (state.ui === "error") {
    errorMsg.textContent = state.errorMessage || "Error desconocido.";
  }

  // Contenido de resultados
  if (state.ui === "success" && state.result) {
    placeTitle.textContent = state.result.placeName;
    tempEl.textContent = `${state.result.temperature} °C`;
    windEl.textContent = `${state.result.windSpeed} km/h`;
    timeEl.textContent = state.result.time;
  }
}



async function geocodeCity(city) {
  // Doc: endpoint /v1/search para buscar ubicaciones  [oai_citation:1‡open-meteo.com](https://open-meteo.com/en/docs/geocoding-api?utm_source=chatgpt.com)
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", city);
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "es");
  url.searchParams.set("format", "json");

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Geocoding HTTP ${res.status}: ${txt.slice(0, 120)}`);
  }

  const data = await res.json();
  const first = Array.isArray(data.results) ? data.results[0] : null;
  return first; // puede ser null si no hay resultados
}

async function getCurrentWeather(lat, lon) {
  // Doc: /v1/forecast recibe latitude/longitude  [oai_citation:2‡open-meteo.com](https://open-meteo.com/en/docs?utm_source=chatgpt.com)
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current_weather", "true");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Forecast HTTP ${res.status}: ${txt.slice(0, 120)}`);
  }

  const data = await res.json();
  return data.current_weather; // { temperature, windspeed, time, ... }
}


async function searchCityWeather(cityRaw) {
  const city = cityRaw.trim();
  if (!city) return;

  setState({
    ui: "loading",
    errorMessage: "",
    lastCity: city,
    result: null,
  });

  try {
    const place = await geocodeCity(city);

    if (!place) {
      setState({ ui: "empty" });
      return;
    }

    const current = await getCurrentWeather(place.latitude, place.longitude);

    // Si por alguna razón no viene current_weather
    if (!current) {
      setState({ ui: "empty" });
      return;
    }

    setState({
      ui: "success",
      result: {
        placeName: `${place.name}${place.admin1 ? ", " + place.admin1 : ""}${
          place.country ? ", " + place.country : ""
        }`,
        temperature: current.temperature,
        windSpeed: current.windspeed,
        time: current.time,
      },
    });
  } catch (err) {
    // Aquí cae red/CORS o errores HTTP convertidos a Error
    setState({
      ui: "error",
      errorMessage:
        err instanceof Error ? err.message : "Error de red/CORS o inesperado.",
    });
  }
}


form.addEventListener("submit", (e) => {
  e.preventDefault();
  searchCityWeather(cityInput.value);
});

retryBtn.addEventListener("click", () => {
  if (state.lastCity) searchCityWeather(state.lastCity);
});

// Inicial
render();