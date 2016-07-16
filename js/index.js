//have an env.js that contains your endpoint, named endpoint_name
var map = L.map('map');

L.tileLayer.provider('OpenStreetMap.Mapnik', {retina: true}).addTo(map);

var filters = document.getElementById('filters');
filters.onclick = function() {
  gj.onMoveEnd();
};

var autoloadOptions = {
  interval: 10 * 1000,
  style: function(feature) { return feature.properties; },
  pointToLayer: customStyle,

  filter: checkboxFilter,
  onEachFeature: function (feature, layer) {
    layer.bindPopup(feature.properties.title);
  }
}

var gmo = L.geoJson({"geometry": {"coordinates": [-118, 34], "type": "Point"}, "id": 0, "properties": {}, "type": "Feature"}, autoloadOptions).addTo(map);

var loaded = true;

map.fitBounds(gmo.getBounds(), {maxZoom: 16});
map.locate({setView : true});

function checkboxFilter(feature) {
  if (!loaded) {
    return true;
  }
  var box = document.getElementById(feature.properties.type);
  return box == null || box.checked;
}

//https://gist.github.com/tmcw/3861338
function simplestyle(f, latlon) {
    var sizes = {
      small: [20, 50],
      medium: [30, 70],
      large: [35, 90]
    };
    var fp = f.properties || {};
    var size = fp['marker-size'] || 'medium';
    var symbol = (fp['marker-symbol']) ? '-' + fp['marker-symbol'] : '';
    var color = fp['marker-color'] || '7e7e7e';
    color = color.replace('#', '');
    var url = 'http://a.tiles.mapbox.com/v3/marker/' +
          'pin-' +
          // Internet Explorer does not support the `size[0]` syntax.
          size.charAt(0) + symbol + '+' + color +
          ((window.devicePixelRatio === 2) ? '@2x' : '') +
          '.png';

    var icon = new L.icon({
        iconUrl: url,
        iconSize: sizes[size],
        iconAnchor: [sizes[size][0] / 2, sizes[size][1]/2],
        popupAnchor: [-3, -sizes[size][1]/2]
      });

    return new L.Marker(latlon, {
      icon: icon
    });
}

function customStyle(f, latlon) {
    var icon = simplestyle(f, latlon);
    var properties = f.properties;

    if (properties.type == 'pokestop' && properties.lure) {
      f.properties['marker-color'] = '800080';
      icon = simplestyle(f, latlon);
    }

    /*
    if (properties.type == 'pokestop') {
      icon = pokestopIcon;
    } else if (properties.type == 'wild' || properties.type == 'catchable') {
      icon = pokemonIcon;
    } else if (properties.type == 'gym') {
      icon = gymIcon;
    }
    */
    return icon;
}

var pokestopIcon = L.icon({
    iconUrl: 'img/pokestop.png',
    iconSize:     [32, 48], // size of the icon
    iconAnchor:   [16, 48], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -58] // point from which the popup should open relative to the iconAnchor
});

var gymIcon = L.icon({
    iconUrl: 'img/arena_blue.png',
    iconSize:     [45, 48], // size of the icon
    iconAnchor:   [22, 48], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -58] // point from which the popup should open relative to the iconAnchor
});

var pokemonIcon = L.icon({
    iconUrl: 'img/pokemon.png',
    iconSize:     [32, 48], // size of the icon
    iconAnchor:   [16, 48], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -58] // point from which the popup should open relative to the iconAnchor
});
var gj = L.uGeoJSONLayer({ endpoint:endpoint_name, debug: true, usebbox: true, instead: gmo}).addTo(map);
