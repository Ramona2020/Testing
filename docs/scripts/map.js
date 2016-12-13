// code adapted from https://www.mapbox.com/mapbox.js/example/v1.0.0/markers-with-image-slideshow/

// ACTION ITEM: replace mapbox access token below with your own mapbox access token. Refer to blank for information on accessing your token.
//L.mapbox.accessToken =
//	'pk.eyJ1IjoicmFtb25hMjAyMCIsImEiOiI2ZjQzZTA4N2QxNjA5NzM2YjVhZTMwY2M1YmI2M2I2YSJ9.U1IwzOSQO-xjLU7NPxo-Dw';

// ACTION ITEM: Insert the Mapbox key for your landing page map, refer blank for information on locating the map key. Also change the set view for your region of the world
//var map = L.mapbox.map('map', "ramona2020.o3fkmamf").setView([42.36, -71.06],
//	12);
//var layer = L.mapbox.featureLayer().addTo(map)
mapboxgl.accessToken = 'pk.eyJ1IjoicmFtb25hMjAyMCIsImEiOiI2ZjQzZTA4N2QxNjA5NzM2YjVhZTMwY2M1YmI2M2I2YSJ9.U1IwzOSQO-xjLU7NPxo-Dw';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ramona2020/civ45jd8x000b2jobbs53k0ua',
    zoom: 12,
    center: [-71.06, 42.36]
});

map.on('load', function () {
 map.addSource('somerville', {
      type: 'raster',
        url: 'mapbox://ramona2020.4tm1idpm'
    });
 map.addLayer({
    'id': 'somerville',
    'type': 'raster',
    'source': 'somerville',
    'layout': {
         'visibility': 'visible'
        }
        });
    map.addSource('boston', {
         type: 'raster',
         //use the map id of the tileset appended to mapbox://
           url: 'mapbox://ramona2020.66n3zq9m'
       });
    map.addLayer({
       'id': 'boston',
       'type': 'raster',
       'source': 'boston',
       'layout': {
            'visibility': 'visible'
           }
             });
    map.addSource('contours', {
        type: 'vector',
        url: 'mapbox://mapbox.mapbox-terrain-v2'
    });
    map.addLayer({
        'id': 'contours',
        'type': 'line',
        'source': 'contours',
        'source-layer': 'contour',
        'layout': {
            'visibility': 'visible',
            'line-join': 'round',
            'line-cap': 'round'
        },
        'paint': {
            'line-color': '#877b59',
            'line-width': 1
        }
    });
});

var toggleableLayerIds = [ 'contours', 'somerville', 'boston' ];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
};

map.on('style.load', function() {
  map.addSource("points", {
    "type": "geojson",
    "data": {
      "type": "FeatureCollection",
      "features": []
    }
  });

  map.addLayer({
    "id": "points",
    "type": "symbol",
    "source": "points",
    "layout": {
      "icon-image": "{marker-symbol}-15",
      "text-field": "{title}",
      "text-size": 10,
      "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      "text-offset": [0, 0.6],
      "text-anchor": "top"
    }
  });

  // Add zoom and rotation controls to the map.
  var nav = new mapboxgl.NavigationControl();
  map.addControl(nav, 'top-left');

  // See https://www.mapbox.com/mapbox-gl-js/example/popup-on-click/
  // Use the same approach as above to indicate that the symbols are clickable
  // by changing the cursor style to 'pointer'.
  map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, {
      layers: ['points']
    });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
  });
});

// See https://www.mapbox.com/mapbox-gl-js/example/popup-on-click/
// When a click event occurs near a place, open a popup at the location of
// the feature, with description HTML from its properties.
map.on('click', function(e) {
  var features = map.queryRenderedFeatures(e.point, {
    layers: ['points']
  });

  if (!features.length) {
    return;
  }

  var feature = features[0];
  var images = JSON.parse(feature.properties.images);
  var slideshowContent = '';

  if (typeof images !== "undefined") {
    for (var i = 0; i < images.length; i++) {
      var img = images[i];

      slideshowContent += '<div class="image' + (i === 0 ? ' active' : '') +
        '">' +
        formatMedia(img) +
        '<div class="caption">' + img.description + '</div>' +
        '</div>';
    }
  }

  // Adds corresponding HTML element to format the media formats appropriately.
  // The list of acceptable formats may be expanded as necessary.
  function formatMedia(img) {
    if (img.format === "YouTube") {
      return "<iframe width='175' src='" + img.url +
        "' frameborder='0' allowfullscreen=''></iframe>";
    }
    if (img.format === "Image") {
      return "<img src='" + img.url + "'/>";
    }
  }

  // Create custom popup content
  var popupContent = '<div id="' + feature.properties.id +
    '" class="popup">' +
    '<h4>' + feature.properties.title + '</h4>' +
    '<div class="slideshow">' +
    slideshowContent +
    '</div>' +
    '<div class="cycle">' +
    '<a href="#" class="prev">&laquo; Previous</a>' +
    '<a href="#" class="next">Next &raquo;</a>' +
    '</div>';
  '</div>';

  // Populate the popup and set its coordinates
  // based on the feature found.
  var popup = new mapboxgl.Popup()
    .setLngLat(feature.geometry.coordinates)
    .setHTML(popupContent)
    .addTo(map);
});

// This example uses jQuery to make selecting items in the slideshow easier.
// Download it from http://jquery.com
$('#map').on('click', '.popup .cycle a', function() {
  var $slideshow = $('.slideshow'),
    $newSlide;

  if ($(this).hasClass('prev')) {
    $newSlide = $slideshow.find('.active').prev();
    if ($newSlide.index() < 0) {
      $newSlide = $('.image').last();
    }
  } else {
    $newSlide = $slideshow.find('.active').next();
    if ($newSlide.index() < 0) {
      $newSlide = $('.image').first();
    }
  }

  $slideshow.find('.active').removeClass('active').hide();
  $newSlide.addClass('active').show();
  return false;
});

// Get the points from Cloudant using JSONP
// http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-ajax-call
$(function() {

  // list views from Cloudant that we want to offer as layers
  var cloudantViews = [];
  $.getJSON('https://ramonav.cloudant.com/mapping-boston/_design/tour/',
    function(result) {
      var viewsList = result.views;
      for (var v in viewsList) {
        cloudantViews.push(v);
      }

      // put each view into the dropdown menu
      $.each(cloudantViews, function(i, viewname) {
        $('#layers-dropdown').append('<option value="' + viewname +
          '">' +
          viewname + '</option>');
      });
    });

  // when the user selects from the dropdown, change the layer
  $('#layers-dropdown').change(function() {
    var selection_label = $('#layers-dropdown option:selected').text();
    var selection_value = $('#layers-dropdown').val();
    if (selection_value !== 'default') {
      var thisCloudantView = selection_value;
      getLayer(processLayer, thisCloudantView);
    }
    $("#searchText").val(""); // empty the searchbox when choosing a layer
  });
});

$("#search").submit(function(event) {
  event.preventDefault();
  var searchText = $("#searchText").val();
  $('#layers-dropdown').val("default"); // reset the dropdown to default value
  searchPoints(getPoints, searchText);
});

function getLayer(callback, cloudantView) {
  var thisCloudantURL = "https://ramonav.cloudant.com/mapping-boston/_design/tour/_view/" + cloudantView + "?callback=?";
  $.getJSON(thisCloudantURL, function(result) {
    var points = result.rows;
    var geoJSON = [];
    for (var i in points) {
      geoJSON["locations"] = geoJSON.push(points[i].value);
    }
    var featureCollection = {
      "type": "FeatureCollection",
      "features": geoJSON
    };
    callback(featureCollection);
  });
}

// See http://stackoverflow.com/questions/19916894/wait-for-multiple-getjson-calls-to-finish
function searchPoints(callback, cloudantSearch) {
  var cloudantURLBase = "https://ramonav.cloudant.com/mapping-boston/_design/tour/_search/ids?q=";
  var cloudantURLcallback = "&callback=?";
  var thisCloudantURL = cloudantURLBase + cloudantSearch + cloudantURLcallback;
  $.getJSON(thisCloudantURL, function(result) {
    var ids = [];
    var rows = result.rows;
    if (rows.length > 0) {
      callback(rows);
    } else {
      showAlert('alert-noresults');
    }
  });
}

function getPoints(cloudantIDs) {
  var geoJSON = [];
  if (typeof cloudantIDs !== "undefined") {
    for (var i in cloudantIDs) {
      geoJSON.push(getPoint(cloudantIDs[i].id));
    }
  }

  function getPoint(id) {
    var url = 'https://ramonav.cloudant.com/mapping-boston/' + id;
    return $.getJSON(url); // this returns a "promise"
  }

  $.when.apply($, geoJSON).done(function() {
    // This callback will be called with multiple arguments,
    // one for each AJAX call
    // Each argument is an array with the following structure: [data, statusText, jqXHR]
    var geoJSON = [];
    // If a single object comes back, it will be as an object not an array of objects.
    if (Array.isArray(arguments[0])) {
      for (var i in arguments) {
        geoJSON.push(arguments[i][0]);
      }
      var featureCollection = {
        "type": "FeatureCollection",
        "features": geoJSON
      };
      processLayer(featureCollection);
    } else if (typeof arguments[0] !== 'undefined') {
      geoJSON.push(arguments[0]);
      var featureCollection = {
        "type": "FeatureCollection",
        "features": geoJSON
      };
      processLayer(featureCollection);
    }
  });
}

function processLayer(result) {
  // Add features to the map
  // TODO: Add functionality for switching between basemaps
  var selection_label = $('#layers-dropdown option:selected').text();
  if (layers[selection_label] == "Somerville") {
    new_id = 'mapbox://ramona2020.4tm1idpm'
  } else new_id = 'mapbox://styles/ramona2020/civ45jd8x000b2jobbs53k0ua';
  map.getSource('points').setData(result);
}

// Show and hide the alert box
function showAlert(alert_id) {
  $("#" + alert_id).css({
    "display": "block"
  }).addClass("in");
  window.setTimeout(function() {
    hideAlert(alert_id);
  }, 4000);
}

function hideAlert(alert_id) {
  $("#" + alert_id).removeClass("in").css({
    "display": "none"
  });
}

// Add custom popup html to each marker
//layer.on('layeradd', function(e) {
//	var marker = e.layer;
//	var feature = marker.feature;
//	var images = feature.properties.images;
//	var slideshowContent = '';
//
//	if (typeof images !== "undefined") {
//		for (var i = 0; i < images.length; i++) {
//			var img = images[i];
//			slideshowContent += '<div class="image' + (i === 0 ? ' active' : '') +
//				'">' +
//				formatMedia(img) +
//				'<div class="caption">' + img.description + '</div>' +
//				'</div>';
//		}
//	}
//
//	// Adds corresponding HTML element to format the media formats appropriately.
	// The list of acceptable formats may be expanded as necessary.
//	function formatMedia(img) {
//		if (img.format === "YouTube") {
//			return "<iframe width='175' src='" + img.url +
//				"' frameborder='0' allowfullscreen=''></iframe>";
//		}
//		if (img.format === "Image") {
//			return "<img src='" + img.url + "'/>";
//		}
//	}
//
//	// Create custom popup content
//	var popupContent = '<div id="' + feature.properties.id + '" class="popup">' +
//		'<h2>' + feature.properties.title + '</h2>' +
//		'<div class="slideshow">' +
//		slideshowContent +
//		'</div>' +
//		'<div class="cycle">' +
//		'<a href="#" class="prev">&laquo; Previous</a>' +
//		'<a href="#" class="next">Next &raquo;</a>' +
//		'</div>';
//	'</div>';
//
//	// http://leafletjs.com/reference.html#popup
//	marker.bindPopup(popupContent, {
//		closeButton: false,
//		maxWidth: 200,
//		autoPan: true,
//		keepInView: true
//	});
//});
//
// This example uses jQuery to make selecting items in the slideshow easier.
// Download it from http://jquery.com
//$('#map').on('click', '.popup .cycle a', function() {
//	var $slideshow = $('.slideshow'),
//		$newSlide;
//
//	if ($(this).hasClass('prev')) {
//		$newSlide = $slideshow.find('.active').prev();
//		if ($newSlide.index() < 0) {
//			$newSlide = $('.image').last();
//		}
//	} else {
//		$newSlide = $slideshow.find('.active').next();
//		if ($newSlide.index() < 0) {
//			$newSlide = $('.image').first();
//		}
//	}
//
//	$slideshow.find('.active').removeClass('active').hide();
//	$newSlide.addClass('active').show();
//	return false;
//});
//
//// Get the points from Cloudant using JSONP
// http://stackoverflow.com/questions/14220321/how-to-return-the-response-from-an-ajax-call
//$(function() {

	// list views from Cloudant that we want to offer as layers
//	var cloudantViews = [];
// ACTION ITEM: Replace cloudant database URL with URL for your database 
//	$.getJSON('https://ramonav.cloudant.com/mapping-boston/_design/tour/',
//		function(result) {
//			var viewsList = result.views;
//			for (var v in viewsList) {
//				cloudantViews.push(v);
//			}
//
//			// put each view into the dropdown menu
//			$.each(cloudantViews, function(i, viewname) {
//				$('#layers-dropdown').append('<option value="' + viewname + '">' +
//					viewname + '</option>');
//			});
//		});
//
//	// when the user selects from the dropdown, change the layer
//	$('#layers-dropdown').change(function() {
//		var selection_label = $('#layers-dropdown option:selected').text();
//		var selection_value = $('#layers-dropdown').val();
//		if (selection_value !== 'default') {
//			var thisCloudantView = selection_value;
//			getLayer(processLayer, thisCloudantView);
//		}
//		$("#searchText").val(""); // empty the searchbox when choosing a layer
//	});
//});
//
//$("#search").submit(function(event) {
//	event.preventDefault();
//	var searchText = $("#searchText").val();
//	$('#layers-dropdown').val("default"); // reset the dropdown to default value
//	searchPoints(getPoints, searchText);
//});

//function getLayer(callback, cloudantView) {
// ACTION ITEM: Replace cloudant database URL with URL for your database 	
//	var cloudantURLbase =
//		"https://ramonav.cloudant.com/mapping-boston/_design/tour/_view/";
//	var cloudantURLcallback = "?callback=?";
//	var thisCloudantURL = cloudantURLbase + cloudantView + cloudantURLcallback;
//	$.getJSON(thisCloudantURL, function(result) {
//		var points = result.rows;
//		var geoJSON = [];
//		for (var i in points) {
//			geoJSON["locations"] = geoJSON.push(points[i].value);
//		}
//		callback(geoJSON);
//	});
//}

// See http://stackoverflow.com/questions/19916894/wait-for-multiple-getjson-calls-to-finish
//function searchPoints(callback, cloudantSearch) {
// ACTION ITEM: Replace cloudant database URL with URL for your database 	
//	var cloudantURLbase =
//		"https://ramonav.cloudant.com/mapping-boston/_design/tour/_search/ids?q=";
//	var cloudantURLcallback = "&callback=?";
//	var thisCloudantURL = cloudantURLbase + cloudantSearch + cloudantURLcallback;
//	$.getJSON(thisCloudantURL, function(result) {
//		var ids = [];
//		var rows = result.rows;
//		if (rows.length > 0) {
//		callback(rows);
//		} else {
//			showAlert('alert-noresults');
//		}
//	});
//}

//function getPoints(cloudantIDs) {
//	var geoJSON = [];
//	if (typeof cloudantIDs !== "undefined") {
//		for (var i in cloudantIDs) {
//			geoJSON.push(getPoint(cloudantIDs[i].id));
//		}
//	}
//
//	function getPoint(id) {
// ACTION ITEM: Replace cloudant database URL with URL for your database 		
//		var cloudantURLbase = "https://ramonav.cloudant.com/mapping-boston/";
//		var url = cloudantURLbase + id;
//		return $.getJSON(url); // this returns a "promise"
//	}
//
//	$.when.apply($, geoJSON).done(function() {
//		// This callback will be called with multiple arguments,
//		// one for each AJAX call
		// Each argument is an array with the following structure: [data, statusText, jqXHR]
//		var geoJSON = [];
		// If a single object comes back, it will be as an object not an array of objects.
//		if (Array.isArray(arguments[0])) {
//			for (var i in arguments) {
//				geoJSON.push(arguments[i][0]);
//			}
//			processLayer(geoJSON);
//		} else if (typeof arguments[0] !== 'undefined') {
//			geoJSON.push(arguments[0]);
//			processLayer(geoJSON);
//		}
//	});
//}

//function processLayer(result) {
	// Add features to the map
//	var selection_label = $('#layers-dropdown option:selected').text();
// ACTION ITEM: The selection label must match your view in Cloudant	
//	if (selection_label == "free") {
// ACTION ITEM: Replace mapbox id below with the mapbox id that corresponds to your georeferenced map for the view above			
//		new_id = 'ramona2020.0f9jb407'
//	} 
// ACTION ITEM: If you would like to incorporate multiple views into your mapping application, remove the double slashes in front of each trio of lines beginning with else if and ending with the end curly brace.	
// ACTION ITEM: Each trio of lines from else if to the end curly brace is equivalent to one Cloudant view and map.
// ACTION ITEM: Remember to replace your selection label with your view from Cloudant and the mapbox key with the corresponding map.
//	else if (selection_label == "Somerville") {
//		new_id = 'ramona2020.1icf9k4e'
//	 } 
	// else if (selection_label == "1936") {
	//	new_id = 'vulibrarygis.l369lc2l'
	// } 
	//else if (selection_label == "1947") {
	//	new_id = 'vulibrarygis.l36anlai'
	// } 
	// else if (selection_label == "1970") {
	//	new_id = 'vulibrarygis.l36db1a5'
	// } 
// ACTION ITEM: Replace this mapbox id with the mapbox id for your landing page map.	
//	else {
//		new_id = 'ramona2020.o3fkmamf'
//	};
//	var new_layer = L.mapbox.tileLayer(new_id);
//	new_layer.addTo(map);
//	layer.setGeoJSON(result);
//}

// Show and hide the alert box
//function showAlert(alert_id){
  //$("#"+alert_id).css({"display": "block"}).addClass("in");
  //window.setTimeout(function () {
    // hideAlert(alert_id);
  //}, 4000);
//}

//function hideAlert(alert_id){
  //$("#"+alert_id).removeClass("in").css({"display": "none"});
//}
