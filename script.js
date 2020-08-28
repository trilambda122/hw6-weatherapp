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
                // check length of sotrage array and tirm down to last 5 entries 
                if (cityListStorage.length > 5) {
                    cityListStorage.splice(-6, 1);
                }

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
            var oneCallWeatherURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=${excludeList}&units=imperial&appid=${API_KEY}`;

            // use the lon and lat to get the 5 days of forcasted weather  
            $.ajax({
                url: oneCallWeatherURL,
                method: "GET"
            }).then(function(oneCallObj) {

                uv = oneCallObj.current.uvi;
                //  pass aray to function for the 5 day forcast
                displayFiveDay(oneCallObj.daily);

                var uvColor = uvRating(uv);
                displayCurrentWeather(city, temp, humidity, wind, uv, uvColor, iconURL, desc);
            });





        });
        //  function to create the 5 day forcast card by looping through an array of objects that have the forcast for each day
        function displayFiveDay(fiveDayArr) {
            console.log(fiveDayArr);
            $("#five-day-forcast-row").html("");
            //  use for loop to target the next 5 days. start the array at i=1 to target tomorrow and stop at the 2 last element in the array (array has 7 days in it)
            for (i = 1; i < fiveDayArr.length - 2; i++) {
                var dtObj = moment.unix(fiveDayArr[i].dt);
                var dtStr = dtObj.format("MMM D");
                var temp = fiveDayArr[i].temp.day;
                var humidity = fiveDayArr[i].humidity;
                var fiveDayIconURL = `http://openweathermap.org/img/w/${fiveDayArr[i].weather[0].icon}.png`;
                // create code block for the cards that will hold the forcast summary
                var codeBlock = ` <div class="card shadow-lg p-3 mb-5 bg-white rounded col-md-2">
                <div class="card-header">
                <h3 class="">${dtStr}</h3>
                
                </div>
                <div class="card-body">
                <img src="${fiveDayIconURL}"  alt="...">
                  
            
                <h6>Temp: ${temp}</h6>
                    <h6>Humidity: ${humidity}</h6>
                </div>
            </div>`

                // <img src="${fiveDayIconURL}">
                // append code block to the page
                $("#five-day-forcast-row").append(codeBlock);
            }
        }

        function displayCurrentWeather(city, temp, humidity, wind, uv, uvColor, iconURL, desc) {

            $("#city-location").text(city);
            $("#current-temp").text(temp);
            $("#current-humidity").text(humidity);
            $("#current-windspeed").text(wind);
            $("#current-uv").text(uv);
            $("#current-uv").addClass(uvColor);

            $("#weather-icon").html(`<img src="${iconURL}">`);
            $("#weather-desc").html(`<p>${desc}</p>`);

        }

        function uvRating(uv) {
            var badgeColor = "";

            console.log(uv);
            console.log(typeof(uv));
            if (uv >= 0 && uv < 3) {
                badgeColor = "badge badge-success"
            } else if (uv >= 3 && uv < 6) {
                badgeColor = "badge badge-warning"
            } else if (uv >= 6 && uv < 8) {
                badgeColor = "badge badge-secondary"
            } else if (uv >= 8 && uv < 11) {
                badgeColor = "badge badge-danger"
            } else if (uv > 11) {
                badgeColor = "badge badge-dark"
            } else { console.log("something went wrong"); }
            console.log(badgeColor);
            return badgeColor;
        }

    }







});