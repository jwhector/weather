const apiKey = "bb6618a76a8aefd9e4878b28bc52afea";
// var city;

const citySearch = $("#city-search");
const citySearchButton = $("#search-button");
const searchForm = $("#search-form");
const histories = $(".histories");

async function forecast(city, response) {
    $(".five-day").empty();


    for (let i = 1; i < 6; i++) {
        const temp = response.daily[i].temp.day;
        const wind = response.daily[i].wind_speed;
        const humidity = response.daily[i].humidity;
        let ico = response.daily[i].weather[0].icon;
        if (ico.endsWith('n')) ico = ico.slice(0, -1) + 'd';
        const timestamp = response.daily[i].dt;
        // console.log(new Date(timestamp * 1000));
        
        const date = (new Date(timestamp * 1000)).toLocaleDateString();
    
        const card = $(`<div class="col s2 forecast"><div class="card"><div class="card-content"><span class="card-title">${date}</span><image src="http://openweathermap.org/img/wn/${ico}.png" /><p>Temp: ${temp} F</p><p>Wind: ${wind} MPH</p><p>Humidity: ${humidity}%</p></div></div></div>`);
    
        $(".five-day").append(card);
    }
}

function createButton(city) {
    const button = $(`<button class="btn waves-effect waves-light col s12 history-btn" type="submit" name="action"value=${city} form="search-form">${city}</button>`);

    button.click(async function(e) {
        e.preventDefault();
        await doSearch(city);
    });

    histories.append(button);
}

async function doSearch(city) {
    const queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + apiKey + "&units=imperial";
    const coords = await fetch(queryURL).then(res => res.json()).catch(err => {
        console.log("No city found!");
        return;
    });

    const lat = coords.coord.lat;
    const lon = coords.coord.lon;

    const response = await fetch("http://api.openweathermap.org/data/2.5/onecall?lat=" + lat + 
    "&lon=" + lon + "&appid=" + apiKey + "&units=imperial").then(res => res.json()).catch(err => {
        console.log("No city found!");
        return;
    });

    const temp = response.current.temp;
    const wind = response.current.wind_speed;
    const humidity = response.current.humidity;
    const date = (new Date(response.current.dt * 1000)).toLocaleDateString();
    const uvi = response.current.uvi;

    $(".card-title").text(coords.name.toUpperCase() + ' - ' + date);
    $("#main-temp").text("Temp: " + temp + " F");
    $("#main-wind").text("Wind: " + wind + " MPH");
    $("#main-humidity").text("Humidity: " + humidity + "%");
    $("#main-UV").text("UV Index: " + uvi);

    if (!JSON.parse(localStorage.getItem("cities")).includes(city)) {
        constructHistory(city);
    }

    await forecast(city, response);
}

function constructHistory(newCity) {
    const cities = JSON.parse(localStorage.getItem("cities"));
    if (newCity) cities.push(newCity);
    histories.empty();
    for (city of cities) {
        createButton(city);
    }
    localStorage.setItem("cities", JSON.stringify(cities));
}

function init() {
    if (!localStorage.getItem("cities")) localStorage.setItem("cities", JSON.stringify([]));
    const cities = JSON.parse(localStorage.getItem("cities"));
    constructHistory();
}

citySearchButton.click(async function() {
    const city = citySearch.val();
    await doSearch(city);
});

init();