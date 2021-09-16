// Variables
var searchHistory = JSON.parse(localStorage.getItem("movieSearchHistory")) || [];

function search() {
  var movieInput = document.getElementById("movieInput");
  var currentMovie = movieInput.value;

  // Check to see if there's any input first
  if(currentMovie.length != 0) {
    getMovie(currentMovie);
  }
  else {
    showError();
  }
}

function showHistory() {
  var movieList = document.getElementById("movieList");
  
  // Clear the list before populating the history
  movieList.innerHTML = "";

  // Display the contents of the search history and use the prepend() method to show searches in most recently searched order
  for(var i = 0; i < searchHistory.length; i++) {
    var listItem = document.createElement("li");

    // Display the movie name
    listItem.textContent = searchHistory[i];
    console.log(searchHistory)
    // Set the movie name as a data attribute
    listItem.setAttribute("data-movie", searchHistory[i]);

    // Add class for styling
    listItem.classList.add("list-group-item");

    // If the movie is the current search, add the "active" class
    if(i == searchHistory.length - 1) {
      listItem.classList.add("active");
    }

    // Get the movie data if the item is clicked
    listItem.addEventListener("click", function() {
      var movie = (this).getAttribute("data-movie");
      getMovie(movie);
      document.getElementById("movieInput").value = movie;
    });

    movieList.prepend(listItem);
  }

  clearHistory();
}

function clearHistory() {
  var clearList = document.getElementById("clearList");  

  // Add the Clear History button if there are any movies in the search history and if the button hasn't already been added
  if(searchHistory.length > 0 && clearList.getElementsByTagName("li").length == 0) {
    var clearItems = document.createElement("li");

    clearItems.textContent = "Clear History";
    clearItems.classList.add("list-group-item");
  
    clearItems.addEventListener("click", function() {
      // Clear both the movie and clear lists
      movieList.innerHTML = "";
      clearList.innerHTML = "";

      // Clear the searchHistory array and localStorage
      searchHistory = [];
      localStorage.clear();
    });

    clearList.append(clearItems);
  }
}

function closeError() {
  document.getElementById("errorModal").style.display = "none";
}

function showError() {
  document.getElementById("errorModal").style.display = "block";
  document.getElementById("exitButton1").addEventListener("click", closeError);
  document.getElementById("exitButton2").addEventListener("click", closeError);
}

function processMovieName(movieName) {
  // Ensure that the first letter of each word is always capitalized
  return movieName.replace(/\w\S*/g, function(text) {
    return text.charAt(0).toUpperCase() + text.substr(1).toLowerCase();
  });
}

function getRecommendations(movieName) {
  var apiKey = "423810-MovieDas-87VVNNZX";
  var queryURL = "https://tastedive.com/api/similar?q=" + movieName + "&k=" + apiKey;
  var recommendationsCardsList = document.getElementById("recommendationsCardsList");

  $.ajax({
    url: queryURL,
    dataType: "jsonp"
  }).then(function(response) {
    document.getElementById("movieRecommendations").classList.remove("hide");

    // Clear the list before populating it
    recommendationsCardsList.innerHTML = "";

    for(var i = 0; i < 5; i++) {
      var listItem = document.createElement("li");
      var movieTitle = response.Similar.Results[i].Name;

      // Set the movie name as a data attribute
      listItem.setAttribute("data-movie", movieTitle);

      listItem.classList.add("recommendationsCardItem");
      listItem.classList.add("card");
      listItem.innerHTML = "<div id=\"recommendedMovie-" + i + "\"></div>";
      listItem.innerHTML += movieTitle;
      recommendationsCardsList.append(listItem);

      getRecommendationsPhoto(response.Similar.Results[i].Name, i);
    }
  });
}

function getRecommendationsPhoto(movieName, index) {
  var apiKey = "19367c01";
  var queryURL = "https://www.omdbapi.com/?t=" + movieName + "&apikey=" + apiKey;

  $.ajax({
    url: queryURL,
    dataType: "json",
  }).done(function(response) {
    if(response.Error == undefined) {
      // Generate photo for recommended movie
      var photo = response.Poster;

      if(photo != "N/A") {
        document.getElementById("recommendedMovie-" + index).innerHTML = "<img src=\"" + photo + "\">";
      }
    }
  });
}

function getMovie(movieName) {
  var apiKey = "19367c01";
  var queryURL = "https://www.omdbapi.com/?t=" + movieName + "&apikey=" + apiKey;

  $.ajax({
    url: queryURL,
    dataType: "json",
  }).done(function(response) {
    if(response.Error == undefined) {
      var movieDetails = document.getElementById("movieDetails");

      // Check to see search history already includes the current movie and delete it from the searchHistory array if so
      if(searchHistory.includes(processMovieName(movieName))) {
        var index = searchHistory.indexOf(processMovieName(movieName));
        searchHistory.splice(index, 1);
      }

      // Add the current movie to the searchHistory array and then add the searchHistory array to localStorage
      searchHistory.push(processMovieName(movieName));
      localStorage.setItem("movieSearchHistory", JSON.stringify(searchHistory));

      // Generate movie details
      document.getElementById("currentMovie").classList.remove("hide");
      movieDetails.innerHTML = "<img src=\"" + response.Poster + "\">";
      movieDetails.innerHTML += "<h2>" + response.Title + "</h2>";
      movieDetails.innerHTML += "<p>" + response.Genre + "</p>";
      movieDetails.innerHTML += "<p>" + response.Year + "</p>";
      movieDetails.innerHTML += "<p>" + response.Runtime + "</p>"; 
      movieDetails.innerHTML += "<p>Rated: " + response.Rated + "</p>"; 
      movieDetails.innerHTML += "<p>About: " + response.Plot + "</p>";
      movieDetails.innerHTML += "<p>Cast: " + response.Actors + "</p>";
      movieDetails.innerHTML += "<p>Writers: " + response.Writer + "</p>";

      getRecommendations(movieName);

      showHistory();
    }
    else {
      showError();
    }
  });
}

showHistory();

// Add EventListeners to Buttons
document.getElementById("searchButton").addEventListener("click", search);
