const API_KEY = '8de8f3cad6c44ab5978101630250503';
const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const temp = document.getElementById('temp');
const currentTime = document.getElementById('current-time');
const themeToggle = document.querySelector('.theme-toggle');
const toastContainer = document.getElementById('toast-container');
let tempChart, humidityChart;

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, 3000);
}

// Theme toggle functionality
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
    });
    currentTime.textContent = timeString;
}

// Update time every second
setInterval(updateTime, 1000);
updateTime(); // Initial update

async function getWeather(city) {
    try {
        // Get current weather
        const currentResponse = await fetch(`https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`);
        const currentData = await currentResponse.json();

        if (currentData.error) {
            showToast('Invalid location');
            return;
        }

        // Get forecast data
        const forecastResponse = await fetch(`https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=7&aqi=no`);
        const forecastData = await forecastResponse.json();

        const location = currentData.location;
        const weatherData = currentData.current;

        cityName.textContent = location.name;
        temp.textContent = `${Math.round(weatherData.temp_c)}°C`;

        // Update graphs with forecast data
        updateGraphs(forecastData.forecast.forecastday);

    } catch (error) {
        showToast('Invalid location');
    }
}

function updateGraphs(forecastData) {
    const dates = forecastData.map(day => new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }));
    const temps = forecastData.map(day => day.day.avgtemp_c);
    const humidity = forecastData.map(day => day.day.avghumidity);
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';

    // Temperature Chart
    if (tempChart) {
        tempChart.destroy();
    }
    tempChart = new Chart(document.getElementById('tempChart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: textColor,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                }
            }
        }
    });

    // Humidity Chart
    if (humidityChart) {
        humidityChart.destroy();
    }
    humidityChart = new Chart(document.getElementById('humidityChart'), {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Humidity (%)',
                data: humidity,
                borderColor: textColor,
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: textColor
                    }
                }
            }
        }
    });
}

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeather(city);
        }
    }
}); 