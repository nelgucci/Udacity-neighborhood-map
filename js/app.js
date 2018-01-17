var map, clientID, clientSecret, bounds;

//Declare locations
var locations = [
       {
        name:'Central Park', 
        lat: 40.783275, 
        lng: -73.964905
    },
       {
        name:'The Metropolitan Museum of Art',
        lat: 40.780545, 
        lng: -73.96370
    },
       {
        name:'Chrysler Building', 
        lat: 40.751412, 
        lng: -73.975205
    },
       {
        name: 'St. Patrick\'s Cathedral', 
        lat: 40.759094, 
        lng: -73.975548
    },
       {
        name:'Washington Square Park', 
        lat: 40.731263, 
        lng: -73.996663
    }
];


var setLocations = function (data) {
    var self = this;
    var fsUrl = 'https://api.foursquare.com/v2/venues/search?ll=';
    var clientID = "FZZQD3SKMT2G2PVP5ZDVB3EHI0O5ZSE4TWWM32Q2E0Y1TXGI";
    var clientSecret = "UNOEWQYZHQC1H5BZ2LB00FVE5S5I3O3IDGPL5PCG5VSDGMFG";
    this.visible = ko.observable(true);
    this.name = data.name;
    this.lat = data.lat;
    this.lng = data.lng;
    this.street = "";
    this.city = "";
    //Foursquare API request 
    var url = fsUrl + this.lat + ',' + this.lng 
    + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20161507' + '&query=' + this.name;
    $.getJSON(url).done(function (data) {
        var results = data.response.venues[0];
        self.street = results.location.formattedAddress[0];
        self.city = results.location.formattedAddress[1];
    }).fail(function () {
        alert("Error, Reload the page");
    });
    // Setting MArkers on Map
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(data.lat, data.lng),
        map: map,
        title: data.name
    });
    //filters marker
    this.filterMarker = ko.computed(function() {
        if(this.visible() === true) {
            self.marker.setMap(map);
        } else {
            self.marker.setMap(null);
        }
        return true;
    }, this);
    //creates infowindow for the formatted address
    this.infoWindow = new google.maps.InfoWindow({
        content: self.contentString
    });
    //adds animation when clicked
    this.marker.addListener('click', function () {
    	self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function () {self.marker.setAnimation(null);}, 700);
    });

    this.bounce = function (place) {
        google.maps.event.trigger(self.marker, 'click');
    };
    //sets map bounds within markers
    this.marker.addListener('click', function() {
          map.panTo(self.marker.getPosition());
        });

    //populates infowindow
   	this.marker.addListener('click', function() {
        populateInfoWindow(this, largeInfowindow);
        self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
        '<div class="content">' + self.street + "</div>" +
        '<div class="content">' + self.city + "</div>";
        self.infoWindow.setContent(self.contentString);
        self.infoWindow.open(map, this); 
        });
    var largeInfowindow = new google.maps.InfoWindow();
    //function for showing panorama streetview
    var populateInfoWindow = function(marker, infowindow) {
        //check if the info window is open
        if (infowindow.marker != marker) {
          infowindow.marker = marker;
          infowindow.setContent('<div>' + marker.title + '</div>');
          infowindow.open(map, marker);
		  // Close infowindow when clicked elsewhere on the map
		  map.addListener("click", function(){
		    	infowindow.close(infowindow);
		  });
		  //shows panorama streetview in a separate infowindow ---Reference: Udacity Classroom
          var streetViewService = new google.maps.StreetViewService();
          var radius = 50;
          function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
              var nearStreetViewLocation = data.location.latLng;
              var heading = google.maps.geometry.spherical.computeHeading(nearStreetViewLocation, marker.position);
              infowindow.setContent('<div>'+ marker.title + '</div><div id="pano"></div>');
              var panoramaOptions = {
                position: nearStreetViewLocation,
                pov: {
                  heading: heading,
                  pitch: 30
                }
              };
            var panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'), panoramaOptions);
            } 
            else {
               infowindow.setContent('<div>' + marker.title + '</div>' + '<div>No Street View Available</div>');
               // Open the infowindow on the correct marker.
               // infowindow.open(map, marker);
            }
         }
         // Use streetview service to get the closest streetview image within
         // 50 meters of the markers position
        streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
      }
  }
}

function viewModel() {
	'use strict';
    
	var self = this;
	this.searchTerm = ko.observable('');
	//Style of map
    var mapStyles = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#004990"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "poi.attraction",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#fbf2c4"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#c9b4e8"
            },
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text",
        "stylers": [
            {
                "color": "#5a21ad"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ebe8e8"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#8b8b8b"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#ebe8e8"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.text.stroke",
        "stylers": [
            {
                "color": "#ffffff"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.local",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "transit.line",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "transit.station",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#eaf6f8"
            },
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "color": "#c2eeeb"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ff0000"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    }
];
	//Sets center of map
	map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.773606, lng: -73.971417},
        zoom: 13,
        styles: mapStyles,
        mapTypeControl: false

    });

	//sidebar list
	this.locationList = ko.observableArray([]);
    locations.forEach(function (item) {self.locationList.push(new setLocations(item));});
	//filter
    this.filteredList = ko.computed(function () {
        var filter = self.searchTerm().toLowerCase();
        if (!filter) {
            self.locationList().forEach(function (locationItem) {
                locationItem.visible(true);
            });
            return self.locationList();
        } else {
            return ko.utils.arrayFilter(self.locationList(), function (locationItem) {
                var string = locationItem.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                locationItem.visible(result);
                return result;
            });
        }
    }, self);
            //responsive navbar
            $(document).ready(function(){
            $(".fa-times").click(function(){
            $(".sidebar_menu").addClass("hide_menu");
            $(".toggle_menu").addClass("opacity_one");
            });

            $(".toggle_menu").click(function(){
            $(".sidebar_menu").removeClass("hide_menu");
            $(".toggle_menu").removeClass("opacity_one");
            });
        });
    
}

function initMap() {
    ko.applyBindings(new viewModel());

}
//error handler
function mapError() {
    alert("Loading Failed. Please refresh the page.");
}


// Central Park
// New York, NY
// 40.783275, -73.964905

// The Metropolitan Museum of Art
// New York, NY 10028
// 40.780545, -73.963704

// Chrysler Building
// New York, NY
// 40.751412, -73.975205

// St. Patrick's Cathedral
// New York, NY
// 40.759094, -73.975548

// Washington Square Park
// New York, NY
// 40.731263, -73.996663

// CLIENT_ID
// FZZQD3SKMT2G2PVP5ZDVB3EHI0O5ZSE4TWWM32Q2E0Y1TXGI
// CLIENT_SECRET
// UNOEWQYZHQC1H5BZ2LB00FVE5S5I3O3IDGPL5PCG5VSDGMFG