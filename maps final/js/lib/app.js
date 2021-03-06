var locations = [{
        title: "Wankhede Stadium",
        address: "Churchgate, Mumbai",
        location: {
            lat: 18.938865,
            lng: 72.825762
        },
        image: "img/wankhede-stadium.png",
        id: "WS",
        garden: false
    },
    {
        title: "Brabourne Stadium",
        address: "Dinshaw Vacha Rd, Churchgate, Mumbai",
        location: {
            lat: 18.932208,
            lng: 72.824872
        },
        image: "img/brebourne.jpg",
        id: "BS",
        garden: false
    },
    {
        title: "DY Patil Stadium",
        address: "Sector 7, AWHO Nerul, Navi Mumbai",
        location: {
            lat: 19.0432,
            lng: 73.025385
        },
        image: "img/dy-patil.jpg",
        id: "DS",
        garden: false
    },
    {
        title: "Hanging Gardens of Mumbai",
        address: "Simla Nagar, Malabar Hill, Mumbai",
        location: {
            lat: 18.957328,
            lng: 72.804894
        },
        image: "img/hanging-gardens.jpg",
        id: "HG",
        garden: true
    },

    {
        title: "Shivaji Park",
        address: "Dadar West, Dadar, Mumbai",
        location: {
            lat: 19.027089,
            lng: 72.838089
        },
        image: "img/shivaji-park.jpg",
        id: "SP",
        garden: true
    },
    {
        title: "Jogger's Park",
        address: "Carter Rd, Bandra West, Mumbai",
        location: {
            lat: 19.059532,
            lng: 72.821352
        },
        image: "img/joggers-park.jpg",
        id: "JP",
        garden: true
    },
    {
        title: "Sanjay Gandhi National Park",
        address: "Borivali East, Mumbai",
        location: {
            lat: 19.217641,
            lng: 72.903385
        },
        image: "img/sanjaygandhi-park.jpg",
        id: "SGNP",
        garden: true
    },




];

// global variables are declared here
var map;
var markersArray = [];
var bounceTimer;


var maperror = function() {
    var mapTimeout = setTimeout(function() {
        alert("Unable to connect to Google Maps!!");
    }, 3000);
}

//initialize map
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 19.125362,
            lng: 72.999199
        },
        zoom: 10,
        disableDefaultUI: true,

    });
    //load all markers at the start
    loadAll();

    // credits:http://stackoverflow.com/questions/18444161/google-maps-responsive-resize#18446117

    google.maps.event.addDomListener(window, "resize", function() {
     var center = map.getCenter();
     google.maps.event.trigger(map, "resize");
     map.setCenter(center);
    });
}





// knockout observables are used and MMVM pattern followed
var NewLocations= function(data) {
    this.locationTitle = ko.observable(data.title);
    this.garden = ko.observable(data.garden);
    this.address = ko.observable(data.address);
    this.listVisible = ko.observable(true);
};


function loadAll() {
    var largeInfowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        var address = locations[i].address;
        var image = locations[i].image;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            image: image,
            address: address,
            animation: google.maps.Animation.DROP,

        });
        vm.locationList()[i].marker = marker;
        // Push the marker to our array of markers.
        markersArray.push(marker);


        //Event listeners for animating the marker

        function toggleBounce(marker) {
            if (marker.getAnimation() !== null) {
                marker.setAnimation(null);
            } else {
                marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        }


        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            toggleBounce(this);
            fillInfoWindow(this, largeInfowindow);
        });
        // use ko data bindings
        // http://knockoutjs.com/documentation/binding-syntax.html
        document.getElementById('show-stadiums').addEventListener('click', showstadiums);
        document.getElementById('show-gardens').addEventListener('click', showgardens);
        document.getElementById('show-all').addEventListener('click', showall);


    }


}


// Function to fill the content of the information window
// It will open when clicked on the marker or in list
function fillInfoWindow(marker, infowindow) {

        // Check to make sure the infowindow is not already opened
        if (infowindow.marker != marker) {
            // Fill the content of information window
            infowindow.setContent('<img src="' + marker.image + '" alt="Image of ' +
                marker.title + '"><br><hr style="margin-bottom: 5px"><strong>' +
                marker.title + '</strong><br><p>' + marker.address + '<br><p>Link to Wikipedia Article:</p><br><div id="wiki-list-link"></div>');
            infowindow.marker = marker;
            marker.setAnimation(google.maps.Animation.BOUNCE);
            // Make sure the marker property is cleared if the infowindow is closed
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
                marker.setAnimation(null);
              ;
            });
            // Open the infowindow on the correct marker
            infowindow.open(map, marker);
        }


        // to check if wikipedia resources could not be loaded from server
        var wikiRequestTimeout = setTimeout(function() {
            infowindow.setContent("Failed to load wikipedia resources for" + '<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
        }, 2000);

        var wikiListURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';

        // Use fail and done instead of success
        $.ajax({
            url: wikiListURL,
            dataType: "jsonp",
              }).done(function(response) {
                var articleList = response[0];
                console.log(articleList);

                var url = 'http://en.wikipedia.org/wiki/' + articleList;
                console.log(url);
              $("#wiki-list-link").append('<a href="' + url + '">' + articleList + '</a>');

               clearTimeout(wikiRequestTimeout);
            }).fail(function(){

              wikiRequestTimeout();

            });


    }

// function to show stadiums
function showstadiums() {
    for (var i = 0; i < markersArray.length; i++) {
        if (locations[i].garden === false) {
            markersArray[i].setMap(map);
        } else {
            markersArray[i].setMap(null);
        }
    }
};


// function to show gardens
function showgardens() {
    for (var i = 0; i < markersArray.length; i++) {
        if (locations[i].garden === true) {
            markersArray[i].setMap(map);
        } else {
            markersArray[i].setMap(null);
        }
    }
};


// function to show all places
function showall() {
    for (var i = 0; i < markersArray.length; i++) {
        markersArray[i].setMap(map);
    }
};


var ViewModel = function() {

    var self = this;


    self.locationList = ko.observableArray([]);
    locations.forEach(function(location) {
        self.locationList.push(new NewLocations(location));
    });



    this.displayInfoWindow = function(place) {
        google.maps.event.trigger(place.marker, 'click');
        console.log(place);

    };



    this.filtergardens = function() {
        var len = self.locationList().length;
        for (var i = 0; i < len; i++) {
            if (self.locationList()[i].garden() === true) {
                self.locationList()[i].listVisible(true);

                showgardens();
            } else {
                self.locationList()[i].listVisible(false);
            }

        }
    };


    this.filterstadiums = function() {
        var len = self.locationList().length;
        for (var i = 0; i < len; i++) {
            if (self.locationList()[i].garden() === false) {
                self.locationList()[i].listVisible(true);
                showstadiums();
            } else {
                self.locationList()[i].listVisible(false);
            }

        }
    };

    this.filterAll = function() {
        var len = self.locationList().length;
        for (var i = 0; i < len; i++) {
            self.locationList()[i].listVisible(true);
            showall();
        }
    };




};

var vm = new ViewModel();
ko.applyBindings(vm);
