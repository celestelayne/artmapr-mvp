  $(function() {
  L.mapbox.accessToken = 'pk.eyJ1IjoiY2xheW5lIiwiYSI6IldjZ2gyLW8ifQ.8AtgyePBb8CL3sh_LX2Awg';
  // initializes the map on the "map" div with a given center and zoom
  var map = L.mapbox.map('map', 'clayne.i6afai85', {
      zoomControl: false,
      scrollWheelZoom: false
      })
      .setView([37.794, -122.401], 14);
  // Adds zoom control
  new L.Control.Zoom({ position: 'bottomleft' }).addTo(map);

  // console.log(artmaps)
  var api_endpoint = "https://data.sfgov.org/resource/zfw6-95su.json?$select=artist, created_at, title, geometry, medium&$limit=50";
  // Add an empty feature layer to the map
  var artLayer = L.layerGroup().addTo(map);

  // Make AJAX call to backend GET request
  var artgeo = $.getJSON(api_endpoint, function (results, status){
      results.shift();
      // console.log("RESULTs", results);

      $.each(results, function (index, result){
          //  console.dir(result);
           result.geometry = JSON.parse(result.geometry);
           L.mapbox.featureLayer({
              type: "Feature",
              geometry: result.geometry,
              properties: {
                  title: "Title: " + result.title,
                  description: "Artist: " + result.artist,
                  // one can customize markers by adding simplestyle properties
                  // https://www.mapbox.com/guides/an-open-platform/#simplestyle
                  "icon": {
                      "iconUrl": "/images/art_icon.png",
                      "iconSize": [100, 100],
                      "iconAnchor": [50, 50],
                      "popupAnchor": [0, -55],
                      "className": "dot"
                  }
              }
          }).addTo(map).
           on('layeradd', function(e) {
              var marker = e.layer,
                  feature = marker.feature;

              marker.setIcon(L.icon(feature.properties.icon));
          });
           });

          if (!navigator.geolocation) {
              geolocate.innerHTML = 'Geolocation is not available';
          } else {
              geolocate.onclick = function (e) {
                  e.preventDefault();
                  e.stopPropagation();
                  map.locate();
              };
          }
          map.on('locationfound', function(e) {
          map.fitBounds(e.bounds);

          myLayer.setGeoJSON({
              type: 'Feature',
              geometry: result.geometry,
              properties: {
                  'marker-color': '#ff8888',
                  'marker-symbol': 'star'
                   }
              });
              geolocate.parentNode.removeChild(geolocate);
          });
              map.on('locationerror', function() {
              geolocate.innerHTML = 'Position could not be found';
          });
  });

    // Hide the extra content initially, using JS so that if JS is disabled, no problemo:
  $('.read-more-content').addClass('hide')

  // Set up a link to expand the hidden content:
  .before('<a class="read-more-show" href="#">Read More</a>')

  // Set up a link to hide the expanded content.
  .append(' <a class="read-more-hide" href="#">Read Less</a>');

  // Set up the toggle effect:
  $('.read-more-show').on('click', function(e) {
    $(this).next('.read-more-content').removeClass('hide');
    $(this).addClass('hide');
    e.preventDefault();
  });

  $('.read-more-hide').on('click', function(e) {
    $(this).parent('.read-more-content').addClass('hide').parent().children('.read-more-show').removeClass('hide');
    e.preventDefault();
  });

  }); // closes jQuery ready function
