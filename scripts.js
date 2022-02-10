document.querySelector('.submit-button').addEventListener('click', () => {
    const cityInput = document.querySelector('#search-city')
    const cityValue = cityInput.value
    const codeInput = document.querySelector('#search-code')
    const codeValue = codeInput.value

    cityInput.classList.remove('input-req')
    if (cityValue.length < 1) {
        cityInput.classList.add('input-req')
    } 

    codeInput.classList.remove('input-req')
    if (codeValue.length < 2) {
        codeInput.classList.add('input-req')
    }

    cityValue.toLowerCase().replaceAll(' ', '-')
    codeValue.toLowerCase()

})

async function geocode() {
    const city = 'copenhagen'
    const countryCode = 'dk'
    const url= `http://api.openweathermap.org/geo/1.0/direct?q=${city},${countryCode}&limit=1&appid=acac1d4b1311bfec942ea9d7f3b91ad9`

    const response = await fetch(url, { mode: 'cors' })
    const data = await response.json()

    return data
}

async function apiCall() {
    const data = await geocode() 
    const latitude = data[0].lat
    const longitude = data[0].lon
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=acac1d4b1311bfec942ea9d7f3b91ad9`

    const response = await fetch (url, { mode: 'cors' })
    const res = await response.json()

    return res
}

function convertDate(d, withTime = true) {
    const unixDate = d.dt
    const millisec = unixDate * 1000
    const date = new Date(millisec)
    return withTime ? date.toLocaleString() : date.toLocaleDateString()
}

async function getCurrentWeather() {
    const res = await apiCall()
    const date = convertDate(res.current)
    
    let weatherConditions

    if (res.current.weather.length > 1) {
        weatherConditions = []
        res.current.weather.map(w => weatherConditions.push(w.main))
    } else {
        weatherConditions = res.current.weather[0].main
    }

    const temperature = (res.current.temp-273.15).toFixed(2) + 'ºC'
    const hum = res.current.humidity + '%'

    return { date, temperature, hum, weatherConditions }
}

function getDailyWeather(d) {
    const date = convertDate(d, false)
    const temperature = (d.temp.day-273.15).toFixed(2) + 'ºC'
    const hum = d.humidity + '%'

    let weatherConditions

    if (d.weather.length > 1) {
        weatherConditions = []
        d.weather.map(w => weatherConditions.push(w.main))
    } else {
        weatherConditions = d.weather[0].main
    }

    return { date, temperature, hum, weatherConditions }
}


function displayConditions(c, cond) {
    const condition = document.createElement('p')
    condition.textContent = c
    cond.appendChild(condition)

    switch (c) {
        case 'Thunderstorm':
            condition.classList.add('thunderstorm')
            break;
        case 'Drizzle':
            condition.classList.add('drizzle')
            break;
        case 'Rain':
            condition.classList.add('rain')
            break;
        case 'Snow':
            condition.classList.add('snow')
            break;
        case 'Clear':
            condition.classList.add('clear')
            break;
        case 'Clouds':
            condition.classList.add('clouds')
            break;
    }    
}

function displayCurrentTime(d) {
    const currentDate = document.querySelector('#current-date')
    currentDate.textContent = d
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
            displayConditions(c, currentCond)
        }
    } else {
        displayConditions(weatherCond, currentCond)
    }
    displayCurrentTime(currentWeather.date)
}

async function displayDailyWeather() {
    const res = await apiCall()
    for (d of res.daily) {

        const dailyWeather = getDailyWeather(d)
        const weatherCond = dailyWeather.weatherConditions

        const dailyTemp = document.createElement('p')
        const dailyHum = document.createElement('p')
        const dailyCond = document.createElement('div')
        const time = document.createElement('p')
        
        time.textContent = dailyWeather.date
        dailyTemp.textContent = dailyWeather.temperature
        dailyHum.textContent = dailyWeather.hum

        if (weatherCond instanceof Array) {
            for(let c of weatherCond) {
                displayConditions(c, dailyCond)
            } 
        } else {
            displayConditions(weatherCond, dailyCond)
        }

        const week = document.querySelector('.week')
        const day = document.createElement('div')
        day.append(time, dailyTemp, dailyHum, dailyCond)
        week.appendChild(day)
    }

}

displayCurrentWeather()
displayDailyWeather()