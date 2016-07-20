"use strict";

maptiks.trackcode = "23b927ed-3ff7-43e2-9052-6b00b6d1565b";

if(typeof endpoint_name == "undefined") {
  console.warn("add js/env.js that contains 'var endpoint_name = \"[your endpoint]\";'");
}

if(typeof api_endpoint == "undefined") {
  console.warn("add js/env.js that contains 'var api_endpoint = \"[your endpoint]\";'");
}


// Global variables

var initialViewSet = false;

var debug = (window.location.hostname == "localhost"),
  retina = (window.devicePixelRatio && window.devicePixelRatio > 1);

var map = L.map("map", {
  fullscreenControl: true,
  fullscreenControlOptions: {
    position: "topleft"
  }
}),
  hash = new L.Hash(map);

var filters = document.getElementById("filters");


// Map layer

L.tileLayer.provider("OpenStreetMap.Mapnik", {
  retina: true
}).addTo(map);


// Data layer

var geoJsonOptions = {
  interval: 10 * 1000,
  pointToLayer: markerStyle,
  filter: function(feature) {
    var box = document.getElementById(feature.properties.type);
    
    return box == null || box.checked;
  },
  style: function(feature) {
    return feature.properties;
  },
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.title);
    
    layer.on("mouseover", function (e) {
      this.openPopup();
    });
    
    layer.on("mouseout", function (e) {
      this.closePopup();
    });
  }
};

var markerOptions = {
  disableClusteringAtZoom: 16
};

function toggleHighZoomMessage() {
  if(map.getZoom() < 10){
    document.getElementById("highzoom").style.visibility = "initial";
  } else {
    document.getElementById("highzoom").style.visibility = "hidden";
  }
}

var uGeoJsonOptions = {
  endpoint: (typeof endpoint_name != "undefined" ? endpoint_name : ""),
  debug: debug,
  usebbox: true,
  after: function(geojson) {
    if(!initialViewSet && geojson.features.length > 0) { // If location data wasn't available, or access was denied
      map.fitBounds(gj.getBounds(), {
        maxZoom: 16
      });
      
      initialViewSet = true;
    }
    
    toggleHighZoomMessage();
  },
  maxRequests: 2,
  // pollTime: 1000 * 60 * 5 //Considering refreshing data every 5 minutes
}

var gj = L.uCluster(markerOptions, uGeoJsonOptions, geoJsonOptions).addTo(map);

filters.onclick = function() {
  gj.onMoveEnd();
};

var credctrl = L.controlCredits({
  image: "./img/logo-40.png",
  link: "http://pokerev.r3v3rs3.net/",
  text: "Pokemon Global Map <br/>by PokeRevs"
}).addTo(map);


// Center map

if(window.location.hash) {
  initialViewSet = true;
} else if("geolocation" in navigator) {
  map.locate({
    setView: true
  });
}


// Custom markers

function gymIcon(color) {
  color = (typeof color == "string" && color.length ? color : "white");
  
  return new L.Icon({
    iconUrl: "img/arena_"+ color +".png",
    iconSize: [45, 48], // Size of the icon
    iconAnchor: [22, 48], // Point of the icon which will correspond to marker's location
    popupAnchor: [-3, -58] // Point from which the popup should open relative to the iconAnchor
  });
}

function pokemonIcon(num) {
  num = (typeof num == "number" || (typeof num == "string" && num.length) ? parseInt(num) : false);
  
  if(num !== false && isFinite(num)) {
    return new L.Icon({
      iconUrl: "img/sprites/"+ num + (retina ? "@2x" : "") +".png",
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -32]
    });
  }
  
  return false;
}

function pokestopIcon(lure) {
  lure = (typeof lure == "boolean" ? lure : false);
  
  return new L.Icon({
    iconUrl: "img/pokestop"+ (lure ? "pink" : "") +".png",
    iconSize: [32, 48],
    iconAnchor: [16, 48],
    popupAnchor: [-3, -58]
  });
}

function markerStyle(f, latlon) {
  f = (typeof f == "object" && f != null ? f : false);
  latlon = (typeof latlon == "object" && latlon != null ? latlon : false);
  
  if(latlon && f && typeof f.properties == "object" && f.properties != null) {
    var properties = f.properties,
      marker = new L.Marker(latlon, {
        icon: new L.Icon({
          iconUrl: "img/1x1.png",
          iconSize: [1, 1],
          iconAnchor: [1, 1],
          popupAnchor: [0, -1]
        })
      });
    
    if(typeof properties.type != "undefined") {
      switch(properties.type) {
        case "pokestop":
          marker.setIcon(pokestopIcon((typeof properties.lure != "undefined" && properties.lure)));
          break;
          
        case "wild":
        case "catchable":
          if(typeof properties.pokemonNumber != "undefined") {
            var icon = pokemonIcon(properties.pokemonNumber);
            
            if(icon) {
              marker.setIcon(icon);
            }
          }
          
          break;
        
        case "gym":
          var color;
          
          if(typeof properties.title != "undefined") {
            switch(properties.title) {
              case "Blue Gym":
                color = "blue";
                break;
              case "Red Gym":
                color = "red";
                break;
              case "Yellow Gym":
                color = "yellow";
                break;
            }
          }
          
          marker.setIcon(gymIcon(color));
      }
    }
    
    return marker;
  }
  
  return false;
}


// Populate button

var populateResponse = L.control.window(map, {
  title: "Server response",
  content: "",
  position: "bottomLeft"
});

var populateButton = L.easyButton("<span>Populate this area</span>", function populateCallback() {
  populateButton.disable();
  
  var xhttp = new XMLHttpRequest(),
    curhash = window.location.hash,
    coords = curhash.substring(curhash.indexOf("/"));
    
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == XMLHttpRequest.DONE) {
      populateResponse.content(xhttp.responseText).show();
    }
  }
  
  xhttp.open("GET", api_endpoint + "addToQueue" + coords, true);
  xhttp.send();
  setTimeout(function() {
    populateResponse.hide();
    populateButton.enable();
  }, 1000 * 20);
}, {position: "bottomleft"}).addTo(map);
