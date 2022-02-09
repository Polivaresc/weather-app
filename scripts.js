async function geocode() {
    const city = 'copenhagen'
    const countryCode = 'dk'
    const url= `http://api.openweathermap.org/geo/1.0/direct?q=${city},${countryCode}&limit=1&appid=acac1d4b1311bfec942ea9d7f3b91ad9`

    const response = await fetch(url, { mode: 'cors' })
    const data = await response.json()

    return data
}

async function getCurrentWeather() {
    const data = await geocode()
    const latitude = data[0].lat
    const longitude = data[0].lon
    const url = `http://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=acac1d4b1311bfec942ea9d7f3b91ad9`
    
    const response = await fetch (url, { mode: 'cors' })
    const res = await response.json()

    let weatherConditions

    if (res.weather.length > 1) {
        weatherConditions = []
        res.weather.map(w => weatherConditions.push(w.main))
    } else {
        weatherConditions = res.weather[0].main
    }

    const temperature = (res.main.temp-273.15).toFixed(2) + 'ºC'
    const hum = res.main.humidity + '%'

    return { weatherConditions, temperature, hum }
}

async function displayCurrentWeather() {
    const currentWeather = await getCurrentWeather()
    const weatherCond = currentWeather.weatherConditions

    const currentTemp = document.querySelector('#current-temp')
    const currentHum = document.querySelector('#current-hum')
    const currentCond = document.querySelector('#current-conditions')

    currentTemp.textContent = currentWeather.temperature
    currentHum.textContent = currentWeather.hum
    
    if (weatherCond instanceof Array) {
        for (let c of weatherCond) {
            const condition = document.createElement('p')
            condition.textContent = c
            currentCond.appendChild(condition)
        }
    } else {
        const condition = document.createElement('p')
        condition.textContent = weatherCond
        currentCond.appendChild(condition)
    }
}

function displayCurrentTime() {
    const date = new Date().toLocaleString()

    const currentDate = document.querySelector('#current-date')
    
    currentDate.textContent = date
}

displayCurrentTime()
displayCurrentWeather()