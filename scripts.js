displayCurrentWeather('Tokyo', 'jp')
displayDailyWeather('Tokyo', 'jp')
displayCity('Tokyo')


function getInputs() {
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

    return { cityValue, codeValue }
}

function displayCity(city) {
    const upper = city.charAt(0).toUpperCase() + city.slice(1)
    const currentCity = [...document.querySelectorAll('.current-city')]
    currentCity.map(span => span.textContent = upper)
}

async function geocode(city, code) {
    try {
        const url= `http://api.openweathermap.org/geo/1.0/direct?q=${city},${code}&limit=1&appid=acac1d4b1311bfec942ea9d7f3b91ad9`
        const response = await fetch(url, { mode: 'cors' })
        const data = await response.json()

        return data
    } catch (error) {
        return error
    }
    
}

async function apiCall(city, code) {
    try {
        const data = await geocode(city, code)
        const latitude = data[0].lat
        const longitude = data[0].lon
        const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely,hourly,alerts&appid=acac1d4b1311bfec942ea9d7f3b91ad9`
    
        const response = await fetch (url, { mode: 'cors' })
        const res = await response.json()
    
        return res
    } catch (error) {
        error.message = 'We could not find that city'
        alert(error.message)
    }
}

function convertDate(d) {
    const unixDate = d.dt
    const millisec = unixDate * 1000
    const date = new Date(millisec)
    return date
}

async function getCurrentWeather(city, code) {
    const res = await apiCall(city, code)
    const date = convertDate(res.current).toLocaleString()
    
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
    const date = convertDate(d)
    const weekday = date.toLocaleDateString('en', {weekday: 'long'})
    const day = date.toLocaleDateString()
    const temperature = (d.temp.day-273.15).toFixed(2) + 'ºC'
    const hum = d.humidity + '%'

    let weatherConditions

    if (d.weather.length > 1) {
        weatherConditions = []
        d.weather.map(w => weatherConditions.push(w.main))
    } else {
        weatherConditions = d.weather[0].main
    }

    return { weekday, day, temperature, hum, weatherConditions }
}


function displayConditions(c, cond) {
    const condition = document.createElement('p')
    condition.textContent = c
    cond.appendChild(condition)

    switch (c) {
        case 'Mist':
            condition.classList.add('mist')
            break;
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

async function displayCurrentWeather(city, code) {
    const currentWeather = await getCurrentWeather(city, code)
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

async function displayDailyWeather(city, code) {
    const res = await apiCall(city, code)
    for (d of res.daily) {

        const dailyWeather = getDailyWeather(d)
        const weatherCond = dailyWeather.weatherConditions

        const dailyTemp = document.createElement('p')
        const dailyHum = document.createElement('p')
        const dailyCond = document.createElement('div')
        const weekDay = document.createElement('p')
        const date = document.createElement('p')

        weekDay.classList = 'weekday'
        weekDay.textContent = dailyWeather.weekday
        date.textContent = dailyWeather.day
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
        day.append(weekDay, date, dailyTemp, dailyHum, dailyCond)
        week.appendChild(day)
    }
}


document.querySelector('.submit-button').addEventListener('click', () => {
    document.querySelector('.week').innerHTML = ''
    document.querySelector('#current-conditions').innerHTML = ''

    const inputs = getInputs()
    displayCurrentWeather(inputs.cityValue, inputs.codeValue)
    displayDailyWeather(inputs.cityValue, inputs.codeValue)
    displayCity(inputs.cityValue)
})


