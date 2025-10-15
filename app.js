const searchInput = document.querySelector(".search-input");
const locationButton = document.querySelector(".location-button");
const currentWeatherDiv = document.querySelector(".current-weather");
const hourlyWeather = document.querySelector(".hourly-weather .weather-list");

const API_KEY = "9bb1a7cc642948f5bad90020251410"; // your WeatherAPI key

// Weather condition code mapping
const weatherCodes = {
  clear: [1000],
  clouds: [1003, 1006, 1009],
  mist: [1030, 1135, 1147],
  rain: [1063, 1150, 1153, 1168, 1171, 1180, 1183, 1198, 1201, 1240, 1243, 1246, 1273, 1276],
  moderate_heavy_rain: [1186, 1189, 1192, 1195, 1243, 1246],
  snow: [1066, 1069, 1072, 1114, 1117, 1204, 1207, 1210, 1213, 1216, 1219, 1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282],
  thunder: [1087, 1279, 1282],
  thunder_rain: [1273, 1276],
};

// ✅ Display next 24-hour forecast
const displayHourlyForecast = (hourlyData) => {
  const currentHour = new Date().setMinutes(0, 0, 0);
  const next24Hours = currentHour + 24 * 60 * 60 * 1000;

  const next24HoursData = hourlyData.filter(({ time }) => {
    const forecastTime = new Date(time).getTime();
    return forecastTime >= currentHour && forecastTime <= next24Hours;
  });

  hourlyWeather.innerHTML = next24HoursData.map((item) => {
    const temperature = Math.floor(item.temp_c);
    const time = item.time.split(" ")[1].substring(0, 5);
    const weatherIcon = Object.keys(weatherCodes).find(icon =>
      weatherCodes[icon].includes(item.condition.code)
    ) || "clear";
    const iconPath = `./assets/images/${weatherIcon}.svg`;
    return `
      <li class="weather-item">
        <p class="time">${time}</p>
        <img src="${iconPath}" class="weather-icon" alt="${item.condition.text}">
        <p class="temperature">${temperature}°</p>
      </li>`;
  }).join('');
};

// ✅ Fetch weather details
const getWeatherDetails = async (API_URL) => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

    const data = await response.json();

    const temperature = Math.floor(data.current?.temp_c);
    const description = data.current?.condition?.text || "Unknown";
    const code = data.current?.condition?.code;
    const weatherIcon = Object.keys(weatherCodes).find(icon =>
      weatherCodes[icon].includes(code)
    ) || "clear";
    const iconPath = `./assets/images/${weatherIcon}.svg`;

    // ✅ Update current weather UI
    currentWeatherDiv.querySelector(".weather-icon").src = iconPath;
    currentWeatherDiv.querySelector(".temperature").innerHTML = `${temperature}<span>°C</span>`;
    currentWeatherDiv.querySelector(".description").innerText = description;

    // ✅ Combine hourly data for 2 days
    const combinedHourlyData = [
      ...(data.forecast?.forecastday?.[0]?.hour || []),
      ...(data.forecast?.forecastday?.[1]?.hour || []),
    ];

    searchInput.value = data.location?.name || "";
    displayHourlyForecast(combinedHourlyData);

    if (window.innerWidth <= 768) searchInput.blur();
  } catch (error) {
    console.error("Error fetching weather data:", error);
    document.body.classList.add("show-no-results");
  }
};

// ✅ Setup request by city
const setupWeatherRequest = (cityName) => {
  const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${cityName}&days=2`;
  getWeatherDetails(API_URL);
};

// ✅ Handle search
searchInput.addEventListener("keyup", (e) => {
  const cityName = searchInput.value.trim();
  if (e.key === "Enter" && cityName) {
    setupWeatherRequest(cityName);
  }
});

// ✅ Handle current location
locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("Geolocation not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      const API_URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${latitude},${longitude}&days=2`;
      getWeatherDetails(API_URL);
      if (window.innerWidth >= 768) searchInput.focus();
    },
    () => {
      alert("Location access denied. Please enable permissions to use this feature.");
    }
  );
});

// ✅ Default load
setupWeatherRequest("Karachi");
