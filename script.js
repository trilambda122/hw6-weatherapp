$(document).ready(function() {
    console.log("ready!");


    // set up global vars 

    var currentTimeObj = moment();

    var API_KEY = "d0d9d3b010a05ae1f870f8930e0e0a10";
    var city = "";
    var lat = "";
    var lon = "";
    var temp = "";
    var humidity = "";
    var wind = "";
    var uv = "";
    var cnt = "5"; // sets the limit for number of day to return
    var excludeList = "minutely,hourly"; // these are excluded from the open weather API call
    var desc = "";

    // set up local storage
    var cityListStorage = JSON.parse(localStorage.getItem('cityList')) || [];

    // populate any cities stored in local storage to the side bar
    setItemOnSidebar();

    // click event for seach button
    $("#search-button").on("click", function() {
        event.preventDefault();
        var city = $("#city-search-text").val();
        if (city !== "") {
            city = city.toUpperCase();
            currentWeather(city);

            // add the city to local storage and limit the storage to 5 cities
            if (!cityListStorage.includes(city)) {
                cityListStorage.push(city);
                cityListStorage.splice(5);
                localStorage.setItem("cityList", JSON.stringify(cityListStorage));
            }


            // update the sidebar with the lastest city
            setItemOnSidebar();
        }
        console.log();

    });

    // click event for all the cities on the side bar
    $(".side-bar-city").on('click', function(event) {
        currentWeather(event.target.innerText);

    });

    // get the current time, format it and display it to the page
    function displayCurrentDate(time) {
        var dateStr = time.format("MMMM D,YYYY");
        $("#current-date").text(dateStr);
    }


    //  function loops through local storage and popluates the side bar 
    function setItemOnSidebar() {
        $("#side-bar-list").html("");
        cityListStorage.forEach(function(item) {
            $("#side-bar-list").append(`<li class="list-group-item side-bar-city"> ${item} </li>`)
        });

    }

    //  fetches the weather data 
    function currentWeather(city) {
        var currentForcastURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${API_KEY}`;

        // get the current weather stats from the current weather API
        $.ajax({
            url: currentForcastURL,
            method: "GET"
        }).then(function(response) {
            displayCurrentDate(currentTimeObj);
            city = response.name;
            temp = response.main.temp;;
            humidity = response.main.humidity;
            wind = response.wind.speed;
            lon = response.coord.lon;
            lat = response.coord.lat;
            desc = response.weather[0].description;
            var iconURL = `http://openweathermap.org/img/w/${response.weather[0].icon}.png`;
            var oneCallWeatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=${excludeList}&appid=${API_KEY}`;

            // use the lon and lat to get the 5 days of forcasted weather  
            $.ajax({
                url: oneCallWeatherURL,
                method: "GET"
            }).then(function(oneCallObj) {

                uv = oneCallObj.current.uvi;
                // call function to display all these vars to the page. 
                displayCurrentWeather(city, temp, humidity, wind, uv, iconURL, desc);
            });





        });

        function displayCurrentWeather(city, temp, humidity, wind, uv, iconURL, desc) {


            $("#city-location").text(city);
            $("#current-temp").text(temp);
            $("#current-humidity").text(humidity);
            $("#current-windspeed").text(wind);
            $("#current-uv").text(uv);
            $("#weather-icon").html(`<img src="${iconURL}">`);
            $("#weather-desc").html(`<p>${desc}</p>`);

        }


    }







});