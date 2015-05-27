$(function() {
L.mapbox.accessToken = 'pk.eyJ1IjoiY2xheW5lIiwiYSI6IldjZ2gyLW8ifQ.8AtgyePBb8CL3sh_LX2Awg';
// initializes the map on the "map" div with a given center and zoom
var map = L.mapbox.map('map', 'clayne.i6afai85', {
    zoomControl: false,
    scrollWheelZoom: false
    })
    .setView([37.794, -122.401], 14);

new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

// Keep place markers organized in a nice group.
var  artmaprPlaces = L.layerGroup().addTo(map);

// soda api endpoint

// Use jQuery to make an AJAX request to Socrata to load markers data.
$.getJSON("/arts", function (res){
    $.each(res, function (i, v){
        console.log(v);
    });
});


/*$.getJSON("/arts", function (data) {
    L.GeoJSON(data, {
        pointToLayer: function (feature, latlng) {
        var marker = L.circleMarker(latlng, geojsonMarkerOptions);
        return marker; console.log(latlng);},
        
        onEachFeature: function (feature, coords) {
            coords.bindPopup(feature.properties.geometry);
            coords.push([feature.geometry.coordinates[1],feature.geometry.coordinates[0]]); },
        
        coordsToLatLng: function (coords) { // (Array[, Boolean]) -> LatLng
            return new L.LatLng(coords[1], coords[0], coords[2]); }
    });
    addData(map); 
});*/

/*var featureLayer = L.mapbox.featureLayer({
    // this feature is in the GeoJSON format: see geojson.org
    // for the full specification
    type: 'Feature',
    geometry: {
        type: 'Point',
        // coordinates here are in longitude, latitude order because
        // x, y is the standard for GeoJSON and many formats
        coordinates: [
            -122.4120591,
            37.8085303
        ]
    },
    properties: {
        title: 'Peregrine Espresso',
        description: '1718 14th St NW, Washington, DC',
        // one can customize markers by adding simplestyle properties
        // https://www.mapbox.com/guides/an-open-platform/#simplestyle
        'marker-size': 'large',
        'marker-color': '#BE9A6B',
        'marker-symbol': 'cafe'
    }
}).addTo(map);*/
});