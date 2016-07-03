$(document).foundation()

var map, markerCluster, markerNormal;

var animDuration = 100;

var totalImages = 0;
var geoImages = 0;

$(function() {
	$.getJSON("images.json", function(result) {
		for(var i = result.length - 1; i >= 0; i--) {
			if(result[i].Name === "Configuration") {
				var cX = 0, cY = 0, cS = 11;
				if ("AvgCenterLat" in result[i] && "AvgCenterLong" in result[i] && "MapScale" in result[i]) {
					cX = result[i].AvgCenterLat;
					cY = result[i].AvgCenterLong;
					cS = result[i].MapScale;
				}
				map = L.map('map').setView([cX, cY], cS);
				L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
					attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				}).addTo(map);
				markerCluster = L.markerClusterGroup();
				markerNormal = L.layerGroup();
				result.splice(i, 1);
			}
		}
		
		var toContainer = '';
		$.each(result, function(key, val) {
			totalImages++;
			if ("Latitude" in val && "Longitude" in val) {
				geoImages++;
				var markerIconMaker = L.Icon.Default.extend({
					options: {
						imageURL: "images/" + val.Name,
						thumbURL: "thumbs/" + val.Name,
						imageSubHTML: val.ImageDateTime
					}
				});
				var markerIcon = new markerIconMaker();
				var marker = L.marker([val.Latitude, val.Longitude], {icon: markerIcon});
				marker.on("click", function(e) {
					console.log(this.options.icon.options.imageURL);
					$(this).lightGallery({
						dynamic: true,
						speed: animDuration,
						mode: 'lg-fade',
						dynamicEl: [{
							'src': this.options.icon.options.imageURL,
							'thumb': this.options.icon.options.thumbURL,
							'subHtml': this.options.icon.options.imageSubHTML
						}]
					});
				});
				markerCluster.addLayer(marker);
				markerNormal.addLayer(marker);
			}
			toContainer += '<a href="images/' + val.Name + '" data-sub-html="' + val.ImageDateTime + '"><img src="thumbs/' + val.Name + '"></a>'
		});
		map.addLayer(markerCluster);
// 		map.addLayer(markerNormal);
		
		L.control.layers({
			"Clusters": markerCluster,
			"Individual marker": markerNormal
		}, {}).addTo(map);
		
		$("#thumbnailContainer").append(toContainer);
		
		window.setTimeout(function() {
			$(".totalImages").html(totalImages);
			$(".taggedImages").html(geoImages);
		}, 500);
		
		$("#thumbnailContainer").lightGallery({
			thumbnail: true,
			animateThumb: true,
			speed: animDuration,
			mode: 'lg-fade',
		});
		
		$("#mapTabTitle").on({
			click: function(e) {
				window.setTimeout(function() {
					updateHeight();
				}, 100);
			}
		});
		
		$(window).on({
			resize: function(e) {
				updateHeight();
			}
		});
		
		window.setTimeout(function() {
			updateHeight();
		}, 200);
	}).fail(function() {
		$(".tabs-content").html("<h1>Error</h1><p>Could not load pictures.</p>");
	});
});

function updateHeight() {
	var viewportHeight = $(window).height();
	var mapY = $("#map").offset().top;
	var mapTextHeight = $("#mapSubText").height();
	$("#map").height(viewportHeight - mapY - mapTextHeight - 75);
	map.invalidateSize(false);
}
